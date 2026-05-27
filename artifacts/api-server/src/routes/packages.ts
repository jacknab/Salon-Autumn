import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, packagesTable } from "@workspace/db";
import {
  ListPackagesResponse,
  CreatePackageBody,
  GetPackageParams,
  GetPackageResponse,
  UpdatePackageParams,
  UpdatePackageBody,
  UpdatePackageResponse,
  DeletePackageParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/packages", async (req, res): Promise<void> => {
  const rows = await db.select().from(packagesTable).orderBy(packagesTable.id);
  const packages = rows.map((p) => ({
    ...p,
    monthlyPrice: parseFloat(p.monthlyPrice),
    overageRate: parseFloat(p.overageRate),
  }));
  res.json(ListPackagesResponse.parse(packages));
});

router.post("/packages", async (req, res): Promise<void> => {
  const parsed = CreatePackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, includedMinutes, monthlyPrice, overageRate, features, stripePriceId } = parsed.data;
  const [pkg] = await db
    .insert(packagesTable)
    .values({
      name,
      includedMinutes,
      monthlyPrice: String(monthlyPrice),
      overageRate: String(overageRate),
      features: features ?? [],
      ...(stripePriceId !== undefined && { stripePriceId }),
    })
    .returning();
  res.status(201).json(GetPackageResponse.parse({ ...pkg, monthlyPrice: parseFloat(pkg.monthlyPrice), overageRate: parseFloat(pkg.overageRate) }));
});

router.get("/packages/:id", async (req, res): Promise<void> => {
  const params = GetPackageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, params.data.id));
  if (!pkg) {
    res.status(404).json({ error: "Package not found" });
    return;
  }
  res.json(GetPackageResponse.parse({ ...pkg, monthlyPrice: parseFloat(pkg.monthlyPrice), overageRate: parseFloat(pkg.overageRate) }));
});

router.patch("/packages/:id", async (req, res): Promise<void> => {
  const params = UpdatePackageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { monthlyPrice, overageRate, ...rest } = parsed.data;
  const updateValues: Record<string, unknown> = { ...rest };
  if (monthlyPrice !== undefined) updateValues.monthlyPrice = String(monthlyPrice);
  if (overageRate !== undefined) updateValues.overageRate = String(overageRate);

  const [pkg] = await db
    .update(packagesTable)
    .set(updateValues)
    .where(eq(packagesTable.id, params.data.id))
    .returning();
  if (!pkg) {
    res.status(404).json({ error: "Package not found" });
    return;
  }
  res.json(UpdatePackageResponse.parse({ ...pkg, monthlyPrice: parseFloat(pkg.monthlyPrice), overageRate: parseFloat(pkg.overageRate) }));
});

router.delete("/packages/:id", async (req, res): Promise<void> => {
  const params = DeletePackageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(packagesTable).where(eq(packagesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
