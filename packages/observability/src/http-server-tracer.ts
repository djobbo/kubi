import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Option from "effect/Option"
import { exitResponse } from "effect/unstable/http/HttpServerError"
import {
  HttpServerRequest,
  type HttpServerRequest as HttpServerRequestType,
} from "effect/unstable/http/HttpServerRequest"
import type { HttpServerResponse } from "effect/unstable/http/HttpServerResponse"
import * as Request from "effect/unstable/http/HttpServerRequest"
import * as TraceContext from "effect/unstable/http/HttpTraceContext"

import type * as Tracer from "effect/Tracer"
import { httpServerSpanName } from "./span-name.ts"

const annotateServerSpan = (
  request: HttpServerRequestType,
  span: Tracer.Span,
  exit: Exit.Exit<HttpServerResponse, unknown>,
) => {
  const url = Request.toURL(request)
  if (Option.isSome(url)) {
    if (url.value.username !== "" || url.value.password !== "") {
      url.value.username = "REDACTED"
      url.value.password = "REDACTED"
    }
    span.attribute("url.full", url.value.toString())
    span.attribute("url.path", url.value.pathname)
    const query = url.value.search.slice(1)
    if (query !== "") {
      span.attribute("url.query", query)
    }
    span.attribute("url.scheme", url.value.protocol.slice(0, -1))
  }

  span.attribute("http.request.method", request.method)
  if (request.headers["user-agent"] !== undefined) {
    span.attribute("user_agent.original", request.headers["user-agent"])
  }
  if (Option.isSome(request.remoteAddress)) {
    span.attribute("client.address", request.remoteAddress.value)
  }

  const response = exitResponse(exit)
  span.attribute("http.response.status_code", response.status)
}

/**
 * HTTP server tracer that ends the root span synchronously when the handler
 * completes. Effect's built-in `HttpMiddleware.tracer` defers `span.end` to a
 * scheduled task, so child spans often reach Tempo first and Grafana shows
 * "&lt;root span not yet received&gt;" in the trace table.
 */
export const httpServerTracer = <E, R>(
  httpApp: Effect.Effect<HttpServerResponse, E, R>,
) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest

    if (request.method === "OPTIONS") {
      return yield* httpApp
    }

    const parent = TraceContext.fromHeaders(request.headers)

    return yield* Effect.withSpan(httpServerSpanName(request), {
      kind: "server",
      parent: Option.getOrUndefined(parent),
    })(
      Effect.gen(function* () {
        const exit = yield* Effect.exit(httpApp)
        const span = yield* Effect.currentSpan
        annotateServerSpan(request, span, exit)
        return yield* Exit.match(exit, {
          onFailure: (cause) => Effect.failCause(cause),
          onSuccess: (response) => Effect.succeed(response),
        })
      }),
    )
  })
