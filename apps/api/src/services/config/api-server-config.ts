import { Config, Context, Effect, Layer, Option, Redacted } from "effect"

/**
 * API Server configuration
 */
export class ApiServerConfig extends Context.Service<ApiServerConfig>()(
  "@app/ApiServerConfig",
  {
    make: Effect.gen(function* () {
      const port = yield* Config.number("API_PORT").pipe(
        Config.orElse(() => Config.succeed(3000)),
      )
      const url = yield* Config.string("API_URL")

      const allowedOrigins = yield* Config.nonEmptyString(
        "ALLOWED_ORIGINS",
      ).pipe(Config.orElse(() => Config.succeed("*")))

      const origins = [
        ...new Set(allowedOrigins.split(",").map((origin) => origin.trim())),
      ]

      const workerApiKey = yield* Config.redacted("WORKER_API_KEY").pipe(
        Config.option,
      )

      return {
        port,
        url,
        allowedOrigins: origins,
        workerApiKey,
      }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make)
}
