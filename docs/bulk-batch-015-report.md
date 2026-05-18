# Bulk batch 015 — cooking — report

**Date:** 2026-05-18
**Category:** cooking
**Status:** 40/40 PUBLISHED

## Composition

| Group | Recipes | Count |
|---|---|---|
| Italian pasta | bucatini-allamatriciana, linguine-al-granchio, orecchiette-con-cime-di-rapa, pappardelle-al-ragu-di-anatra, penne-alla-boscaiola, penne-alla-vodka, pici-cacio-e-pepe, spaghetti-alla-gricia, spaghetti-alle-cozze, spaghetti-al-limone, spaghetti-al-tonno, tagliatelle-al-ragu-bolognese | 12 |
| Italian risotto | risotto-agli-asparagi, risotto-al-gorgonzola, risotto-alla-zucca, risotto-alle-cozze, risotto-al-limone, risotto-con-piselli | 6 |
| Italian meat & chicken | pollo-al-limone, pollo-alla-diavola, pollo-alla-pizzaiola | 3 |
| Italian fish & seafood | acqua-pazza, branzino-al-forno, fritto-misto-di-mare, zuppa-di-pesce-italiana | 4 |
| Italian other | arancini-al-ragu, insalata-di-rinforzo, pappa-al-pomodoro, pici-cacio-e-pepe, polenta-con-ragu, ravioli-di-ricotta-e-spinaci, sigara-boregi | 7 |
| Turkish | adana-kebabi, coban-salatasi, ezogelin-corbasi, iskender-kebab, karniyarik, manti, patlican-salatasi, pide-kiymali, yayla-corbasi | 9 |

**Difficulty split:** 27 BEGINNER, 13 INTERMEDIATE

## Voice-check issues found

**Em-dash violations (27/40 files affected):**
All occurrences were double em-dash pairs used as parenthetical asides (e.g. `— phrase —`). Fixed by replacing pairs with parentheses `(phrase)` or restructuring. Max 1 em-dash per paragraph is the rule.

Em-dashes appeared in:
- `sourceNotes` (11 files): citation-style prose tends to accumulate them
- `body > paragraph[0]` or `[1]` (intro paragraphs, 6 files): descriptive appositions
- `body > paragraph[13–18]` ("Where this dish lives", most files): editorial prose heavy with subordinate clauses

**Banned phrases (4 files):**
- `genuinely` → replaced with `unmistakably`, `actually`, or removed (penne-alla-vodka, pollo-alla-pizzaiola, risotto-al-limone)
- `essentially` → removed (pici-cacio-e-pepe)
- `honest` → `simple` (pollo-alla-pizzaiola)

**Americanisms (2 warnings, not errors):**
- `shrimp` → `prawn` (fritto-misto-di-mare body)
- `broiler` → warning only, left as-is (patlican-salatasi)

**Servings-yield conflicts (3 files):**
- arancini-al-ragu (servings: 4, yieldDescription: "12 arancini") → set servings to null
- pide-kiymali (servings: 4, yieldDescription: "4 pide") → set servings to null
- sigara-boregi (servings: 4, yieldDescription: "16 to 20 cigars") → set servings to null

## Ingredient slug corrections

Many slugs used generic names not in the master table. All corrected:

| Used in JSON | Correct DB slug | Files affected |
|---|---|---|
| `risotto-rice` | `arborio-rice` | 6 risotto + arancini + yayla-corbasi (8) |
| `vegetable-stock` | `stock-vegetable` | 8 files |
| `paprika` | `paprika-sweet` | 7 Turkish files |
| `cumin` | `cumin-ground` | 4 Turkish files |
| `shallots` | `shallot` | 5 risotto files |
| `chicken-thighs` | `chicken-thigh` | 2 pollo files |
| `green-pepper` | `pepper-green` | 3 Turkish files |
| `flatbread` | `pitta-bread` | 2 Turkish files |
| `dried-oregano` | `oregano-dried` | pollo-alla-pizzaiola |
| `dried-yeast` | `yeast-fast-action` | pide-kiymali |
| `basil-fresh` | `basil` | pappa-al-pomodoro |
| `mint-fresh` | `mint` | risotto-con-piselli |
| `bulgur` | `bulgur-wheat` | ezogelin-corbasi |
| `white-fish-fillets` | `cod-fillet` | acqua-pazza, zuppa-di-pesce |

**Tool slug corrections:**
| Used in JSON | Correct DB slug | Files affected |
|---|---|---|
| `roasting-tin` | `roasting-pan` | branzino-al-forno, pollo-alla-diavola, karniyarik |

**New ingredients added to DB (4):**
- `whitebait` (fish) — fritto-misto-di-mare
- `spinach-frozen` (vegetable) — ravioli-di-ricotta-e-spinaci
- `mint-dried` (herb) — ezogelin-corbasi, manti, yayla-corbasi
- `ciabatta` (grain) — pappa-al-pomodoro

## Patterns for common-issues.md

- **Em-dash pairs are the dominant voice-check failure** (27/40). The rule allows 1 per paragraph; authors habitually use pairs for appositions. Fix: always use `(phrase)` instead of `— phrase —` when you would use 2 em-dashes.
- **Turkish recipe slugs diverge from DB conventions**: paprika → `paprika-sweet`, cumin → `cumin-ground`, flatbread → `pitta-bread`. Use these preflight.
- **Risotto slugs**: `risotto-rice` doesn't exist; DB has `arborio-rice` and `carnaroli-rice`. Same applies to `vegetable-stock` → `stock-vegetable`, `shallots` → `shallot`.
- **Servings vs yieldDescription**: discrete-item yields (arancini, börek, pide) must use only `yieldDescription`; set `servings` to null.
