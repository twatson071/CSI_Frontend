CREATE TABLE `user_sites` (
	`userId` integer,
	`siteId` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`siteId`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`action` text NOT NULL,
	`table` text NOT NULL,
	`recordId` integer NOT NULL,
	`userId` integer,
	`createdAt` text DEFAULT (current_timestamp),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_audit_logs`("id", "action", "table", "recordId", "userId", "createdAt") SELECT "id", "action", "table", "recordId", "userId", "createdAt" FROM `audit_logs`;--> statement-breakpoint
DROP TABLE `audit_logs`;--> statement-breakpoint
ALTER TABLE `__new_audit_logs` RENAME TO `audit_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`deviceId` integer,
	`metricType` text NOT NULL,
	`value` real NOT NULL,
	`createdAt` text DEFAULT (current_timestamp),
	FOREIGN KEY (`deviceId`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_metrics`("id", "deviceId", "metricType", "value", "createdAt") SELECT "id", "deviceId", "metricType", "value", "createdAt" FROM `metrics`;--> statement-breakpoint
DROP TABLE `metrics`;--> statement-breakpoint
ALTER TABLE `__new_metrics` RENAME TO `metrics`;--> statement-breakpoint
CREATE TABLE `__new_alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`severity` text NOT NULL,
	`deviceId` integer,
	`siteId` integer,
	`createdAt` text DEFAULT (current_timestamp),
	`acknowledged` integer DEFAULT 0,
	`acknowledgedBy` integer,
	`acknowledgedAt` text,
	FOREIGN KEY (`deviceId`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`siteId`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`acknowledgedBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_alerts`("id", "type", "message", "severity", "deviceId", "siteId", "createdAt", "acknowledged", "acknowledgedBy", "acknowledgedAt") SELECT "id", "type", "message", "severity", "deviceId", "siteId", "createdAt", "acknowledged", "acknowledgedBy", "acknowledgedAt" FROM `alerts`;--> statement-breakpoint
DROP TABLE `alerts`;--> statement-breakpoint
ALTER TABLE `__new_alerts` RENAME TO `alerts`;--> statement-breakpoint
CREATE TABLE `__new_api_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`token` text NOT NULL,
	`expiresAt` text,
	`createdAt` text DEFAULT (current_timestamp),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_api_tokens`("id", "userId", "token", "expiresAt", "createdAt") SELECT "id", "userId", "token", "expiresAt", "createdAt" FROM `api_tokens`;--> statement-breakpoint
DROP TABLE `api_tokens`;--> statement-breakpoint
ALTER TABLE `__new_api_tokens` RENAME TO `api_tokens`;--> statement-breakpoint
CREATE UNIQUE INDEX `api_tokens_token_unique` ON `api_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `__new_devices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`parameters` text DEFAULT '[]',
	`data` text DEFAULT '[]',
	`ipAddress` text,
	`serviceUrl` text NOT NULL,
	`status` text,
	`siteId` integer,
	`createdAt` text DEFAULT (current_timestamp),
	`updatedAt` text DEFAULT (current_timestamp),
	FOREIGN KEY (`siteId`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_devices`("id", "name", "type", "parameters", "data", "ipAddress", "serviceUrl", "status", "siteId", "createdAt", "updatedAt") SELECT "id", "name", "type", "parameters", "data", "ipAddress", "serviceUrl", "status", "siteId", "createdAt", "updatedAt" FROM `devices`;--> statement-breakpoint
DROP TABLE `devices`;--> statement-breakpoint
ALTER TABLE `__new_devices` RENAME TO `devices`;--> statement-breakpoint
CREATE TABLE `__new_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message` text NOT NULL,
	`level` text NOT NULL,
	`userId` integer,
	`createdAt` text DEFAULT (current_timestamp),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_logs`("id", "message", "level", "userId", "createdAt") SELECT "id", "message", "level", "userId", "createdAt" FROM `logs`;--> statement-breakpoint
DROP TABLE `logs`;--> statement-breakpoint
ALTER TABLE `__new_logs` RENAME TO `logs`;--> statement-breakpoint
CREATE TABLE `__new_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`message` text NOT NULL,
	`type` text NOT NULL,
	`read` integer DEFAULT 0,
	`createdAt` text DEFAULT (current_timestamp),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_notifications`("id", "userId", "message", "type", "read", "createdAt") SELECT "id", "userId", "message", "type", "read", "createdAt" FROM `notifications`;--> statement-breakpoint
DROP TABLE `notifications`;--> statement-breakpoint
ALTER TABLE `__new_notifications` RENAME TO `notifications`;--> statement-breakpoint
CREATE TABLE `__new_sites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`location` text,
	`createdAt` text DEFAULT (current_timestamp),
	`updatedAt` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
INSERT INTO `__new_sites`("id", "name", "location", "createdAt", "updatedAt") SELECT "id", "name", "location", "createdAt", "updatedAt" FROM `sites`;--> statement-breakpoint
DROP TABLE `sites`;--> statement-breakpoint
ALTER TABLE `__new_sites` RENAME TO `sites`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`passwordHash` text NOT NULL,
	`roleId` integer,
	`createdAt` text DEFAULT (current_timestamp),
	`updatedAt` text DEFAULT (current_timestamp),
	FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "passwordHash", "roleId", "createdAt", "updatedAt") SELECT "id", "name", "email", "passwordHash", "roleId", "createdAt", "updatedAt" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);