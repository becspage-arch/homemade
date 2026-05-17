-- Phase Knitting pipeline scaffold — schema migration.
--
-- Knitting harmonises with the Crochet pipeline scaffold
-- (`20260624000000_phase_crochet_pipeline_scaffold`) rather than building
-- a parallel master / chart system. Crochet's scaffold already covers
-- the textile-craft shape: `Stitch` (craft-keyed, knitting extends with
-- `craft = 'knitting'` rows), `YarnWeight` (shared), `chartDefinition`
-- (single JSON column on Tutorial), `gaugeText`, `finishedSizeText`,
-- `terminologyConvention`, `craftStitchSlugs`, `craftTechniqueTags`,
-- and the `STITCH` + `PATTERN` TutorialType values.
--
-- This migration adds the one knitting-specific master table that
-- crochet's scaffold deliberately left out — `KnittingNeedle`, the
-- analogue of `CrochetHook` — and the corresponding `primaryNeedleId`
-- FK on Tutorial. Knitting authoring slots into the existing
-- `craftStitchSlugs` + `chartDefinition` columns; the body conventions
-- live in `docs/knitting-author.md`.
--
-- Per the Crochet scaffold's design comment: "CrochetHook stays
-- crochet-specific; the knitting pipeline will add KnittingNeedle on
-- the same shape." That comment is the contract this migration honours.

-- ────────────────────────────────────────────────────────────────────
-- KnittingNeedle — reference table for knitting needles + DPNs +
-- circular needles. Mirrors `CrochetHook` shape:
--   mmSize          UNIQUE millimetre size (canonical sort key)
--   canonicalName   '4 mm needle (UK 8 / US 6)'
--   ukSize          old UK numbering (14 = 2 mm, 000 = 10 mm)
--   usSize          modern US numbering (0 = 2 mm, 50+ = 25 mm)
--   jpSize          Japanese needle sizes (0..14 with metric conversions)
--   suitableYarnWeightSlugs  YarnWeight master slugs the needle suits
--
-- Patterns reference the needle row through the new `primaryNeedleId`
-- FK on Tutorial (SetNull on delete — deleting a master row never
-- cascades away an authored pattern).
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE "KnittingNeedle" (
    "id"                       TEXT NOT NULL,
    "slug"                     TEXT NOT NULL,
    "mmSize"                   DOUBLE PRECISION NOT NULL,
    "canonicalName"            TEXT NOT NULL,
    "ukSize"                   TEXT,
    "usSize"                   TEXT,
    "jpSize"                   TEXT,
    "suitableYarnWeightSlugs"  TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "notes"                    TEXT,

    "createdAt"                TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"                TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnittingNeedle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "KnittingNeedle_slug_key"   ON "KnittingNeedle"("slug");
CREATE UNIQUE INDEX "KnittingNeedle_mmSize_key" ON "KnittingNeedle"("mmSize");

-- ────────────────────────────────────────────────────────────────────
-- Tutorial — knitting-specific FK. Crochet's `primaryHookId` covers
-- crochet patterns; this column covers knitting patterns. Both are
-- SetNull so deleting a master row never cascades away authored
-- tutorials. Knitting PATTERN tutorials set `primaryNeedleId` and
-- leave `primaryHookId` null; crochet PATTERN tutorials do the
-- inverse.
-- ────────────────────────────────────────────────────────────────────

ALTER TABLE "Tutorial"
  ADD COLUMN "primaryNeedleId" TEXT;

ALTER TABLE "Tutorial"
  ADD CONSTRAINT "Tutorial_primaryNeedleId_fkey" FOREIGN KEY ("primaryNeedleId")
    REFERENCES "KnittingNeedle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Tutorial_primaryNeedleId_idx" ON "Tutorial"("primaryNeedleId");
