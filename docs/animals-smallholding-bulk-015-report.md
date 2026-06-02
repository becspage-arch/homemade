# Animals & smallholding bulk-015 report

**Date:** 2026-06-02
**Batch target:** 40 entries authored and uploaded
**Target:** 700

## Sub-category distribution

| Sub-category | Count | Slugs |
|---|---|---|
| bees | 7 | wiring-and-fitting-brood-frames, collecting-a-landed-swarm, combining-colonies-newspaper-method, using-a-queen-excluder-correctly, spring-stimulative-feeding-for-bees, varroa-alcohol-wash-monitoring, reading-brood-disease-symptoms |
| poultry | 7 | hatching-eggs-under-a-broody-hen, artificial-lighting-for-winter-egg-production, managing-khaki-campbell-ducks-for-eggs, treating-mycoplasma-in-a-laying-flock, fox-proofing-a-chicken-run, identifying-coccidiosis-in-chickens, managing-an-older-laying-flock |
| sheep-and-goats | 7 | hypothermia-in-newborn-lambs, preparing-a-raw-fleece-for-spinning, drying-off-a-dairy-goat, sheep-handling-pen-layout-and-construction, pneumonia-in-lambs-recognition-and-treatment, replacement-ewe-selection-and-retention, sheep-footbath-design-and-use |
| pigs | 6 | choosing-a-pig-breed-for-the-smallholding, winter-pig-management-deep-straw, mixing-pig-groups-safely, pig-first-aid-kit-and-injection-technique, estimating-carcass-yield-from-a-home-pig, herd-health-programme-pig-vaccination-calendar |
| rabbits | 6 | harvesting-and-tanning-a-rabbit-pelt, rabbit-foster-doe-management, rabbit-uterine-cancer-and-doe-spaying, building-a-rabbit-hay-rack, rabbit-colony-winter-in-a-hoop-house, rabbit-enteritis-in-young-kits |
| smallholding-skills | 7 | calculating-winter-feed-requirements-for-livestock, applying-for-a-cph-number, managing-livestock-during-a-standstill, dry-stone-wall-basic-repair, on-farm-injection-technique-for-livestock, field-drainage-assessment-and-maintenance, buying-and-storing-concentrates |
| **Total** | **40** | |

## Voice-check fixes

All 40 files passed voice-check before upload. Systematic issues fixed:

- **Em-dashes** (40 files): batch script replaced all ` — ` and `—` with commas or full stops. Script caught measurement ranges as well as prose dashes; four range values (40–60 cm, etc.) correctly read as "40 to 60" context after fix.
- **Grade-level rewrites** (18 files): sentence splitting and vocabulary simplification. Key problem areas: pharmaceutical/clinical terminology (mycoplasma, erysipelas, anaesthesia), multi-clause vet-guidance paragraphs, and measurement ranges converted from semi-colon lists.
- **Glossary coverage** (4 files): unused registered terms removed from glossaryTerms[]; one used-but-not-registered term (colostrum in file 19) given a new local slug to avoid collision with existing global term.
- **Safety-block headings** (2 files): "Before you start" renamed to "Preparation" (file 03) and "Gathering the stone" (file 37).
- **Banned phrase "genuinely"** (1 file): replaced with "properly".
- **Clinical vocab "anti-inflammatory"** (2 files): replaced with plain-language equivalents.
- **Price mention** (1 file): £200/£5,000 range removed from field-drainage file.
- **Americanism "broiler"** (1 file): replaced with "chickens".
- **Empty glossary definitions** (2 files): stub defs for "drake" and "doe" expanded to include an explanatory clause.
- **recipeTools unknown slugs** (4 files): frame-wire, wax-foundation, frame-nailer, embedding-tool, brood-box, nuc-box, hive-feeder, stomach-tube-lamb, lamb-warming-box — all removed (not in master Tool table). hive-tool-j, bee-suit, bee-smoker retained.
- **Trailing JSON comma** (2 files): stray commas after last array element fixed.

## Hero fill

40 heroes filled: 39 pexels, 1 unsplash, 0 flux-schnell, 0 failed.

## QC auto-fix

processed=40, pass=32, still_blocked=8 (hourly qc-fix-batch handles).

## Chain counter

Consecutive autopilot batches since last human commit (`e77e30f7`, feat(voice): bake spec into author prompts): **5/10**

## Model note

This fire ran on Claude Sonnet 4.6 (claude-sonnet-4-6). The scheduled-task frontmatter specifies `model: claude-sonnet-4-5` — there is a mismatch. The model used is the current session model (Sonnet 4.6), not the earlier 4-5 specified in the task file. Rebecca should update the task frontmatter to `model: claude-sonnet-4-6` if she wants to pin it, or remove the model pin to inherit the session default.
