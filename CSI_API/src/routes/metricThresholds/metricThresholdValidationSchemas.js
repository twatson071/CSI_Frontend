"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMetricThresholdSchema = exports.CreateMetricThresholdSchema = void 0;
var zod_1 = require("zod");
exports.CreateMetricThresholdSchema = zod_1.z.object({
    deviceId: zod_1.z.number(),
    metricType: zod_1.z.string(),
    cautionThreshold: zod_1.z.number().optional(),
    seriousThreshold: zod_1.z.number().optional(),
    criticalThreshold: zod_1.z.number().optional(),
    operator: zod_1.z.enum(["greater_than", "less_than", "equals"]).optional(),
    isActive: zod_1.z.number().optional(),
});
exports.UpdateMetricThresholdSchema = exports.CreateMetricThresholdSchema.partial();
