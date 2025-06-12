import type { BitReader } from "../bit-reader"

enum ReplayGameModeFlags {
	None = 0,
	Teams = 0b0000000001,
	TeamDamage = 0b0000000010,
	FixedCamera = 0b00000000100,
	GadgetsOff = 0b00000001000,
	WeaponsOff = 0b00000010000,
	TestLevelsOn = 0b00000100000,
	TestFeaturesOn = 0b00001000000,
	GhostRule = 0b00010000000,
	TurnOffMapArtThemes = 0b00100000000,
	ForceCrewBattleCycle = 0b01000000000,
	AdvancedSettings = 0b10000000000,
}

enum ReplayGadgetSelectFlags {
	None = 0,
	BouncyBombs = 0b0000001,
	PressureMines = 0b0000010,
	Spikeballs = 0b0000100,
	SidekickSummoners = 0b0001000,
	HomingBoomerangs = 0b0010000,
	StickyBombs = 0b0100000,
	WeaponCrates = 0b1000000, // might not be part of this anymore?
}

export const parseGameSettings = (bits: BitReader) => {
	const flags = bits.readUInt() as ReplayGameModeFlags
	const maxPlayers = bits.readUInt()
	const duration = bits.readUInt()
	const roundDuration = bits.readUInt()
	const startingLives = bits.readUInt()
	const scoringTypeId = bits.readUInt()
	const scoreToWin = bits.readUInt()
	const gameSpeed = bits.readUInt()
	const damageMultiplier = bits.readUInt()
	const levelSetId = bits.readUInt()
	const itemSpawnRuleSetId = bits.readUInt()
	const weaponSpawnRateId = bits.readUInt()
	const gadgetSpawnRateId = bits.readUInt()
	const customGadgetSelection = bits.readUInt() as ReplayGadgetSelectFlags
	const variation = bits.readUInt()

	return {
		flags,
		maxPlayers,
		duration,
		roundDuration,
		startingLives,
		scoringTypeId,
		scoreToWin,
		gameSpeed,
		damageMultiplier,
		levelSetId,
		itemSpawnRuleSetId,
		weaponSpawnRateId,
		gadgetSpawnRateId,
		customGadgetSelection,
		variation,
	}
}
