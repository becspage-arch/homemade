-- phase_needlework_pipeline_setup_001
--
-- Additive migration that unblocks the needlework category for autopilot
-- and adds the pipeline-setup standard fields at the Category level.
--
-- 1. SubCategory.autopilotEnabled (Boolean, default false)
--    Lets a Category selectively enable a subset of its SubCategories for
--    autopilot authoring. Needlework uses this to enable the 7
--    fully-guided disciplines (foundations, surface-embroidery, blackwork,
--    sashiko, candlewicking, hardanger, needlepoint) while leaving the 3
--    specialist disciplines (goldwork, ribbon-embroidery, stumpwork)
--    untouched until dedicated specialist-curation workers ship them.
--
-- 2. Category.techniqueSlugs (String[], default [])
--    Every technique referenced across the category's master author
--    prompts, consolidated. Used by the autopilot routine to map briefs
--    to the technique vocabulary and by the future cross-category sweep.
--
-- 3. Category.criticalTechniques (String[], default [])
--    The must-know prerequisites for the category. Subset of
--    techniqueSlugs.
--
-- 4. Category.aliases (String[], default [])
--    Search synonyms used by the reverse-sweep when looking for technique
--    references in already-published tutorials in this category.
--
-- Columns 2 through 4 may already exist from the parallel
-- phase_crochet_autopilot_foundation_001 migration that lands in the
-- same window (same timestamp prefix; lexical order puts crochet first).
-- The IF NOT EXISTS guards make both migrations safely idempotent in
-- either order. All-fields-upfront per the schema rule (no follow-up
-- backfill migration).

ALTER TABLE "SubCategory"
  ADD COLUMN IF NOT EXISTS "autopilotEnabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Category"
  ADD COLUMN IF NOT EXISTS "techniqueSlugs" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "criticalTechniques" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "aliases" TEXT[] NOT NULL DEFAULT '{}';
