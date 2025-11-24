import { Config, Context, Effect, Layer, Redacted } from "effect"

/**
 * OAuth provider configuration
 */
export class OAuthConfig extends Context.Tag("@app/OAuthConfig")<
  OAuthConfig,
  {
    readonly secret: Redacted.Redacted
    readonly discord: {
      readonly clientId: string
      readonly clientSecret: Redacted.Redacted
    }
    readonly google: {
      readonly clientId: string
      readonly clientSecret: Redacted.Redacted
    }
  }
>() {
  static readonly layer = Layer.effect(
    OAuthConfig,
    Effect.gen(function* () {
      const secret = yield* Config.redacted("OAUTH_SECRET")
      const discordClientId = yield* Config.nonEmptyString("DISCORD_CLIENT_ID")
      const discordClientSecret = yield* Config.redacted(
        "DISCORD_CLIENT_SECRET",
      )
      const googleClientId = yield* Config.nonEmptyString("GOOGLE_CLIENT_ID")
      const googleClientSecret = yield* Config.redacted("GOOGLE_CLIENT_SECRET")

      return OAuthConfig.of({
        secret,
        discord: {
          clientId: discordClientId,
          clientSecret: discordClientSecret,
        },
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      })
    }),
  )

  /**
   * Test layer with mock OAuth credentials
   */
  static readonly testLayer = Layer.succeed(
    OAuthConfig,
    OAuthConfig.of({
      secret: Redacted.make("test-oauth-secret"),
      discord: {
        clientId: "test-discord-client-id",
        clientSecret: Redacted.make("test-discord-secret"),
      },
      google: {
        clientId: "test-google-client-id",
        clientSecret: Redacted.make("test-google-secret"),
      },
    }),
  )
}

