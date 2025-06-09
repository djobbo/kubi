CREATE SCHEMA "app-aliases";
--> statement-breakpoint
CREATE SCHEMA "app-auth";
--> statement-breakpoint
CREATE SCHEMA "app-bookmarks";
--> statement-breakpoint
CREATE SCHEMA "app-cache";
--> statement-breakpoint
CREATE TYPE "app-auth"."oauth_provider" AS ENUM('discord');--> statement-breakpoint
CREATE TYPE "app-bookmarks"."page_type" AS ENUM('player_stats', 'clan_stats');--> statement-breakpoint
CREATE TABLE "app-aliases"."aliases" (
	"id" serial PRIMARY KEY NOT NULL,
	"alias" text NOT NULL,
	"player_id" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"public" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app-auth"."oauth_account" (
	"provider_id" "app-auth"."oauth_provider",
	"provider_user_id" text,
	"user_id" text NOT NULL,
	CONSTRAINT "oauth_account_provider_id_provider_user_id_pk" PRIMARY KEY("provider_id","provider_user_id")
);
--> statement-breakpoint
CREATE TABLE "app-auth"."session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app-auth"."user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"first_name" text,
	"last_name" text,
	"avatar_url" text,
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app-bookmarks"."bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_type" "app-bookmarks"."page_type" NOT NULL,
	"page_id" text NOT NULL,
	"name" text NOT NULL,
	"meta" json,
	"user_id" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app-cache"."api-cache" (
	"cacheName" text NOT NULL,
	"cacheId" varchar(256) PRIMARY KEY NOT NULL,
	"data" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app-auth"."oauth_account" ADD CONSTRAINT "oauth_account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app-auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app-auth"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app-auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app-bookmarks"."bookmarks" ADD CONSTRAINT "bookmarks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app-auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_alias" ON "app-aliases"."aliases" USING btree ("player_id","alias");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_bookmark" ON "app-bookmarks"."bookmarks" USING btree ("user_id","page_type","page_id");