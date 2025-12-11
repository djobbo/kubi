CREATE TABLE "clan_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"clan_id" bigint NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"name" text,
	"xp" bigint,
	"xp_percentage" bigint,
	"level" bigint,
	"lifetime_xp" bigint,
	"members_count" bigint,
	"created_date" bigint,
	"raw_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_aliases_legacy" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"alias" text NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" bigint NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"name" text,
	"xp" bigint,
	"level" bigint,
	"xp_percentage" bigint,
	"games" bigint,
	"wins" bigint,
	"matchtime" bigint,
	"kos" bigint,
	"falls" bigint,
	"suicides" bigint,
	"team_kos" bigint,
	"damage_dealt" bigint,
	"damage_taken" bigint,
	"winrate" bigint,
	"ranked_1v1_games" bigint,
	"ranked_1v1_wins" bigint,
	"ranked_1v1_losses" bigint,
	"glory_from_wins" bigint,
	"glory_from_peak_rating" bigint,
	"total_glory" bigint,
	"ranked_1v1_rating" bigint,
	"ranked_1v1_peak_rating" bigint,
	"ranked_2v2_games" bigint,
	"ranked_2v2_wins" bigint,
	"ranked_2v2_losses" bigint,
	"ranked_rotating_rating" bigint,
	"ranked_rotating_peak_rating" bigint,
	"ranked_rotating_games" bigint,
	"ranked_rotating_wins" bigint,
	"ranked_rotating_losses" bigint,
	"tier" text,
	"region" text,
	"rating_reset" bigint,
	"clan_id" bigint,
	"raw_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_legend_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_history_id" bigint NOT NULL,
	"player_id" bigint NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"legend_id" bigint NOT NULL,
	"legend_name_key" text,
	"legend_name" text,
	"games" bigint,
	"wins" bigint,
	"xp" bigint,
	"level" bigint,
	"xp_percentage" bigint,
	"damage_dealt" bigint,
	"damage_taken" bigint,
	"kos" bigint,
	"falls" bigint,
	"suicides" bigint,
	"team_kos" bigint,
	"matchtime" bigint,
	"winrate" bigint,
	"rating" bigint,
	"peak_rating" bigint,
	"tier" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_weapon_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_history_id" bigint NOT NULL,
	"player_id" bigint NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"weapon_name" text NOT NULL,
	"games" bigint,
	"wins" bigint,
	"kos" bigint,
	"damage_dealt" bigint,
	"time_held" bigint,
	"level" bigint,
	"xp" bigint,
	"winrate" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_legend_history" ADD CONSTRAINT "player_legend_history_player_history_id_player_history_id_fk" FOREIGN KEY ("player_history_id") REFERENCES "public"."player_history"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_weapon_history" ADD CONSTRAINT "player_weapon_history_player_history_id_player_history_id_fk" FOREIGN KEY ("player_history_id") REFERENCES "public"."player_history"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_clan_recorded" ON "clan_history" USING btree ("clan_id","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_clan_xp" ON "clan_history" USING btree ("xp");--> statement-breakpoint
CREATE INDEX "idx_clan_level" ON "clan_history" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_clan_lifetime_xp" ON "clan_history" USING btree ("lifetime_xp");--> statement-breakpoint
CREATE INDEX "idx_clan_members_count" ON "clan_history" USING btree ("members_count");--> statement-breakpoint
CREATE INDEX "idx_clan_name" ON "clan_history" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_clan_recorded_at" ON "clan_history" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "idx_player_recorded" ON "player_history" USING btree ("player_id","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_rating_1v1" ON "player_history" USING btree ("ranked_1v1_rating");--> statement-breakpoint
CREATE INDEX "idx_peak_rating_1v1" ON "player_history" USING btree ("ranked_1v1_peak_rating");--> statement-breakpoint
CREATE INDEX "idx_games_1v1" ON "player_history" USING btree ("ranked_1v1_games");--> statement-breakpoint
CREATE INDEX "idx_wins_1v1" ON "player_history" USING btree ("ranked_1v1_wins");--> statement-breakpoint
CREATE INDEX "idx_losses_1v1" ON "player_history" USING btree ("ranked_1v1_losses");--> statement-breakpoint
CREATE INDEX "idx_glory_from_wins_1v1" ON "player_history" USING btree ("glory_from_wins");--> statement-breakpoint
CREATE INDEX "idx_glory_from_peak_rating_1v1" ON "player_history" USING btree ("glory_from_peak_rating");--> statement-breakpoint
CREATE INDEX "idx_total_glory_1v1" ON "player_history" USING btree ("total_glory");--> statement-breakpoint
CREATE INDEX "idx_games_2v2" ON "player_history" USING btree ("ranked_2v2_games");--> statement-breakpoint
CREATE INDEX "idx_rating_rotating" ON "player_history" USING btree ("ranked_rotating_rating");--> statement-breakpoint
CREATE INDEX "idx_peak_rating_rotating" ON "player_history" USING btree ("ranked_rotating_peak_rating");--> statement-breakpoint
CREATE INDEX "idx_xp" ON "player_history" USING btree ("xp");--> statement-breakpoint
CREATE INDEX "idx_level" ON "player_history" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_wins" ON "player_history" USING btree ("wins");--> statement-breakpoint
CREATE INDEX "idx_games" ON "player_history" USING btree ("games");--> statement-breakpoint
CREATE INDEX "idx_winrate" ON "player_history" USING btree ("winrate");--> statement-breakpoint
CREATE INDEX "idx_name" ON "player_history" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_recorded_at" ON "player_history" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "idx_player_legend_recorded" ON "player_legend_history" USING btree ("player_id","legend_id","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_legend_wins" ON "player_legend_history" USING btree ("legend_id","wins");--> statement-breakpoint
CREATE INDEX "idx_legend_games" ON "player_legend_history" USING btree ("legend_id","games");--> statement-breakpoint
CREATE INDEX "idx_legend_rating" ON "player_legend_history" USING btree ("legend_id","rating");--> statement-breakpoint
CREATE INDEX "idx_legend_kos" ON "player_legend_history" USING btree ("legend_id","kos");--> statement-breakpoint
CREATE INDEX "idx_legend_winrate" ON "player_legend_history" USING btree ("legend_id","winrate");--> statement-breakpoint
CREATE INDEX "idx_player_wins" ON "player_legend_history" USING btree ("player_id","wins");--> statement-breakpoint
CREATE INDEX "idx_player_weapon_recorded" ON "player_weapon_history" USING btree ("player_id","weapon_name","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_weapon_wins" ON "player_weapon_history" USING btree ("weapon_name","wins");--> statement-breakpoint
CREATE INDEX "idx_weapon_games" ON "player_weapon_history" USING btree ("weapon_name","games");--> statement-breakpoint
CREATE INDEX "idx_weapon_kos" ON "player_weapon_history" USING btree ("weapon_name","kos");--> statement-breakpoint
CREATE INDEX "idx_weapon_winrate" ON "player_weapon_history" USING btree ("weapon_name","winrate");--> statement-breakpoint
CREATE INDEX "idx_player_weapon_wins" ON "player_weapon_history" USING btree ("player_id","wins");