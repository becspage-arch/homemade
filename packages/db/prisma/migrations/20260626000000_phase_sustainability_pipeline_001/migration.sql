-- Phase Sustainability pipeline scaffold — schema migration.
--
-- Adds two Tutorial columns that surface across the whole sustainability
-- category and (likely) Home & repair when its pipeline lands:
--
--   approximateCostGbp Int? — typical setup cost in whole £, GBP. Pounds,
--                              not pennies — sustainability content is
--                              order-of-magnitude budgeting (a draught-
--                              proofing kit at £40, a heat pump at £8,000),
--                              not till-receipt accounting.
--   paybackYears        Int? — years for the saving to recoup the cost.
--                              0 = pays back inside a year. NULL = no
--                              financial payback (composting saves council
--                              waste fees indirectly but isn't a payback
--                              question), or unknown.
--
-- Both fields are nullable + additive — every existing row (Cooking,
-- Baking, Mindset, Garden, Herbal, Crochet, Knitting, Needlework, Sewing,
-- Wood, Paper, Pottery) lands NULL on both columns and the renderer
-- treats NULL as "not applicable" → no badge, no surface.
--
-- Why these land now (per `feedback_schema_all_fields_upfront.md`):
-- the sustainability author prompt asks every solar / insulation / heat-
-- pump / water-tank tutorial to declare cost + payback up-front. Wiring
-- the columns now avoids a backfill across hundreds of rows later.
--
-- Indexes:
--   (type, approximateCostGbp) — "show me low-cost sustainability
--                                 upgrades" filter, ordered by cost asc.
--   (type, paybackYears)        — "show me upgrades that pay back inside
--                                 N years" filter, ordered by payback asc.
--
-- TutorialType deliberately not extended. Sustainability tutorials map
-- to existing PATTERN (build-a-thing projects with optional
-- ProjectSchedule arcs — composting bins, rainwater tanks, solar
-- diverters) or TECHNIQUE (decision / how-to reference — calculating
-- loft insulation depth, choosing a heat-pump model, sizing a battery).
-- A future SUSTAINABILITY_PROJECT / SUSTAINABILITY_GUIDE pair may earn
-- its keep once we see 50+ tutorials' worth of content shape — flagged
-- as an open question in `docs/sustainability-test-tutorial-notes.md`.

ALTER TABLE "Tutorial"
  ADD COLUMN "approximateCostGbp" INTEGER,
  ADD COLUMN "paybackYears"       INTEGER;

CREATE INDEX "Tutorial_type_approximateCostGbp_idx"
  ON "Tutorial"("type", "approximateCostGbp");
CREATE INDEX "Tutorial_type_paybackYears_idx"
  ON "Tutorial"("type", "paybackYears");
