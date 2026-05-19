-- Phase 8 Mindset completeness audit — capture pre-rewrite body snapshots.
--
-- Adds a nullable JSONB column `revisedFrom` to Tutorial. The
-- mindset-completeness rewriter writes the pre-rewrite body here before
-- replacing `body` with the re-authored content. Future audit cycles can
-- reuse the same column.
ALTER TABLE "Tutorial" ADD COLUMN "revisedFrom" JSONB;
