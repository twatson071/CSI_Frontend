import { z } from "zod";

// Schema for what the frontend sends
export const CreateDeviceClientPayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  serviceUrl: z.string().min(1, "Service URL is required"),
  siteId: z.number().int().positive("Site ID must be a positive integer"),
});

export const FullDeviceCreateSchema = z.object({
  name: z.string(),
  type: z.string(),
  serviceUrl: z.string(),
  siteId: z.number(),
  parameters: z.any().optional(),
  data: z.any().optional(),
  ipAddress: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
});

export const DeviceDetailsSchema = z.object({
  // Assuming some details for a device
  model: z.string().optional(),
  firmwareVersion: z.string().optional(),
  ipAddress: z.string().ip().optional(),
});

export const CreateDeviceSchema = z.object({
  name: z.string(),
  type: z.string(), // Added: required field
  serviceUrl: z.string(), // Added: required field
  siteId: z.number().optional(), // Optional, assuming it can be nullable or set later
  parameters: z.array(z.any()).optional().default([]), // Optional, with default
  data: z.any().optional().nullable(), // Optional, nullable
  ipAddress: z.string().ip().optional().nullable(), // Optional, IP address
  status: z
    .union([
      z.literal("off"),
      z.literal("standby"),
      z.literal("normal"),
      z.literal("caution"),
      z.literal("serious"),
      z.literal("critical"),
    ])
    .optional()
    .nullable(), // Optional, with specific values
});

export const UpdateDeviceSchema = CreateDeviceSchema.partial(); // Use partial for updates, all fields become optional

export const DeviceThresholdSchema = z
  .object({
    metricType: z.string(),
    warning: z.number().min(0),
    critical: z.number().min(0),
    units: z.string().optional(),
    enabled: z.boolean().optional(),
  })
  .refine((data) => data.critical > data.warning, {
    message: "Critical must be greater than warning",
    path: ["critical"],
  });

export const UpdateDeviceThresholdsSchema = z.object({
  thresholds: z.array(DeviceThresholdSchema),
});
