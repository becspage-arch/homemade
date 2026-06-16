# Hard makeability audit — 2026-06-16

Locked completeness checklist enforced line for line. Binary: a row PASSES only if it satisfies every cross-cutting rule AND every MANDATORY type item. No flag / warning tier.

Audited: **8920**  ·  PASS: **6986** (78.3%)  ·  FAIL / un-published: **1934** (21.7%)

| Surface | n | PASS | FAIL | % fail |
|---|--:|--:|--:|--:|
| tutorial | 8795 | 6945 | 1850 | 21.0% |
| cross-stitch | 80 | 41 | 39 | 48.8% |
| sewing | 45 | 0 | 45 | 100.0% |

## Per-type

| Type | n | PASS | FAIL | % fail |
|---|--:|--:|--:|--:|
| PATTERN | 2542 | 1462 | 1080 | 42.5% |
| RECIPE | 2713 | 2394 | 319 | 11.8% |
| TECHNIQUE | 1988 | 1712 | 276 | 13.9% |
| PRACTICE | 908 | 773 | 135 | 14.9% |
| STITCH | 172 | 118 | 54 | 31.4% |
| GROWING_GUIDE | 92 | 44 | 48 | 52.2% |
| REMEDY | 111 | 93 | 18 | 16.2% |
| READING | 383 | 379 | 4 | 1.0% |
| HERB_PROFILE | 11 | 11 | 0 | 0.0% |

## Per-category

| Category | n | PASS | FAIL | % fail |
|---|--:|--:|--:|--:|
| crochet | 849 | 213 | 636 | 74.9% |
| cooking | 1286 | 1037 | 249 | 19.4% |
| knitting | 235 | 48 | 187 | 79.6% |
| sustainability | 538 | 397 | 141 | 26.2% |
| mindset | 1000 | 864 | 136 | 13.6% |
| needlework | 164 | 84 | 80 | 48.8% |
| animals-smallholding | 531 | 459 | 72 | 13.6% |
| home-repair | 584 | 518 | 66 | 11.3% |
| paper-word | 534 | 475 | 59 | 11.0% |
| baking | 1004 | 950 | 54 | 5.4% |
| garden | 92 | 44 | 48 | 52.2% |
| cross-stitch | 111 | 64 | 47 | 42.3% |
| sewing | 45 | 0 | 45 | 100.0% |
| natural-home | 476 | 435 | 41 | 8.6% |
| fibre-arts | 550 | 517 | 33 | 6.0% |
| herbal-medicine | 132 | 113 | 19 | 14.4% |
| wood-natural-craft | 350 | 339 | 11 | 3.1% |
| pottery-ceramics | 439 | 429 | 10 | 2.3% |

## Per-category x type

| Category | Type | n | PASS | FAIL | % fail |
|---|---|--:|--:|--:|--:|
| animals-smallholding | PATTERN | 27 | 21 | 6 | 22.2% |
| animals-smallholding | READING | 117 | 116 | 1 | 0.9% |
| animals-smallholding | TECHNIQUE | 387 | 322 | 65 | 16.8% |
| baking | RECIPE | 951 | 922 | 29 | 3.0% |
| baking | TECHNIQUE | 53 | 28 | 25 | 47.2% |
| cooking | RECIPE | 1286 | 1037 | 249 | 19.4% |
| crochet | PATTERN | 659 | 29 | 630 | 95.6% |
| crochet | READING | 24 | 23 | 1 | 4.2% |
| crochet | STITCH | 66 | 66 | 0 | 0.0% |
| crochet | TECHNIQUE | 100 | 95 | 5 | 5.0% |
| cross-stitch | PATTERN | 80 | 41 | 39 | 48.8% |
| cross-stitch | TECHNIQUE | 31 | 23 | 8 | 25.8% |
| fibre-arts | PATTERN | 249 | 223 | 26 | 10.4% |
| fibre-arts | READING | 25 | 25 | 0 | 0.0% |
| fibre-arts | TECHNIQUE | 276 | 269 | 7 | 2.5% |
| garden | GROWING_GUIDE | 92 | 44 | 48 | 52.2% |
| herbal-medicine | HERB_PROFILE | 11 | 11 | 0 | 0.0% |
| herbal-medicine | READING | 10 | 9 | 1 | 10.0% |
| herbal-medicine | REMEDY | 111 | 93 | 18 | 16.2% |
| home-repair | PATTERN | 417 | 362 | 55 | 13.2% |
| home-repair | READING | 12 | 12 | 0 | 0.0% |
| home-repair | TECHNIQUE | 155 | 144 | 11 | 7.1% |
| knitting | PATTERN | 174 | 9 | 165 | 94.8% |
| knitting | STITCH | 61 | 39 | 22 | 36.1% |
| mindset | PRACTICE | 908 | 773 | 135 | 14.9% |
| mindset | READING | 92 | 91 | 1 | 1.1% |
| natural-home | RECIPE | 476 | 435 | 41 | 8.6% |
| needlework | PATTERN | 37 | 0 | 37 | 100.0% |
| needlework | READING | 16 | 16 | 0 | 0.0% |
| needlework | STITCH | 45 | 13 | 32 | 71.1% |
| needlework | TECHNIQUE | 66 | 55 | 11 | 16.7% |
| paper-word | PATTERN | 148 | 139 | 9 | 6.1% |
| paper-word | READING | 45 | 45 | 0 | 0.0% |
| paper-word | TECHNIQUE | 341 | 291 | 50 | 14.7% |
| pottery-ceramics | PATTERN | 283 | 273 | 10 | 3.5% |
| pottery-ceramics | TECHNIQUE | 156 | 156 | 0 | 0.0% |
| sewing | PATTERN | 45 | 0 | 45 | 100.0% |
| sustainability | PATTERN | 185 | 137 | 48 | 25.9% |
| sustainability | TECHNIQUE | 353 | 260 | 93 | 26.3% |
| wood-natural-craft | PATTERN | 238 | 228 | 10 | 4.2% |
| wood-natural-craft | READING | 42 | 42 | 0 | 0.0% |
| wood-natural-craft | TECHNIQUE | 70 | 69 | 1 | 1.4% |

## 10 worst (category, type) pairs by fail count (min 10 rows)

| Category | Type | n | FAIL | % fail |
|---|---|--:|--:|--:|
| crochet | PATTERN | 659 | 630 | 95.6% |
| cooking | RECIPE | 1286 | 249 | 19.4% |
| knitting | PATTERN | 174 | 165 | 94.8% |
| mindset | PRACTICE | 908 | 135 | 14.9% |
| sustainability | TECHNIQUE | 353 | 93 | 26.3% |
| animals-smallholding | TECHNIQUE | 387 | 65 | 16.8% |
| home-repair | PATTERN | 417 | 55 | 13.2% |
| paper-word | TECHNIQUE | 341 | 50 | 14.7% |
| sustainability | PATTERN | 185 | 48 | 25.9% |
| garden | GROWING_GUIDE | 92 | 48 | 52.2% |

## Most common failure reasons

| count | reason |
|--:|---|
| 468 | no stitch glossary / abbreviations key |
| 445 | no chart on the linked CrochetPattern row (mandatory) |
| 284 | an ingredient has a missing / null amount (and is not a "to taste" style item) |
| 226 | a repeat is not fully enumerated (e.g. "to end" / "as established") |
| 214 | no common mistakes / troubleshooting section |
| 161 | no materials list |
| 135 | no duration / repetition count stated |
| 130 | no chart on the linked KnittingPattern row (mandatory) |
| 128 | no hook size in mm |
| 123 | no completion criterion stated |
| 95 | no yarn weight stated |
| 85 | no bind-off method specified |
| 76 | no completion criterion (how you know it is right / done) |
| 61 | not every row carries an explicit stitch count (0 counts for 1 rows) |
| 59 | not every row carries an explicit stitch count (0 counts for 3 rows) |
| 49 | no common variations section |
| 47 | no written row/round-by-round instructions |
| 44 | no tools named |
| 43 | no finished garment measurements per size |
| 43 | no construction direction |
| 38 | no designer / house attribution |
| 37 | no stitch key (symbol to thread + colour) |
| 37 | no designer attribution |
| 36 | no equipment / tools list |
| 33 | no cutting layout per size + fabric width |
| 30 | not every row carries an explicit stitch count (0 counts for 2 rows) |
| 29 | no sizing chart (body measurements per size) |
| 26 | not every row carries an explicit stitch count (1 counts for 3 rows) |
| 26 | no stitch direction notes |
| 25 | no cast-on method specified |
| 25 | no sowing depth |
| 24 | no finishing instructions (weaving ends, blocking) |
| 17 | no harvest timing |
| 16 | not every row carries an explicit stitch count (0 counts for 4 rows) |
| 15 | no spacing (between plants + rows) |

## Sample FAIL (5 per type, with reasons)

### RECIPE
- `welsh-rarebit` (cooking) — an ingredient has a missing / null amount (and is not a "to taste" style item)
- `roasted-chicken-with-rosemary-roast-potatoes` (cooking) — an ingredient has a missing / null amount (and is not a "to taste" style item)
- `roasted-squash-goats-cheese-salad` (cooking) — an ingredient has a missing / null amount (and is not a "to taste" style item)
- `salmon-teriyaki` (cooking) — an ingredient has a missing / null amount (and is not a "to taste" style item)
- `salmon-wrapped-in-prosciutto` (cooking) — an ingredient has a missing / null amount (and is not a "to taste" style item)

### PRACTICE
- `what-makes-an-idea-feel-aligned-journal` (mindset) — no duration / repetition count stated
- `the-next-size-up-journal` (mindset) — no duration / repetition count stated
- `the-opportunity-i-almost-said-no-to-journal` (mindset) — no duration / repetition count stated
- `the-bed-under-you-the-room-around-you` (mindset) — no duration / repetition count stated
- `leave-a-twenty-in-your-wallet-for-a-week` (mindset) — no duration / repetition count stated

### PATTERN
- `granny-square-basic-three-round` (crochet) — not every row carries an explicit stitch count (3 counts for 4 rows)
- `rectangular-lace-shawl-crochet` (crochet) — no chart on the linked CrochetPattern row (mandatory); a repeat is not fully enumerated (e.g. "to end" / "as established"); no stitch glossary / abbreviations key
- `willow-melon-basket` (wood-natural-craft) — no tools named
- `cabled-fingerless-mitts-dk` (knitting) — no chart on the linked KnittingPattern row (mandatory); a repeat is not fully enumerated (e.g. "to end" / "as established"); no bind-off method specified
- `woven-placemats` (fibre-arts) — no completion criterion stated

### TECHNIQUE
- `spencerian-oval-and-shade` (paper-word) — no completion criterion (how you know it is right / done)
- `inspecting-sealed-brood-for-chalkbrood` (animals-smallholding) — no common mistakes / troubleshooting section
- `choosing-eco-cleaning-products` (sustainability) — no common mistakes / troubleshooting section
- `horse-manure-hot-composting` (sustainability) — no common mistakes / troubleshooting section
- `year-on-two-pages-spread` (paper-word) — no completion criterion (how you know it is right / done)

### READING
- `forty-as-a-beginning` (mindset) — topic in the title is not addressed in the body
- `understanding-uk-pig-cph-and-registration` (animals-smallholding) — topic in the title is not addressed in the body
- `how-tinctures-work` (herbal-medicine) — topic in the title is not addressed in the body
- `crochet-reading-schematics` (crochet) — topic in the title is not addressed in the body

### STITCH
- `spray-blocking` (knitting) — no common variations section
- `surface-embroidery-basic-couching` (needlework) — no uses section (where this stitch is typically used); no common variations section
- `surface-embroidery-bullion-knot` (needlework) — no uses section (where this stitch is typically used); no common variations section
- `surface-embroidery-chain-stitch` (needlework) — no common variations section
- `surface-embroidery-spiders-web-stitch` (needlework) — no uses section (where this stitch is typically used)

### REMEDY
- `chamomile-infusion-for-tension-headache` (herbal-medicine) — no frequency stated; no duration / storage of the prepared remedy
- `nettle-infusion-for-cycle-support` (herbal-medicine) — no duration / storage of the prepared remedy
- `fennel-infusion-for-menstrual-cramps` (herbal-medicine) — no duration / storage of the prepared remedy
- `lavender-compress-for-insect-bites` (herbal-medicine) — no frequency stated; no duration / storage of the prepared remedy
- `lavender-infusion-for-mild-low-mood` (herbal-medicine) — no duration / storage of the prepared remedy

### GROWING_GUIDE
- `forest-garden-shrub-layer` (garden) — no sowing depth; no harvest timing; no common problems + remedies
- `good-king-henry-growing` (garden) — no sowing depth; no care instructions
- `growing-cabbage` (garden) — no hardiness / climate guidance
- `growing-globe-artichoke` (garden) — no sowing depth
- `phacelia-green-manure` (garden) — no sowing depth; no sun requirements

## Sample PASS (5 per type, sanity)

### RECIPE
- `welsh-cawl` (cooking)
- `chai-spiced-overnight-oats` (cooking)
- `milk-bread-tangzhong` (baking)
- `genoise-sponge` (baking)
- `mille-feuille-vanilla` (baking)

### PRACTICE
- `tapping-for-the-home-comparison-spiral` (mindset)
- `the-loop-that-visits-you-most-journal` (mindset)
- `tapping-to-anchor-in-predictable-calm-daytime` (mindset)
- `tapping-to-release-rest-guilt` (mindset)
- `i-am-allowed-to-stop-even-if-not-everything-is-done` (mindset)

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
- `picot-cast-on` (knitting)
- `how-to-work-a-treble` (crochet)
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
