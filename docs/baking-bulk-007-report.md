# Baking bulk-007 — batch report

**Date:** 2026-05-18  
**Session type:** autopilot-queue (scheduled)  
**Model:** claude-sonnet-4-6

## Result

40 entries PUBLISHED (36 CREATED, 4 UPDATED). 0 failed.  
Baking total: 348 → 384 PUBLISHED.

## Sub-category breakdown

| Sub-category | Count | New | Updated |
|---|---:|---:|---:|
| cakes | 16 | 15 | 1 |
| pies | 8 | 8 | 0 |
| biscuits | 8 | 6 | 2 |
| bread | 7 | 6 | 1 |
| pastries | 1 | 1 | 0 |
| **Total** | **40** | **36** | **4** |

## Difficulty split (all 40)

20 BEGINNER / 19 INTERMEDIATE / 1 ADVANCED

## Updated entries (pre-existing, re-uploaded with new brief)

- `brown-butter-chocolate-chip-cookies` (id: cmpa6epxz0001s0v4ug9uz21w)
- `sourdough-country-loaf` (id: cmp87mgch0002dcv40didpd7l)
- `vegan-chocolate-cake` (id: cmp5nydl70000akv4w8ral09q)
- `vegan-chocolate-chip-cookies` (id: cmp5ob0xg00008gv49i6fqjmc)

## Voice-check

**Errors fixed before upload (1 file):**
- `pane-di-casa.json` — 2 banned phrases: "honest" (excerpt) and "genuinely" (body). Both rewritten.

**Warnings only — no fix required (7 files):**
- `almond-flourless-cake` — tricolon in excerpt
- `apple-pear-pie` — tricolon ×2 (heading + paragraph)
- `mini-cheesecakes` — tricolon in excerpt + brand name "Philadelphia" in sourceNotes (historical attribution, appropriate context)
- `pane-di-casa` — tricolon in heading (after banned-phrase fix)
- `pepparkakor` — tricolon in sourceNotes + "Target" false-positive (common word, not brand reference)
- `sable-breton` — "zucchini" Americanism in sourceNotes (book title: Clotilde Dusoulier's *Chocolate and Zucchini*)
- `sourdough-country-loaf` — tricolon in heading

All others: clean.

## Glossary terms created (5 new)

| Term | Slug | Created in |
|---|---|---|
| biga | `biga` | ciabatta-biga |
| twaróg | `twarog` | polish-sernik |
| alkaline wash | `alkaline-wash` | soft-pretzel-soda |
| bulk ferment | `bulk-ferment` | sourdough-country-loaf |
| flax egg | `flax-egg` | vegan-carrot-cake |

## Existing glossary terms referenced

`autolyse`, `enriched-dough`, `beurre-noisette`, `twice-baked`, `bain-marie`, `glace-icing`, `ganache`, `blind-baking`

## Notable entries

- **Polish sernik** — proper Polish cheesecake with quark and shortcrust base; twaróg glossary term added. `season: WINTER`.
- **Vegan cashew cheesecake** — no-bake, served from frozen. `dietaryFlags: [VEGAN]`, `chillingMinutes: 480`.
- **Sourdough country loaf** — ADVANCED, LEVAIN, 73% hydration. Pre-existing entry now has full brief; `bulk-ferment` glossary term added.
- **Lardy cake** — traditional British enriched bread with `laminationFolds: 3`. `preFermentType: NONE`, lard+sultanas layered.
- **Ciabatta with biga** — 80% hydration, `preFermentType: BIGA`, 2 loaves; `biga` glossary term added.
- **Pane di casa** — foundational Italian white bread, `foundational: true`, `preFermentType: NONE`.
- **Almond flourless cake** — `dietaryFlags: [GLUTEN_FREE]`, bain-marie chocolate melt.

## Dietary flags

- VEGAN: vegan-carrot-cake, vegan-chocolate-cake, vegan-chocolate-chip-cookies, vegan-brownies, vegan-cheesecake-cashew (5 entries)
- GLUTEN_FREE: almond-flourless-cake (1 entry)

## Brief files

`docs/baking-bulk-007-briefs/` — 40 JSON files.
