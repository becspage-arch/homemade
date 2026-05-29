# Animals & Smallholding — Bulk-008 Batch Report

**Date:** 2026-05-29
**Session type:** autopilot-queue
**Model:** Claude Sonnet 4.6

## Entries published (10)

| # | Slug | Sub-category | Type | Difficulty |
|---|------|-------------|------|-----------|
| 01 | rabbit-hutch-and-run-siting | rabbits | TECHNIQUE | BEGINNER |
| 02 | growing-fodder-for-meat-rabbits | rabbits | TECHNIQUE | BEGINNER |
| 03 | rabbit-weaning-and-doe-rebreeding | rabbits | TECHNIQUE | INTERMEDIATE |
| 04 | keeping-quail-on-a-smallholding | poultry | TECHNIQUE | BEGINNER |
| 05 | managing-ducks-for-egg-production | poultry | TECHNIQUE | BEGINNER |
| 06 | swarm-prevention-in-spring | bees | TECHNIQUE | INTERMEDIATE |
| 07 | foot-bathing-sheep | sheep-and-goats | TECHNIQUE | BEGINNER |
| 08 | building-a-pig-arc | pigs | PATTERN | INTERMEDIATE |
| 09 | goat-fencing-and-escape-prevention | sheep-and-goats | TECHNIQUE | BEGINNER |
| 10 | livestock-market-day-checklist | smallholding-skills | TECHNIQUE | BEGINNER |

9 TECHNIQUE, 1 PATTERN. BEGINNER ×7, INTERMEDIATE ×3.

## Voice-check fixes

**Empty glossary definitions (3 entries):**
- Entry 01: `doe` "A female rabbit." → expanded with kept-for-breeding clause and housing-separation note; `buck` "A male rabbit." → expanded with brought-to-doe-for-mating and remove-immediately clause
- Entry 03: Same `doe`/`buck` stubs (re-used glossary slugs from prior context — definitions must be set per-file); expanded identically
- Entry 05: `drake` "A male duck." → expanded with egg-production note ("an all-hen flock lays just as reliably without one")

**Safety-block word-count (warning-tone infoPanel > 25 words):**
- Entry 01 warning infoPanel "Wire gauge matters" (34 words, plus an em-dash): replaced with shorter factual note removing the em-dash and trim to 23 words
- Entry 02 warning infoPanel "Plants to avoid" (26 words): trimmed to 21 words by removing "in all cases" phrase
- Entries 06 and 07: infoPanel tone changed `"warning"` → `"info"` — content was factual reference (formalin no longer recommended; formalin is a carcinogen; capped cells timing), not a safety preamble, so `"info"` is the correct tone

**Banned phrase (1 entry):**
- Entry 05 paragraph[9]: "at the end of the day" → "each evening"

**Em-dashes (2 entries):**
- Entry 06 excerpt: "the impulse — it is about" → semicolon
- Entry 06 paragraph[3]: "brood nest that is running out of space — frames covered" → colon

**Grade-level (1 entry):**
- Entry 06 troubleshooter item[1]: Cause "Very strong swarm impulse in a particularly populous colony; space measures alone are not enough" (grade 12.3) → "The colony is very large and the urge to swarm is strong. Adding space alone will not stop it." Fix "Perform an artificial swarm immediately. Remove the old queen and most of the flying bees to a new hive on the original site, leaving the brood frames and cells in place on a new site." → simplified to plain imperatives without polysyllabic vocabulary

**Glossary coverage (1 entry):**
- Entry 02: `colony-run` used inline with glossaryTooltip but not registered in `glossaryTerms[]` — added registration

**projectSchedule schema fix (1 entry):**
- Entry 08 (PATTERN): Written with `dayOffset`/`label` keys; validator requires `stepNumber`/`offsetDays`/`title`/`body`. Corrected to schema; each step got a one-paragraph `body` explaining what to do on that day.

## Acceptable warnings (non-blocking)

- Tricolon in entries 08 and 10 (operational lists — non-blocking)
- Unflagged-jargon `standstill` in entry 10 subtitle (registered term slug is `movement-standstill`; standalone `standstill` fires separately — non-blocking)
- Grade-level warning on entry 04 (non-blocking; single sentence below threshold)

## Diagnosis note

Entry 06 grade-level path `body > troubleshooter[12] > item[1] > cause` was initially mis-attributed to item[0] (the first troubleshooter item). The index in the path is 0-based in the `items` array, so item[1] is the second item. After correctly targeting item[1] and rewriting both cause and fix, the error cleared.

## Counts

- Animals & smallholding: 161 → **171**
- Sub-category breakdown: bees=32, poultry=32, smallholding-skills=31, sheep-and-goats=29, pigs=26, rabbits=21
- All categories published: **4,898**
