// @ts-check

import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import stylistic from "@stylistic/eslint-plugin"
import tsParser from "@typescript-eslint/parser"

export default tseslint.config(
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/semi": ["error", "never"],
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/indent": ["error", 2],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/max-len": [
        "error",
        { "code": 80,"tabWidth": 4,"ignoreTrailingComments": true },
      ],
      "@stylistic/max-statements-per-line": ["error", { "max": 1 }],
      "@stylistic/array-element-newline": [
        "error",
        { "consistent": true, "multiline": true },
      ],
      "@stylistic/array-bracket-newline": ["error", { "multiline": true }],
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylisticTypeChecked,
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
)
