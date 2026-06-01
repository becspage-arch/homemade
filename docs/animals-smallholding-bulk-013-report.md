# animals-smallholding bulk-013 batch report

**Date:** 2026-06-01
**Session type:** autopilot-queue (single-queue round-robin)
**Category:** animals-smallholding
**Published count:** 288 → 326 (+38 net new)
**Batch target:** 40 entries authored and uploaded
**Target:** 700

## Sub-category distribution

| Sub-category | Count | Slugs |
|---|---|---|
| bees | 6 | artificial-swarm-method, honey-bottling-and-labelling, varroa-oxalic-acid-winter-treatment, summer-hive-inspection-walkthrough, buying-a-nucleus-hive-what-to-check, bee-stings-minimising-and-managing |
| poultry | 6 | broody-breaking-a-hen, selecting-a-laying-breed, fitting-electric-poultry-netting, treating-aspergillosis-in-chicks, raising-chicks-to-point-of-lay, setting-up-a-chicken-coop-from-scratch |
| sheep-and-goats | 7 | shearing-a-sheep-with-hand-shears, treating-orf-in-sheep-and-goats, lamb-colostrum-management, goat-worming-and-faecal-egg-count, milking-equipment-cleaning-and-sterilising, scrapie-awareness-and-notifiable-disease-obligations, sheep-lice-and-keds-identification-and-treatment |
| pigs | 7 | notifying-pig-movements-on-eaml2, pig-heat-detection-and-natural-mating, pig-creep-feeding-before-weaning, pig-abattoir-preparation-final-weeks, managing-pig-slurry-on-a-smallholding, pig-teeth-clipping-in-newborn-piglets, managing-finisher-pigs-growth-and-condition |
| rabbits | 7 | rabbit-handling-and-restraint, rabbit-bonding-two-rabbits, rabbit-pasteurellosis-management, rabbit-enrichment-and-foraging-behaviour, rabbit-coccidiosis-in-kits, rabbit-deep-litter-colony-bedding, rabbit-ear-infection-recognition-and-treatment |
| smallholding-skills | 7 | notifiable-livestock-disease-reporting, grazing-rotation-planning-for-small-flocks, stock-netting-installation-and-tensioning, smallholding-field-water-supply-setup, livestock-medication-storage-and-disposal, keeping-a-livestock-health-diary, reading-and-completing-livestock-movement-forms |
| **Total** | **40** | |

## Voice-check fixes

All 40 files passed voice-check before upload (23 clean exit 0, 17 warnings-only exit 1).

Systematic issues fixed across the batch (all em-dashes replaced by fix script; targeted fixes for remaining issues):

- **Em-dashes** (40 files): batch script replaced all ` — ` with `, ` or ` (parenthetical) `. File 39 diary-example text was manually repaired after script over-applied parentheses.
- **Grade-level rewrites** (21 files): Sentence splitting and vocabulary simplification. Key problem areas: veterinary Latin terms (Pasteurellosis, Aspergillosis, Encephalitozoon cuniculi), long multi-clause sentences in disease management paragraphs.
- **DEFRA in body** (4 files): Replaced with "UK welfare codes" or "UK law".
- **Price mentions** (2 files): Removed £10-15 per FEC test and £2,000 fine figures.
- **Medical claim "cures"** (1 file): Replaced with "suppresses the infection".
- **Safety heading "Before you start"** (1 file): Renamed to "Preparation".
- **Unused glossary term** (1 file): `supersedure-cell` removed from file 04 (term only appeared in troubleshooterItem.cue attrs, not a scannable body text node).
- **projectSchedule field names** (2 files): PATTERN tutorials had wrong field names (`day`/`label`/`description`). Fixed to `stepNumber`/`offsetDays`/`title`/`body`.

## Hero fill

40 heroes filled: 38 pexels, 1 unsplash, 1 flux-schnell, 0 failed.

## QC auto-fix

processed=40, pass=31, still_blocked=9 (hourly qc-fix-batch handles).

## Chain counter

Consecutive autopilot batches since last human commit (`fix(qc): exempt verbatim text`, 2026-05-31): **3/10**

This fire ran on Claude Sonnet 4.6.
