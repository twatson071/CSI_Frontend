CREATE TABLE `alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`severity` text NOT NULL,
	`deviceId` integer,
	`siteId` integer,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`acknowledged` integer DEFAULT 0,
	`acknowledgedBy` integer,
	`acknowledgedAt` text,
	FOREIGN KEY (`deviceId`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`siteId`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`acknowledgedBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `api_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`token` text NOT NULL,
	`expiresAt` text,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_tokens_token_unique` ON `api_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`action` text NOT NULL,
	`table` text NOT NULL,
	`recordId` integer NOT NULL,
	`userId` integer,
	`timestamp` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`ipAddress` text NOT NULL,
	`serviceUrl` text NOT NULL,
	`status` text NOT NULL,
	`siteId` integer,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`siteId`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message` text NOT NULL,
	`level` text NOT NULL,
	`userId` integer,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`deviceId` integer,
	`metricType` text NOT NULL,
	`value` real NOT NULL,
	`timestamp` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`deviceId`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`message` text NOT NULL,
	`type` text NOT NULL,
	`read` integer DEFAULT 0,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`permissions` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`location` text,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`passwordHash` text NOT NULL,
	`roleId` integer,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);