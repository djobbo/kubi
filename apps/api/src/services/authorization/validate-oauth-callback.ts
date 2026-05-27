import { randomUUID } from "node:crypto"
import { Database } from "@/services/db"
import { OAuthValidationError, UserNotFoundError } from "./errors"
import {
  type NewOAuthAccount,
  type NewUser,
  type Provider,
  oauthAccountsTable,
  usersTable,
} from "@dair/db"
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
        Effect.catch((error) =>
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
        Effect.catch((error) =>
          Effect.fail(
            new OAuthValidationError({
              provider: providerName,
              cause: error,
              message: "Failed to get user info from OAuth provider",
            }),
          ),
        ),
      )

      const db = yield* Database

      // Check if user exists with this OAuth account
      const existingOAuthAccount = yield* db.query.oauthAccountsTable.findFirst(
        {
          where: {
            provider: { eq: providerName },
            providerUserId: { eq: userInfo.id },
          },
          with: {
            user: true,
          },
        },
      )

      if (existingOAuthAccount) {
        // Update tokens
        yield* db
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

        return yield* Effect.succeed(existingOAuthAccount.user)
      }

      const existingUser = yield* db.query.usersTable.findFirst({
        where: { email: { eq: userInfo.email } },
      })

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

        yield* db.insert(oauthAccountsTable).values(newOAuthAccount)

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
        .insert(usersTable)
        .values(newUser)
        .returning()

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

      yield* db.insert(oauthAccountsTable).values(newOAuthAccount)

      return yield* Effect.succeed(createdUser)
    })
