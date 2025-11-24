import { Config, Context, Effect, Layer } from "effect"

/**
 * Client application configuration
 */
export class ClientConfig extends Context.Tag("@app/ClientConfig")<
  ClientConfig,
  {
    readonly defaultUrl: string
  }
>() {
  static readonly layer = Layer.effect(
    ClientConfig,
    Effect.gen(function* () {
      const defaultUrl = yield* Config.nonEmptyString("DEFAULT_CLIENT_URL")

      return ClientConfig.of({ defaultUrl })
    }),
  )

  /**
   * Test layer with local client URL
   */
  static readonly testLayer = Layer.succeed(
    ClientConfig,
    ClientConfig.of({
      defaultUrl: "http://localhost:3001",
    }),
  )
}

