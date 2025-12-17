import { Config, Effect } from "effect"

/**
 * Worker configuration service.
 * Manages environment variables for the workers app.
 */
export class WorkerConfig extends Effect.Service<WorkerConfig>()(
  "@dair/workers/WorkerConfig",
  {
    effect: Effect.gen(function* () {
      return {
        /** Base URL of the API server */
        apiUrl: yield* Config.nonEmptyString("API_URL"),
        /** API key for worker authentication (enables fetch-first strategy) */
        workerApiKey: yield* Config.redacted("WORKER_API_KEY"),
      }
    }),
  },
) {
  static readonly layer = this.Default
}
