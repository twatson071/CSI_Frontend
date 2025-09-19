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
var metricThresholdValidationSchemas_1 = require("./metricThresholdValidationSchemas");
var app = new hono_1.Hono();
app.get("/", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var all;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.metricThresholds)];
            case 1:
                all = _a.sent();
                return [2 /*return*/, c.json(all)];
        }
    });
}); });
app.get("/device/:deviceId", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceId, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                deviceId = parseInt(c.req.param("deviceId"));
                if (isNaN(deviceId))
                    return [2 /*return*/, c.json({ error: "Invalid device ID" }, 400)];
                return [4 /*yield*/, db_1.db.select().from(schema_1.metricThresholds).findMany({
                        where: (0, drizzle_orm_1.eq)(schema_1.metricThresholds.deviceId, deviceId),
                    })];
            case 1:
                rows = _a.sent();
                return [2 /*return*/, c.json(rows)];
        }
    });
}); });
app.get("/:id", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var id, row;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = parseInt(c.req.param("id"));
                if (isNaN(id))
                    return [2 /*return*/, c.json({ error: "Invalid id" }, 400)];
                return [4 /*yield*/, db_1.db.select().from(schema_1.metricThresholds).findFirst({
                        where: (0, drizzle_orm_1.eq)(schema_1.metricThresholds.id, id),
                    })];
            case 1:
                row = _a.sent();
                if (!row)
                    return [2 /*return*/, c.json({ error: "Metric threshold not found" }, 404)];
                return [2 /*return*/, c.json(row)];
        }
    });
}); });
app.post("/", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var body, validation, inserted;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, c.req.json()];
            case 1:
                body = _a.sent();
                validation = metricThresholdValidationSchemas_1.CreateMetricThresholdSchema.safeParse(body);
                if (!validation.success)
                    return [2 /*return*/, c.json({ error: "Invalid input", details: validation.error.issues }, 400)];
                return [4 /*yield*/, db_1.db
                        .insert(schema_1.metricThresholds)
                        .values(validation.data)
                        .returning()];
            case 2:
                inserted = _a.sent();
                return [2 /*return*/, c.json(inserted[0], 201)];
        }
    });
}); });
app.put("/:id", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var id, body, validation, updated;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = parseInt(c.req.param("id"));
                if (isNaN(id))
                    return [2 /*return*/, c.json({ error: "Invalid id" }, 400)];
                return [4 /*yield*/, c.req.json()];
            case 1:
                body = _a.sent();
                validation = metricThresholdValidationSchemas_1.UpdateMetricThresholdSchema.safeParse(body);
                if (!validation.success)
                    return [2 /*return*/, c.json({ error: "Invalid input", details: validation.error.issues }, 400)];
                if (Object.keys(validation.data).length === 0)
                    return [2 /*return*/, c.json({ error: "No fields to update" }, 400)];
                return [4 /*yield*/, db_1.db
                        .update(schema_1.metricThresholds)
                        .set(validation.data)
                        .where((0, drizzle_orm_1.eq)(schema_1.metricThresholds.id, id))
                        .returning()];
            case 2:
                updated = _a.sent();
                if (updated.length === 0)
                    return [2 /*return*/, c.json({ error: "Metric threshold not found" }, 404)];
                return [2 /*return*/, c.json(updated[0])];
        }
    });
}); });
app.delete("/:id", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var id, deleted;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = parseInt(c.req.param("id"));
                if (isNaN(id))
                    return [2 /*return*/, c.json({ error: "Invalid id" }, 400)];
                return [4 /*yield*/, db_1.db
                        .delete(schema_1.metricThresholds)
                        .where((0, drizzle_orm_1.eq)(schema_1.metricThresholds.id, id))
                        .returning({ id: schema_1.metricThresholds.id })];
            case 1:
                deleted = _a.sent();
                if (deleted.length === 0)
                    return [2 /*return*/, c.json({ error: "Metric threshold not found" }, 404)];
                return [2 /*return*/, c.json({ message: "Metric threshold deleted", id: deleted[0].id })];
        }
    });
}); });
exports.default = app;
