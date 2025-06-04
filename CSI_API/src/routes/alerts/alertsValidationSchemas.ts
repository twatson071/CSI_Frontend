import { z } from "zod";

export const AlertSeverityEnum = z.enum(["INFO", "WARNING", "CRITICAL"]);

export const CreateAlertSchema = z.object({
  type: z.string(),
  message: z.string(),
  severity: AlertSeverityEnum,
  deviceId: z.number().int().optional(),
  siteId: z.number().int().optional(),
});

export const UpdateAlertSchema = CreateAlertSchema.partial();
