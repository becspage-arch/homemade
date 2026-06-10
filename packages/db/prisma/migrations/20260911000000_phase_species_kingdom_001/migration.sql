-- Phase Species + Kingdom (garden cleanup A).
--
-- Renames the master `PlantVariety` table to `Species` and adds a
-- `kingdom` discriminator (PLANTAE / FUNGI). The motivation is
-- correctness at the kingdom level: mushroom species rows live in the
-- same master table as plants today and a kingdom-level filter,
-- search index, or "related content" rail conflates them. The new
-- column carries the truth; downstream surfaces that need to scope
-- (e.g. "show me plant guides only") can `WHERE kingdom = 'PLANTAE'`.
--
-- All-additive on data — every existing row defaults to PLANTAE, and
-- a final UPDATE shifts known mushroom species slugs to FUNGI. The
-- physical rename is idempotent on a re-run only via the IF EXISTS
-- guards below; this migration is intended to run once.
--
-- Per `feedback_schema_all_fields_upfront.md` the kingdom column is
-- non-nullable and defaults PLANTAE so the existing application code
-- keeps reading without a backfill pass.
--
-- See `BUILD_PROGRESS.md` "Garden cleanup A" entry for the matching
-- application-side updates (Prisma model rename, validator changes,
-- author prompt updates, foraging move to sustainability).

-- ────────────────────────────────────────────────────────────────────
-- Kingdom enum. PLANTAE covers garden vegetables, fruit, herbs,
-- flowers, shrubs, trees. FUNGI covers cultivated and (future) wild
-- mushrooms. ANIMALIA is deliberately not seeded; if honey / fish /
-- game ever need a master table they will likely live in their own
-- entity rather than under `Species`.
-- ────────────────────────────────────────────────────────────────────

CREATE TYPE "Kingdom" AS ENUM (
  'PLANTAE',
  'FUNGI'
);

-- ────────────────────────────────────────────────────────────────────
-- Rename the table + every related constraint and index so the
-- physical names match the new model name. Postgres preserves the
-- foreign-key relationships across `ALTER TABLE RENAME` (the FK
-- targets by OID, not by name), so the CompanionPlanting + self-FK
-- on `parentSpeciesId` keep working without an explicit drop /
-- re-add.
-- ────────────────────────────────────────────────────────────────────

ALTER TABLE "PlantVariety" RENAME TO "Species";

ALTER INDEX "PlantVariety_pkey"               RENAME TO "Species_pkey";
ALTER INDEX "PlantVariety_slug_key"           RENAME TO "Species_slug_key";
ALTER INDEX "PlantVariety_category_idx"       RENAME TO "Species_category_idx";
ALTER INDEX "PlantVariety_isStaple_idx"       RENAME TO "Species_isStaple_idx";
ALTER INDEX "PlantVariety_isPerennial_idx"    RENAME TO "Species_isPerennial_idx";
ALTER INDEX "PlantVariety_parentSpeciesId_idx" RENAME TO "Species_parentSpeciesId_idx";

ALTER TABLE "Species"
  RENAME CONSTRAINT "PlantVariety_parentSpeciesId_fkey" TO "Species_parentSpeciesId_fkey";

ALTER TABLE "CompanionPlanting"
  RENAME CONSTRAINT "CompanionPlanting_plantId_fkey" TO "CompanionPlanting_plantId_fkey";
-- (Constraint names on CompanionPlanting are kept stable on purpose;
-- the rename above is a no-op idempotency check.)

-- ────────────────────────────────────────────────────────────────────
-- Add the kingdom column. PLANTAE default is correct for every row
-- the master table holds today (52 plant entries in the seed file as
-- of 2026-06-10; zero fungi). The default is preserved on the column
-- so future inserts that omit `kingdom` continue to land as PLANTAE.
-- ────────────────────────────────────────────────────────────────────

ALTER TABLE "Species"
  ADD COLUMN "kingdom" "Kingdom" NOT NULL DEFAULT 'PLANTAE';

CREATE INDEX "Species_kingdom_idx" ON "Species"("kingdom");

-- ────────────────────────────────────────────────────────────────────
-- Data step. Identify mushroom species rows by slug and shift them
-- to FUNGI. The slug list is defensive — at the time of writing
-- (2026-06-10) `packages/db/scripts/data/plants.ts` carries zero
-- mushroom rows, so this UPDATE matches zero rows. The list is kept
-- as a forward-compatibility hook: re-running this migration after a
-- future seed pass that adds these slugs would correctly classify
-- them. The seed script (`seed-plants.ts`) is the long-term home for
-- the kingdom field once mushroom rows are added there.
-- ────────────────────────────────────────────────────────────────────

UPDATE "Species"
SET "kingdom" = 'FUNGI'
WHERE "slug" IN (
  'oyster-mushroom',
  'shiitake',
  'lions-mane',
  'wine-cap',
  'chestnut-mushroom',
  'reishi'
);
