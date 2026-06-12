// Root ESLint flat-config (Phase 2 — strict).
//
// Phase 1 (`aadd8fd`) brought lint back in CI with eight rules downgraded
// to warnings so the legacy codebase wouldn't fail the deploy. Phase 2
// re-tightened them to `error` and fixed the violations behind them; the
// CI lint step is now blocking.

import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  // Next.js + TypeScript baseline (re-exported by eslint-config-next 16).
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'react-hooks/exhaustive-deps': 'error',
      // React 19 strict-mode rules in eslint-plugin-react-hooks (shipped
      // by eslint-config-next 16).
      'react-hooks/set-state-in-effect': 'error',
      'react-hooks/immutability': 'error',
      'react/no-unescaped-entities': 'error',
      '@next/next/no-img-element': 'error',
      'prefer-const': 'error',
    },
  },

  // Override eslint-config-next's defaults so the monorepo-shaped tree is
  // covered correctly.
  globalIgnores([
    // eslint-config-next defaults
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',

    // Monorepo build outputs + deps
    'node_modules/**',
    '**/node_modules/**',
    '**/.next/**',
    '**/dist/**',
    '**/build/**',
    '.turbo/**',
    '**/.turbo/**',

    // Generated Prisma client (`packages/db/.generated` if/when wired)
    '**/.generated/**',
    '**/generated/**',

    // Native mobile builds
    'apps/mobile/android/**',
    'apps/mobile/ios/**',
    'apps/mobile/dist/**',

    // Infra (CDK app — separate tooling, lint in a follow-up session)
    'infra/cdk.out/**',

    // Worktrees / Claude Code state
    '.claude/**',

    // Plain JS scripts at the repo root (one-offs, no lint value)
    '**/*.cjs',
    'tmp/**',

    // One-shot tsx import scripts — also excluded from the Next build
    // typecheck for the same reason: they ship with strict-rule violations
    // and are not part of the deployed bundle. (ESLint runs from the
    // apps/web cwd, so paths here are relative to that.)
    'scripts/import-lib/**',
    'scripts/import-stitching-mama-catalogue.ts',

    // S-8b autonomous AI product-shot worker + helpers. Same shape: tsx-
    // invoked, dotenv loader for local credentials, not part of the
    // deployed bundle. Mirrors the tsconfig exclude.
    'scripts/_s8b-pick-metadata.ts',
    'scripts/_s8b-query-patterns.ts',
    'scripts/_s8b-test-generate.ts',
    'scripts/generate-sewing-product-shots.ts',
  ]),
])
