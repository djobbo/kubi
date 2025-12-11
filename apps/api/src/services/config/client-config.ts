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
}
