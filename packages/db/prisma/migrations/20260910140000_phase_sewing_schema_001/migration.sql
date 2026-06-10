-- Sewing S-2: SewingPattern + SewingPatternProject + SewingPatternPersonalisation.
-- phase_sewing_schema_001 (2026-06-10).
--
-- All fields up-front per the locked schema rule. Adds:
--   * 5 enums (SewingGarmentCategory, SewingSkillLevel, SewingFormat,
--     SewingSourceLicence, PersonalisationStatus)
--   * SewingPattern (cataloguing + sizing + materials + instructions +
--     adjustments + format support + engine cache key)
--   * SewingPatternProject (per-user per-pattern project state)
--   * SewingPatternPersonalisation (premium gated custom grading request;
--     populated by the S-5a freesewing wrapper, not built here)
--   * Foreign key on UserSewingPlan.patternId referencing SewingPattern(id)
--
-- Strictly additive and idempotent. No existing rows are touched.
-- Category.sewing stays NOT_READY and isPublicVisible stays false per the
-- no-phased-rollout lock (this migration does not flip either flag).

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Enums.
-- ────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SewingGarmentCategory') THEN
    CREATE TYPE "SewingGarmentCategory" AS ENUM (
      'WOMENS_TOPS',
      'WOMENS_DRESSES',
      'WOMENS_BOTTOMS',
      'WOMENS_OUTERWEAR',
      'WOMENS_INTIMATES',
      'MENS_TOPS',
      'MENS_BOTTOMS',
      'MENS_OUTERWEAR',
      'KIDS',
      'BABIES',
      'UNISEX',
      'ACCESSORIES',
      'BAGS',
      'HOME',
      'COSTUME',
      'SPECIALTY'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SewingSkillLevel') THEN
    CREATE TYPE "SewingSkillLevel" AS ENUM (
      'ABSOLUTE_BEGINNER',
      'BEGINNER',
      'IMPROVER',
      'CONFIDENT_BEGINNER',
      'INTERMEDIATE',
      'ADVANCED',
      'EXPERT'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SewingFormat') THEN
    CREATE TYPE "SewingFormat" AS ENUM (
      'A4_TILED',
      'LETTER_TILED',
      'LEGAL_TILED',
      'A3_TILED',
      'A0',
      'PROJECTOR',
      'LAYERED_PDF',
      'BROWSE_ONLY'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SewingSourceLicence') THEN
    CREATE TYPE "SewingSourceLicence" AS ENUM (
      'MIT',
      'GPL_V3',
      'CC_BY',
      'CC_BY_SA',
      'PROPRIETARY_HOMEMADE',
      'INDIE_DESIGNER_SUBMISSION',
      'PUBLIC_DOMAIN'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PersonalisationStatus') THEN
    CREATE TYPE "PersonalisationStatus" AS ENUM (
      'PENDING',
      'GENERATING',
      'SUCCESS',
      'FAILED',
      'REJECTED'
    );
  END IF;
END$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. SewingPattern.
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "SewingPattern" (
  "id"          TEXT PRIMARY KEY,
  "slug"        TEXT NOT NULL UNIQUE,
  "name"        TEXT NOT NULL,
  "description" TEXT,

  -- Designer and provenance.
  "designerId"            TEXT,
  "isFreesewingDesign"    BOOLEAN NOT NULL DEFAULT false,
  "freesewingPackageName" TEXT,
  "freesewingVersion"     TEXT,
  "freesewingDesignSlug"  TEXT,
  "sourceLicence"         "SewingSourceLicence",
  "sourceUrl"             TEXT,
  "attributionText"       TEXT,

  -- Categorisation.
  "garmentCategory" "SewingGarmentCategory" NOT NULL,
  "garmentType"     TEXT,
  "subCategoryId"   TEXT,
  "skillLevel"      "SewingSkillLevel" NOT NULL DEFAULT 'IMPROVER',

  -- Sizing.
  "supportedSizes"       JSONB NOT NULL DEFAULT '[]'::jsonb,
  "defaultEaseCm"        DECIMAL(6, 2),
  "sizingNotes"          TEXT,
  "requiredMeasurements" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "optionalMeasurements" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  -- Body and finished garment charts.
  "bodyMeasurementChart" JSONB,
  "finishedGarmentChart" JSONB,

  -- Seam allowance and construction.
  "seamAllowanceIncluded" BOOLEAN NOT NULL DEFAULT true,
  "seamAllowanceCm"       DECIMAL(4, 2),
  "constructionDirection" TEXT,
  "hasLining"             BOOLEAN NOT NULL DEFAULT false,
  "hasInterfacing"        BOOLEAN NOT NULL DEFAULT false,
  "hasClosure"            BOOLEAN NOT NULL DEFAULT false,
  "closureType"           TEXT,

  -- Materials.
  "recommendedFabrics"   JSONB NOT NULL DEFAULT '[]'::jsonb,
  "recommendedNotions"   JSONB NOT NULL DEFAULT '[]'::jsonb,
  "fabricRequirementsCm" JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Instructions (TipTap document).
  "instructionsBody" JSONB,

  -- Cutting and layout.
  "cuttingLayouts" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "pieceList"      JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Adjustments and variants.
  "adjustmentGuides" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "patternHacks"     JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Output formats supported by this pattern.
  "availableFormats" "SewingFormat"[] NOT NULL DEFAULT ARRAY[]::"SewingFormat"[],

  -- Engine cache key (S-5a populates).
  "engineCacheKey" TEXT,

  -- Standard cataloguing (mirrors crochet / knitting / cross-stitch shapes).
  "difficulty"             "Difficulty",
  "estimatedHoursPerSize"  JSONB,
  "heroMediaId"            TEXT,
  "heroGenerationStatus"   "ImageGenerationStatus" NOT NULL DEFAULT 'PENDING',
  "preferUserPhotoForHero" BOOLEAN NOT NULL DEFAULT false,
  "premium"                BOOLEAN NOT NULL DEFAULT false,
  "visibility"             "Visibility" NOT NULL DEFAULT 'PRIVATE',
  "publishedAt"            TIMESTAMP(3),

  -- Errata and credits.
  "errataVersion"  TEXT NOT NULL DEFAULT '1.0.0',
  "errataLog"      JSONB NOT NULL DEFAULT '[]'::jsonb,
  "testerCredits"  JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Tutorial linkage.
  "tutorialId" TEXT,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SewingPattern_designerId_fkey"
    FOREIGN KEY ("designerId") REFERENCES "Designer"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "SewingPattern_subCategoryId_fkey"
    FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "SewingPattern_heroMediaId_fkey"
    FOREIGN KEY ("heroMediaId") REFERENCES "Media"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "SewingPattern_tutorialId_fkey"
    FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SewingPattern_garmentCategory_publishedAt_idx"
  ON "SewingPattern"("garmentCategory", "publishedAt");
CREATE INDEX IF NOT EXISTS "SewingPattern_subCategoryId_publishedAt_idx"
  ON "SewingPattern"("subCategoryId", "publishedAt");
CREATE INDEX IF NOT EXISTS "SewingPattern_designerId_idx"
  ON "SewingPattern"("designerId");
CREATE INDEX IF NOT EXISTS "SewingPattern_isFreesewingDesign_idx"
  ON "SewingPattern"("isFreesewingDesign");
CREATE INDEX IF NOT EXISTS "SewingPattern_skillLevel_idx"
  ON "SewingPattern"("skillLevel");
CREATE INDEX IF NOT EXISTS "SewingPattern_heroMediaId_idx"
  ON "SewingPattern"("heroMediaId");
CREATE INDEX IF NOT EXISTS "SewingPattern_tutorialId_idx"
  ON "SewingPattern"("tutorialId");
CREATE INDEX IF NOT EXISTS "SewingPattern_visibility_publishedAt_idx"
  ON "SewingPattern"("visibility", "publishedAt");

-- ────────────────────────────────────────────────────────────────────────────
-- 3. SewingPatternProject.
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "SewingPatternProject" (
  "id"        TEXT PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "patternId" TEXT NOT NULL,

  "status"       "SewingPlanStatus" NOT NULL DEFAULT 'DRAFT',
  "selectedSize" TEXT,

  -- Personalisation choices.
  "fabricChoice"        JSONB,
  "notionsChoices"      JSONB,
  "easeOverrideCm"      DECIMAL(6, 2),
  "measurementsSnapshot" JSONB,

  -- Step tracking.
  "stepsProgress" JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Free notes and user photos.
  "notes"             TEXT,
  "userPhotoMediaIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  "startedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastWorkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt"  TIMESTAMP(3),

  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SewingPatternProject_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SewingPatternProject_patternId_fkey"
    FOREIGN KEY ("patternId") REFERENCES "SewingPattern"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "SewingPatternProject_userId_patternId_key"
  ON "SewingPatternProject"("userId", "patternId");
CREATE INDEX IF NOT EXISTS "SewingPatternProject_userId_status_idx"
  ON "SewingPatternProject"("userId", "status");
CREATE INDEX IF NOT EXISTS "SewingPatternProject_patternId_idx"
  ON "SewingPatternProject"("patternId");

-- ────────────────────────────────────────────────────────────────────────────
-- 4. SewingPatternPersonalisation.
--    Premium gated by config flag. The S-5a wrapper populates outputSvg /
--    outputCacheKey / status. Not built in this migration.
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "SewingPatternPersonalisation" (
  "id"        TEXT PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "patternId" TEXT NOT NULL,
  "projectId" TEXT,

  -- Snapshot of user measurements at personalisation time.
  "measurementsSnapshot"           JSONB NOT NULL,
  "measurementsPreferenceSnapshot" TEXT NOT NULL,

  -- Personalisation request.
  "designOptions"  JSONB NOT NULL DEFAULT '{}'::jsonb,
  "easePreference" DECIMAL(6, 2),

  -- Output (filled by S-5a's wrapper).
  "status"          "PersonalisationStatus" NOT NULL DEFAULT 'PENDING',
  "outputSvg"       TEXT,
  "outputCacheKey"  TEXT,
  "generatedAt"     TIMESTAMP(3),
  "errorMessage"    TEXT,

  -- Delivery.
  "deliveredToProject" BOOLEAN NOT NULL DEFAULT false,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SewingPatternPersonalisation_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SewingPatternPersonalisation_patternId_fkey"
    FOREIGN KEY ("patternId") REFERENCES "SewingPattern"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SewingPatternPersonalisation_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "SewingPatternProject"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SewingPatternPersonalisation_userId_idx"
  ON "SewingPatternPersonalisation"("userId");
CREATE INDEX IF NOT EXISTS "SewingPatternPersonalisation_patternId_idx"
  ON "SewingPatternPersonalisation"("patternId");
CREATE INDEX IF NOT EXISTS "SewingPatternPersonalisation_status_idx"
  ON "SewingPatternPersonalisation"("status");

-- ────────────────────────────────────────────────────────────────────────────
-- 5. UserSewingPlan.patternId promoted to a proper FK.
--    Stays nullable. patternSlug remains the fallback for blank or
--    non-catalogued plans. Existing rows with non-null patternId would
--    orphan, but the pre-S-2 table shipped 2026-06-10 with zero rows
--    referencing patternId, so no backfill is needed.
-- ────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'UserSewingPlan_patternId_fkey'
  ) THEN
    ALTER TABLE "UserSewingPlan"
      ADD CONSTRAINT "UserSewingPlan_patternId_fkey"
      FOREIGN KEY ("patternId") REFERENCES "SewingPattern"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS "UserSewingPlan_patternId_idx"
  ON "UserSewingPlan"("patternId");
