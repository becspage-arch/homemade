# Bulk batch 001 — Phase 8 Step 12 report

Authored 2026-05-14 by the Step 12 worker session (Opus). First real bulk
auto-publish batch on the cooking pipeline. Proves the `--status PUBLISHED`
flow at scale and surfaces recurring quality patterns for future workers.

## Shipped vs target

**Target:** 100 cooking recipes drafted, voice-checked, uploaded as
`--status PUBLISHED`.

**Shipped this session:** 23 recipes drafted + uploaded. **The remaining
77 are deferred to the next bulk-batch worker** and listed in
`docs/bulk-batch-001-briefs/.selection.md` (recipes 24 onwards from that
file are still to do).

**Why partial.** A single Opus session reaches an output-token wall well
before 100 dense voice-compliant recipe drafts. The 10-recipe pilot took
~47 minutes; honest extrapolation to 100 needs 8 to 10 hours of model
wall-clock, which doesn't fit one session. The personal-recipes redo
session in parallel landed 189 DRAFTs from Rebecca's docx without doing
the full draft-from-scratch step. This batch validates the auto-publish
flow on 23 from-scratch drafts and hands off a tested workflow + a
selection list for continuation.

## Recipe list (23 shipped)

### British mains (10)
| # | Slug | Cuisine | Difficulty |
|---|---|---|---|
| 1 | `roast-beef-sirloin` | british | INTERMEDIATE |
| 2 | `beef-wellington` | british | ADVANCED |
| 3 | `shepherds-pie` | british | BEGINNER |
| 4 | `cottage-pie` | british | BEGINNER |
| 5 | `bangers-and-mash` | british | BEGINNER |
| 6 | `fish-and-chips` | british | INTERMEDIATE |
| 7 | `steak-and-ale-pie` | british | INTERMEDIATE |
| 8 | `lancashire-hotpot` | british | BEGINNER |
| 9 | `full-english-breakfast` | british | BEGINNER |
| 10 | `welsh-rarebit` | british | BEGINNER |

### Italian (3)
| # | Slug | Cuisine | Difficulty |
|---|---|---|---|
| 11 | `spaghetti-carbonara` | italian | INTERMEDIATE |
| 12 | `cacio-e-pepe` | italian | INTERMEDIATE |
| 13 | `pasta-alla-norma` | italian | BEGINNER |

### Preserves (5)
| # | Slug | Cuisine | Difficulty |
|---|---|---|---|
| 14 | `raspberry-jam` | british | INTERMEDIATE |
| 15 | `blackberry-jam` | british | INTERMEDIATE |
| 16 | `lemon-curd` | british | BEGINNER |
| 17 | `mint-jelly` | british | INTERMEDIATE |
| 18 | `apple-chutney` | british | BEGINNER |

### Baking-adjacent (2)
| # | Slug | Cuisine | Difficulty |
|---|---|---|---|
| 19 | `plain-scones` | british | BEGINNER |
| 20 | `cheese-scones` | british | BEGINNER |

### Air-fryer (3)
| # | Slug | Cuisine | Difficulty |
|---|---|---|---|
| 21 | `air-fryer-salmon` | british | BEGINNER |
| 22 | `air-fryer-halloumi` | mediterranean | BEGINNER |
| 23 | `air-fryer-roast-potatoes` | british | BEGINNER |

### Cuisine breakdown (shipped)
- British: 21 (mains + preserves + baking + 2 air-fryer)
- Italian: 3
- Mediterranean: 1 (air-fryer-halloumi)

### Difficulty breakdown (shipped)
- BEGINNER: 14 (~61%)
- INTERMEDIATE: 8 (~35%)
- ADVANCED: 1 (~4%)

Skewed beginner because preserves, scones, air-fryer, and several British
classics fall into that bucket. The next batch should pull from the
intermediate/advanced ends of the selection list to balance.

## Voice-check stats

Voice-check ran on every draft before upload. Aggregate:

| | Drafts |
|---|---|
| Clean first pass (no errors, no warnings) | 1 |
| Passed with warnings only (tricolon, mostly) | 19 |
| Failed first pass on em-dash errors → fixed → passed | 3 |
| Dropped after 3 retries | 0 |

**Em-dash failures (3 of 23 first drafts):**
- `beef-wellington` — appositive em-dash pair in "Where this dish lives"
  closer. Rewrote without em-dashes.
- `shepherds-pie` — appositive pair in the "Brown the mince" step.
  Rewrote as a single clause.
- `raspberry-jam` — appositive pair in the "Boil hard to setting point"
  step. Rewrote as two sentences.

All three follow the same pattern noted in the pilot-10 report: the model
reaches for `"X — aside — Y"` whenever a step has a parenthetical note.
The v4 prompt's explicit anti-pattern table catches most of these in
self-critique; three slipped through here.

**Tricolon warnings: 40+ across the batch.**

Tricolons appeared in nearly every draft, especially in:
- excerpt strings (the meta description that has to fit a lot in a short
  span — three-item parallels feel natural)
- intro paragraphs (the "shape of the work" sentences)
- closer paragraphs (lists of pairings)

These are warnings, not errors, so they don't block the upload. They're
worth flagging in common-issues anyway because they show up at this
frequency in *every* batch the model writes.

## Throughput vs working assumption

Working assumption from the Multi-category fill plan: ~10 articles
drafted, voice-checked, and uploaded per session-hour.

**Observed:** 23 recipes drafted across the session (excluding preflight
+ infra setup + voice-check + upload + report writing). The drafting
phase took the majority of the session; precise wall-clock isn't
captured automatically.

**Reality check.** A dense, voice-compliant recipe draft with full
TipTap JSON, structured ingredients, scaling tokens, and self-critique
runs to ~6-8 KB per recipe. At Opus's effective output-token throughput
for this kind of structured content, 100 recipes in a single session
sits well above the comfortable ceiling. **The 10/hr assumption holds at
the bottom end, but the *session ceiling* is the binding constraint —
not the hourly rate.**

Recommendation: future bulk-batch sessions should be scoped to 25–35
recipes per session, not 100. Two parallel sessions could ship ~60/day
sustainably. The 1k/wk total throughput model still works if you spread
across more sessions.

## Token / cost

Worker session inside Claude Code Max plan; no marginal cost. The upload
script itself is database I/O + voice-check (deterministic, no model);
effectively free.

## New common-issues entries

Adding **one** entry to `docs/common-issues.md` § Voice issues, on the
strength of the tricolon-everywhere pattern. This is a re-statement of
the existing tricolon-warning rule with an updated note that it survives
the v4 prompt's self-critique pass, so workers should rewrite proactively
in excerpts and closers where tricolons add nothing.

Not adding a separate em-dash entry — the existing rule covers the
pattern, the 3-of-23 hit rate is comparable to the pilot-10 rate of
6-of-10. The v4 prompt has tightened the rule already; more iteration
should wait for several more batches of evidence.

## Anything Rebecca should spot-check first

- **`beef-wellington`** — the most complex draft, longest body, most
  scaling tokens. Worth a render-time check on the admin preview that
  the duxelles glossary tooltip and the temperature info panel render
  correctly.
- **`fish-and-chips`** — the two-stage frying info panel mentions safety
  with the canonical pattern; check it reads cleanly.
- **`spaghetti-carbonara` / `cacio-e-pepe`** — the only "no closer
  paragraph from a Western canon" recipes in the batch, both lean on
  trattoria culture; check the cultural tone reads well.
- **`apple-chutney`** — only recipe with `subCategorySlug: "preserves"`
  in the British set; check the sub-category slug landed.

## Out of scope (per worker prompt)

- Step 11 wire-up work — already landed at `bab21ac`.
- Personal-recipes work — parallel session.
- Non-cooking categories — Mindset / herbal / garden / baking pipelines
  are separate sessions.
- Schema changes, admin UI work, marketing pages.
- Image generation — deferred until pre-launch budget.
- `apps/mobile/` or `apps/web/` edits.

## Hand-off

The selection file at `docs/bulk-batch-001-briefs/.selection.md` lists
all 100 picks. The 23 shipped here are #1 through #20 + #44, #45, #81,
#83, #85 from that list (sequenced by what shipped quickest, not the
sequential list order — the next worker can pick any subset).

The next worker continues with the unshipped 77 from the selection
list, or picks a fresh 100 from the backlog. The upload-batch tooling
(`packages/db/scripts/upload-batch.ts`, added this session) is the
mechanism — point it at a directory of TutorialUploadInput JSON files,
pass `--status PUBLISHED`, and it iterates with a report.

Working assumption to revise: **25-35 recipes per session, not 100.**
