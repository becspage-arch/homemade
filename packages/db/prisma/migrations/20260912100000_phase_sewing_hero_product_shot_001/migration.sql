-- Sewing S-8b: secondary product-shot hero for bag / home / accessory patterns.
-- phase_sewing_hero_product_shot_001 (2026-06-12).
--
-- Adds five columns to SewingPattern carrying the autonomous worker's
-- per-pattern state for the AI-generated product shot, plus a foreign-key
-- index. Also introduces a new MediaKind enum and an optional kind column
-- on Media so generators can tag their output without overloading the
-- existing type / source pair.
--
-- Strictly additive. Every new column is nullable or carries a default,
-- so existing rows are unaffected. No backfill. Idempotent so a
-- partial-apply rerun does not block the migration runner.
-- Category.sewing stays NOT_READY and isPublicVisible stays false per the
-- no-phased-rollout lock; this migration does not flip either flag.

DO $$ BEGIN
  CREATE TYPE "MediaKind" AS ENUM ('HERO_PRODUCT_SHOT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "Media"
  ADD COLUMN IF NOT EXISTS "kind" "MediaKind";

ALTER TABLE "SewingPattern"
  ADD COLUMN IF NOT EXISTS "heroProductShotMediaId"       TEXT,
  ADD COLUMN IF NOT EXISTS "heroProductShotPrompt"        TEXT,
  ADD COLUMN IF NOT EXISTS "heroProductShotAttempts"      INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "heroProductShotFallback"      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "heroProductShotScriptVersion" INTEGER NOT NULL DEFAULT 1;

DO $$ BEGIN
  ALTER TABLE "SewingPattern"
    ADD CONSTRAINT "SewingPattern_heroProductShotMediaId_fkey"
    FOREIGN KEY ("heroProductShotMediaId") REFERENCES "Media"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "SewingPattern_heroProductShotMediaId_idx"
  ON "SewingPattern" ("heroProductShotMediaId");
