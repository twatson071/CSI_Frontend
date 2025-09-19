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
var cors_1 = require("hono/cors");
require("./db"); // ensure .env loads & db.ts runs
var pduRoutes_1 = require("./routes/PDUroutes/pduRoutes");
var sitesRoutes_1 = require("./routes/sites/sitesRoutes");
var deviceRoutes_1 = require("./routes/devices/deviceRoutes");
var metricThresholdRoutes_1 = require("./routes/metricThresholds/metricThresholdRoutes");
var alertsRoutes_1 = require("./routes/alerts/alertsRoutes");
var mockRoutes_1 = require("./routes/mock/mockRoutes");
var rolesRoutes_1 = require("./routes/roles/rolesRoutes");
var userRoutes_1 = require("./routes/users/userRoutes");
var alertNotificationService_1 = require("./services/alertNotificationService");
require("./poller/pollDevices");
var auth_1 = require("./auth");
// Initialize the critical alert notification service
(0, alertNotificationService_1.initializeAlertNotificationService)(8081);
var app = new hono_1.Hono();
// Configure CORS properly for production and demo deployments
var corsOptions = {
    origin: function (origin) {
        // Allow all origins in demo mode or development
        if (process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'development') {
            return origin || '*';
        }
        // In production, allow specific origins or same-origin requests
        return origin || '*';
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use("*", (0, cors_1.cors)(corsOptions));
// Health check endpoint
app.get("/health", function (c) {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.route("/pdu", pduRoutes_1.default);
app.route("/sites", sitesRoutes_1.default);
app.route("/devices", deviceRoutes_1.default);
app.route("/metric-thresholds", metricThresholdRoutes_1.default);
app.route("/alerts", alertsRoutes_1.default);
app.route("/mock", mockRoutes_1.default);
app.route("/roles", rolesRoutes_1.default);
app.route("/users", userRoutes_1.default);
app.use("/auth/*", function (c) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, auth_1.auth.handler(c.req.raw)];
    });
}); });
exports.default = {
    port: process.env.PORT || 3001,
    fetch: app.fetch,
};
