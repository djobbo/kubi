import { z } from "zod"

import { envField } from "@/env/envField"

// Drizzle Kit uses CJS, so we need to use metaEnv
const metaEnv = { ...(import.meta.env ?? {}), ...process.env }

const NODE_ENV = envField(
  "Node Environment",
  metaEnv.NODE_ENV ?? "development",
  z.enum(["development", "production"]).default("production"),
  "client",
)

const IS_DEV = NODE_ENV === "development"
const IS_PROD = NODE_ENV === "production"

export const env = {
  IS_DEV,
  IS_PROD,
  DATABASE_URL: envField(
    "Database URL",
    metaEnv.DATABASE_URL,
    z.string().min(1),
  ),
  DISCORD_CLIENT_ID: envField(
    "Discord Client ID",
    metaEnv.DISCORD_CLIENT_ID,
    z.string().min(1),
  ),
  DISCORD_CLIENT_SECRET: envField(
    "Discord Client Secret",
    metaEnv.DISCORD_CLIENT_SECRET,
    z.string().min(1),
  ),
  DISCORD_REDIRECT_URI: envField(
    "Discord Redirect URI",
    metaEnv.DISCORD_REDIRECT_URI,
    z.string().min(1),
  ),
  BRAWLHALLA_API_KEY: envField(
    "Brawlhalla API Key",
    metaEnv.BRAWLHALLA_API_KEY,
    z.string().min(1),
  ),
  SOCIAL_DISCORD_URL: envField(
    "Social Discord URL",
    metaEnv.VITE_SOCIAL_DISCORD_URL,
    z.string().min(1),
    "client",
  ),
  SOCIAL_TWITTER_URL: envField(
    "Social Twitter URL",
    metaEnv.VITE_SOCIAL_TWITTER_URL,
    z.string().min(1),
    "client",
  ),
  SOCIAL_GITHUB_URL: envField(
    "Social GitHub URL",
    metaEnv.VITE_SOCIAL_GITHUB_URL,
    z.string().min(1),
    "client",
  ),
  SOCIAL_KOFI_URL: envField(
    "Social Ko-fi URL",
    metaEnv.VITE_SOCIAL_KOFI_URL,
    z.string().min(1),
    "client",
  ),
  GOOGLE_ANALYTICS_TRACKING_ID: envField(
    "Google Analytics Tracking ID",
    metaEnv.VITE_GOOGLE_ANALYTICS_TRACKING_ID,
    z.string().min(1),
    "client",
  ),
  GOOGLE_ADSENSE_ID: envField(
    "Google Adsense ID",
    metaEnv.VITE_GOOGLE_ADSENSE_ID,
    z.string().min(1),
    "client",
  ),
}
