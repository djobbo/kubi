CREATE SCHEMA "bookmarks";
--> statement-breakpoint
CREATE TYPE "bookmarks"."page_type" AS ENUM('player_stats', 'clan_stats');--> statement-breakpoint
CREATE TABLE "bookmarks"."bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_type" "bookmarks"."page_type" NOT NULL,
	"page_id" text NOT NULL,
	"meta" json,
	"user_id" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookmarks"."bookmarks" ADD CONSTRAINT "bookmarks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_bookmark" ON "bookmarks"."bookmarks" USING btree ("user_id","page_type","page_id");