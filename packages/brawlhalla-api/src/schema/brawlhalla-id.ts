import { cleanString } from "@dair/common/src/helpers/clean-string"
import { Schema, SchemaTransformation } from "effect"

export const BrawlhallaId = Schema.NumberFromString

export const BrawlhallaName = Schema.String.pipe(
  Schema.decodeTo(
    Schema.String,
    SchemaTransformation.transform({
      decode: (name) => cleanString(name),
      encode: (name) => name,
    }),
  ),
)
