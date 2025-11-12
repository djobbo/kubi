import { legends } from "@dair/brawlhalla-api/src/constants/legends"
import { load as loadHtml } from "cheerio"
import { Effect, Schema } from "effect"

// new error type
class WeeklyRotationError extends Schema.TaggedError<WeeklyRotationError>(
	"WeeklyRotationError",
)("WeeklyRotationError", {
	cause: Schema.optional(Schema.Unknown),
	message: Schema.optional(Schema.String),
}) {}

export const parseWeeklyRotation = Effect.fn(function* (content?: string) {
	if (!content)
		return yield* Effect.fail(
			new WeeklyRotationError({ message: "Content not found" }),
		)

	const $ = loadHtml(content)

	// Find list directly following the paragraph containing the required "free-to-play" phrase
	// eslint-disable-next-line lingui/no-unlocalized-strings
	const legendsList = $("p + ul")
		.filter((index, element) => {
			const el = $(element)
			const paragraphText = el.prev("p").text().toLowerCase()
			return paragraphText.includes("free-to-play legend rotation")
		})
		.first()

	if (legendsList.length < 1) {
		return yield* Effect.fail(
			new WeeklyRotationError({ message: "Legend list not found" }),
		)
	}

	// Select all list items within the <ul> following the found paragraph
	const legendsListItems = legendsList.find("li")

	// Extract the legend names
	const weeklyRotation = legendsListItems
		.map((_, element) => {
			const text = $(element).text()
			const legendName = text.split(" – ")[0] // Extracts the name before the hyphen

			const legend = legends.find((legend) => legend.bio_name === legendName)
			return legend
		})
		.get()
		.filter((legend) => !!legend)

	return weeklyRotation.map((legend) => ({
		id: legend.legend_id,
		name_key: legend.legend_name_key,
		name: legend.bio_name,
	}))
})
