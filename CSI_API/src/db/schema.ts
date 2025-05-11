import { int, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

// Users Table
export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
  roleId: int().references(() => roles.id), // Foreign key to roles table
  createdAt: text().default("CURRENT_TIMESTAMP"),
  updatedAt: text().default("CURRENT_TIMESTAMP"),
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
  createdAt: text().default("CURRENT_TIMESTAMP"),
  updatedAt: text().default("CURRENT_TIMESTAMP"),
});

// Logs Table
export const logs = sqliteTable("logs", {
  id: int().primaryKey({ autoIncrement: true }),
  message: text().notNull(),
  level: text({ enum: ["INFO", "DEBUG", "ERROR"] }).notNull(), // Corrected enum syntax
  userId: int().references(() => users.id), // Foreign key to users table
  createdAt: text().default("CURRENT_TIMESTAMP"),
});

// Notifications Table
export const notifications = sqliteTable("notifications", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().references(() => users.id), // Foreign key to users table
  message: text().notNull(),
  type: text().notNull(),
  read: int().default(0),
  createdAt: text().default("CURRENT_TIMESTAMP"),
});

// API Tokens Table
export const apiTokens = sqliteTable("api_tokens", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().references(() => users.id), // Foreign key to users table
  token: text().notNull().unique(),
  expiresAt: text(),
  createdAt: text().default("CURRENT_TIMESTAMP"),
});

// Audit Logs Table
export const auditLogs = sqliteTable("audit_logs", {
  id: int().primaryKey({ autoIncrement: true }),
  action: text().notNull(),
  table: text().notNull(),
  recordId: int().notNull(),
  userId: int().references(() => users.id), // Foreign key to users table
  timestamp: text().default("CURRENT_TIMESTAMP"),
});

// Alerts Table
export const alerts = sqliteTable("alerts", {
  id: int().primaryKey({ autoIncrement: true }),
  type: text().notNull(),
  message: text().notNull(),
  severity: text({ enum: ["INFO", "WARNING", "CRITICAL"] }).notNull(), // Fixed enum syntax
  deviceId: int().references(() => devices.id), // Foreign key to devices table
  siteId: int().references(() => sites.id), // Foreign key to sites table
  createdAt: text().default("CURRENT_TIMESTAMP"),
  acknowledged: int().default(0),
  acknowledgedBy: int().references(() => users.id), // Foreign key to users table
  acknowledgedAt: text(),
});

// Devices Table
export const devices = sqliteTable("devices", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  type: text().notNull(),
  ipAddress: text().notNull(),
  serviceUrl: text().notNull(),
  status: text({ enum: ["online", "offline", "warning"] }).notNull(), // Corrected enum syntax
  siteId: int().references(() => sites.id), // Foreign key to sites table
  createdAt: text().default("CURRENT_TIMESTAMP"),
  updatedAt: text().default("CURRENT_TIMESTAMP"),
});

// Metrics Table
export const metrics = sqliteTable("metrics", {
  id: int().primaryKey({ autoIncrement: true }),
  deviceId: int().references(() => devices.id), // Foreign key to devices table
  metricType: text().notNull(),
  value: real().notNull(),
  timestamp: text().default("CURRENT_TIMESTAMP"),
});
