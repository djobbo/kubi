import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { Card } from "@/components/base/Card"
import { SectionTitle } from "@/features/brawlhalla/components/layout/SectionTitle"
import { getTierFromRating } from "@dair/brawlhalla-api/src/constants/ranked/tiers"
import {
	getGloryFromBestRating,
	getGloryFromWins,
	getLegendEloReset,
	getPersonalEloReset,
} from "@dair/brawlhalla-api/src/helpers/season-reset"

export const Route = createFileRoute("/calc")({
	component: RouteComponent,
})

const inputClassName =
	"w-full px-4 py-2 border bg-secondary border-border rounded-lg block mb-4"
const resultClassName = "text-xl font-semibold block text-center"

function RouteComponent() {
	const [hasPlayed10Games, setHasPlayed10Games] = useState(false)
	const [wins, setWins] = useState("0")
	const [rating, setRating] = useState("0")
	const [personalRating, setPersonalRating] = useState("0")
	const [heroRating, setHeroRating] = useState("0")

	const gloryWins = getGloryFromWins(Number.parseInt(wins || "0"))
	const gloryRating = getGloryFromBestRating(Number.parseInt(rating || "200"))

	const squashPersonal = getPersonalEloReset(
		Number.parseInt(personalRating || "0"),
	)
	const squashHero = getLegendEloReset(Number.parseInt(heroRating || "0"))

	return (
		<>
			<h1 className="text-3xl font-bold">
				<Trans>New Season Glory / ELO Reset Calculator</Trans>
			</h1>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div className="flex flex-col gap-4 items-center">
					<SectionTitle>
						<Trans>Glory Calculator</Trans>
					</SectionTitle>
					<Card>
						<label>
							<input
								className="mr-2"
								type="checkbox"
								checked={hasPlayed10Games}
								onChange={(e) => setHasPlayed10Games(e.target.checked)}
							/>
							<Trans>I have played 10 ranked games (or more).</Trans>
						</label>
					</Card>
					{hasPlayed10Games ? (
						<>
							<Card title={t`Wins (sum up all ranked playlists)`}>
								<input
									className={inputClassName}
									value={wins}
									onChange={(e) => setWins(e.target.value)}
									min={0}
									max={10000}
								/>
								<Trans>Glory from wins:</Trans>
								<span className={resultClassName}>{gloryWins}</span>
							</Card>
							<span className="operator">+</span>
							<Card title={t`Best Rating`}>
								<input
									className={inputClassName}
									value={rating}
									onChange={(e) => setRating(e.target.value)}
									min={200}
									max={4000}
								/>
								<Trans>Glory from best rating:</Trans>
								<span className={resultClassName}>{gloryRating}</span>
							</Card>
							<span className="operator">=</span>
							<Card title={t`Total Glory`}>
								<span className={resultClassName}>
									{gloryWins + gloryRating}
								</span>
							</Card>
						</>
					) : (
						<Trans>You gotta play at least 10 ranked games!</Trans>
					)}
				</div>
				<div className="flex flex-col gap-4 items-center">
					<SectionTitle>
						<Trans>Elo Squash Calculator</Trans>
					</SectionTitle>
					<Card title={t`Personal Rating`}>
						<input
							className={inputClassName}
							value={personalRating}
							onChange={(e) => setPersonalRating(e.target.value)}
							min={200}
							max={4000}
						/>
						<Trans>Personal Rating Squash:</Trans>
						<span className={resultClassName}>
							{squashPersonal} ({getTierFromRating(squashPersonal)})
						</span>
					</Card>
					<Card title={t`Legend/Team Rating`}>
						<input
							className={inputClassName}
							value={heroRating}
							onChange={(e) => setHeroRating(e.target.value)}
							min={200}
							max={4000}
						/>
						<Trans>Legend/Team Rating Squash:</Trans>
						<span className={resultClassName}>
							{squashHero} ({getTierFromRating(squashHero)})
						</span>
					</Card>
				</div>
			</div>
		</>
	)
}
