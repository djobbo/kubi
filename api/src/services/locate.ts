import { servers } from "@dair/brawlhalla-servers"
import { z } from "@hono/zod-openapi"

// Haversine formula to calculate distance
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
	const toRad = (x: number) => (x * Math.PI) / 180
	const R = 6371 // Earth radius in km
	const dLat = toRad(lat2 - lat1)
	const dLon = toRad(lon2 - lon1)
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return R * c
}

const ipApiResponseSchema = z.object({
	data: z.object({
		status: z.literal("success"),
		lat: z.number(),
		lon: z.number(),
	}),
})

export const getRegion = async (ip: string) => {
	const res = await fetch(`http://ip-api.com/json/${ip}`) // TODO: use typesafe-fetch
	const parsedRes = ipApiResponseSchema.safeParse(await res.json())
	if (!parsedRes.data) {
		return null
	}

	const { lat, lon } = parsedRes.data.data

	const closestServer = servers.reduce<{
		server: (typeof servers)[number]
		distance: number
	}>(
		(closest, server) => {
			const distance = getDistance(
				lat,
				lon,
				server.location.lat,
				server.location.lon,
			)
			return distance < closest.distance ? { server, distance } : closest
		},
		{ server: servers[0], distance: Number.POSITIVE_INFINITY },
	)

	return closestServer.server.id
}
