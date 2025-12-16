import { Effect, Schedule, Duration } from "effect"

/**
 * Options for creating a crawler schedule
 */
export type CrawlerScheduleOptions = {
  /** Interval between runs */
  interval: Duration.Duration
  /** Whether to run immediately on start (default: true) */
  runImmediately?: boolean
}

/**
 * Common schedule presets
 */
export const schedulePresets = {
  /** Every 10 minutes (for frequent updates like leaderboard snapshots) */
  frequent: { interval: Duration.minutes(10) },
  /** Every hour */
  hourly: { interval: Duration.hours(1) },
  /** Every 6 hours (for expensive operations like full player stats) */
  sixHours: { interval: Duration.hours(6) },
  /** Every 24 hours */
  daily: { interval: Duration.hours(24) },
} as const satisfies Record<string, CrawlerScheduleOptions>

/**
 * Format duration for logging
 */
const formatInterval = (interval: Duration.Duration): string => {
  const intervalMs = Duration.toMillis(interval)
  if (intervalMs >= 3600000) {
    return `${intervalMs / 3600000} hours`
  }
  return `${intervalMs / 60000} minutes`
}

/**
 * Create a scheduled crawler effect that repeats on a schedule
 * and handles failures gracefully.
 *
 * Runs once immediately, then repeats at the specified interval.
 */
export const createScheduledCrawler = <E, R>(
  name: string,
  crawler: Effect.Effect<void, E, R>,
  options: CrawlerScheduleOptions,
) => {
  // Always run immediately, then at interval
  const schedule = Schedule.union(
    Schedule.once,
    Schedule.spaced(options.interval),
  )

  return Effect.gen(function* () {
    yield* Effect.log(
      `Scheduling ${name} to run every ${formatInterval(options.interval)}`,
    )

    yield* Effect.repeat(
      crawler.pipe(
        Effect.catchAllCause((cause) =>
          Effect.logError(`${name} failed`, cause),
        ),
      ),
      schedule,
    )
  })
}
