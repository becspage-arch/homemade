-- Crochet autopilot foundation (phase_crochet_autopilot_foundation_001).
--
-- Additive migration. Idempotent. No backfills. No breaking changes.
-- Pairs with Worker X1's READY-flip + master author prompts (5 files
-- at docs/crochet-*-author.md) + autopilot routine content-type routing.
--
-- Two new enums:
--   ConstructionDirection — direction-only build axis. Separate from the
--     existing CrochetConstruction enum which conflates direction with
--     seam treatment. New rows under autopilot populate this; legacy
--     rows leave it null and read from CrochetPattern.construction.
--   BodyShape — amigurumi geometric primitive (sphere, cylinder, ...).
--     Distinct from CrochetShape, which is finished-piece category
--     (BLANKET, GARMENT, AMIGURUMI, MOTIF, ...). Null on non-amigurumi.
--
-- CrochetPattern additions:
--   constructionDirection   — see enum above.
--   bodyShape               — see enum above.
--   gradingNotes            — designer's free-text notes for graders.
--
-- The other shape fields the Worker X1 spec lists (sizesGraded, pieces,
-- buildOrder, assemblyInstructions) already exist on CrochetPattern via
-- phase_crochet_pattern_001. This migration does not re-add them.
--
-- Category additions:
--   autopilotContentTypesEnabled — list of content-type slugs the
--     autopilot may author for this category. Crochet seeds with
--     ['TECHNIQUE','STITCH','MOTIF','HOMEWARE']. GARMENT + AMIGURUMI
--     wait for Worker X2's grading library + shape math.
--   techniqueSlugs               — every technique slug referenced
--     anywhere in this category. Per the pipeline-setup memory rule.
--   criticalTechniques           — must-know prerequisites; subset of
--     techniqueSlugs.
--   aliases                      — alternative names + search synonyms.
--
-- ─── Enums ────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "ConstructionDirection" AS ENUM (
    'TOP_DOWN',
    'BOTTOM_UP',
    'SIDE_TO_SIDE',
    'MOTIF_ASSEMBLED',
    'MULTI_PIECE',
    'SINGLE_PIECE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BodyShape" AS ENUM (
    'SPHERE',
    'CYLINDER',
    'CONE',
    'OVAL',
    'CAPSULE',
    'PEAR',
    'COMPOSITE',
    'NONE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── CrochetPattern additions ─────────────────────────────────────────────

ALTER TABLE "CrochetPattern"
  ADD COLUMN IF NOT EXISTS "constructionDirection" "ConstructionDirection",
  ADD COLUMN IF NOT EXISTS "bodyShape"             "BodyShape",
  ADD COLUMN IF NOT EXISTS "gradingNotes"          TEXT;

-- ─── Category additions ───────────────────────────────────────────────────

ALTER TABLE "Category"
  ADD COLUMN IF NOT EXISTS "autopilotContentTypesEnabled" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "techniqueSlugs"               TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "criticalTechniques"           TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "aliases"                      TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
