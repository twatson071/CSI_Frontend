import { Hono, Context } from "hono";
import { db } from "../../db";
import { alerts } from "../../db/schema";
import { eq, asc, desc, and } from "drizzle-orm";
import {
  CreateAlertSchema,
  UpdateAlertSchema,
} from "./alertsValidationSchemas";
import { z } from "zod";

// Function to determine device status based on highest alert severity
async function updateDeviceStatusFromAlerts(deviceId: number) {
  try {
    // Get all unacknowledged alerts for this device, ordered by severity priority
    const deviceAlerts = await db.query.alerts.findMany({
      where: and(eq(alerts.deviceId, deviceId), eq(alerts.acknowledged, 0)),
      orderBy: (a, { desc }) => desc(a.createdAt),
    });

    let newStatus:
      | "off"
      | "standby"
      | "normal"
      | "caution"
      | "serious"
      | "critical" = "normal"; // Default status when no alerts

    if (deviceAlerts.length > 0) {
      // Determine highest severity alert
      const severityPriority = {
        CRITICAL: 4,
        SERIOUS: 3,
        CAUTION: 2,
        INFO: 1,
      };

      let highestSeverity = "INFO";
      let highestPriority = 0;

      for (const alert of deviceAlerts) {
        const priority =
          severityPriority[alert.severity as keyof typeof severityPriority] ||
          0;
        if (priority > highestPriority) {
          highestPriority = priority;
          highestSeverity = alert.severity;
        }
      }

      // Map alert severity to device status
      const severityToStatus = {
        CRITICAL: "critical" as const,
        SERIOUS: "serious" as const,
        CAUTION: "caution" as const,
        INFO: "normal" as const,
      };

      newStatus =
        severityToStatus[highestSeverity as keyof typeof severityToStatus] ||
        "normal";
    }

    // Update device status in database
    const { devices } = await import("../../db/schema");
    await db
      .update(devices)
      .set({
        status: newStatus,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(devices.id, deviceId));

    console.log(`Device ${deviceId} status updated to: ${newStatus}`);
    return newStatus;
  } catch (error) {
    console.error(`Error updating device ${deviceId} status:`, error);
    return null;
  }
}

const app = new Hono();

// Get all unacknowledged alerts (recent 100)
app.get("/", async (c: Context) => {
  try {
    const allAlerts = await db.query.alerts.findMany({
      where: eq(alerts.acknowledged, 0), // Only get unacknowledged alerts
      orderBy: (a, { desc }) => desc(a.createdAt),
      limit: 100,
    });
    return c.json(allAlerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return c.json({ error: "Failed to fetch alerts" }, 500);
  }
});

// Get all alerts including acknowledged ones (for debugging/history)
app.get("/all", async (c: Context) => {
  try {
    const allAlerts = await db.query.alerts.findMany({
      orderBy: (a, { desc }) => desc(a.createdAt),
      limit: 200,
    });
    return c.json(allAlerts);
  } catch (error) {
    console.error("Error fetching all alerts:", error);
    return c.json({ error: "Failed to fetch all alerts" }, 500);
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
    return c.json(
      { error: "Invalid input", details: validation.error.issues },
      400
    );
  }

  try {
    const newAlertResult = await db
      .insert(alerts)
      .values(validation.data)
      .returning();
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
    return c.json(
      { error: "Invalid input", details: validation.error.issues },
      400
    );
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

    // If the alert was acknowledged and has a deviceId, update device status
    if (validation.data.acknowledged === 1 && updatedAlertResult[0].deviceId) {
      await updateDeviceStatusFromAlerts(updatedAlertResult[0].deviceId);
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
