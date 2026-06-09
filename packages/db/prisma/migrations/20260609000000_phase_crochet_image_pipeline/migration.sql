-- Phase crochet image pipeline — schema migration.
--
-- Adds the tracking surface for the two-pipeline image worker:
--   Pipeline A (diagram sourcing)  → Tutorial.diagramGenerationStatus
--   Pipeline B (hero rendering)    → CrochetPattern.heroMediaId
--                                     CrochetPattern.heroGenerationStatus
--                                     Pattern.heroGenerationStatus
--   Pipeline C (stitch previews)   → Stitch.previewMediaId
--   Verification gate fallback     → MediaVerificationStatus.SYNTHETIC_FALLBACK
--
-- One generic enum (ImageGenerationStatus) covers both diagram and hero
-- pipelines. Not every state applies to every pipeline (Pipeline A never
-- produces SYNTHETIC_FALLBACK; Pipeline B never produces NO_SOURCE) but
-- the shape is small enough that splitting into two enums adds friction
-- without value.
--
-- ALTER TYPE ADD VALUE is safe in a transaction on Postgres 12+ provided
-- the new value isn't referenced in the same migration. We never
-- reference SYNTHETIC_FALLBACK in this migration — the seed scripts that
-- write it ship separately.
--
-- Per feedback_schema_all_fields_upfront — every plausibly-useful field
-- added now, no backfill migration later.

-- ─────────────────────────────────────────────────────────────────────
-- New generic enum for both pipelines.
-- ─────────────────────────────────────────────────────────────────────

CREATE TYPE "ImageGenerationStatus" AS ENUM (
  'PENDING',
  'RUNNING',
  'SUCCESS',
  'FAILED_VERIFICATION',
  'SYNTHETIC_FALLBACK',
  'NO_SOURCE'
);

-- ─────────────────────────────────────────────────────────────────────
-- Extend MediaVerificationStatus with SYNTHETIC_FALLBACK so the Media
-- row that holds the synthetic chart render (used as the fallback when
-- Fal img2img fails verification) carries an explicit verdict.
-- ─────────────────────────────────────────────────────────────────────

ALTER TYPE "MediaVerificationStatus" ADD VALUE IF NOT EXISTS 'SYNTHETIC_FALLBACK';

-- ─────────────────────────────────────────────────────────────────────
-- Tutorial.diagramGenerationStatus — set by Pipeline A. Defaults to
-- PENDING; the wiring scripts flip to SUCCESS once a diagram is wired
-- or NO_SOURCE when Dillmont (and any fallback source) doesn't cover
-- the topic.
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE "Tutorial"
  ADD COLUMN "diagramGenerationStatus" "ImageGenerationStatus" NOT NULL DEFAULT 'PENDING';

-- ─────────────────────────────────────────────────────────────────────
-- Pattern (cross-stitch) — heroGenerationStatus for the optional
-- cross-stitch retrofit pass at end of the worker run.
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE "Pattern"
  ADD COLUMN "heroGenerationStatus" "ImageGenerationStatus" NOT NULL DEFAULT 'PENDING';

-- ─────────────────────────────────────────────────────────────────────
-- CrochetPattern — heroMediaId + heroGenerationStatus for Pipeline B.
-- thumbnailMediaId stays the synthetic chart truth; heroMediaId is the
-- photoreal Fal output when it passes verification. Null heroMediaId
-- means the renderer falls through to thumbnail (Option B per the
-- pre-implementation pairing).
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE "CrochetPattern"
  ADD COLUMN "heroMediaId" TEXT,
  ADD COLUMN "heroGenerationStatus" "ImageGenerationStatus" NOT NULL DEFAULT 'PENDING';

ALTER TABLE "CrochetPattern"
  ADD CONSTRAINT "CrochetPattern_heroMediaId_fkey"
  FOREIGN KEY ("heroMediaId") REFERENCES "Media"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "CrochetPattern_heroMediaId_idx" ON "CrochetPattern"("heroMediaId");

-- ─────────────────────────────────────────────────────────────────────
-- Stitch.previewMediaId — Pipeline C target. A small (256x256) PNG
-- render of the stitch's chartSymbol, generated in-house by the chart
-- engine. Used by the stitch chooser picker + symbol-key explainer.
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE "Stitch"
  ADD COLUMN "previewMediaId" TEXT;

ALTER TABLE "Stitch"
  ADD CONSTRAINT "Stitch_previewMediaId_fkey"
  FOREIGN KEY ("previewMediaId") REFERENCES "Media"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Stitch_previewMediaId_idx" ON "Stitch"("previewMediaId");
