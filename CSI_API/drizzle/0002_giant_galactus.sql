CREATE TABLE `metric_thresholds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`deviceId` integer,
	`metricType` text NOT NULL,
	`cautionThreshold` real,
	`seriousThreshold` real,
	`criticalThreshold` real,
	`operator` text DEFAULT 'greater_than' NOT NULL,
	`isActive` integer DEFAULT 1,
	`createdAt` text DEFAULT (current_timestamp),
	`updatedAt` text DEFAULT (current_timestamp),
	FOREIGN KEY (`deviceId`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `alerts` ADD `metricId` integer REFERENCES metrics(id);--> statement-breakpoint
ALTER TABLE `alerts` ADD `thresholdId` integer REFERENCES metric_thresholds(id);--> statement-breakpoint
ALTER TABLE `alerts` ADD `resolved_at` text;--> statement-breakpoint
ALTER TABLE `alerts` ADD `is_resolved` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `alerts` ADD `resolution_reason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `notification_preferences` text DEFAULT '{}';