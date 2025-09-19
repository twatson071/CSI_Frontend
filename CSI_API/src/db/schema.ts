import { int, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

// Users Table
export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
  roleId: int().references(() => roles.id), // Foreign key to roles table
  createdAt: text().default(sql`(current_timestamp)`),
  updatedAt: text().default(sql`(current_timestamp)`),
  notificationPreferences: text("notification_preferences", { mode: "json" })
    .$type<Record<string, boolean>>()
    .default(sql`'{}'`),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  userSites: many(userSites),
  logs: many(logs),
  notifications: many(notifications),
  apiTokens: many(apiTokens),
  auditLogs: many(auditLogs),
  alertsAcknowledged: many(alerts, { relationName: "acknowledgedBy" }),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

// Roles Table
export const roles = sqliteTable("roles", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  permissions: text().notNull(),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

// Sites Table
export const sites = sqliteTable("sites", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  location: text(),
  createdAt: text().default(sql`(current_timestamp)`),
  updatedAt: text().default(sql`(current_timestamp)`),
});

export const sitesRelations = relations(sites, ({ many }) => ({
  userSites: many(userSites),
  devices: many(devices),
  alerts: many(alerts),
}));

// Logs Table
export const logs = sqliteTable("logs", {
  id: int().primaryKey({ autoIncrement: true }),
  message: text().notNull(),
  level: text({ enum: ["INFO", "DEBUG", "ERROR"] }).notNull(), // Corrected enum syntax
  userId: int().references(() => users.id), // Foreign key to users table
  createdAt: text().default(sql`(current_timestamp)`),
});

export const logsRelations = relations(logs, ({ one }) => ({
  user: one(users, {
    fields: [logs.userId],
    references: [users.id],
  }),
}));

// Notifications Table
export const notifications = sqliteTable("notifications", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().references(() => users.id), // Foreign key to users table
  message: text().notNull(),
  type: text().notNull(),
  read: int().default(0),
  createdAt: text().default(sql`(current_timestamp)`),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// API Tokens Table
export const apiTokens = sqliteTable("api_tokens", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().references(() => users.id), // Foreign key to users table
  token: text().notNull().unique(),
  expiresAt: text(),
  createdAt: text().default(sql`(current_timestamp)`),
});

export const apiTokensRelations = relations(apiTokens, ({ one }) => ({
  user: one(users, {
    fields: [apiTokens.userId],
    references: [users.id],
  }),
}));

// Audit Logs Table
export const auditLogs = sqliteTable("audit_logs", {
  id: int().primaryKey({ autoIncrement: true }),
  action: text().notNull(),
  table: text().notNull(),
  recordId: int().notNull(),
  userId: int().references(() => users.id), // Foreign key to users table
  createdAt: text().default(sql`(current_timestamp)`),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Alerts Table
export const alerts = sqliteTable("alerts", {
  id: int().primaryKey({ autoIncrement: true }),
  type: text().notNull(),
  message: text().notNull(),
  severity: text({
    enum: ["INFO", "CAUTION", "SERIOUS", "CRITICAL"],
  }).notNull(),
  deviceId: int().references(() => devices.id),
  siteId: int().references(() => sites.id),
  metricId: int().references(() => metrics.id), // Add reference to the metric that triggered this alert
  thresholdId: int().references(() => metricThresholds.id), // Add reference to the threshold rule
  createdAt: text().default(sql`(current_timestamp)`),
  acknowledged: int().default(0),
  acknowledgedBy: int().references(() => users.id),
  acknowledgedAt: text(),
  resolvedAt: text("resolved_at"), // When the alert was auto-resolved
  isResolved: int("is_resolved", { mode: "boolean" }).default(false),
  resolutionReason: text("resolution_reason"), // "auto_resolved", "manual", etc.
});

export const alertsRelations = relations(alerts, ({ one }) => ({
  device: one(devices, {
    fields: [alerts.deviceId],
    references: [devices.id],
  }),
  site: one(sites, {
    fields: [alerts.siteId],
    references: [sites.id],
  }),
  acknowledgedByUser: one(users, {
    fields: [alerts.acknowledgedBy],
    references: [users.id],
    relationName: "acknowledgedBy",
  }),
  metric: one(metrics, {
    fields: [alerts.metricId],
    references: [metrics.id],
  }),
  threshold: one(metricThresholds, {
    fields: [alerts.thresholdId],
    references: [metricThresholds.id],
  }),
}));

// Devices Table
export const devices = sqliteTable("devices", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  type: text().notNull(),
  parameters: text("parameters", { mode: "json" })
    .$type<string[]>()
    .default(sql`'[]'`),
  data: text("data", { mode: "json" })
    .$type<string[]>()
    .default(sql`'[]'`),
  ipAddress: text(), //nullable as we will update from CSI PDK
  serviceUrl: text().notNull(), //Possibly update from maestro?
  status: text({
    enum: ["off", "standby", "normal", "caution", "serious", "critical"],
  }), //do an update from CSI on the webhook?
  siteId: int().references(() => sites.id), // Foreign key to sites table
  createdAt: text().default(sql`(current_timestamp)`),
  updatedAt: text().default(sql`(current_timestamp)`),
});

export const devicesRelations = relations(devices, ({ one, many }) => ({
  site: one(sites, {
    fields: [devices.siteId],
    references: [sites.id],
  }),
  metrics: many(metrics),
  alerts: many(alerts),
  thresholds: many(metricThresholds),
}));

// Metrics Table
export const metrics = sqliteTable("metrics", {
  id: int().primaryKey({ autoIncrement: true }),
  deviceId: int().references(() => devices.id), // Foreign key to devices table
  metricType: text().notNull(),
  value: real().notNull(),
  createdAt: text().default(sql`(current_timestamp)`),
});

export const metricsRelations = relations(metrics, ({ one, many }) => ({
  device: one(devices, {
    fields: [metrics.deviceId],
    references: [devices.id],
  }),
  alerts: many(alerts),
}));

// Metric Thresholds Table
export const metricThresholds = sqliteTable("metric_thresholds", {
  id: int().primaryKey({ autoIncrement: true }),
  deviceId: int().references(() => devices.id),
  metricType: text().notNull(),
  cautionThreshold: real(),
  seriousThreshold: real(),
  criticalThreshold: real(),
  operator: text({ enum: ["greater_than", "less_than", "equals"] })
    .notNull()
    .default("greater_than"),
  isActive: int().default(1),
  createdAt: text().default(sql`(current_timestamp)`),
  updatedAt: text().default(sql`(current_timestamp)`),
});

export const metricThresholdsRelations = relations(
  metricThresholds,
  ({ one }) => ({
    device: one(devices, {
      fields: [metricThresholds.deviceId],
      references: [devices.id],
    }),
  })
);

// System Settings Table
export const systemSettings = sqliteTable("system_settings", {
  id: int().primaryKey({ autoIncrement: true }),
  key: text().notNull().unique(),
  value: text().notNull(),
  description: text(),
  updatedBy: int().references(() => users.id),
  updatedAt: text().default(sql`(current_timestamp)`),
});

export const systemSettingsRelations = relations(systemSettings, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [systemSettings.updatedBy],
    references: [users.id],
  }),
}));

// User-Sites Join Table
export const userSites = sqliteTable("user_sites", {
  userId: int().references(() => users.id),
  siteId: int().references(() => sites.id),
});

export const userSitesRelations = relations(userSites, ({ one }) => ({
  user: one(users, {
    fields: [userSites.userId],
    references: [users.id],
  }),
  site: one(sites, {
    fields: [userSites.siteId],
    references: [sites.id],
  }),
}));
