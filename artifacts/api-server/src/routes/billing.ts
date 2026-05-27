import { Router, type IRouter, type Response } from "express";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, businessesTable, packagesTable } from "@workspace/db";
import { CreateSubscriptionBody } from "@workspace/api-zod";

const router: IRouter = Router();

function makeStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function requireStripe(res: Response): Stripe | null {
  const stripe = makeStripe();
  if (!stripe) {
    res.status(503).json({
      error: "Stripe is not configured. Add STRIPE_SECRET_KEY to environment secrets.",
    });
    return null;
  }
  return stripe;
}

function toIso(ts: number): string {
  return new Date(ts * 1000).toISOString();
}

// Stripe v22 types may not expose all snake_case API response fields; use a local shape
type SubPayload = { id: string; status: Stripe.Subscription["status"]; current_period_end: number; cancel_at_period_end: boolean };

function buildSubscriptionInfo(
  businessId: number,
  customerId: string | null | undefined,
  sub: SubPayload
) {
  return {
    businessId,
    stripeCustomerId: customerId ?? null,
    stripeSubscriptionId: sub.id,
    subscriptionStatus: sub.status,
    subscriptionPeriodEnd: toIso(sub.current_period_end),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  };
}

router.get("/businesses/:id/subscription", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [business] = await db
    .select({
      id: businessesTable.id,
      stripeCustomerId: businessesTable.stripeCustomerId,
      stripeSubscriptionId: businessesTable.stripeSubscriptionId,
      subscriptionStatus: businessesTable.subscriptionStatus,
      subscriptionPeriodEnd: businessesTable.subscriptionPeriodEnd,
    })
    .from(businessesTable)
    .where(eq(businessesTable.id, id));

  if (!business) { res.status(404).json({ error: "Business not found" }); return; }

  let cancelAtPeriodEnd = false;

  if (business.stripeSubscriptionId) {
    const stripe = makeStripe();
    if (stripe) {
      try {
        const sub = await stripe.subscriptions.retrieve(business.stripeSubscriptionId) as unknown as SubPayload;
        cancelAtPeriodEnd = sub.cancel_at_period_end;
      } catch {
        // sub may have been deleted in Stripe — return DB data only
      }
    }
  }

  res.json({
    businessId: business.id,
    stripeCustomerId: business.stripeCustomerId ?? null,
    stripeSubscriptionId: business.stripeSubscriptionId ?? null,
    subscriptionStatus: business.subscriptionStatus ?? null,
    subscriptionPeriodEnd: business.subscriptionPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd,
  });
});

router.post("/businesses/:id/subscription", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const body = CreateSubscriptionBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const stripe = requireStripe(res);
  if (!stripe) return;

  const [business] = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.id, id));
  if (!business) { res.status(404).json({ error: "Business not found" }); return; }

  if (business.stripeSubscriptionId) {
    res.status(400).json({ error: "Business already has an active subscription. Cancel it first." });
    return;
  }

  let customerId = business.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: business.name,
      metadata: { businessId: String(business.id) },
    });
    customerId = customer.id;
    await db
      .update(businessesTable)
      .set({ stripeCustomerId: customerId })
      .where(eq(businessesTable.id, business.id));
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: body.data.stripePriceId }],
    collection_method: "send_invoice",
    days_until_due: 30,
  }) as unknown as SubPayload;

  await db
    .update(businessesTable)
    .set({
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
    })
    .where(eq(businessesTable.id, business.id));

  req.log.info({ businessId: business.id, subscriptionId: subscription.id }, "Stripe subscription created");
  res.status(201).json(buildSubscriptionInfo(business.id, customerId, subscription));
});

router.delete("/businesses/:id/subscription", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const stripe = requireStripe(res);
  if (!stripe) return;

  const [business] = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.id, id));
  if (!business) { res.status(404).json({ error: "Business not found" }); return; }
  if (!business.stripeSubscriptionId) {
    res.status(404).json({ error: "No active subscription found" });
    return;
  }

  const subscription = await stripe.subscriptions.update(business.stripeSubscriptionId, {
    cancel_at_period_end: true,
  }) as unknown as SubPayload;

  await db
    .update(businessesTable)
    .set({ subscriptionStatus: subscription.status })
    .where(eq(businessesTable.id, business.id));

  req.log.info({ businessId: business.id }, "Stripe subscription set to cancel at period end");
  res.json(buildSubscriptionInfo(business.id, business.stripeCustomerId, subscription));
});

router.get("/businesses/:id/billing-portal", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const stripe = requireStripe(res);
  if (!stripe) return;

  const [business] = await db
    .select({
      id: businessesTable.id,
      stripeCustomerId: businessesTable.stripeCustomerId,
    })
    .from(businessesTable)
    .where(eq(businessesTable.id, id));

  if (!business) { res.status(404).json({ error: "Business not found" }); return; }
  if (!business.stripeCustomerId) {
    res.status(404).json({ error: "No Stripe customer exists for this business yet" });
    return;
  }

  const host = process.env.PUBLIC_HOST ?? req.hostname;
  const protocol = req.secure ? "https" : "http";
  const returnUrl = `${protocol}://${host}/client/${id}`;

  const session = await stripe.billingPortal.sessions.create({
    customer: business.stripeCustomerId,
    return_url: returnUrl,
  });

  res.json({ url: session.url });
});

export default router;
