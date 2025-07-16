import { z } from "zod";

export const CreateMetricThresholdSchema = z.object({
  deviceId: z.number(),
  metricType: z.string(),
  cautionThreshold: z.number().optional(),
  seriousThreshold: z.number().optional(),
  criticalThreshold: z.number().optional(),
  operator: z.enum(["greater_than", "less_than", "equals"]).optional(),
  isActive: z.number().optional(),
});

export const UpdateMetricThresholdSchema =
  CreateMetricThresholdSchema.partial();
