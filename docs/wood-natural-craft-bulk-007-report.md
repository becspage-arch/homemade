# wood-natural-craft bulk-007 report

**Date:** 2026-05-29  
**Model:** Claude Sonnet 4.6  
**Entries:** 40 PUBLISHED  
**Count:** Wood-natural-craft 210 → 250

---

## Sub-category split

- spoon-carving ×6: carved-birch-kuksa, carved-sycamore-ladle, carved-ash-salad-spoon, carved-maple-sauce-spoon, carved-birch-skimmer (PATTERN ×5), thumb-pivot-cut (TECHNIQUE ×1)
- whittling ×7: whittled-ash-butter-knife, whittled-birch-letter-opener, whittled-oak-marking-gauge, whittled-lime-relief-panel, whittled-hazel-honey-dipper (PATTERN ×5), chip-carving-knife-technique (TECHNIQUE ×1), treen-care-and-restoration-guide (READING ×1)
- green-woodwork ×8: green-ash-stool-leg, green-wood-shaving-horse-build, coppice-hazel-garden-pea-supports, riven-oak-bowl-blank-roughout (PATTERN ×4), froe-riving-technique, drawknife-technique (TECHNIQUE ×2), shaving-horse-setup-guide, green-wood-drying-and-seasoning (READING ×2)
- basketry-willow ×8: willow-trug-basket, willow-melon-basket, rush-footstool-top, hazel-hurdle-garden-screen, rush-drop-in-chair-seat, willow-potato-basket (PATTERN ×6), waling-weave-technique (TECHNIQUE ×1), willow-harvesting-preparation-guide (READING ×1)
- seasoned-wood ×7: oak-wall-shelf-through-tenon, ash-picture-frame-mitre, beech-candle-box-pull-lid (PATTERN ×3), hand-cut-dovetail-technique (TECHNIQUE ×1), wood-movement-and-moisture-guide, sharpening-hand-saws-guide, natural-finishes-wax-and-oil-guide (READING ×3)
- pyrography ×4: pyrography-lettering-technique, pyrography-stipple-shading-technique (TECHNIQUE ×2), pyrography-spoon-handle-decoration (PATTERN ×1), pyrography-wood-selection-guide (READING ×1)

## Type split

PATTERN ×24, TECHNIQUE ×8, READING ×8

## Difficulty split

BEGINNER ×28, INTERMEDIATE ×11, ADVANCED ×1 (green-wood-shaving-horse-build)

## Voice-check result

0 errors, 1 warning (tricolon in entry 01 intro paragraph — accepted).

## Fixes applied

- `termSlug` attr format: bulk-replaced all 40 files. Session-authored format used `"attrs": { "slug": "..." }`; checker requires `"attrs": { "termSlug": "..." }`. Fixed via `sed -i 's/"attrs": { "slug": "/"attrs": { "termSlug": "/g'` across all 40 files before upload.
- Entry 01 safety preamble: replaced unusual multi-list infoPanel (variant= attrs, bulletList children) with standard single-paragraph `"attrs": { "type": "warning" }` infoPanel.
- Entry 01 techniqueSlugs: cleared `["wood-knife-grip-chest-lever", "wood-grain-reading"]` references to non-existent slugs.

## Hero fill

30 heroes filled by fixup-hero-fill.ts (unsplash ×2, pexels ×25, wikimedia ×3). 0 failed.

## Upload

0 upload failures. 40 entries PUBLISHED.
