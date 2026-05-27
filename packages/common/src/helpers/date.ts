import { DateTime } from "effect"

const unixTimeToDateTime = (unixTime: number) =>
  DateTime.makeUnsafe(unixTime * 1000)

export const getDateStringFromUnixTime = (
  unixTime: number,
  options?: Intl.DateTimeFormatOptions & { locale?: string },
) => DateTime.formatLocal(unixTimeToDateTime(unixTime), options)

export const getDateFromUnixTime = (unixTime: number) =>
  DateTime.toDate(unixTimeToDateTime(unixTime))

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
    ({ hours, minutes, seconds }) =>
      `${hours.toLocaleString()}h ${minutes.toLocaleString()}m ${seconds.toLocaleString()}s`,
  )

export const formatUnixTime = (unixTime: number) =>
  getDateStringFromUnixTime(unixTime, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
