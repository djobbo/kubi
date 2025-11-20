import type { BitReader } from "../bit-reader"
import { type ReplayInput, parseInput } from "./input"

export const parseInputList = (bits: BitReader) => {
  const inputs = new Map<number, ReplayInput[]>()

  while (bits.readBool()) {
    const entId = bits.readBits(5)
    const inputCount = bits.readInt()
    const entityInputs = [...(inputs.get(entId) || [])]

    for (let i = 0; i < inputCount; ++i) {
      const input = parseInput(bits)
      entityInputs.push(input)
    }

    inputs.set(entId, entityInputs)
  }

  return inputs
}

export type ReplayInputList = ReturnType<typeof parseInputList>
