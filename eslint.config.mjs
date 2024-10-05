// @ts-check

import eslint from "@eslint/js"
import react from "@eslint-react/eslint-plugin"
import pluginQuery from "@tanstack/eslint-plugin-query"
import pluginRouter from "@tanstack/eslint-plugin-router"
import pluginPrettier from "eslint-plugin-prettier/recommended"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import tseslint from "typescript-eslint"

export default tseslint.config(
  { ignores: ["node_modules", ".db", "migrations", ".output", ".vinxi"] },
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
)
