import type { BitReader } from "../bit-reader"

export const parseFace = (bits: BitReader) => {
  const entId = bits.readBits(5)
  const timeStamp = bits.readInt()
  return {
    entId,
    timeStamp,
  }
}

export type ReplayFace = ReturnType<typeof parseFace>
