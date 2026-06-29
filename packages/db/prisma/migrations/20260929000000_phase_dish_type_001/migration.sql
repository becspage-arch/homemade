-- phase_dish_type_001
--
-- Discoverability for the food categories. Adds one column:
--   Tutorial.familiarCanon — flags everyday UK/US household staples so the
--   region-aware category featuring can lead with the familiar comfort canon
--   instead of the recency-ordered default (which only ever surfaced the
--   newest, exotic fills). Default false; backfilled by the dish-type
--   classification pass.
--
-- The dish-type SHELVES reuse the existing SubCategory model (slugs drawn from
-- prisma/dish-type-vocabulary.ts, seeded idempotently on deploy) — no new
-- table. Cross-cutting collections reuse Tutorial.mood[]; world cuisine reuses
-- Tutorial.cuisine. Additive and safe: existing rows get false.

-- AlterTable
ALTER TABLE "Tutorial" ADD COLUMN "familiarCanon" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Tutorial_categoryId_status_familiarCanon_idx" ON "Tutorial"("categoryId", "status", "familiarCanon");
