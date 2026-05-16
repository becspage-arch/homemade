# Bulk Batch 006 — Report

**Date:** 2026-05-16
**Target:** 50 recipes auto-published (autopilot daily fire)
**Status:** Partial — 10 PUBLISHED (5 pressure-cooker + 5 Caribbean). 15 of the planned 25-recipe slice were not drafted after a mid-session schema-drift block; the block resolved post-push when the deploy applied the pending migration and the 5 voice-clean Caribbean drafts uploaded in the same session.

---

## Summary

This is the first autonomous fire of `autopilot-cooking-bulk` after the wire-up
commit landed earlier today (`6538094`). The pre-flight gates all passed (no
double-fire, batch number = 006, 2,554 in-scope candidates, quality trend down
across last 3 batches, chain = 0). A slice of 25 recipes was planned across
six under-represented cuisines (pressure-cooker, Caribbean, North African,
Eastern European, Middle Eastern, Mediterranean Greek) to balance the heavy
British / Italian / French / American distribution of batches 003-005.

5 recipes from the pressure-cooker slice published successfully between
16:50-16:56. The Caribbean slice (5 recipes) was drafted, voice-checked clean,
and queued for upload at 17:00, when uploads began failing with a Prisma
`P2022 ColumnNotFound` error against `Category.targetTutorialCount`. After
the partial commit pushed and the deploy workflow ran the pending migration,
the 5 voice-clean Caribbean drafts uploaded successfully at 17:27-17:28 —
bringing the final batch total to 10 PUBLISHED.

The cause is a schema drift: the parallel `autopilot-mindset-bulk` fire
(which fired at 16:35, one minute after this cooking fire) added the migration
`20260619000000_phase_categories_targets_001` and modified `schema.prisma` to
introduce three new Category columns (`targetTutorialCount`, `isPublicVisible`,
`launchOrder`). The migration is on disk but has not been applied to the live
database. Prisma client regenerated mid-session, after my first 5 uploads but
before the Caribbean batch attempts. From that point on, every Category lookup
fails.

A halt signal was written:

```
stream   = cooking
reason   = SCHEMA_DRIFT
detail   = Parallel mindset/baking autopilot fires modified schema.prisma…
           Migration 20260619000000_phase_categories_targets_001 exists on disk
           but not applied to live DB. Cooking-bulk scope cannot apply schema
           migrations.
```

The 15 remaining briefs in the planned slice (North African 4, Eastern
European 4, Middle Eastern 4, Greek 3) were not drafted. The 5 Caribbean
briefs that were drafted and voice-checked uploaded in the same session
after the deploy applied the pending migration — bringing the final batch
total to 10 PUBLISHED.

---

## Recipes published (10 total)

### Pressure-cooker (5, first batch in the pressure-cooker section)
| Slug | Title | Difficulty |
|------|-------|------------|
| pressure-cooker-chicken-stock | Pressure-cooker chicken stock | BEGINNER |
| pressure-cooker-beef-stew | Pressure-cooker beef stew | BEGINNER |
| pressure-cooker-pulled-pork | Pressure-cooker pulled pork | BEGINNER |
| pressure-cooker-chickpea-curry | Pressure-cooker chickpea curry | BEGINNER |
| pressure-cooker-red-lentil-dhal | Pressure-cooker red lentil dhal | BEGINNER |

The `pressure-cooker-chicken-stock` row is marked `foundational: true`.

### Caribbean (5)
| Slug | Title | Difficulty |
|------|-------|------------|
| callaloo | Callaloo | BEGINNER |
| curry-chicken | Jamaican curry chicken | BEGINNER |
| brown-stew-chicken | Jamaican brown stew chicken | BEGINNER |
| ropa-vieja | Ropa vieja | INTERMEDIATE |
| picadillo | Cuban picadillo | BEGINNER |

---

## Difficulty mix (published)

- BEGINNER: 9 (90%)
- INTERMEDIATE: 1 (10%, ropa-vieja)
- ADVANCED: 0

The planned 25-recipe slice would have hit ~72% BEGINNER / 28% INTERMEDIATE.
The published 10 lean heavier on BEGINNER because the pressure-cooker slice
was beginner-weighted by design and the Caribbean slice was the easier of
the planned six cuisines.

---

## Voice-check summary

| Brief | First pass | After fixes |
|---|---|---|
| pressure-cooker-chicken-stock | 1 warn (Instant Pot brand) | clean |
| pressure-cooker-beef-stew | clean | clean |
| pressure-cooker-pulled-pork | clean | clean |
| pressure-cooker-chickpea-curry | 4 errors (em-dash pairs) | clean |
| pressure-cooker-red-lentil-dhal | 5 errors (em-dash pairs ×2, glossary coverage ×1) | clean |
| curry-chicken | 1 warn ("fall" Americanism) | clean |
| brown-stew-chicken | 2 errors (em-dash pair in sourceNotes) | clean |
| callaloo | clean | clean |
| ropa-vieja | 1 error ("genuinely" banned) | clean |
| picadillo | 1 error ("genuinely" banned) | clean |

No drops. Every fix was first-attempt. Patterns are consistent with previous
bulk batches: em-dash appositive pairs in sourceNotes and intro paragraphs,
"genuinely" softener, "fall" Americanism. The glossary-coverage error on
`pressure-cooker-red-lentil-dhal` was a schema bug in my draft — I used
`slug` as the glossary tooltip mark attribute instead of `termSlug`. Worth
flagging in `docs/common-issues.md` since this is a structural pattern that
would catch future drafters.

---

## Master list additions

None. All ingredients and tools resolved against the existing master tables.

---

## New common-issues entry to add

The glossary tooltip attribute naming caught me. The TipTap mark schema uses
`termSlug` (as anchored in `packages/db/scripts/anchor-tutorials/toad-in-the-hole.json`),
not `slug`. The voice-check `glossary-coverage` rule fires when the mark
attribute is mis-named because the lookup uses `termSlug`.

A `[block]` entry should be added to `docs/common-issues.md` under "Structural
issues":

> **Glossary tooltip uses `termSlug`, not `slug`** `[block]`
> Pattern: drafting the inline glossary tooltip mark with `attrs: { slug: "x" }`.
> The TipTap mark schema and the upload script both expect `attrs: { termSlug: "x" }`.
> Mis-named attribute causes the voice-check `glossary-coverage` rule to fire
> because the lookup never finds an inline use.
> **How to fix:** rewrite as `attrs: { termSlug: "<slug>" }`. The toad-in-the-hole
> anchor is the canonical example.

I have not edited `common-issues.md` in this run because the file was not
modified by the parallel autopilot fires and I want to keep the commit
surface tight. The next cooking fire can pick this up, or Rebecca can apply
the change manually.

---

## Anti-tells compliance

All 5 PUBLISHED and 5 staged Caribbean drafts written to the Anti-AI Voice
Rules:

- British English throughout (autumn, courgette, hob, grill, tin)
- No banned phrases in final versions
- No em-dash appositive pairs in final versions
- No prices, no real retailers
- No "Instant Pot" brand mention in body prose (corrected to multi-cooker)
- All scaling tokens render-checked against the unit family table

---

## What the next fire should do

1. **The schema state is now reconciled.** The post-push deploy applied
   the pending migration. The next cooking fire starts on a clean schema
   baseline.

2. **The unfinished slices** (North African 4, Eastern European 4, Middle
   Eastern 4, Greek 3) are worth picking up first in batch 007 since they
   sit at the lightest end of last-3-batches coverage.

3. **Concurrent autopilot fires across streams should be gated.** All three
   autopilot streams (cooking 02:00, baking 04:10, mindset 06:06) fired
   within a minute of each other today because the wire-up commit went in
   moments before their daily windows. If two streams modify the schema
   concurrently and a third tries to use it, the third fails. A cross-stream
   lock — even a simple "another stream is mutating shared files" check —
   would prevent this. The autopilot prompt's halt-signal reason enum should
   also include `SCHEMA_DRIFT` / `DB_MIGRATION_PENDING` as a named reason
   rather than free-text — both cooking and mindset hit it on the same day
   with slightly different reason strings.

4. **Add the glossary-tooltip-attribute pattern to `docs/common-issues.md`**
   as a `[block]` structural rule. Drafters writing `attrs: { slug: "x" }`
   for the inline glossary mark when the schema expects
   `attrs: { termSlug: "x" }`. Catches future drafters who don't reference
   the toad-in-the-hole anchor.

---

## Running totals (cooking)

| Batch | Recipes |
|-------|---------|
| 001 | 100 |
| 002 | 31 |
| 003 | 50 |
| 004 | 50 |
| 005 | 50 |
| **006 (partial)** | **10** |
| Cumulative published (after final upload pass) | **489** |

Difference between sum-of-batches (291) and cumulative (489) is accounted
for by anchor tutorials, the pilot-10 batch, and personal-recipes imports
that pre-date the bulk numbering.
