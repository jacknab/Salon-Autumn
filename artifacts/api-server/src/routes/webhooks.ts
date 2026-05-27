import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, businessesTable, packagesTable, callsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function twiml(xml: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  ${xml}\n</Response>`;
}

function twimlSay(message: string): string {
  return twiml(`<Say voice="alice">${message}</Say>`);
}

function twimlStream(url: string, callId: number, businessId: number, statusCallbackBase: string): string {
  return twiml(
    `<Connect>\n    <Stream url="${url}" track="both_tracks">\n      <Parameter name="callId" value="${callId}" />\n      <Parameter name="businessId" value="${businessId}" />\n    </Stream>\n  </Connect>\n  <Redirect>${statusCallbackBase}/webhook/twilio/status?callId=${callId}</Redirect>`
  );
}

router.post("/webhook/twilio/incoming", async (req, res): Promise<void> => {
  res.setHeader("Content-Type", "text/xml");

  const { To, From, CallSid } = req.body as { To?: string; From?: string; CallSid?: string };

  if (!To) {
    req.log.warn("Twilio incoming webhook missing To field");
    res.send(twimlSay("This number is not configured. Goodbye."));
    return;
  }

  const [row] = await db
    .select({
      id: businessesTable.id,
      name: businessesTable.name,
      status: businessesTable.status,
      packageId: businessesTable.packageId,
      billingCycleStart: businessesTable.billingCycleStart,
    })
    .from(businessesTable)
    .where(eq(businessesTable.twilioNumber, To));

  if (!row) {
    req.log.warn({ to: To }, "No business found for incoming number");
    res.send(twimlSay("This number is not configured. Goodbye."));
    return;
  }

  if (row.status === "suspended") {
    req.log.info({ businessId: row.id }, "Rejected call: business suspended");
    res.send(twimlSay("We are sorry, this business is currently unavailable. Please try again later."));
    return;
  }

  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, row.packageId));
  const [usageRow] = await db
    .select({ totalSeconds: sql<number>`COALESCE(SUM(duration_seconds), 0)` })
    .from(callsTable)
    .where(sql`business_id = ${row.id} AND started_at >= ${row.billingCycleStart}`);

  const minutesUsed = Math.ceil((usageRow?.totalSeconds ?? 0) / 60);
  const minutesLimit = pkg?.includedMinutes ?? 0;

  if (minutesUsed >= minutesLimit) {
    req.log.info({ businessId: row.id, minutesUsed, minutesLimit }, "Rejected call: minute limit exceeded");
    res.send(twimlSay("We are sorry, the AI receptionist is temporarily unavailable. Please call back during business hours or leave a voicemail."));
    return;
  }

  const startedAt = new Date();
  const [call] = await db
    .insert(callsTable)
    .values({
      businessId: row.id,
      callerNumber: From ?? "unknown",
      startedAt,
    })
    .returning();

  req.log.info({ callId: call.id, businessId: row.id, callSid: CallSid }, "Call session started");

  const streamUrl = process.env.TWILIO_STREAM_URL;
  if (!streamUrl) {
    req.log.error("TWILIO_STREAM_URL not set — cannot connect to AI");
    res.send(twimlSay("The AI assistant is not configured. Please contact the service provider."));
    return;
  }

  const host = process.env.PUBLIC_HOST ?? req.hostname;
  const protocol = req.secure ? "https" : "http";
  const statusCallbackBase = `${protocol}://${host}/api`;

  res.send(twimlStream(streamUrl, call.id, row.id, statusCallbackBase));
});

router.post("/webhook/twilio/status", async (req, res): Promise<void> => {
  const callId = req.query.callId ? parseInt(String(req.query.callId), 10) : null;
  const { CallDuration, CallStatus, RecordingUrl } = req.body as {
    CallDuration?: string;
    CallStatus?: string;
    RecordingUrl?: string;
  };

  if (!callId || isNaN(callId)) {
    req.log.warn({ query: req.query }, "Status callback missing callId");
    res.sendStatus(204);
    return;
  }

  const durationSeconds = CallDuration ? parseInt(CallDuration, 10) : null;
  const endedAt = new Date();

  const [call] = await db
    .select({ id: callsTable.id })
    .from(callsTable)
    .where(eq(callsTable.id, callId));

  if (!call) {
    req.log.warn({ callId }, "Status callback for unknown call");
    res.sendStatus(204);
    return;
  }

  const costPerSecond = 0.08 / 60;
  const cost = durationSeconds ? (durationSeconds * costPerSecond).toFixed(4) : null;

  await db
    .update(callsTable)
    .set({
      endedAt,
      durationSeconds: durationSeconds ?? undefined,
      cost: cost ?? undefined,
      recordingUrl: RecordingUrl ?? undefined,
    })
    .where(eq(callsTable.id, callId));

  req.log.info({ callId, durationSeconds, callStatus: CallStatus }, "Call finalized");
  res.sendStatus(204);
});

export default router;
