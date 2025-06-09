CREATE TABLE `aliases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`alias` text NOT NULL,
	`player_id` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`public` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_alias` ON `aliases` (`player_id`,`alias`);--> statement-breakpoint
CREATE TABLE `clans` (
	`clan_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `oauth_account` (
	`providerId` text NOT NULL,
	`provider_user_id` text,
	`user_id` text NOT NULL,
	PRIMARY KEY(`providerId`, `provider_user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`first_name` text,
	`last_name` text,
	`avatar_url` text,
	`email` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`page_type` text NOT NULL,
	`page_id` text NOT NULL,
	`name` text NOT NULL,
	`meta` text,
	`user_id` text NOT NULL,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_bookmark` ON `bookmarks` (`user_id`,`page_type`,`page_id`);--> statement-breakpoint
CREATE TABLE `api-cache` (
	`cacheName` text NOT NULL,
	`cacheId` text PRIMARY KEY NOT NULL,
	`data` text,
	`createdAt` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`version` integer NOT NULL
);
