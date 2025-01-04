CREATE SCHEMA "app-aliases";
--> statement-breakpoint
CREATE TABLE "app-aliases"."aliases" (
	"id" serial PRIMARY KEY NOT NULL,
	"alias" text NOT NULL,
	"player_id" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"public" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "unique_alias" ON "app-aliases"."aliases" USING btree ("player_id","alias");