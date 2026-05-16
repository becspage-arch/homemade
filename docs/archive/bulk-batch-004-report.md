# Batch 004 — Report

**Date:** 2026-05-16  
**Model:** Sonnet 4.6  
**Session type:** Two-part (context overflow between parts)

---

## Summary

50 cooking recipes published across new cuisine and method territories not covered in batches 001–003.

---

## Cuisine / territory breakdown

| Territory | Count | Slugs |
|-----------|-------|-------|
| Mediterranean — Greek | 4 | pastitsio, kleftiko, gigantes-plaki, avgolemono-soup |
| Mediterranean — Spanish | 4 | patatas-bravas, gambas-al-ajillo, albondigas-en-salsa, pisto-manchego |
| Middle Eastern | 6 | shakshuka, mujadara, kafta-meatballs, khoresh-fesenjan, muhammara, fattoush |
| Anglo-Indian | 6 | chicken-tikka-masala, chicken-korma, lamb-dhansak, onion-bhaji, mulligatawny-soup, tandoori-chicken |
| North African | 3 | harira-soup, chermoula-sea-bass, moroccan-carrot-salad |
| Caribbean | 3 | jerk-chicken, rice-and-peas, escovitch-fish |
| Eastern European | 3 | hungarian-goulash, borscht, pierogi |
| Air-fryer | 6 | air-fryer-chips, air-fryer-chicken-thighs, air-fryer-salmon, air-fryer-cauliflower-steaks, air-fryer-halloumi, air-fryer-pork-belly |
| Slow-cooker | 6 | slow-cooker-beef-stew, slow-cooker-pulled-pork, slow-cooker-chicken-cacciatore, slow-cooker-lamb-shanks, slow-cooker-butter-chicken, slow-cooker-vegetable-soup |
| Preserves | 5 | strawberry-jam, lemon-curd, quick-pickled-red-onions, orange-marmalade, chilli-jam |
| Desserts (non-baking) | 4 | creme-brulee, panna-cotta, chocolate-mousse, lemon-posset |
| **Total** | **50** | |

---

## Difficulty split

| Level | Count | % |
|-------|-------|---|
| BEGINNER | 44 | 88% |
| INTERMEDIATE | 6 | 12% |
| ADVANCED | 0 | 0% |

Intermediate recipes: pastitsio, khoresh-fesenjan, chicken-tikka-masala, chicken-korma, lamb-dhansak, orange-marmalade.

---

## Voice-check stats

- Recipes passing first-pass voice-check (warnings only): **36 / 50** (72%)
- Recipes requiring fixes: **14 / 50** (28%)
- Recipes dropped: **0**

All 14 failures were errors, not dropped. All fixed before upload. No recipe took more than one fix round.

---

## Error patterns (batch 004)

### 1. Appositive em-dash pairs (most frequent — 12 instances)

The dominant error across the batch. An appositive phrase enclosed in em-dashes — "— phrase —" — always triggers the em-dash-paragraph block (2 em-dashes in one paragraph). Fix: convert to parentheses "(phrase)" or restructure. This pattern appeared in:

- `sourceNotes` fields (e.g., "— escaped enslaved people —", "— dried ground sumac berries —")
- `body` paragraphs (e.g., "— the meal that breaks the fast at sunset —", "— carefully, the steam is very hot —")
- `excerpt` fields
- Troubleshooter `cause` fields

All instances already covered by the two existing common-issues.md em-dash entries. No new entry added.

### 2. Banned phrase "genuinely" (2 instances)

Appeared in `pastitsio` excerpt and `gigantes-plaki` troubleshooter fix text. Also caught in a draft excerpt for `air-fryer-salmon` before upload. Fix: delete the word.

### 3. Banned phrase "honest" (1 instance)

"The honest answer" in `shakshuka` sourceNotes. Fix: replaced with "the dish belongs to all of them."

### 4. Multiple em-dashes in closing paragraph (3 instances)

`patatas-bravas`, `avgolemono-soup`, and `strawberry-jam` each had 2 em-dashes in a single long closing paragraph. Fix: convert second em-dash to colon, semicolon, or parentheses.

---

## Slug gaps surfaced

- **No `blowtorch` tool slug** — `creme-brulee` references a blowtorch in method but cannot include it as a recipeTools entry. Tool is mentioned in method prose only.
- **No `savoiardi` (ladyfinger) ingredient slug** — tiramisu was avoided in favour of lemon posset for this reason (confirmed gap from batch 001 notes).
- **No `jam-sugar` or `preserving-sugar` slug** — used `granulated-sugar` for jam-making recipes. Technically acceptable (standard granulated sugar works for all these preserves).

---

## Observations

- Air-fryer and slow-cooker recipes are the most uniform in structure (preheat + cook + troubleshoot). They generated the fewest errors of any group.
- Preserves recipes have more structural variation (jars, setting tests, storage notes) and produced slightly more warnings from the voice-check's tricolon rule.
- The `subCategorySlug: "preserves"` field works correctly — all 5 preserves uploaded as `cooking / preserves` in the category display.
- Caribbean recipes (jerk-chicken, escovitch-fish, rice-and-peas) were very clean. The cuisine is well-defined and the recipes have few opportunities for appositive em-dash traps.

---

## Running totals

| Batch | Recipes | Cumulative |
|-------|---------|------------|
| 001 | 100 | ~100 |
| 002 | 31 | ~131 |
| 003 | 50 | ~181 |
| 004 | 50 | **~231** |

Plus ~215 personal-recipes in DRAFT status (not published).
