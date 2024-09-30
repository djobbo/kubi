import { config as loadEnv } from "dotenv"
import { z } from "zod"

import { envField } from "./envField"

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
}

loadEnv({ path: ".env" })
