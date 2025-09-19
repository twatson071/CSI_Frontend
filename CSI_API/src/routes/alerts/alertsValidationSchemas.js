"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAlertSchema = exports.CreateAlertSchema = exports.AlertSeverityEnum = void 0;
var zod_1 = require("zod");
exports.AlertSeverityEnum = zod_1.z.enum([
    "INFO",
    "CAUTION",
    "SERIOUS",
    "CRITICAL",
]);
exports.CreateAlertSchema = zod_1.z.object({
    type: zod_1.z.string(),
    message: zod_1.z.string(),
    severity: exports.AlertSeverityEnum,
    deviceId: zod_1.z.number().int().optional(),
    siteId: zod_1.z.number().int().optional(),
});
exports.UpdateAlertSchema = exports.CreateAlertSchema.partial().extend({
    acknowledged: zod_1.z.number().int().optional(),
    acknowledgedBy: zod_1.z.number().int().optional(),
    acknowledgedAt: zod_1.z.string().optional(),
});
