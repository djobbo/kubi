import { env } from '@/features/config/env'
import { Api } from '@dair/api-contract'
import { AtomHttpApi } from '@effect-atom/atom-react'
import { FetchHttpClient } from '@effect/platform'


export class ApiClient extends AtomHttpApi.Tag<ApiClient>()('ApiClient', {
	api: Api,
	// Provide a Layer that provides the HttpClient
	httpClient: FetchHttpClient.layer,
	baseUrl: env.VITE_API_URL,
  }) {}
