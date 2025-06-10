import { z } from "zod"

import { envField } from "@/env/envField"

export const MIGRATION_SUPABASE_URL = envField(
	"MIGRATION_SUPABASE_URL",
	process.env.MIGRATION_SUPABASE_URL,
	z.string().min(1),
)

export const MIGRATION_SUPABASE_SERVICE_KEY = envField(
	"MIGRATION_SUPABASE_SERVICE_KEY",
	process.env.MIGRATION_SUPABASE_SERVICE_KEY,
	z.string().min(1),
)

export const MIGRATION_SUPABASE_DATABASE_URL = envField(
	"MIGRATION_SUPABASE_DATABASE_URL",
	process.env.MIGRATION_SUPABASE_DATABASE_URL,
	z.string().min(1),
)

export const MIGRATION_DATABASE_URL = envField(
	"MIGRATION_DATABASE_URL",
	process.env.DATABASE_URL,
	z.string().min(1),
)
