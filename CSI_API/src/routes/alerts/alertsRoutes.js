"use strict";
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
var alertsValidationSchemas_1 = require("./alertsValidationSchemas");
// Function to determine device status based on highest alert severity
function updateDeviceStatusFromAlerts(deviceId) {
    return __awaiter(this, void 0, void 0, function () {
        var deviceAlerts, newStatus, severityPriority, highestSeverity, highestPriority, _i, deviceAlerts_1, alert_1, priority, severityToStatus, devices, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.alerts)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.alerts.deviceId, deviceId), (0, drizzle_orm_1.eq)(schema_1.alerts.acknowledged, 0)))
                            .orderBy(schema_1.alerts.createdAt)];
                case 1:
                    deviceAlerts = _a.sent();
                    newStatus = "normal";
                    if (deviceAlerts.length > 0) {
                        severityPriority = {
                            CRITICAL: 4,
                            SERIOUS: 3,
                            CAUTION: 2,
                            INFO: 1,
                        };
                        highestSeverity = "INFO";
                        highestPriority = 0;
                        for (_i = 0, deviceAlerts_1 = deviceAlerts; _i < deviceAlerts_1.length; _i++) {
                            alert_1 = deviceAlerts_1[_i];
                            priority = severityPriority[alert_1.severity] ||
                                0;
                            if (priority > highestPriority) {
                                highestPriority = priority;
                                highestSeverity = alert_1.severity;
                            }
                        }
                        severityToStatus = {
                            CRITICAL: "critical",
                            SERIOUS: "serious",
                            CAUTION: "caution",
                            INFO: "normal",
                        };
                        newStatus =
                            severityToStatus[highestSeverity] ||
                                "normal";
                    }
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("../../db/schema"); })];
                case 2:
                    devices = (_a.sent()).devices;
                    return [4 /*yield*/, db_1.db
                            .update(devices)
                            .set({
                            status: newStatus,
                            updatedAt: new Date().toISOString(),
                        })
                            .where((0, drizzle_orm_1.eq)(devices.id, deviceId))];
                case 3:
                    _a.sent();
                    console.log("Device ".concat(deviceId, " status updated to: ").concat(newStatus));
                    return [2 /*return*/, newStatus];
                case 4:
                    error_1 = _a.sent();
                    console.error("Error updating device ".concat(deviceId, " status:"), error_1);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
var app = new hono_1.Hono();
app.get("/count", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var alertCount, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.db
                        .select({ count: (0, drizzle_orm_1.count)(schema_1.alerts.id) })
                        .from(schema_1.alerts)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.alerts.acknowledged, 0), (0, drizzle_orm_1.eq)(schema_1.alerts.isResolved, false)))];
            case 1:
                alertCount = _a.sent();
                return [2 /*return*/, c.json({ count: alertCount[0].count })];
            case 2:
                error_2 = _a.sent();
                console.error("Error fetching alert count:", error_2);
                return [2 /*return*/, c.json({ error: "Failed to fetch alert count" }, 500)];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get all critical alerts
app.get("/critical", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var criticalAlerts, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.db
                        .select()
                        .from(schema_1.alerts)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.alerts.severity, "CRITICAL"), (0, drizzle_orm_1.eq)(schema_1.alerts.acknowledged, 0), (0, drizzle_orm_1.eq)(schema_1.alerts.isResolved, false) // Only get unacknowledged critical alerts
                    ))
                        .orderBy(schema_1.alerts.createdAt)];
            case 1:
                criticalAlerts = _a.sent();
                return [2 /*return*/, c.json(criticalAlerts)];
            case 2:
                error_3 = _a.sent();
                console.error("Error fetching critical alerts:", error_3);
                return [2 /*return*/, c.json({ error: "Failed to fetch critical alerts" }, 500)];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get all unacknowledged alerts
app.get("/", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var unacknowledgedAlerts, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.db
                        .select()
                        .from(schema_1.alerts)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.alerts.acknowledged, 0), (0, drizzle_orm_1.eq)(schema_1.alerts.isResolved, false) // Only get unacknowledged critical alerts
                    ))
                        .orderBy(schema_1.alerts.createdAt)];
            case 1:
                unacknowledgedAlerts = _a.sent();
                return [2 /*return*/, c.json(unacknowledgedAlerts)];
            case 2:
                error_4 = _a.sent();
                console.error("Error fetching unacknowledged alerts:", error_4);
                return [2 /*return*/, c.json({ error: "Failed to fetch unacknowledged alerts" }, 500)];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get all alerts including acknowledged ones (for debugging/history)
app.get("/all", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var allAlerts, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.db
                        .select()
                        .from(schema_1.alerts)
                        .orderBy(function (a) { return a.createdAt; })
                        .limit(200)];
            case 1:
                allAlerts = _a.sent();
                return [2 /*return*/, c.json(allAlerts)];
            case 2:
                error_5 = _a.sent();
                console.error("Error fetching all alerts:", error_5);
                return [2 /*return*/, c.json({ error: "Failed to fetch all alerts" }, 500)];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get alert by ID
app.get("/:id", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var id, alertResult, alert_2, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = parseInt(c.req.param("id"));
                if (isNaN(id)) {
                    return [2 /*return*/, c.json({ error: "Invalid alert ID" }, 400)];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db_1.db
                        .select()
                        .from(schema_1.alerts)
                        .where((0, drizzle_orm_1.eq)(schema_1.alerts.id, id))
                        .limit(1)];
            case 2:
                alertResult = _a.sent();
                alert_2 = alertResult[0];
                if (!alert_2) {
                    return [2 /*return*/, c.json({ error: "Alert not found" }, 404)];
                }
                return [2 /*return*/, c.json(alert_2)];
            case 3:
                error_6 = _a.sent();
                console.error("Error fetching alert:", error_6);
                return [2 /*return*/, c.json({ error: "Failed to fetch alert" }, 500)];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Create a new alert
app.post("/", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var body, validation, newAlertResult, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, c.req.json()];
            case 1:
                body = _a.sent();
                validation = alertsValidationSchemas_1.CreateAlertSchema.safeParse(body);
                if (!validation.success) {
                    return [2 /*return*/, c.json({ error: "Invalid input", details: validation.error.issues }, 400)];
                }
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, db_1.db
                        .insert(schema_1.alerts)
                        .values(validation.data)
                        .returning()];
            case 3:
                newAlertResult = _a.sent();
                if (newAlertResult.length === 0) {
                    return [2 /*return*/, c.json({ error: "Failed to create alert" }, 500)];
                }
                return [2 /*return*/, c.json(newAlertResult[0], 201)];
            case 4:
                error_7 = _a.sent();
                console.error("Error creating alert:", error_7);
                return [2 /*return*/, c.json({ error: "Failed to create alert" }, 500)];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Update an alert
app.put("/:id", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var id, body, validation, updatedAlertResult, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = parseInt(c.req.param("id"));
                if (isNaN(id)) {
                    return [2 /*return*/, c.json({ error: "Invalid alert ID" }, 400)];
                }
                return [4 /*yield*/, c.req.json()];
            case 1:
                body = _a.sent();
                validation = alertsValidationSchemas_1.UpdateAlertSchema.safeParse(body);
                if (!validation.success) {
                    return [2 /*return*/, c.json({ error: "Invalid input", details: validation.error.issues }, 400)];
                }
                if (Object.keys(validation.data).length === 0) {
                    return [2 /*return*/, c.json({ error: "No fields to update" }, 400)];
                }
                _a.label = 2;
            case 2:
                _a.trys.push([2, 6, , 7]);
                return [4 /*yield*/, db_1.db
                        .update(schema_1.alerts)
                        .set(validation.data)
                        .where((0, drizzle_orm_1.eq)(schema_1.alerts.id, id))
                        .returning()];
            case 3:
                updatedAlertResult = _a.sent();
                if (updatedAlertResult.length === 0) {
                    return [2 /*return*/, c.json({ error: "Alert not found or no changes made" }, 404)];
                }
                if (!(validation.data.acknowledged === 1 && updatedAlertResult[0].deviceId)) return [3 /*break*/, 5];
                return [4 /*yield*/, updateDeviceStatusFromAlerts(updatedAlertResult[0].deviceId)];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: return [2 /*return*/, c.json(updatedAlertResult[0])];
            case 6:
                error_8 = _a.sent();
                console.error("Error updating alert:", error_8);
                return [2 /*return*/, c.json({ error: "Failed to update alert" }, 500)];
            case 7: return [2 /*return*/];
        }
    });
}); });
// Delete an alert
app.delete("/:id", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var id, deletedAlert, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = parseInt(c.req.param("id"));
                if (isNaN(id)) {
                    return [2 /*return*/, c.json({ error: "Invalid alert ID" }, 400)];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db_1.db
                        .delete(schema_1.alerts)
                        .where((0, drizzle_orm_1.eq)(schema_1.alerts.id, id))
                        .returning({ id: schema_1.alerts.id })];
            case 2:
                deletedAlert = _a.sent();
                if (deletedAlert.length === 0) {
                    return [2 /*return*/, c.json({ error: "Alert not found" }, 404)];
                }
                return [2 /*return*/, c.json({
                        message: "Alert deleted successfully",
                        alertId: deletedAlert[0].id,
                    })];
            case 3:
                error_9 = _a.sent();
                console.error("Error deleting alert:", error_9);
                return [2 /*return*/, c.json({ error: "Failed to delete alert" }, 500)];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = app;
