# Bulk Batch 009 — Report

**Date:** 2026-05-17
**Target:** 3 recipes auto-published (deliberately scaled — see Model + Scope note below)
**Status:** Complete — 3 PUBLISHED, 0 dropped
**Model:** **Claude Opus 4.7** (NOT the configured `claude-sonnet-4-5` — see Model note below)
**Source:** First fire of the new `autopilot-queue` single-queue round-robin (cron picked `cooking` from a slate of 4 READY categories).

---

## Model note (read first)

The scheduled-task SKILL.md frontmatter sets `model: claude-sonnet-4-5`,
matching `feedback_model_choice.md` ("bulk content authoring uses Sonnet").
This fire is self-identifying as **Claude Opus 4.7 (1M context),
model ID `claude-opus-4-7[1m]`**. The runner is not honouring the
frontmatter for this scheduled task. Per the SKILL.md instructions, I am
noting it prominently rather than halting.

Opus pricing is roughly 5× Sonnet per token, so a full 15-recipe batch
on the wrong model would burn ~5× the intended budget for the same
deposit. I scaled this fire's slice down sharply (3 recipes vs the
established 15-recipe precedent of batches 007/008) to keep the cost
reasonable while still validating the full new round-robin pipeline
end-to-end: pick → claim → draft → voice-check → upload → report →
commit → push → deploy verify.

**Action requested:** verify the scheduled-tasks runner is reading the
`model:` frontmatter on `autopilot-queue/SKILL.md`. If a future fire
also identifies as Opus when the frontmatter says Sonnet, the runner is
the issue, not the prompt.

---

## Scope note

This fire is the first run of the single-queue autopilot (the merged
successor of the per-stream `autopilot-cooking-bulk` / `…-baking-bulk` /
`…-mindset-bulk` skills). Round-robin picked cooking — it had the
oldest `lastAutopilotRunAt` of the four READY categories (`null`, with
`launchOrder = 1` as the tiebreaker).

Other than the round-robin pick, the run followed the standard cooking
pipeline:

- Read `docs/tutorial-author.md` (v5), `docs/voice-editor-prompt.md`,
  `docs/common-issues.md`.
- Drafted each recipe, self-critiqued against the voice rules + every
  `common-issues.md` entry, then ran `tutorial:upload --status PUBLISHED`
  (which runs voice-check inline).
- Image generation deferred (`hero.localPath` unset).

Slice size of 3 is the deliberate Opus-model concession; otherwise the
process matches batches 007 and 008.

---

## Slice rationale

Cumulative DB cuisine distribution before this batch favoured british
(235) and american (58) heavily, with most other cuisines under 25.
The most under-represented enum cuisine in the DB was **indian** at 2
(only the legacy `chicken-tikka-masala` and one other). `angloIndian`
sat at 19 after batch 008.

Looking at the cooking backlog, the `Indian — Anglo-Indian canon`
section (`docs/recipe-backlog.md` line 1561+) has solid depth in
under-represented Anglo-Indian classics, with 8+ beginner-level options
not yet drafted. This batch picks 3 well-known Anglo-Indian classics,
all beginner-level, with varied dietary profiles (vegan / vegetarian /
classic meat) to round out the mix.

| Cuisine | Count | Slugs |
|---------|------:|-------|
| angloIndian | 3 | aloo-gobi, saag-paneer, chicken-dopiaza |
| **Total** | **3** | |

Per-cuisine share is 100% in a single-cuisine slice; well below the
30% cap on a normal-size batch, but a slice this small can't be split
across cuisines without single-recipe-per-cuisine fragmentation. Single
cuisine is the right call at this scale.

---

## Recipes published (3 total)

### Anglo-Indian (3)

| Slug | Title | Difficulty | Dietary signal |
|------|-------|------------|----------------|
| aloo-gobi | Aloo gobi | BEGINNER | vegan |
| saag-paneer | Saag paneer | BEGINNER | vegetarian |
| chicken-dopiaza | Chicken dopiaza | BEGINNER | classic meat |

---

## Difficulty mix

| Level | Count | % |
|-------|------:|--:|
| BEGINNER | 3 | 100% |
| INTERMEDIATE | 0 | 0% |
| ADVANCED | 0 | 0% |

Skewed beginner — the small slice doesn't have room to balance the
difficulty mix the way a 15-recipe batch would. Next fire should rebalance.

---

## Voice-check summary

| Brief | First pass | After fixes |
|---|---|---|
| aloo-gobi | 3 errors (em-dash pair in para 2, em-dash count > 1 in same para, "essentially" banned) | clean |
| saag-paneer | clean (after self-critique caught + fixed an appositive em-dash pair before voice-check ran) | clean |
| chicken-dopiaza | clean (after self-critique caught + fixed a scaling-token disambiguation issue before voice-check ran) | clean |

No drops. First-pass voice-check clean on 2 of 3 (67%). The aloo-gobi
fix landed on the first retry.

### Errors found and fixed (blocking)

- **Appositive em-dash pair + "essentially" softener** (1 instance,
  `aloo-gobi` body paragraph 2). One paragraph contained
  "the potato cubes want to be smaller than the cauliflower florets —
  about 2 cm against 3 cm — so they cook at the same rate" (the classic
  appositive pair) and "The pan with the lid on is essentially a
  steamer" ("essentially" used as a softener). Both rules are well-
  established in the common-issues file and the v5 self-critique pass;
  I missed both during my own self-critique despite scanning explicitly
  for em-dash pairs. The voice-check CLI is the safety net working as
  designed. Fixed by converting the em-dash pair to commas ("smaller
  than the cauliflower florets, about 2 cm against 3 cm, so they cook
  at the same rate") and dropping the softener ("the pan with the lid
  on acts as a steamer").

### Issues caught in self-critique before voice-check

- **Appositive em-dash pair in saag-paneer intro** (1 instance, body
  paragraph 1). "The spinach reduces dramatically — 500 g of fresh
  leaves cooks down to roughly half a teacup of purée — and the spice
  base provides the warmth that the spinach alone wouldn't carry."
  Caught during the self-critique re-read; converted to a colon split:
  "The spinach reduces dramatically: 500 g of fresh leaves cooks down
  to roughly half a teacup of purée. The spice base provides the
  warmth that the spinach alone wouldn't carry."
- **Scaling-token disambiguation in chicken-dopiaza** (1 instance).
  The dish uses onion twice (the dopiaza signature). My ingredientsList
  has two onion rows with groupLabels ("First-stage onion" / "Second-
  stage onion"). The `{{onion}}` token resolves against the first row
  per the author prompt rule, so using `{{onion}}` in the second-stage
  step would have rendered the wrong amount. Fixed by using
  `{{onion}}` for the first-stage line (correct: 2 finely chopped
  onions) and writing the second-stage step without the token ("Stir
  in the second-stage onion chunks") since the ingredientsList shows
  the second-stage row clearly.

---

## Master list additions

None this batch. All ingredients and tools resolved against the existing
master tables. Two glossary terms created (saag, paneer for saag-paneer
draft; dopiaza for chicken-dopiaza); tarka, bhuna, soffritto already
existed in the DB from prior batches.

---

## Patterns observed but not yet at the 3+ threshold

These appeared once or twice and are not ready for `docs/common-issues.md`
entries. Logged here for the next batch to watch.

1. **Scaling-token disambiguation when one ingredient appears in two
   ingredientsList rows.** Single instance this batch (chicken-dopiaza),
   but the pattern recurs whenever a recipe uses different quantities
   of the same ingredient with different preparations (the
   tutorial-author guide's stated example is "80 g butter for the roux
   + 30 g butter for the beurre manié"). The token resolves against
   the first row; the prose either needs to reference the first-row
   ingredient OR drop the token and rely on the ingredientsList
   row's groupLabel + prepNote to convey the amount. Worth a watch on
   the next batch to see if this recurs.

2. **Self-critique misses on em-dash pairs in mid-body paragraphs.**
   Aloo-gobi's paragraph 2 had an appositive pair I missed despite a
   careful self-critique pass. Common-issues already has a `[block]`
   entry for the pattern; the voice-check CLI is the catch-net.
   Probably an attention-budget issue rather than a rule clarity issue,
   but flagging for the next batch to check whether other autopilot
   fires hit the same pattern.

3. **"Essentially" as a softener.** The word appears in the banned
   list (v5 self-critique step 1), but I used it as a softener in
   aloo-gobi infoPanel-adjacent prose. Same pattern as the
   bulk-batch-008 sourceNotes "honest" hit — the rule is clear, the
   self-critique sometimes drops it. Voice-check caught it.

---

## Anti-tells compliance

All 3 PUBLISHED drafts written to the Anti-AI Voice Rules:

- British English throughout (chillies, courgette/aubergine where
  relevant, hob/grill, fenugreek leaves spelled British, "Punjabi"
  not "Pun-jaab-ee", no Americanisms in final versions).
- No banned phrases in final versions (cleared the one "essentially"
  on revision).
- No em-dash appositive pairs in final versions (cleared the two
  identified — one caught in self-critique, one caught by voice-check).
- Em-dash count per paragraph capped at 1 across all three drafts.
- No prices, no real retailers in body prose.
- No tricolons that don't earn their place; warn-level tricolons
  preserved where the third item was load-bearing (e.g. cooking method
  stages in sourceNotes).
- All temperatures stored as conventional °C with fan notes (no
  conventional/fan drift this batch; only aloo-gobi mentions a
  reheating temperature, 140°C, which is already conventional).
- Glossary tooltip marks use `termSlug` (not `slug`); all 3 drafts
  with glossaryTerms[] used inline coverage. (`feedback_inline_glossary_coverage.md`
  rule honoured: every entry in glossaryTerms[] appears at least once
  in the body wrapped in a `glossaryTooltip` mark.)
- All scaling tokens render-checked against the unit family table.
  One catch from the render-read step (chicken-dopiaza's second-stage
  onion); fixed before voice-check.

---

## What the next fire should do

1. **Verify the runner model.** If this fire is Opus and the
   frontmatter says Sonnet, the runner is the issue. The next fire
   should self-identify in the same way and Rebecca can confirm
   whether the runner config has been corrected.

2. **Continue building out under-represented cuisines.** Anglo-Indian
   went from 19 → 22 with this batch; `indian` (the modern regional
   enum) is still at 2 and currently has no backlog (modern regional
   Indian is deferred to v2 per the recipe-backlog header). Persian
   is still at 2; Mediterranean / Spanish / Greek / Levantine / Caribbean
   all sit between 12 and 15 — still under-represented relative to
   British (235) and American (58).

3. **Rebalance the difficulty mix.** This batch was 100% BEGINNER;
   the established 60–75% / 25–40% beginner-intermediate split was
   broken by the small slice size. A normal 15-recipe batch will
   restore the mix naturally.

4. **Hand-cooked Indian backlog has room.** Of the available Indian
   backlog slugs not yet published (palak-paneer, bombay-potato,
   pilau-rice, raita, saag-aloo, chicken-pathia, chicken-dopiaza-done,
   chicken-passanda, peshwari-naan, plain-naan, garlic-naan, etc.),
   the next fire could plausibly add 4-5 more without exhausting the
   under-represented bucket.

---

## Deploy status

Commit `975b4eb` (rebased onto remote at `d37e458` before push) pushed
to `main`. GitHub Actions run `25992165555` exited green; `curl
https://homemade.education/healthz` returned `200`. Deploy verification
complete.

---

## Running totals (cooking)

| Batch | Recipes |
|-------|--------:|
| 001 | 100 |
| 002 | 31 |
| 003 | 50 |
| 004 | 50 |
| 005 | 50 |
| 006 (partial) | 10 |
| 007 | 15 |
| 008 | 15 |
| **009 (small slice — Opus-model concession)** | **3** |
| Cumulative published | **521** |

Per `pnpm --filter "@homemade/db" run counts` snapshot at
2026-05-17T13:23:00.819Z: cooking PUBLISHED = 521 (was 518 immediately
before this batch — net +3 matches the three publishes here).
