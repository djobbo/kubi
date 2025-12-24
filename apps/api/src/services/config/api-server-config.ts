import { Config, Context, Effect, Layer, Option, Redacted } from "effect"

/**
 * API Server configuration
 */
export class ApiServerConfig extends Context.Tag("@app/ApiServerConfig")<
  ApiServerConfig,
  {
    readonly port: number
    readonly url: string
    readonly allowedOrigins: ReadonlyArray<string>
    /** Optional API key for worker authentication. When provided, requests with matching X-Worker-API-Key header use fetch-first strategy. */
    readonly workerApiKey: Option.Option<Redacted.Redacted<string>>
  }
>() {
  static readonly layer = Layer.effect(
    ApiServerConfig,
    Effect.gen(function* () {
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

      return ApiServerConfig.of({
        port,
        url,
        allowedOrigins: origins,
        workerApiKey,
      })
    }),
  )
}
