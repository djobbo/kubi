import { Config, Context, Effect, Layer, Redacted } from "effect"

/**
 * Brawlhalla API configuration
 */
export class BrawlhallaApiConfig extends Context.Tag(
  "@app/BrawlhallaApiConfig",
)<
  BrawlhallaApiConfig,
  {
    readonly apiKey: Redacted.Redacted
  }
>() {
  static readonly layer = Layer.effect(
    BrawlhallaApiConfig,
    Effect.gen(function* () {
      const apiKey = yield* Config.redacted("BRAWLHALLA_API_KEY")

      return BrawlhallaApiConfig.of({ apiKey })
    }),
  )

  /**
   * Test layer with mock API key
   */
  static readonly testLayer = Layer.succeed(
    BrawlhallaApiConfig,
    BrawlhallaApiConfig.of({
      apiKey: Redacted.make("test-brawlhalla-key"),
    }),
  )
}

