import { HttpApiSchema } from '@effect/platform';

export * from "@effect/platform/HttpApiError"

export class TooManyRequests extends HttpApiSchema.EmptyError<TooManyRequests>()({
    tag: "TooManyRequests",
    status: 429
  }) {}
  