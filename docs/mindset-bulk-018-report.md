# Mindset Bulk 018 — Batch Report

**Date:** 2026-05-19  
**Category:** mindset  
**Starting count:** 684  
**Ending count:** 724  
**Entries added:** 40

## Counts

| | Before | After |
|---|---|---|
| Mindset published | 684 | 724 |
| Progress to 1,000 | 68% | 72% |

## Content covered

This batch targeted the 10 highest-gap life categories by weight (planned - published) / planned:
HOME, AGEING, TIME, SPIRITUALITY, GRIEF, MOTHERHOOD, HEALTH, BODY, RELATIONSHIPS, JOY

### HOME (3 entries)
- Tapping for the Home Comparison Spiral (TAPPING, BEGINNER)
- When the Home Becomes the Work (READING, BEGINNER)
- What Does Sanctuary Mean to Me at Home? (JOURNAL_PROMPT, BEGINNER)

### AGEING (3 entries)
- Tapping for Turning 40 (TAPPING, INTERMEDIATE)
- I Am Older. I Am Wiser. Both Are Gifts. (AFFIRMATION, BEGINNER)
- Mortality as a Gift Not a Threat (READING, INTERMEDIATE)

### TIME (3 entries)
- Tapping for Never Enough Hours (TAPPING, BEGINNER)
- Why Not Enough Time Is Rarely About Time (READING, BEGINNER)
- Behind Whose Schedule Am I Running? (JOURNAL_PROMPT, INTERMEDIATE)

### SPIRITUALITY (3 entries)
- Tapping for What Do I Believe (TAPPING, INTERMEDIATE)
- The Mid-Life Spiritual Reset (READING, INTERMEDIATE)
- What Does Prayer Mean to Me Beyond Childhood? (JOURNAL_PROMPT, INTERMEDIATE)

### GRIEF (5 entries)
- Tapping for the Non-Linear Grief (TAPPING, INTERMEDIATE)
- My Grief Has No Expiry Date (AFFIRMATION, BEGINNER)
- Light a Candle for Them Daily (RITUAL, BEGINNER)
- A Letter to Them Today (JOURNAL_PROMPT, BEGINNER)
- What Wisdom Do I Have Now That I Didn't at 30? (JOURNAL_PROMPT, INTERMEDIATE)

### MOTHERHOOD (4 entries)
- Tapping for the Good Mother Pressure (TAPPING, INTERMEDIATE)
- Mum Guilt: What It Is and What to Do with It (READING, BEGINNER)
- My Mothering Is Mine (AFFIRMATION, BEGINNER)
- What Does My Mum Guilt Actually Want from Me? (JOURNAL_PROMPT, INTERMEDIATE)

### HEALTH (3 entries)
- Tapping for Generalised Anxiety (TAPPING, BEGINNER)
- Anxiety in Women: the Under-Discussed Shape (READING, BEGINNER)
- My Anxiety Is Information, Not Identity (AFFIRMATION, BEGINNER)

### BODY (4 entries)
- Tapping to Calm Body Stress and Accept Now (TAPPING, BEGINNER)
- The Body as Home (VISUALISATION, BEGINNER)
- My Rest Is Not Laziness, It Is Necessary (AFFIRMATION, BEGINNER)
- What Does My Body Want Me to Know Today? (JOURNAL_PROMPT, BEGINNER)

### RELATIONSHIPS (4 entries)
- Tapping for the Marriage Drift (TAPPING, INTERMEDIATE)
- We Can Come Back to Each Other (AFFIRMATION, BEGINNER)
- One Small Reach This Week (ACTIVITY, BEGINNER)
- I Begin from Where I Am (AFFIRMATION, BEGINNER)

### JOY (4 entries)
- Tapping for "I Don't Know What Brings Me Joy" (TAPPING, BEGINNER)
- Joy as Practice (READING, BEGINNER)
- I Begin from Where I Am (AFFIRMATION, BEGINNER)
- One Five-Minute Daily Anchor (JOURNAL_PROMPT, BEGINNER)

### Cross-category anchors / rituals (4 entries)
- Three Daily Anchors (JOURNAL_PROMPT, BEGINNER) — TIME/PURPOSE/SPIRITUALITY
- A 40th Honouring Ritual (RITUAL, INTERMEDIATE) — AGEING/PURPOSE/SELF_WORTH
- Light the Candle When You Walk In (RITUAL, BEGINNER) — HOME/PURPOSE
- 5-4-3-2-1 Grounding (MEDITATION, BEGINNER) — HEALTH/ANXIETY/BODY

## Practice type breakdown

| Type | Count |
|---|---|
| TAPPING | 10 |
| READING | 7 |
| JOURNAL_PROMPT | 7 |
| AFFIRMATION | 6 |
| RITUAL | 3 |
| MEDITATION | 1 |
| VISUALISATION | 1 |
| ACTIVITY | 1 |

## Voice-check notes

All 40 entries passed voice-check with 0 errors before upload.

Common fixes applied:
- Em-dashes (—/–) throughout: replaced with commas, periods, or colons depending on context
- `honest/honestly` → `direct`, `real`, `clear`, or rephrased
- Negation pattern "not just X, but Y" in one entry → rewritten as positive statement
- Upload command required `pnpm exec tsx scripts/upload-tutorial.ts` (not `pnpm run ... --`) to avoid `--` being passed as a flag to the script
- HOME enum value in PracticeTarget was in schema but not in generated client — `prisma generate` run to fix; 2 entries re-uploaded

## Anti-tell patterns (3+ recurrences)

- Em-dash as clause separator: recurred in every new file. Pattern: use commas or periods instead
- `honest`/`honestly` in journaling CTAs ("be honest with yourself"): substitute `think clearly about this` or `write what is real`
- Tapping excerpt format `— the X, Y, Z`: replace with `: the X, Y, Z` (no em-dash after slug title)
