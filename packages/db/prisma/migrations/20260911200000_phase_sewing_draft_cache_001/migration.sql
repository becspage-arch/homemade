-- Sewing S-5a: freesewing wrapper draft cache.
-- phase_sewing_draft_cache_001 (2026-06-10).
--
-- Adds SewingPatternDraftCache: a content-addressable cache of rendered
-- freesewing SVGs keyed by SHA-256 of (designSlug, measurements, options,
-- calibrationMode, freesewingVersion). The wrapper at
-- apps/web/src/lib/sewing/grading/ writes to this table; the
-- /api/studio/sewing/draft route reads from it first and only invokes
-- freesewing on miss.
--
-- Strictly additive. No existing tables are touched. Idempotent so a
-- partial-apply rerun does not block the migration runner.
-- Category.sewing stays NOT_READY and isPublicVisible stays false per the
-- no-phased-rollout lock; this migration does not flip either flag.

CREATE TABLE IF NOT EXISTS "SewingPatternDraftCache" (
  "id"                TEXT NOT NULL,
  "cacheKey"          TEXT NOT NULL,
  "designSlug"        TEXT NOT NULL,
  "measurementsHash"  TEXT NOT NULL,
  "optionsHash"       TEXT NOT NULL,
  "calibrationMode"   TEXT NOT NULL,
  "svgOutput"         TEXT NOT NULL,
  "freesewingVersion" TEXT NOT NULL,
  "generatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastAccessedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "accessCount"       INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "SewingPatternDraftCache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SewingPatternDraftCache_cacheKey_key"
  ON "SewingPatternDraftCache"("cacheKey");

CREATE INDEX IF NOT EXISTS "SewingPatternDraftCache_cacheKey_idx"
  ON "SewingPatternDraftCache"("cacheKey");

CREATE INDEX IF NOT EXISTS "SewingPatternDraftCache_designSlug_idx"
  ON "SewingPatternDraftCache"("designSlug");

CREATE INDEX IF NOT EXISTS "SewingPatternDraftCache_lastAccessedAt_idx"
  ON "SewingPatternDraftCache"("lastAccessedAt");
