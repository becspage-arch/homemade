-- CategoryMagazinePick + Tutorial.requiredTools
-- (Iteration 4 of the category-landing-rethink, 2026-06-08).
--
-- CategoryMagazinePick: per-category magazine block on Recipe landings.
-- Position 1 = feature card, 2..4 = supporting cards. Optional weekly pin;
-- RecipeLayout falls back to algorithmic when no rows are scheduled.
--
-- Tutorial.requiredTools: free-form slug array used by the Skill archetype
-- landing to surface a tool/equipment picker (e.g. "drop-spindle", "wheel",
-- "rigid-heddle", "sloyd-knife"). Empty default; authors set per tutorial.

CREATE TABLE "CategoryMagazinePick" (
  "id"           TEXT       NOT NULL,
  "categoryId"   TEXT       NOT NULL,
  "weekStarting" TIMESTAMP(3) NOT NULL,
  "position"     INTEGER    NOT NULL,
  "tutorialId"   TEXT       NOT NULL,
  "selectedBy"   TEXT,
  "selectedAt"   TIMESTAMP(3),
  "reason"       TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CategoryMagazinePick_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CategoryMagazinePick_categoryId_weekStarting_position_key"
  ON "CategoryMagazinePick"("categoryId", "weekStarting", "position");

CREATE INDEX "CategoryMagazinePick_categoryId_weekStarting_idx"
  ON "CategoryMagazinePick"("categoryId", "weekStarting");

ALTER TABLE "CategoryMagazinePick"
  ADD CONSTRAINT "CategoryMagazinePick_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CategoryMagazinePick"
  ADD CONSTRAINT "CategoryMagazinePick_tutorialId_fkey"
  FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Tutorial"
  ADD COLUMN "requiredTools" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
