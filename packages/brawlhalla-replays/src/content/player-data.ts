import type { BitReader } from "../bit-reader"
import { type ReplayHeroType, parseHeroType } from "./hero-type"
import { ownedTauntsFrom } from "./utils"

export const parsePlayerData = (bits: BitReader, heroCount: number) => {
	const colorSchemeId = bits.readUInt()
	const spawnBotId = bits.readUInt()
	const companionId = bits.readUInt()
	const emitterId = bits.readUInt()
	const playerThemeId = bits.readUInt()
	const taunts = new Array<number>(8)
	for (let i = 0; i < 8; ++i) {
		taunts[i] = bits.readUInt()
	}
	const winTauntId = bits.readUShort()
	const loseTauntId = bits.readUShort()
	const ownedTaunts = ownedTauntsFrom(bits)
	const avatarId = bits.readUShort()
	const team = bits.readInt()
	const connectionTime = bits.readInt()
	const heroTypes: ReplayHeroType[] = []
	for (let i = 0; i < heroCount; i++) {
		heroTypes.push(parseHeroType(bits))
	}
	const isBot = bits.readBool()
	const handicapsEnabled = bits.readBool()
	const handicapStockCount = handicapsEnabled ? bits.readUInt() : null
	const handicapDamageDoneMult = handicapsEnabled ? bits.readUInt() : null
	const handicapDamageTakenMult = handicapsEnabled ? bits.readUInt() : null

	return {
		colorSchemeId,
		spawnBotId,
		companionId,
		emitterId,
		playerThemeId,
		taunts,
		winTauntId,
		loseTauntId,
		ownedTaunts,
		avatarId,
		team,
		connectionTime,
		heroTypes,
		isBot,
		handicapsEnabled,
		handicapStockCount,
		handicapDamageDoneMult,
		handicapDamageTakenMult,
	}
}
