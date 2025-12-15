CREATE TABLE "brawlhalla_clan_history" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"clan_id" bigint NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text,
	"xp" bigint,
	"level" bigint,
	"lifetime_xp" bigint,
	"members_count" bigint,
	"created_date" bigint,
	"raw_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "brawlhalla_player_aliases" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"player_id" bigint NOT NULL,
	"alias" text NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brawlhalla_player_history" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"player_id" bigint NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"xp" bigint NOT NULL,
	"games" bigint NOT NULL,
	"wins" bigint NOT NULL,
	"losses" bigint NOT NULL,
	"matchtime" bigint NOT NULL,
	"kos" bigint NOT NULL,
	"falls" bigint NOT NULL,
	"suicides" bigint NOT NULL,
	"team_kos" bigint NOT NULL,
	"damage_dealt" bigint NOT NULL,
	"damage_taken" bigint NOT NULL,
	"ranked_games" integer,
	"ranked_wins" integer,
	"ranked_losses" integer,
	"total_glory" integer,
	"ranked_1v1_rating" integer,
	"ranked_1v1_peak_rating" integer,
	"ranked_1v1_games" integer,
	"ranked_1v1_wins" integer,
	"ranked_1v1_losses" integer,
	"ranked_2v2_games" integer,
	"ranked_2v2_wins" integer,
	"ranked_2v2_losses" integer,
	"ranked_rotating_rating" integer,
	"ranked_rotating_peak_rating" integer,
	"ranked_rotating_games" integer,
	"ranked_rotating_wins" integer,
	"ranked_rotating_losses" integer,
	"tier" text,
	"region" text,
	"clan_id" bigint,
	"raw_stats_data" jsonb,
	"raw_ranked_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "brawlhalla_player_legend_history" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"player_history_id" uuid NOT NULL,
	"player_id" bigint NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"legend_id" bigint NOT NULL,
	"games" bigint NOT NULL,
	"wins" bigint NOT NULL,
	"losses" bigint NOT NULL,
	"xp" bigint NOT NULL,
	"damage_dealt" bigint NOT NULL,
	"damage_taken" bigint NOT NULL,
	"kos" bigint NOT NULL,
	"falls" bigint,
	"suicides" bigint NOT NULL,
	"team_kos" bigint NOT NULL,
	"matchtime" bigint NOT NULL,
	"rating" bigint,
	"peak_rating" bigint
);
--> statement-breakpoint
CREATE TABLE "brawlhalla_player_weapon_history" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"player_history_id" uuid NOT NULL,
	"player_id" bigint NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"weapon_name" text NOT NULL,
	"games" bigint NOT NULL,
	"wins" bigint NOT NULL,
	"losses" bigint NOT NULL,
	"kos" bigint NOT NULL,
	"damage_dealt" bigint NOT NULL,
	"time_held" bigint NOT NULL,
	"xp" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "brawlhalla_player_legend_history" ADD CONSTRAINT "brawlhalla_player_legend_history_player_history_id_brawlhalla_player_history_id_fk" FOREIGN KEY ("player_history_id") REFERENCES "public"."brawlhalla_player_history"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brawlhalla_player_weapon_history" ADD CONSTRAINT "brawlhalla_player_weapon_history_player_history_id_brawlhalla_player_history_id_fk" FOREIGN KEY ("player_history_id") REFERENCES "public"."brawlhalla_player_history"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_clan_recorded" ON "brawlhalla_clan_history" USING btree ("clan_id","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_clan_xp" ON "brawlhalla_clan_history" USING btree ("xp");--> statement-breakpoint
CREATE INDEX "idx_clan_level" ON "brawlhalla_clan_history" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_clan_lifetime_xp" ON "brawlhalla_clan_history" USING btree ("lifetime_xp");--> statement-breakpoint
CREATE INDEX "idx_clan_members_count" ON "brawlhalla_clan_history" USING btree ("members_count");--> statement-breakpoint
CREATE INDEX "idx_clan_name" ON "brawlhalla_clan_history" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_clan_recorded_at" ON "brawlhalla_clan_history" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_alias_recorded" ON "brawlhalla_player_aliases" USING btree ("player_id","alias","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_alias" ON "brawlhalla_player_aliases" USING btree ("alias");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_alias_recorded_at" ON "brawlhalla_player_aliases" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_public_recorded_at" ON "brawlhalla_player_aliases" USING btree ("public","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_aliases_player_id" ON "brawlhalla_player_aliases" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_recorded" ON "brawlhalla_player_history" USING btree ("player_id","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_name" ON "brawlhalla_player_history" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_xp" ON "brawlhalla_player_history" USING btree ("xp");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_games" ON "brawlhalla_player_history" USING btree ("games");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_wins" ON "brawlhalla_player_history" USING btree ("wins");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_losses" ON "brawlhalla_player_history" USING btree ("losses");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_games" ON "brawlhalla_player_history" USING btree ("ranked_games");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_wins" ON "brawlhalla_player_history" USING btree ("ranked_wins");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_losses" ON "brawlhalla_player_history" USING btree ("ranked_losses");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_total_glory" ON "brawlhalla_player_history" USING btree ("total_glory");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_1v1_rating" ON "brawlhalla_player_history" USING btree ("ranked_1v1_rating");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_1v1_peak_rating" ON "brawlhalla_player_history" USING btree ("ranked_1v1_peak_rating");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_1v1_games" ON "brawlhalla_player_history" USING btree ("ranked_1v1_games");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_1v1_wins" ON "brawlhalla_player_history" USING btree ("ranked_1v1_wins");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_1v1_losses" ON "brawlhalla_player_history" USING btree ("ranked_1v1_losses");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_2v2_games" ON "brawlhalla_player_history" USING btree ("ranked_2v2_games");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_2v2_wins" ON "brawlhalla_player_history" USING btree ("ranked_2v2_wins");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_2v2_losses" ON "brawlhalla_player_history" USING btree ("ranked_2v2_losses");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_rotating_rating" ON "brawlhalla_player_history" USING btree ("ranked_rotating_rating");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_rotating_peak_rating" ON "brawlhalla_player_history" USING btree ("ranked_rotating_peak_rating");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_rotating_games" ON "brawlhalla_player_history" USING btree ("ranked_rotating_games");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_rotating_wins" ON "brawlhalla_player_history" USING btree ("ranked_rotating_wins");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_ranked_rotating_losses" ON "brawlhalla_player_history" USING btree ("ranked_rotating_losses");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_clan_id" ON "brawlhalla_player_history" USING btree ("clan_id");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_history_recorded_at" ON "brawlhalla_player_history" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_legend_history_recorded" ON "brawlhalla_player_legend_history" USING btree ("player_id","legend_id","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_legend_history_wins" ON "brawlhalla_player_legend_history" USING btree ("legend_id","wins");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_legend_history_games" ON "brawlhalla_player_legend_history" USING btree ("legend_id","games");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_legend_history_rating" ON "brawlhalla_player_legend_history" USING btree ("legend_id","rating");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_legend_history_losses" ON "brawlhalla_player_legend_history" USING btree ("legend_id","losses");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_legend_history_kos" ON "brawlhalla_player_legend_history" USING btree ("legend_id","kos");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_legend_history_player_wins" ON "brawlhalla_player_legend_history" USING btree ("player_id","wins");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_legend_history_xp" ON "brawlhalla_player_legend_history" USING btree ("player_history_id","xp");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_weapon_history_recorded" ON "brawlhalla_player_weapon_history" USING btree ("player_id","weapon_name","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_weapon_history_wins" ON "brawlhalla_player_weapon_history" USING btree ("weapon_name","wins");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_weapon_history_games" ON "brawlhalla_player_weapon_history" USING btree ("weapon_name","games");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_weapon_history_losses" ON "brawlhalla_player_weapon_history" USING btree ("weapon_name","losses");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_weapon_history_kos" ON "brawlhalla_player_weapon_history" USING btree ("weapon_name","kos");--> statement-breakpoint
CREATE INDEX "idx_brawlhalla_player_weapon_history_player_wins" ON "brawlhalla_player_weapon_history" USING btree ("player_id","wins");