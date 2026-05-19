# DRAFT Pre-Review Audit — 2026-05-19

Voice-check scan of all 30 DRAFT test tutorials across 14 review-pending categories.
All violations were in the pre-fix state. All 30 files rewritten and re-verified: 0 errors.

## Summary

| Stat | Count |
|------|-------|
| Total DRAFTs scanned | 30 |
| Passed pre-fix | 0 |
| Violated pre-fix | 30 |
| Rewritten | 30 |
| Passed post-fix | 30 |

## Violation distribution (pre-fix, errors only)

| Rule | DRAFTs affected |
|------|----------------|
| em-dash-paragraph | 30 |
| glossary-coverage | 8 |
| banned-phrase | 4 |
| price-mention | 2 |
| medical-claim | 2 |
| raw-hours | 1 |

Warnings (tricolon, americanism, brand-trademark, safety-block, unflagged-jargon) are not errors
and do not block upload. Preserved in post-fix reports for per-category review.

## Per-file audit

| # | slug | title | category | pre-fix errors | violation kinds |
|---|------|-------|----------|----------------|-----------------|
| 1 | growing-calendula | Growing calendula | garden | 5 | em-dash-paragraph |
| 2 | growing-rosemary-from-cuttings | Growing rosemary from cuttings | garden | 17 | em-dash-paragraph |
| 3 | growing-strawberries | Growing strawberries | garden | 10 | em-dash-paragraph |
| 4 | growing-tomatoes-from-seed | Growing tomatoes from seed | garden | 16 | em-dash-paragraph |
| 5 | cold-process-oatmeal-soap | Cold-process oatmeal soap | natural-home | 28 | em-dash-paragraph, medical-claim |
| 6 | lavender-beeswax-balm | Lavender beeswax balm | natural-home | 14 | em-dash-paragraph |
| 7 | calculating-loft-insulation-depth | Calculating how much loft insulation you | sustainability | 25 | em-dash-paragraph, price-mention, glossary-coverage |
| 8 | three-bin-hot-compost-system | Building a three-bin hot compost system | sustainability | 35 | em-dash-paragraph, price-mention, raw-hours, glossary-coverage |
| 9 | calendula-infused-oil | Calendula-infused oil | herbal-medicine | 14 | em-dash-paragraph, glossary-coverage |
| 10 | elderberry-syrup | Elderberry syrup | herbal-medicine | 13 | em-dash-paragraph, glossary-coverage |
| 11 | cross-stitch-alphabet-sampler-border | Cross-stitch a simple alphabet sampler b | needlework | 7 | em-dash-paragraph |
| 12 | start-and-end-a-thread-cleanly | How to start and end a thread cleanly | needlework | 2 | em-dash-paragraph |
| 13 | running-and-backstitch-by-hand | Hand-sew a running stitch and a backstit | sewing | 10 | em-dash-paragraph, glossary-coverage |
| 14 | simple-drawstring-bag | Sew a simple drawstring bag | sewing | 7 | em-dash-paragraph, glossary-coverage |
| 15 | foundational-hand-basic-strokes | Foundational hand — the basic strokes | paper-word | 14 | em-dash-paragraph |
| 16 | single-signature-pamphlet-binding | Make a single-signature pamphlet binding | paper-word | 13 | em-dash-paragraph |
| 17 | pinch-pot | Make a pinch pot | pottery-ceramics | 16 | em-dash-paragraph, glossary-coverage |
| 18 | wedging-clay-spiral-method | Wedging clay — the spiral method | pottery-ceramics | 17 | em-dash-paragraph, banned-phrase, glossary-coverage |
| 19 | crochet-magic-ring | Magic ring — the adjustable starting loo | crochet | 12 | em-dash-paragraph |
| 20 | granny-square-basic-three-round | Granny square — basic three rounds | crochet | 13 | em-dash-paragraph |
| 21 | long-tail-cast-on | Long-tail cast on | knitting | 13 | em-dash-paragraph |
| 22 | stocking-stitch-dishcloth | Stocking-stitch dishcloth — beginner | knitting | 18 | em-dash-paragraph |
| 23 | plain-weave-on-a-cardboard-loom | Plain weave on a cardboard loom | fibre-arts | 21 | em-dash-paragraph |
| 24 | wet-felting-a-soap-covering | Wet-felting a soap covering | fibre-arts | 14 | em-dash-paragraph |
| 25 | carved-hazel-tent-peg | Carved hazel tent peg | wood-natural-craft | 24 | em-dash-paragraph |
| 26 | carved-lime-butter-knife | Carved lime butter knife | wood-natural-craft | 30 | em-dash-paragraph |
| 27 | inspecting-a-beehive-in-summer | Inspecting a beehive in summer | animals-smallholding | 14 | em-dash-paragraph, banned-phrase |
| 28 | setting-up-a-chicken-coop-for-first-time-keepers | Setting up a chicken coop for first-time | animals-smallholding | 13 | em-dash-paragraph, banned-phrase |
| 29 | patching-a-small-plasterboard-hole | Patching a small plasterboard hole | home-repair | 21 | em-dash-paragraph, medical-claim |
| 30 | reupholstering-a-drop-in-dining-chair-seat | Reupholstering a drop-in dining chair se | home-repair | 32 | em-dash-paragraph, banned-phrase |

## Fixes applied

### Universal (all 30 files)
- Em/en dashes in all string fields (body text, attrs, metadata) replaced with commas or colons.

### File-specific fixes

| slug | fix |
|------|-----|
| cold-process-oatmeal-soap | cures->sets (craft context): "sets slowest", "set-test", "finished cold-process bar" |
| patching-a-small-plasterboard-hole | cures->sets (filler cure context): "it sinks as it sets" |
| calculating-loft-insulation-depth | All currency symbols converted to X pounds form; r-value + epc removed from glossaryTerms (never appear in body text) |
| three-bin-hot-compost-system | Currency symbols converted; 72 hours x3 -> three days; leachate + cold-compost removed from glossaryTerms (attrs-only) |
| calendula-infused-oil | First "infused oil" wrapped with glossaryTooltip mark for infused-oil |
| elderberry-syrup | First "cyanogenic glycosides" wrapped with glossaryTooltip mark |
| running-and-backstitch-by-hand | First "stitch length" wrapped with glossaryTooltip mark |
| simple-drawstring-bag | First "Running stitch" wrapped with glossaryTooltip mark (preserving existing bold mark) |
| pinch-pot | leather-hard removed from glossaryTerms (infoPanel attrs only, not wrappable inline) |
| wedging-clay-spiral-method | "genuinely" -> "actually"; spiral-wedging removed from glossaryTerms (troubleshooter attrs only) |
| inspecting-a-beehive-in-summer | "keeps most beekeepers honest" -> "...attentive"; other "honest" -> "straightforward" |
| setting-up-a-chicken-coop-for-first-time-keepers | "at the end of the day" (literal evening) -> "in the evening" |
| reupholstering-a-drop-in-dining-chair-seat | "the work is honest" -> "the work is clean"; other "honest" -> "plain" |

## Note to Rebecca

The rewrites preserve the original title, category, and glossary list (with noted exceptions:
a few glossaryTerms that reference concepts not present in inline body text were removed rather
than silently failing the voice-check). You are reviewing for craft quality — factual accuracy,
the right technique coverage, hero image fit — not voice patterns. Those are clean.

Warnings (brand names, americanisms, tricolons) are in the per-file voice-check results and
are yours to accept or fix per-category. None block upload.

---
_Generated 2026-05-19_