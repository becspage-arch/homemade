-- Pattern Studio v1 (2026-06-08).
--
-- Adds the Pattern / Designer / PatternLicense / UserPatternProgress models
-- behind the cross-stitch Studio + future knitting / crochet chart Studios.
-- One canonical Pattern row backs every chart whether it lives inside a
-- tutorial inset, the public library, or a user's My Patterns drawer. The
-- shape covers all known v1 needs up-front so future work (Stitching Mama
-- catalogue import, photo-to-chart saves, silent forks, premium gating)
-- doesn't need follow-up migrations.
--
-- Tutorial.patternId is the bridge from tutorial body to Pattern row; the
-- companion data backfill replaces every legacy `crossStitchChart` TipTap
-- node with a `patternInset(patternId)` node that points at the newly-
-- created Pattern row. The Tutorial.body backfill is a separate one-shot
-- script (see scripts/migrate-cross-stitch-charts.ts).
--
-- User.paperSize is promoted from a nullable String to the PaperSize enum.
-- A4 is the global default; any prior value ('Letter' / 'A3' / 'Legal') is
-- upper-cased and preserved. Existing chart-print URL `?paper=` overrides
-- continue to work unchanged.
--
-- Per the all-fields-upfront rule (memory/feedback_schema_all_fields_upfront)
-- every field that v1 plausibly needs lands now, including premium gating
-- flag, license sidecar, and the back-stitch / French-knots / beads /
-- quarter-stitches feature flags on Pattern. Premium stays a config-only
-- flip; nothing about the column shape changes when the flag flips later.

-- ───────────────────────────────────────────────────────────────────────────
-- Enums
-- ───────────────────────────────────────────────────────────────────────────

CREATE TYPE "PatternType" AS ENUM ('CROSS_STITCH', 'KNITTING_CHART', 'CROCHET_CHART');
CREATE TYPE "LicenseType" AS ENUM ('LIBRARY_FREE', 'LIBRARY_PREMIUM', 'MARKETPLACE');
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'UNLISTED', 'PUBLIC');
CREATE TYPE "PaperSize" AS ENUM ('A4', 'LETTER', 'LEGAL', 'A3');
CREATE TYPE "FlossBrand" AS ENUM ('DMC', 'ANCHOR', 'MADEIRA');

-- ───────────────────────────────────────────────────────────────────────────
-- Designer — patterns belong to a Designer (house designer = Homemade-owned;
-- userId-set = a Maker who authored the pattern themselves). Slug feeds the
-- public /designers/[slug] surface in a later phase; for v1 the only
-- designer surfaces are the floss-key footer + the library card.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE "Designer" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatarMediaId" TEXT,
    "websiteUrl" TEXT,
    "isHouseDesigner" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "patternCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Designer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Designer_slug_key" ON "Designer"("slug");
CREATE INDEX "Designer_isHouseDesigner_idx" ON "Designer"("isHouseDesigner");
CREATE INDEX "Designer_userId_idx" ON "Designer"("userId");

ALTER TABLE "Designer" ADD CONSTRAINT "Designer_avatarMediaId_fkey"
    FOREIGN KEY ("avatarMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Designer" ADD CONSTRAINT "Designer_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ───────────────────────────────────────────────────────────────────────────
-- Pattern — the canonical row backing every chart on the platform.
--
-- `data` is the validated pattern JSON (schemaVersion 1). The renderer
-- never re-derives widthCells / heightCells / colourCount / totalStitches
-- from `data` at request time — they're denormalised on save so library
-- card grids stay cheap to filter and sort.
--
-- `ownerUserId` null + visibility PUBLIC + publishedAt set = a library
-- pattern. `ownerUserId` set = the user's own pattern (silently forked
-- on first edit of a library pattern). `forkedFromId` points back at the
-- original so we can later show "Based on …" attribution.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE "Pattern" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "type" "PatternType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "data" JSONB NOT NULL,
    "thumbnailMediaId" TEXT,
    "widthCells" INTEGER NOT NULL,
    "heightCells" INTEGER NOT NULL,
    "colourCount" INTEGER NOT NULL,
    "totalStitches" INTEGER NOT NULL DEFAULT 0,
    "designerId" TEXT,
    "ownerUserId" TEXT,
    "forkedFromId" TEXT,
    "sourceTutorialId" TEXT,
    "difficulty" "Difficulty",
    "estimatedHours" INTEGER,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "publishedAt" TIMESTAMP(3),
    "subCategoryId" TEXT,
    "hasBackstitch" BOOLEAN NOT NULL DEFAULT false,
    "hasFrenchKnots" BOOLEAN NOT NULL DEFAULT false,
    "hasBeads" BOOLEAN NOT NULL DEFAULT false,
    "hasQuarterStitches" BOOLEAN NOT NULL DEFAULT false,
    "fabricCountSuggested" INTEGER NOT NULL DEFAULT 14,
    "recommendedHoopInches" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pattern_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Pattern_slug_key" ON "Pattern"("slug");
CREATE INDEX "Pattern_ownerUserId_updatedAt_idx" ON "Pattern"("ownerUserId", "updatedAt");
CREATE INDEX "Pattern_type_visibility_publishedAt_idx" ON "Pattern"("type", "visibility", "publishedAt");
CREATE INDEX "Pattern_subCategoryId_publishedAt_idx" ON "Pattern"("subCategoryId", "publishedAt");
CREATE INDEX "Pattern_designerId_idx" ON "Pattern"("designerId");
CREATE INDEX "Pattern_forkedFromId_idx" ON "Pattern"("forkedFromId");
CREATE INDEX "Pattern_sourceTutorialId_idx" ON "Pattern"("sourceTutorialId");

ALTER TABLE "Pattern" ADD CONSTRAINT "Pattern_thumbnailMediaId_fkey"
    FOREIGN KEY ("thumbnailMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Pattern" ADD CONSTRAINT "Pattern_designerId_fkey"
    FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Pattern" ADD CONSTRAINT "Pattern_ownerUserId_fkey"
    FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Pattern" ADD CONSTRAINT "Pattern_forkedFromId_fkey"
    FOREIGN KEY ("forkedFromId") REFERENCES "Pattern"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Pattern" ADD CONSTRAINT "Pattern_sourceTutorialId_fkey"
    FOREIGN KEY ("sourceTutorialId") REFERENCES "Tutorial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Pattern" ADD CONSTRAINT "Pattern_subCategoryId_fkey"
    FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ───────────────────────────────────────────────────────────────────────────
-- PatternLicense — sidecar so a Pattern can be retagged (free → marketplace
-- → premium) without rewriting `data`. Marketplace patterns add commercial
-- attribution and a redistribution stance that the renderer surfaces in
-- the floss-key footer and the PDF cover.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE "PatternLicense" (
    "id" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,
    "licenseType" "LicenseType" NOT NULL,
    "attributionRequired" BOOLEAN NOT NULL DEFAULT true,
    "commercialUseAllowed" BOOLEAN NOT NULL DEFAULT false,
    "redistributionAllowed" BOOLEAN NOT NULL DEFAULT false,
    "attributionText" TEXT,

    CONSTRAINT "PatternLicense_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PatternLicense_patternId_key" ON "PatternLicense"("patternId");

ALTER TABLE "PatternLicense" ADD CONSTRAINT "PatternLicense_patternId_fkey"
    FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ───────────────────────────────────────────────────────────────────────────
-- UserPatternProgress — per-(user, pattern) progress + study state.
--
-- `stitchedCells` is the sparse "x,y" → true map (same encoding as the
-- legacy ChartProgress.markedCells, but JSON-keyed so colour-isolate
-- queries are O(stitched) instead of O(grid)). `currentColourSymbol`
-- caches the last-active palette symbol so reopening a pattern lands
-- on the colour the user was stitching.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE "UserPatternProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,
    "stitchedCells" JSONB NOT NULL DEFAULT '{}',
    "currentColourSymbol" TEXT,
    "notes" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastStitchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPatternProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserPatternProgress_userId_patternId_key" ON "UserPatternProgress"("userId", "patternId");
CREATE INDEX "UserPatternProgress_userId_lastStitchedAt_idx" ON "UserPatternProgress"("userId", "lastStitchedAt");
CREATE INDEX "UserPatternProgress_patternId_idx" ON "UserPatternProgress"("patternId");

ALTER TABLE "UserPatternProgress" ADD CONSTRAINT "UserPatternProgress_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserPatternProgress" ADD CONSTRAINT "UserPatternProgress_patternId_fkey"
    FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ───────────────────────────────────────────────────────────────────────────
-- Tutorial.patternId — the bridge from the tutorial body to the canonical
-- Pattern row. Null on every existing tutorial; populated by the
-- crossStitchChart → patternInset backfill script.
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE "Tutorial" ADD COLUMN "patternId" TEXT;
CREATE INDEX "Tutorial_patternId_idx" ON "Tutorial"("patternId");
ALTER TABLE "Tutorial" ADD CONSTRAINT "Tutorial_patternId_fkey"
    FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ───────────────────────────────────────────────────────────────────────────
-- User Studio prefs — `paperSize` String? becomes PaperSize NOT NULL with
-- A4 default. Existing strings ('Letter' / 'A3' / 'Legal') upper-case to
-- enum members; unrecognised values fall through to A4.
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE "User" ADD COLUMN "paperSizeNext" "PaperSize" NOT NULL DEFAULT 'A4';
UPDATE "User" SET "paperSizeNext" = CASE upper("paperSize")
    WHEN 'LETTER' THEN 'LETTER'::"PaperSize"
    WHEN 'A3' THEN 'A3'::"PaperSize"
    WHEN 'LEGAL' THEN 'LEGAL'::"PaperSize"
    WHEN 'A4' THEN 'A4'::"PaperSize"
    ELSE 'A4'::"PaperSize"
END;
ALTER TABLE "User" DROP COLUMN "paperSize";
ALTER TABLE "User" RENAME COLUMN "paperSizeNext" TO "paperSize";

ALTER TABLE "User" ADD COLUMN "studioPreferences" JSONB;
ALTER TABLE "User" ADD COLUMN "defaultFabricCount" INTEGER NOT NULL DEFAULT 14;
ALTER TABLE "User" ADD COLUMN "defaultBrand" "FlossBrand" NOT NULL DEFAULT 'DMC';
ALTER TABLE "User" ADD COLUMN "defaultStrands" INTEGER NOT NULL DEFAULT 2;
