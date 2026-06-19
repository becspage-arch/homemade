# Cooking bulk-042 batch report — Breakfasts (2026-06-19)

**Session:** autopilot-queue-extra  
**Model:** Claude Sonnet 4.6  
**Category:** cooking (no subcategory)  
**Briefs directory:** docs/bulk-batch-042-briefs/

---

## Published count

- Before: 1,099 cooking PUBLISHED
- After: 1,139 cooking PUBLISHED
- Net: +40

---

## Entries published (40)

Cooked breakfast plates (4):
- full-scottish-breakfast, full-irish-breakfast, full-welsh-breakfast, vegan-full-english

Egg techniques (9):
- poached-eggs, soft-boiled-eggs, boiled-eggs-with-soldiers, jammy-boiled-eggs, hard-boiled-eggs, coddled-eggs, fried-egg, scrambled-eggs-smoked-salmon, omelette-plain

Egg dishes with accompaniments (5):
- omelette-ham-and-cheese, omelette-mushroom, omelette-smoked-salmon, kippers-with-butter, smoked-haddock-poached-egg

Porridge and oat breakfasts (5):
- porridge-with-apple-cinnamon, porridge-with-peanut-butter, overnight-oats-peanut-butter, overnight-oats-berries, baked-oats

Muesli and granola (3):
- muesli, maple-pecan-granola, vegan-granola

Chia and yoghurt (3):
- chia-pudding, yoghurt-with-honey-and-walnuts, yoghurt-parfait

Fruit compotes (2):
- berry-compote, apple-compote

Smoothies (2):
- smoothie-green, smoothie-berry

Pancakes and waffles (4):
- british-thin-pancakes, sourdough-pancakes, liege-waffles, pain-perdu

Enriched breakfasts (2):
- croissant-french-toast, crumpets-with-butter

Bagel (1):
- bagel-with-lox

---

## Voice-check fixes

### Em-dashes (all 40 files)
Global sed replace `—` → `, ` or `. ` as context dictated. Required before voice-check could pass.

### En-dashes (15 files)
Numeric ranges (`8–10`) → `8 to 10` via perl. Non-numeric remaining en-dashes → `, `.

### Banned phrase "genuinely" (6 files)
Files 04, 19, 20, 24, 38, 39 — replaced with plain alternatives:
- "genuinely bridges the gap" → "that bridges the gap well"
- "genuinely warms you through" → "that warms you through"
- "genuinely filling breakfast" → "filling breakfast"
- "genuinely feels like a treat" → "feels like a treat"
- "genuinely are better here" → "are better here"
- "that is genuinely hard" → "that is hard"

### Banned phrase "essentially" (file 24)
"The texture is essentially identical" → "The texture is the same"

### Banned phrase "honest" (file 03)
"this is honest regional produce" → "this is regional produce"

### Historical figure without gloss (files 10, 13)
Added "the Victorian cookery writer" before "Mrs Beeton" in both files.

### Servings/yield conflict (7 files)
Files 05, 06, 08, 09, 34, 35, 36 had both `servings` and `yieldDescription` set.  
Fixed: nulled `yieldDescription` in all 7.

### Americanism "fall" (files 31, 37)
"fall apart" → "break apart" (trigger was the word "fall" itself, not the seasonal sense).

### Brand trademark Nutella (file 34)
"Nutella" → "chocolate hazelnut spread"

### Tricolon (file 33)
Berry list rewritten to avoid three parallel items.

### Grade-level rewrites (22+ files)
Long sentences split, polysyllabic words simplified. Two parallel agents handled files 01–20 and 21–40 respectively.

### Banned phrase "ideal for" (file 11)
Upload completeness gate caught this (not voice-check). Fixed: "a 20 cm pan is ideal for one or two eggs" → "a 20 cm pan is the right size for one or two eggs".

---

## Body structure fix (files 11–40)

Files 11–40 had `ingredientsList` at the top level of the JSON rather than as a TipTap node inside `body.content`. Script `_fix-bulk042-body-structure.ts` transformed all 30 affected files — moved `ingredientsList` into body.content as a TipTap `ingredientsList` node and added a `toolsList` TipTap node alongside it.

---

## Completeness gate — 5 initial DRAFTs

After initial upload: 35 PUBLISHED, 5 DRAFT held by the completeness gate.

| Slug | Reason | Fix |
|------|---------|-----|
| fried-egg | banned phrase "ideal for" in body | Replaced phrase, re-uploaded |
| boiled-eggs-with-soldiers | no orderedList method steps | Added 3-step orderedList summary |
| soft-boiled-eggs | no orderedList method steps | Added 3-step orderedList summary |
| coddled-eggs | no orderedList method steps | Added 3-step orderedList summary |
| porridge-with-apple-cinnamon | no orderedList method steps | Added 3-step orderedList summary |

All 5 re-uploaded as PUBLISHED after fixing. Final count: 40/40 PUBLISHED.

---

## Images

No hero fill this session. Image-relevance queue written to:
`docs/image-relevance-queue-cooking-bulk-042.json`

---

## QC result

All 40 entries PUBLISHED at session close. 0 still_blocked.
