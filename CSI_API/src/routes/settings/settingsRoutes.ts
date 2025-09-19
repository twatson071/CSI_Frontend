import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../../db";
import { systemSettings } from "../../db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

// Get all system settings
app.get("/", async (c) => {
  try {
    const settings = await db.select().from(systemSettings);
    const settingsMap = settings.reduce((acc: any, setting) => {
      acc[setting.key] = {
        value: setting.value,
        description: setting.description,
        updatedAt: setting.updatedAt,
        updatedBy: setting.updatedBy,
      };
      return acc;
    }, {});
    return c.json(settingsMap);
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return c.json({ error: "Failed to fetch system settings" }, 500);
  }
});

// Get a specific setting
app.get("/:key", async (c) => {
  const key = c.req.param("key");

  try {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);

    if (!setting) {
      // Return default values for known settings
      if (key === "mockMode") {
        return c.json({ value: "false", description: "Enable mock data mode for testing" });
      }
      return c.json({ error: "Setting not found" }, 404);
    }

    return c.json({
      value: setting.value,
      description: setting.description,
      updatedAt: setting.updatedAt,
      updatedBy: setting.updatedBy,
    });
  } catch (error) {
    console.error("Error fetching setting:", error);
    return c.json({ error: "Failed to fetch setting" }, 500);
  }
});

// Update a setting
const updateSettingSchema = z.object({
  value: z.string(),
  description: z.string().optional(),
  updatedBy: z.number().optional(),
});

app.put("/:key", zValidator("json", updateSettingSchema), async (c) => {
  const key = c.req.param("key");
  const body = c.req.valid("json");

  try {
    // Check if setting exists
    const [existing] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);

    if (existing) {
      // Update existing setting
      await db
        .update(systemSettings)
        .set({
          value: body.value,
          description: body.description ?? existing.description,
          updatedBy: body.updatedBy,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(systemSettings.key, key));
    } else {
      // Insert new setting
      await db.insert(systemSettings).values({
        key,
        value: body.value,
        description: body.description,
        updatedBy: body.updatedBy,
      });
    }

    return c.json({ success: true, key, value: body.value });
  } catch (error) {
    console.error("Error updating setting:", error);
    return c.json({ error: "Failed to update setting" }, 500);
  }
});

// Toggle mock mode specifically
app.post("/mock-mode/toggle", async (c) => {
  try {
    const [current] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "mockMode"))
      .limit(1);

    const currentValue = current?.value === "true";
    const newValue = (!currentValue).toString();

    if (current) {
      await db
        .update(systemSettings)
        .set({
          value: newValue,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(systemSettings.key, "mockMode"));
    } else {
      await db.insert(systemSettings).values({
        key: "mockMode",
        value: newValue,
        description: "Enable mock data mode for testing",
      });
    }

    return c.json({ mockMode: !currentValue });
  } catch (error) {
    console.error("Error toggling mock mode:", error);
    return c.json({ error: "Failed to toggle mock mode" }, 500);
  }
});

export default app;