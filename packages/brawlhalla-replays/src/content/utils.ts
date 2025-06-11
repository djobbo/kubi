import type { BitReader } from '../bit-reader';

const replayInputFlags = {
    None: 0,
    AimUp: 0b0000_0000_00_0001,
    Drop: 0b0000_0000_00_0010,
    MoveLeft: 0b0000_0000_00_0100,
    MoveRight: 0b0000_0000_00_1000,
    Jump: 0b0000_0000_01_0000,
    PrioritiseNeutralOverSide: 0b0000_0000_10_0000,
    HeavyAttack: 0b0000_0001_00_0000,
    LightAttack: 0b0000_0010_00_0000,
    DodgeDash: 0b0000_0100_00_0000,
    PickUpThrow: 0b0000_1000_00_0000,
    TauntUp: 0b0001_0000_00_0000,
    TauntRight: 0b0010_0000_00_0000,
    TauntDown: 0b0100_0000_00_0000,
    TauntLeft: 0b1000_0000_00_0000,
} as const

type ReplayInputFlags = typeof replayInputFlags[keyof typeof replayInputFlags];


const REPLAY_BYTE_XOR = [0x6B, 0x10, 0xDE, 0x3C, 0x44, 0x4B, 0xD1, 0x46, 0xA0, 0x10, 0x52, 0xC1, 0xB2, 0x31, 0xD3, 0x6A, 0xFB, 0xAC, 0x11, 0xDE, 0x06, 0x68, 0x08, 0x78, 0x8C, 0xD5, 0xB3, 0xF9, 0x6A, 0x40, 0xD6, 0x13, 0x0C, 0xAE, 0x9D, 0xC5, 0xD4, 0x6B, 0x54, 0x72, 0xFC, 0x57, 0x5D, 0x1A, 0x06, 0x73, 0xC2, 0x51, 0x4B, 0xB0, 0xC9, 0x8C, 0x78, 0x04, 0x11, 0x7A, 0xEF, 0x74, 0x3E, 0x46, 0x39, 0xA0, 0xC7, 0xA6];

export const getReplayByteXor = (byteIndex: number): number => {
    const xor = REPLAY_BYTE_XOR[byteIndex % REPLAY_BYTE_XOR.length];
    if (xor === undefined) {
        throw new Error(`Byte index ${byteIndex} is out of bounds`);
    }
    return xor;
}

const ALL_TAUNTS = replayInputFlags.TauntUp | replayInputFlags.TauntRight | replayInputFlags.TauntDown | replayInputFlags.TauntLeft;

export const getTauntNumber = (inputFlags: ReplayInputFlags): number | null => {
    const flags = inputFlags & ALL_TAUNTS;
        switch (flags) {
            case replayInputFlags.TauntUp: return 1;
            case replayInputFlags.TauntUp | replayInputFlags.TauntRight: return 2;
            case replayInputFlags.TauntRight: return 3;
            case replayInputFlags.TauntRight | replayInputFlags.TauntDown: return 4;
            case replayInputFlags.TauntDown: return 5;
            case replayInputFlags.TauntDown | replayInputFlags.TauntLeft: return 6;
            case replayInputFlags.TauntLeft: return 7;
            case replayInputFlags.TauntLeft | replayInputFlags.TauntUp: return 8;
            case 0: return 0;
            default: return null;
        }
}

export const ownedTauntsFrom = (bits: BitReader): number[] => {
        const ownedTaunts: number[] = [];
        let taunt = 0;
        while (bits.readBool()) {
            const bitfield = bits.readUInt();
            // each 32 bitfield is used from lsb to msb
            for (let j = 0; j < 32; ++j) {
                if ((bitfield & (1 << j)) !== 0) {
                    ownedTaunts.push(taunt);
                }
                taunt++;
            }
        }
        return ownedTaunts;
    }

export const ownedTauntsToBitfields = (ownedTaunts: number[]): number[] => {
    if (ownedTaunts.length === 0) {
        return [];
    }
    const maxTaunt = Math.max(...ownedTaunts);
    const bitfields = new Array<number>(Math.floor(maxTaunt / 32) + 1).fill(0);
    for (const taunt of ownedTaunts) {
        bitfields[Math.floor(taunt / 32)]! |= 1 << (taunt % 32); // each 32 bitfield is used from lsb to msb
    }
    return bitfields;
}

export const allTheSame = (arr: number[]): boolean => {
    if (arr.length === 0) return true;
    const first = arr[0];
    return arr.every(x => x === first);
}

export const getReplayInputFlagsNames = (inputFlags: ReplayInputFlags) => {
    // bitwise or with each flag to determine which flags are set
    const flags = Object.values(replayInputFlags).filter((flag) => (inputFlags & flag) !== 0);
    return flags.map((flag) => Object.keys(replayInputFlags).find((key) => replayInputFlags[key as keyof typeof replayInputFlags] === flag));
}