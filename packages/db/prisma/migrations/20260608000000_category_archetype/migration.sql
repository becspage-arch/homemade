-- Category.archetype — landing-page archetype enum that drives the
-- /[categorySlug] layout router (Worker 1 of the category-landing-rethink
-- session, 2026-06-08).
--
-- Six archetypes:
--   RECIPE   → cooking, baking, herbal-medicine, natural-home
--   PATTERN  → cross-stitch, knitting, crochet, needlework, sewing
--   SKILL    → fibre-arts, wood-natural-craft, paper-word, pottery-ceramics
--   PRACTICE → mindset, sustainability, animals-smallholding
--   PLANT    → garden
--   FIX      → home-repair
--
-- Default RECIPE so any new Category row picks a safe layout; existing
-- categories are reassigned explicitly below.

CREATE TYPE "CategoryArchetype" AS ENUM (
  'RECIPE',
  'PATTERN',
  'SKILL',
  'PRACTICE',
  'PLANT',
  'FIX'
);

ALTER TABLE "Category"
  ADD COLUMN "archetype" "CategoryArchetype" NOT NULL DEFAULT 'RECIPE';

UPDATE "Category" SET "archetype" = 'RECIPE'   WHERE "slug" IN ('cooking', 'baking', 'herbal-medicine', 'natural-home');
UPDATE "Category" SET "archetype" = 'PATTERN'  WHERE "slug" IN ('cross-stitch', 'knitting', 'crochet', 'needlework', 'sewing');
UPDATE "Category" SET "archetype" = 'SKILL'    WHERE "slug" IN ('fibre-arts', 'wood-natural-craft', 'paper-word', 'pottery-ceramics');
UPDATE "Category" SET "archetype" = 'PRACTICE' WHERE "slug" IN ('mindset', 'sustainability', 'animals-smallholding');
UPDATE "Category" SET "archetype" = 'PLANT'    WHERE "slug" = 'garden';
UPDATE "Category" SET "archetype" = 'FIX'      WHERE "slug" = 'home-repair';
