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
exports.updateDeviceStatusFromAlerts = updateDeviceStatusFromAlerts;
var db_1 = require("../db");
var schema_1 = require("../db/schema");
var drizzle_orm_1 = require("drizzle-orm");
var deviceRoutes_1 = require("../routes/devices/deviceRoutes");
var alertNotificationService_1 = require("../services/alertNotificationService");
// Add threshold evaluation function
function evaluateThresholds(deviceId, metricType, value, metricId) {
    return __awaiter(this, void 0, void 0, function () {
        var thresholds, and;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // First, check for auto-resolution of existing alerts
                return [4 /*yield*/, checkAndResolveAlerts(deviceId, metricType, value)];
                case 1:
                    // First, check for auto-resolution of existing alerts
                    _a.sent();
                    return [4 /*yield*/, db_1.db.select().from(schema_1.metricThresholds)];
                case 2:
                    thresholds = _a.sent(), and = (void 0).where;
                    ((0, drizzle_orm_1.eq)(schema_1.metricThresholds.deviceId, deviceId),
                        (0, drizzle_orm_1.eq)(schema_1.metricThresholds.metricType, metricType),
                        (0, drizzle_orm_1.eq)(schema_1.metricThresholds.isActive, 1)),
                    ;
                    return [2 /*return*/];
            }
        });
    });
}
;
for (var _i = 0, thresholds_1 = thresholds; _i < thresholds_1.length; _i++) {
    var threshold = thresholds_1[_i];
    var criticalThreshold = threshold.criticalThreshold, seriousThreshold = threshold.seriousThreshold, cautionThreshold = threshold.cautionThreshold, operator = threshold.operator;
    // Check critical threshold first (highest priority)
    if (criticalThreshold !== null && criticalThreshold !== undefined) {
        var exceedsCritical = false;
        switch (operator) {
            case "greater_than":
                exceedsCritical = value > criticalThreshold;
                break;
            case "less_than":
                exceedsCritical = value < criticalThreshold;
                break;
            case "equals":
                exceedsCritical = value === criticalThreshold;
                break;
            default:
                exceedsCritical = value > criticalThreshold;
        }
        if (exceedsCritical) {
            // Check if we already have a recent critical alert for this metric to avoid spam
            var recentAlert = await db_1.db.select().from(schema_1.alerts).where({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.alerts.deviceId, deviceId), (0, drizzle_orm_1.eq)(schema_1.alerts.metricId, metricId), (0, drizzle_orm_1.eq)(schema_1.alerts.thresholdId, threshold.id), (0, drizzle_orm_1.eq)(schema_1.alerts.severity, "CRITICAL"), (0, drizzle_orm_1.eq)(schema_1.alerts.acknowledged, 0)),
            });
            if (!recentAlert) {
                // Get device details for the alert message
                var device = await db_1.db.select().from(schema_1.devices).where({
                    where: (0, drizzle_orm_1.eq)(schema_1.devices.id, deviceId),
                });
                // Create critical alert
                var alertResult = await db_1.db
                    .insert(schema_1.alerts)
                    .values({
                    type: "threshold_exceeded",
                    message: "Critical threshold exceeded: ".concat((device === null || device === void 0 ? void 0 : device.name) || "Device ".concat(deviceId), " ").concat(metricType, " is ").concat(value, " (threshold: ").concat(criticalThreshold, ")"),
                    severity: "CRITICAL",
                    deviceId: deviceId,
                    siteId: (device === null || device === void 0 ? void 0 : device.siteId) || undefined,
                    metricId: metricId,
                    thresholdId: threshold.id,
                    createdAt: new Date().toISOString(),
                })
                    .returning();
                // Broadcast critical alert via WebSocket
                if (alertResult[0]) {
                    var site = (device === null || device === void 0 ? void 0 : device.siteId)
                        ? await db_1.db.select().from(schema_1.sites).where({
                            where: (0, drizzle_orm_1.eq)(schema_1.sites.id, device.siteId),
                        })
                        : null;
                    var criticalAlert = {
                        id: alertResult[0].id,
                        type: "threshold_exceeded",
                        message: alertResult[0].message,
                        severity: "CRITICAL",
                        deviceId: deviceId,
                        deviceName: device === null || device === void 0 ? void 0 : device.name,
                        siteId: (device === null || device === void 0 ? void 0 : device.siteId) || undefined,
                        siteName: site === null || site === void 0 ? void 0 : site.name,
                        metricType: metricType,
                        metricValue: value,
                        threshold: criticalThreshold,
                        timestamp: alertResult[0].createdAt || new Date().toISOString(),
                        isResolved: false,
                        acknowledged: 0,
                    };
                    (0, alertNotificationService_1.broadcastCriticalAlert)(criticalAlert);
                    (0, alertNotificationService_1.broadcastAlert)(criticalAlert);
                }
                // Update device status based on new alert
                await updateDeviceStatusFromAlerts(deviceId);
            }
            // If critical threshold is exceeded, don't check lower severity thresholds
            continue;
        }
    }
    // Check serious threshold if critical wasn't exceeded
    if (seriousThreshold !== null && seriousThreshold !== undefined) {
        var exceedsSerious = false;
        switch (operator) {
            case "greater_than":
                exceedsSerious = value > seriousThreshold;
                break;
            case "less_than":
                exceedsSerious = value < seriousThreshold;
                break;
            case "equals":
                exceedsSerious = value === seriousThreshold;
                break;
            default:
                exceedsSerious = value > seriousThreshold;
        }
        if (exceedsSerious) {
            // Check if we already have a recent serious alert for this metric
            var recentAlert = await db_1.db.select().from(schema_1.alerts).where({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.alerts.deviceId, deviceId), (0, drizzle_orm_1.eq)(schema_1.alerts.metricId, metricId), (0, drizzle_orm_1.eq)(schema_1.alerts.thresholdId, threshold.id), (0, drizzle_orm_1.eq)(schema_1.alerts.severity, "SERIOUS"), (0, drizzle_orm_1.eq)(schema_1.alerts.acknowledged, 0), (0, drizzle_orm_1.eq)(schema_1.alerts.isResolved, false)),
            });
            if (!recentAlert) {
                // Get device details for the alert message
                var device = await db_1.db.select().from(schema_1.devices).where({
                    where: (0, drizzle_orm_1.eq)(schema_1.devices.id, deviceId),
                });
                // Create serious alert
                var seriousResult = await db_1.db
                    .insert(schema_1.alerts)
                    .values({
                    type: "threshold_exceeded",
                    message: "Serious threshold exceeded: ".concat((device === null || device === void 0 ? void 0 : device.name) || "Device ".concat(deviceId), " ").concat(metricType, " is ").concat(value, " (threshold: ").concat(seriousThreshold, ")"),
                    severity: "SERIOUS",
                    deviceId: deviceId,
                    siteId: (device === null || device === void 0 ? void 0 : device.siteId) || undefined,
                    metricId: metricId,
                    thresholdId: threshold.id,
                    createdAt: new Date().toISOString(),
                })
                    .returning();
                if (seriousResult[0]) {
                    var site = (device === null || device === void 0 ? void 0 : device.siteId)
                        ? await db_1.db.select().from(schema_1.sites).where({
                            where: (0, drizzle_orm_1.eq)(schema_1.sites.id, device.siteId),
                        })
                        : null;
                    var seriousAlert = {
                        id: seriousResult[0].id,
                        type: "threshold_exceeded",
                        message: seriousResult[0].message,
                        severity: "SERIOUS",
                        deviceId: deviceId,
                        deviceName: device === null || device === void 0 ? void 0 : device.name,
                        siteId: (device === null || device === void 0 ? void 0 : device.siteId) || undefined,
                        siteName: site === null || site === void 0 ? void 0 : site.name,
                        metricType: metricType,
                        metricValue: value,
                        threshold: seriousThreshold,
                        timestamp: seriousResult[0].createdAt || new Date().toISOString(),
                    };
                    (0, alertNotificationService_1.broadcastAlert)(seriousAlert);
                }
                // Update device status based on new alert
                await updateDeviceStatusFromAlerts(deviceId);
            }
            // If serious threshold is exceeded, don't check caution threshold
            continue;
        }
    }
    // Check caution threshold if neither critical nor serious were exceeded
    if (cautionThreshold !== null && cautionThreshold !== undefined) {
        var exceedsCaution = false;
        switch (operator) {
            case "greater_than":
                exceedsCaution = value > cautionThreshold;
                break;
            case "less_than":
                exceedsCaution = value < cautionThreshold;
                break;
            case "equals":
                exceedsCaution = value === cautionThreshold;
                break;
            default:
                exceedsCaution = value > cautionThreshold;
        }
        if (exceedsCaution) {
            // Check if we already have a recent caution alert for this metric
            var recentAlert = await db_1.db.select().from(schema_1.alerts).where({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.alerts.deviceId, deviceId), (0, drizzle_orm_1.eq)(schema_1.alerts.metricId, metricId), (0, drizzle_orm_1.eq)(schema_1.alerts.thresholdId, threshold.id), (0, drizzle_orm_1.eq)(schema_1.alerts.severity, "CAUTION"), (0, drizzle_orm_1.eq)(schema_1.alerts.acknowledged, 0), (0, drizzle_orm_1.eq)(schema_1.alerts.isResolved, false)),
            });
            if (!recentAlert) {
                // Get device details for the alert message
                var device = await db_1.db.select().from(schema_1.devices).where({
                    where: (0, drizzle_orm_1.eq)(schema_1.devices.id, deviceId),
                });
                // Create caution alert
                var cautionResult = await db_1.db
                    .insert(schema_1.alerts)
                    .values({
                    type: "threshold_exceeded",
                    message: "Caution threshold exceeded: ".concat((device === null || device === void 0 ? void 0 : device.name) || "Device ".concat(deviceId), " ").concat(metricType, " is ").concat(value, " (threshold: ").concat(cautionThreshold, ")"),
                    severity: "CAUTION",
                    deviceId: deviceId,
                    siteId: (device === null || device === void 0 ? void 0 : device.siteId) || undefined,
                    metricId: metricId,
                    thresholdId: threshold.id,
                    createdAt: new Date().toISOString(),
                })
                    .returning();
                if (cautionResult[0]) {
                    var site = (device === null || device === void 0 ? void 0 : device.siteId)
                        ? await db_1.db.select().from(schema_1.sites).where({
                            where: (0, drizzle_orm_1.eq)(schema_1.sites.id, device.siteId),
                        })
                        : null;
                    var cautionAlert = {
                        id: cautionResult[0].id,
                        type: "threshold_exceeded",
                        message: cautionResult[0].message,
                        severity: "CAUTION",
                        deviceId: deviceId,
                        deviceName: device === null || device === void 0 ? void 0 : device.name,
                        siteId: (device === null || device === void 0 ? void 0 : device.siteId) || undefined,
                        siteName: site === null || site === void 0 ? void 0 : site.name,
                        metricType: metricType,
                        metricValue: value,
                        threshold: cautionThreshold,
                        timestamp: cautionResult[0].createdAt || new Date().toISOString(),
                    };
                    (0, alertNotificationService_1.broadcastAlert)(cautionAlert);
                }
                // Update device status based on new alert
                await updateDeviceStatusFromAlerts(deviceId);
            }
        }
    }
}
function pollDevicesAndStore() {
    return __awaiter(this, void 0, void 0, function () {
        var allDevices, _i, allDevices_1, device, externalData, wattsValue, ampsValue, metricResult, metricResult, _a, cpus, ram, nics, drives, gpus, totalCpuUtilization, totalCpuTemp, cpuCount, _b, _c, _d, _e, cpuId, cpu, metricResult, metricResult, avgCpuUtilResult, avgCpuTempResult, memoryResult, totalNetworkSpeed, nicId, nic, networkResult, totalStorageUtilization, driveCount, driveId, drive, storageResult, totalGpuTemp, gpuCount, gpuId, gpu, gpuResult, err_1, alertErr_1;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.devices)];
                case 1:
                    allDevices = _f.sent();
                    _i = 0, allDevices_1 = allDevices;
                    _f.label = 2;
                case 2:
                    if (!(_i < allDevices_1.length)) return [3 /*break*/, 46];
                    device = allDevices_1[_i];
                    _f.label = 3;
                case 3:
                    _f.trys.push([3, 40, , 45]);
                    return [4 /*yield*/, (0, deviceRoutes_1.fetchExternalDeviceDetails)(device.serviceUrl)];
                case 4:
                    externalData = _f.sent();
                    if (!(device.type === "PDU")) return [3 /*break*/, 11];
                    if (!(externalData && externalData.sensors)) return [3 /*break*/, 11];
                    wattsValue = externalData.sensors.total_draw_w;
                    ampsValue = externalData.sensors.total_draw_a;
                    if (!(wattsValue !== undefined)) return [3 /*break*/, 8];
                    return [4 /*yield*/, db_1.db
                            .insert(schema_1.metrics)
                            .values({
                            deviceId: device.id,
                            metricType: "watts",
                            value: Number(wattsValue) || 0,
                            createdAt: new Date().toISOString(),
                        })
                            .returning()];
                case 5:
                    metricResult = _f.sent();
                    if (!metricResult[0]) return [3 /*break*/, 7];
                    return [4 /*yield*/, evaluateThresholds(device.id, "watts", Number(wattsValue) || 0, metricResult[0].id)];
                case 6:
                    _f.sent();
                    _f.label = 7;
                case 7: return [3 /*break*/, 8];
                case 8:
                    if (!(ampsValue !== undefined)) return [3 /*break*/, 11];
                    return [4 /*yield*/, db_1.db
                            .insert(schema_1.metrics)
                            .values({
                            deviceId: device.id,
                            metricType: "amps",
                            value: Number(ampsValue) || 0,
                            createdAt: new Date().toISOString(),
                        })
                            .returning()];
                case 9:
                    metricResult = _f.sent();
                    if (!metricResult[0]) return [3 /*break*/, 11];
                    return [4 /*yield*/, evaluateThresholds(device.id, "amps", Number(ampsValue) || 0, metricResult[0].id)];
                case 10:
                    _f.sent();
                    _f.label = 11;
                case 11:
                    if (!(device.type === "Server")) return [3 /*break*/, 39];
                    if (!(externalData && externalData.sensors)) return [3 /*break*/, 39];
                    _a = externalData.sensors, cpus = _a.cpus, ram = _a.ram, nics = _a.nics, drives = _a.drives, gpus = _a.gpus;
                    if (!cpus) return [3 /*break*/, 27];
                    totalCpuUtilization = 0;
                    totalCpuTemp = 0;
                    cpuCount = 0;
                    _b = cpus;
                    _c = [];
                    for (_d in _b)
                        _c.push(_d);
                    _e = 0;
                    _f.label = 12;
                case 12:
                    if (!(_e < _c.length)) return [3 /*break*/, 21];
                    _d = _c[_e];
                    if (!(_d in _b)) return [3 /*break*/, 20];
                    cpuId = _d;
                    cpu = cpus[cpuId];
                    if (!(cpu.utilization_percent !== undefined)) return [3 /*break*/, 16];
                    return [4 /*yield*/, db_1.db
                            .insert(schema_1.metrics)
                            .values({
                            deviceId: device.id,
                            metricType: "cpu_utilization_core_".concat(cpuId),
                            value: Number(cpu.utilization_percent) || 0,
                            createdAt: new Date().toISOString(),
                        })
                            .returning()];
                case 13:
                    metricResult = _f.sent();
                    if (!metricResult[0]) return [3 /*break*/, 15];
                    return [4 /*yield*/, evaluateThresholds(device.id, "cpu_utilization_core_".concat(cpuId), Number(cpu.utilization_percent) || 0, metricResult[0].id)];
                case 14:
                    _f.sent();
                    _f.label = 15;
                case 15:
                    totalCpuUtilization += Number(cpu.utilization_percent) || 0;
                    cpuCount++;
                    _f.label = 16;
                case 16:
                    if (!(cpu.temperature_c !== undefined)) return [3 /*break*/, 20];
                    return [4 /*yield*/, db_1.db
                            .insert(schema_1.metrics)
                            .values({
                            deviceId: device.id,
                            metricType: "cpu_temperature_core_".concat(cpuId),
                            value: Number(cpu.temperature_c) || 0,
                            createdAt: new Date().toISOString(),
                        })
                            .returning()];
                case 17:
                    metricResult = _f.sent();
                    if (!metricResult[0]) return [3 /*break*/, 19];
                    return [4 /*yield*/, evaluateThresholds(device.id, "cpu_temperature_core_".concat(cpuId), Number(cpu.temperature_c) || 0, metricResult[0].id)];
                case 18:
                    _f.sent();
                    _f.label = 19;
                case 19:
                    totalCpuTemp += Number(cpu.temperature_c) || 0;
                    _f.label = 20;
                case 20:
                    _e++;
                    return [3 /*break*/, 12];
                case 21:
                    if (!(cpuCount > 0)) return [3 /*break*/, 27];
                    return [4 /*yield*/, db_1.db
                            .insert(schema_1.metrics)
                            .values({
                            deviceId: device.id,
                            metricType: "cpu_utilization",
                            value: totalCpuUtilization / cpuCount,
                            createdAt: new Date().toISOString(),
                        })
                            .returning()];
                case 22:
                    avgCpuUtilResult = _f.sent();
                    if (!avgCpuUtilResult[0]) return [3 /*break*/, 24];
                    return [4 /*yield*/, evaluateThresholds(device.id, "cpu_utilization", totalCpuUtilization / cpuCount, avgCpuUtilResult[0].id)];
                case 23:
                    _f.sent();
                    _f.label = 24;
                case 24: return [4 /*yield*/, db_1.db
                        .insert(schema_1.metrics)
                        .values({
                        deviceId: device.id,
                        metricType: "cpu_temperature",
                        value: totalCpuTemp / cpuCount,
                        createdAt: new Date().toISOString(),
                    })
                        .returning()];
                case 25:
                    avgCpuTempResult = _f.sent();
                    if (!avgCpuTempResult[0]) return [3 /*break*/, 27];
                    return [4 /*yield*/, evaluateThresholds(device.id, "cpu_temperature", totalCpuTemp / cpuCount, avgCpuTempResult[0].id)];
                case 26:
                    _f.sent();
                    _f.label = 27;
                case 27:
                    if (!(ram && ram.utilization_percent !== undefined)) return [3 /*break*/, 30];
                    return [4 /*yield*/, db_1.db
                            .insert(schema_1.metrics)
                            .values({
                            deviceId: device.id,
                            metricType: "memory_utilization",
                            value: Number(ram.utilization_percent) || 0,
                            createdAt: new Date().toISOString(),
                        })
                            .returning()];
                case 28:
                    memoryResult = _f.sent();
                    if (!memoryResult[0]) return [3 /*break*/, 30];
                    return [4 /*yield*/, evaluateThresholds(device.id, "memory_utilization", Number(ram.utilization_percent) || 0, memoryResult[0].id)];
                case 29:
                    _f.sent();
                    _f.label = 30;
                case 30:
                    if (!nics) return [3 /*break*/, 33];
                    totalNetworkSpeed = 0;
                    for (nicId in nics) {
                        nic = nics[nicId];
                        if (nic.current_speed_bps !== undefined) {
                            totalNetworkSpeed += Number(nic.current_speed_bps) || 0;
                        }
                    }
                    return [4 /*yield*/, db_1.db
                            .insert(schema_1.metrics)
                            .values({
                            deviceId: device.id,
                            metricType: "network_speed",
                            value: totalNetworkSpeed,
                            createdAt: new Date().toISOString(),
                        })
                            .returning()];
                case 31:
                    networkResult = _f.sent();
                    if (!networkResult[0]) return [3 /*break*/, 33];
                    return [4 /*yield*/, evaluateThresholds(device.id, "network_speed", totalNetworkSpeed, networkResult[0].id)];
                case 32:
                    _f.sent();
                    _f.label = 33;
                case 33:
                    if (!drives) return [3 /*break*/, 36];
                    totalStorageUtilization = 0;
                    driveCount = 0;
                    for (driveId in drives) {
                        drive = drives[driveId];
                        if (drive.utilization_percent !== undefined) {
                            totalStorageUtilization +=
                                Number(drive.utilization_percent) || 0;
                            driveCount++;
                        }
                    }
                    if (!(driveCount > 0)) return [3 /*break*/, 36];
                    return [4 /*yield*/, db_1.db
                            .insert(schema_1.metrics)
                            .values({
                            deviceId: device.id,
                            metricType: "storage_utilization",
                            value: totalStorageUtilization / driveCount,
                            createdAt: new Date().toISOString(),
                        })
                            .returning()];
                case 34:
                    storageResult = _f.sent();
                    if (!storageResult[0]) return [3 /*break*/, 36];
                    return [4 /*yield*/, evaluateThresholds(device.id, "storage_utilization", totalStorageUtilization / driveCount, storageResult[0].id)];
                case 35:
                    _f.sent();
                    _f.label = 36;
                case 36:
                    if (!gpus) return [3 /*break*/, 39];
                    totalGpuTemp = 0;
                    gpuCount = 0;
                    for (gpuId in gpus) {
                        gpu = gpus[gpuId];
                        if (gpu.temperature_c !== undefined) {
                            totalGpuTemp += Number(gpu.temperature_c) || 0;
                            gpuCount++;
                        }
                    }
                    if (!(gpuCount > 0)) return [3 /*break*/, 39];
                    return [4 /*yield*/, db_1.db
                            .insert(schema_1.metrics)
                            .values({
                            deviceId: device.id,
                            metricType: "gpu_temperature",
                            value: totalGpuTemp / gpuCount,
                            createdAt: new Date().toISOString(),
                        })
                            .returning()];
                case 37:
                    gpuResult = _f.sent();
                    if (!gpuResult[0]) return [3 /*break*/, 39];
                    return [4 /*yield*/, evaluateThresholds(device.id, "gpu_temperature", totalGpuTemp / gpuCount, gpuResult[0].id)];
                case 38:
                    _f.sent();
                    _f.label = 39;
                case 39: return [3 /*break*/, 45];
                case 40:
                    err_1 = _f.sent();
                    console.error("Error polling device ".concat(device.id, " (").concat(device.name, "):"), err_1);
                    _f.label = 41;
                case 41:
                    _f.trys.push([41, 43, , 44]);
                    return [4 /*yield*/, db_1.db.insert(schema_1.alerts).values({
                            type: "polling_error",
                            message: "Error polling device ".concat(device.name, " (ID: ").concat(device.id, "): ").concat(err_1.message),
                            severity: "CRITICAL",
                            deviceId: device.id,
                            siteId: device.siteId || undefined,
                            createdAt: new Date().toISOString(),
                        })];
                case 42:
                    _f.sent();
                    return [3 /*break*/, 44];
                case 43:
                    alertErr_1 = _f.sent();
                    console.error("Failed to insert polling error alert for device ".concat(device.id, ":"), alertErr_1);
                    return [3 /*break*/, 44];
                case 44: return [3 /*break*/, 45];
                case 45:
                    _i++;
                    return [3 /*break*/, 2];
                case 46: return [2 /*return*/];
            }
        });
    });
}
// Function to check and resolve alerts
function checkAndResolveAlerts(deviceId, metricType, currentValue) {
    return __awaiter(this, void 0, void 0, function () {
        var unresolvedAlerts, and;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.alerts)];
                case 1:
                    unresolvedAlerts = _a.sent(), and = (void 0).where;
                    ((0, drizzle_orm_1.eq)(schema_1.alerts.deviceId, deviceId),
                        (0, drizzle_orm_1.eq)(schema_1.alerts.type, "threshold_exceeded"),
                        (0, drizzle_orm_1.eq)(schema_1.alerts.acknowledged, 0),
                        (0, drizzle_orm_1.eq)(schema_1.alerts.isResolved, false)),
                    ;
                    return [2 /*return*/];
            }
        });
    });
}
;
console.log("Checking ".concat(unresolvedAlerts.length, " unresolved alerts for device ").concat(deviceId, ", metric ").concat(metricType));
for (var _a = 0, unresolvedAlerts_1 = unresolvedAlerts; _a < unresolvedAlerts_1.length; _a++) {
    var alert_1 = unresolvedAlerts_1[_a];
    // Get the threshold information separately if relation isn't working
    var threshold = await db_1.db.select().from(schema_1.metricThresholds).where({
        where: (0, drizzle_orm_1.eq)(schema_1.metricThresholds.id, alert_1.thresholdId),
    });
    if (!threshold) {
        console.log("No threshold found for alert ".concat(alert_1.id, ", thresholdId: ").concat(alert_1.thresholdId));
        continue;
    }
    // Only check alerts that match the current metric type
    if (threshold.metricType !== metricType) {
        continue;
    }
    var operator = threshold.operator;
    var shouldResolve = false;
    // Check if current value no longer violates the threshold
    switch (alert_1.severity) {
        case "CRITICAL":
            if (threshold.criticalThreshold !== null) {
                shouldResolve = !exceedsThreshold(currentValue, threshold.criticalThreshold, operator);
            }
            break;
        case "SERIOUS":
            if (threshold.seriousThreshold !== null) {
                shouldResolve = !exceedsThreshold(currentValue, threshold.seriousThreshold, operator);
            }
            break;
        case "CAUTION":
            if (threshold.cautionThreshold !== null) {
                shouldResolve = !exceedsThreshold(currentValue, threshold.cautionThreshold, operator);
            }
            break;
    }
    if (shouldResolve) {
        console.log("Auto-resolving alert ".concat(alert_1.id, " for device ").concat(deviceId, ", metric ").concat(metricType));
        // Auto-resolve the alert
        await db_1.db
            .update(schema_1.alerts)
            .set({
            isResolved: true,
            resolvedAt: new Date().toISOString(),
            resolutionReason: "auto_resolved",
        })
            .where((0, drizzle_orm_1.eq)(schema_1.alerts.id, alert_1.id));
        // Broadcast resolution notification
        (0, alertNotificationService_1.broadcastAlertResolution)(alert_1.id, "auto_resolved");
    }
}
// Update device status after resolving alerts
await updateDeviceStatusFromAlerts(deviceId);
// Helper function to check if value exceeds threshold
function exceedsThreshold(value, threshold, operator) {
    switch (operator) {
        case "greater_than":
            return value > threshold;
        case "less_than":
            return value < threshold;
        case "equals":
            return value === threshold;
        default:
            return value > threshold;
    }
}
// Update the device status function to only consider unresolved alerts
function updateDeviceStatusFromAlerts(deviceId) {
    return __awaiter(this, void 0, void 0, function () {
        var deviceAlerts, and_1, newStatus, severityPriority, highestSeverity, highestPriority, _i, deviceAlerts_1, alert_2, priority, severityToStatus;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, , 2, 3]);
                    return [4 /*yield*/, db_1.db.select().from(schema_1.alerts)];
                case 1:
                    deviceAlerts = _a.sent(), and_1 = (void 0).where;
                    ((0, drizzle_orm_1.eq)(schema_1.alerts.deviceId, deviceId),
                        (0, drizzle_orm_1.eq)(schema_1.alerts.acknowledged, 0),
                        (0, drizzle_orm_1.eq)(schema_1.alerts.isResolved, false) // Only consider unresolved alerts
                    ),
                        orderBy;
                    (function (a, _a) {
                        var desc = _a.desc;
                        return desc(a.createdAt);
                    },
                    );
                    return [3 /*break*/, 3];
                case 2: return [7 /*endfinally*/];
                case 3:
                    ;
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
                            alert_2 = deviceAlerts_1[_i];
                            priority = severityPriority[alert_2.severity] ||
                                0;
                            if (priority > highestPriority) {
                                highestPriority = priority;
                                highestSeverity = alert_2.severity;
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
                    // Update device status in database
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.devices)
                            .set({
                            status: newStatus,
                            updatedAt: new Date().toISOString(),
                        })
                            .where((0, drizzle_orm_1.eq)(schema_1.devices.id, deviceId))];
                case 4:
                    // Update device status in database
                    _a.sent();
                    return [2 /*return*/, newStatus];
            }
        });
    });
}
try { }
catch (error) {
    console.error("Error updating device ".concat(deviceId, " status:"), error);
    return null;
}
console.log("Initial device poll starting...");
pollDevicesAndStore().catch(function (err) {
    console.error("Error during initial device poll:", err);
});
var POLLING_INTERVAL_MS = 30 * 1000; // 30 seconds
setInterval(function () {
    pollDevicesAndStore().catch(function (err) {
        console.error("Error during scheduled device poll:", err);
    });
}, POLLING_INTERVAL_MS);
