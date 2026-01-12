import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores(['.next/**', '**/src/.next/**', 'out/**', 'build/**', 'next-env.d.ts', '**/node_modules/**']),
  {
    rules: {
      // Prevent accidental any usage
      '@typescript-eslint/no-explicit-any': 'warn',

      // Ensure exhaustive deps in hooks
      'react-hooks/exhaustive-deps': 'warn',

      // Prefer const over let when not reassigned
      'prefer-const': 'error',

      // No unused variables (with underscore prefix ignore pattern)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
])

export default eslintConfig
