# Cooking sprint — worker 1, batch 34 report

Model: orchestration on Claude Opus 4.8; bulk authoring delegated to 5 parallel
Claude Sonnet subagents (per feedback_model_choice.md — bulk authoring is Sonnet).

Lane: worker 1 of 4. Owned slices skew British + European + American +
Mediterranean. This batch: British pies, British curry-house, Italian
pasta/veg, French savoury bakes, American diner, Italian-American, Greek,
Turkish, Caribbean.

## How it ran
- Built an authoritative slug palette: dumped all 1,151 valid Ingredient slugs
  and 1,035 valid Tool slugs from the DB, plus a fresh published-slug skip list.
- Filtered ~110 candidate dishes against the skip list to find open slugs (the
  category is filling fast from 4 parallel workers, so many obvious dishes were
  already taken).
- 5 Sonnet subagents each authored 9 recipes into the batch dir against a gold
  reference file + the slug palette + the voice rules. I validated, voice-checked,
  and uploaded centrally.

## Result
- 46 recipes authored, all 46 PUBLISHED.
- Slug validation caught 1 bad ingredient slug (`tomatoes` -> `tomato`); fixed.
- Voice-check: 40 passed clean first time. 6 needed fixes:
  - chicken-dhansak, corned-beef-hash: one over-long method/troubleshooter
    sentence each (grade 12.x) -> split into short sentences.
  - gougere: both servings and yieldDescription set -> kept servings, nulled
    yieldDescription.
  - eggplant-rollatini, melanzane, pork-and-apple-pie: americanism/tricolon
    warnings ("fall apart", "eggplant", a three-item list) -> reworded.
  All 6 re-checked clean and uploaded. Nothing dropped.

## Counts
- Cooking PUBLISHED: 2,589 -> 2,626 toward 3,000 (other workers also running;
  46 attributable to this batch). 88% full, 374 to go.

## Tail
- fixup-hero-fill: pexels 70, flux-schnell 11, 0 failed.
- qc-fix --recently-published: processed 271, pass 268, 3 still_blocked (held at
  DRAFT by the completeness gate — expected).

## New reusable tooling (committed)
- `_sprint-batch-run.ts` — voice-checks then uploads a whole batch dir.
- `_validate-slugs.ts` — pre-upload check of ingredient + tool slugs vs the DB.
- `_dump-vocab.ts` — dumps valid ingredient/tool slugs.
- `batches/_vocab/` — staged slug lists the authoring subagents read.
