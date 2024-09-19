// @ts-check

import eslint from "@eslint/js"
import stylistic from "@stylistic/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import tseslint from "typescript-eslint"

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
        {"code": 80,"tabWidth": 4,"ignoreTrailingComments": true},
      ],
      "@stylistic/max-statements-per-line": ["error", {"max": 1}],
      "@stylistic/array-element-newline": [
        "error",
        {"consistent": true, "multiline": true},
      ],
      "@stylistic/array-bracket-newline": ["error", {"multiline": true}],
      "@stylistic/jsx-wrap-multilines": [
        "error",
        {
          "declaration": "parens-new-line",
          "assignment": "parens-new-line",
          "return": "parens-new-line",
          "arrow": "parens-new-line",
          "condition": "parens-new-line",
          "logical": "parens-new-line",
          "prop": "parens-new-line",
          "propertyValue": "parens-new-line",
        },
      ],
      "@stylistic/jsx-closing-tag-location": ["error"],
      "@stylistic/jsx-first-prop-new-line": ["error", "multiline"],
      "@stylistic/jsx-newline": ["error", {"prevent": true}],
      "@stylistic/type-annotation-spacing": ["error"],
      "@stylistic/jsx-props-no-multi-spaces": ["error"],
      "@stylistic/no-multi-spaces": ["error"],
      "@stylistic/no-trailing-spaces": ["error"],
      "@stylistic/no-multiple-empty-lines": ["error", {"max": 1}],
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/padded-blocks": ["error", "never"],
      "@stylistic/no-whitespace-before-property": ["error"],
      "@stylistic/object-curly-spacing": ["error", "never"],
      "@stylistic/array-bracket-spacing": ["error", "never"],
      "@stylistic/arrow-spacing": ["error", {"before": true, "after": true}],
    },
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": ["error"],
      "simple-import-sort/exports": ["error"],
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {modules: true},
        ecmaVersion: "latest",
        project: "./tsconfig.json",
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {prefer: "type-imports", fixStyle: "separate-type-imports"},
      ],
    },
  },
  {
    ignores: ["node_modules", ".db", "migrations", ".output", ".vinxi"],
  },
)
