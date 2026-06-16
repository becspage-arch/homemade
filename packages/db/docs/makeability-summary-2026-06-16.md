# Makeability audit — 2026-06-16

PUBLISHED audited: **9035**  ·  MAKEABLE (kept): **8795**  ·  UN-PUBLISHED (failed makeability): **240** (2.7%)

Of the 8795 kept rows, 8328 are fully clean and 467 are makeable but carry a voice nit (em/en dash or banned phrasing) flagged for an in-place fix — NOT un-published, per the locked don't-over-prune rule.

FAIL here means a genuine makeability gap (missing chart / method / ingredients / steps / broken body), not a style nit.

## Per-type

| Type | n | PASS | FAIL | % fail |
|---|--:|--:|--:|--:|
| TECHNIQUE | 2124 | 1988 | 136 | 6.4% |
| PATTERN | 2465 | 2417 | 48 | 1.9% |
| GROWING_GUIDE | 124 | 92 | 32 | 25.8% |
| HERB_PROFILE | 21 | 11 | 10 | 47.6% |
| RECIPE | 2722 | 2713 | 9 | 0.3% |
| READING | 385 | 383 | 2 | 0.5% |
| STITCH | 174 | 172 | 2 | 1.1% |
| PRACTICE | 909 | 908 | 1 | 0.1% |
| REMEDY | 111 | 111 | 0 | 0.0% |

## Per-category

| Category | n | PASS | FAIL | % fail |
|---|--:|--:|--:|--:|
| sustainability | 608 | 538 | 70 | 11.5% |
| animals-smallholding | 563 | 531 | 32 | 5.7% |
| garden | 124 | 92 | 32 | 25.8% |
| needlework | 190 | 164 | 26 | 13.7% |
| cross-stitch | 54 | 31 | 23 | 42.6% |
| paper-word | 546 | 534 | 12 | 2.2% |
| herbal-medicine | 142 | 132 | 10 | 7.0% |
| cooking | 1295 | 1286 | 9 | 0.7% |
| crochet | 858 | 849 | 9 | 1.0% |
| fibre-arts | 556 | 550 | 6 | 1.1% |
| baking | 1009 | 1004 | 5 | 0.5% |
| wood-natural-craft | 352 | 350 | 2 | 0.6% |
| mindset | 1001 | 1000 | 1 | 0.1% |
| pottery-ceramics | 440 | 439 | 1 | 0.2% |
| home-repair | 585 | 584 | 1 | 0.2% |
| knitting | 236 | 235 | 1 | 0.4% |
| natural-home | 476 | 476 | 0 | 0.0% |

## Per-category × type

| Category | Type | n | PASS | FAIL | % fail |
|---|---|--:|--:|--:|--:|
| animals-smallholding | PATTERN | 28 | 27 | 1 | 3.6% |
| animals-smallholding | READING | 118 | 117 | 1 | 0.8% |
| animals-smallholding | TECHNIQUE | 417 | 387 | 30 | 7.2% |
| baking | RECIPE | 951 | 951 | 0 | 0.0% |
| baking | TECHNIQUE | 58 | 53 | 5 | 8.6% |
| cooking | RECIPE | 1295 | 1286 | 9 | 0.7% |
| crochet | PATTERN | 659 | 659 | 0 | 0.0% |
| crochet | READING | 25 | 24 | 1 | 4.0% |
| crochet | STITCH | 67 | 66 | 1 | 1.5% |
| crochet | TECHNIQUE | 107 | 100 | 7 | 6.5% |
| cross-stitch | PATTERN | 20 | 0 | 20 | 100.0% |
| cross-stitch | TECHNIQUE | 34 | 31 | 3 | 8.8% |
| fibre-arts | PATTERN | 249 | 249 | 0 | 0.0% |
| fibre-arts | READING | 25 | 25 | 0 | 0.0% |
| fibre-arts | TECHNIQUE | 282 | 276 | 6 | 2.1% |
| garden | GROWING_GUIDE | 124 | 92 | 32 | 25.8% |
| herbal-medicine | HERB_PROFILE | 21 | 11 | 10 | 47.6% |
| herbal-medicine | READING | 10 | 10 | 0 | 0.0% |
| herbal-medicine | REMEDY | 111 | 111 | 0 | 0.0% |
| home-repair | PATTERN | 417 | 417 | 0 | 0.0% |
| home-repair | READING | 12 | 12 | 0 | 0.0% |
| home-repair | TECHNIQUE | 156 | 155 | 1 | 0.6% |
| knitting | PATTERN | 174 | 174 | 0 | 0.0% |
| knitting | STITCH | 62 | 61 | 1 | 1.6% |
| mindset | PRACTICE | 909 | 908 | 1 | 0.1% |
| mindset | READING | 92 | 92 | 0 | 0.0% |
| natural-home | RECIPE | 476 | 476 | 0 | 0.0% |
| needlework | PATTERN | 62 | 37 | 25 | 40.3% |
| needlework | READING | 16 | 16 | 0 | 0.0% |
| needlework | STITCH | 45 | 45 | 0 | 0.0% |
| needlework | TECHNIQUE | 67 | 66 | 1 | 1.5% |
| paper-word | PATTERN | 149 | 148 | 1 | 0.7% |
| paper-word | READING | 45 | 45 | 0 | 0.0% |
| paper-word | TECHNIQUE | 352 | 341 | 11 | 3.1% |
| pottery-ceramics | PATTERN | 283 | 283 | 0 | 0.0% |
| pottery-ceramics | TECHNIQUE | 157 | 156 | 1 | 0.6% |
| sustainability | PATTERN | 186 | 185 | 1 | 0.5% |
| sustainability | TECHNIQUE | 422 | 353 | 69 | 16.4% |
| wood-natural-craft | PATTERN | 238 | 238 | 0 | 0.0% |
| wood-natural-craft | READING | 42 | 42 | 0 | 0.0% |
| wood-natural-craft | TECHNIQUE | 72 | 70 | 2 | 2.8% |

## 10 worst categories by % failure (min 20 rows)

| Category | n | FAIL | % fail |
|---|--:|--:|--:|
| cross-stitch | 54 | 23 | 42.6% |
| garden | 124 | 32 | 25.8% |
| needlework | 190 | 26 | 13.7% |
| sustainability | 608 | 70 | 11.5% |
| herbal-medicine | 142 | 10 | 7.0% |
| animals-smallholding | 563 | 32 | 5.7% |
| paper-word | 546 | 12 | 2.2% |
| fibre-arts | 556 | 6 | 1.1% |
| crochet | 858 | 9 | 1.0% |
| cooking | 1295 | 9 | 0.7% |

## Most common failure reasons

| count | reason |
|--:|---|
| 130 | no step-by-step instructions |
| 25 | counted-needlework pattern has no chart (mandatory for a counted discipline) |
| 22 | no common problems + remedies |
| 20 | cross-stitch pattern has no chart (mandatory — a chart-less cross-stitch pattern is not a pattern) |
| 19 | no designer / house attribution |
| 10 | no sowing depth or spacing |
| 9 | no ingredients list with quantities |
| 9 | contains an unfilled placeholder phrase |
| 8 | no habitat / range |
| 3 | no step-by-step instructions (no list, method heading with action verbs, or step run) |
| 2 | fewer than 3 headings / sections |
| 2 | no identification description |
| 2 | no sowing / planting time |
| 1 | no parts used |
| 1 | thin content (114 words < 120) |
| 1 | contains a leaked "[]" or "{}" literal |

## Sample FAIL — un-published (5 per type, with reasons)

### RECIPE
- `mince-pie-cookies` (cooking) — no ingredients list with quantities
- `goats-cheese-honey-rice-cakes` (cooking) — no ingredients list with quantities
- `salted-edamame` (cooking) — no ingredients list with quantities
- `chocolate-hazelnut-stuffed-cookies` (cooking) — no ingredients list with quantities
- `giant-chocolate-cornflake-cookies` (cooking) — no ingredients list with quantities

### PRACTICE
- `what-feeling-is-asking-to-be-heard-tonight-journal` (mindset) — contains an unfilled placeholder phrase

### PATTERN
- `spencerian-capital-letters` (paper-word) — no step-by-step instructions (no list, method heading with action verbs, or step run)
- `needlepoint-coaster-basketweave` (needlework) — counted-needlework pattern has no chart (mandatory for a counted discipline)
- `needlepoint-pincushion-scotch-stitch` (needlework) — counted-needlework pattern has no chart (mandatory for a counted discipline)
- `needlepoint-berlin-rose-panel` (needlework) — counted-needlework pattern has no chart (mandatory for a counted discipline)
- `needlepoint-pansy-bookmark-petit-point` (needlework) — counted-needlework pattern has no chart (mandatory for a counted discipline)

### TECHNIQUE
- `ev-charger-decision-guide` (sustainability) — no step-by-step instructions
- `loft-conversion-insulation-options` (sustainability) — no step-by-step instructions
- `applying-for-a-cph-number` (animals-smallholding) — no step-by-step instructions
- `legal-predator-control-on-a-smallholding` (animals-smallholding) — no step-by-step instructions
- `managing-khaki-campbell-ducks-for-eggs` (animals-smallholding) — no step-by-step instructions

### READING
- `interpreting-sheep-blood-results` (animals-smallholding) — fewer than 3 headings / sections
- `crochet-miscounted-stitches` (crochet) — fewer than 3 headings / sections; thin content (114 words < 120)

### STITCH
- `crochet-row-end-increase` (crochet) — contains an unfilled placeholder phrase
- `cable-cast-on` (knitting) — contains an unfilled placeholder phrase

### GROWING_GUIDE
- `alexanders-growing` (garden) — no common problems + remedies
- `caucasian-spinach-growing` (garden) — no common problems + remedies
- `comfrey-bocking-14-growing` (garden) — no common problems + remedies
- `hazel-in-forest-garden` (garden) — no common problems + remedies
- `radish-microgreen-variety-selection` (garden) — no common problems + remedies

### HERB_PROFILE
- `lavender-profile` (herbal-medicine) — no habitat / range
- `st-johns-wort-profile` (herbal-medicine) — no habitat / range; no parts used
- `ginger-profile` (herbal-medicine) — no habitat / range
- `chamomile-profile` (herbal-medicine) — no habitat / range
- `hawthorn-profile` (herbal-medicine) — no habitat / range

## Sample PASS — makeable (5 per type, sanity)

### RECIPE
- `welsh-cawl` (cooking)
- `chai-spiced-overnight-oats` (cooking)
- `milk-bread-tangzhong` (baking)
- `welsh-rarebit` (cooking)
- `genoise-sponge` (baking)

### PRACTICE
- `tapping-for-the-home-comparison-spiral` (mindset)
- `the-loop-that-visits-you-most-journal` (mindset)
- `tapping-to-anchor-in-predictable-calm-daytime` (mindset)
- `what-makes-an-idea-feel-aligned-journal` (mindset) [voice nit flagged]
- `tapping-to-release-rest-guilt` (mindset)

### PATTERN
- `coil-built-square-vessel` (pottery-ceramics)
- `origami-masu-box` (paper-word)
- `polymer-clay-faux-tortoiseshell-pendant` (pottery-ceramics)
- `mini-accordion-photo-album` (paper-word)
- `sgraffito-on-thrown-stoneware-greenware` (pottery-ceramics)

### TECHNIQUE
- `sgraffito-on-air-dry-clay` (pottery-ceramics)
- `using-a-heat-gun-to-strip-furniture-paint` (home-repair)
- `waxing-and-buffing-bare-wood` (home-repair)
- `weaning-lambs` (animals-smallholding)
- `reclaiming-clay-from-dry-scraps` (pottery-ceramics)

### READING
- `caring-for-carved-wooden-spoons` (wood-natural-craft)
- `how-embodiment-works` (mindset)
- `roman-script-families` (paper-word)
- `how-to-tell-inner-voice-from-anxiety-reading` (mindset)
- `understanding-rcd-mcb-and-rcbo-protection-in-a-consumer-unit` (home-repair)

### STITCH
- `circular-needle-sizing` (knitting)
- `crochet-slip-stitch-tutorial` (crochet)
- `how-to-work-a-treble` (crochet)
- `picot-cast-on` (knitting)
- `crochet-surface-slip-stitch-technique` (crochet)

### REMEDY
- `yarrow-infusion-for-fever-support` (herbal-medicine)
- `sage-gargle-for-throat-infection` (herbal-medicine)
- `elderflower-skin-wash` (herbal-medicine)
- `lemon-balm-infusion` (herbal-medicine)
- `thyme-cough-syrup` (herbal-medicine)

### GROWING_GUIDE
- `growing-calendula` (garden)
- `growing-rosemary-from-cuttings` (garden)
- `growing-strawberries` (garden)
- `growing-tomatoes-from-seed` (garden)
- `buckwheat-summer-cover` (garden)

### HERB_PROFILE
- `nettle-profile` (herbal-medicine)
- `elderberry-profile` (herbal-medicine)
- `peppermint-profile` (herbal-medicine)
- `lemon-balm-profile` (herbal-medicine)
- `comfrey-profile` (herbal-medicine)

## Voice-nit rows (makeable, KEPT, flagged for in-place fix)

467 rows. These contain an em/en dash or banned phrasing but are otherwise makeable; they stay PUBLISHED. Sample:

- `what-makes-an-idea-feel-aligned-journal` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `rose-oud-solid-perfume` (natural-home/RECIPE) — contains an em dash (—)
- `buying-weaners-and-settling-them-in` (animals-smallholding/PATTERN) — no materials / tools list
- `the-next-size-up-journal` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `the-opportunity-i-almost-said-no-to-journal` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `the-bed-under-you-the-room-around-you` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `my-purpose-unfolds-as-i-move` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `what-did-i-lose-when-i-lost-them-beyond-them` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `the-figure-on-paper-fold-and-carry-it-for-thirty-days` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `my-body-has-learned-to-relax-here` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `the-perfect-advisors-find-me-easily` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `behind-whose-schedule-journal` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `hazardous-household-waste-disposal` (sustainability/PATTERN) — no materials / tools list
- `the-pattern-can-break` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `what-does-sanctuary-mean-to-me-at-home-journal` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `cancel-one-thing-this-week-with-kindness` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `brushed-underglaze-decoration-on-bisqueware` (pottery-ceramics/PATTERN) — no clay body stated
- `soy-candle-lemon-verbena` (natural-home/RECIPE) — contains an em dash (—)
- `conditioning-and-protecting-a-leather-belt` (home-repair/PATTERN) — no materials / tools list; few/no measurements (a dimensioned cut list helps build projects)
- `the-single-sentence-that-names-the-woman-journal` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `wealth-is-natural-and-constant-affirmation` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `the-lottery-fantasy-as-a-scarcity-tell` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `widowhood` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `what-84-days-of-money-work-does-reading` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
- `what-am-i-postponing-until-conditions-are-perfect` (mindset/PRACTICE) — no duration / repetition count stated (open-ended practice)
