import { cleanString } from "@dair/common/src/helpers/clean-string"
import { Schema, SchemaGetter, SchemaTransformation } from "effect"

export const CleanString = Schema.String.pipe(
  Schema.decodeTo(
    Schema.String,
    SchemaTransformation.transform({
      decode: (input) => cleanString(input),
      encode: (input) => input,
    }),
  ),
)
