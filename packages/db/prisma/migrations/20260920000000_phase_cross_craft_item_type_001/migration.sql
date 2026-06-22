-- phase_cross_craft_item_type_001
--
-- AUDIENCE is the fifth collection-tag axis ("who it's for": baby, kids, men,
-- women, unisex, pets), added to the existing controlled tagging system. This
-- is the only schema change the phase needs:
--   - The cross-craft ITEM-TYPE vocabulary rides on the existing SubCategory
--     model (its slug is each pattern's home-shelf slug) — no new table.
--   - The `audienceSlugs` search facet is a Typesense field, not a DB column.
--
-- Additive enum value; existing CollectionTag rows are unaffected. The six
-- AUDIENCE terms are seeded from prisma/collection-vocabulary.ts on deploy.

-- AlterEnum
ALTER TYPE "CollectionAxis" ADD VALUE 'AUDIENCE';
