import type { BitReader } from "../bit-reader"

export const parseHeroType = (bits: BitReader) => {
	const heroId = bits.readUInt()
	const costumeId = bits.readUInt()
	const stanceIndex = bits.readUInt()
	const _ = bits.readBool() // ignored
	const weaponSkin2 = bits.readBits(15)
	const morphWeapon2 = bits.readBool()
	const weaponSkin1 = bits.readBits(15) // true if second weapon is used for morph, false if first

	return {
		heroId,
		costumeId,
		stanceIndex,
		weaponSkin1,
		weaponSkin2,
		morphWeapon2,
	}
}

export type ReplayHeroType = ReturnType<typeof parseHeroType>
