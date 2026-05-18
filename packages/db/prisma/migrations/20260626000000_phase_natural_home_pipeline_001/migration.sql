-- Phase Natural-home pipeline scaffold — schema migration.
--
-- Adds tutorial-level shelf-life metadata so soap, candle, balm, lotion,
-- and home-fragrance recipes can carry the useful-life of the finished
-- product on the row itself (12 months for an anhydrous balm, 3 months
-- for a water-containing lotion without preservative, 1 year or more
-- for a properly cured cold-process soap). The Garden / Herbal / Sewing
-- / Crochet / Knitting / Pottery scaffolds were all additive on
-- Tutorial; this one follows the same shape.
--
-- Everything is additive: no column drops, no breaking renames; existing
-- Cooking, Baking, Mindset, Garden, Herbal, Sewing, Crochet, Knitting,
-- Needlework, Pottery, Wood-natural-craft, Paper-word, and Fibre-arts
-- rows untouched. Cooking + Baking recipes ignore the new columns (a
-- buttercream's shelf life lives in `freezeNotes` / `makeAheadNotes`
-- where it always has — the new columns are for product-shelf-life,
-- not food-safety windows).
--
-- Per `feedback_schema_all_fields_upfront.md` every plausibly-useful
-- field is added now, not staged for a follow-up migration. The
-- structured `shelfLifeDays` integer lets the public renderer / filter
-- queries sort by "how long does this keep"; `shelfLifeNotes` carries
-- the human-readable nuance ("Stable 12 months in a cool dark cupboard;
-- discard if the surface develops white spots or the salve smells
-- rancid.") because a single integer never captures the storage caveat.
--
-- See `docs/natural-home-author.md` for the authoring prompt that
-- decides which sub-categories set which fields.

-- ─────────────────────────────────────────────────────────────────────
-- Tutorial — shelf-life metadata.
--
-- Null on every Tutorial that doesn't have a finished-product shelf
-- life (every TECHNIQUE row, every READING row, every Cooking +
-- Baking recipe that uses freezeNotes for the food-safety window).
-- Set on natural-home RECIPE rows and on herbal REMEDY rows that
-- benefit from the structured integer (the existing herbal authoring
-- prompt has carried shelf life in `recipe.makeAheadNotes` to date;
-- new herbal drafts may move to these columns going forward without
-- a backfill — both surfaces coexist).
--
-- `shelfLifeDays` chosen over `shelfLifeMonths` to match the existing
-- `Ingredient.shelfLifeDays` shape — same name, same unit, same
-- semantics. Reader-side formatting decides whether to render "12
-- months", "1 year", or "365 days" based on magnitude.
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE "Tutorial"
  ADD COLUMN "shelfLifeDays"  INTEGER,
  ADD COLUMN "shelfLifeNotes" TEXT;

-- Index for the "what keeps for longer than 6 months" filter. Cheap GIN
-- alternative would over-index; B-tree on a nullable integer is the
-- right shape (the public renderer queries either `IS NOT NULL` or
-- `>= 180` / `>= 365`).
CREATE INDEX "Tutorial_shelfLifeDays_idx" ON "Tutorial"("shelfLifeDays");
