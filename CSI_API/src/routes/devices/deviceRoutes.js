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
exports.fetchExternalDeviceDetails = fetchExternalDeviceDetails;
var hono_1 = require("hono");
var drizzle_orm_1 = require("drizzle-orm");
require("dotenv/config");
var db_1 = require("../../db");
var schema_1 = require("../../db/schema");
var deviceValidationSchemas_1 = require("./deviceValidationSchemas");
var alertNotificationService_1 = require("../../services/alertNotificationService");
var app = new hono_1.Hono();
var FAKE_SERVER_URL = "mock/server";
function getDevice(c) {
    return __awaiter(this, void 0, void 0, function () {
        var allDevices;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.devices)];
                case 1:
                    allDevices = _a.sent();
                    return [2 /*return*/, c.json(allDevices)];
            }
        });
    });
}
function getServiceList(c, method) {
    return __awaiter(this, void 0, void 0, function () {
        var EXTERNAL_BASE_URL, SYSTEM_OPERATOR_KEY, HUB_KEY, response, externalServices, usedDeviceUrls, usedUrlsSet_1, availableServices, error_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    EXTERNAL_BASE_URL = process.env.EXTERNAL_BASE_URL;
                    SYSTEM_OPERATOR_KEY = process.env.SYSTEM_OPERATOR_KEY;
                    HUB_KEY = process.env.HUB_KEY;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch("".concat(EXTERNAL_BASE_URL, "/services"), {
                            method: method,
                            headers: {
                                "X-API-Key-CSI-Maestro-SystemOperator": SYSTEM_OPERATOR_KEY,
                                "X-API-Key-CSI-Maestro-Hub": HUB_KEY,
                                "Content-Type": "application/json",
                            },
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch services: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    externalServices = _a.sent();
                    if (!Array.isArray(externalServices)) {
                        console.error("External services response is not an array:", externalServices);
                        return [2 /*return*/, c.json({ error: "Invalid format for external services list" }, 500)];
                    }
                    return [4 /*yield*/, db_1.db
                            .selectDistinct({ serviceUrl: schema_1.devices.serviceUrl })
                            .from(schema_1.devices)
                            .where((0, drizzle_orm_1.eq)(schema_1.devices.serviceUrl, schema_1.devices.serviceUrl))];
                case 4:
                    usedDeviceUrls = _a.sent();
                    usedUrlsSet_1 = new Set(usedDeviceUrls
                        .map(function (device) { return device.serviceUrl; })
                        .filter(function (url) { return typeof url === "string" && url.length > 0; }));
                    availableServices = externalServices.filter(function (serviceName) {
                        return typeof serviceName === "string" && !usedUrlsSet_1.has(serviceName);
                    });
                    if (!usedUrlsSet_1.has(FAKE_SERVER_URL)) {
                        availableServices.push(FAKE_SERVER_URL);
                    }
                    return [2 /*return*/, c.json(availableServices)];
                case 5:
                    error_1 = _a.sent();
                    console.error("Error fetching or processing services:", error_1);
                    errorMessage = error_1 instanceof Error ? error_1.message : "Failed to fetch services";
                    return [2 /*return*/, c.json({ error: errorMessage }, 500)];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function updateDevice(c) {
    return __awaiter(this, void 0, void 0, function () {
        var deviceId, body, validation, dataToUpdate, updatedDevice, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    deviceId = parseInt(c.req.param("id"));
                    if (isNaN(deviceId)) {
                        return [2 /*return*/, c.json({ error: "Invalid device ID" }, 400)];
                    }
                    return [4 /*yield*/, c.req.json()];
                case 1:
                    body = _a.sent();
                    validation = deviceValidationSchemas_1.UpdateDeviceSchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, c.json({ error: "Invalid input", details: validation.error.issues }, 400)];
                    }
                    dataToUpdate = {};
                    // Only include fields that are present in the validated data
                    if (validation.data.name !== undefined)
                        dataToUpdate.name = validation.data.name;
                    if (validation.data.type !== undefined)
                        dataToUpdate.type = validation.data.type;
                    if (validation.data.serviceUrl !== undefined)
                        dataToUpdate.serviceUrl = validation.data.serviceUrl;
                    if (validation.data.siteId !== undefined)
                        dataToUpdate.siteId = validation.data.siteId;
                    if (validation.data.parameters !== undefined)
                        dataToUpdate.parameters = validation.data.parameters; // Adjust type as per schema.ts
                    if (validation.data.data !== undefined)
                        dataToUpdate.data = validation.data.data; // Adjust type as per schema.ts
                    if (validation.data.ipAddress !== undefined)
                        dataToUpdate.ipAddress = validation.data.ipAddress;
                    if (validation.data.status !== undefined)
                        dataToUpdate.status = validation.data.status;
                    if (Object.keys(dataToUpdate).length === 0) {
                        return [2 /*return*/, c.json({ error: "No valid fields to update" }, 400)];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.devices)
                            .set(dataToUpdate)
                            .where((0, drizzle_orm_1.eq)(schema_1.devices.id, deviceId))
                            .returning()];
                case 3:
                    updatedDevice = _a.sent();
                    if (updatedDevice.length === 0) {
                        return [2 /*return*/, c.json({ error: "Device not found" }, 404)];
                    }
                    return [2 /*return*/, c.json(updatedDevice[0])];
                case 4:
                    error_2 = _a.sent();
                    console.error("Error updating device:", error_2);
                    return [2 /*return*/, c.json({ error: "Failed to update device" }, 500)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function fetchExternalDeviceDetails(serviceUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var fullExternalUrl, fetchOptions, APP_BASE_URL, EXTERNAL_BASE_URL, SYSTEM_OPERATOR_KEY, HUB_KEY, response, errorBody, externalData, existingDeviceResult, existingDevice, dbParameters, dbDataField, dbIpAddress, dbStatus, deviceType, dataToUpdate_1, dbError_1;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    fetchOptions = { method: "GET" };
                    APP_BASE_URL = "http://localhost:".concat(process.env.PORT || 3000);
                    if (serviceUrl === FAKE_SERVER_URL) {
                        fullExternalUrl = "".concat(APP_BASE_URL, "/").concat(serviceUrl);
                        fetchOptions.headers = {
                            Accept: "application/json",
                        };
                    }
                    else {
                        EXTERNAL_BASE_URL = process.env.EXTERNAL_BASE_URL;
                        SYSTEM_OPERATOR_KEY = process.env.SYSTEM_OPERATOR_KEY;
                        HUB_KEY = process.env.HUB_KEY;
                        if (!EXTERNAL_BASE_URL || !SYSTEM_OPERATOR_KEY || !HUB_KEY) {
                            console.error("External service URL or API key is not configured for non-mock service.");
                            throw new Error("External service configuration error for non-mock service.");
                        }
                        // The original logic prepends "/service/" to the serviceUrl for Maestro
                        fullExternalUrl = "".concat(EXTERNAL_BASE_URL, "/service/").concat(serviceUrl);
                        fetchOptions.headers = {
                            "X-API-Key-CSI-Maestro-SystemOperator": SYSTEM_OPERATOR_KEY,
                            "X-API-Key-CSI-Maestro-Hub": HUB_KEY,
                            Accept: "application/json",
                        };
                    }
                    console.log("Fetching details from: ".concat(fullExternalUrl));
                    return [4 /*yield*/, fetch(fullExternalUrl, fetchOptions)];
                case 1:
                    response = _e.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.text()];
                case 2:
                    errorBody = _e.sent();
                    console.error("Failed to fetch details from ".concat(fullExternalUrl, ": ").concat(response.status, " ").concat(response.statusText), errorBody);
                    throw new Error("External service request failed: ".concat(response.statusText, " (url: ").concat(fullExternalUrl, ")"));
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    externalData = _e.sent();
                    if (!externalData) return [3 /*break*/, 10];
                    _e.label = 5;
                case 5:
                    _e.trys.push([5, 9, , 10]);
                    return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.devices)
                            .where((0, drizzle_orm_1.eq)(schema_1.devices.serviceUrl, serviceUrl))
                            .limit(1)];
                case 6:
                    existingDeviceResult = _e.sent();
                    existingDevice = existingDeviceResult[0];
                    if (!existingDevice) return [3 /*break*/, 8];
                    dbParameters = {};
                    dbDataField = {};
                    dbIpAddress = existingDevice.ipAddress;
                    dbStatus = existingDevice.status || "normal";
                    deviceType = existingDevice.type;
                    if (deviceType === "PDU") {
                        dbParameters = externalData.parameters || {};
                        dbDataField = externalData; // Store the whole response
                        dbIpAddress =
                            ((_b = (_a = externalData.device) === null || _a === void 0 ? void 0 : _a.comms) === null || _b === void 0 ? void 0 : _b.ip) || existingDevice.ipAddress;
                        if ((_c = externalData.sensors) === null || _c === void 0 ? void 0 : _c.load_state) {
                            dbStatus = externalData.sensors.load_state.toLowerCase();
                        }
                        else if (((_d = externalData.parameters) === null || _d === void 0 ? void 0 : _d.ready) === "READY") {
                            dbStatus = "normal";
                        }
                        else {
                            // Keep existing status if no new status info from external data
                            dbStatus = existingDevice.status || "normal";
                        }
                    }
                    else {
                        // Generic handling for other device types
                        dbParameters = externalData.parameters || {};
                        dbDataField = externalData.data || externalData;
                        dbIpAddress = externalData.ipAddress || existingDevice.ipAddress;
                        dbStatus = externalData.status || existingDevice.status || "normal";
                    }
                    dataToUpdate_1 = {
                        parameters: dbParameters,
                        data: dbDataField,
                        ipAddress: dbIpAddress,
                        status: dbStatus,
                    };
                    Object.keys(dataToUpdate_1).forEach(function (key) {
                        if (dataToUpdate_1[key] === undefined) {
                            delete dataToUpdate_1[key];
                        }
                    });
                    if (!(Object.keys(dataToUpdate_1).length > 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, db_1.db
                            .update(schema_1.devices)
                            .set(dataToUpdate_1)
                            .where((0, drizzle_orm_1.eq)(schema_1.devices.id, existingDevice.id))];
                case 7:
                    _e.sent();
                    console.log("Device with serviceUrl ".concat(serviceUrl, " (ID: ").concat(existingDevice.id, ") updated with fetched details."));
                    _e.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    dbError_1 = _e.sent();
                    console.error("Error during DB query or update for serviceUrl ".concat(serviceUrl, ":"), dbError_1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/, externalData];
            }
        });
    });
}
function createDevice(c) {
    return __awaiter(this, void 0, void 0, function () {
        var body, clientValidation, _a, name, type, serviceUrl, siteId, externalDetails, dbParameters, dbData, dbIpAddress, dbStatus, lowerStatus, extStatus, deviceToInsert, newDevice, error_3, message;
        var _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, c.req.json()];
                case 1:
                    body = _g.sent();
                    clientValidation = deviceValidationSchemas_1.CreateDeviceClientPayloadSchema.safeParse(body);
                    if (!clientValidation.success) {
                        return [2 /*return*/, c.json({ error: "Invalid client input", details: clientValidation.error.issues }, 400)];
                    }
                    _a = clientValidation.data, name = _a.name, type = _a.type, serviceUrl = _a.serviceUrl, siteId = _a.siteId;
                    _g.label = 2;
                case 2:
                    _g.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fetchExternalDeviceDetails(serviceUrl)];
                case 3:
                    externalDetails = _g.sent();
                    dbParameters = {};
                    dbData = {};
                    dbIpAddress = null;
                    dbStatus = "normal";
                    if (type === "PDU") {
                        dbParameters = externalDetails.parameters || {};
                        dbData = externalDetails;
                        dbIpAddress = ((_c = (_b = externalDetails.device) === null || _b === void 0 ? void 0 : _b.comms) === null || _c === void 0 ? void 0 : _c.ip) || null;
                        // Determine status for PDU
                        if ((_d = externalDetails.sensors) === null || _d === void 0 ? void 0 : _d.load_state) {
                            lowerStatus = externalDetails.sensors.load_state.toLowerCase();
                            // Map external status to valid schema status
                            switch (lowerStatus) {
                                case "critical":
                                    dbStatus = "critical";
                                    break;
                                case "serious":
                                    dbStatus = "serious";
                                    break;
                                case "caution":
                                case "warning":
                                    dbStatus = "caution";
                                    break;
                                case "standby":
                                    dbStatus = "standby";
                                    break;
                                case "off":
                                    dbStatus = "off";
                                    break;
                                default:
                                    dbStatus = "normal";
                            }
                        }
                        else if (((_e = externalDetails.parameters) === null || _e === void 0 ? void 0 : _e.ready) === "READY") {
                            dbStatus = "normal";
                        }
                        else {
                            dbStatus = "normal"; // Default fallback
                        }
                    }
                    else {
                        dbParameters = externalDetails.parameters || {};
                        dbData = externalDetails.data || externalDetails;
                        dbIpAddress = externalDetails.ipAddress || null;
                        extStatus = ((_f = externalDetails.status) === null || _f === void 0 ? void 0 : _f.toLowerCase()) || "normal";
                        switch (extStatus) {
                            case "critical":
                                dbStatus = "critical";
                                break;
                            case "serious":
                                dbStatus = "serious";
                                break;
                            case "caution":
                            case "warning":
                                dbStatus = "caution";
                                break;
                            case "standby":
                                dbStatus = "standby";
                                break;
                            case "off":
                                dbStatus = "off";
                                break;
                            default:
                                dbStatus = "normal";
                        }
                    }
                    deviceToInsert = {
                        name: name,
                        type: type,
                        serviceUrl: serviceUrl,
                        siteId: siteId,
                        parameters: dbParameters,
                        data: dbData,
                        ipAddress: dbIpAddress,
                        status: dbStatus,
                    };
                    return [4 /*yield*/, db_1.db
                            .insert(schema_1.devices)
                            .values(deviceToInsert)
                            .returning()];
                case 4:
                    newDevice = _g.sent();
                    return [2 /*return*/, c.json(newDevice[0], 201)];
                case 5:
                    error_3 = _g.sent();
                    console.error("Error creating device or processing external details:", error_3);
                    message = error_3.message ||
                        "Failed to create device due to an internal or external error.";
                    return [2 /*return*/, c.json({ error: message }, 500)];
                case 6: return [2 /*return*/];
            }
        });
    });
}
var getDeviceById = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, deviceResult, device, externalDetails;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                deviceId = parseInt(c.req.param("id"));
                if (isNaN(deviceId)) {
                    return [2 /*return*/, c.json({ error: "Invalid device ID" }, 400)];
                }
                return [4 /*yield*/, db_1.db
                        .select()
                        .from(schema_1.devices)
                        .where((0, drizzle_orm_1.eq)(schema_1.devices.id, deviceId))
                        .limit(1)];
            case 1:
                deviceResult = _a.sent();
                device = deviceResult[0];
                if (!!device) return [3 /*break*/, 2];
                return [2 /*return*/, c.json({ error: "Device not found" }, 404)];
            case 2:
                if (!device.serviceUrl) return [3 /*break*/, 4];
                return [4 /*yield*/, fetchExternalDeviceDetails(device.serviceUrl)];
            case 3:
                externalDetails = _a.sent();
                if (externalDetails) {
                    updateDevice(c);
                    return [2 /*return*/, c.json(__assign(__assign({}, device), { externalDetails: externalDetails }))];
                }
                _a.label = 4;
            case 4: return [2 /*return*/, c.json(device)];
        }
    });
}); };
app.get("/:id/metrics", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, metricsData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                deviceId = parseInt(c.req.param("id"));
                if (isNaN(deviceId)) {
                    return [2 /*return*/, c.json({ error: "Invalid device ID" }, 400)];
                }
                return [4 /*yield*/, db_1.db
                        .select()
                        .from(schema_1.metrics)
                        .where((0, drizzle_orm_1.eq)(schema_1.metrics.deviceId, deviceId))
                        .limit(100)];
            case 1:
                metricsData = _a.sent();
                return [2 /*return*/, c.json(metricsData)];
        }
    });
}); });
app.get("/:id/metric-types", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, types;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                deviceId = parseInt(c.req.param("id"));
                if (isNaN(deviceId)) {
                    return [2 /*return*/, c.json({ error: "Invalid device ID" }, 400)];
                }
                return [4 /*yield*/, db_1.db
                        .selectDistinct({ metricType: schema_1.metrics.metricType })
                        .from(schema_1.metrics)
                        .where((0, drizzle_orm_1.eq)(schema_1.metrics.deviceId, deviceId))];
            case 1:
                types = _a.sent();
                return [2 /*return*/, c.json(types.map(function (t) { return t.metricType; }))];
        }
    });
}); });
app.get("/:id/sites", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, deviceSiteIdResult, deviceSiteId, relatedSites;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                deviceId = parseInt(c.req.param("id"));
                if (isNaN(deviceId)) {
                    return [2 /*return*/, c.json({ error: "Invalid device ID" }, 400)];
                }
                return [4 /*yield*/, db_1.db
                        .select({ siteId: schema_1.devices.siteId })
                        .from(schema_1.devices)
                        .where((0, drizzle_orm_1.eq)(schema_1.devices.id, deviceId))
                        .limit(1)];
            case 1:
                deviceSiteIdResult = _a.sent();
                deviceSiteId = deviceSiteIdResult[0];
                if (!deviceSiteId || !deviceSiteId.siteId) {
                    return [2 /*return*/, c.json({ error: "Device not found or has no associated site" }, 404)];
                }
                return [4 /*yield*/, db_1.db
                        .select({ id: schema_1.sites.id, name: schema_1.sites.name })
                        .from(schema_1.sites)
                        .where((0, drizzle_orm_1.eq)(schema_1.sites.id, deviceSiteId.siteId))];
            case 2:
                relatedSites = _a.sent();
                return [2 /*return*/, c.json(relatedSites)];
        }
    });
}); });
// Update device status based on alerts
app.post("/:id/update-status", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, updateDeviceStatusFromAlerts, newStatus, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                deviceId = parseInt(c.req.param("id"));
                if (isNaN(deviceId)) {
                    return [2 /*return*/, c.json({ error: "Invalid device ID" }, 400)];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require("../../poller/pollDevices"); })];
            case 2:
                updateDeviceStatusFromAlerts = (_a.sent()).updateDeviceStatusFromAlerts;
                return [4 /*yield*/, updateDeviceStatusFromAlerts(deviceId)];
            case 3:
                newStatus = _a.sent();
                if (newStatus === null) {
                    return [2 /*return*/, c.json({ error: "Failed to update device status" }, 500)];
                }
                return [2 /*return*/, c.json({ status: newStatus })];
            case 4:
                error_4 = _a.sent();
                console.error("Error updating device status:", error_4);
                return [2 /*return*/, c.json({ error: "Failed to update device status" }, 500)];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.put("/:id/thresholds", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, body, validation, _i, _a, t, existingResult, existing;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                deviceId = parseInt(c.req.param("id"));
                if (isNaN(deviceId)) {
                    return [2 /*return*/, c.json({ error: "Invalid device ID" }, 400)];
                }
                return [4 /*yield*/, c.req.json()];
            case 1:
                body = _b.sent();
                validation = deviceValidationSchemas_1.UpdateDeviceThresholdsSchema.safeParse(body);
                if (!validation.success) {
                    return [2 /*return*/, c.json({ error: "Invalid input", details: validation.error.issues }, 400)];
                }
                _i = 0, _a = validation.data.thresholds;
                _b.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 8];
                t = _a[_i];
                return [4 /*yield*/, db_1.db
                        .select()
                        .from(schema_1.metricThresholds)
                        .where((0, drizzle_orm_1.eq)(schema_1.metricThresholds.deviceId, deviceId))
                        .limit(1)];
            case 3:
                existingResult = _b.sent();
                existing = existingResult[0];
                if (!existing) return [3 /*break*/, 5];
                return [4 /*yield*/, db_1.db
                        .update(schema_1.metricThresholds)
                        .set({
                        cautionThreshold: t.warning,
                        criticalThreshold: t.critical,
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.metricThresholds.id, existing.id))];
            case 4:
                _b.sent();
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, db_1.db.insert(schema_1.metricThresholds).values({
                    deviceId: deviceId,
                    metricType: t.metricType,
                    cautionThreshold: t.warning,
                    criticalThreshold: t.critical,
                })];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 2];
            case 8:
                (0, alertNotificationService_1.broadcastThresholdUpdate)(deviceId);
                return [2 /*return*/, c.json({ message: "Thresholds updated" })];
        }
    });
}); });
app.get("/", getDevice);
app.get("/services", function (c) { return getServiceList(c, "GET"); });
app.get("/:id", getDeviceById);
app.post("/", createDevice);
app.put("/:id", updateDevice);
exports.default = app;
