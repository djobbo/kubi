import * as DB from "@/services/db"
import { aliasesTable } from "@dair/schema"
import { and, eq } from "drizzle-orm"
import { Context, Effect, Layer, Schema } from "effect"

export class ArchiveError extends Schema.TaggedError<ArchiveError>(
	"ArchiveError",
)("ArchiveError", {
	cause: Schema.optional(Schema.Unknown),
	message: Schema.optional(Schema.String),
}) {}

export class Archive extends Context.Tag("Archive")<
	Archive,
	ReturnType<typeof archive>
>() {}

const archive = () => {
	return {
		getAliases: (playerId: number) =>
			Effect.gen(function* () {
				const db = yield* DB.DB
				const aliases = yield* db.use(async (db) => {
					return await db
						.select()
						.from(aliasesTable)
						.where(
							and(
								eq(aliasesTable.playerId, playerId.toString()),
								eq(aliasesTable.public, true),
							),
						)
						.execute()
				})
				return aliases
			}).pipe(
				Effect.catchAll((error) => {
					return Effect.fail(
						ArchiveError.make({
							cause: error,
							message: "Failed to get aliases",
						}),
					)
				}),
			),
	}
}

export const make = () => {
	const api = archive()
	return Effect.succeed(Archive.of(api))
}

export const layer = () => {
	return Layer.scoped(Archive, make())
}
