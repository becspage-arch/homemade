---
name: reference_script_env_dotenv_path
description: "ops/import tsx scripts that use `import 'dotenv/config'` need DOTENV_CONFIG_PATH pointed at .env.credentials"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4d0de1cf-5dc1-4ca9-91f2-6fe91b5a468a
---

Build/ops `tsx` scripts split into two env-loading styles, and it matters:

- Scripts with an inline `loadEnv('C:/Users/Rebecca/Projects/code/homemade/.env.credentials')`
  (e.g. xs-cull.ts, xs-volume-gen.ts) work as-is — they read the creds file directly.
- Scripts that do `import 'dotenv/config'` (e.g. `import-stitching-mama-catalogue.ts`)
  read `.env`, NOT `.env.credentials`, so they fail with **"DATABASE_URL is not set"**
  the moment they touch Prisma. A `--dry-run` can pass anyway because dry mode returns
  early before any DB call — so a green dry-run does NOT prove the real run has creds.

Fix: run them with
`DOTENV_CONFIG_PATH="C:/Users/Rebecca/Projects/code/homemade/.env.credentials" npx tsx scripts/<x>.ts`
(`dotenv/config` honours `DOTENV_CONFIG_PATH`). The same file carries the R2 + Typesense
creds, so this also satisfies media upload + search sync.

The Stitching Mama catalogue importer reads source design folders from the K: drive
(`K:\My Drive\Personal\Stitching Mama\TEAM\Designs\6 READY TO PUBLISH TO WEBSITE`); it's
idempotent (upserts on Pattern.slug), imports 36 patterns PUBLIC + published, and does NOT
index to search — run buildPatternDoc+syncPatternDoc (or `syncPatternById`) after to add
them to Typesense. The reversible `xs-cull` only flips visibility to PRIVATE (keeps the
designer link), so a missing-from-DB pattern was never imported / was hard-deleted, not
culled. See [[project_stitching_mama_photos]], [[project_cross_stitch]].
