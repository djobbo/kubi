import { Config, Context, Effect, Layer } from "effect"

/**
 * Client application configuration
 */
export class ClientConfig extends Context.Service<ClientConfig>()(
  "@app/ClientConfig",
  {
    make: Effect.gen(function* () {
      const defaultUrl = yield* Config.nonEmptyString("DEFAULT_CLIENT_URL")
      return { defaultUrl }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make)
}
