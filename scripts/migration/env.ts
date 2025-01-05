import { z } from "zod"

import { envField } from "@/env/envField"

export const SUPABASE_URL = envField(
  "SUPABASE_URL",
  process.env.SUPABASE_URL,
  z.string().min(1),
)

export const SUPABASE_SERVICE_KEY = envField(
  "SUPABASE_SERVICE_KEY",
  process.env.SUPABASE_SERVICE_KEY,
  z.string().min(1),
)

export const SUPABASE_DATABASE_URL = envField(
  "SUPABASE_DATABASE_URL",
  process.env.SUPABASE_DATABASE_URL,
  z.string().min(1),
)
