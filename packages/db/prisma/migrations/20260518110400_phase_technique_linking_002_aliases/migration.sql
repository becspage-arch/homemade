-- Phase Technique linking 002 — aliases column.
--
-- Adds `Tutorial.aliases TEXT[]` so the reverse-sweep Inngest function
-- (`on-technique-publish`) can match common phrasings of a technique that
-- the canonical title doesn't already cover. For the `blind-bake`
-- technique the aliases might be `["blind baking", "pre-bake the pastry"]`;
-- the sweep walks the body text of every published RECIPE / PRACTICE /
-- GROWING_GUIDE / REMEDY / HERB_PROFILE / STITCH / PATTERN tutorial in
-- the same category and appends the technique's slug to
-- `techniqueSlugs` wherever any term matches.
--
-- Additive: every existing row keeps an empty array; readers that don't
-- consult `aliases` are unaffected.
ALTER TABLE "Tutorial"
  ADD COLUMN "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
