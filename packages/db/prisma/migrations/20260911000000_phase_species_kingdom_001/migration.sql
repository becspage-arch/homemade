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
-- Idempotent: every step is guarded so a re-run after a partial
-- previous apply (or after marking the previous attempt rolled-back
-- with `prisma migrate resolve --rolled-back ...`) lands cleanly.
-- The first attempt of this migration ran most of the rename + enum
-- before hitting a redundant constraint rename, so all guards below
-- are real-world necessary, not hypothetical defensiveness.
--
-- Per `feedback_schema_all_fields_upfront.md` the kingdom column is
-- non-nullable and defaults PLANTAE so the existing application code
-- keeps reading without a backfill pass.

-- ────────────────────────────────────────────────────────────────────
-- Kingdom enum. PLANTAE covers garden vegetables, fruit, herbs,
-- flowers, shrubs, trees. FUNGI covers cultivated and (future) wild
-- mushrooms. ANIMALIA is deliberately not seeded.
-- ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Kingdom') THEN
    CREATE TYPE "Kingdom" AS ENUM ('PLANTAE', 'FUNGI');
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- Rename the table + every related index / FK constraint when the
-- source name still exists. Postgres preserves foreign-key targeting
-- across `ALTER TABLE RENAME` (FK targets by OID), so the
-- CompanionPlanting + self-FK keep working without an explicit drop
-- / re-add.
-- ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='PlantVariety') THEN
    ALTER TABLE "PlantVariety" RENAME TO "Species";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='PlantVariety_pkey') THEN
    ALTER INDEX "PlantVariety_pkey" RENAME TO "Species_pkey";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='PlantVariety_slug_key') THEN
    ALTER INDEX "PlantVariety_slug_key" RENAME TO "Species_slug_key";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='PlantVariety_category_idx') THEN
    ALTER INDEX "PlantVariety_category_idx" RENAME TO "Species_category_idx";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='PlantVariety_isStaple_idx') THEN
    ALTER INDEX "PlantVariety_isStaple_idx" RENAME TO "Species_isStaple_idx";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='PlantVariety_isPerennial_idx') THEN
    ALTER INDEX "PlantVariety_isPerennial_idx" RENAME TO "Species_isPerennial_idx";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='PlantVariety_parentSpeciesId_idx') THEN
    ALTER INDEX "PlantVariety_parentSpeciesId_idx" RENAME TO "Species_parentSpeciesId_idx";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'PlantVariety_parentSpeciesId_fkey'
  ) THEN
    ALTER TABLE "Species"
      RENAME CONSTRAINT "PlantVariety_parentSpeciesId_fkey" TO "Species_parentSpeciesId_fkey";
  END IF;
END $$;

-- CompanionPlanting FK constraints reference the table by OID; the
-- rename above already kept them targeting Species. Constraint names
-- on CompanionPlanting stay as `CompanionPlanting_plantId_fkey` /
-- `CompanionPlanting_companionId_fkey` — no rename needed.

-- ────────────────────────────────────────────────────────────────────
-- Add the kingdom column. PLANTAE default is correct for every row
-- the master table holds today.
-- ────────────────────────────────────────────────────────────────────

ALTER TABLE "Species"
  ADD COLUMN IF NOT EXISTS "kingdom" "Kingdom" NOT NULL DEFAULT 'PLANTAE';

CREATE INDEX IF NOT EXISTS "Species_kingdom_idx" ON "Species"("kingdom");

-- ────────────────────────────────────────────────────────────────────
-- Data step. Identify mushroom species rows by slug and shift them
-- to FUNGI. The slug list is defensive — at the time of writing
-- (2026-06-10) `packages/db/scripts/data/plants.ts` carries zero
-- mushroom rows, so this UPDATE matches zero rows. Forward-compatible
-- for the first mushroom-growing autopilot batch.
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
