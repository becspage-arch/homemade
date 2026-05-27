Batch 2026-05-27-batch26: 50 tutorials retrofitted. Docs-only commit (no packages/** changes), so deploy workflow did not fire. Healthz already 200 from prior deploy. DB content live (apply script writes directly to DB, not via the deploy path).

## DB audit (audit-recent-state.ts)

```
CATEGORIES
ord | slug                  | status      | subs | last fire        | PUB    | DRAFT
  1 | cooking               | READY       |    2 | 2026-05-20 17:21 |   1139 |     0
  2 | baking                | READY       |    8 | 2026-05-20 13:33 |    573 |     0
  3 | garden                | NOT_READY   |    9 | 2026-05-17 15:05 |      0 |     4
  4 | mindset               | READY       |   11 | 2026-05-20 19:20 |    845 |     0
  5 | herbal-medicine       | NOT_READY   |   10 | 2026-05-20 08:38 |     42 |     0
  6 | crochet               | NOT_READY   |    5 |                  |      0 |     4
  7 | knitting              | NOT_READY   |    9 |                  |      0 |     3
  8 | needlework            | NOT_READY   |    4 |                  |      0 |     3
  9 | sewing                | NOT_READY   |   15 |                  |      0 |     2
 10 | fibre-arts            | READY       |    6 | 2026-05-20 20:30 |    127 |     0
 11 | wood-natural-craft    | READY       |    6 | 2026-05-20 23:08 |    162 |     0
 12 | paper-word            | READY       |    9 | 2026-05-21 00:28 |    117 |     0
 13 | pottery-ceramics      | READY       |    6 | 2026-05-21 02:42 |     82 |     0
 14 | animals-smallholding  | READY       |    6 | 2026-05-21 04:28 |    121 |     0
 15 | home-repair           | READY       |    6 | 2026-05-21 06:49 |    123 |     0
 16 | natural-home          | READY       |    5 | 2026-05-21 01:23 |     82 |     0
 17 | sustainability        | READY       |    6 | 2026-05-21 06:49 |    122 |     0

IMAGE VERIFICATION
  UNVERIFIED                   : 2316
  VERIFIED                     : 1219
```

## Voice retrofit progress (voiceRetrofittedAt IS NOT NULL)

- Before this fire: 1231 PUBLISHED tutorials with voiceRetrofittedAt set
- After this fire:  1281 PUBLISHED tutorials with voiceRetrofittedAt set
- Delta:            50 (matches batch size)
- Total PUBLISHED:  3535
- Remaining (voiceRetrofittedAt IS NULL): 2254

Note on prior hand-offs: batches before this one have been reporting the shared `_voice-retrofit-count.ts` figure, which queries `revisedFrom IS NOT NULL`. That count is polluted by other pipelines (image-relevance etc.). The correct field is `voiceRetrofittedAt`, queried by `_voice-retrofit-count-correct.ts`. The numbers in this hand-off reflect the correct field.

## Spot-check (one slug from batch)

- slug: chiffon-cake
- voiceRetrofittedAt: 2026-05-27T04:44:27.961Z
- url: https://homemade.education/baking/chiffon-cake (site is currently behind splash gate so anonymous traffic lands on /coming-soon; DB content confirmed via direct query)
- new first paragraph (from DB):

> Chiffon cake uses oil instead of butter and relies on folded-in egg whites for its rise. The oil keeps the crumb moist even when cold, butter-based cakes firm up in the fridge; chiffon stays soft. The egg whites, whisked to stiff peaks and folded in at the end, give it an extraordinary lightness. The result sits somewhere between a génoise and an angel food cake: richer than the latter, airier than the former.

## Sample public URLs across categories

- https://homemade.education/cooking/bifteki
- https://homemade.education/cooking/best-french-toast
- https://homemade.education/baking/chiffon-cake
- https://homemade.education/baking/cherry-bakewell-traybake
- https://homemade.education/mindset/i-am-worthy-of-millions-simply-because-i-am
- https://homemade.education/fibre-arts/warping-a-rigid-heddle-loom
- https://homemade.education/wood-natural-craft/seasoned-wood-primer
- https://homemade.education/paper-word/signature-folding-and-piercing
- https://homemade.education/pottery-ceramics/trimming-a-foot-ring-on-the-wheel
- https://homemade.education/animals-smallholding/weaning-lambs
- https://homemade.education/sustainability/solar-pv-shading-assessment

## Before / after excerpts (3 content types)

### Cooking: bifteki (paragraph[11])

Old:
> Bifteki is the taverna's contribution to the Greek grill repertoire: simpler than a kleftiko, faster than a roast lamb, more substantial than souvlaki. Greek tavernas keep it on the menu year-round, but it is a warm-season dish at heart, grilled outside over wood or charcoal, eaten with salad and retsina in the early evening.

New:
> Bifteki is the taverna's take on Greek grilling. Simpler than kleftiko, faster than a roast lamb, more substantial than souvlaki. Tavernas serve it year-round, but it's really a warm-season dish. It's grilled outside over wood or charcoal and eaten with salad and retsina in the early evening.

### Sustainability: solar-pv-system-monitoring (paragraph[0])

Old:
> Every solar PV system has an inverter that logs generation. Most modern inverters have manufacturer apps (Solaredge, SolarEdge, Growatt, GoodWe, Fronius) that show real-time and historical generation in kWh. If the inverter has no connectivity, a clip-on energy monitor on the generation circuit shows real-time output.

New:
> Every solar PV system has an inverter that logs generation. Most modern inverters have an app from the maker (Solaredge, SolarEdge, Growatt, GoodWe, Fronius). The app shows live and past generation in kWh. If the inverter is not online, a clip-on energy monitor on the generation circuit shows live output.

### Paper-word (craft technique): single-signature-pamphlet-binding (paragraph[0])

Old:
> The single-signature pamphlet is the foundation hand-bound book. One folded signature of inner pages tucked inside one folded cover sheet, three holes pierced down the spine fold, and a length of waxed linen thread sewn through in a single pass. Douglas Cockerell, in Bookbinding and the Care of Books (1901), calls this binding the starter for any hand-bookbinder, and the construction has not changed since.

New:
> The single-signature pamphlet is the simplest hand-bound book. One folded signature of inner pages tucks inside one folded cover sheet. Three holes pierced down the spine fold, and a length of waxed linen thread sewn through in a single pass. This binding is the standard starter for any hand-bookbinder, and the construction has not changed for over a century.

## Category-by-category count

- animals-smallholding: 7
- baking: 6
- cooking: 6
- fibre-arts: 5
- mindset: 6
- paper-word: 6
- pottery-ceramics: 2
- sustainability: 6
- wood-natural-craft: 6

(Content-type spread not required for batch 4+. This is batch 26.)

## Notes

- Of the 50 picks, 34 were already voice-check clean on export. The 16 dirty files all failed on single or small numbers of grade-level paragraphs above the 12.0 threshold, plus two non-grade issues: a year-only "(1901)" reference in single-signature-pamphlet-binding (the Douglas Cockerell attribution was already in sourceNotes, so the inline name was simply removed); and a "Defra" institutional name in sorting-kerbside-recycling-correctly paragraph[8] (Defra is already in sourceNotes, so the inline mention was reworded to "English councils" without losing substance).
- best-french-toast paragraph[12] mentioned Escoffier, Larousse Gastronomique, Elizabeth David and Julia Child in body prose. Rewritten to drop the historical figures (none were in sourceNotes; existing sourceNotes is "Rebecca's personal cookbook"). Substance preserved as "written down in French cookery books for over a century, English-speaking home cooks have followed the same approach since the 1950s."
- bifteki paragraph[11] mentioned the Ottoman / French etymology in body prose. The etymology stayed in body (it's substantively useful to the reader and not an institutional name) but the long sentence was broken into shorter ones.
- Several paragraphs were split across multiple text nodes because of glossaryTooltip marks (solar-pv-system-monitoring paragraph[0] has 4 tooltips; threading-four-shaft-floor-loom paragraph[0] has 4 tooltips; single-signature-pamphlet-binding paragraph[0] has 1 tooltip). Each rewrite preserved the tooltipped term verbatim and edited only the surrounding plain text. termIds untouched.
- Two pre-existing em dashes were found in body fields the apply script writes to DB (threading-four-shaft-floor-loom troubleshooter symptom; signature-folding-and-piercing recipeTool name). The voice-check did not flag these (the binary em-dash rule does not cover those specific JSON paths), but I replaced them with ASCII punctuation per the worker brief's "no em dashes anywhere in bodies" rule.
- No file showed a word-count drop over 20%. Most rewrites kept word count within a few percent; chelsea-buns-currant paragraph[0] and solar-shed-lighting-12v paragraph[0] grew slightly from sentence-splitting.
- Site is currently behind the splash gate, so the public URLs above currently render the /coming-soon page to anonymous traffic. DB content verified directly.

## Full slug list (50)

best-ever-brownies, best-ever-cauliflower-cheese, best-french-toast, best-salty-crunchy-kale-crisps, best-vegan-cinnamon-rolls, bifteki, chelsea-buns, chelsea-buns-currant, cherry-bakewell-traybake, cherry-pie-double-crust, cherry-scones, chiffon-cake, i-am-worthy-of-millions-simply-because-i-am, i-ask-clearly-and-i-ask-directly-affirmation, i-attract-outstanding-investment-deals, i-begin-from-where-i-am, i-begin-from-where-i-am-not-where-i-should-be, i-belong-to-the-rhythm-of-rest-affirmation, rush-chair-back-panel, rush-mat-oblong, rush-plait-table-runner, rush-seat-drop-in-panel, rush-woven-table-mat, seasoned-wood-primer, sewing-on-tapes, signature-folding-and-piercing, silhouette-portrait-papercutting, simple-slipcase, single-signature-pamphlet-binding, six-pointed-snowflake-papercut, solar-immersion-diverter-guide, solar-pv-shading-assessment, solar-pv-system-monitoring, solar-shed-lighting-12v, solid-wall-insulation-comparison, sorting-kerbside-recycling-correctly, threading-four-shaft-floor-loom, traditional-rug-hooking-basics, trimming-a-foot-ring-on-the-wheel, twill-weave-on-a-rigid-heddle, underglaze-painting-on-bisqueware-no-kiln, understanding-the-sheep-year, varroa-mite-count, warping-a-frame-loom, warping-a-rigid-heddle-loom, water-trough-maintenance, wax-moth-treatment-and-prevention, weaning-lambs, weaning-piglets, wing-clipping-chickens

## Forward read

2254 PUBLISHED tutorials with voiceRetrofittedAt IS NULL remain after this fire.
