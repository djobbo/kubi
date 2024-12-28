import {
  SiDiscord as DiscordIcon,
  SiGithub as GithubIcon,
} from "@icons-pack/react-simple-icons"
import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/base/Button"
import { Image } from "@/features/brawlhalla/components/Image"

import { SectionTitle } from "./SectionTitle"

interface ErrorPageContentProps {
  title?: string
  statusCode?: number
}

export const ErrorPageContent = ({
  title = t`Oops, something went wrong`,
  statusCode,
}: ErrorPageContentProps) => {
  const navigate = useNavigate()

  return (
    <div>
      <SectionTitle className="text-center">{title}</SectionTitle>
      {!!statusCode && (
        <Image
          src={`assets/images/errors/error-${statusCode}.png`}
          alt={t`${statusCode} Error`}
          containerClassName="w-full h-full min-h-[240px] md:min-h-[400px]"
          className="object-contain object-center"
        />
      )}
      <div className="flex flex-col justify-center items-center gap-4">
        <Button buttonStyle="primary" onClick={() => navigate({ to: "/" })}>
          <Trans>Bring me home</Trans>
        </Button>
        <div className="flex justify-center items-center gap-2">
          <Button
            buttonStyle="outline"
            onClick={() => {
              window?.open("/discord", "_blank", "noreferrer")?.focus()
            }}
            className="flex items-center gap-2"
          >
            <DiscordIcon size={16} /> <Trans>Report bug</Trans>
          </Button>
          <Button
            buttonStyle="outline"
            onClick={() => {
              window?.open("/github", "_blank", "noreferrer")?.focus()
            }}
            className="flex items-center gap-2"
          >
            <GithubIcon size={16} /> <Trans>Contribute</Trans>
          </Button>
        </div>
      </div>
    </div>
  )
}
