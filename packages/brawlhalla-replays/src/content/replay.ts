import { BitReader } from '../bit-reader';
import { inflateSync } from 'node:zlib';
import { parseFaces, type ReplayFaces } from './faces';
import { parseHeader, type ReplayHeader } from './header';
import { parseGameData, type ReplayGameData } from './game-data';
import { parseResult, type ReplayResult } from './result';
import { parseInputList, type ReplayInputList } from './input-list';
import { getReplayInputFlagsNames } from './utils';

enum ReplayObjectTypeEnum {
    Inputs = 1,
    End = 2,
    Header = 3,
    GameData = 4,
    KnockoutFaces = 5,
    Results = 6,
    Faces = 7,
    InvalidReplay = 8,
}

export const parseReplay = (data: ArrayBuffer) => {
    const decompressed = inflateSync(data);
    const bitReader = new BitReader(Buffer.from(decompressed));

    const version = bitReader.readUInt();
    console.log(version);

    let header: ReplayHeader | null = null;
    let gameData: ReplayGameData | null = null;
    const results: ReplayResult[] = [];
    let knockoutFaces: ReplayFaces | null = null;
    let otherFaces: ReplayFaces | null = null;
    let inputs: ReplayInputList | null = null;

    let reachedReplayEnd = false;
    while (!reachedReplayEnd)
        {
            const replayObjectType = bitReader.readBits(4);
            switch (replayObjectType)
            {
                case ReplayObjectTypeEnum.Header:
                    if (header)
                        throw new Error("Duplicate replay header");
                    console.log("Header");
                    header = parseHeader(bitReader);
                    console.log(header);
                    break;
                case ReplayObjectTypeEnum.GameData:
                    if (gameData)
                        throw new Error("Duplicate game data");
                    console.log("Game data");
                    gameData = parseGameData(bitReader);
                    console.log(gameData);
                    // if (!ignoreChecksum)
                    //     gameData.ValidateChecksum();
                    break;
                case ReplayObjectTypeEnum.Results:
                    console.log("Results");
                    results.push(parseResult(bitReader));
                    console.log(results);
                    break;
                case ReplayObjectTypeEnum.KnockoutFaces:
                    if (knockoutFaces)
                        throw new Error("Duplicate knockout faces");
                    console.log("Knockout faces");
                    knockoutFaces = parseFaces(bitReader);
                    console.log(knockoutFaces);
                    break;
                case ReplayObjectTypeEnum.Faces:
                    if (otherFaces)
                        throw new Error("Duplicate faces");
                    console.log("Faces");
                    otherFaces = parseFaces(bitReader);
                    console.log(otherFaces);
                    break;
                case ReplayObjectTypeEnum.Inputs:
                    if (inputs)
                        throw new Error("Duplicate inputs");
                    console.log("Inputs");
                    inputs = parseInputList(bitReader);
                    console.log(inputs);
                    break;
                case ReplayObjectTypeEnum.End:
                    reachedReplayEnd = true;
                    break;
                case ReplayObjectTypeEnum.InvalidReplay:
                    throw new Error("Object type 8 found. Replay is invalid.");
                default:
                    throw new Error(`Unknown replay object type ${replayObjectType}`);
        }
    }

    const inputsWithNames = inputs
        ? Object.fromEntries(
            Array.from(inputs.entries()).map(([key, inputs]) => [key, inputs.map(({inputFlags, ...input}) => ({...input, inputFlags, inputs: getReplayInputFlagsNames(inputFlags)}))])
        )
        : null;

    return {
        header,
        gameData,
        results,
        knockoutFaces,
        otherFaces,
        inputs: inputsWithNames
    }
}
