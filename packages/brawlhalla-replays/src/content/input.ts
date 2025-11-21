import type { BitReader } from "../bit-reader"
import type { ReplayInputFlags } from "./utils"

export const parseInput = (bits: BitReader) => {
  const timeStamp = bits.readInt()
  const hasInput = bits.readBool()
  const inputFlags: ReplayInputFlags = hasInput ? bits.readBits(14) : 0

  return {
    timeStamp,
    inputFlags,
  }
}

export type ReplayInput = ReturnType<typeof parseInput>
