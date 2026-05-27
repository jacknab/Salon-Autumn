import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const provisionedNumbersTable = pgTable("provisioned_numbers", {
  id: serial("id").primaryKey(),
  salonId: text("salon_id").notNull(),
  twilioSid: text("twilio_sid").notNull().unique(),
  phoneNumber: text("phone_number").notNull().unique(),
  friendlyName: text("friendly_name").notNull(),
  webhookUrl: text("webhook_url").notNull(),
  provisionedAt: timestamp("provisioned_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProvisionedNumber = typeof provisionedNumbersTable.$inferSelect;
