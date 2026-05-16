# Baking bulk-001 batch report

**Date:** 2026-05-16
**Session model:** claude-sonnet-4-6 (worker)
**Briefs directory:** `docs/baking-bulk-001-briefs/`
**Status on landing:** PUBLISHED

---

## What landed

50 RECIPE rows published across all 8 baking sub-categories.

| Sub-category | Slugs | Count |
|---|---|---|
| `bread` | sourdough-country-loaf, malted-granary-loaf, rye-and-caraway-loaf, ciabatta-high-hydration, brioche-loaf, flatbreads-yeasted, milk-bread-tangzhong, english-muffins-griddle, parker-house-rolls, bara-brith | 10 |
| `cakes` | coffee-and-walnut-cake, carrot-cake-layered, marble-loaf-cake, banana-bread-loaf, orange-and-almond-cake-flourless, dundee-cake, gingerbread-loaf-dark, battenberg-cake, swiss-roll-jam-cream, sticky-toffee-traybake | 10 |
| `pastries` | chocolate-eclairs, profiteroles, apple-turnovers, pear-frangipane-tart, custard-tart-english | 5 |
| `pies` | apple-pie-double-crust, lemon-meringue-pie, quiche-lorraine, chicken-and-mushroom-pie, pork-pie-hot-water-crust | 5 |
| `biscuits` | digestive-biscuits-homemade, ginger-biscuits, jammy-dodgers, biscotti-almond, florentines, oat-flapjacks | 6 |
| `scones` | fruit-scones-currant, cheese-scones-cheddar, herb-and-parmesan-scones, drop-scones-scottish | 4 |
| `sweets-confectionery` | fudge-vanilla, scottish-tablet, marshmallows-vanilla, peanut-brittle, nougat-soft-honey | 5 |
| `cake-decorating` | fondant-covering-layer-cake, piped-buttercream-rose | 2 |
| `other` | sausage-rolls, cheese-straws | 2 |

**Difficulty spread:** 8 BEGINNER / 31 INTERMEDIATE / 11 ADVANCED

---

## New master-table additions

### Ingredients (20 new)

`apricot-jam`, `black-pepper-ground`, `blanched-almonds`, `chestnut-mushrooms`, `chicken-stock`, `chicken-thighs-boneless`, `dried-currants`, `flaked-almonds`, `glucose-syrup`, `lardons`, `light-muscovado-sugar`, `pear-conference`, `raspberry-jam`, `rolled-oats`, `sage-dried`, `sausage-meat`, `soft-brown-sugar`, `thyme-dried`, `thyme-fresh`, `vanilla-bean-paste`

### Tools (19 new)

From previous-session seeding (12): `deep-pie-dish`, `serrated-knife`, `pastry-cutter`, `saucepan-large`, `saucepan-medium`, `piping-nozzle-round`, `griddle`, `saucepan-small`, `palette-knife`, `square-baking-tin`, `loose-bottomed-tart-tin`, `meat-thermometer`

From this session (7): `cake-turntable`, `cake-smoother`, `kitchen-torch`, `bun-tin`, `piping-nozzle-star`, `piping-nozzle-petal`, `flower-nail`

---

## Errors encountered and fixed

### Em-dash appositive pairs in `sourceNotes` (15 files)

The voice-check CLI treats `— text —` as an ERROR (appositive-pair). This pattern appeared extensively in `sourceNotes` where the drafter had used em-dash pairs to offset clause subjects, e.g. `"Mrs Beeton — the canonical Victorian source — documents…"`. Fixed by rewriting as colons, parentheses, or continuous prose. Automated via `fix-emdash.js`.

### Em-dash appositive pairs in body content (17 files)

Same pattern appeared in paragraph nodes and glossary definitions. Fixed by same script.

### Split-node em-dash pair (profiteroles)

One em-dash pair straddled TipTap text node boundaries, split by a `glossaryTooltip` mark: `"— a simple [ganache] —"`. The fix script couldn't detect it as a single string. Fixed manually by converting the first `—` to `(` in its text node and the second `—` to `)` in the following text node. Also revealed a secondary issue: the closing `"` was accidentally removed from the first text node, producing invalid JSON. Fixed by restoring it.

### Two separate em-dashes in one paragraph (9 files)

The voice-check also blocks paragraphs containing 2+ em-dashes even if they're not a matching pair (separate clauses in one block). Found 9 paragraphs after em-dash-pair removal. Fixed by converting one em-dash per paragraph to parentheses or a colon.

### Banned phrase "genuinely" (6 files)

`genuinely` is a blocked word. Replaced with `truly`, `properly`, `well and truly`, or restructured.

### Lowercase season enum values (8 files)

Prisma `Season` enum requires `AUTUMN`/`WINTER`/`SPRING`/`SUMMER`. Files had lowercase (`autumn`, `winter`). Fixed in `apple-turnovers.json`, `dundee-cake.json`, `gingerbread-loaf-dark.json` and 5 others.

### Sub-category slug typo for confectionery (5 files)

The correct slug is `sweets-confectionery`, not `confectionery`. Fixed in all 5 confectionery recipe files.

### Missing ingredient slugs (20)

Upload script validates against the master table. All 20 added to `packages/db/scripts/data/ingredients.ts` (worktree) and reseeded.

### Missing tool slugs (19)

12 tools added and seeded in the first pass; 7 more added and seeded in the second pass after the second upload run surfaced them.

### Bash path variable expansion failure

`run-uploads.sh` using `winpath="${WINDIR}\\${base}.json"` produced the literal string `${base}` in paths. Cause: double-backslash handling in bash + Windows paths. Replaced with `run-uploads.js` (Node.js `child_process.execSync`), which handles Windows paths correctly.

### Worktree vs. main-repo tools.ts confusion

Initial seeder runs edited the main repo's `packages/db/scripts/data/tools.ts` and ran the seeder from the main repo context. Subsequent seeder runs from the worktree context read the worktree's `tools.ts` (181 entries, unchanged). Fixed by editing the worktree's `tools.ts` and running the seeder from the worktree.

---

## Upload run summary

| Run | OK | FAIL | Notes |
|---|---|---|---|
| 1 | 0 | 50 | All failed — em-dash pairs in sourceNotes |
| 2 | 0 | 50 | Em-dash pairs in body; banned phrase; missing ingredients/tools; season enum; confectionery subcat slug |
| 3 | 46 | 4 | 4 failed — missing tool slugs (cake-turntable, cake-smoother, kitchen-torch, bun-tin, piping-nozzle-star, piping-nozzle-petal, flower-nail) |
| 4 | 50 | 0 | Final — all 50 PUBLISHED |

---

## Patterns to carry forward

1. **Em-dash pairs in `sourceNotes` are the highest-risk location.** Authors naturally use em-dash pairs to offset sources: `"Beeton — the Victorian authority — documents…"`. Run `fix-emdash.js` (or equivalent) before any upload attempt on a new batch.

2. **Season enum must be uppercase.** `AUTUMN`, `WINTER`, `SPRING`, `SUMMER` — not lowercase. Add to brief template.

3. **Sub-category slug for confectionery is `sweets-confectionery`.** Not `confectionery`. The seed data slug is the canonical reference; look it up before authoring a confectionery brief.

4. **Tool slugs use specific naming conventions.** `saucepan-medium` not `medium-saucepan`. `piping-nozzle-round` not `round-piping-nozzle`. Always look up the exact slug in `packages/db/scripts/data/tools.ts` when the tool is plausibly new; don't guess.

5. **Two tools tables exist in play.** The worktree's `tools.ts` is what the seeder reads when run from the worktree. Edits to the main repo's `tools.ts` are not picked up by the worktree seeder.

6. **Split-node em-dash pairs are invisible to string-level fix scripts.** A `glossaryTooltip` mark breaking a sentence containing an em-dash pair requires a manual JSON edit.
