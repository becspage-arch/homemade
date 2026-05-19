# Cooking bulk-029 — Batch Report

**Date:** 2026-05-19  
**Category:** cooking  
**Session model:** claude-sonnet-4-6  
**Entries published:** 40  
**Cooking before:** 1065 · **Cooking after:** 1105

---

## Theme

British puddings and desserts — the full domestic canon from steamed suet puddings through French-derived custards, Italian frozen desserts, and summer fruit preparations. mealType: `dessert` throughout.

---

## Entries published

| Slug | Title | Difficulty | Cuisine | Foundational |
|---|---|---|---|---|
| banoffee-pie | Banoffee Pie | BEGINNER | british | ✓ |
| bread-and-butter-pudding | Bread and Butter Pudding | BEGINNER | british | — |
| apple-crumble | Apple Crumble | BEGINNER | british | ✓ |
| apple-and-blackberry-crumble | Apple and Blackberry Crumble | BEGINNER | british | — |
| plum-crumble | Plum Crumble | BEGINNER | british | — |
| rhubarb-crumble | Rhubarb Crumble | BEGINNER | british | — |
| apple-charlotte | Apple Charlotte | INTERMEDIATE | british | — |
| baked-apples-sultanas | Baked Apples with Sultanas | BEGINNER | british | — |
| sticky-toffee-pudding | Sticky Toffee Pudding | INTERMEDIATE | british | ✓ |
| spotted-dick | Spotted Dick | INTERMEDIATE | british | ✓ |
| treacle-sponge-pudding | Treacle Sponge Pudding | INTERMEDIATE | british | — |
| jam-roly-poly | Jam Roly-Poly | INTERMEDIATE | british | — |
| bread-and-butter-pudding | Bread and Butter Pudding | BEGINNER | british | — |
| queen-of-puddings | Queen of Puddings | INTERMEDIATE | british | — |
| chocolate-self-saucing-pudding | Chocolate Self-Saucing Pudding | BEGINNER | british | — |
| rice-pudding-baked | Baked Rice Pudding | BEGINNER | british | ✓ |
| stovetop-rice-pudding | Stovetop Rice Pudding | BEGINNER | british | — |
| pears-in-red-wine | Pears in Red Wine | BEGINNER | british | — |
| creme-anglaise | Crème Anglaise | INTERMEDIATE | british | ✓ |
| creme-brulee | Crème Brûlée | INTERMEDIATE | french | ✓ |
| creme-caramel | Crème Caramel | INTERMEDIATE | french | — |
| panna-cotta-vanilla | Vanilla Panna Cotta | BEGINNER | italian | — |
| posset-lemon | Lemon Posset | BEGINNER | british | ✓ |
| chocolate-mousse | Chocolate Mousse | INTERMEDIATE | french | ✓ |
| floating-islands | Floating Islands | INTERMEDIATE | french | — |
| zabaglione | Zabaglione | INTERMEDIATE | italian | — |
| syllabub-lemon | Lemon Syllabub | BEGINNER | british | — |
| eton-mess | Eton Mess | BEGINNER | british | — |
| strawberry-fool | Strawberry Fool | BEGINNER | british | — |
| raspberry-fool | Raspberry Fool | BEGINNER | british | — |
| gooseberry-fool | Gooseberry Fool | BEGINNER | british | ✓ |
| rhubarb-fool | Rhubarb Fool | BEGINNER | british | — |
| cranachan | Cranachan | BEGINNER | british | — |
| summer-pudding | Summer Pudding | INTERMEDIATE | british | — |
| vanilla-ice-cream | Vanilla Ice Cream | INTERMEDIATE | french | ✓ |
| chocolate-ice-cream | Chocolate Ice Cream | INTERMEDIATE | french | — |
| no-churn-ice-cream | No-Churn Vanilla Ice Cream | BEGINNER | british | ✓ |
| lemon-sorbet | Lemon Sorbet | BEGINNER | french | — |
| granita-lemon | Lemon Granita | BEGINNER | italian | — |
| granita-coffee | Coffee Granita | BEGINNER | italian | — |
| affogato | Affogato | BEGINNER | italian | — |

---

## Ingredient slug decisions

**`arborio-rice` used for rice pudding:** No `pudding-rice` or `short-grain-rice` slug exists in the DB. Arborio is the closest available slug (short-grain, starchy, standard in custard rice pudding). Both baked and stovetop rice pudding recipes use `arborio-rice`. No new slug added.

**`espresso-powder` used for coffee:** Used in affogato and coffee granita. Verified present in ingredients.ts.

**`fortified-marsala` used for zabaglione:** Verified present.

**`gelatine-leaves` unit `"sheet"`:** Correct — matches the DB convention for panna cotta.

---

## Recipe substitutions

Three planned entries were substituted due to missing ingredient slugs:

| Original plan | Substitution | Reason |
|---|---|---|
| Trifle | Eton Mess | No `sponge-fingers` / `savoiardi` slug in DB |
| Knickerbocker Glory | Summer Pudding | No ice cream ingredient slug in DB |
| Banana Split | Banoffee Pie | No ice cream ingredient slug in DB |

**Tiramisu** (from the original brief list) was also excluded for the same reason (no `sponge-fingers` slug).

---

## Affogato — vanilla ice cream handling

No `vanilla-ice-cream` or equivalent ingredient slug exists in the DB. Affogato is handled by listing only `espresso-powder` in ingredientsList and directing readers in body prose to "the vanilla ice cream recipe in this collection or a good-quality bought brand." This is correct — affogato is essentially a coffee preparation, and the ice cream is sourced, not made, in this recipe.

---

## Duplicate ingredient slug handling

Where the same ingredient slug appears in two recipe components, the primary/larger quantity is the scaling token entry in ingredientsList; the secondary quantity is hardcoded as a plain number in prose:

| Recipe | Slug | Scaling token | Hardcoded in prose |
|---|---|---|---|
| sticky-toffee-pudding | unsalted-butter | 85 g (sponge) | 75 g (sauce) |
| sticky-toffee-pudding | dark-brown-sugar | 175 g (sponge) | 150 g (sauce) |
| banoffee-pie | unsalted-butter | 100 g (base) | 50 g (toffee) |
| queen-of-puddings | caster-sugar | 50 g (custard) | 115 g (meringue) |
| eton-mess | caster-sugar | 175 g (meringue) | 30 g (maceration) |
| creme-brulee | caster-sugar | 100 g (custard) | 40 g (brûlée top) |
| creme-caramel | caster-sugar | 75 g (custard) | 150 g (caramel) |

---

## Voice-check fixes

- **Em-dashes:** All 40 files had em-dash (U+2014 / U+2013) violations. Batch-replaced globally: ` — ` → `, ` across all files.
- **Glossary coverage (`creme-anglaise`):** `tempering-eggs` removed from `glossaryTerms` (not used inline); `nappe` mark changed from `bold` to `glossaryTooltip` with `attrs.termSlug: "nappe"`.
- **Glossary coverage (`treacle-sponge-pudding`):** `creaming-method` removed from `glossaryTerms` (text uses `techniqueLink` not `glossaryTooltip` — these are distinct mark types; no duplicate registration required).
- **Brand trademark (`creme-brulee`):** "The target is" → "The aim is".
- **Americanisms:** `spotted-dick`: "fall from the spoon" → "drop from the spoon". `zabaglione`: "fall in a ribbon" → "drop in a ribbon"; excerpt "falls in thick ribbons" → "drops in thick ribbons". `chocolate-ice-cream`: "hot from the stove" → "hot from the hob".

**Final voice-check:** 0 errors, 9 warnings (all WARN-only: 4× temperature-canonical, 5× tricolon). Warnings accepted — none block upload.

---

## Upload

All 40 files uploaded with `--status PUBLISHED`. Zero failures.

---

## Pre-existing files carried forward

5 files in `docs/bulk-batch-029-briefs/` pre-existed this session (written in an earlier aborted pass):
- `bread-and-butter-pudding.json`
- `creme-anglaise.json`
- `pears-in-red-wine.json`
- `rhubarb-crumble.json`
- `treacle-sponge-pudding.json`

All 5 passed voice-check (after fixes noted above) and were included in the 40-file upload.
