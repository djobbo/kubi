import { createAPIFileRoute } from "@tanstack/start/api"
import { ArcticFetchError, OAuth2RequestError } from "arctic"
import { and, eq } from "drizzle-orm"
import { generateIdFromEntropySize } from "lucia"
import { parseCookies } from "vinxi/http"
import { z } from "zod"

import { db } from "@/db"
import { lucia } from "@/features/auth/lucia"
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
        const session = await lucia.createSession(existingUser.userId, {})
        const sessionCookie = lucia.createSessionCookie(session.id)
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
            // eslint-disable-next-line lingui/no-unlocalized-strings
            "Set-Cookie": sessionCookie.serialize(),
          },
        })
      }

      const userId = generateIdFromEntropySize(10) // 16 characters

      await db.transaction(async (tx) => {
        await tx.insert(usersTable).values({
          id: userId,
          email: discordUser.email,
          name: discordUser.username,
          avatarUrl: discordUser.avatar,
        })

        await tx.insert(oauthAccountsTable).values({
          providerId: "discord",
          providerUserId: discordUser.id,
          userId,
        })
      })

      const session = await lucia.createSession(userId, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
          // eslint-disable-next-line lingui/no-unlocalized-strings
          "Set-Cookie": sessionCookie.serialize(),
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
