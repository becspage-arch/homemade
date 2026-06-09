-- Crochet X2: grading library + amigurumi shape math + per-content-type
-- autopilot expansion.
--
-- X1 (phase_crochet_autopilot_foundation_001) seeded crochet with
-- ['TECHNIQUE', 'STITCH', 'MOTIF', 'HOMEWARE']. X2 adds GARMENT +
-- AMIGURUMI now that the grading library at
-- apps/web/src/lib/crochet/grading/ and the amigurumi shape math
-- library at apps/web/src/lib/crochet/amigurumi/ are in place.

UPDATE "Category"
SET "autopilotContentTypesEnabled" = ARRAY['TECHNIQUE', 'STITCH', 'MOTIF', 'HOMEWARE', 'GARMENT', 'AMIGURUMI']
WHERE "slug" = 'crochet';
