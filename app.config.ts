import { lingui } from "@lingui/vite-plugin"
import { defineConfig } from "@tanstack/start/config"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import tsConfigPaths from "vite-tsconfig-paths"

const pwaConfig = VitePWA({
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
})

export default defineConfig({
  vite: {
    plugins: [
      ...lingui(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      ...pwaConfig,
    ],
  },
  react: {
    babel: {
      plugins: ["@lingui/babel-plugin-lingui-macro"],
    },
  },
  server: {
    //TODO: change to `bun` when https://github.com/nksaraf/vinxi/issues/177 is resolved
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
