# Baking bulk-004 batch report

**Date:** 2026-05-17  
**Entries:** 49 PUBLISHED  
**Upload runs:** 2 (17 voice-check failures on run 1; 0 on run 2)  
**Net new DB entries:** 49

---

## Sub-category breakdown

| Sub-category      | Count | Entries |
|-------------------|-------|---------|
| cake-decorating   | 13    | buttercream-frosting-vanilla, cream-cheese-frosting-classic, naked-cake-finish, piping-rosettes-and-stars, marzipan-covering-fruit-cake, fondant-covering-cake, ermine-frosting, chocolate-collar, fondant-sugar-flowers, chocolate-drip-cake, italian-meringue-frosting, mirror-glaze-chocolate, sugar-work-spun-caramel |
| sweets-confectionery | 11 | fudge-vanilla-classic, coconut-ice-pink-white, marzipan-homemade, candied-orange-peel, chocolate-bark-pistachio-cranberry, panforte-siena, brandy-truffles, caramel-sauce-salted, hazelnut-praline, marshmallows-vanilla-homemade, tablet-scottish |
| pies              | 8     | treacle-tart, mince-pies-christmas, chicken-and-leek-pie, lemon-meringue-pie, custard-tart-british, quiche-lorraine, summer-fruit-tart, steak-and-kidney-pie |
| pastries          | 8     | danish-apple-custard, baklava-walnut-honey, apple-strudel-filo, vol-au-vents-mushroom, eclairs-chocolate, profiteroles-cream-filled, sausage-rolls-rough-puff, spanakopita-spinach-feta |
| bread             | 5     | rye-bread-dark-nordic, milk-bread-japanese, rosemary-focaccia, spelt-loaf-wholegrain, tiger-bread-dutch-crunch |
| cakes             | 4     | tres-leches-cake, financiers-brown-butter, battenberg-cake, chocolate-orange-marble-cake |

---

## Difficulty breakdown

- **BEGINNER:** apple-strudel-filo, rye-bread-dark-nordic, rosemary-focaccia, spelt-loaf-wholegrain, tres-leches-cake, financiers-brown-butter, chocolate-orange-marble-cake, fudge-vanilla-classic, coconut-ice-pink-white, marzipan-homemade, candied-orange-peel, chocolate-bark-pistachio-cranberry, brandy-truffles, caramel-sauce-salted, buttercream-frosting-vanilla, cream-cheese-frosting-classic, naked-cake-finish, ermine-frosting — 18
- **INTERMEDIATE:** steak-and-kidney-pie, chicken-and-leek-pie, quiche-lorraine, lemon-meringue-pie, custard-tart-british, summer-fruit-tart, treacle-tart, mince-pies-christmas, danish-apple-custard, eclairs-chocolate, profiteroles-cream-filled, baklava-walnut-honey, sausage-rolls-rough-puff, spanakopita-spinach-feta, vol-au-vents-mushroom, milk-bread-japanese, tiger-bread-dutch-crunch, battenberg-cake, panforte-siena, marshmallows-vanilla-homemade, tablet-scottish, hazelnut-praline, piping-rosettes-and-stars, marzipan-covering-fruit-cake, fondant-covering-cake, chocolate-collar, fondant-sugar-flowers, chocolate-drip-cake, italian-meringue-frosting, mirror-glaze-chocolate — 30
- **ADVANCED:** sugar-work-spun-caramel — 1

---

## Voice-check failures (run 1) — all em-dash pairs

17 files failed voice-check on first upload. Every failure was an em-dash appositive pair (`— X —`), plus one banned-word hit (`genuinely` in excerpt). All 17 fixed by converting pairs to parenthetical `(X)` form, or rewriting as colon/comma constructions, before re-uploading.

Files fixed:
- brandy-truffles (excerpt pair)
- caramel-sauce-salted (body pair)
- chocolate-orange-marble-cake (excerpt pair)
- custard-tart-british (sourceNotes pair)
- eclairs-chocolate (sourceNotes pair)
- hazelnut-praline (body pair)
- italian-meringue-frosting (body pair spanning glossaryTooltip boundary)
- marshmallows-vanilla-homemade (banned word "genuinely" in excerpt)
- mirror-glaze-chocolate (sourceNotes pair)
- profiteroles-cream-filled (sourceNotes pair)
- quiche-lorraine (sourceNotes pair + body pair)
- sausage-rolls-rough-puff (sourceNotes pair)
- spanakopita-spinach-feta (body pair)
- steak-and-kidney-pie (sourceNotes pair + body pair)
- sugar-work-spun-caramel (excerpt pair)
- summer-fruit-tart (body pair)
- tablet-scottish (sourceNotes pair + body pair)

---

## Patterns and notes

**Em-dash pairs remain the dominant failure mode.** For the fourth consecutive bulk, em-dash appositive pairs (`— A, B, C —`) in sourceNotes are the most common error. The pattern `"The X form — A, B, C — is documented..."` in sourceNotes appears in at least half the failures. Pre-flight em-dash scan (as used in bulk-002) should remain standard.

**Glossarytooltip boundary pairs.** `italian-meringue-frosting` had a pair split across adjacent text nodes with a `glossaryTooltip` mark in between: `"...— the "` + tooltip text + `" stage —..."`. The voice-checker concatenates all text nodes in a paragraph, so both em-dashes counted against the same paragraph. Fix: parenthesise both surrounding text nodes.

**Banned words.** `genuinely` surfaced in `marshmallows-vanilla-homemade` excerpt ("genuinely flavoured"). Replaced with "well-flavoured". Add to pre-flight scan.

**Sub-category coverage after bulk-004:**  
bread 39, cakes 37, pies 27, pastries 28, biscuits 23, scones 15, sweets-confectionery 24, cake-decorating 18.  
Bread and cakes still trail pies/pastries (which had heavy coverage in bulk-002). The next baking bulk should continue rotating all sub-categories evenly.

---

## Cumulative baking count

| Batch    | Entries | Running total |
|----------|---------|---------------|
| pilot-10 | 10      | 10            |
| bulk-001 | 50      | 60            |
| bulk-002 | 50      | 110           |
| bulk-003 | 49      | 159           |
| bulk-004 | 49      | **208**       |

(4 anchor DRAFTs pending Rebecca review not included in PUBLISHED count.)
