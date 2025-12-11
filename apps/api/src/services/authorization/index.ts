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
import { Context, Effect, Layer, Redacted, Schema } from "effect"
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

/**
 * Session type returned by getSession
 */
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

/**
 * User type returned by validateOAuthCallback
 */
export type OAuthUser = {
  readonly id: string
  readonly email: string
  readonly username: string
  readonly avatarUrl: string
}

/**
 * Authorization service interface
 */
export interface AuthorizationService {
  readonly defaultClientUrl: string
  readonly createSession: (userId: string) => Effect.Effect<string>
  readonly deleteSession: () => Effect.Effect<void>
  readonly getSession: () => Effect.Effect<SessionWithUser | null>
  readonly createAuthorizationURL: (
    providerName: Provider,
    state: typeof State.Type,
  ) => URL
  readonly createRedirectUrl: (
    state: string,
  ) => Effect.Effect<URL, OAuthValidationError>
  readonly validateOAuthCallback: (
    providerName: Provider,
    code: string,
  ) => Effect.Effect<OAuthUser, OAuthValidationError>
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

/**
 * Authorization service for OAuth authentication and session management
 */
export class Authorization extends Context.Tag("@app/Authorization")<
  Authorization,
  AuthorizationService
>() {
  /**
   * Live layer for Authorization service
   */
  static readonly layer = Layer.effect(
    Authorization,
    Effect.gen(function* () {
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

      const service = makeAuthorization({
        defaultClientUrl: clientConfig.defaultUrl,
        oauthSecret: Redacted.value(oauthConfig.secret),
        providers: {
          google: {
            provider: google,
            getTokens: (code: string) =>
              Effect.tryPromise({
                try: () =>
                  google.validateAuthorizationCode(
                    code,
                    Redacted.value(oauthConfig.secret),
                  ),
                catch: () => new Unauthorized(),
              }),
            getUserInfo: (accessToken: string) =>
              Effect.gen(function* () {
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
            getTokens: (code: string) =>
              Effect.tryPromise({
                try: () => discord.validateAuthorizationCode(code, null),
                catch: () => new Unauthorized(),
              }),
            getUserInfo: (accessToken: string) =>
              Effect.gen(function* () {
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
                  throw new Error("Discord email is not verified")
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

      return Authorization.of(service)
    }),
  ).pipe(
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
    Unauthorized | ParseError | RequestError | ResponseError,
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

/**
 * Creates the Authorization service implementation
 */
const makeAuthorization = (options: AuthorizationOptions) => {
  const validateOauth = validateOAuthCallback(options.providers)

  const service: AuthorizationService = {
    defaultClientUrl: options.defaultClientUrl,
    createSession: (userId: string) => createSession(userId),
    deleteSession: () =>
      Effect.gen(function* () {
        const redactedSessionId =
          yield* HttpApiBuilder.securityDecode(sessionApiKey)
        const sessionId = Redacted.value(redactedSessionId)
        yield* deleteSession(sessionId)
      }),
    getSession: () =>
      Effect.gen(function* () {
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
    createRedirectUrl: (state: string) =>
      Effect.gen(function* () {
        const { path = "/", baseUrl = options.defaultClientUrl } =
          yield* Schema.decodeUnknown(State)(JSON.parse(atob(state)))

        const url = new URL(path, new URL(baseUrl).origin)
        return url
      }).pipe(
        Effect.catchAll((error) =>
          Effect.fail(
            new OAuthValidationError({
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
