CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"page_type" text NOT NULL,
	"page_id" text NOT NULL,
	"name" text NOT NULL,
	"meta" jsonb,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legacy_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"page_type" text NOT NULL,
	"page_id" text NOT NULL,
	"name" text NOT NULL,
	"meta" jsonb,
	"discord_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_bookmark" ON "bookmarks" USING btree ("user_id","page_type","page_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_legacy_bookmark" ON "legacy_bookmarks" USING btree ("discord_id","page_type","page_id");