import { createClient } from "@supabase/supabase-js"
import { Context, Effect, Layer, Redacted } from "effect"

import type { Database } from "../../database.types"
import { MigrationConfig } from "../config"

export class LegacySupabase extends Context.Service<LegacySupabase>()(
  "@dair/migrator/LegacySupabase",
  {
    make: Effect.gen(function* () {
      const config = yield* MigrationConfig

      const client = createClient<Database>(
        config.supabaseUrl,
        Redacted.value(config.supabaseServiceKey),
      )

      return { client }
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(MigrationConfig.layer),
  )
}
