"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SitesWithDevicesResponseSchema = exports.SiteWithDevicesSchema = exports.CreateSitePayloadSchema = exports.DeviceSchema = void 0;
var zod_1 = require("zod");
exports.DeviceSchema = zod_1.z.object({
    deviceId: zod_1.z.number(),
    name: zod_1.z.string(),
    type: zod_1.z.string(),
    serviceUrl: zod_1.z.string(),
    status: zod_1.z.string(),
    data: zod_1.z.any().nullable(),
});
exports.CreateSitePayloadSchema = zod_1.z.object({
    name: zod_1.z.string(),
    location: zod_1.z.string(),
});
exports.SiteWithDevicesSchema = zod_1.z.object({
    siteId: zod_1.z.number(),
    siteName: zod_1.z.string(),
    devices: zod_1.z.array(exports.DeviceSchema),
});
exports.SitesWithDevicesResponseSchema = zod_1.z.array(exports.SiteWithDevicesSchema);
