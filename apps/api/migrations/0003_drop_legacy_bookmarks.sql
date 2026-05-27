CREATE UNIQUE INDEX IF NOT EXISTS "unique_oauth_provider_account" ON "oauth_accounts" USING btree ("provider","provider_user_id");
