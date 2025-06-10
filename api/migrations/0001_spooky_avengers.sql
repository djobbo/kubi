CREATE TABLE `legacy_bookmarks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`page_type` text NOT NULL,
	`page_id` text NOT NULL,
	`name` text NOT NULL,
	`meta` text,
	`discord_id` text NOT NULL,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_legacy_bookmark` ON `legacy_bookmarks` (`discord_id`,`page_type`,`page_id`);