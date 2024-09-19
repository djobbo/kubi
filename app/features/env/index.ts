import {config as loadEnv} from "dotenv"
import {z} from "zod"

import {envField} from "./lib/envField"

const DEV_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/postgres"

export const env = {
  DATABASE_URL: envField(
    "Database URL",
    process.env.DATABASE_URL ?? DEV_DATABASE_URL,
    z.string().min(1),
  ),
}

loadEnv({path: ".env"})
