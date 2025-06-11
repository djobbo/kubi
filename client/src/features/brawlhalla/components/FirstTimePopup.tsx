import {
	SiDiscord as DiscordIcon,
	SiGithub as GithubIcon,
	SiX as TwitterIcon,
} from "@icons-pack/react-simple-icons"
import { Trans } from "@lingui/react/macro"
import { Link } from "@tanstack/react-router"
import { X } from "lucide-react"

import { useLocalStorageState } from "@/hooks/useLocalStorageState"
import { Button } from "@/ui/components/button"

export const FirstTimePopup = () => {
	const [showPopup, setShowPopup] = useLocalStorageState(
		"first-time-popup",
		true,
		false,
	)

	if (!showPopup) return null

	return (
		<div className="fixed left-auto bottom-0 right-0 w-full max-w-sm flex flex-col gap-4 items-center justify-center bg-secondary border border-background rounded-lg m-2 p-4 z-50 shadow-md">
			<p className="flex flex-col items-center gap-3 text-center">
				<Trans>
					Welcome to the new and improved Corehalla 🎉. Have fun exploring!
				</Trans>
				<br />
				<span className="flex items-center gap-4">
					<span className="text-sm text-muted-foreground">
						<Trans>Join us:</Trans>
					</span>
					<Link
						className="text-muted-foreground hover:text-foreground"
						to="/discord"
						target="_blank"
					>
						<DiscordIcon size="24" />
					</Link>
					<Link
						className="text-muted-foreground hover:text-foreground"
						to="/twitter"
						target="_blank"
					>
						<TwitterIcon size="24" />
					</Link>
					<Link
						className="text-muted-foreground hover:text-foreground"
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
				className="absolute top-0 right-0 text-foreground text-sm font-bold hover:text-accent-foreground cursor-pointer p-2"
				onClick={() => {
					setShowPopup(false)
				}}
			>
				<X size={16} />
			</button>
		</div>
	)
}
