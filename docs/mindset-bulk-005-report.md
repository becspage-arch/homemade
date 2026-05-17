# Mindset bulk-005 report

**Date:** 2026-05-17  
**Model:** claude-sonnet-4-6 (parallel-burner loop)  
**Outcome:** 40 PUBLISHED, 0 dropped. Mindset 104 → 142.

---

## Source coverage

| Source | Days covered | Entries |
|---|---|---:|
| MONEY: A 12-Week Tapping Program | Days 13–16 | 19 |
| The Money Journal: 12 Weeks to Peace, Freedom & Overflow | Days 13–16 (journal prompts + Week 2 ritual) | 7 |
| SLEEP: A 30-Day Tapping Intensive | Days 6–10 | 14 |

---

## Practice type breakdown

| PracticeType | Count |
|---|---:|
| TAPPING | 9 |
| ENERGY_STATEMENT | 5 |
| AFFIRMATION | 8 |
| VISUALISATION | 6 |
| MEDITATION | 4 |
| JOURNAL_PROMPT | 7 |
| RITUAL | 1 |
| **Total** | **40** |

---

## practiceTarget spread

| Target | Count |
|---|---:|
| MONEY | 19 |
| SLEEP | 21 |
| ANXIETY | 20 |
| ABUNDANCE | 13 |
| SELF_WORTH | 12 |
| BODY | 9 |
| FEAR | 7 |
| FORGIVENESS | 5 |
| ENERGY | 3 |
| PURPOSE | 2 |

---

## Voice-check fixes applied

13 fixes across 13 files:

- **Double em-dash in excerpt** (7 files): rewrote excerpts for `five-things-you-can-feel-four-you-can-hear`, `tapping-to-release-guilt-about-wanting-wealth`, `wanting-wealth-is-allowed`, `where-did-i-learn-that-wanting-was-wrong-journal` — replaced em-dash parentheticals with colons or commas. Remaining 3 had em-dashes in body paragraphs.
- **Double em-dash in body paragraph** (4 files): `tapping-for-emotional-overload-at-bedtime` (intro), `the-ancestral-release-and-wealth-lineage-activation` (prepare section), `the-bed-under-you-the-room-around-you` (mind-wander instruction), `the-feeling-acknowledged-the-feeling-at-rest` (bowl image), `the-to-do-list-parked-outside-the-bedroom-door` (door return instruction) — changed second em-dash to colon, period, or comma.
- **Stale glossaryTerms with no inline usage** (3 files): `tapping-to-allow-myself-to-be-the-wealthy-one` (eft-tapping, karate-chop-point, tapping-round), `the-wealthy-lineage-starts-here` (energy-statement), `the-ancestral-release-and-wealth-lineage-activation` (ritual) — cleared all to `[]`.
- **Banned phrase "genuinely"** (2 files): `what-can-wait-until-tomorrow-journal` and `what-is-true-in-this-present-moment-journal` — replaced with "cannot" / "actually".

---

## Patterns to carry into bulk-006

1. **Em-dash pairs in excerpts are the most common failure** — excerpts with `X — ... — Y` parenthetical style will always trigger. Rewrite with a colon for the opener or restructure to avoid the second dash.
2. **Stale glossaryTerms** — if the JSON has any entries in glossaryTerms, every term must also appear inline wrapped in a `glossaryTooltip` mark. If a batch session carries forward a template with glossaryTerms populated but no inline marks, strip them before uploading.
3. **"genuinely" is still banned** — same as bulk-004 finding. Flag in any instruction paragraph for journal prompts.

---

## Entries published

### MONEY — Day 13 (I am the wealthy one)
- `tapping-to-allow-myself-to-be-the-wealthy-one` — TAPPING
- `the-wealthy-lineage-starts-here` — ENERGY_STATEMENT
- `my-childrens-grandchildren-will-say-she-changed-everything` — AFFIRMATION
- `who-do-i-become-as-the-start-of-the-new-line-journal` — JOURNAL_PROMPT
- `looking-back-from-the-end-of-your-life-at-the-lineage-you-started` — VISUALISATION

### MONEY — Day 14 (the new family story)
- `tapping-for-the-new-family-story` — TAPPING
- `the-new-story-is-already-true` — ENERGY_STATEMENT
- `in-this-family-we-hold-money-well` — AFFIRMATION
- `the-ancestral-release-and-wealth-lineage-activation` — RITUAL
- `what-i-want-my-grandchildren-to-inherit-journal` — JOURNAL_PROMPT
- `the-new-family-story-written-into-the-wall` — VISUALISATION

### MONEY — Day 15 (release guilt about wanting wealth)
- `tapping-to-release-guilt-about-wanting-wealth` — TAPPING
- `my-wanting-is-sacred` — ENERGY_STATEMENT
- `wanting-wealth-is-allowed` — AFFIRMATION
- `where-did-i-learn-that-wanting-was-wrong-journal` — JOURNAL_PROMPT
- `telling-your-younger-self-she-is-allowed-to-want-this` — VISUALISATION

### MONEY — Day 16 (others can, not me)
- `tapping-to-let-go-of-others-can-not-me` — TAPPING
- `what-is-available-to-her-is-available-to-me` — ENERGY_STATEMENT
- `i-am-the-woman-who-has-it-now` — AFFIRMATION

### SLEEP — Day 6 (emotional overload at bedtime)
- `tapping-for-emotional-overload-at-bedtime` — TAPPING
- `what-feeling-is-asking-to-be-heard-tonight-journal` — JOURNAL_PROMPT
- `the-feeling-acknowledged-the-feeling-at-rest` — VISUALISATION
- `hand-on-heart-naming-whats-there` — MEDITATION
- `the-five-minute-evening-download` — RITUAL

### SLEEP — Day 7 (the busy mind)
- `tapping-for-the-busy-mind-unhooking` — TAPPING
- `i-am-allowed-to-stop-even-if-not-everything-is-done` — AFFIRMATION
- `what-can-wait-until-tomorrow-journal` — JOURNAL_PROMPT
- `the-to-do-list-parked-outside-the-bedroom-door` — VISUALISATION
- `write-tomorrows-three-priorities-close-the-notebook` — ACTIVITY

### SLEEP — Day 8 (come back to now)
- `tapping-to-come-back-to-now` — TAPPING
- `five-things-you-can-feel-four-you-can-hear` — MEDITATION
- `the-bed-under-you-the-room-around-you` — VISUALISATION
- `right-now-is-enough` — AFFIRMATION
- `what-is-true-in-this-present-moment-journal` — JOURNAL_PROMPT

### SLEEP — Day 9 (soothe the body with breath)
- `tapping-for-breath-led-calm` — TAPPING
- `4-7-8-breath-four-rounds` — MEDITATION
- `box-breathing-equal-sides` — MEDITATION

### SLEEP — Day 10 (anchor calm as the default)
- `tapping-to-anchor-calm-as-the-default` — TAPPING
- `calm-is-who-i-am-at-night` — AFFIRMATION
- `what-does-being-a-person-who-sleeps-well-feel-like-journal` — JOURNAL_PROMPT

---

*Next batch (bulk-006): MONEY Days 17–20 + SLEEP Days 11–13.*
