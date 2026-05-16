-- phase_categories_targets_001
--
-- Multi-category fill plan additions on Category.
-- Additive only. Existing Categories keep default visibility (true) so the
-- nav doesn't go dark between this migration and the seed run that sets
-- per-row values. The seed script (seed-categories.ts) writes the new
-- categories with isPublicVisible = false until they cross 10 published.

ALTER TABLE "Category"
  ADD COLUMN "targetTutorialCount" INTEGER,
  ADD COLUMN "isPublicVisible" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "launchOrder" INTEGER;

CREATE INDEX "Category_isPublicVisible_launchOrder_idx"
  ON "Category" ("isPublicVisible", "launchOrder");
