-- Expanded crochet pattern template (phase_crochet_signoff_001).
-- Additive, idempotent columns on CrochetPattern:
--   videoUrl    — optional walkthrough link (designers; Homemade ships without one)
--   notions     — structured supply list (markers, needle, safety eyes, stuffing…)
--   safetyNotes — toy/baby cautions (choking hazard) where relevant
ALTER TABLE "CrochetPattern" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE "CrochetPattern" ADD COLUMN IF NOT EXISTS "notions" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "CrochetPattern" ADD COLUMN IF NOT EXISTS "safetyNotes" TEXT;
