-- Knitting pipeline (phase_knitting_001) — Tutorial schema additions for
-- the knitting category build.
--
-- Adds knitting-specific Tutorial columns sized to cover the full knitting
-- catalogue: garments, accessories, colourwork, lace, cable / Aran,
-- brioche, double-knit. All fields nullable so existing rows (and non-
-- knitting rows) need no backfill.
--
-- Also adds the `crossCategoryWith` column that lets Foundations tutorials
-- cross-list under multiple category landing pages (blocking, ergonomics,
-- yarn substitution maths — concepts that apply across knit + crochet +
-- future fibre-arts pipelines).
--
-- The knitting Category itself + the project-shape sub-cats + the
-- KnittingNeedle master table already exist from earlier scaffolding
-- (seed-categories.ts launchOrder 7, seed-knitting-taxonomy.ts,
-- seed-knitting-needles.ts). This migration is schema-only; the
-- expanded sub-cat list (colourwork, lace, cable-aran, brioche-doubleknit,
-- specialty) is applied via the updated seed-knitting-taxonomy.ts run.
--
-- See the project memo "Homemade — knitting category deep-dive"
-- (2026-06-09) for the full design rationale.

-- ─── Tutorial: knitting-specific method + gauge + grading metadata ───────

ALTER TABLE "Tutorial"
  -- Cast-on method: LONG_TAIL / CABLE / GERMAN_TWISTED / PROVISIONAL /
  -- ITALIAN_TUBULAR / OLD_NORWEGIAN / BACKWARD_LOOP / JUDYS_MAGIC /
  -- KNITTED_ON / CROCHET_PROVISIONAL. Free-form string for forwards
  -- compatibility — adding a new method requires no migration.
  ADD COLUMN "castOnMethod" TEXT,

  -- Bind-off method: STANDARD / STRETCHY / TUBULAR / SEWN /
  -- JENYS_SURPRISINGLY_STRETCHY / THREE_NEEDLE / I_CORD / RUSSIAN_GRAFT /
  -- PICOT / SUSPENDED.
  ADD COLUMN "bindOffMethod" TEXT,

  -- In-the-round working method: MAGIC_LOOP / TWO_CIRCULARS / DPN /
  -- SHORT_CIRCULAR / STRAIGHT_FLAT. Authoring default is MAGIC_LOOP; the
  -- Studio surfaces toggles for the others where the pattern documents
  -- method-specific variants.
  ADD COLUMN "inTheRoundMethod" TEXT,

  -- Per-section secondary needles. Null when the pattern uses one needle
  -- throughout. JSON array of `{ section, needleSlug }` entries.
  -- e.g. [{ section: 'ribbing', needleSlug: 'needle-3-25-mm' },
  --       { section: 'body',    needleSlug: 'needle-4-mm' }]
  ADD COLUMN "secondaryNeedleSizes" JSONB,

  -- Secondary yarn weights for multi-yarn patterns (colourwork, stranded,
  -- fade). Empty array on single-yarn patterns. Slugs reference the
  -- master YarnWeight table.
  ADD COLUMN "secondaryYarnWeightIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  -- Slug of the EasePreset row this pattern grades from. Used by the
  -- knitting grading library (K-8) to pick the right finished-bust offset.
  ADD COLUMN "easePresetSlug" TEXT,

  -- Pattern-stitch gauge when it differs from stockinette gauge. JSON
  -- `{ stitchesPer10cm, rowsPer10cm, stitchName, blocked }`.
  ADD COLUMN "gaugeInPatternStitch" JSONB,

  -- Cross-category Foundations cross-listing. Category slugs this
  -- tutorial also appears under, beyond its primary Category. e.g.
  -- ['crochet'] on a knitting blocking Foundations tutorial that should
  -- also appear on the crochet Foundations page. Empty on the vast
  -- majority of tutorials.
  ADD COLUMN "crossCategoryWith" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- ─── Indexes for the public browse + admin queue filters ─────────────────

CREATE INDEX "Tutorial_type_castOnMethod_idx"
  ON "Tutorial"("type", "castOnMethod");

CREATE INDEX "Tutorial_type_bindOffMethod_idx"
  ON "Tutorial"("type", "bindOffMethod");

CREATE INDEX "Tutorial_type_inTheRoundMethod_idx"
  ON "Tutorial"("type", "inTheRoundMethod");

CREATE INDEX "Tutorial_easePresetSlug_idx"
  ON "Tutorial"("easePresetSlug");

CREATE INDEX "Tutorial_secondaryYarnWeightIds_idx"
  ON "Tutorial" USING GIN ("secondaryYarnWeightIds");

CREATE INDEX "Tutorial_crossCategoryWith_idx"
  ON "Tutorial" USING GIN ("crossCategoryWith");
