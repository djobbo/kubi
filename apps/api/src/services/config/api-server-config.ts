import { Config, Context, Effect, Layer } from "effect"

/**
 * API Server configuration
 */
export class ApiServerConfig extends Context.Tag("@app/ApiServerConfig")<
  ApiServerConfig,
  {
    readonly url: string
    readonly allowedOrigins: ReadonlyArray<string>
  }
>() {
  static readonly layer = Layer.effect(
    ApiServerConfig,
    Effect.gen(function* () {
      const url = yield* Config.string("API_URL")

      const allowedOrigins = yield* Config.nonEmptyString(
        "ALLOWED_ORIGINS",
      ).pipe(Config.orElse(() => Config.succeed("*")))

      const origins = [
        ...new Set(allowedOrigins.split(",").map((origin) => origin.trim())),
      ]

      return ApiServerConfig.of({
        url,
        allowedOrigins: origins,
      })
    }),
  )

  /**
   * Test layer with local development settings
   */
  static readonly testLayer = Layer.succeed(
    ApiServerConfig,
    ApiServerConfig.of({
      port: 3000,
      url: "http://localhost:3000",
      allowedOrigins: ["*"],
    }),
  )
}
