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
require("dotenv/config");
var db_1 = require("../../db");
var schema_1 = require("../../db/schema");
var zod_1 = require("zod");
var drizzle_orm_1 = require("drizzle-orm");
var app = new hono_1.Hono();
// Define a schema for the expected POST body structure for fetching PDUs
var FetchPduBodySchema = zod_1.z.object({
    parameters: zod_1.z.record(zod_1.z.any()).optional().default({}), // parameters should be an object
});
function fetchAllPdus(c, method) {
    return __awaiter(this, void 0, void 0, function () {
        var EXTERNAL_BASE_URL, SYSTEM_OPERATOR_KEY, HUB_KEY, serviceUrl, pduDevices, validatedBody, rawBody, validation, e_1, results;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    EXTERNAL_BASE_URL = process.env.EXTERNAL_BASE_URL;
                    SYSTEM_OPERATOR_KEY = process.env.SYSTEM_OPERATOR_KEY;
                    HUB_KEY = process.env.HUB_KEY;
                    serviceUrl = c.req.param("serviceUrl");
                    if (!serviceUrl) {
                        return [2 /*return*/, c.text("Missing serviceUrl parameter", 400)];
                    }
                    return [4 /*yield*/, db_1.db.select().from(devices).where({
                            where: function (devices, _a) {
                                var eq = _a.eq;
                                return eq(devices.serviceUrl, serviceUrl);
                            },
                        })];
                case 1:
                    pduDevices = _a.sent();
                    if (pduDevices.length === 0) {
                        return [2 /*return*/, c.text("No devices found for serviceUrl: ".concat(serviceUrl), 404)];
                    }
                    validatedBody = undefined;
                    if (!(method === "POST")) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, c.req.json()];
                case 3:
                    rawBody = _a.sent();
                    validation = FetchPduBodySchema.safeParse(rawBody);
                    if (!validation.success) {
                        return [2 /*return*/, c.json({
                                error: "Invalid JSON body or parameters structure",
                                details: validation.error.issues,
                            }, 400)];
                    }
                    validatedBody = validation.data;
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    return [2 /*return*/, c.json({ error: "Invalid JSON body" }, 400)];
                case 5: return [4 /*yield*/, Promise.all(pduDevices.map(function (dev) { return __awaiter(_this, void 0, void 0, function () {
                        var url, init, res, responseText, responseData;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    url = "".concat(EXTERNAL_BASE_URL, "/service/").concat(dev.serviceUrl);
                                    init = {
                                        method: method,
                                        headers: __assign({ "X-API-Key-CSI-Maestro-SystemOperator": SYSTEM_OPERATOR_KEY, "X-API-Key-CSI-Maestro-Hub": HUB_KEY }, (method === "POST" && { "Content-Type": "application/json" })),
                                    };
                                    if (method === "POST" && validatedBody) {
                                        init.body = JSON.stringify({
                                            payload: JSON.stringify({ parameters: validatedBody.parameters }),
                                        });
                                    }
                                    return [4 /*yield*/, fetch(url, init)];
                                case 1:
                                    res = _a.sent();
                                    return [4 /*yield*/, res.text()];
                                case 2:
                                    responseText = _a.sent();
                                    responseData = responseText;
                                    try {
                                        responseData = JSON.parse(responseText);
                                        console.log("Parsed response data:", responseData);
                                    }
                                    catch (e) {
                                        console.warn("Response was not valid JSON, keeping as text", responseText);
                                    }
                                    return [2 /*return*/, {
                                            deviceId: dev.id,
                                            name: dev.name,
                                            status: res.status,
                                            data: responseData,
                                        }];
                            }
                        });
                    }); }))];
                case 6:
                    results = _a.sent();
                    return [2 /*return*/, c.json(results)];
            }
        });
    });
}
app.get("/:serviceUrl", function (c) { return fetchAllPdus(c, "GET"); });
app.post("/:serviceUrl", function (c) { return fetchAllPdus(c, "POST"); });
// New route to fetch metrics for a device
app.get("/metrics/:deviceId", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, metricType, limit, fetchedMetrics, chartData, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                deviceId = parseInt(c.req.param("deviceId"), 10);
                metricType = c.req.query("metricType");
                limit = parseInt(c.req.query("limit") || "100", 10);
                if (isNaN(deviceId)) {
                    return [2 /*return*/, c.json({ error: "Invalid deviceId" }, 400)];
                }
                if (!metricType) {
                    return [2 /*return*/, c.json({ error: "Missing metricType query parameter" }, 400)];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db_1.db
                        .select()
                        .from(schema_1.metrics)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.metrics.deviceId, deviceId), (0, drizzle_orm_1.eq)(schema_1.metrics.metricType, metricType)))
                        .orderBy((0, drizzle_orm_1.desc)(schema_1.metrics.createdAt)) // Assuming 'createdAt' column for timestamp
                        .limit(limit)];
            case 2:
                fetchedMetrics = _a.sent();
                chartData = fetchedMetrics
                    .map(function (metric) { return ({
                    x: metric.createdAt
                        ? new Date(metric.createdAt).toISOString()
                        : new Date().toISOString(), // Ensure createdAt is present
                    y: metric.value,
                }); })
                    .reverse();
                return [2 /*return*/, c.json(chartData)];
            case 3:
                error_1 = _a.sent();
                console.error("Error fetching metrics:", error_1);
                return [2 /*return*/, c.json({ error: "Failed to fetch metrics" }, 500)];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = app;
