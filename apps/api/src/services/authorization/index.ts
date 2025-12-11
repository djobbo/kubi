import { State } from "@dair/api-contract/src/routes/v1/auth/providers/callback"
import {
  DISCORD_PROVIDER_ID,
  GOOGLE_PROVIDER_ID,
  type Provider,
} from "@dair/db"
import { HttpApiBuilder, HttpApiSecurity, HttpClient } from "@effect/platform"
import { Unauthorized } from "@effect/platform/HttpApiError"
import type {
  RequestError,
  ResponseError,
} from "@effect/platform/HttpClientError"
import { Discord, Google, type OAuth2Tokens } from "arctic"
import { Effect, flow, Layer, Redacted, Schema } from "effect"
import type { ParseError } from "effect/ParseResult"
import { OAuthConfig } from "./config"
import { ClientConfig } from "@/services/config/client-config"
import { ApiServerConfig } from "@/services/config/api-server-config"
import { OAuthValidationError } from "./errors"
import { createSession, deleteSession, getSession } from "./session"
import { validateOAuthCallback } from "./validate-oauth-callback"

export const SESSION_COOKIE = "dair-session"

export const sessionApiKey = HttpApiSecurity.apiKey({
  in: "cookie",
  key: SESSION_COOKIE,
})

export type SessionWithUser = {
  readonly id: string
  readonly userId: string
  readonly expiresAt: Date
  readonly user: {
    readonly id: string
    readonly email: string
    readonly username: string
    readonly avatarUrl: string
    readonly oauthAccounts: ReadonlyArray<unknown>
    readonly bookmarks: ReadonlyArray<unknown>
  }
}

export type OAuthUser = {
  readonly id: string
  readonly email: string
  readonly username: string
  readonly avatarUrl: string
}

const GoogleUser = Schema.Struct({
  id: Schema.String,
  email: Schema.String,
  name: Schema.String,
  picture: Schema.String,
})

const DiscordUser = Schema.Struct({
  id: Schema.String,
  email: Schema.String,
  username: Schema.String,
  avatar: Schema.String,
  verified: Schema.optional(Schema.Boolean),
})

export class Authorization extends Effect.Service<Authorization>()(
  "@dair/services/Authorization",
  {
    effect: Effect.gen(function* () {
      const oauthConfig = yield* OAuthConfig
      const clientConfig = yield* ClientConfig
      const serverConfig = yield* ApiServerConfig

      const google = new Google(
        oauthConfig.google.clientId,
        Redacted.value(oauthConfig.google.clientSecret),
        `${serverConfig.url}/v1/auth/providers/${GOOGLE_PROVIDER_ID}/callback`,
      )

      const discord = new Discord(
        oauthConfig.discord.clientId,
        Redacted.value(oauthConfig.discord.clientSecret),
        `${serverConfig.url}/v1/auth/providers/${DISCORD_PROVIDER_ID}/callback`,
      )

      return makeAuthorization({
        defaultClientUrl: clientConfig.defaultUrl,
        oauthSecret: Redacted.value(oauthConfig.secret),
        providers: {
          google: {
            provider: google,
            getTokens: Effect.fn("getGoogleTokens")(function* (code: string) {
              return yield* Effect.tryPromise({
                try: () =>
                  google.validateAuthorizationCode(
                    code,
                    Redacted.value(oauthConfig.secret),
                  ),
                catch: () => new Unauthorized(),
              })
            }),
            getUserInfo: Effect.fn("getGoogleUserInfo")(function* (
              accessToken: string,
            ) {
              const client = yield* HttpClient.HttpClient

              const response = yield* client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                },
              )
              const data = yield* response.json

              const userInfo = yield* Schema.decodeUnknown(GoogleUser)(data)
              return userInfo as typeof GoogleUser.Type
            }),
            createAuthorizationURL: (state: string) =>
              google.createAuthorizationURL(
                state,
                Redacted.value(oauthConfig.secret),
                [
                  "https://www.googleapis.com/auth/userinfo.email",
                  "https://www.googleapis.com/auth/userinfo.profile",
                ],
              ),
          },
          discord: {
            provider: discord,
            getTokens: Effect.fn("getDiscordTokens")(function* (code: string) {
              return yield* Effect.tryPromise({
                try: () => discord.validateAuthorizationCode(code, null),
                catch: () => new Unauthorized(),
              })
            }),
            getUserInfo: Effect.fn("getDiscordUserInfo")(function* (
              accessToken: string,
            ) {
              const client = yield* HttpClient.HttpClient

              const response = yield* client.get(
                "https://discord.com/api/users/@me",
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                },
              )
              const data = yield* response.json

              const userInfo = yield* Schema.decodeUnknown(DiscordUser)(data)
              if (!userInfo.verified) {
                return yield* OAuthValidationError.make({
                  provider: "discord",
                  message: "Discord email is not verified",
                })
              }

              return userInfo
            }),
            createAuthorizationURL: (state: string) =>
              discord.createAuthorizationURL(state, null, [
                "identify",
                "email",
              ]),
          },
        },
      })
    }),
  },
) {
  static readonly layer = this.Default.pipe(
    Layer.provide(OAuthConfig.layer),
    Layer.provide(ClientConfig.layer),
    Layer.provide(ApiServerConfig.layer),
  )
}

export interface AuthorizationProvider<
  Provider extends Google | Discord = Google | Discord,
  UserInfo = typeof GoogleUser.Type | typeof DiscordUser.Type,
> {
  provider: Provider
  getTokens: (code: string) => Effect.Effect<OAuth2Tokens, Unauthorized, never>
  getUserInfo: (
    accessToken: string,
  ) => Effect.Effect<
    UserInfo,
    | Unauthorized
    | ParseError
    | RequestError
    | ResponseError
    | OAuthValidationError,
    HttpClient.HttpClient
  >
  createAuthorizationURL: (state: string) => URL
}

interface AuthorizationOptions {
  defaultClientUrl: string
  oauthSecret: string
  providers: {
    google: AuthorizationProvider<Google, typeof GoogleUser.Type>
    discord: AuthorizationProvider<Discord, typeof DiscordUser.Type>
  }
}

const makeAuthorization = (options: AuthorizationOptions) => {
  const validateOauth = validateOAuthCallback(options.providers)

  const service = {
    defaultClientUrl: options.defaultClientUrl,
    createSession: Effect.fn("createSession")(function* (userId: string) {
      return yield* createSession(userId)
    }),
    deleteSession: Effect.fn("deleteSession")(function* () {
      const redactedSessionId =
        yield* HttpApiBuilder.securityDecode(sessionApiKey)
      const sessionId = Redacted.value(redactedSessionId)
      yield* deleteSession(sessionId)
    }),
    getSession: Effect.fn("getSession")(function* () {
      const redactedSessionId =
        yield* HttpApiBuilder.securityDecode(sessionApiKey)
      const sessionId = Redacted.value(redactedSessionId)
      const session = yield* getSession(sessionId)
      return session
    }),
    createAuthorizationURL: (
      providerName: Provider,
      state: typeof State.Type,
    ) => {
      const oauthState = btoa(JSON.stringify(state))
      return options.providers[providerName].createAuthorizationURL(oauthState)
    },
    createRedirectUrl: Effect.fn("createRedirectUrl")(
      function* (state: string) {
        const { path = "/", baseUrl = options.defaultClientUrl } =
          yield* Schema.decodeUnknown(State)(JSON.parse(atob(state)))

        const url = new URL(path, new URL(baseUrl).origin)
        return url
      },
      flow(
        Effect.catchAll((error) =>
          OAuthValidationError.make({
            provider: "unknown",
            cause: error,
            message: "Failed to decode OAuth state",
          }),
        ),
      ),
    ),
    validateOAuthCallback: (providerName: Provider, code: string) =>
      validateOauth(providerName, code),
  }

  return service
}
