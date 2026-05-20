# Mindset bulk-021 — Batch Report

**Date:** 2026-05-20
**Autopilot run:** queue round-robin (mindset was oldest `lastAutopilotRunAt`)
**Entries:** 40 PUBLISHED (all CREATED)
**Mindset count:** 805 → 845

---

## Slice

10 life categories, 4 entries each, balanced by practice type.

| Category | Slugs |
|---|---|
| BODY (×4) | tapping-for-body-overwhelm, my-body-has-time-so-do-i, what-does-good-enough-with-my-body-look-like, the-all-or-nothing-body-trap |
| HOME (×4) | tapping-for-i-cant-afford-to-decorate, decorating-with-what-you-have, perfect-is-a-trap-real-is-the-win, one-small-upgrade-in-one-room-this-week |
| MOTHERHOOD (×4) | tapping-for-working-mum-guilt, working-is-part-of-how-i-love-them, working-mum-guilt-the-long-view, what-does-my-work-give-my-children |
| GRIEF (×4) | tapping-for-the-should-be-over-it-pressure, my-grief-is-allowed-to-come-and-go, a-letter-to-them-today, an-anniversary-grief-ritual |
| SPIRITUALITY (×4) | tapping-for-inherited-religion, inherited-religion-and-what-to-do-with-it, ten-minutes-outside-daily, what-does-prayer-mean-to-me |
| TIME (×4) | tapping-for-the-over-promised-week, no-is-allowed-no-is-whole, the-art-of-the-no, what-am-i-postponing-until-conditions-are-perfect |
| HEALTH (×4) | tapping-during-the-panic, panic-attacks-whats-happening-what-helps, late-diagnosis-adhd-in-women, what-does-this-diagnosis-explain |
| RELATIONSHIPS (×4) | tapping-for-we-cant-talk-anymore, the-same-fight-on-repeat, the-pattern-can-break, what-is-this-fight-actually-about |
| FORGIVENESS (×4) | when-you-cant-forgive, a-self-forgiveness-ritual, tapping-for-the-wait-for-apology-trap, forgiveness-can-be-revisited |
| AGEING (×4) | tapping-for-turning-50, fifty-the-under-rated-decade, what-do-i-want-this-decade-to-be, my-age-is-mine-to-be |

## Practice type mix

- TAPPING ×10 (25%)
- READING ×10 (25%)
- JOURNAL_PROMPT ×8 (20%)
- AFFIRMATION ×8 (20%)
- RITUAL ×2 (5%)
- ACTIVITY ×1 (2.5%)
- (1 READING entry uses ACTIVITY practiceType — ten-minutes-outside-daily)

## Difficulty

- BEGINNER ×36
- INTERMEDIATE ×4 (tapping-for-inherited-religion, tapping-during-the-panic, a-letter-to-them-today, tapping-for-we-cant-talk-anymore)

---

## Voice-check fix log

**Em-dash removal (body and excerpt):**
- decorating-with-what-you-have — em-dash in body paragraph[0]
- the-art-of-the-no — 2 em-dashes in body paragraph[8]
- panic-attacks-whats-happening-what-helps — 4 em-dashes in body paragraphs 0, 2, 4, 8
- late-diagnosis-adhd-in-women — 5 em-dashes in body paragraphs 0, 2, 5, 6, 8
- the-same-fight-on-repeat — em-dash in body paragraph[2]
- fifty-the-under-rated-decade — 2 em-dashes in body paragraph[7]
- tapping-for-turning-50 — em-dash in excerpt

**Banned phrase "honest/honestly":**
- the-art-of-the-no — "honest answer" → "real answer"
- what-am-i-postponing-until-conditions-are-perfect — "honest number" → "actual number"
- what-do-i-want-this-decade-to-be — "honest assessment" in excerpt, "honestly?" in heading
- when-you-cant-forgive — "honest response" → "defensible response"

**Banned phrase "genuinely":**
- when-you-cant-forgive — subtitle "genuinely isn't available yet" → "isn't available yet"

**Banned phrase "at the end of the day":**
- tapping-for-working-mum-guilt — removed from body intro paragraph

**Glossary coverage:**
- tapping-for-body-overwhelm — "eft-tapping" in glossaryTerms but not used inline → removed from glossaryTerms

**Brand trademark false positives (fixed):**
- tapping-for-body-overwhelm — "kinder" (adjective) flagged as Kinder brand → "gentler"
- an-anniversary-grief-ritual — "Anchor" heading (step name) → "Ground it"
- inherited-religion-and-what-to-do-with-it — "anchor" (noun/verb) → "point of return"
- tapping-during-the-panic — "anchor" in excerpt and body → "hold on to" / "point of return"

**Tricolon warning:**
- when-you-cant-forgive — three-item list in paragraph[4] reduced to two; REACH model rephrased to avoid list

**0 upload failures.**

---

## Pattern notes (for anti-tells tracking)

- Em-dash in body prose: present in 7 files (40 total) — consistent recurrence, already documented
- "Honest/honestly" in body/excerpt/heading: 4 files — already a known pattern
- Brand-trademark false positives on "anchor" as verb/noun: 3 files — "anchor" is a practical mindset term and will keep triggering this; consider rephrasing as "grounding point" or "point of return" when authoring
