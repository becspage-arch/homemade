-- KnittingPattern parity with CrochetPattern.
--
-- Knitting is shipping with the grader as the product, so its pattern row needs
-- the same columns crochet already carries: the loom stitch program and its
-- exact-pattern render tracking, the bulk-autopilot provenance and duplicate-
-- guard signals, the master yarn-weight FK, and the popularity counters.
-- Column types, indexes and comments are copied from
-- `20261004000000_phase_crochet_pattern_engine_001`,
-- `20261012000000_crochet_bulk_autopilot_provenance` and
-- `20260923000000_phase_pattern_popularity_001` so the two models match
-- field for field.
--
-- Additive and nullable (or defaulted) throughout, and IF NOT EXISTS
-- everywhere, so a re-run or a hand-applied hotfix is a no-op and every
-- existing KnittingPattern row reads exactly as it did.

-- ── Loom pattern engine ─────────────────────────────────────────────────────
-- loomProgram is the machine-executable stitch program the loom compiles three
-- ways (geometry / written rows / chart). loomHero is the deterministic
-- fidelity-gated render, distinct from the Fal img2img hero.
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "loomProgram" JSONB;
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "loomHeroMediaId" TEXT;
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "loomRenderStatus" "ImageGenerationStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "loomRenderedAt" TIMESTAMP(3);
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "loomYarnRadiusMm" DOUBLE PRECISION;
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "loomFidelityScore" DOUBLE PRECISION;
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "loomGeometryHash" TEXT;

-- ── Bulk autopilot provenance + the duplicate guard's two signals ───────────
--   generationMeta      how an autopilot row came to exist (run, brief, gate
--                       verdict, program fingerprint, attempts).
--   subjectKey          the normalised subject phrase: "the same idea, redrawn".
--   programFingerprint  a hash of the stitch program with colours stripped:
--                       "the same construction in another colourway".
--   bulkRunId           the run that published it (a raw id, not a relation, so
--                       a BulkRun row can be pruned without touching the
--                       catalogue).
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "generationMeta" JSONB;
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "subjectKey" TEXT;
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "programFingerprint" TEXT;
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "bulkRunId" TEXT;

-- ── Master yarn-weight FK ───────────────────────────────────────────────────
-- yarnWeightStandard stays the cheap enum for library filters; this is the
-- canonical brand-level record (mirrors CrochetPattern.primaryYarnWeightId).
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "primaryYarnWeightId" TEXT;

-- ── Popularity signal ───────────────────────────────────────────────────────
-- popularityScore = viewCount + 3*saveCount + 5*completionCount, maintained by
-- atomic delta updates at each engagement event.
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "saveCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "completionCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "KnittingPattern" ADD COLUMN IF NOT EXISTS "popularityScore" INTEGER NOT NULL DEFAULT 0;

-- Seed the one signal that already exists in the data: completed projects.
UPDATE "KnittingPattern" p
SET "completionCount" = c.c
FROM (
  SELECT "knittingPatternId", COUNT(*)::int AS c
  FROM "KnittingProjectProgress"
  WHERE "completedAt" IS NOT NULL
  GROUP BY "knittingPatternId"
) c
WHERE c."knittingPatternId" = p.id;

UPDATE "KnittingPattern"
SET "popularityScore" = "viewCount" + 3 * "saveCount" + 5 * "completionCount";

-- ── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "KnittingPattern_loomHeroMediaId_idx" ON "KnittingPattern"("loomHeroMediaId");
CREATE INDEX IF NOT EXISTS "KnittingPattern_primaryYarnWeightId_idx" ON "KnittingPattern"("primaryYarnWeightId");
CREATE INDEX IF NOT EXISTS "KnittingPattern_popularityScore_idx" ON "KnittingPattern"("popularityScore");
CREATE INDEX IF NOT EXISTS "KnittingPattern_subjectKey_idx" ON "KnittingPattern"("subjectKey");
CREATE INDEX IF NOT EXISTS "KnittingPattern_programFingerprint_idx" ON "KnittingPattern"("programFingerprint");
CREATE INDEX IF NOT EXISTS "KnittingPattern_bulkRunId_idx" ON "KnittingPattern"("bulkRunId");

-- ── Foreign keys ────────────────────────────────────────────────────────────
-- loomHeroMediaId -> Media(id), SET NULL on media delete (mirrors heroMediaId).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'KnittingPattern_loomHeroMediaId_fkey'
  ) THEN
    ALTER TABLE "KnittingPattern"
      ADD CONSTRAINT "KnittingPattern_loomHeroMediaId_fkey"
      FOREIGN KEY ("loomHeroMediaId") REFERENCES "Media"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- primaryYarnWeightId -> YarnWeight(id), SET NULL (mirrors CrochetPattern).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'KnittingPattern_primaryYarnWeightId_fkey'
  ) THEN
    ALTER TABLE "KnittingPattern"
      ADD CONSTRAINT "KnittingPattern_primaryYarnWeightId_fkey"
      FOREIGN KEY ("primaryYarnWeightId") REFERENCES "YarnWeight"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
