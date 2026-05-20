# animals-smallholding bulk-001 report

**Date:** 2026-05-20  
**Batch:** bulk-001  
**Category:** animals-smallholding  
**Status:** PUBLISHED

## Counts

| Sub-category | Entries this batch | Running total |
|---|---|---|
| bees | 7 | 8 |
| poultry | 7 | 8 |
| sheep-and-goats | 7 | 7 |
| rabbits | 4 | 4 |
| pigs | 7 | 7 |
| smallholding-skills | 8 | 8 |
| **Total** | **40** | **42** |

(Totals include 2 pre-existing entries: setting-up-a-chicken-coop-for-first-time-keepers and inspecting-a-beehive-in-summer)

## Entries published

### Bees (7)
- lighting-a-bee-smoker — TECHNIQUE, YEAR_ROUND, BEGINNER
- adding-a-honey-super — TECHNIQUE, SPRING, BEGINNER
- swarm-control-artificial-swarm — TECHNIQUE, SPRING, INTERMEDIATE
- autumn-feeding-sugar-syrup-to-bees — TECHNIQUE, AUTUMN, BEGINNER
- oxalic-acid-trickle-treatment-for-varroa — TECHNIQUE, WINTER, INTERMEDIATE
- harvesting-honey-uncapping-and-extracting — TECHNIQUE, SUMMER, INTERMEDIATE
- the-uk-bee-year — READING, YEAR_ROUND, BEGINNER

### Poultry (7)
- introducing-new-hens-to-an-existing-flock — TECHNIQUE, SPRING, BEGINNER
- breaking-a-broody-hen — TECHNIQUE, SUMMER, BEGINNER
- raising-chicks-to-point-of-lay — PATTERN, SPRING, INTERMEDIATE (8-step schedule)
- fitting-electric-poultry-netting — TECHNIQUE, YEAR_ROUND, BEGINNER
- deep-litter-method-for-coop-management — TECHNIQUE, WINTER, BEGINNER
- treating-red-mite-in-a-chicken-coop — TECHNIQUE, SUMMER, INTERMEDIATE
- choosing-your-first-laying-hens — READING, SPRING, BEGINNER

### Sheep and goats (7)
- hoof-trimming-a-sheep — TECHNIQUE, YEAR_ROUND, INTERMEDIATE
- drenching-sheep-with-an-oral-wormer — TECHNIQUE, SPRING, BEGINNER
- putting-the-ram-in-for-tupping — TECHNIQUE, AUTUMN, INTERMEDIATE
- assisting-a-stuck-lamb-at-lambing — TECHNIQUE, SPRING, ADVANCED
- colostrum-and-newborn-lamb-management — TECHNIQUE, SPRING, INTERMEDIATE
- hand-shearing-a-small-flock — TECHNIQUE, SUMMER, ADVANCED
- understanding-the-sheep-year — READING, YEAR_ROUND, BEGINNER

### Rabbits (4)
- setting-up-a-meat-rabbit-colony — PATTERN, SPRING, BEGINNER (7-step schedule)
- handling-and-sexing-rabbits — TECHNIQUE, YEAR_ROUND, BEGINNER
- preventing-flystrike-in-rabbits — TECHNIQUE, SUMMER, BEGINNER
- dispatching-and-paunching-a-rabbit — TECHNIQUE, YEAR_ROUND, INTERMEDIATE

### Pigs (7)
- buying-weaners-and-settling-them-in — PATTERN, SPRING, BEGINNER (7-step schedule)
- setting-up-electric-fencing-for-pigs — TECHNIQUE, SPRING, BEGINNER
- daily-feeding-and-checking-pigs — TECHNIQUE, YEAR_ROUND, BEGINNER
- mucking-out-a-pig-arc — TECHNIQUE, YEAR_ROUND, BEGINNER
- moving-pigs-with-a-pig-board — TECHNIQUE, YEAR_ROUND, BEGINNER
- worming-pigs — TECHNIQUE, YEAR_ROUND, INTERMEDIATE
- the-weaner-to-bacon-arc — PATTERN, SPRING, INTERMEDIATE (6-step schedule)

### Smallholding skills (8)
- getting-a-cph-number-before-your-first-livestock — READING, YEAR_ROUND, BEGINNER
- setting-up-electric-fencing-on-a-smallholding — TECHNIQUE, YEAR_ROUND, BEGINNER
- planning-rotational-grazing-paddocks — TECHNIQUE, SPRING, INTERMEDIATE
- building-a-hay-rack-for-livestock — TECHNIQUE, AUTUMN, BEGINNER
- stacking-and-turning-a-muck-heap — TECHNIQUE, YEAR_ROUND, BEGINNER
- setting-up-a-piped-water-supply-for-livestock — TECHNIQUE, YEAR_ROUND, INTERMEDIATE
- understanding-the-6-day-movement-standstill — TECHNIQUE, YEAR_ROUND, BEGINNER
- keeping-smallholding-livestock-records — TECHNIQUE, YEAR_ROUND, BEGINNER

## New tool slugs added

9 new tools seeded in `packages/db/scripts/data/tools.ts`:
- queen-excluder, national-frame, uncapping-fork, honey-settling-tank
- livestock-water-trough, electric-fence-stake, hay-rack, rabbit-cage, killing-cone

## Voice-check notes

- 1 blocking error fixed: `fitting-electric-poultry-netting` had a "Before you start" safety-section heading — removed and content merged inline.
- 4 PATTERN files had projectSchedule schema mismatch (day/label/description|notes instead of offsetDays/title/body + stepNumber) — fixed with Node transform before upload.
- Remaining warnings are false positives: "fall" as a physical verb flagged as the Americanism for autumn; "Target" as a common noun flagged as the US retail brand.
