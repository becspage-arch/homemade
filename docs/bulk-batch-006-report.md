# Bulk Batch 006 — Report

**Date:** 2026-05-16
**Target:** 50 recipes auto-published (autopilot daily fire)
**Status:** Partial — 5 PUBLISHED, halted on schema drift across parallel autopilot fires

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
`P2022 ColumnNotFound` error against `Category.targetTutorialCount`.

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

The 20 remaining briefs in the planned slice (Caribbean: 5 / North African,
Eastern European, Middle Eastern, Greek: 15) were not drafted or are drafted
but not uploaded. The 5 Caribbean briefs that were drafted and voice-checked
sit in `docs/bulk-batch-006-briefs/` for the next fire to pick up after the
schema state is reconciled.

---

## Recipes published (5 total)

### Pressure-cooker (5)
| Slug | Title | Difficulty |
|------|-------|------------|
| pressure-cooker-chicken-stock | Pressure-cooker chicken stock | BEGINNER |
| pressure-cooker-beef-stew | Pressure-cooker beef stew | BEGINNER |
| pressure-cooker-pulled-pork | Pressure-cooker pulled pork | BEGINNER |
| pressure-cooker-chickpea-curry | Pressure-cooker chickpea curry | BEGINNER |
| pressure-cooker-red-lentil-dhal | Pressure-cooker red lentil dhal | BEGINNER |

All 5 are the first pressure-cooker recipes in the library — a section with
49 in-scope candidates and zero coverage across batches 003-005. The
`pressure-cooker-chicken-stock` row is marked `foundational: true`.

---

## Drafted but not uploaded (Caribbean, 5)

These briefs exist in `docs/bulk-batch-006-briefs/`, passed voice-check clean,
and are ready to upload once the schema state is reconciled:

| Slug | Title | Difficulty |
|------|-------|------------|
| curry-chicken | Jamaican curry chicken | BEGINNER |
| brown-stew-chicken | Jamaican brown stew chicken | BEGINNER |
| callaloo | Callaloo | BEGINNER |
| ropa-vieja | Ropa vieja | INTERMEDIATE |
| picadillo | Cuban picadillo | BEGINNER |

---

## Difficulty mix (published only)

- BEGINNER: 5 (100%)
- INTERMEDIATE: 0
- ADVANCED: 0

The planned 25-recipe slice would have hit ~72% BEGINNER / 28% INTERMEDIATE.
The published 5 are all BEGINNER because the pressure-cooker slice was
beginner-weighted by design.

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

1. **Schema state must be reconciled before another cooking fire runs
   meaningfully.** The migration `20260619000000_phase_categories_targets_001`
   needs to be applied to the live database, OR the schema needs to be
   reverted to match the deployed state. Both are outside cooking-bulk scope.

2. **The 5 Caribbean drafts in `docs/bulk-batch-006-briefs/` can be picked
   up by the next fire** — they are clean and ready to upload. The fire's
   no-double-fire check should detect them and incorporate them into batch
   006 rather than starting batch 007.

3. **Concurrent autopilot fires across streams should be gated.** All three
   autopilot streams (cooking 02:00, baking 04:10, mindset 06:06) fired
   within a minute of each other today because the wire-up commit went in
   moments before their daily windows. If two streams modify the schema
   concurrently and a third tries to use it, the third fails. A cross-stream
   lock — even a simple "another stream is mutating shared files" check —
   would prevent this.

---

## Running totals (cooking)

| Batch | Recipes |
|-------|---------|
| 001 | 100 |
| 002 | 31 |
| 003 | 50 |
| 004 | 50 |
| 005 | 50 |
| **006 (partial)** | **5** |
| Cumulative published (from raw SQL count) | **484** |

Difference between sum-of-batches (286) and cumulative (484) is accounted
for by anchor tutorials, the pilot-10 batch, and personal-recipes imports
that pre-date the bulk numbering.
