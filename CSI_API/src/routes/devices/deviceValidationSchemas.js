"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDeviceThresholdsSchema = exports.DeviceThresholdSchema = exports.UpdateDeviceSchema = exports.CreateDeviceSchema = exports.DeviceDetailsSchema = exports.FullDeviceCreateSchema = exports.CreateDeviceClientPayloadSchema = void 0;
var zod_1 = require("zod");
// Schema for what the frontend sends
exports.CreateDeviceClientPayloadSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    type: zod_1.z.string().min(1, "Type is required"),
    serviceUrl: zod_1.z.string().min(1, "Service URL is required"),
    siteId: zod_1.z.number().int().positive("Site ID must be a positive integer"),
});
exports.FullDeviceCreateSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.string(),
    serviceUrl: zod_1.z.string(),
    siteId: zod_1.z.number(),
    parameters: zod_1.z.any().optional(),
    data: zod_1.z.any().optional(),
    ipAddress: zod_1.z.string().nullable().optional(),
    status: zod_1.z.string().nullable().optional(),
});
exports.DeviceDetailsSchema = zod_1.z.object({
    // Assuming some details for a device
    model: zod_1.z.string().optional(),
    firmwareVersion: zod_1.z.string().optional(),
    ipAddress: zod_1.z.string().ip().optional(),
});
exports.CreateDeviceSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.string(), // Added: required field
    serviceUrl: zod_1.z.string(), // Added: required field
    siteId: zod_1.z.number().optional(), // Optional, assuming it can be nullable or set later
    parameters: zod_1.z.array(zod_1.z.any()).optional().default([]), // Optional, with default
    data: zod_1.z.any().optional().nullable(), // Optional, nullable
    ipAddress: zod_1.z.string().ip().optional().nullable(), // Optional, IP address
    status: zod_1.z
        .union([
        zod_1.z.literal("off"),
        zod_1.z.literal("standby"),
        zod_1.z.literal("normal"),
        zod_1.z.literal("caution"),
        zod_1.z.literal("serious"),
        zod_1.z.literal("critical"),
    ])
        .optional()
        .nullable(), // Optional, with specific values
});
exports.UpdateDeviceSchema = exports.CreateDeviceSchema.partial(); // Use partial for updates, all fields become optional
exports.DeviceThresholdSchema = zod_1.z
    .object({
    metricType: zod_1.z.string(),
    warning: zod_1.z.number().min(0),
    critical: zod_1.z.number().min(0),
    units: zod_1.z.string().optional(),
    enabled: zod_1.z.boolean().optional(),
})
    .refine(function (data) { return data.critical > data.warning; }, {
    message: "Critical must be greater than warning",
    path: ["critical"],
});
exports.UpdateDeviceThresholdsSchema = zod_1.z.object({
    thresholds: zod_1.z.array(exports.DeviceThresholdSchema),
});
