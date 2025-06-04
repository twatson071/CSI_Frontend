import { Hono, Context } from "hono";
import { db } from "../../db";
import { alerts } from "../../db/schema";
import { eq, asc, desc } from "drizzle-orm";
import {
  CreateAlertSchema,
  UpdateAlertSchema,
} from "./alertsValidationSchemas";
import { z } from "zod";

const app = new Hono();

// Get all alerts (recent 100)
app.get("/", async (c: Context) => {
  try {
    const allAlerts = await db.query.alerts.findMany({
      orderBy: (a, { desc }) => desc(a.createdAt),
      limit: 100,
    });
    return c.json(allAlerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return c.json({ error: "Failed to fetch alerts" }, 500);
  }
});

// Get alert by ID
app.get("/:id", async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid alert ID" }, 400);
  }
  try {
    const alert = await db.query.alerts.findFirst({
      where: eq(alerts.id, id),
    });
    if (!alert) {
      return c.json({ error: "Alert not found" }, 404);
    }
    return c.json(alert);
  } catch (error) {
    console.error("Error fetching alert:", error);
    return c.json({ error: "Failed to fetch alert" }, 500);
  }
});

// Create a new alert
app.post("/", async (c: Context) => {
  const body = await c.req.json();
  const validation = CreateAlertSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ error: "Invalid input", details: validation.error.issues }, 400);
  }

  try {
    const newAlertResult = await db.insert(alerts).values(validation.data).returning();
    if (newAlertResult.length === 0) {
      return c.json({ error: "Failed to create alert" }, 500);
    }
    return c.json(newAlertResult[0], 201);
  } catch (error) {
    console.error("Error creating alert:", error);
    return c.json({ error: "Failed to create alert" }, 500);
  }
});

// Update an alert
app.put("/:id", async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid alert ID" }, 400);
  }

  const body = await c.req.json();
  const validation = UpdateAlertSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ error: "Invalid input", details: validation.error.issues }, 400);
  }

  if (Object.keys(validation.data).length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  try {
    const updatedAlertResult = await db
      .update(alerts)
      .set(validation.data)
      .where(eq(alerts.id, id))
      .returning();
    if (updatedAlertResult.length === 0) {
      return c.json({ error: "Alert not found or no changes made" }, 404);
    }
    return c.json(updatedAlertResult[0]);
  } catch (error) {
    console.error("Error updating alert:", error);
    return c.json({ error: "Failed to update alert" }, 500);
  }
});

// Delete an alert
app.delete("/:id", async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid alert ID" }, 400);
  }
  try {
    const deletedAlert = await db
      .delete(alerts)
      .where(eq(alerts.id, id))
      .returning({ id: alerts.id });
    if (deletedAlert.length === 0) {
      return c.json({ error: "Alert not found" }, 404);
    }
    return c.json({
      message: "Alert deleted successfully",
      alertId: deletedAlert[0].id,
    });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return c.json({ error: "Failed to delete alert" }, 500);
  }
});

export default app;
