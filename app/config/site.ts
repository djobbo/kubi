import type { IconType } from "@icons-pack/react-simple-icons"
import { SiGithub } from "@icons-pack/react-simple-icons"

interface SocialLink {
  name: string
  href: string
  Icon: IconType
}

export const siteConfig = {
  name: "Kubi",
  social: [
    {
      name: "Github",
      href: "",
      Icon: SiGithub,
    },
  ] satisfies SocialLink[],
} as const
