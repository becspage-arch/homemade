# Cooking sprint — worker 1, batch 36 report

Model: orchestration on Claude Opus 4.8; bulk authoring on 5 parallel Claude
Sonnet subagents (per feedback_model_choice.md).

Lane: worker 1 of 4. This batch went to deeper cuts of the owned slices since
the common dishes are now taken: British regional pies, Anglo-Indian curries,
Italian pasta/veg, French regional, American diner/comfort, Italian-American,
Greek, Turkish, Hungarian, Caribbean.

## Result
- 45 recipes authored, all 45 PUBLISHED.
- Slug validation: all 45 valid first pass.
- Voice-check: 40 clean first time, and crucially ZERO blocking errors this
  round (the stronger "scan for em/en dashes" + "every sentence 8-14 words"
  callouts in the agent prompts removed the em-dash and grade-level failures
  that bit the last two batches).
- The 5 that tripped were all warning-only (brand-name false positives on the
  words "Anchor"/"Target", two "fall apart" americanisms, one excerpt tricolon).
  Reworded, re-checked clean, uploaded. Nothing dropped.
- One agent set foundational:true on a recipe (kotosoupa); corrected to false
  before upload.
- Mid-upload the machine shut down; on restart the 3 in-flight files
  (cavatelli-with-beans, patlican-musakka, salisbury-steak) were re-uploaded and
  verified published. No duplicates (upload upserts by slug).

## Counts
- Cooking PUBLISHED: 2,673 -> 2,724 toward 3,000 (other workers also running;
  45 attributable to this batch). ~276 to go.

## Tail
- fixup-hero-fill + qc-fix --recently-published ran clean (cross-worker; this
  batch's 45 all live).
