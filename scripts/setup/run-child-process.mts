import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process"

const collectStream = (stream: Stream.Stream<Uint8Array, unknown>) =>
  stream.pipe(
    Stream.decodeText(),
    Stream.mkString,
    Effect.orElseSucceed(() => ""),
  )

export type ChildProcessResult = {
  readonly stdout: string
  readonly stderr: string
  readonly exitCode: ChildProcessSpawner.ExitCode
}

/** Spawn a command, drain stdout/stderr, and return the exit code. */
export const runChildProcess = Effect.fn("runChildProcess")(
  function* (options: {
    readonly command: string
    readonly args: ReadonlyArray<string>
    readonly cwd?: string
    readonly stdio?: "pipe" | "inherit"
  }) {
    const stdio = options.stdio ?? "pipe"
    const spawner = yield* ChildProcessSpawner.ChildProcessSpawner
    const cmd = ChildProcess.make(options.command, options.args, {
      cwd: options.cwd,
      stdout: stdio,
      stderr: stdio,
    })

    return yield* Effect.scoped(
      Effect.gen(function* () {
        const handle = yield* spawner.spawn(cmd)

        if (stdio === "inherit") {
          const exitCode = yield* handle.exitCode
          return { stdout: "", stderr: "", exitCode } as ChildProcessResult
        }

        const [stdout, stderr] = yield* Effect.all(
          [collectStream(handle.stdout), collectStream(handle.stderr)],
          { concurrency: "unbounded" },
        )
        const exitCode = yield* handle.exitCode
        return { stdout, stderr, exitCode } as ChildProcessResult
      }),
    )
  },
)
