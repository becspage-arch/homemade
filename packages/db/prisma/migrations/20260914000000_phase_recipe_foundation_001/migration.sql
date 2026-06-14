-- Recipe foundation. phase_recipe_foundation_001 (2026-06-14).
--
-- Layers the user-uploaded recipe surface + a richer substitution graph on top
-- of the EXISTING Ingredient / RecipeIngredient ontology (already seeded:
-- ~1,000 canonical ingredients, ~23k Tutorial↔Ingredient links). This migration
-- does NOT recreate that ontology. It:
--   1. extends Ingredient with densityGPerMl + aisle (for render-time unit
--      conversion and the future shopping-list aggregator),
--   2. adds the IngredientSubstitution graph (ratio + context + flavour delta),
--   3. adds UserRecipe + UserRecipeIngredient (FK to the canonical Ingredient),
--   4. adds the cross-craft cooking-unit preferences on User
--      (ovenPreference / weightPreference / volumePreference).
--
-- Strictly additive. Every new column is nullable or has a default, every new
-- table / type / constraint / index is guarded so a partial-apply rerun does
-- not block the runner. No category flags change.

-- ── Enums ───────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "OvenPreference" AS ENUM ('FAN_C', 'CONVENTIONAL_C', 'FAHRENHEIT', 'GAS_MARK');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "WeightPreference" AS ENUM ('METRIC', 'IMPERIAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "VolumePreference" AS ENUM ('METRIC', 'IMPERIAL_UK', 'IMPERIAL_US');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "IngredientAisle" AS ENUM (
    'PRODUCE', 'DAIRY', 'MEAT_FISH', 'PANTRY_DRY', 'PANTRY_OIL', 'PANTRY_CONDIMENT',
    'PANTRY_BAKING', 'FROZEN', 'BAKERY', 'DELI', 'DRINK', 'HERBS_SPICES', 'HOUSEHOLD', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "UserRecipeStatus" AS ENUM ('DRAFT', 'PENDING_AI_MODERATION', 'APPROVED', 'REJECTED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "UserRecipeVisibility" AS ENUM ('PRIVATE', 'UNLISTED', 'PUBLIC');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT', 'DRINK', 'SIDE', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── User: cooking-unit preferences ──────────────────────────────────────────
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "ovenPreference"   "OvenPreference",
  ADD COLUMN IF NOT EXISTS "weightPreference" "WeightPreference",
  ADD COLUMN IF NOT EXISTS "volumePreference" "VolumePreference";

-- ── Ingredient: density + aisle ─────────────────────────────────────────────
ALTER TABLE "Ingredient"
  ADD COLUMN IF NOT EXISTS "densityGPerMl" DECIMAL(65,30),
  ADD COLUMN IF NOT EXISTS "aisle" "IngredientAisle";

CREATE INDEX IF NOT EXISTS "Ingredient_aisle_idx" ON "Ingredient" ("aisle");

-- ── IngredientSubstitution ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "IngredientSubstitution" (
  "id"               TEXT NOT NULL,
  "mainIngredientId" TEXT NOT NULL,
  "altIngredientId"  TEXT NOT NULL,
  "ratio"            DECIMAL(65,30),
  "appropriateFor"   TEXT,
  "flavourDelta"     TEXT,
  "notes"            TEXT,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IngredientSubstitution_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "IngredientSubstitution_mainIngredientId_altIngredientId_key"
  ON "IngredientSubstitution" ("mainIngredientId", "altIngredientId");
CREATE INDEX IF NOT EXISTS "IngredientSubstitution_mainIngredientId_idx"
  ON "IngredientSubstitution" ("mainIngredientId");
CREATE INDEX IF NOT EXISTS "IngredientSubstitution_altIngredientId_idx"
  ON "IngredientSubstitution" ("altIngredientId");

DO $$ BEGIN
  ALTER TABLE "IngredientSubstitution"
    ADD CONSTRAINT "IngredientSubstitution_mainIngredientId_fkey"
    FOREIGN KEY ("mainIngredientId") REFERENCES "Ingredient"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "IngredientSubstitution"
    ADD CONSTRAINT "IngredientSubstitution_altIngredientId_fkey"
    FOREIGN KEY ("altIngredientId") REFERENCES "Ingredient"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── UserRecipe ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "UserRecipe" (
  "id"                  TEXT NOT NULL,
  "slug"                TEXT NOT NULL,
  "ownerUserId"         TEXT NOT NULL,
  "title"               TEXT NOT NULL,
  "summary"             TEXT,
  "body"                JSONB NOT NULL,
  "cuisineTags"         TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "dietaryTags"         TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "mealType"            "MealType",
  "servings"            INTEGER NOT NULL,
  "prepTimeMinutes"     INTEGER,
  "cookTimeMinutes"     INTEGER,
  "totalTimeMinutes"    INTEGER,
  "temperatureCelsius"  INTEGER,
  "heroPhotoMediaId"    TEXT,
  "galleryMediaIds"     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "categorySlug"        TEXT NOT NULL,
  "status"              "UserRecipeStatus" NOT NULL DEFAULT 'PENDING_AI_MODERATION',
  "aiModerationVerdict" TEXT,
  "aiModerationNotes"   JSONB,
  "moderatedAt"         TIMESTAMP(3),
  "publishedAt"         TIMESTAMP(3),
  "visibility"          "UserRecipeVisibility" NOT NULL DEFAULT 'PRIVATE',
  "saveCount"           INTEGER NOT NULL DEFAULT 0,
  "viewCount"           INTEGER NOT NULL DEFAULT 0,
  "originalityType"     TEXT,
  "attribution"         TEXT,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserRecipe_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserRecipe_slug_key" ON "UserRecipe" ("slug");
CREATE INDEX IF NOT EXISTS "UserRecipe_ownerUserId_status_idx"
  ON "UserRecipe" ("ownerUserId", "status");
CREATE INDEX IF NOT EXISTS "UserRecipe_categorySlug_visibility_publishedAt_idx"
  ON "UserRecipe" ("categorySlug", "visibility", "publishedAt");
CREATE INDEX IF NOT EXISTS "UserRecipe_visibility_publishedAt_idx"
  ON "UserRecipe" ("visibility", "publishedAt");

DO $$ BEGIN
  ALTER TABLE "UserRecipe"
    ADD CONSTRAINT "UserRecipe_ownerUserId_fkey"
    FOREIGN KEY ("ownerUserId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── UserRecipeIngredient ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "UserRecipeIngredient" (
  "id"           TEXT NOT NULL,
  "recipeId"     TEXT NOT NULL,
  "ingredientId" TEXT NOT NULL,
  "quantity"     DECIMAL(65,30),
  "unit"         TEXT,
  "notes"        TEXT,
  "isOptional"   BOOLEAN NOT NULL DEFAULT FALSE,
  "order"        INTEGER NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserRecipeIngredient_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "UserRecipeIngredient_recipeId_order_idx"
  ON "UserRecipeIngredient" ("recipeId", "order");
CREATE INDEX IF NOT EXISTS "UserRecipeIngredient_ingredientId_idx"
  ON "UserRecipeIngredient" ("ingredientId");

DO $$ BEGIN
  ALTER TABLE "UserRecipeIngredient"
    ADD CONSTRAINT "UserRecipeIngredient_recipeId_fkey"
    FOREIGN KEY ("recipeId") REFERENCES "UserRecipe"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "UserRecipeIngredient"
    ADD CONSTRAINT "UserRecipeIngredient_ingredientId_fkey"
    FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
