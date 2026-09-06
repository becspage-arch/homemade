-- Stitchability (phase_xs_print_quality_001).
--
-- Four additive columns on Pattern holding the deterministic measures of how
-- a chart feels to work — as opposed to how big it is. All nullable so
-- existing rows are untouched until `apps/web/scripts/xs-stitchability-backfill.ts`
-- fills them; ADD COLUMN IF NOT EXISTS so a re-run is a no-op.
--
--   confettiShare        0-1 share of stitched cells that are isolated single
--                        stitches (no same-colour neighbour in any of the 8).
--   colourChangesPer100  colour changes met per 100 stitches along rows.
--   medianRunLength      median unbroken horizontal run of one colour.
--   stitchability        1-5 band cut from the three above; 5 easiest.

ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "confettiShare" DOUBLE PRECISION;
ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "colourChangesPer100" DOUBLE PRECISION;
ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "medianRunLength" DOUBLE PRECISION;
ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "stitchability" INTEGER;

CREATE INDEX IF NOT EXISTS "Pattern_stitchability_idx" ON "Pattern"("stitchability");
