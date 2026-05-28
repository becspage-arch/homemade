# Mindset bulk-022 — Batch Report

**Date:** 2026-05-28
**Autopilot run:** queue round-robin via `autopilot-queue-extra` (mindset had oldest `lastAutopilotRunAt`)
**Routine model:** preferred Sonnet per `feedback_model_choice.md`; this fire ran on **Opus 4.7 (1M context)** — `claude-opus-4-7[1m]`
**Entries:** 40 PUBLISHED (all CREATED)
**Mindset count:** 845 → 885

---

## Slice

Top 10 life-categories by gap-to-target weight, 4 entries each. Practice-type spread targets the under-served sub-categories (RITUAL, ACTIVITY, MEDITATION, EMBODIMENT, SPELL).

| Category | Weight | Slugs |
|---|---:|---|
| BODY (×4) | 0.950 | hand-on-belly-hand-on-heart-three-rounds-of-breath, inner-safety-scan, the-slow-road-with-you-walking-calmly-down-it, why-where-you-are-is-the-only-starting-place-that-works |
| HOME (×4) | 0.900 | the-house-spell, rearrange-one-shelf-today, how-to-make-todays-home-feel-like-the-dream, the-sunday-slow-morning |
| MOTHERHOOD (×4) | 0.898 | tapping-for-mum-rage, matrescence, the-10-minute-reclaim, who-was-i-before-the-baby-where-is-she |
| AGEING (×4) | 0.897 | 40-as-a-beginning, a-40th-honouring, tapping-for-the-ageing-body, one-piece-youve-been-told-is-too-young |
| GRIEF (×4) | 0.874 | light-a-candle-for-them, tapping-for-the-parent-loss, when-a-parent-dies, what-did-i-lose-when-i-lost-them-beyond-them |
| SPIRITUALITY (×4) | 0.857 | five-minute-gut-check, the-mid-life-what-do-i-actually-believe, one-sentence-of-prayer, my-spiritual-practice-is-mine-their-judgment-isnt |
| TIME (×4) | 0.847 | cancel-one-thing-this-week-with-kindness, the-mental-load, tapping-for-the-no, my-time-is-allowed-to-be-enough |
| HEALTH (×4) | 0.836 | what-anxiety-is-biologically, long-exhale-breath-six-rounds, one-small-thing-today-just-one, tapping-in-depression |
| RELATIONSHIPS (×4) | 0.819 | tapping-for-resentment-in-the-marriage, when-did-the-drift-start-quietly, we-can-learn-to-talk-again, the-sunday-money-date-for-couples |
| FORGIVENESS (×4) | 0.800 | tapping-for-the-event-i-cant-release, forgiveness-is-mine-to-choose-on-my-time, what-does-the-event-still-want-me-to-know, an-ancestor-forgiveness-ritual |

## Practice type mix

- TAPPING ×7 (17.5%)
- READING ×8 (20%) — at target
- RITUAL ×5 (12.5%) — bumping a thin sub-category (was 39)
- ACTIVITY ×5 (12.5%) — bumping a thin sub-category (was 29)
- AFFIRMATION ×4 (10%)
- JOURNAL_PROMPT ×4 (10%)
- MEDITATION ×3 (7.5%) — bumping a thin sub-category (was 20)
- VISUALISATION ×1 (2.5%)
- EMBODIMENT ×1 (2.5%) — bumping the thinnest sub-category (was 6)
- SPELL ×1 (2.5%) — bumping the thinnest sub-category (was 5)
- ENERGY_STATEMENT ×0 — skipped (already well-covered at 109)

10 practice types represented; max single type 17.5%, well under the 25% cap.

## Difficulty

- BEGINNER ×31
- INTERMEDIATE ×9 (the parent-loss + depression + parent-grief work + ancestor forgiveness + event-i-cant-release + matrescence-adjacent intermediate picks)

## Mood tags (manifesting / magical genre)

Two entries carry mood tags per the deposit-coin guidance:

- `the-house-spell` — `mood: ["manifesting", "magical"]` (asking-shaped + folk-magical staging)
- `a-40th-honouring` — `mood: ["magical"]` (folk-magical threshold staging without specific outward asking)

All other entries: `mood: []`. Grief, trauma-adjacent, and clinical entries kept clear of mood tags per the hard exclusions in `docs/mindset-author.md` § "Hard exclusion".

---

## Voice-check fix log

**Grade-level (>12.0) — the dominant failure mode this batch (15 files):**

- Provenance "Where this practice comes from" paragraphs almost always trip the grade-level rule on first draft. The fix is uniform: break into 2–3 short sentences, drop multi-clause "X is shared across A, across B, and across C" anaphora, prefer one-fact-per-sentence.
- Worked once: `Original to homemade.education. The X shape is a common one. It appears in Y and in Z.`
- Files fixed: hand-on-belly, inner-safety-scan, why-where-you-are, rearrange-one-shelf-today, tapping-for-mum-rage, matrescence (twice), who-was-i-before-the-baby, 40-as-a-beginning, a-40th-honouring, one-piece-youve-been-told-is-too-young, one-small-thing-today, my-time-is-allowed, when-did-the-drift-start-quietly, we-can-learn-to-talk-again, forgiveness-is-mine, what-does-the-event-still-want-me-to-know.

**Brand-trademark warnings (didn't block, but worth fixing):**

- `Anchor` warning fired on the word "anchor" as practice description in `hand-on-belly` (subtitle + provenance). Rephrased as "body practice" and "shape". Same false positive as bulk-021's tapping-for-body-overwhelm.
- `Kinder` warning fired on "kinder than the last one" in `why-where-you-are` and "cancelling early is kinder than cancelling late" in `cancel-one-thing`. Replaced with "gentler" in both.

**Em-dash blocked (rule is now ZERO):**

- `cancel-one-thing-this-week-with-kindness` had one em-dash inside a script string: `"...not going to be able to make Thursday — I've over-committed."` Replaced with a full stop. The 2026-05-19 voice rules state em-dashes in body content are ZERO; max-one-per-paragraph is no longer the rule.

**Year-in-body blocked:**

- `what-anxiety-is-biologically` had bare years `(1994)` and `(2014)` in the body provenance paragraph. Moved historical context to sourceNotes only.

**Banned phrases:**

- `tapping-for-mum-rage` had "honest" in a reframe line ("I can be honest about what I need now"). Rewrote to "clear". Already a known pattern from bulk-018 + bulk-021.
- `how-to-make-todays-home-feel-like-the-dream` had "at the end of the day" in a habits list. Rewrote to "before bed". Known banned phrase.

**Americanism warning:**

- `hand-on-belly` had "belly fall" / "belly falls" used as the body descend on out-breath. Replaced with "belly drop" / "belly settles". "Fall" fires the americanism warning on its own; "drop" / "settle" are safe.

**0 upload failures after voice-check pass.**

---

## Pattern notes

Three patterns are worth flagging for `docs/mindset-anti-tells.md` because they recurred 3+ times in this batch:

1. **Provenance grade-level (15 recurrences).** The "Where this practice comes from" paragraph is the consistent grade-level offender. Multi-clause sentences with "across X, across Y, and across Z" anaphora push the score above 12. The fix is short declarative sentences.
2. **Year-in-body rule is now enforced.** Bare-year references like "(2014)" trigger `year-in-body` errors; historical context must live in `sourceNotes` only. Caught one file this batch; worth listing as `[block]`.
3. **Em-dash zero-tolerance.** The rule has moved from "max one per paragraph" to "zero in body content". One file caught here; the older rule is no longer the threshold.

---

## Validation that didn't apply this fire

- The autopilot-queue-extra round-robin claimed mindset before the primary `autopilot-queue` routine could touch it at :15. No double-fire between primary and secondary routines observed.

## Sources used

- MONEY-v2 / MONEY-Journal: not drawn from this batch (the high-weight categories sit outside the Money arc).
- Public-domain sources: somatic experiencing (Levine), body scan (Kabat-Zinn / MBSR), polyvagal (Porges), continuing bonds (Klass / Silverman / Nickman), faith development (Fowler), matrescence (Raphael / Athan), mental load (Daminger), 4-7-8 breath (Weil), EFT framework (Craig).
- All references kept to one sentence per source in sourceNotes; body prose stays clean of author/book references per `feedback_homemade_voice.md`.
