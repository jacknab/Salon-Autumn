import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const demoSignupsTable = pgTable("demo_signups", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDemoSignupSchema = createInsertSchema(demoSignupsTable).omit({ id: true, createdAt: true });
export type InsertDemoSignup = z.infer<typeof insertDemoSignupSchema>;
export type DemoSignup = typeof demoSignupsTable.$inferSelect;
