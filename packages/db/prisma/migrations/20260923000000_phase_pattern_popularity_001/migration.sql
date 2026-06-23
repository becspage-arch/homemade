-- phase_pattern_popularity_001
--
-- A real, auto-updating popularity signal for the pattern libraries. Each
-- pattern carries denormalised engagement counters plus a derived
-- popularityScore so "most popular" sorts on one indexed column:
--
--   popularityScore = viewCount + 3*saveCount + 5*completionCount
--
-- The counters are maintained by atomic delta updates at each engagement event
-- (apps/web/src/lib/popularity.ts), so the score stays consistent with the
-- counters without a recompute. Pre-launch every counter is 0, so a
-- popularityScore sort falls back to publishedAt (most-recent) — the page always
-- looks intentional and auto-fills as real usage arrives.
--
-- Seeds the two signals that already exist in the data: pattern saves
-- (SavedPattern) and completed projects (UserPatternProgress / CrochetProjectProgress).

-- ── Pattern (cross-stitch / knitting / crochet-chart) ────────────────────────
ALTER TABLE "Pattern" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Pattern" ADD COLUMN "saveCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Pattern" ADD COLUMN "completionCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Pattern" ADD COLUMN "popularityScore" INTEGER NOT NULL DEFAULT 0;

UPDATE "Pattern" p
SET "saveCount" = s.c
FROM (SELECT "patternId", COUNT(*)::int AS c FROM "SavedPattern" GROUP BY "patternId") s
WHERE s."patternId" = p.id;

UPDATE "Pattern" p
SET "completionCount" = c.c
FROM (
  SELECT "patternId", COUNT(*)::int AS c
  FROM "UserPatternProgress"
  WHERE "completedAt" IS NOT NULL
  GROUP BY "patternId"
) c
WHERE c."patternId" = p.id;

UPDATE "Pattern"
SET "popularityScore" = "viewCount" + 3 * "saveCount" + 5 * "completionCount";

CREATE INDEX "Pattern_popularityScore_idx" ON "Pattern"("popularityScore");

-- ── CrochetPattern ───────────────────────────────────────────────────────────
ALTER TABLE "CrochetPattern" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CrochetPattern" ADD COLUMN "saveCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CrochetPattern" ADD COLUMN "completionCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CrochetPattern" ADD COLUMN "popularityScore" INTEGER NOT NULL DEFAULT 0;

UPDATE "CrochetPattern" p
SET "completionCount" = c.c
FROM (
  SELECT "crochetPatternId", COUNT(*)::int AS c
  FROM "CrochetProjectProgress"
  WHERE "completedAt" IS NOT NULL
  GROUP BY "crochetPatternId"
) c
WHERE c."crochetPatternId" = p.id;

UPDATE "CrochetPattern"
SET "popularityScore" = "viewCount" + 3 * "saveCount" + 5 * "completionCount";

CREATE INDEX "CrochetPattern_popularityScore_idx" ON "CrochetPattern"("popularityScore");
