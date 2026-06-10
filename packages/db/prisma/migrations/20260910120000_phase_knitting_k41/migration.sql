-- Knitting K-4.1 — author-prompt schema additions.
--
-- Eight new columns on KnittingPattern surfaced by the K-4 reference-pattern
-- audit (see analysis worker priceless-tharp-8808ff, 2026-06-10). All are
-- nullable / default-empty so this migration is a no-op for existing rows;
-- the K-4.1 author prompts populate them on new draft patterns.
--
-- Field summary:
--   needleBySection         JSONB    per-section needle assignment
--   stitchCountCheckpoints  JSONB    structural "you should have N stitches" entries
--   lifelinePoints          INT[]    rows at which Studio prompts a lifeline
--   errataVersion           TEXT     semver, defaults to '1.0.0' on backfill
--   errataLog               JSONB    [{version, date, change}]
--   finishedWeightGrams     INT      blankets + large shawls
--   dominantColour          TEXT     'MC' | 'CC1' | 'CC2' for colourwork
--   recommendedSwatchSizeCm INT      default 15; cables 20
--
-- `secondaryNeedleSizes` is intentionally kept for K-3 back-compat.

ALTER TABLE "KnittingPattern"
  ADD COLUMN "needleBySection"          JSONB,
  ADD COLUMN "stitchCountCheckpoints"   JSONB,
  ADD COLUMN "lifelinePoints"           INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  ADD COLUMN "errataVersion"            TEXT,
  ADD COLUMN "errataLog"                JSONB,
  ADD COLUMN "finishedWeightGrams"      INTEGER,
  ADD COLUMN "dominantColour"           TEXT,
  ADD COLUMN "recommendedSwatchSizeCm"  INTEGER;

-- Idempotent backfill: any row that already exists at migration time
-- (expected count: 0 — autopilot has not yet authored a knitting pattern)
-- gets the seed errata version. New inserts can override via the prompt.
UPDATE "KnittingPattern"
SET    "errataVersion" = '1.0.0'
WHERE  "errataVersion" IS NULL;
