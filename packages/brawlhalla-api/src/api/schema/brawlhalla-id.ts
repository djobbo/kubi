import { z } from "zod/v4"

import { cleanString } from "@dair/common/src/helpers/clean-string"

export const brawlhallaIdSchema = z.number()

export const brawlhallaNameSchema = z
  .string()
  .transform((value) => cleanString(value))
