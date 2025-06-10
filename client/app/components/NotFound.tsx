import { Trans } from "@lingui/react/macro"
import { Link } from "@tanstack/react-router"

import { Button } from "@/ui/components/button"

export const NotFound = () => {
	return (
		<div className="space-y-2 p-2">
			<p>
				<Trans>The page you are looking for does not exist.</Trans>
			</p>
			<p className="flex items-center gap-2 flex-wrap">
				<Button type="button" onClick={() => window.history.back()}>
					<Trans>Go back</Trans>
				</Button>
				<Button asChild variant="secondary">
					<Link to="/">
						<Trans>Home</Trans>
					</Link>
				</Button>
			</p>
		</div>
	)
}
