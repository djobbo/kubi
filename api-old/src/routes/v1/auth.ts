import { env } from "@/env"
import HttpStatus from "@/helpers/http-status"
import { jsonContent } from "@/helpers/json-content"
import { optionalAuthMiddleware } from "@/middlewares/auth-middleware"
import {
  createAuthorizationURL,
  createSession,
  deleteSession,
  validateOAuthCallback,
} from "@/services/auth"
import {
  bookmarkSelectSchema,
  sessionSelectSchema,
  userSelectSchema,
} from "@dair/schema"
import {
  DISCORD_PROVIDER_ID,
  GOOGLE_PROVIDER_ID,
  oauthAccountSelectSchema,
} from "@dair/schema/src/auth/oauth-accounts"
import { OpenAPIHono as Hono, createRoute, z } from "@hono/zod-openapi"

export const authRoute = new Hono()
  // GET /auth/session - Get current session
  .openapi(
    createRoute({
      method: "get",
      path: "/session",
      description: "Get current user session",
      summary: "Get current user session",
      tags: ["Auth"],
      responses: {
        [HttpStatus.OK]: jsonContent(
          z.object({
            data: z.object({
              session: sessionSelectSchema
                .extend({
                  user: userSelectSchema.extend({
                    oauthAccounts: z.array(oauthAccountSelectSchema),
                    bookmarks: z.array(bookmarkSelectSchema),
                  }),
                })
                .nullable(),
            }),
            meta: z.object({
              timestamp: z.string(),
            }),
          }),
          "Retrieve the user",
        ),
      },
      middleware: optionalAuthMiddleware,
    }),
    async (c) => {
      const session = c.get("session")
      return c.json(
        {
          data: { session },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        HttpStatus.OK,
      )
    },
  )
  // GET /auth/providers/:provider/authorize - Get authorization URL
  .openapi(
    createRoute({
      method: "get",
      path: "/providers/{provider}/authorize",
      description: "Get OAuth authorization URL for the specified provider",
      summary: "Get OAuth authorization URL for the specified provider",
      tags: ["Auth"],
      request: {
        params: z.object({
          provider: z.enum([GOOGLE_PROVIDER_ID, DISCORD_PROVIDER_ID]),
        }),
        query: z.object({
          redirect_uri: z.string(),
        }),
      },
      responses: {
        [HttpStatus.OK]: jsonContent(
          z.object({
            data: z.object({
              authorizationUrl: z.string(),
            }),
            meta: z.object({
              provider: z.string(),
              timestamp: z.string(),
            }),
          }),
          "Get OAuth authorization URL for the specified provider",
        ),
      },
    }),
    async (c) => {
      const { provider } = c.req.valid("param")
      const url = createAuthorizationURL(provider)
      return c.json(
        {
          data: { authorizationUrl: url.toString() },
          meta: {
            provider,
            timestamp: new Date().toISOString(),
          },
        },
        HttpStatus.OK,
      )
    },
  )
  // GET /auth/providers/:provider/callback - Handle OAuth callback
  .openapi(
    createRoute({
      method: "get",
      path: "/providers/{provider}/callback",
      description: "Handle OAuth callback from provider",
      summary: "Handle OAuth callback from provider",
      tags: ["Auth"],
      request: {
        params: z.object({
          provider: z.enum([GOOGLE_PROVIDER_ID, DISCORD_PROVIDER_ID]),
        }),
        query: z.object({
          code: z.string(),
          state: z.string(),
        }),
      },
      responses: {
        [HttpStatus.CREATED]: jsonContent(
          z.object({
            message: z.string(),
          }),
          "Authentication successful",
        ),
      },
    }),
    async (c) => {
      const { provider } = c.req.valid("param")
      const { code } = c.req.valid("query")

      try {
        const user = await validateOAuthCallback(provider, code)
        await createSession(c, user.id)

        c.redirect(env.CLIENT_URL)
      } catch {
        // TODO: Show error to user in client
        c.redirect(env.CLIENT_URL)
      }

      return c.json(
        {
          message: "Authentication successful",
        },
        HttpStatus.CREATED,
      )
    },
  )
  // DELETE /auth/session - Logout (delete session)
  .openapi(
    createRoute({
      method: "delete",
      path: "/session",
      description: "Logout (delete session)",
      summary: "Logout (delete session)",
      tags: ["Auth"],
      responses: {
        [HttpStatus.OK]: jsonContent(
          z.object({
            message: z.string(),
          }),
          "Session deleted successfully",
        ),
      },
    }),
    async (c) => {
      await deleteSession(c)
      return c.json(
        {
          message: "Session deleted successfully",
        },
        HttpStatus.OK,
      )
    },
  )
