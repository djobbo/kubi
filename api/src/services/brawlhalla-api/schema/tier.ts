import { TierNameSchema, isValidTier } from "@dair/api-contract/src/shared/tier"
import { Schema } from "effect"

/**
 * The API returns `null` for Valhallan tier, so we need to handle that case.
 */
export const BrawlhallaApiTier = Schema.transform(
  Schema.NullOr(Schema.NonEmptyTrimmedString),
  TierNameSchema,
  {
    strict: true,
    decode: (input) => {
      if (input === null) {
        return "Valhallan" as const
      }

      if (input === "none") {
        return null
      }

      if (!isValidTier(input)) {
        return null
      }

      return input
    },
    encode: (input) => input,
  },
)
