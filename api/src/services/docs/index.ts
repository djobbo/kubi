import {
  type HttpApi,
  type HttpApiGroup,
  HttpServerResponse,
  OpenApi,
} from "@effect/platform"
import { Router } from "@effect/platform/HttpApiBuilder"
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
  readonly api: HttpApi.HttpApi<string, HttpApiGroup.HttpApiGroup.Any, any, any>
}) => {
  const spec = OpenApi.fromApi(options.api)
  const response = HttpServerResponse.json(spec)
  return response
}

export const layer = (
  api: HttpApi.HttpApi<string, HttpApiGroup.HttpApiGroup.Any, any, any>,
) =>
  Router.use((router) =>
    Effect.gen(function* () {
      yield* router.get("/openapi", make({ api }))
      yield* router.get("/docs", makeDocs())
    }),
  )
