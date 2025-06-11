import type { BitReader } from '../bit-reader';
import { parseEntityData, type ReplayEntityData } from './entity-data';
import { parseGameSettings } from './game-settings';

export const parseGameData = (bits: BitReader) => {
    const settings = parseGameSettings(bits);
    const levelId = bits.readUInt();
    const heroCount = bits.readUShort();
    if (heroCount < 1 || 5 < heroCount) {
        throw new Error(`Hero count is ${heroCount}, but must be between 1 and 5`);
    }
    const entities: ReplayEntityData[] = [];
    while (bits.readBool()) {
        entities.push(parseEntityData(bits, heroCount));
    }
    if (entities.length === 0) {
        throw new Error("No entities were found in the replay");
    }
    const checksum = bits.readUInt();

    return {
        settings,
        levelId,
        entities,
        checksum
    }
}

export type ReplayGameData = ReturnType<typeof parseGameData>;