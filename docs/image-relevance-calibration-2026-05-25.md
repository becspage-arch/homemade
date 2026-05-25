# Image relevance scorer — calibration record

**Date:** 2026-05-25
**Author:** Worker session (Homemade — pedantic-taussig)
**Prompt under test:** `apps/web/src/lib/image-sourcing/relevance.ts` — `buildRelevancePrompt`

## Method

Six tutorials Rebecca had named as known-good / known-bad cases were fetched
from the database, their current hero images downloaded, and each scored by
the worker (multimodal Read) against the strict three-tier rubric in
`relevance.ts`. The expected verdicts came from Rebecca's homepage-rails
audit on the same day.

## Cases

| # | Slug | Expected | Scored | Confidence | Notes |
|---|------|----------|--------|-----------:|-------|
| 1 | fish-and-chips | EXACT | EXACT | 0.7 | Plate of fried fish with potato accompaniment + tomato/arugula. Not classical chip-shop styling — closer to a styled British plate — but the named subject (fried fish + potato) is the unmistakable subject of the photograph. |
| 2 | yorkshire-puddings | WRONG | WRONG | 0.98 | Sheets and noodles of fresh pasta. Different food entirely. Pure keyword overlap on "pudding". |
| 3 | bubble-and-squeak | WRONG | WRONG | 0.99 | A frosted soap bubble / Christmas ornament with ice ferns inside, on snow. Different subject entirely — keyword overlap on "bubble". |
| 4 | angel-food-cake | WRONG | WRONG | 0.97 | A fondant-iced christening cake with a cherub figurine and "Happy Christening Gigi" ribbon. "Angel food cake" is a *specific* sponge cake type, not a cake decorated with an angel. Keyword overlap on "angel". |
| 5 | beef-wellington | WRONG | WRONG | 0.95 | Two seared beef tenderloin medallions, rare interior visible, rosemary garnish. The pastry casing — the *defining feature* of Wellington — is absent. |
| 6 | thyme-cough-syrup | WRONG | WRONG | 0.85 | A honey bee perched on thyme flowers in the foreground; out-of-focus thyme behind. The bee dominates the photograph; no syrup preparation visible. Keyword overlap on "thyme" without subject-match for the prepared remedy. |

## Result

**6 / 6 verdicts match Rebecca's labels.** The rubric in `relevance.ts`
distinguishes subject-match from keyword-match correctly across the
calibration set.

## Observations

- All five WRONG candidates were sourced from **Pixabay**. Pixabay is also
  the top source by volume across PUBLISHED heroes (1,195 of 2,392 ≈ 50%).
  If the sample audit confirms a high Pixabay-WRONG rate, dropping or
  deprioritising Pixabay in the orchestrator's priority chain is the
  obvious lever.
- The Wellington case shows the rubric correctly demands *defining
  features*, not just the named ingredient. A photo of "beef" alone is
  insufficient for "Beef Wellington" — the pastry casing is required.
- The thyme-cough-syrup case was the closest borderline (could be argued
  PARTIAL on the grounds that thyme is visible). The rubric resolves it by
  asking *what is the subject of the photograph?* — the bee is in sharp
  focus; thyme is bokeh background; the syrup preparation is absent. WRONG.
