-- Chart-viewer rebuild (2026-05-20) — adds the per-user mark-stitched /
-- mark-row / mark-step persistence table. Charts now require auth to view
-- at all; this is the persistence layer behind that surface.
--
-- All-fields-upfront per the schema rule:
--   - markedCells (cross-stitch)     — sparse "x,y" string list
--   - markedRows (knitting/crochet/weaving) — 1-indexed row numbers
--   - markedSteps (origami)          — 1-indexed step numbers
--   - viewMode                       — symbol-on-colour | symbol-only | colour-only
--   - displayMode                    — all | stitched | remaining
--   - paletteOverride                — JSON palette swap (DMC ↔ Anchor, recolour)
--   - notes                          — JSON pinned notes
--   - markedCount                    — denormalised count
--   - timeSpentSeconds               — aggregate
--   - lastTouchedAt                  — drives "resume where I left off" rail
--
-- Composite primary key (userId, tutorialId, chartIndex) gives every chart
-- node in every tutorial at most one row per user.

CREATE TABLE "ChartProgress" (
    "userId" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "chartIndex" INTEGER NOT NULL,
    "markedCells" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "markedRows" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "markedSteps" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "viewMode" TEXT NOT NULL DEFAULT 'symbol-on-colour',
    "displayMode" TEXT NOT NULL DEFAULT 'all',
    "paletteOverride" JSONB,
    "notes" JSONB NOT NULL DEFAULT '[]',
    "markedCount" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "lastTouchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChartProgress_pkey" PRIMARY KEY ("userId", "tutorialId", "chartIndex")
);

CREATE INDEX "ChartProgress_userId_lastTouchedAt_idx" ON "ChartProgress" ("userId", "lastTouchedAt");
CREATE INDEX "ChartProgress_tutorialId_idx" ON "ChartProgress" ("tutorialId");

ALTER TABLE "ChartProgress" ADD CONSTRAINT "ChartProgress_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChartProgress" ADD CONSTRAINT "ChartProgress_tutorialId_fkey"
    FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
