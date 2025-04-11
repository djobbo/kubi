import { lingui } from "@lingui/vite-plugin"
import { defineConfig } from "@tanstack/react-start/config"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import tsConfigPaths from "vite-tsconfig-paths"

import { safeAssetsPlugin } from "./plugins/safe-assets-plugin"

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

export default defineConfig({
  vite: {
    plugins: [
      ...lingui(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      ...pwaConfig,
      safeAssetsPlugin({
        outputFile: "app/assetsTree.gen.ts",
      }),
    ],
  },
  react: {
    babel: {
      plugins: ["@lingui/babel-plugin-lingui-macro"],
    },
  },
  server: {
    preset: "bun",
  },
  routers: {
    ssr: {
      vite: {
        plugins: [
          ...react({
            babel: {
              plugins: ["macros"],
            },
          }),
        ],
      },
    },
  },
})
