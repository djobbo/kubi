import { parseReplay } from "./content/replay"

const [replayPath] = process.argv.slice(2)
if (!replayPath) {
  console.error("Please provide a replay file path as an argument")
  console.error("Usage: bun run src/index.ts <replay-file>")
  process.exit(1)
}

const file = Bun.file(replayPath)
const data = await file.arrayBuffer()

const replay = parseReplay(data)

await Bun.write("replay.json", JSON.stringify(replay, null, 2))
