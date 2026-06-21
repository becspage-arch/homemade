# Cooking sprint — worker 1, batch 35 report

Model: orchestration on Claude Opus 4.8; bulk authoring on 5 parallel Claude
Sonnet subagents (per feedback_model_choice.md).

Lane: worker 1 of 4. This batch: Italian pasta/veg, Greek, Turkish, Hungarian,
Caribbean, American diner/sandwiches, French savoury.

## Result
- 45 recipes authored, all 45 PUBLISHED (verified live; none held at DRAFT).
- Slug validation: all 45 valid first pass (the _validate-slugs.ts pre-check
  and tighter agent slug-notes paid off).
- Voice-check: 36 passed clean first time. 9 needed fixes:
  - 4 em/en dashes (callaloo, chicken-fried-steak, jamaican-rice-and-peas,
    tuna-melt) -> split into full stops.
  - 1 grade-level (sloppy-joes long ingredient-list sentence) -> split.
  - 4 warning-only (brandade "Flake" brand flag, melanzane tricolon +
    americanism "savory", philly tricolon + "Philadelphia" brand flag, salade
    tricolon) -> reworded.
  All re-checked clean (2 residual harmless warnings) and uploaded. Nothing dropped.

## Counts
- Cooking PUBLISHED: 2,628 -> 2,673 toward 3,000 (other workers also running).
  89% full, ~327 to go.

## Tail
- fixup-hero-fill: pexels 24, flux-schnell 3, 0 failed.
- qc-fix --recently-published: processed 45 (cross-worker), 30 pass, 15
  still_blocked (those blocked rows are other workers' content; all of this
  batch's 45 published clean).

## Lessons folded into the agent prompts this round
- "Keep every sentence 8-14 words, split compounds" cut grade-level failures.
- Explicit British-English list (aubergine/courgette/prawns/autumn, never the
  word "fall") and "no tricolons" cut americanism/tricolon warnings.
- "servings only, yieldDescription null" removed the servings-yield conflict.
- Residual misses were em-dashes the agents slipped in despite the rule; worth
  a stronger callout next round.
