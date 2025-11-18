import { Schema } from "effect"

const Bookmark = Schema.Struct({
	// TODO: Add bookmark schema
})

const GuildMember = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
	rank: Schema.String,
	joined_at: Schema.Number,
	xp: Schema.Number,
	lifetime_xp: Schema.Number,
})

export const Clan = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
	created_at: Schema.Number,
	xp: Schema.Number,
	lifetime_xp: Schema.Number,
	members: Schema.Array(GuildMember),
	bookmark: Schema.NullOr(Bookmark),
})

export const GetClanByIdResponse = Schema.Struct({
	data: Clan,
	meta: Schema.Struct({
		updated_at: Schema.Date,
	}),
})
