-- Needlework Studio (phase_needlework_001) — schema foundation
--
-- Adds:
--   - NeedleworkPattern, NeedleworkPatternLicense — sibling family to
--     Pattern and CrochetPattern
--   - NeedleworkProjectProgress — per-(user, pattern) project state
--   - Enums NeedleworkDiscipline, NeedleworkPatternFormat,
--     NeedleworkFrameType, NeedleworkProjectPhase
--   - User: myNeedleworkThreads, myNeedleworkTools,
--     needleworkDisciplinePreference
--   - Tutorial: needleworkPatternId FK + index
--
-- All-fields-upfront per the schema rule. The two main data columns are:
--   gridData   — JSON cell grid (same shape as Pattern.data) for counted
--                disciplines: BLACKWORK, HARDANGER, NEEDLEPOINT, SASHIKO.
--                Rendered by ChartViewport unchanged.
--   vectorData — JSON { svgContent, width, height, regions[] } for surface
--                disciplines: SURFACE_EMBROIDERY, CREWEL, GOLDWORK, RIBBON,
--                STUMPWORK, CANDLEWICKING.
--
-- NeedleworkProjectProgress stores completedCells (grid) and
-- completedRegions (surface) in the same row so one progress record
-- covers either discipline type.
--
-- See the project memo "Needlework: Sub-discipline Analysis, Studio
-- Architecture, and Implementation Roadmap" (2026-06-09) for the full
-- design rationale.

-- ─── Enums ────────────────────────────────────────────────────────────────

CREATE TYPE "NeedleworkDiscipline" AS ENUM (
  'BLACKWORK',
  'HARDANGER',
  'NEEDLEPOINT',
  'SASHIKO',
  'SURFACE_EMBROIDERY',
  'CREWEL',
  'GOLDWORK',
  'RIBBON',
  'STUMPWORK',
  'CANDLEWICKING'
);

CREATE TYPE "NeedleworkPatternFormat" AS ENUM (
  'GRID_CHART',
  'SURFACE_VECTOR',
  'ROUTE_DIAGRAM',
  'PAINTED_CANVAS'
);

CREATE TYPE "NeedleworkFrameType" AS ENUM (
  'HOOP',
  'SLATE_FRAME',
  'RING_FRAME',
  'Q_SNAPS',
  'STRETCHER_BARS',
  'NONE'
);

CREATE TYPE "NeedleworkProjectPhase" AS ENUM (
  'DESIGN',
  'TRANSFER',
  'STITCHING',
  'FINISHING'
);

-- ─── NeedleworkPattern ────────────────────────────────────────────────────

CREATE TABLE "NeedleworkPattern" (
  "id"               TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "slug"             TEXT,
  "name"             TEXT        NOT NULL,
  "description"      TEXT,
  "discipline"       "NeedleworkDiscipline" NOT NULL,
  "patternFormat"    "NeedleworkPatternFormat" NOT NULL,

  -- Grid-based pattern data (GRID_CHART / ROUTE_DIAGRAM disciplines).
  -- Same cell-grid JSON structure as Pattern.data so ChartViewport can
  -- render without modification. Null for surface patterns.
  "gridData"         JSONB,

  -- Surface pattern data (SURFACE_VECTOR disciplines).
  -- Shape: { svgContent: string, width: number, height: number,
  --          regions: [{ id, pathId, label }] }
  -- Null for grid patterns.
  "vectorData"       JSONB,

  -- Stitch-type annotation per region. For surface patterns.
  -- Shape: [{ id, stitchType, threadRef, colourHex, notes? }]
  "regionAnnotations" JSONB,

  -- Blackwork fill pattern library + region assignments.
  -- Shape: { fills: [{ id, name, cells: PatternCell[] }],
  --          assignments: [{ regionId, fillId, density: 1|2|3 }] }
  -- Also used for sashiko route data when patternFormat = ROUTE_DIAGRAM.
  "chartData"        JSONB,

  "thumbnailMediaId" TEXT,
  "heroMediaId"      TEXT,

  -- Fabric specification. Required fields differ per discipline:
  -- - Hardanger + blackwork: { weaveCount: number, unit: "ct", fabric: string }
  -- - Surface embroidery: { fabric: string, colour: string }
  -- - Needlepoint: { meshCount: number, unit: "ct", canvasType: string }
  -- - Sashiko: { fabric: string, colour: string }
  "fabricSpec"       JSONB,

  -- Thread types used on this pattern (strings matching NeedleworkThreadType).
  -- ["STRANDED_COTTON", "CREWEL_WOOL", "SASHIKO_THREAD", "PEARL_COTTON",
  --  "JAPANESE_GOLD", "SILK_RIBBON", "SILK_THREAD", "TAPESTRY_WOOL"]
  "threadTypes"      TEXT[]      NOT NULL DEFAULT ARRAY[]::TEXT[],

  "frameType"        "NeedleworkFrameType",

  -- Cultural attribution for sashiko and other regionally-specific crafts.
  -- Free text, e.g. "Tohoku region, Japan — asanoha (hemp leaf) pattern".
  "culturalAttribution" TEXT,

  -- Denormalised dimensions for grid patterns. Null for surface patterns.
  "widthCells"       INTEGER,
  "heightCells"      INTEGER,
  "colourCount"      INTEGER     NOT NULL DEFAULT 0,

  "difficulty"       "Difficulty",
  "estimatedHours"   INTEGER,
  "premium"          BOOLEAN     NOT NULL DEFAULT false,
  "visibility"       "Visibility" NOT NULL DEFAULT 'PRIVATE',
  "publishedAt"      TIMESTAMP(3),

  "designerId"       TEXT,
  "ownerUserId"      TEXT,
  "forkedFromId"     TEXT,
  "sourceTutorialId" TEXT,
  "subCategoryId"    TEXT,

  -- Gallery: JSON array of Media.id strings, rotation order.
  "galleryMediaIds"  JSONB       NOT NULL DEFAULT '[]',

  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NeedleworkPattern_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NeedleworkPattern_slug_key" ON "NeedleworkPattern"("slug");

CREATE INDEX "NeedleworkPattern_ownerUserId_updatedAt_idx"
  ON "NeedleworkPattern"("ownerUserId", "updatedAt");
CREATE INDEX "NeedleworkPattern_discipline_visibility_publishedAt_idx"
  ON "NeedleworkPattern"("discipline", "visibility", "publishedAt");
CREATE INDEX "NeedleworkPattern_subCategoryId_publishedAt_idx"
  ON "NeedleworkPattern"("subCategoryId", "publishedAt");
CREATE INDEX "NeedleworkPattern_designerId_idx"
  ON "NeedleworkPattern"("designerId");
CREATE INDEX "NeedleworkPattern_forkedFromId_idx"
  ON "NeedleworkPattern"("forkedFromId");
CREATE INDEX "NeedleworkPattern_sourceTutorialId_idx"
  ON "NeedleworkPattern"("sourceTutorialId");
CREATE INDEX "NeedleworkPattern_heroMediaId_idx"
  ON "NeedleworkPattern"("heroMediaId");

-- FK constraints
ALTER TABLE "NeedleworkPattern"
  ADD CONSTRAINT "NeedleworkPattern_designerId_fkey"
    FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE SET NULL;

ALTER TABLE "NeedleworkPattern"
  ADD CONSTRAINT "NeedleworkPattern_ownerUserId_fkey"
    FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "NeedleworkPattern"
  ADD CONSTRAINT "NeedleworkPattern_forkedFromId_fkey"
    FOREIGN KEY ("forkedFromId") REFERENCES "NeedleworkPattern"("id") ON DELETE SET NULL;

ALTER TABLE "NeedleworkPattern"
  ADD CONSTRAINT "NeedleworkPattern_sourceTutorialId_fkey"
    FOREIGN KEY ("sourceTutorialId") REFERENCES "Tutorial"("id") ON DELETE SET NULL;

ALTER TABLE "NeedleworkPattern"
  ADD CONSTRAINT "NeedleworkPattern_subCategoryId_fkey"
    FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE SET NULL;

ALTER TABLE "NeedleworkPattern"
  ADD CONSTRAINT "NeedleworkPattern_thumbnailMediaId_fkey"
    FOREIGN KEY ("thumbnailMediaId") REFERENCES "Media"("id") ON DELETE SET NULL;

ALTER TABLE "NeedleworkPattern"
  ADD CONSTRAINT "NeedleworkPattern_heroMediaId_fkey"
    FOREIGN KEY ("heroMediaId") REFERENCES "Media"("id") ON DELETE SET NULL;

-- ─── NeedleworkPatternLicense ─────────────────────────────────────────────

CREATE TABLE "NeedleworkPatternLicense" (
  "id"                    TEXT    NOT NULL DEFAULT gen_random_uuid()::text,
  "needleworkPatternId"   TEXT    NOT NULL,
  "licenseType"           "LicenseType" NOT NULL,
  "attributionRequired"   BOOLEAN NOT NULL DEFAULT true,
  "commercialUseAllowed"  BOOLEAN NOT NULL DEFAULT false,
  "redistributionAllowed" BOOLEAN NOT NULL DEFAULT false,
  "attributionText"       TEXT,

  CONSTRAINT "NeedleworkPatternLicense_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NeedleworkPatternLicense_needleworkPatternId_key"
  ON "NeedleworkPatternLicense"("needleworkPatternId");

ALTER TABLE "NeedleworkPatternLicense"
  ADD CONSTRAINT "NeedleworkPatternLicense_needleworkPatternId_fkey"
    FOREIGN KEY ("needleworkPatternId") REFERENCES "NeedleworkPattern"("id")
    ON DELETE CASCADE;

-- ─── NeedleworkProjectProgress ────────────────────────────────────────────

CREATE TABLE "NeedleworkProjectProgress" (
  "id"                  TEXT    NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"              TEXT    NOT NULL,
  "needleworkPatternId" TEXT    NOT NULL,

  -- Current phase (for complex multi-phase patterns like goldwork/stumpwork).
  "currentPhase"        "NeedleworkProjectPhase" NOT NULL DEFAULT 'STITCHING',

  -- Grid disciplines: sparse map { "x,y": true }.
  "completedCells"      JSONB   NOT NULL DEFAULT '{}',

  -- Surface disciplines: map { "regionId": true }.
  "completedRegions"    JSONB   NOT NULL DEFAULT '{}',

  "notes"               TEXT,

  "startedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastWorkedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt"         TIMESTAMP(3),
  "updatedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NeedleworkProjectProgress_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "NeedleworkProjectProgress_userId_needleworkPatternId_key"
    UNIQUE ("userId", "needleworkPatternId")
);

CREATE INDEX "NeedleworkProjectProgress_userId_lastWorkedAt_idx"
  ON "NeedleworkProjectProgress"("userId", "lastWorkedAt");
CREATE INDEX "NeedleworkProjectProgress_needleworkPatternId_idx"
  ON "NeedleworkProjectProgress"("needleworkPatternId");

ALTER TABLE "NeedleworkProjectProgress"
  ADD CONSTRAINT "NeedleworkProjectProgress_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "NeedleworkProjectProgress"
  ADD CONSTRAINT "NeedleworkProjectProgress_needleworkPatternId_fkey"
    FOREIGN KEY ("needleworkPatternId") REFERENCES "NeedleworkPattern"("id")
    ON DELETE CASCADE;

-- ─── User: needlework preferences and personal inventory ──────────────────

ALTER TABLE "User"
  -- Stash: JSON array of thread entries the user owns.
  -- [{ brand: string, ref: string, colourName: string, colourHex: string,
  --    skeinsOwned: number, threadType: string }]
  ADD COLUMN "myNeedleworkThreads"           JSONB,

  -- Tools inventory: hoops, frames, needle collections.
  -- [{ type: "hoop" | "slate_frame" | "ring_frame" | "q_snaps",
  --    sizeCm?: number, brand?: string, notes?: string }]
  ADD COLUMN "myNeedleworkTools"             JSONB,

  -- The discipline the user primarily identifies with.
  ADD COLUMN "needleworkDisciplinePreference" TEXT;

-- ─── Tutorial: needlework pattern bridge ──────────────────────────────────

ALTER TABLE "Tutorial"
  -- Bridge to the canonical NeedleworkPattern row backing this tutorial's
  -- needleworkPatternInset; null on every non-needlework tutorial.
  ADD COLUMN "needleworkPatternId" TEXT;

CREATE INDEX "Tutorial_needleworkPatternId_idx"
  ON "Tutorial"("needleworkPatternId");

ALTER TABLE "Tutorial"
  ADD CONSTRAINT "Tutorial_needleworkPatternId_fkey"
    FOREIGN KEY ("needleworkPatternId") REFERENCES "NeedleworkPattern"("id")
    ON DELETE SET NULL;

-- ─── Designer: needlework pattern reverse relation ────────────────────────
-- (Handled by FK on NeedleworkPattern.designerId above; no separate column
-- needed on Designer — Prisma resolves via the FK.)
