import {
	DISCORD_PROVIDER_ID,
	GOOGLE_PROVIDER_ID,
	type Provider,
} from "@dair/schema/src/auth"
import { HttpApiBuilder, HttpApiSecurity, HttpClient } from "@effect/platform"
import { Unauthorized } from "@effect/platform/HttpApiError"
import type {
	RequestError,
	ResponseError,
} from "@effect/platform/HttpClientError"
import { Discord, Google, type OAuth2Tokens, generateState } from "arctic"
import { Config, Context, Effect, Layer, Redacted, Schema } from "effect"
import type { ParseError } from "effect/ParseResult"
import { State } from "../../routes/auth/providers/callback/handler"
import { createSession, deleteSession, getSession } from "./session"
import { validateOAuthCallback } from "./validate-oauth-callback"

export const SESSION_COOKIE = "dair-session"

export const sessionApiKey = HttpApiSecurity.apiKey({
	in: "cookie",
	key: SESSION_COOKIE,
})

const authorization = (options: AuthorizationOptions) => {
	const validateOauth = validateOAuthCallback(options.providers)

	return {
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
			}),
		validateOAuthCallback: (providerName: Provider, code: string) =>
			Effect.gen(function* () {
				const user = yield* validateOauth(providerName, code)
				return user
			}),
	}
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

export class Authorization extends Context.Tag("Authorization")<
	Authorization,
	ReturnType<typeof authorization>
>() {}

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
	providers: {
		google: AuthorizationProvider<Google, typeof GoogleUser.Type>
		discord: AuthorizationProvider<Discord, typeof DiscordUser.Type>
	}
}

export const make = (options: AuthorizationOptions) => {
	const auth = authorization(options)
	return Effect.succeed(Authorization.of(auth))
}

interface AuthorizationLayerOptions {
	apiUrl: string
	defaultClientUrl: string
	oauth: {
		secret: string
		discord: {
			clientId: string
			clientSecret: string
		}
		google: {
			clientId: string
			clientSecret: string
		}
	}
}

export const layer = ({
	oauth,
	apiUrl,
	defaultClientUrl,
}: AuthorizationLayerOptions) => {
	const google = new Google(
		oauth.google.clientId,
		oauth.google.clientSecret,
		`${apiUrl}/v1/auth/providers/${GOOGLE_PROVIDER_ID}/callback`,
	)

	const discord = new Discord(
		oauth.discord.clientId,
		oauth.discord.clientSecret,
		`${apiUrl}/v1/auth/providers/${DISCORD_PROVIDER_ID}/callback`,
	)

	return Layer.scoped(
		Authorization,
		make({
			defaultClientUrl,
			providers: {
				google: {
					provider: google,
					getTokens: (code: string) =>
						Effect.tryPromise({
							try: () => google.validateAuthorizationCode(code, oauth.secret),
							catch: (error) => {
								return new Unauthorized()
							},
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
						google.createAuthorizationURL(state, oauth.secret, [
							"https://www.googleapis.com/auth/userinfo.email",
							"https://www.googleapis.com/auth/userinfo.profile",
						]),
				},
				discord: {
					provider: discord,
					getTokens: (code: string) =>
						Effect.tryPromise({
							try: () => discord.validateAuthorizationCode(code, null),
							catch: (error) => {
								return new Unauthorized()
							},
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
						discord.createAuthorizationURL(state, null, ["identify", "email"]),
				},
			},
		}),
	)
}
