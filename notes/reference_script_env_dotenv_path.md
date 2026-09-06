---
name: reference_script_env_dotenv_path
description: "ops/import tsx scripts that use `import 'dotenv/config'` need DOTENV_CONFIG_PATH pointed at .env.credentials"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4d0de1cf-5dc1-4ca9-91f2-6fe91b5a468a
---

**Corrected 2026-09-06 (notes audit, checked against the tree).** The hard-coded
`C:/Users/Rebecca/Projects/code/homemade/` paths are gone from the scripts; the rule
about `import 'dotenv/config'` still stands. Three env-loading styles now:

- `packages/db/scripts/*` mostly call `loadEnv({ path: '../../.env.credentials' })`
  (111 of them) — relative, so they work from any checkout or worktree. Nothing to do.
- `apps/web/scripts/*` take `HOMEMADE_ENV_FILE`. Run them as
  `cd apps/web && HOMEMADE_ENV_FILE=../../.env.credentials pnpm exec tsx scripts/<x>.ts`.
  `xs-cull.ts` loads `../../.env.credentials` directly.
- Scripts that do a bare `import 'dotenv/config'` read `.env`, NOT `.env.credentials`,
  so they fail with **"DATABASE_URL is not set"** the moment they touch Prisma. A
  `--dry-run` can pass anyway because dry mode returns early before any DB call — so a
  green dry-run does NOT prove the real run has creds. The one left in the tree is
  `apps/web/scripts/import-stitching-mama-catalogue.ts` (it moved out of
  `packages/db/scripts/`).

Fix for that last kind: run with
`DOTENV_CONFIG_PATH=.env.credentials npx tsx scripts/<x>.ts` from the repo root, or the
absolute path to the creds file (`dotenv/config` honours `DOTENV_CONFIG_PATH`). The same
file carries the R2 + Typesense creds, so this also satisfies media upload + search sync.

The Stitching Mama catalogue importer reads source design folders from the K: drive
(`K:\My Drive\Personal\Stitching Mama\TEAM\Designs\6 READY TO PUBLISH TO WEBSITE`), so it
runs only on Rebecca's machine — a cloud session cannot see that drive. It is idempotent
(upserts on Pattern.slug) and does NOT index to search — run buildPatternDoc+syncPatternDoc
(or `syncPatternById`) after to add them to Typesense. Its 36 rows are in the live database
(35 PUBLIC, 1 not — checked 2026-09-06). The reversible `xs-cull` only flips visibility to
PRIVATE (keeps the designer link), so a missing-from-DB pattern was never imported / was
hard-deleted, not culled. See [[reference_house_designer_canonical]];
[[project_stitching_mama_photos]] and [[project_cross_stitch]] are not in notes/ — the
cross-stitch state is in [[project/project_cross_stitch_state]].
