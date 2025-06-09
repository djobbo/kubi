import { createMiddleware } from "@tanstack/react-start"
import { z } from "zod"

import { env } from "@/env"

export const serviceAuthenticationMiddleware = createMiddleware()
  .validator(z.object({ serviceApiKey: z.string() }).passthrough())
  .server(async ({ next, data }) => {
    const { serviceApiKey } = data
    if (env.SERVICE_API_KEY === undefined || env.SERVICE_API_KEY === "") {
      throw new Error("Service API Key is not set")
    }

    if (!serviceApiKey || serviceApiKey !== env.SERVICE_API_KEY) {
      throw new Error("Unauthorized")
    }

    return await next()
  })
