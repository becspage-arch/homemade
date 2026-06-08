-- Crochet Studio (phase_crochet_pattern_001) — schema and node-set
-- foundation for the crochet category Studio.
--
-- Adds:
--   - CrochetPattern, CrochetPatternLicense — sibling family to Pattern
--   - CrochetProjectProgress — per-(user, pattern) project state
--   - CrochetProjectGauge — swatch logging
--   - CrochetStitchMarker — digital stitch markers
--   - CrochetProjectRepeatCounter — "repeat rows until..." counters
--   - CrochetColourScheme — saved colour schemes
--   - Enums CrochetPatternFormat, CrochetConstruction, CrochetShape
--   - PaperSize: adds A0, A1, A2 (printable schematics)
--   - User: myHooks, myYarns, myColourSchemes, crochetLeftHanded,
--     crochetTerminologyPreference
--   - Tutorial: crochetPatternId FK + index
--
-- All-fields-upfront per the schema rule. JSON columns (rowsStructured,
-- chartData, pieces, sizesGraded, etc.) hold pattern body data; structured
-- columns drive filters and indexes.
--
-- See the project memo "Crochet category — deep audit and reimagination"
-- (2026-06-08) for the full design rationale.

-- ─── Enums ────────────────────────────────────────────────────────────────
CREATE TYPE "CrochetPatternFormat" AS ENUM ('WRITTEN_ONLY', 'WRITTEN_AND_CHART', 'CHART_ONLY');

CREATE TYPE "CrochetConstruction" AS ENUM (
  'TOP_DOWN_SEAMLESS',
  'BOTTOM_UP_SEAMLESS',
  'SEAMED',
  'SEAMLESS_ROUND',
  'ROW',
  'MOTIF_JOIN',
  'AMIGURUMI',
  'OTHER'
);

CREATE TYPE "CrochetShape" AS ENUM (
  'BLANKET',
  'GARMENT',
  'AMIGURUMI',
  'MOTIF',
  'ACCESSORY',
  'HOMEWARE',
  'DECOR',
  'WEARABLE_ACCESSORY',
  'LACEWORK',
  'BAG',
  'HAT',
  'SCARF',
  'SHAWL'
);

-- ─── PaperSize: add printable-schematic sizes ─────────────────────────────
ALTER TYPE "PaperSize" ADD VALUE IF NOT EXISTS 'A2';
ALTER TYPE "PaperSize" ADD VALUE IF NOT EXISTS 'A1';
ALTER TYPE "PaperSize" ADD VALUE IF NOT EXISTS 'A0';

-- ─── User: crochet preferences and personal inventory ─────────────────────
ALTER TABLE "User"
  ADD COLUMN "myHooks" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "myYarns" JSONB,
  ADD COLUMN "myColourSchemes" JSONB,
  ADD COLUMN "crochetLeftHanded" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN "crochetTerminologyPreference" TEXT;

-- ─── Tutorial: bridge to CrochetPattern for crochetPatternInset ───────────
ALTER TABLE "Tutorial" ADD COLUMN "crochetPatternId" TEXT;
CREATE INDEX "Tutorial_crochetPatternId_idx" ON "Tutorial" ("crochetPatternId");

-- ─── CrochetPattern ───────────────────────────────────────────────────────
CREATE TABLE "CrochetPattern" (
  "id" TEXT NOT NULL,
  "slug" TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT,

  -- Body
  "rowsStructured" JSONB NOT NULL,
  "chartData" JSONB,
  "schematicMediaId" TEXT,
  "thumbnailMediaId" TEXT,
  "assemblyInstructions" JSONB,

  -- Shape and construction
  "format" "CrochetPatternFormat" NOT NULL DEFAULT 'WRITTEN_ONLY',
  "construction" "CrochetConstruction",
  "shapeCategory" "CrochetShape",

  -- Sizing
  "sizesGraded" JSONB,
  "yardageBySize" JSONB,

  -- Yarn + hook + gauge
  "primaryYarnWeightId" TEXT,
  "primaryHookId" TEXT,
  "gaugeText" TEXT,
  "finishedSizeText" TEXT,

  -- Multi-piece
  "pieceCount" INTEGER NOT NULL DEFAULT 1,
  "pieces" JSONB,
  "buildOrder" JSONB,

  -- Stitches + techniques
  "abbreviationsUsed" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "specialStitchesUsed" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "craftStitchSlugs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "craftTechniqueTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  -- Terminology
  "terminologyConvention" TEXT NOT NULL DEFAULT 'uk',

  -- Counter affordances
  "clusterCountByRound" JSONB,
  "repeatRowGroups" JSONB,
  "leftHandedChartAvailable" BOOLEAN NOT NULL DEFAULT FALSE,

  -- Cataloguing
  "difficulty" "Difficulty",
  "estimatedHours" INTEGER,
  "premium" BOOLEAN NOT NULL DEFAULT FALSE,
  "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
  "publishedAt" TIMESTAMP(3),

  -- Relations
  "designerId" TEXT,
  "ownerUserId" TEXT,
  "forkedFromId" TEXT,
  "sourceTutorialId" TEXT,
  "subCategoryId" TEXT,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CrochetPattern_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CrochetPattern_slug_key" ON "CrochetPattern" ("slug");
CREATE INDEX "CrochetPattern_ownerUserId_updatedAt_idx" ON "CrochetPattern" ("ownerUserId", "updatedAt");
CREATE INDEX "CrochetPattern_visibility_publishedAt_idx" ON "CrochetPattern" ("visibility", "publishedAt");
CREATE INDEX "CrochetPattern_subCategoryId_publishedAt_idx" ON "CrochetPattern" ("subCategoryId", "publishedAt");
CREATE INDEX "CrochetPattern_designerId_idx" ON "CrochetPattern" ("designerId");
CREATE INDEX "CrochetPattern_forkedFromId_idx" ON "CrochetPattern" ("forkedFromId");
CREATE INDEX "CrochetPattern_sourceTutorialId_idx" ON "CrochetPattern" ("sourceTutorialId");
CREATE INDEX "CrochetPattern_shapeCategory_idx" ON "CrochetPattern" ("shapeCategory");
CREATE INDEX "CrochetPattern_format_idx" ON "CrochetPattern" ("format");
CREATE INDEX "CrochetPattern_primaryYarnWeightId_idx" ON "CrochetPattern" ("primaryYarnWeightId");
CREATE INDEX "CrochetPattern_primaryHookId_idx" ON "CrochetPattern" ("primaryHookId");
CREATE INDEX "CrochetPattern_craftStitchSlugs_idx" ON "CrochetPattern" USING GIN ("craftStitchSlugs");
CREATE INDEX "CrochetPattern_craftTechniqueTags_idx" ON "CrochetPattern" USING GIN ("craftTechniqueTags");

-- ─── CrochetPatternLicense ────────────────────────────────────────────────
CREATE TABLE "CrochetPatternLicense" (
  "id" TEXT NOT NULL,
  "crochetPatternId" TEXT NOT NULL,
  "licenseType" "LicenseType" NOT NULL,
  "attributionRequired" BOOLEAN NOT NULL DEFAULT TRUE,
  "commercialUseAllowed" BOOLEAN NOT NULL DEFAULT FALSE,
  "redistributionAllowed" BOOLEAN NOT NULL DEFAULT FALSE,
  "attributionText" TEXT,

  CONSTRAINT "CrochetPatternLicense_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CrochetPatternLicense_crochetPatternId_key" ON "CrochetPatternLicense" ("crochetPatternId");

-- ─── CrochetProjectProgress ───────────────────────────────────────────────
CREATE TABLE "CrochetProjectProgress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "crochetPatternId" TEXT NOT NULL,

  "currentRow" INTEGER NOT NULL DEFAULT 0,
  "currentSection" TEXT,
  "completedRows" JSONB NOT NULL DEFAULT '{}',
  "notes" TEXT,
  "perRowNotes" JSONB NOT NULL DEFAULT '{}',

  "gradedSize" TEXT,
  "customMeasurements" JSONB,
  "leftHandedOverride" BOOLEAN,
  "terminologyOverride" TEXT,
  "preferredView" TEXT,
  "countByCluster" BOOLEAN NOT NULL DEFAULT FALSE,

  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastWorkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CrochetProjectProgress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CrochetProjectProgress_userId_crochetPatternId_key" ON "CrochetProjectProgress" ("userId", "crochetPatternId");
CREATE INDEX "CrochetProjectProgress_userId_lastWorkedAt_idx" ON "CrochetProjectProgress" ("userId", "lastWorkedAt");
CREATE INDEX "CrochetProjectProgress_crochetPatternId_idx" ON "CrochetProjectProgress" ("crochetPatternId");

-- ─── CrochetProjectGauge ──────────────────────────────────────────────────
CREATE TABLE "CrochetProjectGauge" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "crochetPatternId" TEXT,

  "stitchesPer10cm" DOUBLE PRECISION,
  "rowsPer10cm" DOUBLE PRECISION,
  "hookMm" DOUBLE PRECISION,
  "yarnLabel" TEXT,
  "blocked" BOOLEAN NOT NULL DEFAULT FALSE,
  "notes" TEXT,
  "swatchPhotoMediaId" TEXT,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CrochetProjectGauge_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CrochetProjectGauge_userId_createdAt_idx" ON "CrochetProjectGauge" ("userId", "createdAt");
CREATE INDEX "CrochetProjectGauge_crochetPatternId_idx" ON "CrochetProjectGauge" ("crochetPatternId");

-- ─── CrochetStitchMarker ──────────────────────────────────────────────────
CREATE TABLE "CrochetStitchMarker" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "crochetPatternId" TEXT NOT NULL,

  "position" JSONB NOT NULL,
  "label" TEXT,
  "colour" TEXT,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CrochetStitchMarker_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CrochetStitchMarker_userId_crochetPatternId_idx" ON "CrochetStitchMarker" ("userId", "crochetPatternId");

-- ─── CrochetProjectRepeatCounter ──────────────────────────────────────────
CREATE TABLE "CrochetProjectRepeatCounter" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "crochetPatternId" TEXT NOT NULL,

  "sectionLabel" TEXT NOT NULL,
  "repeatsWorked" INTEGER NOT NULL DEFAULT 0,
  "targetRepeats" INTEGER,
  "targetCm" DOUBLE PRECISION,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CrochetProjectRepeatCounter_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CrochetProjectRepeatCounter_userId_crochetPatternId_idx" ON "CrochetProjectRepeatCounter" ("userId", "crochetPatternId");

-- ─── CrochetColourScheme ──────────────────────────────────────────────────
CREATE TABLE "CrochetColourScheme" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,

  "name" TEXT NOT NULL,
  "colours" JSONB NOT NULL,
  "sourceCrochetPatternId" TEXT,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CrochetColourScheme_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CrochetColourScheme_userId_updatedAt_idx" ON "CrochetColourScheme" ("userId", "updatedAt");

-- ─── Foreign keys ─────────────────────────────────────────────────────────
ALTER TABLE "Tutorial" ADD CONSTRAINT "Tutorial_crochetPatternId_fkey"
  FOREIGN KEY ("crochetPatternId") REFERENCES "CrochetPattern"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CrochetPattern" ADD CONSTRAINT "CrochetPattern_schematicMediaId_fkey"
  FOREIGN KEY ("schematicMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrochetPattern" ADD CONSTRAINT "CrochetPattern_thumbnailMediaId_fkey"
  FOREIGN KEY ("thumbnailMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrochetPattern" ADD CONSTRAINT "CrochetPattern_primaryYarnWeightId_fkey"
  FOREIGN KEY ("primaryYarnWeightId") REFERENCES "YarnWeight"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrochetPattern" ADD CONSTRAINT "CrochetPattern_primaryHookId_fkey"
  FOREIGN KEY ("primaryHookId") REFERENCES "CrochetHook"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrochetPattern" ADD CONSTRAINT "CrochetPattern_designerId_fkey"
  FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrochetPattern" ADD CONSTRAINT "CrochetPattern_ownerUserId_fkey"
  FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrochetPattern" ADD CONSTRAINT "CrochetPattern_forkedFromId_fkey"
  FOREIGN KEY ("forkedFromId") REFERENCES "CrochetPattern"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrochetPattern" ADD CONSTRAINT "CrochetPattern_sourceTutorialId_fkey"
  FOREIGN KEY ("sourceTutorialId") REFERENCES "Tutorial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CrochetPattern" ADD CONSTRAINT "CrochetPattern_subCategoryId_fkey"
  FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CrochetPatternLicense" ADD CONSTRAINT "CrochetPatternLicense_crochetPatternId_fkey"
  FOREIGN KEY ("crochetPatternId") REFERENCES "CrochetPattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrochetProjectProgress" ADD CONSTRAINT "CrochetProjectProgress_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrochetProjectProgress" ADD CONSTRAINT "CrochetProjectProgress_crochetPatternId_fkey"
  FOREIGN KEY ("crochetPatternId") REFERENCES "CrochetPattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrochetProjectGauge" ADD CONSTRAINT "CrochetProjectGauge_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrochetProjectGauge" ADD CONSTRAINT "CrochetProjectGauge_crochetPatternId_fkey"
  FOREIGN KEY ("crochetPatternId") REFERENCES "CrochetPattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrochetProjectGauge" ADD CONSTRAINT "CrochetProjectGauge_swatchPhotoMediaId_fkey"
  FOREIGN KEY ("swatchPhotoMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CrochetStitchMarker" ADD CONSTRAINT "CrochetStitchMarker_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrochetStitchMarker" ADD CONSTRAINT "CrochetStitchMarker_crochetPatternId_fkey"
  FOREIGN KEY ("crochetPatternId") REFERENCES "CrochetPattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrochetProjectRepeatCounter" ADD CONSTRAINT "CrochetProjectRepeatCounter_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrochetProjectRepeatCounter" ADD CONSTRAINT "CrochetProjectRepeatCounter_crochetPatternId_fkey"
  FOREIGN KEY ("crochetPatternId") REFERENCES "CrochetPattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrochetColourScheme" ADD CONSTRAINT "CrochetColourScheme_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrochetColourScheme" ADD CONSTRAINT "CrochetColourScheme_sourceCrochetPatternId_fkey"
  FOREIGN KEY ("sourceCrochetPatternId") REFERENCES "CrochetPattern"("id") ON DELETE SET NULL ON UPDATE CASCADE;
