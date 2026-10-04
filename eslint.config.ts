import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import playwright from 'eslint-plugin-playwright'

export default [
  {
    ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    },
  },
  {
    files: ['tests/**/*.ts'],
    plugins: { playwright },
    rules: {
      ...playwright.configs.recommended.rules,
      'playwright/expect-expect': 'off',
    },
  },
]
