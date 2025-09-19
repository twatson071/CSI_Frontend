"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSchema = exports.CreateUserSchema = exports.UserResponseSchema = exports.UserSchema = void 0;
var zod_1 = require("zod");
// Basic User Schema - adjust as needed
exports.UserSchema = zod_1.z.object({
    userId: zod_1.z.number(),
    name: zod_1.z.string(), // Changed from username
    email: zod_1.z.string().email(),
    roleId: zod_1.z.number().optional(), // Added roleId
    // passwordHash should generally not be sent in responses
});
// Example for a response schema
exports.UserResponseSchema = exports.UserSchema;
// Example for a request body schema
exports.CreateUserSchema = zod_1.z.object({
    name: zod_1.z.string(), // Changed from username
    email: zod_1.z.string().email(),
    passwordHash: zod_1.z.string(), // Added passwordHash
    roleId: zod_1.z.number().optional(), // Added roleId
});
exports.UpdateUserSchema = exports.CreateUserSchema.partial(); // Schema for updates
