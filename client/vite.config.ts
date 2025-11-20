import { defineConfig } from 'vite'
import { lingui } from "@lingui/vite-plugin"
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import safeAssetsPlugin from "./plugins/safe-assets-plugin"
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

const config = defineConfig({
  plugins: [
		...lingui(),
    devtools(),
    nitro(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
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
})

export default config
