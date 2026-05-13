-- Phase 8 Step 2 — Recipe schema migration.
--
-- Adds:
-- * TutorialType enum (RECIPE | TECHNIQUE)
-- * Tutorial: type discriminator + every recipe-side metadata field listed in
--   docs/page-design.md (servings, yield, prep/cook/resting/chilling/total
--   minutes, scalable, freezable, freezeNotes, batchable, batchNotes,
--   makeAheadNotes, dietaryFlags, cuisine, mealType, mood, temperatureCelsius,
--   temperatureNote, nutritionalInfoPerServing, foundational,
--   leftoverTutorialId).
-- * Ingredient master table.
-- * Tool master table.
-- * RecipeIngredient + RecipeTool join tables.
--
-- All additive — no column drops, no breaking renames. Existing Tutorial rows
-- default to TECHNIQUE and need no backfill beyond the two anchor tutorials
-- (bechamel stays TECHNIQUE, strawberry jam flips to RECIPE).

-- CreateEnum
CREATE TYPE "TutorialType" AS ENUM ('RECIPE', 'TECHNIQUE');

-- AlterTable: Tutorial picks up the type discriminator + every recipe-side
-- metadata field. All nullable / defaulted so existing rows take sensible
-- values without manual backfill.
ALTER TABLE "Tutorial"
  ADD COLUMN "type" "TutorialType" NOT NULL DEFAULT 'TECHNIQUE',
  ADD COLUMN "servings" INTEGER,
  ADD COLUMN "yieldDescription" TEXT,
  ADD COLUMN "prepMinutes" INTEGER,
  ADD COLUMN "cookMinutes" INTEGER,
  ADD COLUMN "restingMinutes" INTEGER,
  ADD COLUMN "chillingMinutes" INTEGER,
  ADD COLUMN "totalMinutes" INTEGER,
  ADD COLUMN "scalable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "freezable" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "freezeNotes" TEXT,
  ADD COLUMN "batchable" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "batchNotes" TEXT,
  ADD COLUMN "makeAheadNotes" TEXT,
  ADD COLUMN "dietaryFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "cuisine" TEXT,
  ADD COLUMN "mealType" TEXT,
  ADD COLUMN "mood" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "temperatureCelsius" INTEGER,
  ADD COLUMN "temperatureNote" TEXT,
  ADD COLUMN "nutritionalInfoPerServing" JSONB,
  ADD COLUMN "foundational" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "leftoverTutorialId" TEXT;

-- Backfill: existing array columns get an empty array on every prior row.
UPDATE "Tutorial" SET "dietaryFlags" = ARRAY[]::TEXT[] WHERE "dietaryFlags" IS NULL;
UPDATE "Tutorial" SET "mood" = ARRAY[]::TEXT[] WHERE "mood" IS NULL;

-- Tutorial type indexes for the type-filtered queries the public pages use.
CREATE INDEX "Tutorial_type_idx" ON "Tutorial"("type");
CREATE INDEX "Tutorial_type_cuisine_idx" ON "Tutorial"("type", "cuisine");
CREATE INDEX "Tutorial_type_mealType_idx" ON "Tutorial"("type", "mealType");
CREATE INDEX "Tutorial_type_totalMinutes_idx" ON "Tutorial"("type", "totalMinutes");
CREATE INDEX "Tutorial_type_freezable_idx" ON "Tutorial"("type", "freezable");
CREATE INDEX "Tutorial_type_batchable_idx" ON "Tutorial"("type", "batchable");
CREATE INDEX "Tutorial_type_foundational_idx" ON "Tutorial"("type", "foundational");

-- Self-referential leftover-bridge FK — recipe → "what to do with the
-- leftovers" tutorial. ON DELETE SET NULL so deleting the target doesn't
-- cascade-delete the originating recipe.
ALTER TABLE "Tutorial"
  ADD CONSTRAINT "Tutorial_leftoverTutorialId_fkey" FOREIGN KEY ("leftoverTutorialId") REFERENCES "Tutorial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: Ingredient (master)
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pluralName" TEXT,
    "category" TEXT NOT NULL,
    "defaultUnit" TEXT NOT NULL,
    "dietaryFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "commonSubstitutes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "beginnerNote" TEXT,
    "isStaple" BOOLEAN NOT NULL DEFAULT false,
    "isAllergen" BOOLEAN NOT NULL DEFAULT false,
    "allergenType" TEXT,
    "seasonality" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "shelfLifeDays" INTEGER,
    "storage" TEXT,
    "nutritionalInfoPer100g" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Ingredient_slug_key" ON "Ingredient"("slug");
CREATE INDEX "Ingredient_category_idx" ON "Ingredient"("category");
CREATE INDEX "Ingredient_isStaple_idx" ON "Ingredient"("isStaple");
CREATE INDEX "Ingredient_isAllergen_idx" ON "Ingredient"("isAllergen");

-- CreateTable: Tool (master)
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPurchasable" BOOLEAN NOT NULL DEFAULT true,
    "typicalPriceGbp" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tool_slug_key" ON "Tool"("slug");
CREATE INDEX "Tool_category_idx" ON "Tool"("category");
CREATE INDEX "Tool_isPurchasable_idx" ON "Tool"("isPurchasable");

-- CreateTable: RecipeIngredient (join)
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "unit" TEXT,
    "prepNote" TEXT,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "groupLabel" TEXT,
    "position" INTEGER NOT NULL,
    "substitutionAllowed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RecipeIngredient_tutorialId_position_idx" ON "RecipeIngredient"("tutorialId", "position");
CREATE INDEX "RecipeIngredient_ingredientId_idx" ON "RecipeIngredient"("ingredientId");

ALTER TABLE "RecipeIngredient"
  ADD CONSTRAINT "RecipeIngredient_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: RecipeTool (join)
CREATE TABLE "RecipeTool" (
    "id" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeTool_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RecipeTool_tutorialId_position_idx" ON "RecipeTool"("tutorialId", "position");
CREATE INDEX "RecipeTool_toolId_idx" ON "RecipeTool"("toolId");

ALTER TABLE "RecipeTool"
  ADD CONSTRAINT "RecipeTool_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "RecipeTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: flip the strawberry-jam anchor tutorial to RECIPE. Bechamel
-- stays TECHNIQUE (the default). Both slugs are stable — they were set when
-- the anchor tutorials were uploaded via `packages/db/scripts/upload-tutorial.ts`.
UPDATE "Tutorial"
   SET "type" = 'RECIPE'
 WHERE "slug" = 'strawberry-jam-open-pan-method';
