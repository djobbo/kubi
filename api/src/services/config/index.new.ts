/**
 * Dedicated config services following Effect best practices
 * 
 * Each service has its own config with:
 * - `layer` - Production config from environment variables
 * - `testLayer` - Mock config for testing
 */

export { ApiServerConfig } from "./api-server-config"
export { ClientConfig } from "./client-config"
export { ConfigError } from "./errors"

// Re-export other config services for convenience
export { BrawlhallaApiConfig } from "../brawlhalla-api/config"
export { DatabaseConfig } from "../db/config"
export { OAuthConfig } from "../authorization/config"

