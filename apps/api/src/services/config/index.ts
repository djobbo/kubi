/**
 * Dedicated config services following Effect best practices
 *
 * Each service has its own config with:
 * - `layer` - Production config from environment variables
 *
 * Import the specific config you need:
 * - ApiServerConfig - API server settings (port, URL, CORS)
 * - ClientConfig - Client app settings
 * - BrawlhallaApiConfig - Brawlhalla API key
 * - DatabaseConfig - Database connection
 * - OAuthConfig - OAuth secrets
 */

export { ApiServerConfig } from "./api-server-config"
export { ClientConfig } from "./client-config"
export { ConfigError } from "./errors"

// Re-export other config services for convenience
export { BrawlhallaApiConfig } from "../brawlhalla-api/config"
export { DatabaseConfig } from "../db/config"
export { OAuthConfig } from "../authorization/config"
