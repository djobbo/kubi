import * as Effect from "effect/Effect"
import * as ErrorReporter from "effect/ErrorReporter"
import * as Schema from "effect/Schema"
import * as HttpApiSchema from "effect/unstable/httpapi/HttpApiSchema"
import * as HttpServerRespondable from "effect/unstable/http/HttpServerRespondable"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"

export * from "effect/unstable/httpapi/HttpApiError"

export class TooManyRequests extends Schema.ErrorClass<TooManyRequests>(
  "effect/HttpApiError/TooManyRequests",
)(
  {
    _tag: Schema.tag("TooManyRequests"),
  },
  {
    httpApiStatus: 429,
  },
) {
  override readonly [ErrorReporter.ignore] = true;
  [HttpServerRespondable.symbol]() {
    return Effect.succeed(HttpServerResponse.empty({ status: 429 }))
  }
}
