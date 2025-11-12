import { Counter, Histogram } from "prom-client"

// Create metrics
export const httpRequestsTotal = new Counter({
	name: "http_requests_total",
	help: "Total number of HTTP requests",
	labelNames: ["method", "path", "status"],
})

export const httpRequestDuration = new Histogram({
	name: "http_request_duration_seconds",
	help: "HTTP request duration in seconds",
	labelNames: ["method", "path", "status"],
	buckets: [0.1, 0.5, 1, 2, 5],
})

// Function to collect metrics for a request
export function collectMetrics(
	method: string,
	path: string,
	status: number,
	duration: number,
) {
	httpRequestsTotal.inc({ method, path, status })
	httpRequestDuration.observe({ method, path, status }, duration / 1000) // Convert ms to seconds
}
