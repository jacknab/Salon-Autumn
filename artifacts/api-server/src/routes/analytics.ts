import { Router, type IRouter } from "express";
import { desc, sql } from "drizzle-orm";
import { db, callsTable, businessesTable, packagesTable } from "@workspace/db";
import {
  GetAdminStatsResponse,
  GetRecentActivityResponse,
  GetRecentActivityQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admin/stats", async (req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [businessCounts] = await db
    .select({
      total: sql<number>`COUNT(*)`,
      active: sql<number>`COUNT(*) FILTER (WHERE status = 'active')`,
    })
    .from(businessesTable);

  const [callsToday] = await db
    .select({
      count: sql<number>`COUNT(*)`,
      totalSeconds: sql<number>`COALESCE(SUM(duration_seconds), 0)`,
    })
    .from(callsTable)
    .where(sql`started_at >= ${today}`);

  // Revenue MTD: sum cost from calls this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const [revRow] = await db
    .select({ rev: sql<number>`COALESCE(SUM(CAST(cost AS NUMERIC)), 0)` })
    .from(callsTable)
    .where(sql`started_at >= ${monthStart}`);

  const topBusinesses = await db
    .select({
      id: businessesTable.id,
      name: businessesTable.name,
      callsThisMonth: sql<number>`COUNT(${callsTable.id}) FILTER (WHERE ${callsTable.startedAt} >= ${monthStart})`,
      minutesUsed: sql<number>`COALESCE(CEIL(SUM(${callsTable.durationSeconds}) FILTER (WHERE ${callsTable.startedAt} >= ${monthStart}) / 60.0), 0)`,
    })
    .from(businessesTable)
    .leftJoin(callsTable, sql`${callsTable.businessId} = ${businessesTable.id}`)
    .groupBy(businessesTable.id, businessesTable.name)
    .orderBy(desc(sql`COUNT(${callsTable.id}) FILTER (WHERE ${callsTable.startedAt} >= ${monthStart})`))
    .limit(5);

  res.json(
    GetAdminStatsResponse.parse({
      totalBusinesses: Number(businessCounts?.total ?? 0),
      activeBusinesses: Number(businessCounts?.active ?? 0),
      totalCallsToday: Number(callsToday?.count ?? 0),
      totalMinutesToday: Math.ceil(Number(callsToday?.totalSeconds ?? 0) / 60),
      totalRevenueMtd: parseFloat(String(revRow?.rev ?? 0)),
      topBusinesses: topBusinesses.map((b) => ({
        id: b.id,
        name: b.name,
        callsThisMonth: Number(b.callsThisMonth),
        minutesUsed: Number(b.minutesUsed),
      })),
    })
  );
});

router.get("/admin/recent-activity", async (req, res): Promise<void> => {
  const query = GetRecentActivityQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 20) : 20;

  const rows = await db
    .select({
      id: callsTable.id,
      businessId: callsTable.businessId,
      businessName: businessesTable.name,
      callerNumber: callsTable.callerNumber,
      startedAt: callsTable.startedAt,
      durationSeconds: callsTable.durationSeconds,
      outcome: callsTable.outcome,
    })
    .from(callsTable)
    .leftJoin(businessesTable, sql`${callsTable.businessId} = ${businessesTable.id}`)
    .orderBy(desc(callsTable.startedAt))
    .limit(limit);

  res.json(
    GetRecentActivityResponse.parse(
      rows.map((r) => ({ ...r, businessName: r.businessName ?? "Unknown" }))
    )
  );
});

export default router;
