import { Layer, ManagedRuntime } from "effect"
import * as Fetcher from "./helpers/fetcher"
import * as BrawlhallaApi from "./services/brawlhalla-api"
import * as DB from "./services/db"

export const Runtime = ManagedRuntime.make(
	Layer.mergeAll(
		BrawlhallaApi.fromEnv,
		Fetcher.layer(),
		DB.layer({ url: "db.sqlite" }),
	),
)
