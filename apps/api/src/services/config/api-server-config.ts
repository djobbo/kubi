import { Config, Context, Effect, Layer } from "effect"

/**
 * API Server configuration
 */
export class ApiServerConfig extends Context.Tag("@app/ApiServerConfig")<
  ApiServerConfig,
  {
    readonly port: number
    readonly url: string
    readonly allowedOrigins: ReadonlyArray<string>
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

      return ApiServerConfig.of({
        port,
        url,
        allowedOrigins: origins,
      })
    }),
  )
}
