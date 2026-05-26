import { Router } from "express";
import { db, demoSignupsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const DEMO_NUMBER = process.env.DEMO_PHONE_NUMBER ?? "8005550199";

function formatPhone(digits: string): string {
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

router.post("/demo", async (req, res) => {
  const { phone } = req.body ?? {};

  if (typeof phone !== "string" || !/^[0-9]{10}$/.test(phone)) {
    res.status(400).json({ error: "Please enter a valid 10-digit phone number." });
    return;
  }

  const existing = await db
    .select()
    .from(demoSignupsTable)
    .where(eq(demoSignupsTable.phone, phone))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "This number is already registered for a demo." });
    return;
  }

  await db.insert(demoSignupsTable).values({ phone });

  req.log.info({ phone }, "demo signup registered");

  res.status(201).json({
    demoNumber: formatPhone(DEMO_NUMBER),
    message: `Your 5-minute demo is ready. Call ${formatPhone(DEMO_NUMBER)} from the phone number you entered to experience Autumn live.`,
  });
});

export default router;
