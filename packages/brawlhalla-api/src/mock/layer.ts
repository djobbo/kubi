import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

import { BrawlhallaApiConfig } from "../api/config.js"
import {
  BrawlhallaApiClientService,
  type BrawlhallaApiClient,
} from "../api/client.js"
import { BRAWLHALLA_API_BASE_URL } from "../api/definition.js"
import type { RankedRegion } from "../constants/ranked/regions.js"
import {
  mockClan,
  mockLegend,
  mockLegends,
  mockPlayerRanked,
  mockPlayerStats,
  mockRankings1v1,
  mockRankings2v2,
  mockRankingsRotating,
  mockSearchBySteamId,
} from "./fixtures.js"

const makeMockClient = (): BrawlhallaApiClient => {
  const client = {
    player: {
      stats: (request: { params: { playerId: number } }) =>
        Effect.succeed(mockPlayerStats(request.params.playerId)),
      ranked: (request: { params: { playerId: number } }) =>
        Effect.succeed(mockPlayerRanked(request.params.playerId)),
    },
    clan: {
      get: (request: { params: { clanId: number } }) =>
        Effect.succeed(mockClan(request.params.clanId)),
    },
    rankings: {
      oneVOne: (request: {
        params: { region: RankedRegion; page: number }
        query: { name?: string }
      }) =>
        Effect.succeed(
          mockRankings1v1(
            request.params.region,
            request.params.page,
            request.query.name,
          ),
        ),
      twoVTwo: (request: { params: { region: RankedRegion; page: number } }) =>
        Effect.succeed(
          mockRankings2v2(request.params.region, request.params.page),
        ),
      rotating: (request: { params: { region: RankedRegion; page: number } }) =>
        Effect.succeed(
          mockRankingsRotating(request.params.region, request.params.page),
        ),
    },
    search: {
      bySteamId: (request: { query: { steamid: string } }) =>
        Effect.succeed(mockSearchBySteamId(request.query.steamid)),
    },
    legend: {
      all: () => Effect.succeed(mockLegends),
      get: (request: { params: { legendId: number } }) =>
        Effect.succeed(mockLegend(request.params.legendId)),
    },
  }

  return client as unknown as BrawlhallaApiClient
}

export const layerBrawlhallaApiClientMock = Layer.mergeAll(
  Layer.succeed(BrawlhallaApiClientService, makeMockClient()),
  Layer.succeed(BrawlhallaApiConfig, {
    apiKey: Redacted.make("mock-api-key"),
    baseUrl: BRAWLHALLA_API_BASE_URL,
  }),
)
