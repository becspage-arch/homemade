# Pilot batch of 10 recipes — Step 10 report

Phase 8 Step 10. 10 RECIPE drafts authored against the recipe-first prompt in `docs/tutorial-author.md` (prompt v2, commits `1b31a57` + `83ad7c4`). All 10 uploaded to production as `status = DRAFT`. Briefs saved at `docs/pilot-10-briefs/`. Full upload JSON saved at `packages/db/scripts/drafts/`.

## The 10 recipes

| # | Title | Slug | Cuisine | Difficulty | Sub-cat |
|---|---|---|---|---|---|
| 1 | Lasagne alla bolognese | `lasagne-alla-bolognese` | italian | ADVANCED | — |
| 2 | Quick weeknight lasagne | `quick-weeknight-lasagne` | italian | BEGINNER | — |
| 3 | Sunday roast chicken | `roast-chicken-sunday` | british | BEGINNER | — |
| 4 | Piccalilli | `piccalilli` | british | INTERMEDIATE | preserves |
| 5 | Coq au vin | `coq-au-vin` | french | ADVANCED | — |
| 6 | Buttermilk pancakes | `buttermilk-pancakes` | american | BEGINNER | — |
| 7 | Chicken tikka masala | `chicken-tikka-masala` | angloIndian | INTERMEDIATE | — |
| 8 | Shakshuka | `shakshuka` | middleEastern | BEGINNER | — |
| 9 | Air-fryer chicken thighs | `air-fryer-chicken-thighs` | british | BEGINNER | — |
| 10 | Slow-cooker pulled pork | `slow-cooker-pulled-pork` | american | INTERMEDIATE | — |

Mix targets satisfied: Italian × 2, British × 2, French × 1, American × 1 (+ a second via pulled pork), Anglo-Indian × 1, Middle Eastern × 1, air-fryer × 1, slow-cooker × 1. Difficulty: 5 BEGINNER, 3 INTERMEDIATE, 2 ADVANCED. Sub-30-min: 2 (buttermilk pancakes, shakshuka). Over-2hr: 4 (lasagne bolognese, coq au vin, slow-cooker pulled pork, piccalilli with overnight brine).

## Voice-check pass / retry counts

The deterministic `voice-check` CLI gates the upload. Errors block; warnings report but pass. Retry tally below counts how many upload attempts each recipe took before the gate let it through.

| Recipe | Attempts | Failure modes on first pass |
|---|---|---|
| lasagne-alla-bolognese | 2 | 2 em-dashes in one sentence; 2 em-dashes in `sourceNotes` paragraph |
| quick-weeknight-lasagne | 2 | banned phrase "honest" in intro |
| roast-chicken-sunday | 2 | 2 em-dashes in one sentence |
| piccalilli | 1 | clean first pass |
| coq-au-vin | 1 | clean first pass |
| buttermilk-pancakes | 2 | 2 em-dashes around an aside |
| chicken-tikka-masala | 2 | negation pattern ("not just X, but Y"); 2× em-dashes in concluding paragraphs |
| shakshuka | 1 | clean first pass |
| air-fryer-chicken-thighs | 2 | banned phrase "honest"; 2 em-dashes in closing paragraph |
| slow-cooker-pulled-pork | 2 | 2 em-dashes; banned phrase "honest" in troubleshooter fix |

**Totals:** 10 recipes, 7 required one retry, 3 passed first pass. **Zero recipes failed all 3 retries.**

## New ingredients created

None. All recipes used existing entries from the master `INGREDIENT_LOOKUP` table seeded in Step 4 (`8eca665`). No `newIngredient: true` flag was set on any item; no manual seeding was needed.

## Glossary terms created

13 new `GlossaryTerm` rows landed via the upload script (each scoped to the Cooking category):

- `soffritto`, `bechamel` (lasagne-alla-bolognese)
- `trussing` (roast-chicken-sunday)
- `salt-brining`, `vinegar-proof-lid` (piccalilli)
- `beurre-manie`, `bouquet-garni`, `lardon` (coq-au-vin)
- `buttermilk-substitute` (buttermilk-pancakes)
- `tikka`, `blooming-spices` (chicken-tikka-masala)
- `air-fryer` (air-fryer-chicken-thighs)
- `collagen-conversion`, `pork-shoulder` (slow-cooker-pulled-pork)

All are inline-defined in the body via the `glossaryTooltip` mark.

## Patterns the prompt seems to want to drift toward

For Step 11 prompt-refinement work. The deterministic `voice-check` catches all of these; the question is whether to tighten the prompt to reduce false starts.

1. **Em-dash overuse, especially appositive pairs.** Eight of the ten drafts wanted to write a sentence like "the bone — it should slip free with a small twist — and discard." This is the single most common failure mode. The prompt's voice-rules section already says "Never two in the same sentence" and calls this "the strongest AI tell of all" — but the model still reaches for it as a structural reflex when describing a step with a parenthetical note. **Recommendation for Step 11:** Add a worked rewrite to the prompt template showing an appositive em-dash pair rewritten as a colon, a semicolon, or a separate sentence.

2. **"Honest" as a softener.** Three drafts opened a paragraph with "the honest answer is", "the honest test is", or "the honest shortcuts". The word is banned and the prompt already lists it — but the model uses it as an "I'm levelling with you" voice marker, not as an information word. **Recommendation:** Worth surfacing in the prompt as a specific anti-pattern: when about to write "the honest [noun]", just say "in practice" or "the reliable test" or drop the qualifier.

3. **Tricolons in introductory and concluding paragraphs.** Nine of the ten drafts had at least one tricolon warning, often clustered in intros ("warm, considered, and beautiful" energy) and in the concluding "Where this dish lives" sections. These are warnings, not errors, so they don't block. **Recommendation:** Leave alone unless Rebecca's reader review flags them as a problem. Tricolons read fine when the third item earns its place; the warning is noisy.

4. **Scaling-token grammar.** Voice-check doesn't catch this, but Rebecca's review caught one and a re-scan found nine more across seven drafts. Two patterns: (a) `{{each-ingredient}}` written with no noun after — renders bare number ("Lay slices of 1 across the base"); (b) `{{clove/sprig/leaf-ingredient}}` followed by the same unit word — renders doubled ("4 cloves crushed garlic cloves"). The renderer drops `each` entirely and pluralises `clove`/`sprig`/`leaf`/`sheet` itself, so the prose pattern is fixed: for `each`, `"{{slug}} <singular-noun>"` ("{{lemon}} lemon" → "1 lemon"); for `clove`/`sprig`/`leaf`, `"{{slug}} of <ingredient>"` ("{{garlic}} of crushed garlic" → "4 cloves of crushed garlic"); for `g/ml/tbsp`, `"{{slug}} of <ingredient>"` already used correctly throughout. All 10 broken cases fixed and the 8 affected drafts re-uploaded. **Recommendation for Step 11:** the prompt's "Scaling tokens" section needs a worked grammar table — one row per unit family with the right prose pattern — and the prompt's voice-rules checklist should add a step-12: read the prose with the renderer's substitution mentally applied and check it reads naturally.

Other observations:

- **The Method-section H3s + scaling tokens combination works.** Every recipe has multiple `{{ingredient-slug}}` tokens in method prose. They render cleanly in the admin preview.
- **`ingredientsList` `groupLabel` clustering reads well in the admin preview** (multi-section recipes like the lasagne bolognese with three groups, or the coq au vin with four groups).
- **The prompt's "Where this dish lives" section is consistently the strongest part of the drafts** — the brief asks for it, the model writes it well.
- **The troubleshooter blocks always have at least 4 rows, often 5.** The model adds rich symptom-cause-fix detail without prompting; this looks good in admin preview.

## Token / cost approximation

Drafts were authored inside this worker session; no external API calls. Cost is the worker-session compute time only (Max-plan; no marginal cost). The upload script itself is database I/O and one R2 deduplication check; effectively free.

## Items deferred to Rebecca

- **Hero images.** All 10 ship with `heroMediaId = null` per the deferred-image policy in `project_content_pipeline.md`. Heroes get batch-generated pre-launch.
- **Inline illustrations.** Same.
- **Spot-check pass.** Rebecca reviews drafts in `/admin/tutorials`. Her notes feed Step 11.
- **`leftoverTutorialSlug` cross-reference.** Only `quick-weeknight-lasagne` references `lasagne-alla-bolognese` as a "deeper version" via that field. Worth deciding whether the field is the right way to surface that relationship or whether it wants to be its own block in the body.

## Next

Step 11 takes Rebecca's review of these 10, plus the patterns logged above, and refines `docs/tutorial-author.md`. Then a batch of 50.
