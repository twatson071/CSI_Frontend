"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePduSchema = exports.PduResponseSchema = exports.PduSchema = void 0;
var zod_1 = require("zod");
// Basic PDU Schema - adjust as needed
exports.PduSchema = zod_1.z.object({
    pduId: zod_1.z.number(),
    name: zod_1.z.string(),
    // Add other PDU-specific fields here
});
// Example for a response schema
exports.PduResponseSchema = exports.PduSchema;
// Example for a request body schema
exports.CreatePduSchema = exports.PduSchema.omit({ pduId: true });
