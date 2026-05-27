import { Effect, Schema } from "effect"

export const withDecodingDefault = <A>(
  schema: Schema.Schema<A>,
  value: A,
) => schema.pipe(Schema.withDecodingDefaultType(Effect.succeed(value)))
