-- Phase Garden pipeline scaffold — schema migration.
--
-- Adds the Garden master taxonomy + the growing-guide metadata on
-- Tutorial. Everything is additive: no column drops, no breaking
-- renames, existing Cooking / Baking / Mindset rows untouched. Garden
-- tutorials default to a new `GROWING_GUIDE` TutorialType so they
-- share the Tutorial spine with recipes, techniques, practices, and
-- readings.
--
-- The pattern mirrors the Phase 8 Baking pipeline scaffold:
--   - One new TutorialType enum value (extends, doesn't break).
--   - One master entity table per the category's first-class objects.
--     For Garden, that's `PlantVariety` (analogous to `Ingredient` for
--     Cooking / Baking). PlantPest and CompanionPlanting are first-
--     class reference rows the public-facing tutorials cross-link.
--   - A handful of nullable columns on Tutorial that only carry
--     meaning when `type = GROWING_GUIDE`.
--
-- Per `feedback_schema_all_fields_upfront.md`: every plausibly-useful
-- field is added now. No staging of "core now / nice-to-have later".
-- The growing-difficulty axis reuses the existing `Tutorial.difficulty`
-- column (BEGINNER / INTERMEDIATE / ADVANCED) — no separate column.
--
-- See `docs/garden-author.md` for the authoring prompt that drives
-- which fields are set for which growing-guide sub-topic.

-- ────────────────────────────────────────────────────────────────────
-- TutorialType extension. ALTER TYPE ADD VALUE is safe in a migration
-- transaction on Postgres 12+ as long as the new value is not also
-- used in the same migration. We never reference 'GROWING_GUIDE' in
-- the SQL below, so this is fine.
-- ────────────────────────────────────────────────────────────────────

ALTER TYPE "TutorialType" ADD VALUE IF NOT EXISTS 'GROWING_GUIDE';

-- ────────────────────────────────────────────────────────────────────
-- Companion-planting relationship enum.
-- ────────────────────────────────────────────────────────────────────

CREATE TYPE "CompanionRelationship" AS ENUM (
  'BENEFICIAL',
  'NEUTRAL',
  'HARMFUL'
);

-- ────────────────────────────────────────────────────────────────────
-- PlantVariety — the Garden master entity. Analogous to Ingredient
-- for the food categories. Tutorials reference it by slug (no Prisma
-- relation; tutorials cross-link plants in body prose, not as a
-- structured join).
--
-- `category`, `sunRequirement`, `waterRequirement` are stored as
-- free-form strings rather than Postgres enums so authors can add new
-- values without a follow-up migration — same pattern as
-- `Ingredient.category` and `Ingredient.defaultUnit`.
--
-- Hardiness zones are String[] because plants typically tolerate a
-- range (a tomato is RHS H1a-H1c indoor / H1c-H2 outdoor). USDA + RHS
-- live in separate columns so the renderer can show the reader's
-- region without re-mapping.
--
-- `seasonality` mirrors `Ingredient.seasonality` — months when the
-- plant is sown / harvested / blooming, depending on the plant type.
-- Tutorials carry the precise per-sub-topic months (sowing window vs
-- harvest window) in `Tutorial.plantingMonths` / `harvestMonths`.
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE "PlantVariety" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "latinBinomial" TEXT,

    -- Self-referential FK. Set on a variety row to point at its parent
    -- species ("Brandywine" → "tomato"). Null on species-level rows.
    "parentSpeciesId" TEXT,

    -- vegetable / fruit / herb / flower / shrub / tree / other.
    "category" TEXT NOT NULL,

    -- Hardiness zone tolerance. RHS uses H1a..H7 strings; USDA uses
    -- '1'..'13' strings. String[] so the row can express a range.
    "rhsHardinessZone"  TEXT[] DEFAULT ARRAY[]::TEXT[],
    "usdaHardinessZone" TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- full-sun / partial-shade / shade.
    "sunRequirement" TEXT,
    -- low / moderate / high.
    "waterRequirement" TEXT,

    -- clay / sandy / loamy / chalky / well-drained / boggy. Array
    -- because most plants tolerate more than one.
    "soilType" TEXT[] DEFAULT ARRAY[]::TEXT[],

    "daysToMaturity" INTEGER,
    "seedingDepthCm" DOUBLE PRECISION,
    "spacingCm"      INTEGER,
    "heightCm"       INTEGER,

    -- Which parts of the plant the kitchen uses ("fruit", "leaf",
    -- "root", "stem", "flower", "seed"). Empty on purely ornamental
    -- rows; multi-valued on plants where more than one part is eaten
    -- (e.g. beetroot → fruit + leaf, calendula → flower + leaf).
    "edibleParts" TEXT[] DEFAULT ARRAY[]::TEXT[],

    "notes" TEXT,

    "isStaple"    BOOLEAN NOT NULL DEFAULT false,
    "isPerennial" BOOLEAN NOT NULL DEFAULT false,

    -- Months when the plant is in season (sown / harvested / blooming
    -- depending on category). Lower-case month names matching
    -- `Ingredient.seasonality`.
    "seasonality" TEXT[] DEFAULT ARRAY[]::TEXT[],

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantVariety_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlantVariety_slug_key"           ON "PlantVariety"("slug");
CREATE INDEX        "PlantVariety_category_idx"       ON "PlantVariety"("category");
CREATE INDEX        "PlantVariety_isStaple_idx"       ON "PlantVariety"("isStaple");
CREATE INDEX        "PlantVariety_isPerennial_idx"    ON "PlantVariety"("isPerennial");
CREATE INDEX        "PlantVariety_parentSpeciesId_idx" ON "PlantVariety"("parentSpeciesId");

ALTER TABLE "PlantVariety"
  ADD CONSTRAINT "PlantVariety_parentSpeciesId_fkey"
  FOREIGN KEY ("parentSpeciesId") REFERENCES "PlantVariety"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ────────────────────────────────────────────────────────────────────
-- PlantPest — common garden pests + diseases. Reference table; the
-- public pest-management surfaces cross-reference these rows. Stored
-- as a flat table rather than a join because a pest typically affects
-- many plants and the affected-plants list is small enough to live in
-- a String[] (RHS lists ~30 plants for blackfly).
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE "PlantPest" (
    "id"   TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    -- PlantVariety slugs the pest affects. Free-form String[] so an
    -- author can add a new plant without re-FKing — same pattern as
    -- `Ingredient.commonSubstitutes`.
    "affectedPlants" TEXT[] DEFAULT ARRAY[]::TEXT[],

    "symptoms" TEXT,
    -- Plain-text controls. The public renderer prefers organic; the
    -- conventional column is shown factually with a "follow manufacturer
    -- instructions" voice line, not as endorsement.
    "organicControls"      TEXT,
    "conventionalControls" TEXT,

    -- low / moderate / high / catastrophic. Free-form string so authors
    -- can refine without a migration.
    "severity" TEXT,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantPest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlantPest_slug_key"   ON "PlantPest"("slug");
CREATE INDEX        "PlantPest_severity_idx" ON "PlantPest"("severity");

-- ────────────────────────────────────────────────────────────────────
-- CompanionPlanting — pairwise companion / antagonist relationships.
-- One row per ordered pair; the seed enforces symmetry where it
-- exists ("tomato → basil = BENEFICIAL" implies "basil → tomato =
-- BENEFICIAL"). HARMFUL pairs are commonly cited folklore-strength
-- claims; the author docs require a citation in `notes` rather than a
-- bare assertion.
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE "CompanionPlanting" (
    "id"          TEXT NOT NULL,
    "plantId"     TEXT NOT NULL,
    "companionId" TEXT NOT NULL,
    "relationship" "CompanionRelationship" NOT NULL,
    "notes"        TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanionPlanting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CompanionPlanting_plantId_companionId_key"
  ON "CompanionPlanting"("plantId", "companionId");
CREATE INDEX        "CompanionPlanting_plantId_idx"
  ON "CompanionPlanting"("plantId");
CREATE INDEX        "CompanionPlanting_companionId_idx"
  ON "CompanionPlanting"("companionId");

ALTER TABLE "CompanionPlanting"
  ADD CONSTRAINT "CompanionPlanting_plantId_fkey"
    FOREIGN KEY ("plantId")     REFERENCES "PlantVariety"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "CompanionPlanting_companionId_fkey"
    FOREIGN KEY ("companionId") REFERENCES "PlantVariety"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ────────────────────────────────────────────────────────────────────
-- Tutorial — Garden-specific growing-guide metadata. All nullable;
-- existing rows untouched. Only meaningful when
-- `type = GROWING_GUIDE`. The renderer surfaces the planting + harvest
-- calendars, the container / indoor flags, and the regional
-- applicability strip on the growing-guide info bar.
--
-- Growing difficulty reuses the existing `Tutorial.difficulty`
-- column. We do NOT add a separate `growingDifficulty` field — the
-- BEGINNER / INTERMEDIATE / ADVANCED ladder is the same shape across
-- categories.
-- ────────────────────────────────────────────────────────────────────

ALTER TABLE "Tutorial"
  -- Months when the plant is sown / planted. Lower-case month names
  -- ('march', 'april', ...). String[] so a tutorial can express a
  -- sowing window.
  ADD COLUMN "plantingMonths" TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Months when the plant is harvested / picked.
  ADD COLUMN "harvestMonths"  TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Container + indoor friendliness. Drive the "grows on a balcony"
  -- and "windowsill-friendly" filters on the public browse view.
  -- Nullable; null = not applicable (not a growing guide).
  ADD COLUMN "containerFriendly" BOOLEAN,
  ADD COLUMN "indoorFriendly"    BOOLEAN,

  -- Regional applicability. The author writes a frost-tender tomato
  -- schedule for UK + EU; the renderer flags the calendar as
  -- different for US_NORTH vs US_SOUTH. Values:
  -- 'UK' / 'EU' / 'US_NORTH' / 'US_SOUTH' / 'AU_NZ' / 'ZA'. Default
  -- ['UK'] is set by the upload script when the author leaves it
  -- empty.
  ADD COLUMN "regionsApplicable" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Garden-specific indexes on Tutorial. The public browse surfaces
-- filter by container-friendliness, indoor-friendliness, and by
-- planting / harvest month (GIN on the array supports the
-- "what to sow in April" filter).
CREATE INDEX "Tutorial_type_containerFriendly_idx" ON "Tutorial"("type", "containerFriendly");
CREATE INDEX "Tutorial_type_indoorFriendly_idx"    ON "Tutorial"("type", "indoorFriendly");
CREATE INDEX "Tutorial_plantingMonths_idx"         ON "Tutorial" USING GIN ("plantingMonths");
CREATE INDEX "Tutorial_harvestMonths_idx"          ON "Tutorial" USING GIN ("harvestMonths");
CREATE INDEX "Tutorial_regionsApplicable_idx"      ON "Tutorial" USING GIN ("regionsApplicable");
