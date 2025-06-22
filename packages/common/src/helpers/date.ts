// TODO: remove dayjs
import { unix } from "dayjs"

/**
 * @error returns different dates in client or ssr mode
 * @issue https://github.com/iamkun/dayjs/issues/1690
 */
export const getDateStringFromUnixTime = (
	unixTime: number,
	template?: string,
) => unix(unixTime).format(template)

/**
 * @error returns different dates in client or ssr mode
 * @issue https://github.com/iamkun/dayjs/issues/1690
 */
export const getDateFromUnixTime = (unixTime: number) => unix(unixTime).toDate()

interface HMSTime {
	hours: number
	minutes: number
	seconds: number
}

export const getHMSFromSeconds = (seconds: number): HMSTime => {
	const minutes = Math.floor(seconds / 60)
	const hours = Math.floor(minutes / 60)

	return {
		hours,
		minutes: minutes % 60,
		seconds: seconds % 60,
	}
}

export const getHMSStringFromSeconds = (
	milliseconds: number,
	template: ({ hours, minutes, seconds }: HMSTime) => string,
) => {
	const timeData = getHMSFromSeconds(milliseconds)
	return template(timeData)
}

export const formatTime = (seconds: number) =>
	getHMSStringFromSeconds(
		seconds,
		// eslint-disable-next-line lingui/no-unlocalized-strings
		({ hours, minutes, seconds }) =>
			`${hours.toLocaleString()}h ${minutes.toLocaleString()}m ${seconds.toLocaleString()}s`,
	)

export const formatUnixTime = (unixTime: number) =>
	// eslint-disable-next-line lingui/no-unlocalized-strings
	getDateStringFromUnixTime(unixTime, "MMM DD, YYYY")
