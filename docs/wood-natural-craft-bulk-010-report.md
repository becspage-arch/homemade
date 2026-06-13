# Wood & natural craft bulk-010 — batch report

**Date:** 2026-06-13
**Model:** Claude Sonnet 4.6
**Entries:** 30 PUBLISHED (net new)
**Category count:** Wood-natural-craft 316 → 346

---

## Sub-category split

- **spoon-carving ×5**: carved-sycamore-serving-spoon-long, carved-ash-jam-spoon-short, carved-birch-egg-ladle, carved-maple-salt-spoon (PATTERN ×4), reading-the-grain-for-spoon-carvers (READING ×1). Note: stop-cut-technique was already published from a prior partial fire and excluded from net-new count.
- **whittling ×6**: whittled-pine-butter-spreader, whittled-oak-peg-hook, whittled-ash-letter-opener, whittled-walnut-pendant-blank (PATTERN ×4), choosing-wood-for-whittling (READING ×1), thumb-push-cut-technique (TECHNIQUE ×1)
- **green-woodwork ×8**: riven-ash-stool-leg, shaved-hazel-walking-stick, green-ash-bowl-on-pole-lathe, drawknife-shaved-rake-handle (PATTERN ×4), why-green-wood-works, british-species-for-green-woodwork (READING ×2), using-the-froe-for-riving, shaving-horse-setup-technique (TECHNIQUE ×2)
- **basketry-willow ×5**: round-willow-bread-basket (PATTERN ×1), selecting-and-soaking-willow, the-parts-of-a-basket (READING ×2), pairing-weave-technique, waling-technique (TECHNIQUE ×2)
- **seasoned-wood ×7**: oak-end-grain-serving-board, cherry-butter-dish, walnut-cheese-board, ash-chopping-board (PATTERN ×4), card-scraper-technique, danish-oil-finishing-technique, mortise-tenon-joint-technique (TECHNIQUE ×3)

Note: willow-fruit-bowl, willow-garden-trug, oval-willow-shopping-basket were already published in a partial prior fire and appear in the briefs directory but not in net-new count.

## Type split

PATTERN ×17, READING ×6, TECHNIQUE ×7

## Difficulty split

Predominantly BEGINNER with INTERMEDIATE on larger green-wood projects (riven-ash-stool-leg, green-ash-bowl-on-pole-lathe) and INTERMEDIATE for advanced seasoned-wood techniques (mortise-tenon-joint-technique).

## Voice-check errors fixed

17 files had errors; all fixed before upload. Error categories:

- **medical-claim "cures"** (4 files): finish descriptions used "cures hard" / "cures to a film". Replaced with "hardens" / "hardens to a film" / "sets hard" throughout.
- **em-dash** (5 files): em/en dashes in sourceNotes, excerpt, and body prose. Replaced with colons, commas, or parentheses per context.
- **grade-level** (6 files): paragraphs at grades 12.0–20.1. Sentence-level rewrites across opening paragraphs and bullet list items. File 32 card-scraper-technique required direct JSON node manipulation due to multi-node paragraph structure.
- **glossary-coverage** (8 files): registered terms not wrapped inline. Applied `glossaryTooltip` marks on first use. One file (11-thumb-push-cut-technique) had `sloyd-knife` registered but the term never appeared in the body — removed from glossaryTerms.
- **ORIGINAL sourceType**: all "ORIGINAL" sourceType values were invalid enum entries. Root cause traced to pre-existing brief files authored before the SourceType enum was finalised. All corrected to valid enum values (SYNTHESISED or retained PUBLIC_DOMAIN/CLASSIC).

## Hero fill

31 candidates processed by fixup-hero-fill.ts. 29 filled (Pexels / Unsplash / Wikimedia). 2 unset:
- british-species-for-green-woodwork: Flux billing halt (existing `_flux-billing-halt.md` signal)
- oak-cheese-board-handled: no matching hero found across all sources — falls back to procedural card

## QC

30 processed, 28 pass, 2 still_blocked (hero-missing entries). The hourly qc-fix-batch routine picks these up on next fire.

## Upload

0 upload failures. 30 net new entries PUBLISHED.
