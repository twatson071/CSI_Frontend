"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var hono_1 = require("hono");
var db_1 = require("../../db");
var schema_1 = require("../../db/schema");
var drizzle_orm_1 = require("drizzle-orm");
var userValidationSchemas_1 = require("./userValidationSchemas"); // Updated import
var app = new hono_1.Hono();
// Get all users
app.get("/", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var allUsers, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.db.select().from(schema_1.users).orderBy((0, drizzle_orm_1.asc)(schema_1.users.id))];
            case 1:
                allUsers = _a.sent();
                // const validation = z.array(UserResponseSchema).safeParse(allUsers); // Response validation can be added
                // if (!validation.success) {
                //   console.error("Error validating all users response:", validation.error.issues);
                //   return c.json({ error: "Internal server error during response validation" }, 500);
                // }
                return [2 /*return*/, c.json(allUsers.map(function (u) { return ({
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        roleId: u.roleId,
                        createdAt: u.createdAt,
                        updatedAt: u.updatedAt,
                    }); }))]; // Selectively return fields
            case 2:
                error_1 = _a.sent();
                console.error("Error fetching users:", error_1);
                return [2 /*return*/, c.json({ error: "Failed to fetch users" }, 500)];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get user by ID
app.get("/:id", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var id, user, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = parseInt(c.req.param("id"));
                if (isNaN(id)) {
                    return [2 /*return*/, c.json({ error: "Invalid user ID" }, 400)];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db_1.db.select().from(schema_1.users).where({
                        where: (0, drizzle_orm_1.eq)(schema_1.users.id, id),
                    })];
            case 2:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, c.json({ error: "User not found" }, 404)];
                }
                // const validation = UserResponseSchema.safeParse(user); // Response validation
                // if (!validation.success) {
                //   console.error("Error validating user response:", validation.error.issues);
                //   return c.json({ error: "Internal server error during response validation" }, 500);
                // }
                return [2 /*return*/, c.json({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        roleId: user.roleId,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                    })]; // Selectively return fields
            case 3:
                error_2 = _a.sent();
                console.error("Error fetching user:", error_2);
                return [2 /*return*/, c.json({ error: "Failed to fetch user" }, 500)];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Create a new user
app.post("/", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var body, validation, _a, name, email, passwordHash, roleId, existingUser, newUserResult, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, c.req.json()];
            case 1:
                body = _b.sent();
                validation = userValidationSchemas_1.CreateUserSchema.safeParse(body);
                if (!validation.success) {
                    return [2 /*return*/, c.json({ error: "Invalid input", details: validation.error.issues }, 400)];
                }
                _a = validation.data, name = _a.name, email = _a.email, passwordHash = _a.passwordHash, roleId = _a.roleId;
                _b.label = 2;
            case 2:
                _b.trys.push([2, 5, , 6]);
                return [4 /*yield*/, db_1.db.select().from(schema_1.users).where({
                        where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
                    })];
            case 3:
                existingUser = _b.sent();
                if (existingUser) {
                    return [2 /*return*/, c.json({ error: "Email already in use" }, 409)];
                }
                return [4 /*yield*/, db_1.db
                        .insert(schema_1.users)
                        .values({
                        name: name,
                        email: email,
                        passwordHash: passwordHash,
                        roleId: roleId,
                    })
                        .returning({
                        id: schema_1.users.id,
                        name: schema_1.users.name,
                        email: schema_1.users.email,
                        roleId: schema_1.users.roleId,
                        createdAt: schema_1.users.createdAt,
                        updatedAt: schema_1.users.updatedAt,
                    })];
            case 4:
                newUserResult = _b.sent();
                if (newUserResult.length === 0) {
                    return [2 /*return*/, c.json({ error: "Failed to create user" }, 500)];
                }
                // const responseValidation = UserResponseSchema.safeParse(newUserResult[0]); // Response validation
                // if (!responseValidation.success) {
                //   console.error("Error validating create user response:", responseValidation.error.issues);
                //   return c.json({ error: "Internal server error during response validation" }, 500);
                // }
                return [2 /*return*/, c.json(newUserResult[0], 201)];
            case 5:
                error_3 = _b.sent();
                console.error("Error creating user:", error_3);
                return [2 /*return*/, c.json({ error: "Failed to create user" }, 500)];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Update a user
app.put("/:id", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var id, body, validation, dataToUpdate, currentUser, existingUserWithEmail, updatedUserResult, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = parseInt(c.req.param("id"));
                if (isNaN(id)) {
                    return [2 /*return*/, c.json({ error: "Invalid user ID" }, 400)];
                }
                return [4 /*yield*/, c.req.json()];
            case 1:
                body = _a.sent();
                validation = userValidationSchemas_1.UpdateUserSchema.safeParse(body);
                if (!validation.success) {
                    return [2 /*return*/, c.json({ error: "Invalid input", details: validation.error.issues }, 400)];
                }
                if (Object.keys(validation.data).length === 0) {
                    return [2 /*return*/, c.json({ error: "No fields to update" }, 400)];
                }
                dataToUpdate = validation.data;
                if (!dataToUpdate.email) return [3 /*break*/, 4];
                return [4 /*yield*/, db_1.db.select().from(schema_1.users).where({
                        where: (0, drizzle_orm_1.eq)(schema_1.users.id, id),
                    })];
            case 2:
                currentUser = _a.sent();
                if (!currentUser) {
                    return [2 /*return*/, c.json({ error: "User not found" }, 404)];
                }
                if (!(currentUser.email !== dataToUpdate.email)) return [3 /*break*/, 4];
                return [4 /*yield*/, db_1.db.select().from(schema_1.users).where({
                        where: (0, drizzle_orm_1.eq)(schema_1.users.email, dataToUpdate.email),
                    })];
            case 3:
                existingUserWithEmail = _a.sent();
                if (existingUserWithEmail) {
                    return [2 /*return*/, c.json({ error: "Email already in use by another account" }, 409)];
                }
                _a.label = 4;
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, db_1.db
                        .update(schema_1.users)
                        .set(dataToUpdate)
                        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
                        .returning({
                        id: schema_1.users.id,
                        name: schema_1.users.name,
                        email: schema_1.users.email,
                        roleId: schema_1.users.roleId,
                        createdAt: schema_1.users.createdAt,
                        updatedAt: schema_1.users.updatedAt,
                    })];
            case 5:
                updatedUserResult = _a.sent();
                if (updatedUserResult.length === 0) {
                    return [2 /*return*/, c.json({ error: "User not found or no changes made" }, 404)];
                }
                // const responseValidation = UserResponseSchema.safeParse(updatedUserResult[0]); // Response validation
                // if (!responseValidation.success) {
                //   console.error("Error validating update user response:", responseValidation.error.issues);
                //   return c.json({ error: "Internal server error during response validation" }, 500);
                // }
                return [2 /*return*/, c.json(updatedUserResult[0])];
            case 6:
                error_4 = _a.sent();
                console.error("Error updating user:", error_4);
                return [2 /*return*/, c.json({ error: "Failed to update user" }, 500)];
            case 7: return [2 /*return*/];
        }
    });
}); });
// Delete a user
app.delete("/:id", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var id, deletedUser, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = parseInt(c.req.param("id"));
                if (isNaN(id)) {
                    return [2 /*return*/, c.json({ error: "Invalid user ID" }, 400)];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db_1.db
                        .delete(schema_1.users)
                        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
                        .returning({ id: schema_1.users.id })];
            case 2:
                deletedUser = _a.sent();
                if (deletedUser.length === 0) {
                    return [2 /*return*/, c.json({ error: "User not found" }, 404)];
                }
                return [2 /*return*/, c.json({
                        message: "User deleted successfully",
                        userId: deletedUser[0].id,
                    })];
            case 3:
                error_5 = _a.sent();
                console.error("Error deleting user:", error_5);
                return [2 /*return*/, c.json({ error: "Failed to delete user" }, 500)];
            case 4: return [2 /*return*/];
        }
    });
}); });
// --- Notification Preferences Endpoints ---
// Default notification types
var DEFAULT_NOTIFICATION_PREFERENCES = {
    alerts: true,
    critical: true,
    device: true,
    info: true,
    system: true,
};
// Get user notification preferences
app.get("/:id/preferences", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var id, user, prefs, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = parseInt(c.req.param("id"));
                if (isNaN(id)) {
                    return [2 /*return*/, c.json({ error: "Invalid user ID" }, 400)];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db_1.db.select().from(schema_1.users).where({ where: (0, drizzle_orm_1.eq)(schema_1.users.id, id) })];
            case 2:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, c.json({ error: "User not found" }, 404)];
                }
                prefs = user.notificationPreferences;
                if (!prefs || Object.keys(prefs).length === 0) {
                    prefs = DEFAULT_NOTIFICATION_PREFERENCES;
                }
                else {
                    // Fill in any missing keys with defaults
                    prefs = __assign(__assign({}, DEFAULT_NOTIFICATION_PREFERENCES), prefs);
                }
                return [2 /*return*/, c.json(prefs)];
            case 3:
                error_6 = _a.sent();
                console.error("Error fetching notification preferences:", error_6);
                return [2 /*return*/, c.json({ error: "Failed to fetch notification preferences" }, 500)];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Update user notification preferences
app.put("/:id/preferences", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var id, body, allowedKeys, isValid, updated, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = parseInt(c.req.param("id"));
                if (isNaN(id)) {
                    return [2 /*return*/, c.json({ error: "Invalid user ID" }, 400)];
                }
                return [4 /*yield*/, c.req.json()];
            case 1:
                body = _a.sent();
                allowedKeys = Object.keys(DEFAULT_NOTIFICATION_PREFERENCES);
                isValid = typeof body === "object" &&
                    Object.keys(body).every(function (k) { return allowedKeys.includes(k) && typeof body[k] === "boolean"; });
                if (!isValid) {
                    return [2 /*return*/, c.json({ error: "Invalid preferences format" }, 400)];
                }
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, db_1.db
                        .update(schema_1.users)
                        .set({ notificationPreferences: body })
                        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
                        .returning({ notificationPreferences: schema_1.users.notificationPreferences })];
            case 3:
                updated = _a.sent();
                if (updated.length === 0) {
                    return [2 /*return*/, c.json({ error: "User not found" }, 404)];
                }
                return [2 /*return*/, c.json(updated[0].notificationPreferences)];
            case 4:
                error_7 = _a.sent();
                console.error("Error updating notification preferences:", error_7);
                return [2 /*return*/, c.json({ error: "Failed to update notification preferences" }, 500)];
            case 5: return [2 /*return*/];
        }
    });
}); });
exports.default = app;
