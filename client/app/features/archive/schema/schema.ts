import { pgSchema } from "drizzle-orm/pg-core"

import { CUSTOM_SCHEMA_PREFIX } from "@/db/constants"

export const archiveSchema = pgSchema(`${CUSTOM_SCHEMA_PREFIX}-archive`)
