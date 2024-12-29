import { config as loadEnv } from "dotenv"
import { z } from "zod"

import { envField } from "@/env/envField"

const DEV_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/postgres"

export const env = {
  DATABASE_URL: envField(
    "Database URL",
    process.env.DATABASE_URL ?? DEV_DATABASE_URL,
    z.string().min(1),
  ),
  DISCORD_CLIENT_ID: envField(
    "Discord Client ID",
    process.env.DISCORD_CLIENT_ID,
    z.string().min(1),
  ),
  DISCORD_CLIENT_SECRET: envField(
    "Discord Client Secret",
    process.env.DISCORD_CLIENT_SECRET,
    z.string().min(1),
  ),
  DISCORD_REDIRECT_URI: envField(
    "Discord Redirect URI",
    process.env.DISCORD_REDIRECT_URI,
    z.string().min(1),
  ),
  NODE_ENV: envField(
    "Node Environment",
    process.env.NODE_ENV ?? "development",
    z.enum(["development", "production"]).default("development"),
  ),
  BRAWLHALLA_API_KEY: envField(
    "Brawlhalla API Key",
    process.env.BRAWLHALLA_API_KEY,
    z.string().min(1),
  ),
  SOCIAL_DISCORD_URL: envField(
    "Social Discord URL",
    process.env.SOCIAL_DISCORD_URL,
    z.string().min(1),
    "client",
  ),
  SOCIAL_TWITTER_URL: envField(
    "Social Twitter URL",
    process.env.SOCIAL_TWITTER_URL,
    z.string().min(1),
    "client",
  ),
  SOCIAL_GITHUB_URL: envField(
    "Social GitHub URL",
    process.env.SOCIAL_GITHUB_URL,
    z.string().min(1),
    "client",
  ),
  SOCIAL_KOFI_URL: envField(
    "Social Ko-fi URL",
    process.env.SOCIAL_KOFI_URL,
    z.string().min(1),
    "client",
  ),
  GOOGLE_ANALYTICS_TRACKING_ID: envField(
    "Google Analytics Tracking ID",
    process.env.GOOGLE_ANALYTICS_TRACKING_ID,
    z.string().min(1),
    "client",
  ),
  GOOGLE_ADSENSE_ID: envField(
    "Google Adsense ID",
    process.env.GOOGLE_ADSENSE_ID,
    z.string().min(1),
    "client",
  ),
}

loadEnv({ path: ".env" })
