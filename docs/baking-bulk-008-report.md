# Baking bulk-008 batch report

**Date:** 2026-05-18  
**Model:** claude-sonnet-4-6  
**Batch:** bulk-008 (autopilot-queue)  
**Status uploaded:** PUBLISHED

---

## Entry count by sub-category

| Sub-category       | Count |
|--------------------|-------|
| sweets-confectionery | 10  |
| cake-decorating    | 8     |
| pies               | 8     |
| biscuits           | 6     |
| bread              | 5     |
| cakes              | 3     |
| **Total**          | **40** |

Difficulty split: ~10 BEGINNER / ~24 INTERMEDIATE / 6 ADVANCED.

---

## Notable entries

**Sweets-confectionery (10):** peppermint-creams, peanut-brittle, bonfire-toffee, toffee-apple, chocolate-bark-dark, chocolate-mendiants, chocolate-fudge, barley-sugar, nougat-white, peanut-butter-fudge. All hot-sugar entries include a `warning` infoPanel with the temperature and burn treatment protocol.

**Cake-decorating TECHNIQUEs (8):** piping-smooth-sides, royal-icing-flooding, chocolate-ganache-drip, american-buttercream-crusting, piping-basketweave, fondant-draping, fondant-modelling-figures, chocolate-tempering-technique. All `type: TECHNIQUE`, `foundational: true`.

**Pies (8):** tarte-tatin, tarte-au-citron, buttermilk-pie-southern, crostata-di-marmellata, french-silk-pie, sweet-potato-pie-southern, portuguese-custard-tarts, chocolate-cream-pie.

**Biscuits (6):** snickerdoodles, viennese-whirls, tuiles-almond, linzer-biscuits, cigarettes-russes, chocolate-chip-shortbread.

**Bread (5):** cloverleaf-rolls, knot-rolls, shokupan-japanese, milk-bread-buns-tangzhong, damper-australian. All `preFermentType: "NONE"`.

**Cakes (3):** marble-cake-chocolate-vanilla, genoise-sponge (foundational), tea-loaf-fruit.

---

## Voice-check summary

All 40 files passed voice-check (exit code 0 or 1). No upload was blocked.

**Errors found and fixed (exit code 2 → fixed before upload):**

3 files had em-dash pairs (2 em dashes in a single paragraph or sentence), which the voice-check rejects as style errors. All fixed by replacing `— text —` with `(text)` parentheses:

- `fondant-modelling-figures.json` — body paragraph listing the five base shapes
- `snickerdoodles.json` — sourceNotes sentence listing defining characteristics
- `viennese-whirls.json` — opening body paragraph comparing to shortbread

**Warnings (exit code 1, uploadable):**

16 files produced warnings (tricolon patterns, voice-register notes). All were accepted by the upload script.

---

## Upload results

| Result  | Count |
|---------|-------|
| CREATED | 39    |
| UPDATED | 1     |
| FAILED  | 0     |

**Previous baking total:** 384  
**New baking total:** 423  
(+39 net new entries)

---

## New glossary terms introduced

barley-sugar (no glossary — technique described inline), `modelling-paste`, `ribbon-stage`, `hard-crack-stage`, `soft-ball-stage`, `italian-meringue`, `crumb-coat`, `royal-icing`, `ganache`, `sugarpaste`, `tempering`, `beurre-noisette`, `blind-baking`, `pasta-frolla`, `rough-puff-pastry`, `tangzhong`.

---

## Anti-tells to document

None new. The em-dash pair pattern is already documented in `docs/baking-anti-tells.md`. No new recurring pattern appeared 3+ times across this batch that wasn't already documented.
