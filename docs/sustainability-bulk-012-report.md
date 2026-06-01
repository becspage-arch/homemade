# Sustainability bulk-012 — batch report

**Date:** 2026-06-01
**Status:** 56 uploaded, 56 net-new PUBLISHED; 7 pre-existing dropped after 3 voice-check retries

## Context

This batch found 25 pre-existing untracked brief files in `docs/sustainability-bulk-012-briefs/` from an incomplete previous session. 23 of those were unpublished (2 were already in the DB). This batch merged those 23 with 40 newly authored entries, for a total of 63 candidates, and uploaded all 56 that passed voice-check.

## Sub-category breakdown (new entries authored this session)

| Sub-category | Authored | Uploaded |
|---|---|---|
| insulation-and-draughtproofing | 10 new + 13 pre-existing | 16 |
| solar-and-energy | 8 new + 8 pre-existing | 13 |
| composting | 8 new + 8 pre-existing | 13 |
| water | 6 new | 6 |
| waste-reduction | 5 new | 5 |
| off-grid | 3 new | 3 |
| **Total** | **63 candidates** | **56** |

## Count movement

437 → 493 PUBLISHED (+56)

## Notable entries (new 40)

- **Insulating an attic room with a sloped ceiling**: between-rafter + below-rafter layer strategy; ventilation baffle sizing.
- **Multifoil insulation evidence review**: BBA certificate reality vs marketing claims; real-world U-values.
- **Thermal mass and passive solar design**: south glazing sizing rules; summer overheating risk.
- **External shutters for summer overheating**: roller shutters vs venetian blinds; g-value comparison.
- **Blown cellulose cavity fill**: comparison with mineral wool bead; hygroscopic behaviour.
- **Summer overheating risk assessment**: data-logging thermometer method; AD O threshold.
- **Boiler interlock and pump overrun**: wiring checks; weather compensation curve enabling.
- **Lacto-fermentation for food preservation**: salt ratios; brine method; kahm yeast vs spoilage.
- **Bokashi warm weather management**: bran adjustment; white vs black mould distinction.
- **Underground rainwater harvesting tank**: sizing calculation; Building Regs Part G notification; realistic payback (honest: doesn't pencil at current water rates).
- **Off-grid refrigeration**: 12V compressor vs gas absorption; seasonal performance comparison.
- **Composting toilet urine diversion**: urine as fertiliser dilution ratios; England/Wales legal position.
- **Wood stove back boiler**: always open vented; HETAS approval; gravity circulation pipe sizing.

## Voice-check fixes applied

**New 40 files:** All 40 pass after 1 round of fixes. Common issues: grade-level (paragraph complexity) in technical content, one banned-phrase ("genuinely"), one medical-claim ("treats" used as a verb), one institutional-in-body ("NHS").

**Pre-existing 23 files:** 16 pass after 2-3 rounds of fixes. 7 dropped at 3-retry cap:
- 01-external-wall-insulation-ewi-installation (grade-level)
- 02-cavity-wall-insulation-installation-process (grade-level)
- 05-dormer-warm-roof-insulation (grade-level)
- 10-spray-applied-airtightness-membrane (grade-level)
- 13-dc-coupled-vs-ac-coupled-solar-battery (grade-level)
- 15-air-source-heat-pump-installation-overview (grade-level, 23.5 grade in MCS design list)
- 17-radiator-sizing-for-heat-pump-compatibility (grade-level in formula paragraph)

## Hero images

56/56 heroes filled via `fixup-hero-fill.ts`:
- unsplash: 35
- pexels: 18
- flux-schnell: 3
- failed: 0

## Post-publish QC

Run: `qc-fix.ts --recently-published --since "2 hours ago" --auto-fix`
- processed: 56, pass: 29, still_blocked: 27 (pre-existing unfixable pattern — handed to hourly qc-fix-batch)

## Dropped files (7) — requeue for next session

These 7 pre-existing files need deeper grade-level rewriting before they can upload. They remain in `docs/sustainability-bulk-012-briefs/` but were not uploaded.
