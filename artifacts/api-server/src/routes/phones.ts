import { Router } from "express";
import twilio from "twilio";
import { db, provisionedNumbersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Twilio credentials not configured");
  return twilio(sid, token);
}

router.get("/phones/available", async (req, res) => {
  const areaCode = typeof req.query.areaCode === "string" ? req.query.areaCode : undefined;
  const contains = typeof req.query.contains === "string" ? req.query.contains : undefined;

  try {
    const client = getClient();
    const params: Record<string, string | boolean> = {
      voiceEnabled: true,
      smsEnabled: false,
      limit: "10",
    };
    if (areaCode) params.areaCode = areaCode;
    if (contains) params.contains = contains;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const numbers = await client.availablePhoneNumbers("US").local.list(params as any);

    res.json(
      numbers.map((n) => ({
        phoneNumber: n.phoneNumber,
        friendlyName: n.friendlyName,
        locality: n.locality,
        region: n.region,
        postalCode: n.postalCode,
      }))
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to search numbers";
    req.log.error({ err }, "twilio available numbers error");
    res.status(502).json({ error: message });
  }
});

router.post("/phones/provision", async (req, res) => {
  const { phoneNumber, salonId, storeId, friendlyName } = req.body ?? {};

  if (!phoneNumber || !salonId || !storeId) {
    res.status(400).json({ error: "phoneNumber, salonId, and storeId are required" });
    return;
  }

  const baseWebhookUrl = process.env.TWILIO_VOICE_WEBHOOK_URL;
  if (!baseWebhookUrl) {
    res.status(500).json({ error: "TWILIO_VOICE_WEBHOOK_URL is not configured" });
    return;
  }

  // Append the booking store ID so Autumn knows which salon's data to load
  const webhookUrl = `${baseWebhookUrl.replace(/\/$/, "")}/${storeId}`;

  try {
    const client = getClient();

    const purchased = await client.incomingPhoneNumbers.create({
      phoneNumber,
      friendlyName: friendlyName ?? `Autumn — ${salonId}`,
      voiceUrl: webhookUrl,
      voiceMethod: "POST",
    });

    const [row] = await db
      .insert(provisionedNumbersTable)
      .values({
        salonId,
        twilioSid: purchased.sid,
        phoneNumber: purchased.phoneNumber,
        friendlyName: purchased.friendlyName,
        webhookUrl,
      })
      .returning();

    req.log.info({ salonId, phoneNumber: purchased.phoneNumber }, "phone number provisioned");

    res.status(201).json({
      id: row.id,
      phoneNumber: row.phoneNumber,
      friendlyName: row.friendlyName,
      twilioSid: row.twilioSid,
      webhookUrl: row.webhookUrl,
      provisionedAt: row.provisionedAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to provision number";
    req.log.error({ err }, "twilio provision error");
    res.status(502).json({ error: message });
  }
});

router.get("/phones/salon/:salonId", async (req, res) => {
  const { salonId } = req.params;
  const rows = await db
    .select()
    .from(provisionedNumbersTable)
    .where(eq(provisionedNumbersTable.salonId, salonId));
  res.json(rows);
});

export default router;
