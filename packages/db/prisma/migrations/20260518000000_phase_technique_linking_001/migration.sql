-- Phase Technique linking — schema migration.
--
-- Adds two String[] columns and one GIN index to Tutorial so every recipe
-- (and every other tutorial that references techniques) can declare which
-- technique tutorials it uses. The matching `techniqueLink` mark on the
-- TipTap body wraps the inline reference; this denormalised array is the
-- cheap reverse-query surface for the future "Recipes using this technique"
-- rail (separate worker session, ships once each high-volume category has
-- ~50 technique tutorials).
--
-- Per `feedback_schema_all_fields_upfront.md`: both fields land now even
-- though only `techniqueSlugs` is strictly needed for v1 of the inline
-- link. `criticalTechniques` is the subset without which the recipe
-- doesn't work — the rail can rank "recipes that depend on this
-- technique" above "recipes that mention it in passing" without a
-- follow-up migration.
--
-- Everything additive: defaults are empty arrays, no breaking renames.
-- Every existing Tutorial row (~1,250 published across cooking + baking
-- + mindset + others) keeps its current shape — the backfill that
-- populates these arrays on already-published recipes is a separate
-- worker session.

ALTER TABLE "Tutorial"
  ADD COLUMN "techniqueSlugs"     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "criticalTechniques" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Reverse-query index: "find every tutorial that references technique X"
-- resolves as `WHERE :slug = ANY(techniqueSlugs)`. The GIN index on the
-- String[] makes that cheap regardless of how many rows accumulate.
-- `criticalTechniques` is small enough (typically 0–3 slugs per row) that
-- a sequential scan over the array is fine on the rare query that needs
-- it; no second index.
CREATE INDEX "Tutorial_techniqueSlugs_idx" ON "Tutorial" USING GIN ("techniqueSlugs");
