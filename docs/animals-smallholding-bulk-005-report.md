# animals-smallholding bulk-005 report

**Date:** 2026-05-29
**Batch:** bulk-005
**Category:** animals-smallholding
**Status:** PUBLISHED
**Fire source:** `autopilot-queue-extra` (secondary autopilot, :15-past hourly slot)
**Drafting model:** Claude Opus 4.7 (1M context) — the routine spec calls for Sonnet for bulk authoring per `feedback_model_choice.md`; the actual fire ran on Opus 4.7 per the harness banner.

## Counts

| Sub-category | Entries this batch | Running total |
|---|---|---|
| bees | 2 | 27 |
| poultry | 2 | 26 |
| sheep-and-goats | 1 | 23 |
| rabbits | 1 | 15 |
| pigs | 1 | 23 |
| smallholding-skills | 1 | 27 |
| **Total** | **8** | **141** |

Smaller batch than the routine's nominal 40-50 target. Per the bulk-004
report's process note, each animals tutorial in this style runs around
150 lines of fully-formed TipTap JSON with multiple `glossaryTooltip`
marks, infoPanel blocks, troubleshooter blocks, and 600-1500 word body
prose. Eight entries lands in a single autopilot fire; the round-robin
will pick `animals-smallholding` again on a later tick.

## Entries published

### Bees (2)
- cleaning-and-storing-a-bee-smoker — TECHNIQUE, AUTUMN, BEGINNER
- registering-a-new-apiary-on-beebase — READING, YEAR_ROUND, BEGINNER

### Poultry (2)
- weekly-coop-cleaning-routine — TECHNIQUE, YEAR_ROUND, BEGINNER
- spotting-and-treating-impacted-crop — TECHNIQUE, YEAR_ROUND, BEGINNER

### Sheep & goats (1)
- separating-a-poorly-sheep-for-treatment — TECHNIQUE, YEAR_ROUND, BEGINNER

### Rabbits (1)
- preventing-and-spotting-mastitis-in-a-meat-doe — TECHNIQUE, YEAR_ROUND, BEGINNER

### Pigs (1)
- tape-weighing-a-pig — TECHNIQUE, YEAR_ROUND, BEGINNER

### Smallholding skills (1)
- setting-up-a-small-quarantine-pen — TECHNIQUE, YEAR_ROUND, BEGINNER

## Voice-check summary

All 8 entries pass `voice-check` with 0 errors before upload. Recurring
rewrites caught during the run:

- **Em/en dashes in sourceNotes and troubleshooter fix lines.** First
  draft of entry 01 had an em-dash in `sourceNotes` and one in a
  troubleshooter item; replaced with full stop and semicolon
  respectively. Watch for em-dashes in non-body string fields, not just
  body prose.
- **`honest` banned phrase.** Showed up twice across the batch (entries
  05 and 08) in stock turn-of-phrase like "an honest answer" and "an
  honest look". Replaced with `clear answer` and `careful look`. The
  pattern is reflexive prose — flag for self-critique pass.
- **Grade-level overruns on compound sentences.** Entries 05 and 07
  triggered grade-level errors on long compound sentences with multiple
  subordinate clauses. Broke into shorter declaratives.
- **Glossary terms registered but not wrapped inline.** Entry 02
  registered `vent` and `broody` in `glossaryTerms[]` but only used them
  in infoPanel / troubleshooter bodies (which are plain strings, not
  TipTap nodes). The audit only counts inline `glossaryTooltip` marks in
  body paragraphs. Fix: add a paragraph that references the term and
  wrap it. Pattern: every term that goes into `glossaryTerms[]` needs at
  least one wrapped occurrence in a body paragraph.

Warnings that remained after rewrites (non-blocking per
`feedback_no_warning_tiers.md`):

- `unflagged-jargon` on `weaner`, `propolis`, `drenching` in headings,
  excerpts, or infoPanel bodies where the `glossaryTooltip` mark cannot
  apply.
- `brand-trademark: Target` false-positive on the common noun "target"
  in body content ("target liveweight"). Same pattern bulk-004 flagged.
- `tricolon` warnings on three-item phrases in troubleshooter fixes
  ("food, water, and a heat source"; "food, water, and the keeper
  visiting twice a day"). Acceptable in operational lists.

## Master-list / anti-tells additions

Two patterns recurred during this batch but neither hit 3+ occurrences,
so no additions to `docs/common-issues.md` or to an `animals-smallholding
-anti-tells.md` (which still does not exist for the category):

- Em-dash creeping into `sourceNotes` lines (2 occurrences).
- `honest` as a stock filler (2 occurrences).

If either recurs across bulk-006, write the anti-tells file with both.

## Glossary terms created (animals-smallholding scope)

New terms added to the master `GlossaryTerm` table for the category:

- `creosote`, `bellows` (from 01)
- `deep-litter`, `vent`, `red-mite`, `broody` (from 02 — `red-mite`,
  `broody`, `deep-litter`, `vent` all already in master from prior batches)
- `crop`, `sour-crop`, `proventriculus`, `grit` (from 03 — most existed,
  `proventriculus` new)
- `race`, `crook-handling`, `drench`, `tup` (from 04 — `race`,
  `crook-handling`, `drench` new)
- `heart-girth`, `deadweight`, `weaner` (from 05 — `heart-girth` new)
- `biosecurity`, `scab`, `quarantine-drench`, `hurdle` (from 06 — `scab`,
  `quarantine-drench` new)
- `beebase`, `afb`, `efb`, `apiary` (from 07 — all four new)
- `kindle`, `nest-box`, `kits` (from 08 — `kits` new)

## Tool-slug coverage

Every recipeTools slug resolved against the master Tool table on the
first upload pass. No reseed needed. The animals-smallholding tools
block from earlier pipeline-setup work has held up across bulk-002
through bulk-005 without addition.

## Process notes

Eight entries shipped in the autopilot fire. Working pattern:

1. Draft brief JSON to disk (full TutorialUploadInput shape, including
   the TipTap body).
2. Voice-check inline. Fix errors before moving on.
3. Upload PUBLISHED.
4. Move to the next entry.

The two recurring error classes (em-dash in non-body strings, `honest`
as filler) are easy to self-critique before voice-check on subsequent
entries. By entry 04 onward, drafts were arriving with 0-1 errors on
first voice-check.

Smaller batch size deliberately: each tutorial in this category runs
hot on TipTap structure cost. The category remains well below target
(141 of 700) and the round-robin will return.

## Deploy verification

Runs after the commit per the standard worker pattern.
