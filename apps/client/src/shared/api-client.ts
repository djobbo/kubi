import { env } from "@/features/config/env"
import { Api } from "@dair/api-contract"
import { AtomHttpApi } from "effect/unstable/reactivity"
import { FetchHttpClient } from "effect/unstable/http"

export class ApiClient extends AtomHttpApi.Service()("ApiClient", {
  api: Api,
  httpClient: FetchHttpClient.layer,
  baseUrl: env.VITE_API_URL,
}) {}
