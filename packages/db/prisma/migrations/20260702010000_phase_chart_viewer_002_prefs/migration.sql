-- Chart-viewer user-level preferences. Null = use the built-in defaults
-- shipped by the renderer. Shape (validated client-side; the column is
-- JSON so the schema can evolve without migrations):
--
--   {
--     "gridColor"?:        "#302a24",
--     "gridWeightScale"?:  1.0,       (multiplier, 0.5–2)
--     "showCentreLines"?:  true
--   }

ALTER TABLE "User" ADD COLUMN "chartViewerPrefs" JSONB;
