// @ts-check

import eslint from "@eslint/js"
import pluginRouter from "@tanstack/eslint-plugin-router"
import tsParser from "@typescript-eslint/parser"
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
  ...pluginRouter.configs["flat/recommended"],
  pluginPrettier,
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { modules: true },
        ecmaVersion: "latest",
        project: "./tsconfig.json",
      },
    },
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
