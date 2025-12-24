import { Schema } from "effect"
import type { PlayerWeaponHistory } from "@dair/db"
import { HttpApiSchema } from "@effect/platform"

export const WeaponRanking = Schema.Struct({
  weaponName: Schema.String,
  playerId: Schema.Number,
  playerName: Schema.String,
  playerSlug: Schema.String,
  xp: Schema.Number,
  games: Schema.Number,
  wins: Schema.Number,
  losses: Schema.Number,
  timeHeld: Schema.Number,
  kos: Schema.Number,
  damageDealt: Schema.Number,
})

export const WeaponNameParam = HttpApiSchema.param(
  "name",
  Schema.NonEmptyTrimmedString,
)

export const GlobalWeaponRankingsOrderBy = Schema.Literal(
  ...([
    "xp",
    "games",
    "wins",
    "losses",
    "timeHeld",
    "kos",
    "damageDealt",
  ] satisfies (keyof PlayerWeaponHistory)[]),
)

null as unknown as PlayerWeaponHistory satisfies Omit<
  typeof WeaponRanking.Type,
  "playerSlug" | "playerName"
>

export const GetGlobalWeaponRankingsResponse = Schema.Struct({
  data: Schema.Array(WeaponRanking),
  meta: Schema.Struct({}),
})
