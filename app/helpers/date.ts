import { t } from "@lingui/core/macro"
import { unix } from "dayjs"

/**
 * @error returns different dates in client or ssr mode
 * @issue https://github.com/iamkun/dayjs/issues/1690
 */
export const getDateFromUnixTime = (unixTime: number, template?: string) =>
  unix(unixTime).format(template)

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
    ({ hours, minutes, seconds }) => t`${hours}h ${minutes}m ${seconds}s`,
  )

export const formatUnixTime = (unixTime: number) =>
  // eslint-disable-next-line lingui/no-unlocalized-strings
  getDateFromUnixTime(unixTime, "MMM DD, YYYY")
