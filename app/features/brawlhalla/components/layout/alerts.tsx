import { Trans } from "@lingui/react/macro"
import { Link } from "@tanstack/react-router"

export const alerts = {
  BH_MAINTENANCE: (
    <span>
      <Trans>
        Brawlhalla maintenance ongoing. More info{" "}
        <Link
          to="/discord"
          target="_blank"
          className="text-accentAlt font-semibold hover:text-text"
        >
          here
        </Link>{" "}
        !
      </Trans>
    </span>
  ),
  BH_SERVER_ISSUE: (
    <span>
      <Trans>
        Known issues with fetching stats from Brawlhalla{"'"}s servers, don
        {"'"}t panic. Updates{" "}
        <Link
          to="/discord"
          target="_blank"
          className="text-accentAlt font-semibold hover:text-text"
        >
          here
        </Link>{" "}
        !
      </Trans>
    </span>
  ),
  AUTH_ISSUES: (
    <span>
      <Trans>
        Authentication server is down, and so favorites aren{"'"}t accessible,
        sorry for the inconvenience. Updates{" "}
        <Link
          to="/discord"
          target="_blank"
          className="text-accentAlt font-semibold hover:text-text"
        >
          here
        </Link>{" "}
        !
      </Trans>
    </span>
  ),
  AUTH_ISSUES_RESOLVED: (
    <span>
      <Trans>
        Authentication server is back online, you can reconnect! Don{"'"}t
        forget to join our{" "}
        <Link
          to="/discord"
          target="_blank"
          className="text-accentAlt font-semibold hover:text-text"
        >
          Discord
        </Link>{" "}
        !
      </Trans>
    </span>
  ),
  NEW_BH_WIKI: (
    <span>
      <Trans>
        The Brawlhalla Wiki has officially migrated to its new home at wiki.gg!
        Explore the latest updates and resources by visiting{" "}
        <Link
          to="https://brawlhalla.wiki.gg"
          target="_blank"
          className="text-accentAlt font-semibold hover:text-text"
        >
          brawlhalla.wiki.gg
        </Link>{" "}
        today!
      </Trans>
    </span>
  ),
} as const
