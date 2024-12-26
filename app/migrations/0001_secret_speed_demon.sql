CREATE SCHEMA "api-cache";
--> statement-breakpoint
CREATE TABLE "api-cache"."api-cache" (
	"cacheName" text NOT NULL,
	"cacheId" varchar(256) PRIMARY KEY NOT NULL,
	"data" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
