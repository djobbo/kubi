CREATE TABLE IF NOT EXISTS "legacy_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"page_type" text NOT NULL,
	"page_id" text NOT NULL,
	"name" text NOT NULL,
	"meta" jsonb,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'legacy_bookmarks'
      AND column_name = 'discord_id'
  ) THEN
    ALTER TABLE "legacy_bookmarks" RENAME COLUMN "discord_id" TO "provider_user_id";
    ALTER TABLE "legacy_bookmarks" ADD COLUMN IF NOT EXISTS "provider" text;
    UPDATE "legacy_bookmarks" SET "provider" = 'discord' WHERE "provider" IS NULL;
    ALTER TABLE "legacy_bookmarks" ALTER COLUMN "provider" SET NOT NULL;
  END IF;
END $$;
--> statement-breakpoint
DROP INDEX IF EXISTS "unique_legacy_bookmark";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_legacy_bookmark" ON "legacy_bookmarks" USING btree ("provider","provider_user_id","page_type","page_id");
