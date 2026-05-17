# Mindset bulk-003 report

**Date:** 2026-05-17  
**Model:** claude-sonnet-4-6 (parallel-burner loop)  
**Outcome:** 40 PUBLISHED, 0 dropped. Mindset 24 → 64.

---

## Source coverage

| Source | Days covered | Entries |
|---|---|---:|
| MONEY: A 12-Week Tapping Program | Days 2–7 | 35 |
| SLEEP: A 30-Day Tapping Intensive | Days 1–2 | 5 |

---

## Practice type breakdown

| PracticeType | Count |
|---|---:|
| TAPPING | 8 |
| ENERGY_STATEMENT | 6 |
| AFFIRMATION | 7 |
| RITUAL | 2 |
| JOURNAL_PROMPT | 6 |
| VISUALISATION | 3 |
| MEDITATION | 2 |
| EMBODIMENT | 2 |
| ACTIVITY | 3 |
| READING (type: READING) | 2 |
| SPELL | 1 |
| **Total** | **40** |

---

## practiceTarget spread

| Target | Count |
|---|---:|
| MONEY | 22 |
| ANXIETY | 20 |
| SLEEP | 9 |
| ABUNDANCE | 8 |
| FEAR | 7 |
| SELF_WORTH | 5 |
| BODY | 5 |

---

## Voice-check fixes applied

14 fixes across 12 files:

- **Em-dash pairs** (13 instances across 9 files): replaced with colon+comma construction, parentheses, or comma clauses per the anti-tells rule (max 1 em dash per paragraph and per sentence). Files affected: `i-release-money-shame-i-release-it-now`, `i-did-the-best-i-could-with-what-i-knew`, `bills-show-a-life-worth-running`, `when-money-arrives-what-do-i-do`, `shame-about-past-money-mistakes-journal`, `a-level-pool-not-a-churning-sea`, `visualise-the-sleep-space`, `the-feast-and-famine-money-cycle-explained`, `why-debt-obsession-grows-in-the-dark`, `hand-on-belly-bills-are-met`, `my-body-knows-how-to-rest`, `i-release-the-need-to-force-sleep`.
- **Invalid timeBand FIFTEEN_MIN → TWENTY_MIN** (6 files): `FIFTEEN_MIN` is not in the `TimeBand` enum. 15-minute journal prompts and the pre-sleep activity should use `TWENTY_MIN`. Files: `shame-about-past-money-mistakes-journal`, `when-money-arrives-what-do-i-do`, `bills-always-win-journal`, `the-pre-sleep-bedtime-activity`, `what-is-my-debt-story-journal`, `running-out-fear-journal`.
- **Invalid timeBand ONE_MIN → THREE_MIN** (1 file): `ONE_MIN` is not in the `TimeBand` enum. File: `open-the-banking-app-exhale-and-close-it`.
- **Invalid practiceTarget RELAXATION → BODY** (6 files): `RELAXATION` is not in the `PracticeTarget` enum. Files: `visualise-the-sleep-space`, `the-pre-sleep-bedtime-activity`, `i-release-the-need-to-force-sleep`, `tapping-to-let-the-muscles-melt`, `tapping-to-release-the-grip-of-tension`, `tapping-to-let-the-day-go`.

---

## Patterns to carry into bulk-004

1. **FIFTEEN_MIN not in TimeBand enum.** Add to author prompt: "For 15-minute journal prompts use `TWENTY_MIN`." Add to anti-tells.
2. **RELAXATION not in PracticeTarget enum.** Add to author prompt: "Use `BODY` for physical-settling or tension-release targets; use `ENERGY` for fatigue / depletion targets. Do not use RELAXATION."
3. **Em-dash pairs remain the highest-frequency error class** in prose-heavy entries (journal prompts, readings, affirmation "how to use" sections, READING body paragraphs). The self-critique pass must explicitly scan for `— ... —` patterns before filing.

---

## Entries published

### MONEY — Day 2 (running-out fear / feast-famine intro)
- `running-out-fear-journal` — JOURNAL_PROMPT

### MONEY — Day 3 (bills-always-win)
- `tapping-for-bills-always-win` — TAPPING (uploaded in prior session)
- `bills-are-met-i-am-met` — ENERGY_STATEMENT
- `paying-a-bill-is-moving-money-not-losing-it` — AFFIRMATION
- `bills-show-a-life-worth-running` — AFFIRMATION
- `bills-always-win-journal` — JOURNAL_PROMPT

### MONEY — Day 4 (feast-or-famine cycle)
- `i-can-hold-a-full-account-without-bracing` — ENERGY_STATEMENT
- `a-level-pool-not-a-churning-sea` — VISUALISATION
- `arms-open-i-allow-steady-income` — EMBODIMENT
- `when-money-arrives-what-do-i-do` — JOURNAL_PROMPT
- `the-feast-and-famine-money-cycle-explained` — READING (type: READING)

### MONEY — Day 5 (money shame / past mistakes)
- `i-release-money-shame-i-release-it-now` — ENERGY_STATEMENT
- `i-did-the-best-i-could-with-what-i-knew` — AFFIRMATION
- `washing-money-shame-clean` — VISUALISATION
- `the-mistake-letter-ritual` — RITUAL
- `shame-about-past-money-mistakes-journal` — JOURNAL_PROMPT

### MONEY — Day 6 (debt obsession)
- `i-release-debt-fear-and-allow-steady-flow` — ENERGY_STATEMENT
- `i-look-at-my-balance-from-steady-ground` — AFFIRMATION
- `open-the-banking-app-exhale-and-close-it` — ACTIVITY
- `track-every-pound-coming-in-for-a-week` — ACTIVITY
- `what-is-my-debt-story-journal` — JOURNAL_PROMPT
- `why-debt-obsession-grows-in-the-dark` — READING (type: READING)

### MONEY — Day 7 (peace around bills)
- `tapping-for-peace-around-bills` — TAPPING (uploaded in prior session)
- `bless-and-pay-ritual` — RITUAL
- `three-breath-reset-before-opening-bills` — MEDITATION
- `hand-on-belly-bills-are-met` — EMBODIMENT
- `the-bill-bless` — SPELL

### SLEEP — Day 1 (start where you are / exhaustion)
- `tapping-to-start-where-you-are` — TAPPING
- `my-body-knows-how-to-rest` — AFFIRMATION
- `visualise-the-sleep-space` — VISUALISATION
- `the-pre-sleep-bedtime-activity` — ACTIVITY

### SLEEP — Day 2 (tension / physical holding)
- `tapping-to-release-the-grip-of-tension` — TAPPING (daytime)
- `tapping-to-let-the-day-go` — TAPPING (night)
- `tapping-to-let-the-muscles-melt` — TAPPING (night)
- `i-release-the-need-to-force-sleep` — ENERGY_STATEMENT
- `slow-exhale-body-scan-for-financial-anxiety` — MEDITATION

### Cross-MONEY (multiple days)
- `tapping-for-money-shame` — TAPPING (uploaded in prior session)
- `tapping-for-debt-obsession` — TAPPING (uploaded in prior session)
- `tapping-for-the-feast-or-famine-swing` — TAPPING (uploaded in prior session)

---

*Next batch (bulk-004): MONEY Days 8–12, SLEEP Days 3–5, first entries for ANXIETY and SELF_WORTH themes.*
