import type { Context } from "hono"

export const getIp = (c: Context) => {
	// Check various headers for real IP (useful behind proxies/load balancers)
	const forwarded = c.req.header("x-forwarded-for")
	const realIp = c.req.header("x-real-ip")
	const cfConnectingIp = c.req.header("cf-connecting-ip") // Cloudflare

	// Get the first IP from x-forwarded-for (in case of multiple proxies)
	const forwardedIp = forwarded?.split(",")[0]?.trim()

	// Prefer headers over socket address (more accurate behind proxies)
	const clientIp =
		cfConnectingIp ||
		realIp ||
		forwardedIp ||
		c.env.incoming?.socket?.remoteAddress

	return clientIp
}
