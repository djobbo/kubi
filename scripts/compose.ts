import { spawn } from "node:child_process"
import { Command, Flag } from "effect/unstable/cli"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as NodeServices from "@effect/platform-node/NodeServices"
import { Console, Effect } from "effect"

const composeFile = "compose.dev.yml"

const spawnCompose = (
  args: ReadonlyArray<string>,
  stdio: ["inherit", "inherit", "inherit"] | ["inherit", "pipe", "inherit"],
) =>
  Effect.tryPromise({
    try: () =>
      new Promise<{ exitCode: number; stdout: string }>((resolve, reject) => {
        const proc = spawn("docker", ["compose", "-f", composeFile, ...args], {
          stdio,
        })

        let stdout = ""
        if (proc.stdout) {
          proc.stdout.on("data", (chunk: Buffer) => {
            stdout += chunk.toString()
          })
        }

        proc.on("error", reject)
        proc.on("close", (code) => {
          resolve({ exitCode: code ?? 1, stdout })
        })
      }),
    catch: (error: unknown) =>
      new Error(`Docker compose failed: ${String(error)}`),
  })

const runDockerCompose = (args: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    yield* Console.log(
      `Running: docker compose -f ${composeFile} ${args.join(" ")}`,
    )

    const { exitCode } = yield* spawnCompose(args, [
      "inherit",
      "inherit",
      "inherit",
    ])

    if (exitCode !== 0) {
      return yield* Effect.fail(
        new Error(`Docker compose exited with code ${exitCode}`),
      )
    }
  })

const waitForHealth = (): Effect.Effect<void, Error, never> =>
  Effect.gen(function* () {
    yield* Console.log("Waiting for services to be healthy...")

    const { exitCode, stdout } = yield* spawnCompose(
      ["ps", "--format", "json"],
      ["inherit", "pipe", "inherit"],
    )

    if (exitCode !== 0) {
      return yield* Effect.fail(
        new Error(`Failed to check service status: ${exitCode}`),
      )
    }

    const services = stdout
      .trim()
      .split("\n")
      .filter((line: string) => line.trim())
      .map(
        (line: string) =>
          JSON.parse(line) as { Health?: string; State?: string },
      )

    const unhealthyServices = services.filter((service) => {
      const health = service.Health || ""
      const state = service.State || ""
      return (
        state.includes("unhealthy") ||
        (state.includes("starting") && !health.includes("healthy"))
      )
    })

    if (unhealthyServices.length > 0) {
      yield* Console.log("Some services are not yet healthy, waiting...")
      yield* Effect.sleep("2 seconds")
      yield* waitForHealth()
    } else {
      yield* Console.log("All services are healthy!")
    }
  })

const waitForHealthFlag = Flag.boolean("wait").pipe(
  Flag.withAlias("w"),
  Flag.withDescription("Wait for services to be healthy before returning"),
)

const composeUp = Command.make("up", { wait: waitForHealthFlag }, ({ wait }) =>
  Effect.gen(function* () {
    yield* runDockerCompose(["up", "-d"])

    if (wait) {
      yield* waitForHealth()
    } else {
      yield* Console.log(
        "Services started. Use --wait to wait for health checks.",
      )
    }
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
