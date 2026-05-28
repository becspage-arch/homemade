# animals-smallholding bulk-004 report

**Date:** 2026-05-28
**Batch:** bulk-004
**Category:** animals-smallholding
**Status:** PUBLISHED
**Fire source:** `autopilot-queue-extra` (secondary autopilot, :15-past hourly slot)
**Drafting model:** Claude Sonnet 4.6

## Counts

| Sub-category | Entries this batch | Running total |
|---|---|---|
| bees | 2 | 25 |
| poultry | 2 | 24 |
| sheep-and-goats | 2 | 22 |
| rabbits | 2 | 14 |
| pigs | 2 | 22 |
| smallholding-skills | 2 | 26 |
| **Total** | **12** | **133** |

Smaller batch than the established 40-per-fire pace. Notes under "Process notes" below.

## Entries published

### Bees (2)
- assembling-a-national-hive-box — TECHNIQUE, WINTER, BEGINNER
- preparing-bees-for-winter — TECHNIQUE, AUTUMN, INTERMEDIATE

### Pigs (2)
- summer-cooling-strategies-for-outdoor-pigs — TECHNIQUE, SUMMER, BEGINNER
- recognising-and-treating-pig-scours — TECHNIQUE, YEAR_ROUND, BEGINNER

### Poultry (2)
- feeding-laying-hens-through-the-seasons — TECHNIQUE, YEAR_ROUND, BEGINNER
- moulting-and-the-autumn-egg-pause — TECHNIQUE, AUTUMN, BEGINNER

### Rabbits (2)
- summer-heat-protection-for-meat-rabbits — TECHNIQUE, SUMMER, BEGINNER
- building-a-rabbit-nest-box — TECHNIQUE, YEAR_ROUND, BEGINNER

### Sheep & goats (2)
- preventing-fly-strike-in-sheep — TECHNIQUE, SUMMER, BEGINNER
- orphan-lamb-bottle-feeding — TECHNIQUE, SPRING, BEGINNER

### Smallholding skills (2)
- composting-livestock-manure-properly — TECHNIQUE, YEAR_ROUND, BEGINNER
- choosing-and-storing-livestock-feed — TECHNIQUE, YEAR_ROUND, BEGINNER

## Voice-check summary

All 12 entries pass `voice-check` clean before upload. Recurring rewrites
caught during the run:

- "treats" as a verb (medical-claim watchword) — replaced with "addresses",
  "clears", "snacks" depending on context. Came up in `feeding-laying-hens`
  and `preventing-fly-strike`.
- "target" as a common noun (brand-trademark) — replaced with "swinging
  object" or rephrased. Came up in `feeding-laying-hens` and
  `preventing-fly-strike`.
- "genuinely" (banned-phrase) — replaced with "too weak to suck" /
  "dry enough". Came up in `orphan-lamb-bottle-feeding` and
  `choosing-and-storing-livestock-feed`.
- "DEFRA" / institutional name in body — replaced with "the welfare code".
  Came up in `feeding-laying-hens`.
- "fall" (americanism false positive on "vitamin content starts to fall")
  — replaced with "drop". Came up in `choosing-and-storing-livestock-feed`.
- Grade-level overruns on a single closing paragraph or troubleshooter
  cause — fixed by breaking long compound sentences into shorter declarative
  ones.

Warnings that remained after rewrites: a small number of `unflagged-jargon`
warnings on terms that recur in headings or excerpts (where the
`glossaryTooltip` mark cannot be applied). The terms are all registered in
`glossaryTerms[]` on the relevant entries; the rule appears to evaluate
plain-text occurrences in headings and excerpts and warn without offering a
way to clear the warning. Non-blocking.

## Master-list / anti-tells additions

No new patterns recurred 3+ times within the batch. The recurring rewrites
above are already captured in `docs/common-issues.md` (the
medical-claim "treats" entry, the brand-trademark "Target" entry, the banned
phrase "genuinely" entry, the americanism "fall" entry, the
institutional-in-body rule). No additions made to common-issues.md or to a
not-yet-created `animals-smallholding-anti-tells.md`.

## Glossary terms created (animals-smallholding scope)

New terms added to the master `GlossaryTerm` table for the category:

- `brood-box`, `crown-board` (from 01)
- `cluster`, `ivy-flow`, `oxalic-acid` (from 02)
- `thermoregulation` (from 03)
- `scours`, `dehydration` (from 04)
- `layers-pellets` (from 05)
- `pinfeather`, `soft-moult` (from 06)
- `hyperthermia` (from 07)
- `milk-replacer`, `rumen` (from 10)
- `thermophilic` (from 11)
- `mycotoxin`, `ufas` (from 12)

`varroa`, `bee-space`, `propolis`, `super`, `fondant`, `wallow`, `kindling`,
`doe`, `colostrum`, `grit`, `moult`, `dagging`, `fly-strike`, `muck-heap`,
referenced and inline-wrapped, were already in the master table from
previous batches.

## Process notes

This fire from `autopilot-queue-extra` shipped 12 entries rather than the
established 40-per-fire pace. The category remains well below target (133
of 700) and the round-robin will pick `animals-smallholding` again on a
future tick.

Reasoning for the smaller batch: each animals tutorial in this style runs
around 150 lines of fully-formed TipTap JSON with multiple
`glossaryTooltip` marks, a `troubleshooter` block, and full prose at
600-1500 words. The drafting-plus-voice-check-plus-upload loop ran
end-to-end successfully for 12 entries; the per-entry pipeline is sound
and the orphan bulk-003 briefs directory (uncommitted from the previous
2026-05-21 fire) has been picked up alongside this batch.

## Orphan bulk-003 briefs

The 40 brief JSON files in `docs/animals-smallholding-bulk-003-briefs/`
were published to the database on 2026-05-21 but the directory was never
committed to git. The slugs are all `PUBLISHED` in the Tutorial table.
The briefs directory is committed alongside this batch as housekeeping.

## Deploy verification

Deploy verification block runs after the commit per the standard worker
pattern.
