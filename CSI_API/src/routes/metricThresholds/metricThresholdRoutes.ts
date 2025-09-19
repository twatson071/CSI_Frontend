import { Hono, Context } from "hono";
import { db } from "../../db";
import { metricThresholds } from "../../db/schema";
import { eq } from "drizzle-orm";
import {
  CreateMetricThresholdSchema,
  UpdateMetricThresholdSchema,
} from "./metricThresholdValidationSchemas";

const app = new Hono();

app.get("/", async (c: Context) => {
  const all = await db.select().from(metricThresholds);
  return c.json(all);
});

app.get("/device/:deviceId", async (c: Context) => {
  const deviceId = parseInt(c.req.param("deviceId"));
  if (isNaN(deviceId)) return c.json({ error: "Invalid device ID" }, 400);
  const rows = await db.select().from(metricThresholds).findMany({
    where: eq(metricThresholds.deviceId, deviceId),
  });
  return c.json(rows);
});

app.get("/:id", async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "Invalid id" }, 400);
  const row = await db.select().from(metricThresholds).findFirst({
    where: eq(metricThresholds.id, id),
  });
  if (!row) return c.json({ error: "Metric threshold not found" }, 404);
  return c.json(row);
});

app.post("/", async (c: Context) => {
  const body = await c.req.json();
  const validation = CreateMetricThresholdSchema.safeParse(body);
  if (!validation.success)
    return c.json(
      { error: "Invalid input", details: validation.error.issues },
      400
    );
  const inserted = await db
    .insert(metricThresholds)
    .values(validation.data)
    .returning();
  return c.json(inserted[0], 201);
});

app.put("/:id", async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "Invalid id" }, 400);
  const body = await c.req.json();
  const validation = UpdateMetricThresholdSchema.safeParse(body);
  if (!validation.success)
    return c.json(
      { error: "Invalid input", details: validation.error.issues },
      400
    );
  if (Object.keys(validation.data).length === 0)
    return c.json({ error: "No fields to update" }, 400);
  const updated = await db
    .update(metricThresholds)
    .set(validation.data)
    .where(eq(metricThresholds.id, id))
    .returning();
  if (updated.length === 0)
    return c.json({ error: "Metric threshold not found" }, 404);
  return c.json(updated[0]);
});

app.delete("/:id", async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "Invalid id" }, 400);
  const deleted = await db
    .delete(metricThresholds)
    .where(eq(metricThresholds.id, id))
    .returning({ id: metricThresholds.id });
  if (deleted.length === 0)
    return c.json({ error: "Metric threshold not found" }, 404);
  return c.json({ message: "Metric threshold deleted", id: deleted[0].id });
});

export default app;
