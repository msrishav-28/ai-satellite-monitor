/*
  Flat ESLint configuration for the canonical /space frontend.
  Updated in Phase 4 to consume Next.js' native flat configs directly so lint
  validation works with the installed ESLint 9 toolchain.
*/

import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ['src/visual-edits/**'],
  },
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  {
    files: ['src/components/Space3D.tsx'],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
  {
    files: ['src/components/ui/sidebar.tsx'],
    rules: {
      'react-hooks/purity': 'off',
    },
  },
]

export default eslintConfig
