/* eslint-disable lingui/no-unlocalized-strings */

import { lingui } from "@lingui/vite-plugin"
import { defineConfig } from "@tanstack/start/config"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import tsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  vite: {
    plugins: () => [
      lingui(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      ...VitePWA({
        injectRegister: "auto",
        registerType: "autoUpdate",
        devOptions: { enabled: true },
        workbox: { globPatterns: ["**/*.{js,css,html,ico,png,svg}"] },
        manifest: {
          name: "Kubi",
          short_name: "kubi",
          description: "Kubi",
          theme_color: "#ffffff",
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
  },
  react: {
    babel: {
      plugins: ["macros"],
    },
  },
  server: {
    preset: "bun",
  },
  routers: {
    ssr: {
      vite: {
        plugins: () => [
          react({
            babel: {
              plugins: ["macros"],
            },
          }),
        ],
      },
    },
  },
})
