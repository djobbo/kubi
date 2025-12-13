import { Command, Options } from "@effect/cli"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Console, Effect } from "effect"

const composeFile = "compose.dev.yml"

// Helper to run docker compose commands
const runDockerCompose = (args: string[]): Effect.Effect<void, Error, never> =>
  Effect.gen(function* () {
    yield* Console.log(
      `Running: docker compose -f ${composeFile} ${args.join(" ")}`,
    )

    const proc = Bun.spawn(["docker", "compose", "-f", composeFile, ...args], {
      stdio: ["inherit", "inherit", "inherit"],
    })

    const exitCode = yield* Effect.tryPromise({
      try: () => proc.exited,
      catch: (error: unknown) =>
        new Error(`Docker compose failed: ${String(error)}`),
    })

    if (exitCode !== 0) {
      yield* Effect.fail(
        new Error(`Docker compose exited with code ${exitCode}`),
      )
    }
  })

// Wait for services to be healthy
const waitForHealth = (): Effect.Effect<void, Error, never> =>
  Effect.gen(function* () {
    yield* Console.log("Waiting for services to be healthy...")

    const proc = Bun.spawn(
      ["docker", "compose", "-f", composeFile, "ps", "--format", "json"],
      {
        stdio: ["inherit", "pipe", "inherit"],
      },
    )

    const exitCode = yield* Effect.tryPromise({
      try: () => proc.exited,
      catch: (error: unknown) =>
        new Error(`Failed to check service health: ${String(error)}`),
    })

    if (exitCode !== 0) {
      yield* Effect.fail(
        new Error(`Failed to check service status: ${exitCode}`),
      )
    }

    const output = yield* Effect.tryPromise({
      try: async () => {
        const text = await new Response(proc.stdout).text()
        return text
      },
      catch: (error: unknown) =>
        new Error(`Failed to read output: ${String(error)}`),
    })

    const services = output
      .trim()
      .split("\n")
      .filter((line: string) => line.trim())
      .map((line: string) => JSON.parse(line))

    const unhealthyServices = services.filter(
      (service: { Health?: string; State?: string }) => {
        const health = service.Health || ""
        const state = service.State || ""
        return (
          state.includes("unhealthy") ||
          (state.includes("starting") && !health.includes("healthy"))
        )
      },
    )

    if (unhealthyServices.length > 0) {
      yield* Console.log("Some services are not yet healthy, waiting...")
      yield* Effect.sleep("2 seconds")
      yield* waitForHealth()
    } else {
      yield* Console.log("All services are healthy!")
    }
  })

// Up command
const waitForHealthOption = Options.boolean("wait").pipe(
  Options.withAlias("w"),
  Options.withDescription("Wait for services to be healthy before returning"),
)

const composeUp = Command.make(
  "up",
  { wait: waitForHealthOption },
  ({ wait }) =>
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

// Down command
const composeDown = Command.make("down", {}, () =>
  Effect.gen(function* () {
    yield* runDockerCompose(["down"])
  }),
)

// Main compose command
const compose = Command.make("compose", {}, () =>
  Console.log("Docker Compose CLI - Use 'up' or 'down' subcommands"),
).pipe(Command.withSubcommands([composeUp, composeDown]))

// Run the CLI
const cli = Command.run(compose, {
  name: "Docker Compose Manager",
  version: "1.0.0",
})

cli(process.argv).pipe(Effect.provide(BunContext.layer), BunRuntime.runMain)
