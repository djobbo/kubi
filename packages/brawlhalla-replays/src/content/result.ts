import type { BitReader } from "../bit-reader"

export const parseResult = (bits: BitReader) => {
	const length = bits.readUInt()
	const scores = new Map<number, number>()
	if (bits.readBool()) {
		while (bits.readBool()) {
			const entId = bits.readBits(5)
			const score = bits.readShort()
			if (scores.has(entId)) {
				throw new Error(`Score for entity ${entId} appears twice`)
			}
			scores.set(entId, score)
		}
	}
	const endOfMatchFanfareId = bits.readUInt()

	return {
		length,
		scores: Object.fromEntries(scores),
		endOfMatchFanfareId,
	}
}

export type ReplayResult = ReturnType<typeof parseResult>
