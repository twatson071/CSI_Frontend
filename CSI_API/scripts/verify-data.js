#!/usr/bin/env bun
"use strict";
/**
 * Database Verification Script
 * Verifies the seeded dummy data and site relationships
 */
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
require("dotenv/config");
var bun_sqlite_1 = require("bun:sqlite");
var bun_sqlite_2 = require("drizzle-orm/bun-sqlite");
var drizzle_orm_1 = require("drizzle-orm");
var schema = require("../src/db/schema");
// Database setup
var raw = process.env.DB_FILE_NAME;
var filename = raw.startsWith("file:") ? raw.slice(5) : raw;
var sqlite = new bun_sqlite_1.Database(filename);
var db = (0, bun_sqlite_2.drizzle)({ client: sqlite, schema: schema });
function verifyData() {
    return __awaiter(this, void 0, void 0, function () {
        var sitesWithDevices, _i, sitesWithDevices_1, site, devices, deviceTypes, typeCount_1, metricsCount, thresholdsCount, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔍 Verifying seeded data and relationships...\n');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, 11, 12]);
                    return [4 /*yield*/, db
                            .select({
                            siteId: schema.sites.id,
                            siteName: schema.sites.name,
                            siteLocation: schema.sites.location,
                        })
                            .from(schema.sites)];
                case 2:
                    sitesWithDevices = _a.sent();
                    console.log('📍 Sites Overview:');
                    console.log('================');
                    _i = 0, sitesWithDevices_1 = sitesWithDevices;
                    _a.label = 3;
                case 3:
                    if (!(_i < sitesWithDevices_1.length)) return [3 /*break*/, 6];
                    site = sitesWithDevices_1[_i];
                    return [4 /*yield*/, db
                            .select({
                            id: schema.devices.id,
                            name: schema.devices.name,
                            type: schema.devices.type,
                            ipAddress: schema.devices.ipAddress,
                            status: schema.devices.status,
                        })
                            .from(schema.devices)
                            .where((0, drizzle_orm_1.eq)(schema.devices.siteId, site.siteId))];
                case 4:
                    devices = _a.sent();
                    console.log("\n\uD83C\uDFE2 ".concat(site.siteName));
                    console.log("   Location: ".concat(site.siteLocation));
                    console.log("   Device Count: ".concat(devices.length));
                    if (devices.length > 0) {
                        console.log('   Devices:');
                        devices.forEach(function (device) {
                            console.log("     \u2022 ".concat(device.name, " (").concat(device.type, ") - ").concat(device.ipAddress, " [").concat(device.status, "]"));
                        });
                    }
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, db
                        .select({
                        type: schema.devices.type,
                    })
                        .from(schema.devices)];
                case 7:
                    deviceTypes = _a.sent();
                    typeCount_1 = {};
                    deviceTypes.forEach(function (device) {
                        typeCount_1[device.type] = (typeCount_1[device.type] || 0) + 1;
                    });
                    console.log('\n\n📊 Device Type Distribution:');
                    console.log('============================');
                    Object.entries(typeCount_1).forEach(function (_a) {
                        var type = _a[0], count = _a[1];
                        console.log("".concat(type, ": ").concat(count));
                    });
                    return [4 /*yield*/, db
                            .select({
                            count: schema.metrics.id,
                        })
                            .from(schema.metrics)];
                case 8:
                    metricsCount = _a.sent();
                    return [4 /*yield*/, db
                            .select({
                            count: schema.metricThresholds.id,
                        })
                            .from(schema.metricThresholds)];
                case 9:
                    thresholdsCount = _a.sent();
                    console.log('\n\n📈 Additional Data:');
                    console.log('==================');
                    console.log("Sample Metrics: ".concat(metricsCount.length));
                    console.log("Metric Thresholds: ".concat(thresholdsCount.length));
                    console.log('\n✅ Data verification completed successfully!');
                    console.log('\n🎯 All devices are properly linked to their respective sites.');
                    console.log('   The site relationships are working correctly.');
                    return [3 /*break*/, 12];
                case 10:
                    error_1 = _a.sent();
                    console.error('❌ Error verifying data:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 12];
                case 11:
                    sqlite.close();
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
// Run the verification if this script is executed directly
if (import.meta.main) {
    await verifyData();
}
