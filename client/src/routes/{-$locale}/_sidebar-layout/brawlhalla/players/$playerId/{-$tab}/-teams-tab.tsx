import type { Player } from '@dair/api-contract/src/routes/v1/brawlhalla/get-player-by-id'

interface TeamsTabProps {
	ranked: typeof Player.Type['ranked']
}

export function TeamsTab({ ranked }: TeamsTabProps) {
	const { "2v2": ranked2v2 } = ranked ?? {}
	if (!ranked2v2) return null

	return (
		<>
			<h3 className="text-sm uppercase text-text-muted font-semibold">
				<pre>{JSON.stringify(ranked2v2, null, 2)}</pre>
			</h3>
		</>
	)
}
