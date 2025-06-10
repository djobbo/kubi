import type { KnipConfig } from "knip"

export default {
	entry: [
		// @tanstack/react-start
		"app.config.ts",
		"app/client.tsx",
		"app/router.ts",
		"app/ssr.tsx",
		"app/routes/**/*.tsx",
		"app/routes/api/**/*.ts",
		"app/routeTree.gen.ts",
		"app/api.ts",
		// scripts
		"scripts/**/*.ts",
		// migration script
		"app/db/migrate.ts",
		// pwa assets
		"pwa-assets.config.ts",
		// lingui
		"lingui.config.ts",
	],
	// TOREMOVE: when github actions plugin works
	"github-actions": { config: [".github/workflows/*.{yml}"] },
} satisfies KnipConfig
