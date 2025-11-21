import { logger } from "@/helpers/logger"
import { legends } from "@dair/brawlhalla-api/src/constants/legends"
import { load as loadHtml } from "cheerio"

export const parseWeeklyRotation = (content?: string) => {
  if (!content) return []

  const $ = loadHtml(content)

  // Find list directly following the paragraph containing the required "free-to-play" phrase
  const legendsList = $("p + ul")
    .filter((index, element) => {
      const el = $(element)
      const paragraphText = el.prev("p").text().toLowerCase()
      return paragraphText.includes("free-to-play legend rotation")
    })
    .first()

  if (legendsList.length < 1) {
    logger.error(
      {
        legendsListLength: legendsList.length,
      },
      "Weekly rotation - Could not find legends list",
    )
    return []
  }

  // Select all list items within the <ul> following the found paragraph
  const legendsListItems = legendsList.find("li")

  // Extract the legend names
  const weeklyRotation = legendsListItems
    .map((index, element) => {
      const text = $(element).text()
      const legendName = text.split(" – ")[0] // Extracts the name before the hyphen

      const legend = legends.find((legend) => legend.bio_name === legendName)

      return legend
    })
    .get()
    .filter((legend) => !!legend)

  logger.info(
    {
      rotationLength: legendsListItems.length,
      rotation: weeklyRotation.map((legend) => legend.bio_name),
    },
    "Weekly rotation - Found",
  )

  return weeklyRotation
}
