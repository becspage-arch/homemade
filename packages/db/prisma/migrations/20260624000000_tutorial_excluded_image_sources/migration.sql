-- tutorial_excluded_image_sources
--
-- Additive. Adds `excludedImageSources` to Tutorial so the image-verification
-- sweep (`packages/db/scripts/apply-media-verdicts.ts`) can accumulate the
-- set of free-tier hero sources it has already rejected for a given tutorial
-- across multiple runs. Without this, each pass only knows about the most
-- recently-rejected source and the free-tier cascade cycles back to a
-- source it already burned — see the 17/32 byte-identical re-source rate
-- in the 2026-05-16 sweep stall.
--
-- Default `'{}'` covers all existing rows so no backfill is required.

ALTER TABLE "Tutorial"
  ADD COLUMN "excludedImageSources" TEXT[] NOT NULL DEFAULT '{}';
