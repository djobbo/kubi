// @ts-check

import eslint from "@eslint/js"
import react from "@eslint-react/eslint-plugin"
import pluginQuery from "@tanstack/eslint-plugin-query"
import pluginRouter from "@tanstack/eslint-plugin-router"
import lingui from "eslint-plugin-lingui"
import pluginPrettier from "eslint-plugin-prettier/recommended"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: [
      "node_modules",
      ".db",
      "app/migrations",
      ".output",
      ".vinxi",
      "locales/*.js",
    ],
  },
  {
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/imports": ["error"],
      "simple-import-sort/exports": ["error"],
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylisticTypeChecked,
  react.configs.recommended,
  pluginPrettier,
  ...pluginRouter.configs["flat/recommended"],
  ...pluginQuery.configs["flat/recommended"],
  {
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    ...react.configs["recommended-type-checked"],
  },
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "no-console": "error",
    },
  },
  {
    files: ["app/**/*.{ts,tsx}"],
    plugins: {
      lingui,
    },
    rules: {
      "lingui/no-unlocalized-strings": [
        "error",
        {
          ignore: [
            // Ignore strings which are a single "word" (no spaces)
            // and doesn't start with an uppercase letter
            "^(?![A-Z])\\S+$",
            // Ignore UPPERCASE literals
            "^[A-Z0-9_-]+$",
          ],
          ignoreNames: [
            // Ignore matching className (case-insensitive)
            { regex: { pattern: "className", flags: "i" } },
            "styleName",
            "src",
            "srcSet",
            "type",
            "id",
            "width",
            "height",
            "displayName",
            "Authorization",
          ],
          ignoreFunctions: [
            "cva",
            "cn",
            "track",
            "Error",
            "console.*",
            "*headers.set",
            "*.addEventListener",
            "*.removeEventListener",
            "*.postMessage",
            "*.getElementById",
            "*.dispatch",
            "*.commit",
            "*.includes",
            "*.indexOf",
            "*.endsWith",
            "*.startsWith",
            "require",
            "envField",
            "setHeader",
            "css",
            "defineKeyframes",
          ],
          useTsTypes: true,
          ignoreMethodsOnTypes: ["Map.get", "Map.has", "Set.has"],
        },
      ],
      "lingui/t-call-in-function": "error",
      "lingui/no-single-variables-to-translate": "error",
      "lingui/no-expression-in-message": "error",
      "lingui/no-single-tag-to-translate": "error",
      "lingui/no-trans-inside-trans": "error",
    },
  },
)
