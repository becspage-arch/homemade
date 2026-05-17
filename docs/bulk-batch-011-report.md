# Cooking bulk-batch-011 — report

**Date:** 2026-05-17  
**Model:** Claude Sonnet 4.6 (worktree loop session)  
**Session type:** Loop continuation (context overflow from prior session)

## Outcome

15 recipes PUBLISHED. Cooking category now at **527 PUBLISHED** (per live DB query after batch).

3 new entries created, 12 existing entries refreshed with voice-checked content:

| Slug | Cuisine | Status | Notes |
|---|---|---|---|
| spaghetti-carbonara | italian | UPDATED | |
| spaghetti-aglio-olio | italian | CREATED | |
| spaghetti-alla-puttanesca | italian | UPDATED | |
| risotto-ai-funghi-porcini | italian | UPDATED | |
| spaghetti-al-pomodoro | italian | UPDATED | |
| boeuf-bourguignon | french | UPDATED | |
| coq-au-vin | french | UPDATED | |
| moules-marinieres | french | CREATED | |
| ratatouille | french | UPDATED | |
| chicken-korma | british-indian | UPDATED | |
| tarka-dhal | british-indian | CREATED | |
| chana-masala | british-indian | UPDATED | |
| cottage-pie | british | UPDATED | |
| shepherds-pie | british | UPDATED | |
| fish-and-chips | british | UPDATED | |

## Difficulty mix

- BEGINNER: 12 (80%)
- INTERMEDIATE: 3 — risotto-ai-funghi-porcini, boeuf-bourguignon, fish-and-chips (20%)

## Cuisine families covered

- Italian: 5 (pasta-focussed — all four canonical dry-pasta shapes + risotto)
- French: 4 (boeuf bourguignon, coq au vin, moules marinières, ratatouille)
- British-Indian: 3 (chicken korma, tarka dhal, chana masala)
- British: 3 (cottage pie, shepherd's pie, fish and chips)

## New ingredients seeded

`dried-chilli` and `amchur` added to `packages/db/scripts/data/ingredients.ts` and seeded (641 ingredients total; 8 new on the seed run preceding this batch).

## New glossary terms created

- `amchur`, `chana` (chana-masala)
- `dhal` (tarka-dhal)
- `beer-batter`, `blanching-chips` (fish-and-chips; `blanching-chips` was in the brief as "Parboiling (chips)")
- `cottage-pie` (cottage-pie)
- `shepherds-pie` (shepherds-pie)

Previously existing: `korma`, `bhunao`, `mantecatura`, `puttanesca`, `aglio`, `risotto`, `tarka`, and others.

## Voice-check outcomes

- First-pass clean: boeuf-bourguignon (1 warning — tricolon), coq-au-vin, ratatouille, moules-marinieres (after yieldDescription null fix)
- Required fixes: chicken-korma (10 errors — em-dash pairs in excerpt/sourceNotes/body + banned "genuinely"), tarka-dhal (3 errors — em-dash pairs in sourceNotes + last paragraph), chana-masala (2 errors — double em-dash in troubleshooter), cottage-pie (3 errors — "genuinely" + double em-dash in closing paragraph), shepherds-pie (5 errors — em-dash pair in excerpt + "genuinely" + 3 em-dashes in closing paragraph), fish-and-chips (2 errors — em-dash pair in sourceNotes)

## Slug fixes

**Ingredient slugs corrected across briefs:**
`bay-leaf` → `bay-leaves`, `plain-yoghurt` (was `yoghurt-full-fat`), `ginger-root` (was `ginger-fresh`), `coriander-ground` (was `ground-coriander`), `cumin-ground` (was `ground-cumin`), `turmeric` (was `ground-turmeric`), `cardamom-green` (was `cardamom-pods`), `coriander` (was `coriander-fresh`), `red-lentils` (was `lentils-red-split`), `rosemary` (was `rosemary-fresh`), `potato` (was `potatoes-floury`), `beer` (was `beer-lager`), `stock-chicken` (was `stock-lamb` in shepherd's pie), `almonds-flaked` (was `flaked-almonds`).

**Tool slugs corrected:**
`dutch-oven` (was `large-casserole`), `frying-pan-30` (was `large-frying-pan`), `masher` (was `potato-masher`), `rectangular-baking-tin` (was `baking-dish`), `instant-read-thermometer` (was `digital-thermometer`).

## Pattern notes

- Double em-dash pair `— X —` (appositive parenthetical) is the most persistent voice error across this cuisine grouping — it tends to appear in excerpt, sourceNotes, and the "Where this dish lives" section. Fix pattern: convert to parentheses `(X)` or a colon.
- `"genuinely"` continues to slip through, particularly in instructions about cooking time/colour/doneness. Standard replacement: "properly" or "a deep [colour]".
- Ingredient slugs in British-Indian recipes are the most error-prone because the canonical slug forms differ from the culinary names authors reach for (e.g. `cumin-ground` not `ground-cumin`).
