// Root ESLint flat-config (Phase 1 migration).
//
// Goal of this config: get a working linter back in CI. `next lint` was
// removed in Next 16; eslint-config-next now ships flat-config presets we
// consume directly.
//
// Rules are intentionally permissive — `pnpm lint` should exit 0 on the
// current codebase so deploys don't start failing on legacy violations.
// A separate session will tighten rules and clean up existing violations.
// If you find yourself adding `// eslint-disable-next-line` comments to
// silence a rule, leave a TODO pointing at that follow-up.

import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  // Next.js + TypeScript baseline (re-exported by eslint-config-next 16).
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      // Permissive Phase 1 ruleset. Anything noisy is a warning; nothing
      // here errors. The cleanup pass turns these back to the project's
      // intended strictness.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'react-hooks/exhaustive-deps': 'warn',
      // React 19 strict-mode rules in eslint-plugin-react-hooks (shipped
      // by eslint-config-next 16). Several legacy effects + the TipTap
      // editor's hook-storage mutation trip these; cleanup pass tightens.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      // The auto-loaded Next.js rule-set treats unescaped HTML entities as
      // an error; downgrade to warn for Phase 1.
      'react/no-unescaped-entities': 'warn',
      // Some legacy admin pages use plain <img> instead of next/image —
      // intentional for one-off small assets. Warn rather than error.
      '@next/next/no-img-element': 'warn',
      'prefer-const': 'warn',
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
  ]),
])
