import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, businessesTable, packagesTable, callsTable } from "@workspace/db";
import {
  ListBusinessesResponse,
  ListBusinessesQueryParams,
  CreateBusinessBody,
  GetBusinessParams,
  GetBusinessResponse,
  UpdateBusinessParams,
  UpdateBusinessBody,
  UpdateBusinessResponse,
  DeleteBusinessParams,
  GetBusinessUsageParams,
  GetBusinessUsageResponse,
  GetBusinessAnalyticsParams,
  GetBusinessAnalyticsResponse,
  LookupBusinessQueryParams,
  LookupBusinessResponse,
  ResetBillingCycleParams,
  ResetBillingCycleResponse,
  CheckEnforcementParams,
  CheckEnforcementResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/businesses", async (req, res): Promise<void> => {
  const query = ListBusinessesQueryParams.safeParse(req.query);
  const status = query.success ? query.data.status : undefined;

  const rows = await db
    .select({
      id: businessesTable.id,
      name: businessesTable.name,
      twilioNumber: businessesTable.twilioNumber,
      status: businessesTable.status,
      packageId: businessesTable.packageId,
      packageName: packagesTable.name,
      openaiPrompt: businessesTable.openaiPrompt,
      voicePersonality: businessesTable.voicePersonality,
      billingCycleStart: businessesTable.billingCycleStart,
      stripeCustomerId: businessesTable.stripeCustomerId,
      stripeSubscriptionId: businessesTable.stripeSubscriptionId,
      subscriptionStatus: businessesTable.subscriptionStatus,
      subscriptionPeriodEnd: businessesTable.subscriptionPeriodEnd,
      createdAt: businessesTable.createdAt,
    })
    .from(businessesTable)
    .leftJoin(packagesTable, eq(businessesTable.packageId, packagesTable.id))
    .where(status ? eq(businessesTable.status, status) : undefined)
    .orderBy(businessesTable.id);

  res.json(ListBusinessesResponse.parse(rows));
});

router.get("/businesses/lookup", async (req, res): Promise<void> => {
  const query = LookupBusinessQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const [row] = await db
    .select({
      id: businessesTable.id,
      name: businessesTable.name,
      twilioNumber: businessesTable.twilioNumber,
      status: businessesTable.status,
      packageId: businessesTable.packageId,
      packageName: packagesTable.name,
      openaiPrompt: businessesTable.openaiPrompt,
      voicePersonality: businessesTable.voicePersonality,
      billingCycleStart: businessesTable.billingCycleStart,
      stripeCustomerId: businessesTable.stripeCustomerId,
      stripeSubscriptionId: businessesTable.stripeSubscriptionId,
      subscriptionStatus: businessesTable.subscriptionStatus,
      subscriptionPeriodEnd: businessesTable.subscriptionPeriodEnd,
      createdAt: businessesTable.createdAt,
    })
    .from(businessesTable)
    .leftJoin(packagesTable, eq(businessesTable.packageId, packagesTable.id))
    .where(eq(businessesTable.twilioNumber, query.data.phone));
  if (!row) {
    res.status(404).json({ error: "Business not found" });
    return;
  }
  res.json(LookupBusinessResponse.parse(row));
});

router.post("/businesses", async (req, res): Promise<void> => {
  const parsed = CreateBusinessBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [business] = await db.insert(businessesTable).values(parsed.data).returning();
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, business.packageId));
  res.status(201).json(GetBusinessResponse.parse({ ...business, packageName: pkg?.name ?? null }));
});

router.get("/businesses/:id", async (req, res): Promise<void> => {
  const params = GetBusinessParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select({
      id: businessesTable.id,
      name: businessesTable.name,
      twilioNumber: businessesTable.twilioNumber,
      status: businessesTable.status,
      packageId: businessesTable.packageId,
      packageName: packagesTable.name,
      openaiPrompt: businessesTable.openaiPrompt,
      voicePersonality: businessesTable.voicePersonality,
      billingCycleStart: businessesTable.billingCycleStart,
      stripeCustomerId: businessesTable.stripeCustomerId,
      stripeSubscriptionId: businessesTable.stripeSubscriptionId,
      subscriptionStatus: businessesTable.subscriptionStatus,
      subscriptionPeriodEnd: businessesTable.subscriptionPeriodEnd,
      createdAt: businessesTable.createdAt,
    })
    .from(businessesTable)
    .leftJoin(packagesTable, eq(businessesTable.packageId, packagesTable.id))
    .where(eq(businessesTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Business not found" });
    return;
  }
  res.json(GetBusinessResponse.parse(row));
});

router.patch("/businesses/:id", async (req, res): Promise<void> => {
  const params = UpdateBusinessParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBusinessBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [business] = await db
    .update(businessesTable)
    .set(parsed.data)
    .where(eq(businessesTable.id, params.data.id))
    .returning();
  if (!business) {
    res.status(404).json({ error: "Business not found" });
    return;
  }
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, business.packageId));
  res.json(UpdateBusinessResponse.parse({ ...business, packageName: pkg?.name ?? null }));
});

router.delete("/businesses/:id", async (req, res): Promise<void> => {
  const params = DeleteBusinessParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(businessesTable).where(eq(businessesTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/businesses/:id/billing-reset", async (req, res): Promise<void> => {
  const params = ResetBillingCycleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [business] = await db
    .update(businessesTable)
    .set({ billingCycleStart: new Date() })
    .where(eq(businessesTable.id, params.data.id))
    .returning();
  if (!business) {
    res.status(404).json({ error: "Business not found" });
    return;
  }
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, business.packageId));
  res.json(ResetBillingCycleResponse.parse({ ...business, packageName: pkg?.name ?? null }));
});

router.get("/businesses/:id/enforcement", async (req, res): Promise<void> => {
  const params = CheckEnforcementParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [business] = await db
    .select({
      id: businessesTable.id,
      status: businessesTable.status,
      packageId: businessesTable.packageId,
      billingCycleStart: businessesTable.billingCycleStart,
    })
    .from(businessesTable)
    .where(eq(businessesTable.id, params.data.id));

  if (!business) {
    res.status(404).json({ error: "Business not found" });
    return;
  }

  if (business.status === "suspended") {
    res.json(CheckEnforcementResponse.parse({
      allowed: false,
      businessId: business.id,
      reason: "suspended",
      status: business.status,
      minutesUsed: 0,
      minutesLimit: 0,
      percentUsed: 0,
    }));
    return;
  }

  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, business.packageId));
  const [usageRow] = await db
    .select({ totalSeconds: sql<number>`COALESCE(SUM(duration_seconds), 0)` })
    .from(callsTable)
    .where(sql`business_id = ${business.id} AND started_at >= ${business.billingCycleStart}`);

  const minutesUsed = Math.ceil((usageRow?.totalSeconds ?? 0) / 60);
  const minutesLimit = pkg?.includedMinutes ?? 0;
  const percentUsed = minutesLimit > 0 ? Math.min(100, (minutesUsed / minutesLimit) * 100) : 0;
  const limitExceeded = minutesUsed >= minutesLimit;

  res.json(CheckEnforcementResponse.parse({
    allowed: !limitExceeded,
    businessId: business.id,
    reason: limitExceeded ? "limit_exceeded" : "ok",
    status: business.status,
    minutesUsed,
    minutesLimit,
    percentUsed,
  }));
});

router.get("/businesses/:id/usage", async (req, res): Promise<void> => {
  const params = GetBusinessUsageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [business] = await db
    .select({
      id: businessesTable.id,
      billingCycleStart: businessesTable.billingCycleStart,
      packageId: businessesTable.packageId,
    })
    .from(businessesTable)
    .where(eq(businessesTable.id, params.data.id));
  if (!business) {
    res.status(404).json({ error: "Business not found" });
    return;
  }

  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, business.packageId));

  const [usageRow] = await db
    .select({
      totalSeconds: sql<number>`COALESCE(SUM(duration_seconds), 0)`,
      totalCalls: sql<number>`COUNT(*)`,
    })
    .from(callsTable)
    .where(sql`business_id = ${business.id} AND started_at >= ${business.billingCycleStart}`);

  const minutesUsed = Math.ceil((usageRow?.totalSeconds ?? 0) / 60);
  const minutesLimit = pkg?.includedMinutes ?? 0;
  const minutesRemaining = Math.max(0, minutesLimit - minutesUsed);
  const overageMinutes = Math.max(0, minutesUsed - minutesLimit);
  const overageCost = overageMinutes * parseFloat(pkg?.overageRate ?? "0");
  const percentUsed = minutesLimit > 0 ? Math.min(100, (minutesUsed / minutesLimit) * 100) : 0;

  res.json(
    GetBusinessUsageResponse.parse({
      businessId: business.id,
      minutesUsed,
      minutesLimit,
      minutesRemaining,
      percentUsed,
      overageMinutes,
      overageCost,
      totalCalls: Number(usageRow?.totalCalls ?? 0),
      billingCycleStart: business.billingCycleStart,
    })
  );
});

router.get("/businesses/:id/analytics", async (req, res): Promise<void> => {
  const params = GetBusinessAnalyticsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [business] = await db
    .select({ id: businessesTable.id })
    .from(businessesTable)
    .where(eq(businessesTable.id, params.data.id));
  if (!business) {
    res.status(404).json({ error: "Business not found" });
    return;
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const calls = await db
    .select()
    .from(callsTable)
    .where(sql`business_id = ${business.id} AND started_at >= ${since}`);

  const totalCalls = calls.length;
  const answeredCalls = calls.filter((c) => c.outcome !== "voicemail").length;
  const bookedCalls = calls.filter((c) => c.outcome === "booked").length;
  const transferredCalls = calls.filter((c) => c.outcome === "transferred").length;
  const voicemailCalls = calls.filter((c) => c.outcome === "voicemail").length;
  const aiHandledCalls = calls.filter((c) => c.outcome === "ai_handled").length;
  const totalDuration = calls.reduce((sum, c) => sum + (c.durationSeconds ?? 0), 0);
  const avgCallDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;

  const afterHoursCalls = calls.filter((c) => {
    const hour = new Date(c.startedAt).getHours();
    return hour < 8 || hour >= 18;
  }).length;

  const missedCallRecoveries = aiHandledCalls;

  const dayMap = new Map<string, { count: number; seconds: number }>();
  for (const call of calls) {
    const dateStr = new Date(call.startedAt).toISOString().split("T")[0];
    const existing = dayMap.get(dateStr) ?? { count: 0, seconds: 0 };
    dayMap.set(dateStr, {
      count: existing.count + 1,
      seconds: existing.seconds + (call.durationSeconds ?? 0),
    });
  }

  const callsByDay = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { count, seconds }]) => ({
      date,
      count,
      minutes: Math.ceil(seconds / 60),
    }));

  res.json(
    GetBusinessAnalyticsResponse.parse({
      businessId: business.id,
      totalCalls,
      answeredCalls,
      bookedCalls,
      transferredCalls,
      voicemailCalls,
      avgCallDuration,
      afterHoursCalls,
      missedCallRecoveries,
      callsByDay,
    })
  );
});

export default router;
