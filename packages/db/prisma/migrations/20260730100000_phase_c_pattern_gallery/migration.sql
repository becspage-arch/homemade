-- Phase C — pattern gallery (2026-07-30).
--
-- Adds a JSON array of Media.id strings to Pattern so the public
-- library detail page can rotate through additional finished-piece
-- photographs alongside the hero. The hero stays in heroMediaId and
-- continues to back the library card; this is purely the supporting
-- detail-page strip. JSON over a join table because gallery membership
-- is an ordered list rather than a many-to-many — order matters and
-- is the rotation order on the detail page.

ALTER TABLE "Pattern" ADD COLUMN "galleryMediaIds" JSONB NOT NULL DEFAULT '[]';
