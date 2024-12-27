import {
  SiDiscord as DiscordIcon,
  SiGithub as GithubIcon,
  SiX as TwitterIcon,
} from "@icons-pack/react-simple-icons"
import { Trans } from "@lingui/react/macro"
import { Link } from "@tanstack/react-router"

import { Button } from "@/components/base/Button"
import { useLocalStorageState } from "@/hooks/useLocalStorageState"

export const FirstTimePopup = () => {
  const [showPopup, setShowPopup] = useLocalStorageState(
    "first-time-popup",
    true,
    false,
  )

  if (!showPopup) return null

  return (
    <div className="fixed left-auto bottom-0 right-0 w-full max-w-sm flex flex-col gap-4 items-center justify-center bg-bgVar2 border border-bgVar1 rounded-lg m-2 p-4 z-50 shadow-md">
      <p className="flex flex-col items-center gap-3 text-center">
        <Trans>
          Welcome to the new and improved Corehalla 🎉. Have fun exploring!
        </Trans>
        <br />
        <span className="flex items-center gap-4">
          <span className="text-sm text-textVar1">
            <Trans>Join us:</Trans>
          </span>
          <Link
            className="text-textVar1 hover:text-text"
            to="/discord"
            target="_blank"
          >
            <DiscordIcon size="24" />
          </Link>
          <Link
            className="text-textVar1 hover:text-text"
            to="/twitter"
            target="_blank"
          >
            <TwitterIcon size="24" />
          </Link>
          <Link
            className="text-textVar1 hover:text-text"
            to="/github"
            target="_blank"
          >
            <GithubIcon size="24" />
          </Link>
        </span>
      </p>
      <Button
        onClick={() => {
          setShowPopup(false)
        }}
      >
        <Trans>I understand 💪</Trans>
      </Button>
      <button
        type="button"
        className="absolute top-0 right-0 text-text text-sm font-bold hover:text-accent cursor-pointer p-2"
        onClick={() => {
          setShowPopup(false)
        }}
      >
        <CloseIcon size={16} />
      </button>
    </div>
  )
}
