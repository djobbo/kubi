import type { HttpApi } from "effect/unstable/httpapi"
import type * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup"
import { OpenApi } from "effect/unstable/httpapi"
import { HttpRouter, HttpServerResponse } from "effect/unstable/http"
import { Effect } from "effect"

const SCALAR_URL = "https://cdn.jsdelivr.net/npm/@scalar/api-reference"

const makeDocs = () => {
  const response = HttpServerResponse.html(`<!doctype html>
<html>
  <head>
    <title>dair.gg API Reference</title>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1" />
  </head>

  <body>
    <div id="app"></div>

    <script src="${SCALAR_URL}"></script>

    <script>
      Scalar.createApiReference('#app', {
        url: '/openapi',
      })
    </script>
  </body>
</html>`)
  return Effect.succeed(response)
}

const make = (options: {
  readonly api: HttpApi.HttpApi<string, HttpApiGroup.Any>
}) => {
  const spec = OpenApi.fromApi(options.api)
  return HttpServerResponse.json(spec)
}

export const layer = (api: HttpApi.HttpApi<string, HttpApiGroup.Any>) =>
  HttpRouter.use((router) =>
    Effect.gen(function* () {
      yield* router.add("GET", "/openapi", make({ api }))
      yield* router.add("GET", "/", makeDocs())
    }),
  )
