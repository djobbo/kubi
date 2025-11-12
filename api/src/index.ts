import { FetchHttpClient, HttpApiBuilder, HttpServer } from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { Config, Effect, Layer } from "effect";
import { Api } from "./api";
import { ApiLive } from "./api-live";
import * as Archive from "./services/archive";
import * as Authorization from "./services/authorization";
import * as DB from "./services/db";
import * as Docs from "./services/docs";

const getEnv = Effect.gen(function* () {
  const allowedOrigins = (yield* Config.nonEmptyString("ALLOWED_ORIGINS").pipe(
    Config.withDefault("*")
  ))
    .split(",")
    .map((origin) => origin.trim());
  const defaultClientUrl = yield* Config.nonEmptyString("DEFAULT_CLIENT_URL");
  return {
    api: {
      allowedOrigins: [...new Set(allowedOrigins)],
      port: yield* Config.number("API_PORT").pipe(Config.withDefault(3000)),
      url: yield* Config.string("API_URL"),
    },
    client: {
      defaultUrl: defaultClientUrl,
    },
    oauth: {
      secret: yield* Config.nonEmptyString("OAUTH_SECRET"),
      discord: {
        clientId: yield* Config.nonEmptyString("DISCORD_CLIENT_ID"),
        clientSecret: yield* Config.nonEmptyString("DISCORD_CLIENT_SECRET"),
      },
      google: {
        clientId: yield* Config.nonEmptyString("GOOGLE_CLIENT_ID"),
        clientSecret: yield* Config.nonEmptyString("GOOGLE_CLIENT_SECRET"),
      },
    },
    brawlhalla: {
      apiKey: yield* Config.nonEmptyString("BRAWLHALLA_API_KEY"),
    },
    db: {
      url: yield* Config.nonEmptyString("DATABASE_URL"),
      cacheVersion: yield* Config.number("DATABASE_CACHE_VERSION"),
    },
  };
});

const api = Effect.gen(function* () {
  const env = yield* getEnv;

  const ServerLive = HttpApiBuilder.serve().pipe(
    Layer.provide(
      HttpApiBuilder.middlewareCors({
        allowedOrigins: env.api.allowedOrigins,
        allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      })
    ),
    HttpServer.withLogAddress,
    Layer.provide(ApiLive),
    Layer.provide(BunHttpServer.layer({ port: env.api.port })),
    Layer.provide(Archive.layer()),
    Layer.provide(DB.layer({ url: env.db.url })),
    Layer.provide(
      Authorization.layer({
        apiUrl: env.api.url,
        defaultClientUrl: env.client.defaultUrl,
        oauth: {
          secret: env.oauth.secret,
          discord: {
            clientId: env.oauth.discord.clientId,
            clientSecret: env.oauth.discord.clientSecret,
          },
          google: {
            clientId: env.oauth.google.clientId,
            clientSecret: env.oauth.google.clientSecret,
          },
        },
      })
    ),
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(Docs.layer(Api))
  );

  return yield* Layer.launch(ServerLive).pipe(
    Effect.catchAll((error) => {
      console.error(error);
      return Effect.die(error);
    })
  );
});

Effect.runFork(
  api.pipe(
    Effect.catchTag("ConfigError", (error) => {
      console.error("Missing environment variable:", error.message);
      return Effect.die(error);
    }),
    Effect.catchAll(Effect.logError)
  )
);
