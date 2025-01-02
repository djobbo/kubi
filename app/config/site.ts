import type { IconType } from "@icons-pack/react-simple-icons"
import { SiGithub } from "@icons-pack/react-simple-icons"
import { t } from "@lingui/core/macro"

interface SocialLink {
  title: string
  href: string
  Icon: IconType
}

export const siteConfig = (() => {
  return {
    title: t`Corehalla`,
    social: [
      {
        title: t`Github`,
        href: "https://github.com/djobbo/corehalla",
        Icon: SiGithub,
      },
    ] satisfies SocialLink[],
  } as const
})()
