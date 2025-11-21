import { Context, Effect, Layer, Config as EffectConfig } from "effect"
import { ConfigError } from "./errors"

/**
 * Configuration interface for the application
 */
export interface AppConfig {
  readonly api: {
    readonly allowedOrigins: ReadonlyArray<string>
    readonly port: number
    readonly url: string
  }
  readonly client: {
    readonly defaultUrl: string
  }
  readonly oauth: {
    readonly secret: string
    readonly discord: {
      readonly clientId: string
      readonly clientSecret: string
    }
    readonly google: {
      readonly clientId: string
      readonly clientSecret: string
    }
  }
  readonly brawlhalla: {
    readonly apiKey: string
  }
  readonly db: {
    readonly url: string
    readonly cacheVersion: number
  }
}

/**
 * Config service tag for dependency injection
 */
export class Config extends Context.Tag("Config")<Config, AppConfig>() {}

/**
 * Loads and validates all application configuration from environment variables
 */
const makeConfig = Effect.gen(function* () {
  const allowedOrigins = (yield* EffectConfig.nonEmptyString(
    "ALLOWED_ORIGINS",
  ).pipe(EffectConfig.withDefault("*")))
    .split(",")
    .map((origin) => origin.trim())

  const config: AppConfig = {
    api: {
      allowedOrigins: [...new Set(allowedOrigins)],
      port: yield* EffectConfig.number("API_PORT").pipe(
        EffectConfig.withDefault(3000),
      ),
      url: yield* EffectConfig.string("API_URL"),
    },
    client: {
      defaultUrl: yield* EffectConfig.nonEmptyString("DEFAULT_CLIENT_URL"),
    },
    oauth: {
      secret: yield* EffectConfig.nonEmptyString("OAUTH_SECRET"),
      discord: {
        clientId: yield* EffectConfig.nonEmptyString("DISCORD_CLIENT_ID"),
        clientSecret: yield* EffectConfig.nonEmptyString(
          "DISCORD_CLIENT_SECRET",
        ),
      },
      google: {
        clientId: yield* EffectConfig.nonEmptyString("GOOGLE_CLIENT_ID"),
        clientSecret: yield* EffectConfig.nonEmptyString(
          "GOOGLE_CLIENT_SECRET",
        ),
      },
    },
    brawlhalla: {
      apiKey: yield* EffectConfig.nonEmptyString("BRAWLHALLA_API_KEY"),
    },
    db: {
      url: yield* EffectConfig.nonEmptyString("DATABASE_URL"),
      cacheVersion: yield* EffectConfig.number("DATABASE_CACHE_VERSION"),
    },
  }

  return config
}).pipe(
  Effect.catchAll((error) =>
    Effect.fail(
      new ConfigError({
        cause: error,
        message: "Failed to load configuration from environment variables",
      }),
    ),
  ),
)

/**
 * Live layer for Config service
 */
export const ConfigLive = Layer.effect(Config, makeConfig)
