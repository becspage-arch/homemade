# Mindset bulk-006 batch report

**Date:** 2026-05-18  
**Session type:** Autopilot (context-split — continued from prior window after SLEEP Day 11 TAPPING entry)  
**Sources:** MONEY: A 12-Week Tapping Program (Days 18–21) + SLEEP: A 30-Day Tapping Intensive (Days 11–14)

---

## Batch stats

| Metric | Value |
|---|---|
| Entries authored | 38 |
| Entries CREATED (new) | 37 |
| Entries UPDATED (re-upload) | 1 |
| Voice-check errors on first pass | 4 files |
| Voice-check errors on final pass | 0 |
| Voice-check warnings (false positives) | ~12 |
| Mindset PUBLISHED post-batch | 208 |

---

## Practice mix

| PracticeType | Count |
|---|---|
| TAPPING | 8 |
| AFFIRMATION | 8 |
| JOURNAL_PROMPT | 8 |
| VISUALISATION | 7 |
| ENERGY_STATEMENT | 5 |
| RITUAL | 1 |
| MEDITATION | 1 |
| **Total** | **38** |

All 38 are type PRACTICE.

---

## practiceTarget spread

MONEY 21, SLEEP 17, ANXIETY 19, ABUNDANCE 12, FEAR 8, STUCK 3, CONFIDENCE 2.

---

## Source coverage

- **MONEY Days 18–21 (21 entries):** Fear of being seen with money (Day 18), "I'll lose it if I get it" (Day 19), the hidden "no" to wealth and secondary gains (Day 20), and the Phase 1 close — safety and stability with money (Day 21). Included the Week 3 MONEY Journal Ritual (The Safety and Stability Activation).
- **SLEEP Days 11–14 (17 entries):** Healing the "I can't sleep" identity (Day 11), releasing fear of the night (Day 12), rest guilt and the productivity-equals-worth belief (Day 13), and unwinding mental loops at 3am (Day 14). Day 14 includes a MEDITATION entry (the noting practice, sourced from traditional Vipassana/PD).

---

## Voice-check fixes

4 files required error fixes before upload. All resolved — 0 blocking errors on final pass.

### Error patterns

**Banned phrases (3 files)**  
- `"honest"` — 2 journal files; replaced with `"Write the answer plainly"` / `"Write the answer directly"`.
- `"honestly"` — 1 file (subtitle of `what-part-of-me-doesnt-actually-want-this-journal`); removed from subtitle.

**Negation pattern (1 file)**  
`what-am-i-afraid-people-will-say-if-i-have-it-journal.json` — `"not just X but Y"` construction in the body intro paragraph. Restructured to a direct sentence.

### Pre-upload fixes (not blocked by voice-check, caught by self-critique)

**Em-dash pairs (7 instances, 6 files)**  
Appositive `— X —` constructions in body prose. All converted to parentheses `(X)`.

**Invalid practiceTarget enum (9 files)**  
`"STRESS"` is not a valid PracticeTarget enum value (closest valid value is `"ANXIETY"`). Substituted on three files that had only STRESS; removed on six files that had ANXIETY alongside STRESS. Cause: the enum was not consulted during authoring.

---

## Quality trend

| Batch | Entries | First-pass errors |
|---|---|---|
| bulk-003 | 40 | 14 files |
| bulk-004 | 40 | 6 files |
| bulk-005 | 48 | 20 files |
| bulk-006 | 38 | 4 files |

The `"STRESS"` enum issue is a new failure pattern not seen in previous batches. Directly caused by using a target outside the schema enum — the `ANXIETY` value is the correct replacement. Added to mental checklist for future batches.

---

## Files

- Briefs: `docs/mindset-bulk-006-briefs/` (38 JSON files)
