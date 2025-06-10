PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_clans` (
	`clan_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`createdAt` integer,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_clans`("clan_id", "name", "createdAt", "updatedAt", "xp") SELECT "clan_id", "name", "createdAt", "updatedAt", "xp" FROM `clans`;--> statement-breakpoint
DROP TABLE `clans`;--> statement-breakpoint
ALTER TABLE `__new_clans` RENAME TO `clans`;--> statement-breakpoint
PRAGMA foreign_keys=ON;