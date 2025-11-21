import { randomUUID } from "node:crypto"
import { DB } from "@/services/db"
import { OAuthValidationError, UserNotFoundError } from "./errors"
import {
  type NewOAuthAccount,
  type NewUser,
  type Provider,
  oauthAccountsTable,
  usersTable,
} from "@dair/schema/src/auth"
import { and, eq } from "drizzle-orm"
import { Effect } from "effect"
import type { AuthorizationProvider } from "."

/**
 * Validates an OAuth callback and creates/updates user and OAuth account
 */
export const validateOAuthCallback =
  (providers: Record<string, AuthorizationProvider>) =>
  (providerName: Provider, code: string) =>
    Effect.gen(function* () {
      const provider = providers[providerName]
      if (!provider) {
        return yield* Effect.fail(
          new OAuthValidationError({
            provider: providerName,
            message: `Provider ${providerName} not found`,
          }),
        )
      }

      const tokens = yield* provider.getTokens(code).pipe(
        Effect.catchAll((error) =>
          Effect.fail(
            new OAuthValidationError({
              provider: providerName,
              cause: error,
              message: "Failed to get OAuth tokens",
            }),
          ),
        ),
      )

      const accessToken = tokens.accessToken()
      const refreshToken = tokens.refreshToken()
      const expiresAt = new Date(Date.now() + 3600 * 1000) // Default to 1 hour if not provided
      const updatedAt = new Date()

      const userInfo = yield* provider.getUserInfo(accessToken).pipe(
        Effect.catchAll((error) =>
          Effect.fail(
            new OAuthValidationError({
              provider: providerName,
              cause: error,
              message: "Failed to get user info from OAuth provider",
            }),
          ),
        ),
      )

      const db = yield* DB

      // Check if user exists with this OAuth account
      const existingOAuthAccount = yield* db
        .use((client) =>
          client.query.oauthAccountsTable
            .findFirst({
              where: and(
                eq(oauthAccountsTable.provider, providerName),
                eq(oauthAccountsTable.providerUserId, userInfo.id),
              ),
              with: {
                user: true,
              },
            })
            .execute(),
        )
        .pipe(
          Effect.catchTag("DBQueryError", (error) =>
            Effect.fail(
              new OAuthValidationError({
                provider: providerName,
                cause: error,
                message: "Failed to query existing OAuth account",
              }),
            ),
          ),
        )

      if (existingOAuthAccount) {
        // Update tokens
        yield* db
          .use((client) =>
            client
              .update(oauthAccountsTable)
              .set({
                accessToken,
                refreshToken,
                expiresAt,
                updatedAt,
              })
              .where(
                and(
                  eq(oauthAccountsTable.provider, providerName),
                  eq(oauthAccountsTable.providerUserId, userInfo.id),
                ),
              )
              .execute(),
          )
          .pipe(
            Effect.catchTag("DBQueryError", (error) =>
              Effect.fail(
                new OAuthValidationError({
                  provider: providerName,
                  cause: error,
                  message: "Failed to update OAuth tokens",
                }),
              ),
            ),
          )

        return yield* Effect.succeed(existingOAuthAccount.user)
      }

      // Check if user exists with this email
      // TODO: Change this
      // Use current session to link accounts?
      const existingUser = yield* db
        .use((client) =>
          client.query.usersTable
            .findFirst({
              where: eq(usersTable.email, userInfo.email),
            })
            .execute(),
        )
        .pipe(
          Effect.catchTag("DBQueryError", (error) =>
            Effect.fail(
              new OAuthValidationError({
                provider: providerName,
                cause: error,
                message: "Failed to query existing user by email",
              }),
            ),
          ),
        )

      if (existingUser) {
        // Create new OAuth account for existing user
        const newOAuthAccount: NewOAuthAccount = {
          id: randomUUID(),
          userId: existingUser.id,
          provider: providerName,
          providerUserId: userInfo.id,
          accessToken,
          refreshToken,
          expiresAt,
          updatedAt,
        }

        yield* db
          .use((client) =>
            client.insert(oauthAccountsTable).values(newOAuthAccount).execute(),
          )
          .pipe(
            Effect.catchTag("DBQueryError", (error) =>
              Effect.fail(
                new OAuthValidationError({
                  provider: providerName,
                  cause: error,
                  message: "Failed to create OAuth account for existing user",
                }),
              ),
            ),
          )

        return existingUser
      }

      // Create new user and OAuth account
      const newUser: NewUser = {
        id: randomUUID(),
        email: userInfo.email,
        username:
          "username" in userInfo
            ? userInfo.username
            : userInfo.email.split("@")[0] || "anonymous",
        avatarUrl:
          "picture" in userInfo
            ? userInfo.picture
            : `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`,
      }

      const [createdUser] = yield* db
        .use((client) =>
          client.insert(usersTable).values(newUser).returning().execute(),
        )
        .pipe(
          Effect.catchTag("DBQueryError", (error) =>
            Effect.fail(
              new OAuthValidationError({
                provider: providerName,
                cause: error,
                message: "Failed to create new user",
              }),
            ),
          ),
        )

      if (!createdUser) {
        return yield* Effect.fail(
          new UserNotFoundError({
            userId: "unknown",
          }),
        )
      }

      const newOAuthAccount: NewOAuthAccount = {
        id: randomUUID(),
        userId: createdUser.id,
        provider: providerName,
        providerUserId: userInfo.id,
        accessToken,
        refreshToken,
        expiresAt,
        updatedAt,
      }

      yield* db
        .use((client) =>
          client.insert(oauthAccountsTable).values(newOAuthAccount).execute(),
        )
        .pipe(
          Effect.catchTag("DBQueryError", (error) =>
            Effect.fail(
              new OAuthValidationError({
                provider: providerName,
                cause: error,
                message: "Failed to create OAuth account for new user",
              }),
            ),
          ),
        )

      return yield* Effect.succeed(createdUser)
    })
