import type { BitReader } from '../bit-reader';

export const parseHeader = (bits: BitReader) => {
    const randomSeed = bits.readUInt();
    const playlistId = bits.readUInt();
    const playlistName = (playlistId !== 0) ? bits.readString() : null;
    const onlineGame = bits.readBool();

    return {
        randomSeed,
        playlistId,
        playlistName,
        onlineGame
    }
}

export type ReplayHeader = ReturnType<typeof parseHeader>;