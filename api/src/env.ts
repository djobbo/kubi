import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
 
export const env = createEnv({
  server: {
    BRAWLHALLA_API_KEY: z.string().min(1),
    USE_MOCKS: z.optional(z.string().refine((s) => s === "true" || s === "false").transform((s) => s === "true")),
    CACHE_MAX_AGE_OVERRIDE: z.number().optional(),
    DATABASE_URL: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
