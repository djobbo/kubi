import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig, loadEnv } from "vite"

/** Monorepo root — canonical .env for all VITE_* and shared dev URLs. */
const repoRoot = resolve(fileURLToPath(new URL("../../", import.meta.url)))
import { lingui } from "@lingui/vite-plugin"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"
import safeAssetsPlugin from "./plugins/safe-assets-plugin"
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, "")
  const port = Number(env.APP_PORT || "3001")

  return {
    envDir: repoRoot,
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      lingui(),
      devtools(),
      nitro(),
      vanillaExtractPlugin(),
      tailwindcss(),
      safeAssetsPlugin({
        outputFile: "src/assetsTree.gen.ts",
      }),
      tanstackStart(),
      viteReact({
        babel: {
          plugins: ["@lingui/babel-plugin-lingui-macro"],
        },
      }),
    ],
    server: {
      port,
      allowedHosts: [env.VITE_DEV_HOST ?? "localhost"],
    },
  }
})
export default config
