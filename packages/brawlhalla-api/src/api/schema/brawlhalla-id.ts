import { z } from "zod"

import { fixEncoding } from "@dair/common/src/helpers/fix-encoding"

export const brawlhallaIdSchema = z.number()

export const brawlhallaNameSchema = z
  .string()
  .transform((value) => fixEncoding(value))
