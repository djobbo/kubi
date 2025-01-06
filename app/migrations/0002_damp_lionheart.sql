CREATE TABLE "app-archive"."clans" (
	"clan_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp,
	"xp" integer DEFAULT 0 NOT NULL
);
