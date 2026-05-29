/**
 * Span name for Effect HTTP server tracing — method plus path and query
 * (e.g. `GET /v1/brawlhalla/players/123?page=1`).
 */
export const httpServerSpanName = (request: {
  readonly method: string
  readonly url: string
}): string => {
  const hash = request.url.indexOf("#")
  const pathAndQuery = hash === -1 ? request.url : request.url.slice(0, hash)
  return `${request.method} ${pathAndQuery}`
}
