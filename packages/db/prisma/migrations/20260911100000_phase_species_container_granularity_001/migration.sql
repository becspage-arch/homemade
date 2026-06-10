-- Phase species container + indoor granularity (phase_species_container_granularity_001).
--
-- Replaces the coarse `Tutorial.containerFriendly` + `Tutorial.indoorFriendly`
-- booleans with two precise integer columns on `Species` (renamed from
-- `PlantVariety` by `phase_species_kingdom_001`, which runs immediately
-- before this migration). The public surfaces can now tell a 25 L
-- cherry tomato from a 40 L beefsteak, and a 4-hour-of-sun basil from
-- a low-light sansevieria. The booleans on Tutorial stay during
-- transition so existing search filters and admin chrome keep working
-- until every Species row is populated.
--
-- Idempotent: re-runs use IF NOT EXISTS so a partial-apply doesn't
-- block the migration runner. The `Species` table is the canonical
-- target name; the previous `PlantVariety` name was renamed by the
-- preceding kingdom migration.
--
-- See `apps/web/src/lib/garden-region-derivation.ts` for the renderer
-- that consumes these fields and composes the container badge from
-- whichever source (int field if populated, boolean otherwise).

ALTER TABLE "Species"
  ADD COLUMN IF NOT EXISTS "minimumContainerLitres"   INTEGER,
  ADD COLUMN IF NOT EXISTS "minimumDailyDirectSunHours" INTEGER;

-- No index — neither column is a high-cardinality filter facet. The
-- container-friendly browse keeps using the boolean on `Tutorial`.
