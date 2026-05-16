-- phase_8_content_integration_001
--
-- Additive only. Structured sourcing + attribution metadata on Media so the
-- image-sourcing orchestrator (Unsplash / Pexels / Wikimedia / Pixabay / Flux
-- Schnell) can record where each hero came from and the public renderer can
-- decide whether to show the discreet attribution tooltip.

ALTER TABLE "Media"
  ADD COLUMN "source" TEXT,
  ADD COLUMN "sourceUrl" TEXT,
  ADD COLUMN "creatorName" TEXT,
  ADD COLUMN "licenceCode" TEXT,
  ADD COLUMN "licenceUrl" TEXT,
  ADD COLUMN "requiresAttribution" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Media_source_idx" ON "Media"("source");
