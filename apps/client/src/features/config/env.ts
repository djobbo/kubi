import { Effect, Schema } from "effect"

const EnvSchema = Schema.Struct({
  NODE_ENV: Schema.Literals(["development", "production"]).pipe(
    Schema.withDecodingDefaultType(Effect.succeed("production")),
  ),
  VITE_CLIENT_URL: Schema.NonEmptyString,
  VITE_API_URL: Schema.NonEmptyString,
  VITE_BRAWLHALLA_WIKI_URL: Schema.NonEmptyString,
  VITE_SOCIAL_DISCORD_URL: Schema.NonEmptyString,
  VITE_SOCIAL_GITHUB_URL: Schema.NonEmptyString,
  VITE_SOCIAL_TWITTER_URL: Schema.NonEmptyString,
  VITE_SOCIAL_KOFI_URL: Schema.NonEmptyString,
  VITE_GOOGLE_ANALYTICS_TRACKING_ID: Schema.NonEmptyString,
  VITE_GOOGLE_ADSENSE_ID: Schema.NonEmptyString,
})

export const env = Schema.decodeUnknownSync(EnvSchema)(import.meta.env)
