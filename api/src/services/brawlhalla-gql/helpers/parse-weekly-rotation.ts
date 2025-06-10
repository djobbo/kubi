import { load as loadHtml } from 'cheerio';
import { legends } from '@dair/brawlhalla-api/src/constants/legends';

export const parseWeeklyRotation = (content?: string) => {
  if (!content) return [];

  const $ = loadHtml(content);

  // Find list directly following the paragraph containing the required "free-to-play" phrase
  // eslint-disable-next-line lingui/no-unlocalized-strings
  const legendsList = $('p + ul')
    .filter((index, element) => {
      const el = $(element);
      const paragraphText = el.prev('p').text().toLowerCase();
      return paragraphText.includes('free-to-play legend rotation');
    })
    .first();

  if (legendsList.length < 1) {
    // TODO: logger
    // logError("getWeeklyRotation", "Could not find legends list")
    console.error('getWeeklyRotation', 'Could not find legends list');
    return [];
  }

  // Select all list items within the <ul> following the found paragraph
  const legendsListItems = legendsList.find('li');
  // TODO: logger
  // logInfo("getWeeklyRotation", `Found ${legendsListItems.length} list items`)
  console.log('getWeeklyRotation', `Found ${legendsListItems.length} list items`);

  // Extract the legend names
  const weeklyRotation = legendsListItems
    .map((index, element) => {
      const text = $(element).text();
      const legendName = text.split(' – ')[0]; // Extracts the name before the hyphen

      const legend = legends.find((legend) => legend.bio_name === legendName);

      return legend;
    })
    .get();

  return weeklyRotation;
}