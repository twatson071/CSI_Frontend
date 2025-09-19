import { z } from "zod";

export const updateSettingSchema = z.object({
  value: z.string(),
  description: z.string().optional(),
  updatedBy: z.number().optional(),
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;