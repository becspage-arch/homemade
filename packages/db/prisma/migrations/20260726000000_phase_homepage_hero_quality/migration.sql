-- Phase 8 homepage redesign — hero photo quality gate.
-- The homepage hero loader filters EDITORIAL_PICK candidates to
-- `heroQuality = EDITORIAL` so weak photos don't surface in the
-- full-bleed Netflix-style hero. See `docs/homepage-redesign-2026-05-25.md`.

CREATE TYPE "HeroQuality" AS ENUM ('EDITORIAL', 'STANDARD', 'FALLBACK');

ALTER TABLE "Tutorial"
  ADD COLUMN "heroQuality" "HeroQuality" NOT NULL DEFAULT 'STANDARD';

CREATE INDEX "Tutorial_heroQuality_idx" ON "Tutorial"("heroQuality");
