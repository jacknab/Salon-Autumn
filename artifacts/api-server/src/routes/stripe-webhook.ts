import { Router, type IRouter } from "express";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, businessesTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/webhook/stripe", async (req, res): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    req.log.warn("STRIPE_SECRET_KEY not set — ignoring Stripe webhook");
    res.sendStatus(200);
    return;
  }

  const stripe = new Stripe(apiKey);
  let event: Stripe.Event;

  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    } catch (err) {
      req.log.warn({ err }, "Stripe webhook signature verification failed");
      res.status(400).json({ error: "Invalid Stripe signature" });
      return;
    }
  } else {
    req.log.warn("STRIPE_WEBHOOK_SECRET not set — skipping signature verification (development only)");
    try {
      event = JSON.parse((req.body as Buffer).toString()) as Stripe.Event;
    } catch {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }
  }

  req.log.info({ type: event.type }, "Stripe webhook received");

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        // Stripe v22 types may not expose all snake_case fields; cast through unknown
        type SubPayload = { id: string; status: string; current_period_end: number };
        const sub = event.data.object as unknown as SubPayload;
        await db
          .update(businessesTable)
          .set({
            subscriptionStatus: sub.status,
            subscriptionPeriodEnd: new Date(sub.current_period_end * 1000),
          })
          .where(eq(businessesTable.stripeSubscriptionId, sub.id));
        req.log.info({ subscriptionId: sub.id, status: sub.status }, "Subscription synced");
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await db
          .update(businessesTable)
          .set({
            subscriptionStatus: "canceled",
            stripeSubscriptionId: null,
          })
          .where(eq(businessesTable.stripeSubscriptionId, sub.id));
        req.log.info({ subscriptionId: sub.id }, "Subscription cancelled");
        break;
      }

      case "invoice.payment_succeeded": {
        // Stripe v22 Invoice types may omit snake_case fields; cast through unknown
        type InvoicePayload = { subscription: string | null };
        const invoice = event.data.object as unknown as InvoicePayload;
        const subId = invoice.subscription ?? undefined;
        if (subId) {
          await db
            .update(businessesTable)
            .set({ subscriptionStatus: "active" })
            .where(eq(businessesTable.stripeSubscriptionId, subId));
        }
        break;
      }

      case "invoice.payment_failed": {
        type InvoicePayload = { subscription: string | null };
        const invoice = event.data.object as unknown as InvoicePayload;
        const subId = invoice.subscription ?? undefined;
        if (subId) {
          await db
            .update(businessesTable)
            .set({ subscriptionStatus: "past_due" })
            .where(eq(businessesTable.stripeSubscriptionId, subId));
          req.log.warn({ subscriptionId: subId }, "Invoice payment failed — subscription marked past_due");
        }
        break;
      }

      default:
        req.log.info({ type: event.type }, "Unhandled Stripe event type");
    }
  } catch (err) {
    req.log.error({ err, eventType: event.type }, "Error processing Stripe webhook");
    res.status(500).json({ error: "Webhook processing failed" });
    return;
  }

  res.sendStatus(200);
});

export default router;
