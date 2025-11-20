import { Schema } from "effect"

const EnvSchema = Schema.Struct({
  NODE_ENV: Schema.optional(Schema.Literal("development", "production")).pipe(
    Schema.withDefaults({
      constructor: () => "production" as const,
      decoding: () => "production" as const,
    }),
  ),
  VITE_CLIENT_URL: Schema.NonEmptyTrimmedString,
  VITE_API_URL: Schema.NonEmptyTrimmedString,
  VITE_BRAWLHALLA_WIKI_URL: Schema.NonEmptyTrimmedString,
  VITE_SOCIAL_DISCORD_URL: Schema.NonEmptyTrimmedString,
  VITE_SOCIAL_GITHUB_URL: Schema.NonEmptyTrimmedString,
  VITE_SOCIAL_TWITTER_URL: Schema.NonEmptyTrimmedString,
  VITE_SOCIAL_KOFI_URL: Schema.NonEmptyTrimmedString,
  VITE_GOOGLE_ANALYTICS_TRACKING_ID: Schema.NonEmptyTrimmedString,
  VITE_GOOGLE_ADSENSE_ID: Schema.NonEmptyTrimmedString,
})

export const env = Schema.decodeUnknownSync(EnvSchema)(import.meta.env)
