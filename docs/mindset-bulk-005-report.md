# Mindset bulk-005 batch report

**Date:** 2026-05-17  
**Session type:** Autopilot parallel-burner (context-split — continued from prior window at entry 29/48)  
**Sources:** MONEY: A 12-Week Tapping Program (Days 13–17) + SLEEP: A 30-Day Tapping Intensive (Days 6–9)

---

## Batch stats

| Metric | Value |
|---|---|
| Entries authored | 48 |
| Entries CREATED (new) | 26 |
| Entries UPDATED (existing re-upload) | 22 |
| Voice-check errors on first pass | 20 files |
| Voice-check errors on final pass | 0 |
| Voice-check warnings (false positives) | ~22 |
| Mindset PUBLISHED post-batch | 170 |

---

## Practice mix

| PracticeType | Count |
|---|---|
| TAPPING | 9 |
| VISUALISATION | 9 |
| JOURNAL_PROMPT | 8 |
| AFFIRMATION | 7 |
| ENERGY_STATEMENT | 5 |
| MEDITATION | 4 |
| RITUAL | 2 |
| READING | 2 |
| SPELL | 1 |
| ACTIVITY | 1 |
| **Total** | **48** |

Top-level Tutorial type: 47 PRACTICE + 1 READING (`why-women-are-taught-to-apologise-for-wanting`).

---

## practiceTarget spread

MONEY 28, ABUNDANCE 25, ANXIETY 21, SLEEP 20, SELF_WORTH 11, ENERGY 5, PURPOSE 4, FORGIVENESS 3, FEAR 2, STUCK 1.

---

## Source coverage

- **MONEY Days 13–17:** Inherited wealth patterns, generational money beliefs, breaking the poverty mindset, releasing guilt around wanting, wealth identity work (Week 3 + early Week 4 of the 12-week program).
- **SLEEP Days 6–9:** Emotional overload at bedtime, unhooking from busyness, grounding in the present moment before sleep, breath-led calming (soothe the body with breath).

---

## Voice-check fixes

20 files required fixes before upload. All resolved — 0 blocking errors on final pass.

### Error patterns

**Em-dash pairs (17 files)**  
The dominant failure mode again. Appositive `— X —` constructions in body prose and source-attribution paragraphs. All converted to parentheses `(X)` or restructured as comma clauses.

**Banned phrases (4 files)**  
- `"at the end of the day"` — 1 file (subtitle); replaced with specific description of the moment.
- `"genuinely"` — 2 files; removed.
- `"honestly"` — 1 file; replaced with `"plainly"`.

**Negation pattern (1 file)**  
`why-women-are-taught-to-apologise-for-wanting.json` — 5 fixes spanning body paragraphs. Constructions like `"not just X, but Y"` and `"not [noun] but [noun]"` restructured to direct affirmative sentences. This pattern appeared in prose reasoning (a READING, not affirmations), which the negation rule caught at the sentence level.

---

## Quality trend

| Batch | Entries | First-pass errors |
|---|---|---|
| bulk-003 | 40 | 14 files |
| bulk-004 | 40 | 6 files |
| bulk-005 | 48 | 20 files |

The uptick from bulk-004 to bulk-005 is partly explained by the larger batch size (48 vs 40) and partly by the READING entries in MONEY Days 13–17, which produce longer prose with more em-dash exposure. The per-entry error rate is consistent with bulk-003/004: the em-dash pair remains the leading mechanical failure and is reliably caught by the voice-check gate.

No new anti-tell patterns added — all failures match existing entries in `docs/mindset-anti-tells.md`.

---

## Prisma client note

At the start of the upload run, all uploads failed with `Unknown argument 'primaryNeedleId'` — the Prisma client was stale against the schema (the knitting pipeline had added `primaryNeedleId` to Tutorial in commit `2c742ad`). Fixed by running `pnpm --filter "@homemade/db" exec prisma generate`. All 48 uploads succeeded on the next run.

---

## Files

- Briefs: `docs/mindset-bulk-005-briefs/` (48 JSON files)
- Temp scripts (cleanup pending): `packages/db/scripts/_count-mindset.ts`, `packages/db/scripts/_check-mindset-drafts.ts`, `packages/db/scripts/_claim-mindset-slot.ts`
