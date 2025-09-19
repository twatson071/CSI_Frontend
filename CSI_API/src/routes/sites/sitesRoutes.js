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
require("dotenv/config");
var db_1 = require("../../db");
var schema_1 = require("../../db/schema");
var schema_2 = require("../../db/schema");
var drizzle_orm_1 = require("drizzle-orm");
var sitesValidationSchemas_1 = require("./sitesValidationSchemas");
var zod_1 = require("zod");
var app = new hono_1.Hono();
function getSiteById(c) {
    return __awaiter(this, void 0, void 0, function () {
        var siteIdParam, siteId, site, siteData, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    siteIdParam = c.req.param("siteId");
                    siteId = parseInt(siteIdParam);
                    if (isNaN(siteId)) {
                        return [2 /*return*/, c.json({ error: "Invalid Site ID format" }, 400)];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, db_1.db.select().from(schema_1.sites).where({
                            where: function (s, _a) {
                                var eq = _a.eq;
                                return eq(s.id, siteId);
                            },
                            with: {
                                userSites: {
                                    where: function (us, _a) {
                                        var eq = _a.eq;
                                        return eq(us.siteId, siteId);
                                    },
                                    with: {
                                        user: true,
                                    },
                                },
                            },
                        })];
                case 2:
                    site = _c.sent();
                    if (!site) {
                        return [2 /*return*/, c.json({ error: "Site not found" }, 404)];
                    }
                    siteData = {
                        siteId: site.id,
                        siteName: (_a = site.name) !== null && _a !== void 0 ? _a : "Unnamed Site",
                        location: (_b = site.location) !== null && _b !== void 0 ? _b : "No location provided",
                    };
                    return [2 /*return*/, c.json(siteData)];
                case 3:
                    error_1 = _c.sent();
                    console.error("Error fetching site with ID ".concat(siteId, ":"), error_1);
                    return [2 /*return*/, c.json({ error: "Failed to fetch site" }, 500)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function fetchSitesWithDevices(c) {
    return __awaiter(this, void 0, void 0, function () {
        var EXTERNAL_BASE_URL, SYSTEM_OPERATOR_KEY, HUB_KEY, userIdString, userId, userSiteRows, results, validResults, validationResult, error_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    EXTERNAL_BASE_URL = process.env.EXTERNAL_BASE_URL;
                    SYSTEM_OPERATOR_KEY = process.env.SYSTEM_OPERATOR_KEY;
                    HUB_KEY = process.env.HUB_KEY;
                    userIdString = c.req.header("x-user-id");
                    // Default to userId = 1 if not provided (for local testing)
                    if (!userIdString) {
                        if (process.env.NODE_ENV === "development" ||
                            process.env.NODE_ENV === "local") {
                            userId = 1;
                        }
                        else {
                            return [2 /*return*/, c.json({ error: "User ID is required" }, 400)];
                        }
                    }
                    else {
                        userId = parseInt(userIdString);
                        if (isNaN(userId)) {
                            return [2 /*return*/, c.json({ error: "Invalid User ID format" }, 400)];
                        }
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, db_1.db.query.userSites.findMany({
                            where: function (us, _a) {
                                var eq = _a.eq;
                                return eq(us.userId, userId);
                            },
                            with: {
                                site: true,
                            },
                        })];
                case 2:
                    userSiteRows = _a.sent();
                    return [4 /*yield*/, Promise.all(userSiteRows.map(function (userSite) { return __awaiter(_this, void 0, void 0, function () {
                            var site, devRows, devicesData;
                            var _this = this;
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        if (!userSite.site) {
                                            console.error("Site data missing for userSite entry with userId: ".concat(userSite.userId, " and siteId: ").concat(userSite.siteId));
                                            return [2 /*return*/, null];
                                        }
                                        site = userSite.site;
                                        return [4 /*yield*/, db_1.db.query.devices.findMany({
                                                where: function (d, _a) {
                                                    var eq = _a.eq;
                                                    return eq(d.siteId, site.id);
                                                },
                                            })];
                                    case 1:
                                        devRows = _c.sent();
                                        return [4 /*yield*/, Promise.all(devRows.map(function (dev) { return __awaiter(_this, void 0, void 0, function () {
                                                var url, init, res, externalData, textResponse, finalStatus, dataToStore, parametersToStore, ipAddressToStore, dbUpdateError_1, fetchError_1;
                                                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                                                return __generator(this, function (_l) {
                                                    switch (_l.label) {
                                                        case 0:
                                                            url = "".concat(EXTERNAL_BASE_URL, "/service/").concat(dev.serviceUrl);
                                                            init = {
                                                                method: "GET",
                                                                headers: {
                                                                    "X-API-Key-CSI-Maestro-SystemOperator": SYSTEM_OPERATOR_KEY,
                                                                    "X-API-Key-CSI-Maestro-Hub": HUB_KEY,
                                                                },
                                                            };
                                                            _l.label = 1;
                                                        case 1:
                                                            _l.trys.push([1, 11, , 12]);
                                                            return [4 /*yield*/, fetch(url, init)];
                                                        case 2:
                                                            res = _l.sent();
                                                            externalData = null;
                                                            textResponse = "";
                                                            if (!res.ok) return [3 /*break*/, 4];
                                                            return [4 /*yield*/, res.text()];
                                                        case 3:
                                                            textResponse = _l.sent();
                                                            try {
                                                                externalData = JSON.parse(textResponse);
                                                            }
                                                            catch (parseError) {
                                                                console.error("Failed to parse JSON for device ".concat(dev.id, " from ").concat(url, ": ").concat(textResponse), parseError);
                                                            }
                                                            _l.label = 4;
                                                        case 4:
                                                            finalStatus = dev.status || "offline";
                                                            dataToStore = externalData;
                                                            parametersToStore = null;
                                                            ipAddressToStore = null;
                                                            if (!(res.ok && externalData !== null)) return [3 /*break*/, 9];
                                                            // Logic to determine status and data based on device type and externalData
                                                            if (dev.type === "PDU") {
                                                                parametersToStore = externalData.parameters || {};
                                                                dataToStore = externalData;
                                                                ipAddressToStore = ((_b = (_a = externalData.device) === null || _a === void 0 ? void 0 : _a.comms) === null || _b === void 0 ? void 0 : _b.ip) || null;
                                                                if ((_c = externalData.sensors) === null || _c === void 0 ? void 0 : _c.load_state) {
                                                                    finalStatus = externalData.sensors.load_state.toLowerCase();
                                                                }
                                                                else if (((_d = externalData.parameters) === null || _d === void 0 ? void 0 : _d.ready) === "READY") {
                                                                    finalStatus = "normal";
                                                                }
                                                                else {
                                                                    finalStatus = "READY";
                                                                }
                                                            }
                                                            else {
                                                                // For other device types
                                                                parametersToStore = externalData.parameters || {};
                                                                dataToStore = externalData.data || externalData;
                                                                ipAddressToStore = externalData.ipAddress || null;
                                                                finalStatus = externalData.status || dev.status || "READY";
                                                            }
                                                            _l.label = 5;
                                                        case 5:
                                                            _l.trys.push([5, 7, , 8]);
                                                            return [4 /*yield*/, db_1.db
                                                                    .update(schema_2.devices)
                                                                    .set({
                                                                    status: finalStatus,
                                                                    data: dataToStore,
                                                                    parameters: parametersToStore,
                                                                    ipAddress: ipAddressToStore,
                                                                    lastSeen: new Date(),
                                                                })
                                                                    .where((0, drizzle_orm_1.eq)(schema_2.devices.id, dev.id))];
                                                        case 6:
                                                            _l.sent();
                                                            return [3 /*break*/, 8];
                                                        case 7:
                                                            dbUpdateError_1 = _l.sent();
                                                            console.error("Failed to update device ".concat(dev.id, " in DB:"), dbUpdateError_1);
                                                            return [3 /*break*/, 8];
                                                        case 8: return [3 /*break*/, 10];
                                                        case 9:
                                                            if (!res.ok) {
                                                                finalStatus = "error";
                                                            }
                                                            _l.label = 10;
                                                        case 10: return [2 /*return*/, {
                                                                deviceId: dev.id,
                                                                name: (_e = dev.name) !== null && _e !== void 0 ? _e : "Unnamed Device",
                                                                status: finalStatus,
                                                                data: dataToStore,
                                                                type: (_f = dev.type) !== null && _f !== void 0 ? _f : "unknown",
                                                                serviceUrl: (_g = dev.serviceUrl) !== null && _g !== void 0 ? _g : "",
                                                            }];
                                                        case 11:
                                                            fetchError_1 = _l.sent();
                                                            console.error("Error fetching data for device ".concat(dev.id, " from ").concat(url, ":"), fetchError_1);
                                                            return [2 /*return*/, {
                                                                    deviceId: dev.id,
                                                                    name: (_h = dev.name) !== null && _h !== void 0 ? _h : "Unnamed Device",
                                                                    status: "error", // Indicate a fetch error
                                                                    data: null,
                                                                    type: (_j = dev.type) !== null && _j !== void 0 ? _j : "unknown",
                                                                    serviceUrl: (_k = dev.serviceUrl) !== null && _k !== void 0 ? _k : "",
                                                                }];
                                                        case 12: return [2 /*return*/];
                                                    }
                                                });
                                            }); }))];
                                    case 2:
                                        devicesData = _c.sent();
                                        return [2 /*return*/, {
                                                siteId: site.id,
                                                siteName: (_a = site.name) !== null && _a !== void 0 ? _a : "Unnamed Site",
                                                location: (_b = site.location) !== null && _b !== void 0 ? _b : "No location provided",
                                                devices: devicesData,
                                            }];
                                }
                            });
                        }); }))];
                case 3:
                    results = _a.sent();
                    validResults = results.filter(function (result) { return result !== null; });
                    validationResult = sitesValidationSchemas_1.SitesWithDevicesResponseSchema.safeParse(validResults);
                    if (!validationResult.success) {
                        console.error("Zod validation error:", validationResult.error.flatten());
                        return [2 /*return*/, c.json({
                                error: "Data validation failed",
                                details: validationResult.error.flatten(),
                            }, 500)];
                    }
                    return [2 /*return*/, c.json(validationResult.data)];
                case 4:
                    error_2 = _a.sent();
                    console.error("Error fetching sites or devices:", error_2);
                    return [2 /*return*/, c.json({ error: "Failed to fetch sites or devices" }, 500)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function createSite(c) {
    return __awaiter(this, void 0, void 0, function () {
        var userIdString, userId, body, validation, newSite, error_3;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userIdString = c.req.header("x-user-id");
                    if (!userIdString) {
                        if (process.env.NODE_ENV === "development" ||
                            process.env.NODE_ENV === "local") {
                            userId = 1; // Default for local testing
                        }
                        else {
                            return [2 /*return*/, c.json({ error: "User ID is required for creating a site" }, 400)];
                        }
                    }
                    else {
                        userId = parseInt(userIdString);
                        if (isNaN(userId)) {
                            return [2 /*return*/, c.json({ error: "Invalid User ID format" }, 400)];
                        }
                    }
                    return [4 /*yield*/, c.req.json()];
                case 1:
                    body = _a.sent();
                    validation = sitesValidationSchemas_1.CreateSitePayloadSchema.safeParse(body);
                    if (!validation.success) {
                        console.error("Zod validation error:", validation.error.flatten());
                        return [2 /*return*/, c.json({
                                error: "Data validation failed",
                                details: validation.error.flatten(),
                            }, 400)];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db_1.db.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var insertedSite, newSiteId;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx
                                            .insert(schema_1.sites)
                                            .values({
                                            name: validation.data.name,
                                            location: validation.data.location,
                                        })
                                            .returning({
                                            id: schema_1.sites.id,
                                            name: schema_1.sites.name,
                                            location: schema_1.sites.location,
                                        })];
                                    case 1:
                                        insertedSite = _a.sent();
                                        if (!insertedSite || insertedSite.length === 0) {
                                            throw new Error("Failed to create site record.");
                                        }
                                        newSiteId = insertedSite[0].id;
                                        return [4 /*yield*/, tx.insert(schema_1.userSites).values({
                                                userId: userId,
                                                siteId: newSiteId,
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/, insertedSite[0]];
                                }
                            });
                        }); })];
                case 3:
                    newSite = _a.sent();
                    return [2 /*return*/, c.json({
                            message: "Site created and associated with user successfully",
                            site: newSite,
                        }, 201)];
                case 4:
                    error_3 = _a.sent();
                    console.error("Error creating site or associating with user:", error_3);
                    return [2 /*return*/, c.json({
                            error: "Failed to create site",
                            details: error_3 instanceof Error ? error_3.message : "Unknown error",
                        }, 500)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function fetchDevicesForSite(c) {
    return __awaiter(this, void 0, void 0, function () {
        var EXTERNAL_BASE_URL, SYSTEM_OPERATOR_KEY, HUB_KEY, siteIdParam, siteId, devRows, devicesData, DevicesArraySchema, validationResult, error_4;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    EXTERNAL_BASE_URL = process.env.EXTERNAL_BASE_URL;
                    SYSTEM_OPERATOR_KEY = process.env.SYSTEM_OPERATOR_KEY;
                    HUB_KEY = process.env.HUB_KEY;
                    siteIdParam = c.req.param("siteId");
                    siteId = parseInt(siteIdParam);
                    if (isNaN(siteId)) {
                        return [2 /*return*/, c.json({ error: "Invalid Site ID format" }, 400)];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, db_1.db.query.devices.findMany({
                            where: function (d, _a) {
                                var eq = _a.eq;
                                return eq(d.siteId, siteId);
                            },
                        })];
                case 2:
                    devRows = _a.sent();
                    if (!devRows || devRows.length === 0) {
                        return [2 /*return*/, c.json([])];
                    }
                    return [4 /*yield*/, Promise.all(devRows.map(function (dev) { return __awaiter(_this, void 0, void 0, function () {
                            var url, init, res, externalData, textResponse, fetchError_2;
                            var _a, _b, _c, _d, _e, _f;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        url = "".concat(EXTERNAL_BASE_URL, "/service/").concat(dev.serviceUrl);
                                        init = {
                                            method: "GET",
                                            headers: {
                                                "X-API-Key-CSI-Maestro-SystemOperator": SYSTEM_OPERATOR_KEY,
                                                "X-API-Key-CSI-Maestro-Hub": HUB_KEY,
                                            },
                                        };
                                        _g.label = 1;
                                    case 1:
                                        _g.trys.push([1, 5, , 6]);
                                        return [4 /*yield*/, fetch(url, init)];
                                    case 2:
                                        res = _g.sent();
                                        externalData = null;
                                        if (!res.ok) return [3 /*break*/, 4];
                                        return [4 /*yield*/, res.text()];
                                    case 3:
                                        textResponse = _g.sent();
                                        try {
                                            externalData = JSON.parse(textResponse);
                                        }
                                        catch (parseError) {
                                            console.error("Failed to parse JSON for device ".concat(dev.id, " from ").concat(url, ": ").concat(textResponse), parseError);
                                        }
                                        _g.label = 4;
                                    case 4: return [2 /*return*/, {
                                            deviceId: dev.id,
                                            name: (_a = dev.name) !== null && _a !== void 0 ? _a : "Unnamed Device",
                                            type: (_b = dev.type) !== null && _b !== void 0 ? _b : "unknown",
                                            serviceUrl: (_c = dev.serviceUrl) !== null && _c !== void 0 ? _c : "",
                                            status: res.ok && externalData !== null
                                                ? externalData.status || dev.status || "READY"
                                                : "critical", // Default to critical if fetch fails
                                            data: externalData,
                                        }];
                                    case 5:
                                        fetchError_2 = _g.sent();
                                        console.error("Error fetching data for device ".concat(dev.id, " from ").concat(url, ":"), fetchError_2);
                                        return [2 /*return*/, {
                                                deviceId: dev.id,
                                                name: (_d = dev.name) !== null && _d !== void 0 ? _d : "Unnamed Device",
                                                status: "error",
                                                data: null,
                                                type: (_e = dev.type) !== null && _e !== void 0 ? _e : "unknown",
                                                serviceUrl: (_f = dev.serviceUrl) !== null && _f !== void 0 ? _f : "",
                                            }];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 3:
                    devicesData = _a.sent();
                    DevicesArraySchema = zod_1.z.array(sitesValidationSchemas_1.DeviceSchema);
                    validationResult = DevicesArraySchema.safeParse(devicesData);
                    if (!validationResult.success) {
                        console.error("Zod validation error for devices list:", validationResult.error.flatten());
                        return [2 /*return*/, c.json({
                                error: "Device data validation failed",
                                details: validationResult.error.flatten(),
                            }, 500)];
                    }
                    return [2 /*return*/, c.json(validationResult.data)];
                case 4:
                    error_4 = _a.sent();
                    console.error("Error fetching devices for site ".concat(siteId, ":"), error_4);
                    return [2 /*return*/, c.json({ error: "Failed to fetch devices" }, 500)];
                case 5: return [2 /*return*/];
            }
        });
    });
}
app.get("/", fetchSitesWithDevices); // Changed to pass function reference
app.post("/", createSite); // Changed to pass function reference
app.get("/:siteId", getSiteById); // New route to get site by ID
app.get("/:siteId/devices", fetchDevicesForSite); // New route
exports.default = app;
