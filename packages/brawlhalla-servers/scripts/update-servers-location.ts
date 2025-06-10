import type { RankedRegion } from "@dair/brawlhalla-api/src/constants/ranked/regions"
import { lookup } from "dns/promises"
import { writeFile } from "fs/promises"

const servers = [
	{
		id: "US-E",
		url: "pingtest-atl.brawlhalla.com",
	},
	{
		id: "US-W",
		url: "pingtest-cal.brawlhalla.com",
	},
	{
		id: "EU",
		url: "pingtest-ams.brawlhalla.com",
	},
	{
		id: "SEA",
		url: "pingtest-sgp.brawlhalla.com",
	},
	{
		id: "AUS",
		url: "pingtest-aus.brawlhalla.com",
	},
	{
		id: "BRZ",
		url: "pingtest-brs.brawlhalla.com",
	},
	{
		id: "JPN",
		url: "pingtest-jpn.brawlhalla.com",
	},
	{
		id: "ME",
		url: "pingtest-mde.brawlhalla.com",
	},
	{
		id: "SA",
		url: "pingtest-saf.brawlhalla.com",
	},
] satisfies { id: RankedRegion; url: string }[]

type ServerWithInfo = {
	id: RankedRegion
	url: string
	ip: string
	location: {
		city: string
		country: string
		lat: number
		lon: number
		isp: string
	}
}

async function getIpAndLocation(server: {
	id: RankedRegion
	url: string
}): Promise<ServerWithInfo | null> {
	try {
		const ip = (await lookup(server.url)).address

		const res = await fetch(`http://ip-api.com/json/${ip}`)
		const data = await res.json()

		if (data.status !== "success") {
			throw new Error(`IP API failed: ${data.message}`)
		}

		return {
			...server,
			ip,
			location: {
				city: data.city,
				country: data.country,
				lat: data.lat,
				lon: data.lon,
				isp: data.isp,
			},
		}
	} catch (error) {
		console.error(`Failed to process ${server.id} (${server.url}):`, error)
		return null
	}
}

async function main() {
	const results = await Promise.all(servers.map(getIpAndLocation))
	const filteredResults = results.filter((r): r is ServerWithInfo => r !== null)

	await writeFile(
		"src/constants/servers.ts",
		`export const servers = ${JSON.stringify(filteredResults, null, 2)} as const`,
	)
	console.log("✅ Server location data successfully updated")
}

main()
