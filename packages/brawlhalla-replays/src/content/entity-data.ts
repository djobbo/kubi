import type { BitReader } from "../bit-reader"
import { parsePlayerData } from "./player-data"

export const parseEntityData = (bits: BitReader, heroCount: number) => {
  const entId = bits.readInt() // why is this 32 bits while every other ent id is 5?
  const name = bits.readString()
  const playerData = parsePlayerData(bits, heroCount)

  return {
    entId,
    name,
    playerData,
  }
}

export type ReplayEntityData = ReturnType<typeof parseEntityData>
