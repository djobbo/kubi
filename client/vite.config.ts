import { lingui } from "@lingui/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import viteTsConfigPaths from "vite-tsconfig-paths"
import safeAssetsPlugin from "./plugins/safe-assets-plugin"
import { defineConfig } from 'vite'
import { env } from '@/env'

const pwaConfig = VitePWA({
	injectRegister: "auto",
	registerType: "autoUpdate",
	devOptions: { enabled: true },
	workbox: { globPatterns: ["**/*.{js,css,html,ico,png,svg}"] },
	manifest: {
		name: "Corehalla",
		short_name: "corehalla",
		description:
			"Track your Brawlhalla stats, view rankings, and more! • Corehalla",
		theme_color: "#f69435",
		icons: [
			{
				src: "/icons/icon-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/icons/icon-256x256.png",
				sizes: "256x256",
				type: "image/png",
			},
			{
				src: "/icons/icon-384x384.png",
				sizes: "384x384",
				type: "image/png",
			},
			{
				src: "/icons/icon-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	},
})

const config = defineConfig({
		plugins: [
			...lingui(),
			viteTsConfigPaths({
				projects: ["./tsconfig.json"],
			}),
			tailwindcss(),
			...pwaConfig,
			safeAssetsPlugin({
				outputFile: "src/assetsTree.gen.ts",
			}),
			tanstackStart({
				sitemap: {
					enabled: true,
					host: env.VITE_CLIENT_URL,
				},
				target: 'bun',
				react: {
					babel: {
						plugins: ["@lingui/babel-plugin-lingui-macro"],
					},
				}
			}),
		],
})

export default config
