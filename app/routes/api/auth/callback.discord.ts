import { createAPIFileRoute } from "@tanstack/start/api"
import { ArcticFetchError, OAuth2RequestError } from "arctic"
import { and, eq } from "drizzle-orm"
import { parseCookies } from "vinxi/http"
import { z } from "zod"

import { db } from "@/db"
import { createSession, generateSessionToken } from "@/features/auth/api"
import { setSessionTokenCookie } from "@/features/auth/cookies"
import { generateIdFromEntropySize } from "@/features/auth/helpers/crypto"
import {
  discord,
  DISCORD_OAUTH_STATE_COOKIE_NAME,
} from "@/features/auth/providers"
import { oauthAccountsTable, usersTable } from "@/features/auth/schema"

const discordUserResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().optional(),
  avatar: z.string().optional(),
  verified: z.boolean().optional(),
})

type DiscordUserResponse = z.infer<typeof discordUserResponseSchema>

const getAvatarUrl = (discordUser: DiscordUserResponse) => {
  if (discordUser.avatar) {
    return `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
  }

  return null
}

export const APIRoute = createAPIFileRoute("/api/auth/callback/discord")({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const code = url.searchParams.get("code")
    const state = url.searchParams.get("state")

    const cookies = parseCookies()
    const storedState = cookies[DISCORD_OAUTH_STATE_COOKIE_NAME]

    if (!code || !state || !storedState || state !== storedState) {
      return new Response(null, { status: 400 })
    }

    try {
      const tokens = await discord.validateAuthorizationCode(code)
      const accessToken = tokens.accessToken()
      // TODO: use discord.js
      const discordUserResponse = await fetch(
        "https://discord.com/api/v10/users/@me",
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      const discordUser = discordUserResponseSchema.parse(
        await discordUserResponse.json(),
      )

      const existingUser = await db.query.oauthAccountsTable.findFirst({
        where: and(
          eq(oauthAccountsTable.providerId, "discord"),
          eq(oauthAccountsTable.providerUserId, discordUser.id),
        ),
      })

      if (existingUser) {
        const token = generateSessionToken()
        const session = await createSession(token, existingUser.userId)
        setSessionTokenCookie(token, session.expiresAt)

        await db
          .insert(usersTable)
          .values({
            id: existingUser.userId,
            name: discordUser.username,
            avatarUrl: getAvatarUrl(discordUser),
          })
          .onConflictDoUpdate({
            target: [usersTable.id],
            set: {
              avatarUrl: getAvatarUrl(discordUser),
            },
          })

        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
          },
        })
      }

      const userId = generateIdFromEntropySize(10) // 16 characters

      await db.transaction(async (tx) => {
        await tx.insert(usersTable).values({
          id: userId,
          email: discordUser.email,
          name: discordUser.username,
          avatarUrl: getAvatarUrl(discordUser),
        })

        await tx.insert(oauthAccountsTable).values({
          providerId: "discord",
          providerUserId: discordUser.id,
          userId,
        })
      })

      const token = generateSessionToken()
      const session = await createSession(token, userId)
      setSessionTokenCookie(token, session.expiresAt)

      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
      // the specific error message depends on the provider
      if (e instanceof OAuth2RequestError) {
        // invalid code
        return new Response(null, { status: 400 })
      }

      if (e instanceof ArcticFetchError) {
        // Failed to call `fetch()`
        return new Response(null, { status: 500 })
      }

      return new Response(null, { status: 500 })
    }
  },
})
