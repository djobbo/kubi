import { readdir, writeFile } from "node:fs/promises"
import path from "node:path"

import type { PluginOption } from "vite"

interface Config {
  runOnInit: boolean
  outputFile: string
}

const defaultConfig: Config = {
  runOnInit: true,
  outputFile: "assets.gen.ts",
}

const findAllFiles = async (dir: string): Promise<string[]> => {
  const filesAndDirs = await readdir(dir, { withFileTypes: true })

  const files = await Promise.all(
    filesAndDirs.map(async (fileOrDir) => {
      const res = path.resolve(dir, fileOrDir.name)
      return fileOrDir.isDirectory() ? findAllFiles(res) : res
    }),
  )

  return files.flat()
}

interface AssetsTree {
  [key: string]: string | AssetsTree
}

export const safeAssetsPlugin = (config?: Partial<Config>): PluginOption => {
  let abortController: AbortController | null = null
  let publicDir: string
  const options: Config = {
    ...defaultConfig,
    ...config,
  }

  const generate = async () => {
    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()
    const publicFilesFullPath = await findAllFiles(publicDir)
    const publicFiles = publicFilesFullPath.map((file) =>
      file.replace(publicDir, ""),
    )

    if (abortController.signal.aborted) {
      return
    }

    const assetsTree = publicFiles.reduce((acc, path) => {
      const parts = path.split("/").filter(Boolean)
      let current = acc
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        if (i === parts.length - 1) {
          current[part] = path
        } else {
          current[part] ??= {}
          if (typeof current[part] === "string") {
            throw new Error(
              `File ${path} conflicts with ${current[part]} at ${part}`,
            )
          }

          current = current[part]
        }
      }
      return acc
    }, {} as AssetsTree)

    const generatedFileContent = `/* eslint-disable */

// @ts-nocheck

export const safeAssets = ${JSON.stringify(publicFiles, null, 2)} as const;

export type SafeAsset = typeof safeAssets[number];

export const assetsTree = ${JSON.stringify(assetsTree, null, 2)} as const;
`

    await writeFile(options.outputFile, generatedFileContent, {
      signal: abortController.signal,
    })
  }

  return {
    name: "vite-safe-assets-plugin",

    configResolved(config) {
      publicDir = config.publicDir
    },

    buildStart() {
      if (!options.runOnInit) return
      generate()
    },

    handleHotUpdate({ file }) {
      const shouldRun = file.startsWith(publicDir)

      if (shouldRun) {
        generate()
      }
    },
  }
}
