# Animals & Smallholding — Bulk-007 Batch Report

**Date:** 2026-05-29
**Session type:** autopilot-queue-extra
**Model:** Claude Sonnet 4.6

## Entries published (10)

| # | Slug | Sub-category | Type | Difficulty |
|---|------|-------------|------|-----------|
| 01 | introducing-a-mated-queen-to-a-colony | bees | TECHNIQUE | INTERMEDIATE |
| 02 | making-sugar-syrup-for-bees | bees | TECHNIQUE | BEGINNER |
| 03 | managing-feather-pecking-in-a-flock | poultry | TECHNIQUE | BEGINNER |
| 04 | keeping-ducks-on-a-smallholding | poultry | READING | BEGINNER |
| 05 | fitting-a-raddle-on-a-tup | sheep-and-goats | TECHNIQUE | BEGINNER |
| 06 | lamb-pneumonia-recognition-and-response | sheep-and-goats | TECHNIQUE | INTERMEDIATE |
| 07 | managing-a-doe-from-kindle-to-weaning | rabbits | TECHNIQUE | INTERMEDIATE |
| 08 | daily-health-check-for-meat-rabbits | rabbits | TECHNIQUE | BEGINNER |
| 09 | adjusting-pig-feed-from-weaner-to-finisher | pigs | TECHNIQUE | BEGINNER |
| 10 | sourcing-replacement-stock-after-a-disease-outbreak | smallholding-skills | READING | INTERMEDIATE |

9 TECHNIQUE, 1 READING. BEGINNER ×5, INTERMEDIATE ×4.

## New tools seeded (2)

- `queen-introduction-cage` — queen cage with candy plug for safe colony introduction (£2.00)
- `raddle-harness` — padded chest harness holding a colour crayon to mark served ewes (£20.00)

## Voice-check fixes

**Grade-level rewrites (5 entries):**
- Entry 01 paragraph[3]: Long semicolon-chained sentence "Three situations call for queen introduction; the first is…" split into 5 short declarative sentences (grade 17.3 → pass)
- Entry 04 paragraph[9]: Single 20-word sentence about duck down insulation split into two sentences (grade 12.5 → pass)
- Entry 06 troubleshooter item[0] cause: "Late-stage pneumonia or secondary infection; the disease has progressed beyond early-stage intervention" → "The disease is at an advanced stage, beyond what early observation can catch" (grade 16.6 → pass)
- Entry 08 negation-pattern: "not just on the floor but clearly unconsumed" → "found lying unconsumed in the bedding"
- Entry 10 paragraph[3] (everyday losses para): Full rewrite — replaced parenthetical disease list and long "restrictions/timelines/mandated/non-notifiable" sentence with 4 short declarative sentences (grade 12.1 → pass). Also fixed APHA paragraph split and removed "DEFRA-approved" (institutional-in-body rule).

**Medical-claim watchword (1):**
- Entry 03 infoPanel: "treats" (as noun for supplemental food items) → "supplemental extras such as corn and kitchen scraps"

**Brand-trademark (1):**
- Entry 03 infoPanel: "easy target" → "easier victim"

## Grade-level diagnosis note

The algorithm (FKGL) is reported at `body > paragraph[N]` using the content-array index (not paragraph-rank among paragraphs only). After two rounds of editing the wrong paragraph in entry 10, the fix was identified by tracing exact indices: the failing paragraph was the "Most everyday disease losses (coccidiosis…)" paragraph at content index 3, not the APHA contact paragraph at index 4.

## Acceptable warnings (non-blocking)

- Unflagged-jargon `propolis` in entry 01 (domain-known term, fires on plain-text occurrence after tooltip wrap)
- Unflagged-jargon `colostrum` in entry 06 (registered in glossaryTerms, fires on plain-text occurrence outside tooltip)
- Unflagged-jargon `weaner` in entry 09 (8 occurrences — structural term used throughout as the subject, registered in glossaryTerms as `weaner-pig`)
- Tricolon in entries 01 and 10 (non-blocking)
- Unflagged-jargon `standstill` in entry 10 subtitle and body (the glossary term is `movement-standstill`; standalone `standstill` fires separately — non-blocking)

## Counts

- Animals & smallholding: 151 → **161**
- All categories published: **4,642**
