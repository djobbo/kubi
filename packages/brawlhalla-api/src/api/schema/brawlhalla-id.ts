import { z } from "zod"

import { cleanString } from "@dair/common/src/helpers/cleanString"

export const brawlhallaIdSchema = z.number()

export const brawlhallaNameSchema = z
  .string()
  .transform((value) => cleanString(value))
