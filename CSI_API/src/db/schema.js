"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSitesRelations = exports.userSites = exports.metricThresholdsRelations = exports.metricThresholds = exports.metricsRelations = exports.metrics = exports.devicesRelations = exports.devices = exports.alertsRelations = exports.alerts = exports.auditLogsRelations = exports.auditLogs = exports.apiTokensRelations = exports.apiTokens = exports.notificationsRelations = exports.notifications = exports.logsRelations = exports.logs = exports.sitesRelations = exports.sites = exports.rolesRelations = exports.roles = exports.usersRelations = exports.users = void 0;
var sqlite_core_1 = require("drizzle-orm/sqlite-core");
var drizzle_orm_1 = require("drizzle-orm");
// Users Table
exports.users = (0, sqlite_core_1.sqliteTable)("users", {
    id: (0, sqlite_core_1.int)().primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)().notNull(),
    email: (0, sqlite_core_1.text)().notNull().unique(),
    passwordHash: (0, sqlite_core_1.text)().notNull(),
    roleId: (0, sqlite_core_1.int)().references(function () { return exports.roles.id; }), // Foreign key to roles table
    createdAt: (0, sqlite_core_1.text)().default((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["(current_timestamp)"], ["(current_timestamp)"])))),
    updatedAt: (0, sqlite_core_1.text)().default((0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["(current_timestamp)"], ["(current_timestamp)"])))),
    notificationPreferences: (0, sqlite_core_1.text)("notification_preferences", { mode: "json" })
        .$type()
        .default((0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["'{}'"], ["'{}'"])))),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, function (_a) {
    var many = _a.many, one = _a.one;
    return ({
        userSites: many(exports.userSites),
        logs: many(exports.logs),
        notifications: many(exports.notifications),
        apiTokens: many(exports.apiTokens),
        auditLogs: many(exports.auditLogs),
        alertsAcknowledged: many(exports.alerts, { relationName: "acknowledgedBy" }),
        role: one(exports.roles, {
            fields: [exports.users.roleId],
            references: [exports.roles.id],
        }),
    });
});
// Roles Table
exports.roles = (0, sqlite_core_1.sqliteTable)("roles", {
    id: (0, sqlite_core_1.int)().primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)().notNull(),
    permissions: (0, sqlite_core_1.text)().notNull(),
});
exports.rolesRelations = (0, drizzle_orm_1.relations)(exports.roles, function (_a) {
    var many = _a.many;
    return ({
        users: many(exports.users),
    });
});
// Sites Table
exports.sites = (0, sqlite_core_1.sqliteTable)("sites", {
    id: (0, sqlite_core_1.int)().primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)().notNull(),
    location: (0, sqlite_core_1.text)(),
    createdAt: (0, sqlite_core_1.text)().default((0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["(current_timestamp)"], ["(current_timestamp)"])))),
    updatedAt: (0, sqlite_core_1.text)().default((0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["(current_timestamp)"], ["(current_timestamp)"])))),
});
exports.sitesRelations = (0, drizzle_orm_1.relations)(exports.sites, function (_a) {
    var many = _a.many;
    return ({
        userSites: many(exports.userSites),
        devices: many(exports.devices),
        alerts: many(exports.alerts),
    });
});
// Logs Table
exports.logs = (0, sqlite_core_1.sqliteTable)("logs", {
    id: (0, sqlite_core_1.int)().primaryKey({ autoIncrement: true }),
    message: (0, sqlite_core_1.text)().notNull(),
    level: (0, sqlite_core_1.text)({ enum: ["INFO", "DEBUG", "ERROR"] }).notNull(), // Corrected enum syntax
    userId: (0, sqlite_core_1.int)().references(function () { return exports.users.id; }), // Foreign key to users table
    createdAt: (0, sqlite_core_1.text)().default((0, drizzle_orm_1.sql)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["(current_timestamp)"], ["(current_timestamp)"])))),
});
exports.logsRelations = (0, drizzle_orm_1.relations)(exports.logs, function (_a) {
    var one = _a.one;
    return ({
        user: one(exports.users, {
            fields: [exports.logs.userId],
            references: [exports.users.id],
        }),
    });
});
// Notifications Table
exports.notifications = (0, sqlite_core_1.sqliteTable)("notifications", {
    id: (0, sqlite_core_1.int)().primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.int)().references(function () { return exports.users.id; }), // Foreign key to users table
    message: (0, sqlite_core_1.text)().notNull(),
    type: (0, sqlite_core_1.text)().notNull(),
    read: (0, sqlite_core_1.int)().default(0),
    createdAt: (0, sqlite_core_1.text)().default((0, drizzle_orm_1.sql)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["(current_timestamp)"], ["(current_timestamp)"])))),
});
exports.notificationsRelations = (0, drizzle_orm_1.relations)(exports.notifications, function (_a) {
    var one = _a.one;
    return ({
        user: one(exports.users, {
            fields: [exports.notifications.userId],
            references: [exports.users.id],
        }),
    });
});
// API Tokens Table
exports.apiTokens = (0, sqlite_core_1.sqliteTable)("api_tokens", {
    id: (0, sqlite_core_1.int)().primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.int)().references(function () { return exports.users.id; }), // Foreign key to users table
    token: (0, sqlite_core_1.text)().notNull().unique(),
    expiresAt: (0, sqlite_core_1.text)(),
    createdAt: (0, sqlite_core_1.text)().default((0, drizzle_orm_1.sql)(templateObject_8 || (templateObject_8 = __makeTemplateObject(["(current_timestamp)"], ["(current_timestamp)"])))),
});
exports.apiTokensRelations = (0, drizzle_orm_1.relations)(exports.apiTokens, function (_a) {
    var one = _a.one;
    return ({
        user: one(exports.users, {
            fields: [exports.apiTokens.userId],
            references: [exports.users.id],
        }),
    });
});
// Audit Logs Table
exports.auditLogs = (0, sqlite_core_1.sqliteTable)("audit_logs", {
    id: (0, sqlite_core_1.int)().primaryKey({ autoIncrement: true }),
    action: (0, sqlite_core_1.text)().notNull(),
    table: (0, sqlite_core_1.text)().notNull(),
    recordId: (0, sqlite_core_1.int)().notNull(),
    userId: (0, sqlite_core_1.int)().references(function () { return exports.users.id; }), // Foreign key to users table
    createdAt: (0, sqlite_core_1.text)().default((0, drizzle_orm_1.sql)(templateObject_9 || (templateObject_9 = __makeTemplateObject(["(current_timestamp)"], ["(current_timestamp)"])))),
});
exports.auditLogsRelations = (0, drizzle_orm_1.relations)(exports.auditLogs, function (_a) {
    var one = _a.one;
    return ({
        user: one(exports.users, {
            fields: [exports.auditLogs.userId],
            references: [exports.users.id],
        }),
    });
});
// Alerts Table
exports.alerts = (0, sqlite_core_1.sqliteTable)("alerts", {
    id: (0, sqlite_core_1.int)().primaryKey({ autoIncrement: true }),
    type: (0, sqlite_core_1.text)().notNull(),
    message: (0, sqlite_core_1.text)().notNull(),
    severity: (0, sqlite_core_1.text)({
        enum: ["INFO", "CAUTION", "SERIOUS", "CRITICAL"],
    }).notNull(),
    deviceId: (0, sqlite_core_1.int)().references(function () { return exports.devices.id; }),
    siteId: (0, sqlite_core_1.int)().references(function () { return exports.sites.id; }),
    metricId: (0, sqlite_core_1.int)().references(function () { return exports.metrics.id; }), // Add reference to the metric that triggered this alert
    thresholdId: (0, sqlite_core_1.int)().references(function () { return exports.metricThresholds.id; }), // Add reference to the threshold rule
    createdAt: (0, sqlite_core_1.text)().default((0, drizzle_orm_1.sql)(templateObject_10 || (templateObject_10 = __makeTemplateObject(["(current_timestamp)"], ["(current_timestamp)"])))),
    acknowledged: (0, sqlite_core_1.int)().default(0),
    acknowledgedBy: (0, sqlite_core_1.int)().references(function () { return exports.users.id; }),
    acknowledgedAt: (0, sqlite_core_1.text)(),
    resolvedAt: (0, sqlite_core_1.text)("resolved_at"), // When the alert was auto-resolved
    isResolved: (0, sqlite_core_1.int)("is_resolved", { mode: "boolean" }).default(false),
    resolutionReason: (0, sqlite_core_1.text)("resolution_reason"), // "auto_resolved", "manual", etc.
});
exports.alertsRelations = (0, drizzle_orm_1.relations)(exports.alerts, function (_a) {
    var one = _a.one;
    return ({
        device: one(exports.devices, {
            fields: [exports.alerts.deviceId],
            references: [exports.devices.id],
        }),
        site: one(exports.sites, {
            fields: [exports.alerts.siteId],
            references: [exports.sites.id],
        }),
        acknowledgedByUser: one(exports.users, {
            fields: [exports.alerts.acknowledgedBy],
            references: [exports.users.id],
            relationName: "acknowledgedBy",
        }),
        metric: one(exports.metrics, {
            fields: [exports.alerts.metricId],
            references: [exports.metrics.id],
        }),
        threshold: one(exports.metricThresholds, {
            fields: [exports.alerts.thresholdId],
            references: [exports.metricThresholds.id],
        }),
    });
});
// Devices Table
exports.devices = (0, sqlite_core_1.sqliteTable)("devices", {
    id: (0, sqlite_core_1.int)().primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)().notNull(),
    type: (0, sqlite_core_1.text)().notNull(),
    parameters: (0, sqlite_core_1.text)("parameters", { mode: "json" })
        .$type()
        .default((0, drizzle_orm_1.sql)(templateObject_11 || (templateObject_11 = __makeTemplateObject(["'[]'"], ["'[]'"])))),
    data: (0, sqlite_core_1.text)("data", { mode: "json" })
        .$type()
        .default((0, drizzle_orm_1.sql)(templateObject_12 || (templateObject_12 = __makeTemplateObject(["'[]'"], ["'[]'"])))),
    ipAddress: (0, sqlite_core_1.text)(), //nullable as we will update from CSI PDK
    serviceUrl: (0, sqlite_core_1.text)().notNull(), //Possibly update from maestro?
    status: (0, sqlite_core_1.text)({
        enum: ["off", "standby", "normal", "caution", "serious", "critical"],
    }), //do an update from CSI on the webhook?
    siteId: (0, sqlite_core_1.int)().references(function () { return exports.sites.id; }), // Foreign key to sites table
    createdAt: (0, sqlite_core_1.text)().default((0, drizzle_orm_1.sql)(templateObject_13 || (templateObject_13 = __makeTemplateObject(["(current_timestamp)"], ["(current_timestamp)"])))),
    updatedAt: (0, sqlite_core_1.text)().default((0, drizzle_orm_1.sql)(templateObject_14 || (templateObject_14 = __makeTemplateObject(["(current_timestamp)"], ["(current_timestamp)"])))),
});
exports.devicesRelations = (0, drizzle_orm_1.relations)(exports.devices, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        site: one(exports.sites, {
            fields: [exports.devices.siteId],
            references: [exports.sites.id],
        }),
        metrics: many(exports.metrics),
        alerts: many(exports.alerts),
        thresholds: many(exports.metricThresholds),
    });
});
// Metrics Table
exports.metrics = (0, sqlite_core_1.sqliteTable)("metrics", {
    id: (0, sqlite_core_1.int)().primaryKey({ autoIncrement: true }),
    deviceId: (0, sqlite_core_1.int)().references(function () { return exports.devices.id; }), // Foreign key to devices table
    metricType: (0, sqlite_core_1.text)().notNull(),
    value: (0, sqlite_core_1.real)().notNull(),
    createdAt: (0, sqlite_core_1.text)().default((0, drizzle_orm_1.sql)(templateObject_15 || (templateObject_15 = __makeTemplateObject(["(current_timestamp)"], ["(current_timestamp)"])))),
});
exports.metricsRelations = (0, drizzle_orm_1.relations)(exports.metrics, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        device: one(exports.devices, {
            fields: [exports.metrics.deviceId],
            references: [exports.devices.id],
        }),
        alerts: many(exports.alerts),
    });
});
// Metric Thresholds Table
exports.metricThresholds = (0, sqlite_core_1.sqliteTable)("metric_thresholds", {
    id: (0, sqlite_core_1.int)().primaryKey({ autoIncrement: true }),
    deviceId: (0, sqlite_core_1.int)().references(function () { return exports.devices.id; }),
    metricType: (0, sqlite_core_1.text)().notNull(),
    cautionThreshold: (0, sqlite_core_1.real)(),
    seriousThreshold: (0, sqlite_core_1.real)(),
    criticalThreshold: (0, sqlite_core_1.real)(),
    operator: (0, sqlite_core_1.text)({ enum: ["greater_than", "less_than", "equals"] })
        .notNull()
        .default("greater_than"),
    isActive: (0, sqlite_core_1.int)().default(1),
    createdAt: (0, sqlite_core_1.text)().default((0, drizzle_orm_1.sql)(templateObject_16 || (templateObject_16 = __makeTemplateObject(["(current_timestamp)"], ["(current_timestamp)"])))),
    updatedAt: (0, sqlite_core_1.text)().default((0, drizzle_orm_1.sql)(templateObject_17 || (templateObject_17 = __makeTemplateObject(["(current_timestamp)"], ["(current_timestamp)"])))),
});
exports.metricThresholdsRelations = (0, drizzle_orm_1.relations)(exports.metricThresholds, function (_a) {
    var one = _a.one;
    return ({
        device: one(exports.devices, {
            fields: [exports.metricThresholds.deviceId],
            references: [exports.devices.id],
        }),
    });
});
// User-Sites Join Table
exports.userSites = (0, sqlite_core_1.sqliteTable)("user_sites", {
    userId: (0, sqlite_core_1.int)().references(function () { return exports.users.id; }),
    siteId: (0, sqlite_core_1.int)().references(function () { return exports.sites.id; }),
});
exports.userSitesRelations = (0, drizzle_orm_1.relations)(exports.userSites, function (_a) {
    var one = _a.one;
    return ({
        user: one(exports.users, {
            fields: [exports.userSites.userId],
            references: [exports.users.id],
        }),
        site: one(exports.sites, {
            fields: [exports.userSites.siteId],
            references: [exports.sites.id],
        }),
    });
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17;
