import { t } from "@lingui/core/macro"
import { Trans } from "@lingui/react/macro"
import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { Suspense } from "react"
import { SearchButton } from "@/features/brawlhalla/components/search/SearchButton"
import { DiscordCard } from "@/features/brawlhalla/components/DiscordCard"
import { LandingArticles } from "@/features/brawlhalla/components/LandingArticles"
import { WeeklyRotation } from "@/features/brawlhalla/components/WeeklyRotation"
import { css } from "@/panda/css"
import { Button } from "@/ui/components/button"
import { cn } from "@/ui/lib/utils"
import { CommandMenu } from "@/features/command/components/command-menu"

export const Route = createFileRoute("/")({
	component: Home,
	loader: async ({ context: { apiClient } }) => {
		const [articles, weeklyRotation] = await Promise.all([
			apiClient.brawlhalla
				.getArticles({
					query: {
						first: "3",
					},
				})
				.then((res) => res.json())
				.then((res) => res.data),
			apiClient.brawlhalla
				.getWeeklyRotation()
				.then((res) => res.json())
				.then((res) => res.data),
		])

		return {
			articles,
			weeklyRotation,
		}
	},
})

const landingClassName = css({
	height: "60vh",
	minHeight: "400px",
})

function Home() {
	const { articles, weeklyRotation } = Route.useLoaderData()

	return (
		<>
			<div className="flex flex-col items-center justify-center lg:gap-16 lg:flex-row">
				<div
					className={cn(
						"relative flex flex-col justify-center items-center lg:items-start z-0",
						landingClassName,
						'after:content[""] after:absolute after:inset-0 after:bg-accent-foreground after:blur-[256px] after:opacity-[0.08] after:-z-10',
					)}
				>
					<a
						href="/discord"
						target="_blank"
						className="flex items-center gap-2 pl-3 pr-2 py-1 bg-background/75 rounded-full border border-border text-sm hover:bg-secondary"
						aria-label={t`Join Corehalla's Discord server`}
						rel="noreferrer"
					>
						<span className="border-r border-r-border pr-2">
							<Trans>Join our community</Trans>
						</span>
						<span className="flex items-center gap-1 font-semibold text-center bg-gradient-to-l from-accent-foreground to-accent-secondary-foreground bg-clip-text text-fill-none">
							<Trans>Discord</Trans>
							<ArrowRight className="w-4 h-4" />
						</span>
					</a>
					<h1
						className={cn(
							"text-center text-5xl sm:text-6xl font-bold mt-6 max-w-5xl",
							"lg:text-start lg:max-w-3xl",
						)}
					>
						<Trans>
							Stay ahead of <br />
							the competition
						</Trans>
					</h1>
					<p
						className={cn(
							"text-center text-sm sm:text-base mt-3 text-muted-foreground max-w-xl ",
							"lg:text-start",
						)}
					>
						<Trans>
							Improve your Brawlhalla Game, and find your place among the Elite
							with our in-depth stats tracking and live leaderboards.
						</Trans>
					</p>
					<div className="mt-8 flex items-center gap-3 sm:gap-6 flex-col sm:flex-row">
						{/* <SearchButton /> */}
						<CommandMenu title={t`Search player...`} />
						<span className="text-muted-foreground text-sm sm:text-base">
							or
						</span>
						<div className="flex items-center gap-2">
							<Button asChild className="whitespace-nowrap font-semibold">
								<Link to="/rankings/1v1/$">
									<Trans>View rankings</Trans>
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								className="whitespace-nowrap font-semibold"
							>
								<Link to="/rankings/2v2/$">
									<Trans>2v2</Trans>
								</Link>
							</Button>
						</div>
					</div>
				</div>
				<div>
					<DiscordCard />
					<a
						href="/discord"
						target="_blank"
						aria-label="Discord server link"
						className="block text-sm mt-2 text-muted-foreground text-center"
						rel="noreferrer"
					>
						corehalla.com/discord
					</a>
				</div>
			</div>
			<Suspense
				fallback={
					<Trans>
						Loading
						<span className="animate-pulse">...</span>
					</Trans>
				}
			>
				<WeeklyRotation weeklyRotation={weeklyRotation} />
			</Suspense>
			<Suspense
				fallback={
					<Trans>
						Loading
						<span className="animate-pulse">...</span>
					</Trans>
				}
			>
				<LandingArticles articles={articles} />
			</Suspense>
		</>
	)
}
