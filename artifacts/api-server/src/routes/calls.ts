import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, callsTable, businessesTable } from "@workspace/db";
import {
  ListCallsResponse,
  ListCallsQueryParams,
  CreateCallBody,
  GetCallParams,
  GetCallResponse,
  UpdateCallParams,
  UpdateCallBody,
  UpdateCallResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/calls", async (req, res): Promise<void> => {
  const query = ListCallsQueryParams.safeParse(req.query);
  const params = query.success ? query.data : { limit: 50, offset: 0 };

  const rows = await db
    .select({
      id: callsTable.id,
      businessId: callsTable.businessId,
      businessName: businessesTable.name,
      callerNumber: callsTable.callerNumber,
      startedAt: callsTable.startedAt,
      endedAt: callsTable.endedAt,
      durationSeconds: callsTable.durationSeconds,
      cost: callsTable.cost,
      transcript: callsTable.transcript,
      recordingUrl: callsTable.recordingUrl,
      outcome: callsTable.outcome,
      createdAt: callsTable.createdAt,
    })
    .from(callsTable)
    .leftJoin(businessesTable, eq(callsTable.businessId, businessesTable.id))
    .where(params.businessId ? eq(callsTable.businessId, params.businessId) : undefined)
    .orderBy(desc(callsTable.startedAt))
    .limit(params.limit ?? 50)
    .offset(params.offset ?? 0);

  const mapped = rows.map((r) => ({
    ...r,
    cost: r.cost != null ? parseFloat(r.cost) : null,
  }));

  res.json(ListCallsResponse.parse(mapped));
});

router.post("/calls", async (req, res): Promise<void> => {
  const parsed = CreateCallBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [call] = await db.insert(callsTable).values(parsed.data).returning();
  const [business] = await db
    .select({ name: businessesTable.name })
    .from(businessesTable)
    .where(eq(businessesTable.id, call.businessId));
  res.status(201).json(
    GetCallResponse.parse({
      ...call,
      businessName: business?.name ?? null,
      cost: call.cost != null ? parseFloat(call.cost) : null,
    })
  );
});

router.get("/calls/:id", async (req, res): Promise<void> => {
  const params = GetCallParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select({
      id: callsTable.id,
      businessId: callsTable.businessId,
      businessName: businessesTable.name,
      callerNumber: callsTable.callerNumber,
      startedAt: callsTable.startedAt,
      endedAt: callsTable.endedAt,
      durationSeconds: callsTable.durationSeconds,
      cost: callsTable.cost,
      transcript: callsTable.transcript,
      recordingUrl: callsTable.recordingUrl,
      outcome: callsTable.outcome,
      createdAt: callsTable.createdAt,
    })
    .from(callsTable)
    .leftJoin(businessesTable, eq(callsTable.businessId, businessesTable.id))
    .where(eq(callsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Call not found" });
    return;
  }
  res.json(GetCallResponse.parse({ ...row, cost: row.cost != null ? parseFloat(row.cost) : null }));
});

router.patch("/calls/:id", async (req, res): Promise<void> => {
  const params = UpdateCallParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCallBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { cost, ...rest } = parsed.data;
  const updateValues: Record<string, unknown> = { ...rest };
  if (cost !== undefined) updateValues.cost = String(cost);

  const [call] = await db
    .update(callsTable)
    .set(updateValues)
    .where(eq(callsTable.id, params.data.id))
    .returning();
  if (!call) {
    res.status(404).json({ error: "Call not found" });
    return;
  }
  const [business] = await db
    .select({ name: businessesTable.name })
    .from(businessesTable)
    .where(eq(businessesTable.id, call.businessId));
  res.json(
    UpdateCallResponse.parse({
      ...call,
      businessName: business?.name ?? null,
      cost: call.cost != null ? parseFloat(call.cost) : null,
    })
  );
});

export default router;
