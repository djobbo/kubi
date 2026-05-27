ALTER TABLE "legacy_bookmarks" RENAME COLUMN "discord_id" TO "provider_user_id";--> statement-breakpoint
ALTER TABLE "legacy_bookmarks" ADD COLUMN "provider" text NOT NULL;--> statement-breakpoint
DROP INDEX "unique_legacy_bookmark";--> statement-breakpoint
CREATE UNIQUE INDEX "unique_legacy_bookmark" ON "legacy_bookmarks" ("provider","provider_user_id","page_type","page_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_oauth_provider_account" ON "oauth_accounts" ("provider","provider_user_id");