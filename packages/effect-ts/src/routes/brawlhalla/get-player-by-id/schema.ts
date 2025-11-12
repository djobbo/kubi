import { Schema } from "effect"

const Bookmark = Schema.Struct({
	// TODO: Add bookmark schema
})

export const PlayerAliases = Schema.Array(Schema.String)

export const PlayerStats = Schema.Struct({
	xp: Schema.Number,
	level: Schema.Number,
	xp_percentage: Schema.Number,
	games: Schema.Number,
	wins: Schema.Number,
	matchtime: Schema.Number,
	kos: Schema.Number,
	falls: Schema.Number,
	suicides: Schema.Number,
	team_kos: Schema.Number,
	damage_dealt: Schema.Number,
	damage_taken: Schema.Number,
})

export const PlayerRanked1v1 = Schema.Struct({
	rating: Schema.Number,
	peak_rating: Schema.Number,
	is_placement_matches: Schema.Boolean,
	tier: Schema.NullOr(Schema.String),
	wins: Schema.Number,
	games: Schema.Number,
	region: Schema.NullOr(Schema.String),
	rating_reset: Schema.Number,
})

export const PlayerRanked2v2 = Schema.Struct({
	games: Schema.Number,
	wins: Schema.Number,
	average_peak_rating: Schema.Number,
	average_rating: Schema.Number,
	teams: Schema.Array(
		Schema.Struct({
			teammate: Schema.Struct({
				id: Schema.Number,
				name: Schema.String,
			}),
			rating: Schema.Number,
			peak_rating: Schema.Number,
			tier: Schema.NullOr(Schema.String),
			wins: Schema.Number,
			games: Schema.Number,
			region: Schema.NullOr(Schema.String),
			rating_reset: Schema.Number,
		}),
	),
})

export const PlayerRankedRotating = Schema.Struct({
	rating: Schema.Number,
	peak_rating: Schema.Number,
	tier: Schema.NullOr(Schema.String),
	wins: Schema.Number,
	games: Schema.Number,
	region: Schema.NullOr(Schema.String),
})

export const PlayerRanked = Schema.Struct({
	stats: Schema.Struct({
		games: Schema.Number,
		wins: Schema.Number,
		peak_rating: Schema.Number,
		glory: Schema.Struct({
			from_wins: Schema.Number,
			from_peak_rating: Schema.Number,
			total: Schema.Number,
		}),
	}),
	"1v1": Schema.NullOr(PlayerRanked1v1),
	"2v2": Schema.NullOr(PlayerRanked2v2),
	rotating: Schema.NullOr(PlayerRankedRotating),
})

export const PlayerClan = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
	xp: Schema.Number,
	personal_xp: Schema.Number,
	rank: Schema.NullOr(Schema.String),
	joined_at: Schema.NullOr(Schema.Number),
	created_at: Schema.NullOr(Schema.Number),
	members_count: Schema.NullOr(Schema.Number),
	bookmark: Schema.NullOr(Bookmark),
})

export const PlayerUnarmed = Schema.Struct({
	damage_dealt: Schema.Number,
	kos: Schema.Number,
	time_held: Schema.Number,
})

const PlayerWeaponThrows = Schema.Struct({
	damage_dealt: Schema.Number,
	kos: Schema.Number,
})

const PlayerGadget = Schema.Struct({
	damage_dealt: Schema.Number,
	kos: Schema.Number,
})

export const PlayerGadgets = Schema.Struct({
	kos: Schema.Number,
	damage_dealt: Schema.Number,
	bomb: Schema.NullOr(PlayerGadget),
	mine: Schema.NullOr(PlayerGadget),
	spikeball: Schema.NullOr(PlayerGadget),
	sidekick: Schema.NullOr(PlayerGadget),
	snowball: Schema.NullOr(
		Schema.Struct({
			hits: Schema.Number,
			kos: Schema.Number,
		}),
	),
})

const PlayerWeaponLegend = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
	kos: Schema.Number,
	damage_dealt: Schema.Number,
	time_held: Schema.Number,
})

const PlayerWeapon = Schema.Struct({
	name: Schema.String,
	stats: Schema.Struct({
		games: Schema.Number,
		wins: Schema.Number,
		kos: Schema.Number,
		damage_dealt: Schema.Number,
		time_held: Schema.Number,
		level: Schema.Number,
		xp: Schema.Number,
	}),
	legends: Schema.Array(PlayerWeaponLegend),
})

const PlayerLegendWeapon = Schema.Struct({
	name: Schema.String,
	damage_dealt: Schema.Number,
	kos: Schema.Number,
	time_held: Schema.Number,
})

const PlayerLegend = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
	name_key: Schema.String,
	stats: Schema.Struct({
		xp: Schema.Number,
		level: Schema.Number,
		xp_percentage: Schema.Number,
		damage_dealt: Schema.Number,
		damage_taken: Schema.Number,
		kos: Schema.Number,
		falls: Schema.Number,
		suicides: Schema.Number,
		team_kos: Schema.Number,
		matchtime: Schema.Number,
		games: Schema.Number,
		wins: Schema.Number,
	}),
	weapon_one: PlayerLegendWeapon,
	weapon_two: PlayerLegendWeapon,
	unarmed: PlayerUnarmed,
	gadgets: PlayerGadget,
	weapon_throws: PlayerWeaponThrows,
	// TODO: Base Ranked here
	ranked: Schema.NullOr(
		Schema.Struct({
			rating: Schema.Number,
			peak_rating: Schema.Number,
			tier: Schema.NullOr(Schema.String),
			wins: Schema.Number,
			games: Schema.Number,
		}),
	),
})

export const Player = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
	slug: Schema.String,
	aliases: PlayerAliases,
	stats: PlayerStats,
	ranked: Schema.NullOr(PlayerRanked),
	clan: Schema.NullOr(PlayerClan),
	unarmed: PlayerUnarmed,
	weapon_throws: PlayerWeaponThrows,
	gadgets: PlayerGadgets,
	weapons: Schema.Array(PlayerWeapon),
	legends: Schema.Array(PlayerLegend),
	bookmark: Schema.NullOr(Bookmark),
})

export const GetPlayerByIdResponse = Schema.Struct({
	data: Player,
	meta: Schema.Struct({
		updated_at: Schema.Date,
	}),
})
