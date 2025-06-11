import type { BitReader } from '../bit-reader';
import { parseFace, type ReplayFace } from './face';

export const parseFaces = (bits: BitReader) => {
    const faces: ReplayFace[] = [];
    while (bits.readBool()) {
        const face = parseFace(bits);
        faces.push(face);
    }
    return faces;
}

export type ReplayFaces = ReturnType<typeof parseFaces>;