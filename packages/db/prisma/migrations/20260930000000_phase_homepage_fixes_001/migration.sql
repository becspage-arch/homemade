-- phase_homepage_fixes_001
--
-- Deliberate homepage browse-tile image override. Adds one nullable column:
--   Category.tileImageMediaId — when set, the "Browse all categories" grid
--   uses this Media instead of deriving a tile from the category's content.
--   Lets a category show a hand-picked, on-brand image (e.g. a real
--   cross-stitch chart render instead of a stock technique photo a tutorial
--   happened to carry).
--
-- Additive + safe: existing rows get NULL and keep the derived-tile behaviour
-- (pattern crafts fall back to their most-popular published pattern; everything
-- else to the most-loved published tutorial photo).

-- AlterTable
ALTER TABLE "Category" ADD COLUMN "tileImageMediaId" TEXT;

-- CreateIndex
CREATE INDEX "Category_tileImageMediaId_idx" ON "Category"("tileImageMediaId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_tileImageMediaId_fkey"
    FOREIGN KEY ("tileImageMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
