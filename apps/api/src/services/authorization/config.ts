import { Config, Context, Effect, Layer, Redacted } from "effect"

/**
 * OAuth provider configuration
 */
export class OAuthConfig extends Context.Service<OAuthConfig>()(
  "@app/OAuthConfig",
  {
    make: Effect.gen(function* () {
      const secret = yield* Config.redacted("OAUTH_SECRET")
      const discordClientId = yield* Config.nonEmptyString("DISCORD_CLIENT_ID")
      const discordClientSecret = yield* Config.redacted(
        "DISCORD_CLIENT_SECRET",
      )
      const googleClientId = yield* Config.nonEmptyString("GOOGLE_CLIENT_ID")
      const googleClientSecret = yield* Config.redacted("GOOGLE_CLIENT_SECRET")

      return {
        secret,
        discord: {
          clientId: discordClientId,
          clientSecret: discordClientSecret,
        },
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make)
}
