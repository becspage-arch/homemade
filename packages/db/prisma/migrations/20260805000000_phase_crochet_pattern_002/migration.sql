-- Crochet Studio supporting features (phase_crochet_pattern_002).
--
-- Adds CrochetProjectProgress.projectSetup, a JSON column that holds
-- the maker's per-project yarn + hook + swatch capture from the
-- Studio's project setup card. Optional — existing progress rows stay
-- null until the user opens an active project and fills the card.

ALTER TABLE "CrochetProjectProgress"
  ADD COLUMN "projectSetup" JSONB;
