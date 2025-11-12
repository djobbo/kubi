import { Schema } from 'effect';
import { Tier } from '../../../services/brawlhalla-api/schema/tier';
import { Region } from '../../../services/brawlhalla-api/schema/region';

const Ranking = Schema.Struct({
    rank: Schema.Number,
    rating: Schema.Number,
    tier: Tier,
    games: Schema.Number,
    wins: Schema.Number,
    region: Region,
    peak_rating: Schema.Number,
})

export const Ranking1v1 = Schema.Struct({
    ...Ranking.fields,
    name: Schema.String,
    id: Schema.Number,
    best_legend: Schema.NullOr(Schema.Struct({
        id: Schema.Number,
        name: Schema.String,
        games: Schema.Number,
        wins: Schema.Number,
    })),
})

export const Rankings1v1 = Schema.Array(Ranking1v1)

const TeamPlayer = Schema.Struct({
    id: Schema.Number,
    name: Schema.String,
})

export const Ranking2v2 = Schema.Struct({
    ...Ranking.fields,
    team: Schema.Tuple(TeamPlayer, TeamPlayer),
})

export const Rankings2v2 = Schema.Array(Ranking2v2)

export const GetRankings1v1Response = Schema.Struct({
    data: Rankings1v1,
    meta: Schema.Struct({
        updated_at: Schema.Date,
    }),
})

export const GetRankings2v2Response = Schema.Struct({
    data: Rankings2v2,
    meta: Schema.Struct({
        updated_at: Schema.Date,
    }),
})
