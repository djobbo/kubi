import { drizzle } from "drizzle-orm/postgres-js"

import { relations } from "@dair/db"

import { MIGRATION_DATABASE_URL } from "./env"

export const migrationDb = drizzle(MIGRATION_DATABASE_URL, { relations })
