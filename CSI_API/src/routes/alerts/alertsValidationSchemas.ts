import { z } from "zod";

export const AlertSeverityEnum = z.enum([
  "INFO",
  "CAUTION",
  "SERIOUS",
  "CRITICAL",
]);

export const CreateAlertSchema = z.object({
  type: z.string(),
  message: z.string(),
  severity: AlertSeverityEnum,
  deviceId: z.number().int().optional(),
  siteId: z.number().int().optional(),
});

export const UpdateAlertSchema = CreateAlertSchema.partial().extend({
  acknowledged: z.number().int().optional(),
  acknowledgedBy: z.number().int().optional(),
  acknowledgedAt: z.string().optional(),
});
