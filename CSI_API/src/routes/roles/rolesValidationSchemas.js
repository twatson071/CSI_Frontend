"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRoleSchema = exports.RoleSchema = void 0;
var zod_1 = require("zod");
exports.RoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Role name is required"),
    permissions: zod_1.z.string().min(1, "Permissions are required"),
});
exports.UpdateRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Role name is required").optional(),
    permissions: zod_1.z.string().min(1, "Permissions are required").optional(),
});
