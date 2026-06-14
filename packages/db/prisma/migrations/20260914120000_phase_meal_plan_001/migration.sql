-- Meal plan. phase_meal_plan_001 (2026-06-14).
--
-- One MealPlan per (user, week); MealPlanEntry slots a recipe into a day + meal.
-- Entries reference recipes by plain id + denormalised slug/title (no FK to
-- Tutorial / UserRecipe) so the plan survives an unpublish and the shopping
-- list reads slugs without a join. Strictly additive; guarded for re-apply.

CREATE TABLE IF NOT EXISTS "MealPlan" (
  "id"            TEXT NOT NULL,
  "ownerUserId"   TEXT NOT NULL,
  "title"         TEXT,
  "weekStartDate" DATE NOT NULL,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MealPlan_ownerUserId_weekStartDate_key"
  ON "MealPlan" ("ownerUserId", "weekStartDate");
CREATE INDEX IF NOT EXISTS "MealPlan_ownerUserId_weekStartDate_idx"
  ON "MealPlan" ("ownerUserId", "weekStartDate");

DO $$ BEGIN
  ALTER TABLE "MealPlan"
    ADD CONSTRAINT "MealPlan_ownerUserId_fkey"
    FOREIGN KEY ("ownerUserId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "MealPlanEntry" (
  "id"            TEXT NOT NULL,
  "planId"        TEXT NOT NULL,
  "dayOfWeek"     INTEGER NOT NULL,
  "mealType"      "MealType" NOT NULL,
  "tutorialId"    TEXT,
  "tutorialSlug"  TEXT,
  "tutorialTitle" TEXT,
  "userRecipeId"  TEXT,
  "note"          TEXT,
  "servings"      INTEGER,
  "position"      INTEGER NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MealPlanEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MealPlanEntry_planId_dayOfWeek_idx"
  ON "MealPlanEntry" ("planId", "dayOfWeek");

DO $$ BEGIN
  ALTER TABLE "MealPlanEntry"
    ADD CONSTRAINT "MealPlanEntry_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "MealPlan"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
