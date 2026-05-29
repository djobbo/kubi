import { Command, Flag } from "effect/unstable/cli"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as NodeServices from "@effect/platform-node/NodeServices"
import { ChildProcessSpawner } from "effect/unstable/process"
import { Console, Effect } from "effect"

import { runChildProcess } from "./setup/run-child-process.mts"

const composeFile = "compose.dev.yml"

const logComposeOutput = (stdout: string, stderr: string) => {
  const output = stderr.trim() || stdout.trim()
  return output ? Console.log(output) : Effect.void
}

const runDockerCompose = (
  args: ReadonlyArray<string>,
  options: { readonly stdio?: "pipe" | "inherit" } = {},
) =>
  Effect.gen(function* () {
    yield* Console.log(
      `Running: docker compose -f ${composeFile} ${args.join(" ")}`,
    )

    const { stdout, stderr, exitCode } = yield* dockerCompose(
      args,
      options,
    ).pipe(
      Effect.mapError(
        (cause) => new Error(`Docker compose failed: ${String(cause)}`),
      ),
    )

    if (options.stdio !== "inherit") {
      yield* logComposeOutput(stdout, stderr)
    }

    if (exitCode !== ChildProcessSpawner.ExitCode(0)) {
      return yield* Effect.fail(
        new Error(`Docker compose exited with code ${exitCode}`),
      )
    }
  })

const dockerCompose = (
  args: ReadonlyArray<string>,
  options: { readonly stdio?: "pipe" | "inherit" } = {},
) =>
  runChildProcess({
    command: "docker",
    args: ["compose", "-f", composeFile, ...args],
    stdio: options.stdio,
  })

const waitForHealthFlag = Flag.boolean("wait").pipe(
  Flag.withAlias("w"),
  Flag.withDescription(
    "Wait for services to be healthy (streams logs until ready)",
  ),
)

const composeUp = Command.make("up", { wait: waitForHealthFlag }, ({ wait }) =>
  Effect.gen(function* () {
    if (wait) {
      yield* runDockerCompose(["up", "--wait"], { stdio: "inherit" })
      yield* Console.log("All services are healthy!")
      return
    }

    yield* runDockerCompose(["up", "-d"])
    yield* Console.log(
      "Services started. Use --wait to wait for health checks.",
    )
  }),
)

const composeDown = Command.make("down", {}, () =>
  Effect.gen(function* () {
    yield* runDockerCompose(["down"])
  }),
)

const compose = Command.make("compose", {}, () =>
  Console.log("Docker Compose CLI — use 'up' or 'down' subcommands"),
).pipe(Command.withSubcommands([composeUp, composeDown]))

Command.run(compose, {
  version: "1.0.0",
}).pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain)
