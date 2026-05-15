-- Phase 8 Baking pipeline scaffold — schema migration.
--
-- Adds Baking-specific recipe metadata to Tutorial + a new PreFermentType
-- enum. Everything is additive: no column drops, no breaking renames,
-- existing Cooking and Mindset rows untouched. Cooking recipes ignore the
-- new columns (they continue to use `temperatureCelsius` for oven cook
-- temperatures); Baking recipes set the new bake-specific columns and
-- leave the cooking field null.
--
-- All eight Baking sub-categories (bread, cakes, pastries, biscuits, pies,
-- scones, sweets & confectionery, cake decorating) land under one shared
-- set of nullable columns. Per `feedback_schema_all_fields_upfront.md`
-- every plausibly-useful field is added now, not staged for a follow-up
-- migration.
--
-- See `docs/baking-author.md` for the authoring prompt that drives which
-- column is set for which sub-category.

-- New enum for the Baking pre-ferment taxonomy.
CREATE TYPE "PreFermentType" AS ENUM (
  'NONE',
  'POOLISH',
  'BIGA',
  'LEVAIN',
  'SPONGE',
  'OTHER'
);

-- Tutorial gets the Baking metadata columns. All nullable; existing rows
-- (Cooking + Mindset) untouched. The new columns split into five clusters:
-- hydration, proofing, lamination, oven + steam, decorating, pre-ferment.
ALTER TABLE "Tutorial"
  -- Hydration metadata — baker's percentage anchored.
  ADD COLUMN "flourWeightGrams"  INTEGER,
  ADD COLUMN "hydrationPercent"  DOUBLE PRECISION,
  ADD COLUMN "saltPercent"       DOUBLE PRECISION,
  ADD COLUMN "yeastPercent"      DOUBLE PRECISION,
  ADD COLUMN "levainPercent"     DOUBLE PRECISION,

  -- Proofing metadata. Minutes per stage; null when the bake doesn't use it.
  ADD COLUMN "bulkFermentMinutes" INTEGER,
  ADD COLUMN "proofMinutes"       INTEGER,
  ADD COLUMN "retardingMinutes"   INTEGER,
  ADD COLUMN "levainBuildMinutes" INTEGER,

  -- Lamination metadata. Puff / croissant / Danish; null on shortcrust + filo.
  ADD COLUMN "laminationFolds" INTEGER,
  ADD COLUMN "laminationRests" INTEGER,

  -- Oven + steam. Baking-specific oven settings.
  ADD COLUMN "bakeTemperatureCelsius" INTEGER,
  ADD COLUMN "bakeTemperatureNote"    TEXT,
  ADD COLUMN "steamMethod"            TEXT,

  -- Decorating.
  ADD COLUMN "decoratingTechnique" TEXT,

  -- Pre-ferment type. NONE on straight doughs.
  ADD COLUMN "preFermentType" "PreFermentType";

-- Baking-specific indexes on Tutorial. Surface filters in the public
-- browse view by pre-ferment type (`Show me all sourdough breads`) and
-- decorating technique (`Show me all piped cakes`).
CREATE INDEX "Tutorial_type_preFermentType_idx"     ON "Tutorial"("type", "preFermentType");
CREATE INDEX "Tutorial_type_decoratingTechnique_idx" ON "Tutorial"("type", "decoratingTechnique");
