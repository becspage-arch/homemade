-- Phase location_climate_paper_001 — region + climate + paper-size
-- schema scaffold.
--
-- Adds:
--   - Tutorial climate fields (hemisphere, climateZones[], usdaHardinessZones[],
--     rhsHardinessZones[], growingMonthsByHemisphere JSONB, frostSensitivity,
--     dayLengthSensitive, primaryRegionWrittenFor, alsoGrowsIn,
--     paperSizeCompatible[])
--   - User location + paper fields (hemisphere, koppenZone, usdaHardinessZone,
--     rhsHardinessZone, lastFrostDate, firstFrostDate, paperSize)
--   - CountryClimate reference table (country-default zones + paper size
--     when a user hasn't picked specific values)
--
-- Every column is additive and nullable / defaulted. Existing rows
-- untouched; non-gardening categories see no change because the renderer
-- emits no "Where this works best" card and no silent month rewrite when
-- the fields are empty.
--
-- Per `feedback_schema_all_fields_upfront.md`: every plausibly-useful field
-- is added now. The gardening renderer reads them all; needlework /
-- sewing / knitting / crochet pipelines reuse `paperSizeCompatible` when
-- those pipelines wire region-sensitive surfaces.
--
-- The existing `User.country` + `User.homeCountryCode` columns stay the
-- canonical country code; new code should prefer `homeCountryCode`
-- (captured at signup from cf-ipcountry).

-- ────────────────────────────────────────────────────────────────────
-- Tutorial — climate + region + paper fields.
-- ────────────────────────────────────────────────────────────────────

ALTER TABLE "Tutorial"
  ADD COLUMN "hemisphere"                TEXT,
  ADD COLUMN "climateZones"              TEXT[]    DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "usdaHardinessZones"        INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  ADD COLUMN "rhsHardinessZones"         TEXT[]    DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "growingMonthsByHemisphere" JSONB,
  ADD COLUMN "frostSensitivity"          TEXT,
  ADD COLUMN "dayLengthSensitive"        BOOLEAN   NOT NULL DEFAULT false,
  ADD COLUMN "primaryRegionWrittenFor"   TEXT,
  ADD COLUMN "alsoGrowsIn"               TEXT,
  ADD COLUMN "paperSizeCompatible"       TEXT[]    DEFAULT ARRAY[]::TEXT[];

CREATE INDEX "Tutorial_hemisphere_idx"          ON "Tutorial"("hemisphere");
CREATE INDEX "Tutorial_frostSensitivity_idx"    ON "Tutorial"("frostSensitivity");
CREATE INDEX "Tutorial_dayLengthSensitive_idx"  ON "Tutorial"("dayLengthSensitive");
CREATE INDEX "Tutorial_climateZones_idx"        ON "Tutorial" USING GIN ("climateZones");
CREATE INDEX "Tutorial_usdaHardinessZones_idx"  ON "Tutorial" USING GIN ("usdaHardinessZones");
CREATE INDEX "Tutorial_rhsHardinessZones_idx"   ON "Tutorial" USING GIN ("rhsHardinessZones");
CREATE INDEX "Tutorial_paperSizeCompatible_idx" ON "Tutorial" USING GIN ("paperSizeCompatible");

-- ────────────────────────────────────────────────────────────────────
-- User — location + paper fields. All nullable.
-- ────────────────────────────────────────────────────────────────────

ALTER TABLE "User"
  ADD COLUMN "hemisphere"        TEXT,
  ADD COLUMN "koppenZone"        TEXT,
  ADD COLUMN "usdaHardinessZone" TEXT,
  ADD COLUMN "rhsHardinessZone"  TEXT,
  ADD COLUMN "lastFrostDate"     TEXT,
  ADD COLUMN "firstFrostDate"    TEXT,
  ADD COLUMN "paperSize"         TEXT;

-- ────────────────────────────────────────────────────────────────────
-- CountryClimate — country-default zones + paper size.
-- Seeded by `packages/db/scripts/seed-country-climate.ts`.
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE "CountryClimate" (
    "countryCode"           TEXT NOT NULL,
    "countryName"           TEXT NOT NULL,
    "defaultHemisphere"     TEXT NOT NULL,
    "defaultKoppenZone"     TEXT NOT NULL,
    "defaultUsdaZone"       TEXT,
    "defaultRhsZone"        TEXT,
    "defaultPaperSize"      TEXT NOT NULL,
    "defaultLastFrostDate"  TEXT,
    "defaultFirstFrostDate" TEXT,
    "notes"                 TEXT,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryClimate_pkey" PRIMARY KEY ("countryCode")
);

CREATE INDEX "CountryClimate_defaultHemisphere_idx" ON "CountryClimate"("defaultHemisphere");
CREATE INDEX "CountryClimate_defaultKoppenZone_idx" ON "CountryClimate"("defaultKoppenZone");
