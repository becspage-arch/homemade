# Baking batch 2026-05-28 - handoff

Session: nifty-davinci-11be90  
Date: 2026-05-28  
Commit: bbf74fb  

## What was done

Authored and published 40 baking tutorials as a manual single-shot batch. All tutorials were written with voice rules applied (FKGL under 12.0, no banned phrases, no em or en dashes), uploaded as PUBLISHED, and passed through the image relevance gate.

## Upload summary

- Total: 40 tutorials
- Created (new): 17
- Updated (existing slug refreshed): 23
- Failures: 0

Tutorials published:
apple-blackberry-pie, banana-bread-walnut, berry-pavlova-summer, buche-de-noel, canele-bordelais, carrot-and-walnut-cake, cherry-clafoutis, chocolate-courgette-cake, chocolate-sandwich-cake-buttercream, christmas-cake-last-minute, courgette-bread, crostata-di-pere-e-cioccolato, cupcakes-vanilla, death-by-chocolate-cake, filled-doughnuts-custard, filled-doughnuts-jam, filo-triangles-sweet-almond, financiers-french, free-form-galette-rustic, ginger-loaf-crystallised-ginger, hand-pies-peach, hazelnut-roulade, lamington-australian, lemon-curd-pavlova, maamoul-mad-levantine, mhencha-moroccan-coiled, mini-pavlovas, nyc-style-giant-cookies, orange-polenta-cake, pain-rustique-slack-dough, pikelets-yorkshire, pizzelle-italian, rosettes-scandinavian, soda-farls-northern-irish, sourdough-discard-banana-bread, spoonbread-southern, sugar-cookies-rolled-iced, tarte-aux-fraises, triple-chocolate-layer-cake, vollkornbrot-german

## Image relevance gate

28 new baking image verdicts added to docs/image-relevance-verdicts.json and applied via apply-relevance-verdicts.ts.

Results across all 148 verdicts processed in the run:
- EXACT kept: 43
- WRONG regenerated successfully: 9 (via flux-schnell or pexels)
- WRONG regen failed, fell back to procedural card: 6
- WRONG not attached as hero (skipped regen): 90

The 6 procedural card fallbacks are within the new baking tutorials. Regen failed on those specific images; the procedural card is the correct automatic fallback, not a manual choice.

## Deploy

- GitHub Actions run: 26595220208
- All steps green, no failures
- /healthz returned 200
