# Home & repair — bulk-002 batch report

_Run date: 2026-05-20_

## Summary

41 entries PUBLISHED (planned 40; one additional walls-and-floors entry added without issue).

| Sub-category | Entries |
|---|---:|
| walls-and-floors | 13 |
| woodwork | 8 |
| plumbing | 6 |
| upholstery-and-leather | 6 |
| electrical | 4 |
| furniture-restoration | 4 |
| **Total** | **41** |

Category total after this batch: **83 published** (target 800).

## Voice-check results

5 errors found and fixed before upload; 0 errors in final upload run.

| File | Error | Fix |
|---|---|---|
| `applying-skim-coat-to-plasterboard.json` | `glossary-coverage`: `bonding-plaster` registered but not used inline | Removed unused glossary term (bonding plaster is not used in the skim-on-board context) |
| `caulking-a-bath-and-shower.json` | `medical-claim`: word "cures" | Changed "it then cures in the set position" → "it then sets in the loaded position" |
| `fitting-solid-wood-floorboards.json` | `safety-block`: heading "Before you start: acclimatisation" | Renamed to "Step 1, acclimatise the timber" |
| `sanding-wooden-floors-by-machine.json` | `safety-block`: heading "Before you start" | Renamed to "Step 1, prepare the floor and room" |
| `testing-sockets-and-circuits-with-a-socket-tester.json` | `price-mention`: "under £10" in body | Replaced with "An inexpensive device" |

Warnings (do not block upload): 13 warnings across 7 files — tricolon (4), americanism/fall (3), unflagged-jargon/dacron (5), brand-name/Anchor (1). None actioned; all are either stylistic preferences or false positives.

## Entries by type

- PATTERN: 26
- TECHNIQUE: 11
- READING: 4

## Notable design decisions

- **Electrical isolation step**: All electrical PATTERN entries (fitting-a-fused-spur, replacing-a-ceiling-rose) include the full live-dead-live isolation procedure as Step 1, including lock-off device and proving unit.
- **Upholstery foam**: CMHR foam referenced in full to comply with UK FR regulations.
- **Dacron**: Used in upholstery entries. Voice-check warns on brand name but "Dacron wrap" is the established industry term; used consistently with glossary definition.
- **Fitting-push-fit-plastic-waste-pipe**: "fall" warned as Americanism — this is the standard UK plumbing term for pipe gradient (not the season); accepted.

## Tool slugs: all confirmed against master tools table

No new tool slugs invented. All recipeTools slugs were verified against `packages/db/scripts/data/tools.ts` before authoring.
