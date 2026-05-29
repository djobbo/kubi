import { devWorkerApiKey } from "@dair/common/src/constants/dev-worker-api-key"
import { Config, Context, Effect, Layer, Redacted } from "effect"

/**
 * Worker configuration service.
 * Manages environment variables for the workers app.
 */
export class WorkerConfig extends Context.Service<WorkerConfig>()(
  "@dair/workers/WorkerConfig",
  {
    make: Effect.gen(function* () {
      return {
        apiUrl: yield* Config.nonEmptyString("API_URL"),
        workerApiKey: yield* Config.redacted("WORKER_API_KEY").pipe(
          Config.orElse(() => Config.succeed(Redacted.make(devWorkerApiKey))),
        ),
      }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make)
}
