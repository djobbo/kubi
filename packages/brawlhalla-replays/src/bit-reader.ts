import { getReplayByteXor } from "./content/utils"

export class BitReader {
  private buffer: Buffer
  private byteIndex = -1
  private currentByte = 0
  private indexInByte = 8

  constructor(buffer: Buffer) {
    this.buffer = buffer
  }

  get length(): number {
    return this.buffer.length * 8
  }

  get position(): number {
    return this.byteIndex * 8 + this.indexInByte
  }

  readBool(): boolean {
    if (this.indexInByte === 8) {
      this.byteIndex++
      if (this.byteIndex >= this.buffer.length) {
        throw new Error("End of stream")
      }
      const byte = this.buffer[this.byteIndex]
      if (byte === undefined) {
        throw new Error("End of stream")
      }
      this.currentByte = byte ^ getReplayByteXor(this.byteIndex)
      this.indexInByte = 0
    }

    const result = (this.currentByte & (1 << (7 - this.indexInByte))) !== 0
    this.indexInByte++
    return result
  }

  readBits(count: number): number {
    let result = 0
    while (count !== 0) {
      result |= (this.readBool() ? 1 : 0) << (count - 1)
      count--
    }
    return result
  }

  readByte(): number {
    return this.readBits(8)
  }

  readBytes(amount: number): Buffer {
    const result = Buffer.alloc(amount)
    for (let i = 0; i < amount; i++) {
      result[i] = this.readByte()
    }
    return result
  }

  readUShort(): number {
    return this.readBits(16)
  }

  readShort(): number {
    return this.readUShort()
  }

  readUInt(): number {
    return this.readBits(32)
  }

  readInt(): number {
    return this.readUInt()
  }

  readString(): string {
    const size = this.readUShort()
    const bytes = this.readBytes(size)
    return bytes.toString("utf-8")
  }
}
