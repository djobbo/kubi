import {
  SiDiscord as DiscordIcon,
  SiGithub as GithubIcon,
  SiX as TwitterIcon,
} from "@icons-pack/react-simple-icons"
import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { Link } from "@tanstack/react-router"

import { Tooltip } from "@/components/base/Tooltip"

const getSocialLinks = () => [
  {
    href: "/discord",
    Icon: DiscordIcon,
    name: t`Discord`,
  },
  {
    href: "/twitter",
    Icon: TwitterIcon,
    name: t`Twitter`,
  },
  {
    href: "/github",
    Icon: GithubIcon,
    name: t`Github`,
  },
]

interface FooterProps {
  className?: string
}

export const Footer = ({ className }: FooterProps) => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={className}>
      <p className="text-center text-xs border-t border-bg py-8">
        <span className="block max-w-screen-sm mx-auto">
          <Trans>
            Visual assets courtesy of{" "}
            <a
              className="p-link"
              href="https://www.bluemammoth.com"
              rel="noreferrer noopener"
              target="_blank"
            >
              Blue Mammoth Games
            </a>
          </Trans>{" "}
          &{" "}
          <a
            className="p-link"
            href="https://www.flaticon.com/fr/packs/square-country-simple-flags"
            rel="noreferrer noopener"
            target="_blank"
          >
            <Trans>Freepik - Flaticon</Trans>
          </a>
          .
          <br />
          <Trans>
            Corehalla is neither associated nor endorsed by Blue Mammoth Games
            and doesn&apos;t reflect the views or opinions of Blue Mammoth Games
            or anyone officially involved in developing Brawlhalla.
          </Trans>
          <br />
          <Trans>
            Brawlhalla and Blue Mammoth Games are trademarks of{" "}
            <a
              className="p-link"
              href="https://www.bluemammoth.com"
              target="_blank"
              rel="noreferrer noopener"
            >
              Blue Mammoth Games
            </a>
          </Trans>
          .
        </span>
      </p>
      <div className="max-w-screen-lg mx-auto flex flex-col justify-center items-center border-t p-12 border-bg">
        <span className="text-sm">
          <Trans>Join the community:</Trans>
        </span>
        <div className="flex items-center gap-8 mt-4">
          {getSocialLinks().map(({ Icon, href, name }) => (
            <Tooltip content={name} key={name}>
              <Link
                to={href}
                target="_blank"
                className="text-textVar1 hover:text-text"
              >
                <Icon size={32} />
              </Link>
            </Tooltip>
          ))}
        </div>
        <p className="mr-1 text-xs text-textVar1 mt-8">
          <Trans>© 2018-{currentYear} Corehalla</Trans>
        </p>
      </div>
    </footer>
  )
}
