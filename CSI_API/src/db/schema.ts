import { int, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Users Table
export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
  roleId: int().references(() => roles.id), // Foreign key to roles table
  createdAt: text().default(sql`(current_timestamp)`),
  updatedAt: text().default(sql`(current_timestamp)`),
});

// Roles Table
export const roles = sqliteTable("roles", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  permissions: text().notNull(),
});

// Sites Table
export const sites = sqliteTable("sites", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  location: text(),
  createdAt: text().default(sql`(current_timestamp)`),
  updatedAt: text().default(sql`(current_timestamp)`),
});

// Logs Table
export const logs = sqliteTable("logs", {
  id: int().primaryKey({ autoIncrement: true }),
  message: text().notNull(),
  level: text({ enum: ["INFO", "DEBUG", "ERROR"] }).notNull(), // Corrected enum syntax
  userId: int().references(() => users.id), // Foreign key to users table
  createdAt: text().default(sql`(current_timestamp)`),
});

// Notifications Table
export const notifications = sqliteTable("notifications", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().references(() => users.id), // Foreign key to users table
  message: text().notNull(),
  type: text().notNull(),
  read: int().default(0),
  createdAt: text().default(sql`(current_timestamp)`),
});

// API Tokens Table
export const apiTokens = sqliteTable("api_tokens", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().references(() => users.id), // Foreign key to users table
  token: text().notNull().unique(),
  expiresAt: text(),
  createdAt: text().default(sql`(current_timestamp)`),
});

// Audit Logs Table
export const auditLogs = sqliteTable("audit_logs", {
  id: int().primaryKey({ autoIncrement: true }),
  action: text().notNull(),
  table: text().notNull(),
  recordId: int().notNull(),
  userId: int().references(() => users.id), // Foreign key to users table
  createdAt: text().default(sql`(current_timestamp)`),
});

// Alerts Table
export const alerts = sqliteTable("alerts", {
  id: int().primaryKey({ autoIncrement: true }),
  type: text().notNull(),
  message: text().notNull(),
  severity: text({ enum: ["INFO", "WARNING", "CRITICAL"] }).notNull(), // Fixed enum syntax
  deviceId: int().references(() => devices.id), // Foreign key to devices table
  siteId: int().references(() => sites.id), // Foreign key to sites table
  createdAt: text().default(sql`(current_timestamp)`),
  acknowledged: int().default(0),
  acknowledgedBy: int().references(() => users.id), // Foreign key to users table
  acknowledgedAt: text(),
});

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

// Metrics Table
export const metrics = sqliteTable("metrics", {
  id: int().primaryKey({ autoIncrement: true }),
  deviceId: int().references(() => devices.id), // Foreign key to devices table
  metricType: text().notNull(),
  value: real().notNull(),
  createdAt: text().default(sql`(current_timestamp)`),
});
// User-Sites Join Table
export const userSites = sqliteTable("user_sites", {
  userId: int().references(() => users.id), // Foreign key to users table
  siteId: int().references(() => sites.id), // Foreign key to sites table
});
