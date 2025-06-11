import { env } from "@/env"

/**
 * Google Analytics Identifier
 */
const GOOGLE_ANALYTICS_TRACKING_ID = env.VITE_GOOGLE_ANALYTICS_TRACKING_ID
/**
 * Google Adsense Identifier
 */
const GOOGLE_ADSENSE_ID = env.VITE_GOOGLE_ADSENSE_ID

/**
 * Google Adsense Publisher Identifier
 * ca-pub-[publisher-id]
 */
export const adsenseCaPub = `ca-pub-${GOOGLE_ADSENSE_ID}`

/**
 * Google Analytics pageview tracking
 * @link https://developers.google.com/analytics/devguides/collection/gtagjs/pages
 * @param url page url
 */
export const gaPageview = (url: string) => {
	// @ts-expect-error window.gtag is not defined
	window.gtag("config", GOOGLE_ANALYTICS_TRACKING_ID, {
		page_path: url,
	})
}

interface GAEvent {
	action: string
	category: string
	label: string
	value?: number
}

/**
 * Google Analytics event tracking
 * @link https://developers.google.com/analytics/devguides/collection/gtagjs/events
 */
export const gaEvent = ({ action, category, label, value }: GAEvent) => {
	// @ts-expect-error window.gtag is not defined
	window.gtag("event", action, {
		event_category: category,
		event_label: label,
		value,
	})
}
