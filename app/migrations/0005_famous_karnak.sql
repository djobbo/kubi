ALTER SCHEMA "auth" RENAME TO "app-auth";
--> statement-breakpoint
ALTER SCHEMA "bookmarks" RENAME TO "app-bookmarks";
--> statement-breakpoint
ALTER SCHEMA "cache" RENAME TO "app-cache";
--> statement-breakpoint
ALTER TABLE "app-auth"."oauth_account" DROP CONSTRAINT "oauth_account_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "app-auth"."session" DROP CONSTRAINT "session_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "app-bookmarks"."bookmarks" DROP CONSTRAINT "bookmarks_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "app-auth"."oauth_account" ADD CONSTRAINT "oauth_account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app-auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app-auth"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app-auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app-bookmarks"."bookmarks" ADD CONSTRAINT "bookmarks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app-auth"."user"("id") ON DELETE no action ON UPDATE no action;