# Personal recipes QC + publish report

Generated 2026-05-16. Full rubric QC pass over all 215 personal recipe
DRAFTs from the May 2026 redo session, with auto-fixes applied and every
recipe transitioned DRAFT → PUBLISHED.

## Summary

| Metric | Count |
|---|---|
| Total cooking DRAFTs processed | 215 |
| Published (DRAFT → PUBLISHED) | 215 |
| Flagged for Rebecca review | 0 |
| Upload failures | 0 |
| **Total auto-fixes applied** | **457** |
| — servings set from ingredientsList.defaultServings | 193 |
| — temperatureCelsius extracted from method text | 47 |
| — makeAheadNotes extracted from body section | 215 |
| — freezable + freezeNotes updated from body text | 0 |
| — cuisine corrected (chicken-katsu-curry: chinese → japanese) | 1 |
| Voice-check: 0 blocking errors | ✓ |
| Voice-check warnings (non-blocking, mostly tricolons in her prose) | 107 recipes |
| Master-list additions this session | 0 |
| New `tools.ts` entries | 0 |

All 215 personal recipes are now live at their public URLs
(`/cooking/<slug>`).

---

## What was checked (rubric)

**Schema:** `type === RECIPE` ✓ all 215

**Servings / yield:** 193 recipes had `servings: null, yieldDescription: null` —
the redo session left both null because the hybrid pipeline templated
metadata at category level, not per-recipe. Fixed by extracting
`ingredientsList.defaultServings` from each body. 22 recipes already had
servings or yieldDescription set from the source docx.

**Time consistency:** `totalMinutes` recomputed from `prep + cook + rest +
chilling` where the stored value differed by more than 2 minutes. Minor
rounding artefacts corrected.

**TemperatureCelsius:** 47 oven recipes were missing the canonical °C value
despite having method steps that explicitly stated the oven temperature.
Fixed by scanning method text for patterns like "180C / 350F / Gas 4" and
extracting the Celsius value. Recipes with no oven tool in `recipeTools`
were left at null (correct — they don't need it).

**Cuisine:** `chicken-katsu-curry` had `cuisine: "chinese"` — corrected to
`"japanese"`. All other cuisine assignments verified consistent with dish
type. Title-keyword checks ran across the full corpus; no other
mismatches found.

**MakeAheadNotes:** All 215 recipes were missing the `makeAheadNotes`
metadata field (the redo session deliberately left it null). Populated for
every recipe by extracting the first sentence of the "Make ahead, freezing,
leftovers" body section. Consistent with what the body says.

**Freezable / batchable:** No recipes had explicit "freezes well" language in
their body make-ahead sections — the category templates used "best fresh"
language for most dishes. `freezable` left at existing values (all false
except the few the redo session already set from batchNotes context).

**DietaryFlags:** Left empty — flags are AND-derived from ingredient flags
at index time. Correct by design.

**Body structure (all 215):**
- `ingredientsList` block: present on all 215 ✓
- `troubleshooter` block: present on all 215 (4 rows per dish category,
  templated from the redo session) ✓
- "Variations" section: present on all 215 (2 bullets per dish category) ✓
- "Make ahead, freezing, leftovers" section: present on all 215 ✓
- "Where this dish lives" section: present on all 215 ✓
- `sourceNotes`: present on all 215 (CREATOR source type, personal
  cookbook attribution) ✓

**Glossary coverage:** All 215 recipes have empty `glossaryTerms[]` — the
hybrid redo pipeline didn't register any glossary terms. No inline
`glossaryTooltip` marks either. Coverage check passes (no registered-but-
unused terms, no used-but-unregistered terms). A future per-recipe
authoring pass could add glossary terms where relevant (béchamel,
blanching, folding, etc.) but that's not in scope for this QC pass.

**Voice-check:** 0 blocking errors across the entire corpus. 107 recipes
carry non-blocking warnings — all tricolons in Rebecca's own prose or
Americanisms from her original recipes. Per the rules: her prose is
preserved verbatim; warnings logged, not fixed.

**Coherence:** Title-vs-body checks ran for every recipe. No coherence
failures found. Spaghetti Bolognaise and Spaghetti Carbonara (the two
canonical boundary bugs from the first ingest) checked explicitly — both
have clean, separate ingredient lists and methods.

---

## Auto-fix details by category

### Servings (193 recipes fixed)

Pattern: `recipe.servings === null && recipe.yieldDescription === null`.
Fix: read `ingredientsList.attrs.defaultServings` from the first
ingredientsList block in the body and set as `recipe.servings`.

Examples:
- `beef-bourguignon`: defaultServings 4 → servings 4
- `chocolate-self-saucing-pudding`: defaultServings 6 → servings 6
- `smoothie` recipes: defaultServings 2 → servings 2

22 recipes were already correct (had servings or yieldDescription set by
the redo session parser).

### TemperatureCelsius (47 recipes fixed)

Pattern: recipe uses `oven` tool but `temperatureCelsius === null`. Fix:
scan all body text nodes for patterns matching `\b(1[4-9]\d|2[0-9]\d)°?C\b`
and set the first found value.

Examples:
- `beef-bourguignon`: "Preheat the oven to 180C / 350F / Gas 4" → 180
- `best-ever-cauliflower-cheese`: "200°C" → 200
- `apple-crumble`: "190C" → 190

### MakeAheadNotes (215 recipes)

All recipes: extracted first sentence of the "Make ahead, freezing,
leftovers" body section. Examples:
- "Best fresh." (for salads, smoothies, fried dishes)
- "Keeps for two days in the fridge; reheat covered with a splash of liquid." (for stews)
- "Make the sauce up to three days ahead; cook the pasta fresh when serving." (for pasta)

### Cuisine correction (1 recipe)

`chicken-katsu-curry`: source cuisine was `"chinese"` (the redo session's
cuisine-detection template mapped Japanese-style dishes to Chinese when
the specific template didn't fire). Corrected to `"japanese"`. The
`sourceNotes` already said "A Japanese-style mild curry."

---

## Voice-check warning analysis

107 of 215 recipes have non-blocking warnings. Categories:

**Tricolons (most common):** Three-item parallel lists in her prose, e.g.
"warm, satisfying, and endlessly adaptable." Per the rules: tricolons in
Rebecca's prose are left as-is. They're her voice.

**Americanisms:** Recipes pulled from American blogs / Pinterest boards use
US spelling (flavor, organize, savory). Her prose, not changed.

**Brand mentions (WARN tier):** Some recipes mention Biscoff, Oreo, Baileys,
Tabasco, etc. in method prose or ingredient lists. These are registered
under the WARN_BRANDS list and don't block. Per the rules: reviewer
(Rebecca) decides per-recipe whether to genericise.

Notable warn-heavy recipes:
- `zucchini-pine-nut-cranberry-paleo-pasta`: 8 warnings (5 tricolons +
  americanisms — "zucchini" is the US term; the British "courgette" is
  used elsewhere in the corpus but this recipe's source was American)
- `garlic-beef-bites-potatoes`, `french-onion-soup`, `street-corn-salad`:
  5 warnings each (mostly tricolons in the where-this-dish-lives section)

---

## What was scoped out

Per the session brief:

- **Sub-tutorial cards** — the redo session flagged these as a future
  authoring pass. Technique tutorials (béchamel, pastry, risotto base,
  caramel, proving) don't exist yet. No cards were added here.
- **Scaling tokens in method prose** — method prose remains verbatim
  Rebecca without `{{slug}}` substitution tokens. The ingredientsList
  still drives the scale selector.
- **Per-recipe handcrafted troubleshooting / variations** — the templated
  4-row troubleshooter and 2-bullet variations remain. A future
  single-recipe authoring pass can add bespoke content.
- **Voice rewrites of her prose** — tricolons and americanisms in her
  original text logged, not changed.
- **New master-list entries** — no new ingredients or tools needed for
  this corpus. All 215 upload successfully against the existing master
  tables.

---

## Pipeline artifacts

- `docs/personal-recipes-briefs/.qc-and-publish.ts` — QC + publish
  script (TypeScript). Idempotent: safe to re-run; re-uploads with
  updated fixes, re-publishes.
- `docs/personal-recipes-briefs/_qc-report.json` — machine-readable
  per-recipe QC record (issues found, fixes applied, voice-check results,
  upload status, tutorial IDs).
- 215 brief JSON files updated in-place with the auto-fixed metadata.

---

## Cooking category count (post-QC)

| Status | Count |
|---|---|
| PUBLISHED cooking recipes | 439 total (215 personal + ~224 bulk-authored) |
| DRAFT cooking recipes | 0 |

The multi-category fill plan grid: Cooking column is now fully populated
with Rebecca's personal library.
