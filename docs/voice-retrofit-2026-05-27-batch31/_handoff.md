Batch 2026-05-27-batch31: 63 tutorials retrofitted. Deploy green, healthz 200.

## DB audit (audit-recent-state.ts)

```
CATEGORIES
ord | slug                  | status      | subs | last fire        | PUB    | DRAFT
  1 | cooking               | READY       |    2 | 2026-05-20 17:21 |   1139 |     0
  2 | baking                | READY       |    8 | 2026-05-20 13:33 |    573 |     0
  3 | garden                | NOT_READY   |    9 | 2026-05-17 15:05 |      0 |     4
  4 | mindset               | READY       |   11 | 2026-05-20 19:20 |    845 |     0
  5 | herbal-medicine       | NOT_READY   |   10 | 2026-05-20 08:38 |     42 |     0
  6 | crochet               | NOT_READY   |    5 | n/a              |      0 |     4
  7 | knitting              | NOT_READY   |    9 | n/a              |      0 |     3
  8 | needlework            | NOT_READY   |    4 | n/a              |      0 |     3
  9 | sewing                | NOT_READY   |   15 | n/a              |      0 |     2
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

(Audit output's "last fire" column originally contained em-dash placeholders for categories that have not autopiloted; rendered as `n/a` here to keep the hand-off em-dash clean.)

## Voice retrofit progress

- Before this fire: 1494 PUBLISHED tutorials with voiceRetrofittedAt set.
- After this fire: 1557 PUBLISHED tutorials with voiceRetrofittedAt set.
- Remaining: 1978 PUBLISHED tutorials with voiceRetrofittedAt IS NULL.
- Delta matches batch size (63). PASS.

## Spot-check (one slug from batch)

- slug: croissants-laminated
- voiceRetrofittedAt: 2026-05-27T10:41:24.106Z
- url: https://homemade.education/baking/croissants-laminated (site behind splash gate; anonymous traffic lands on /coming-soon, so body is not visible to a public curl. DB content confirmed via direct query.)
- new first paragraph (from DB):

> Croissants are a laminated yeasted dough. You roll out a soft yeasted dough. Lay a flat slab of cold butter on top. Fold and roll the dough three times over a day, with rests in the fridge between each fold. The folding builds layers of butter and dough. The proof and bake then puff those layers apart into the airy crisp-flaked shape that defines the croissant.

## Sample public URLs across categories

- https://homemade.education/cooking/cassoulet
- https://homemade.education/cooking/caprese
- https://homemade.education/cooking/cacio-e-pepe
- https://homemade.education/baking/croissants-laminated
- https://homemade.education/baking/damper-australian
- https://homemade.education/baking/custard-tart-portuguese
- https://homemade.education/mindset/i-rest-because-i-am-valuable-energy-statement
- https://homemade.education/mindset/i-say-yes-to-wealth-in-every-layer-of-me
- https://homemade.education/sustainability/water-hardness-and-scale
- https://homemade.education/wood-natural-craft/whittled-ash-marking-gauge

## Before / after excerpts (three content types)

### Cooking RECIPE: cassoulet (paragraph[16])

BEFORE:
> The rivalry between Carcassonne, Castelnaudary and Toulouse over the correct cassoulet recipe has been conducted with the seriousness of a diplomatic dispute for at least a century. Castelnaudary claims the original; Toulouse adds confit duck and mutton. This recipe sides with Castelnaudary's emphasis on the crust. Whatever the provenance, cassoulet is the great winter dish of the Languedoc, best made on a Saturday when there is nowhere to be until Sunday.

AFTER:
> The fight between Carcassonne, Castelnaudary and Toulouse over the right cassoulet recipe has run for at least a century. They argue about it like a treaty dispute. Castelnaudary claims the first version. Toulouse adds confit duck and mutton. This recipe sides with Castelnaudary's focus on the crust. Whichever town is right, cassoulet is the great winter dish of the Languedoc. Best made on a Saturday when you have nothing to do until Sunday.

### Baking RECIPE: croissants-laminated (paragraph[0])

BEFORE:
> Croissants are a laminated yeasted dough: a soft yeasted dough is rolled out, a flat slab of cold butter is laid over it, and the dough is folded and rolled three times over a day, with rests in the fridge between each fold. The folding builds layers of butter and dough; the proof and bake then puff those layers apart into the airy crisp-flaked structure that defines the croissant.

AFTER:
> Croissants are a laminated yeasted dough. You roll out a soft yeasted dough. Lay a flat slab of cold butter on top. Fold and roll the dough three times over a day, with rests in the fridge between each fold. The folding builds layers of butter and dough. The proof and bake then puff those layers apart into the airy crisp-flaked shape that defines the croissant.

### Sustainability TECHNIQUE: water-hardness-and-scale (paragraph[5])

BEFORE:
> Magnetic conditioners and electronic scale inhibitors (devices clamped to pipework) are widely sold but have no consistent independent evidence of effectiveness. They do not remove hardness ions; their claimed mechanism is that they alter crystal structure to prevent adhesion, which laboratory studies have not consistently confirmed.

AFTER:
> Magnetic conditioners and electronic scale inhibitors are devices that clamp onto pipework. They are sold widely but no consistent independent evidence supports them. They do not remove hardness ions. The claim is that they change crystal shape so scale does not stick. Lab studies have not consistently shown this to be true.

## Category breakdown (63 total)

- cooking: 19
- baking: 19
- mindset: 19
- paper-word: 2
- sustainability: 2
- wood-natural-craft: 2

## Content type breakdown (batches past 3 do not require type spread; recorded for visibility)

- RECIPE (cooking + baking): 38
- PRACTICE (mindset energy statements): 19
- TECHNIQUE (sustainability + paper-word how-to): 3
- PATTERN (water-butt elevated stand + two whittled wood projects): 3

## Notes from this fire

- 48/63 candidates passed voice-check cleanly with no edits needed. The
  apply step still stamped voiceRetrofittedAt on all 63 so the routine's
  forward read stays accurate.
- 15 files needed targeted rewrites for grade-level only. No
  institutional-name, historical-figure, prose-style-steps, clinical-vocab,
  or em-dash violations on this batch.
- Most grade-level fixes were "where this dish lives" or cultural-history
  closers deep in the recipe body, not orientation paragraphs. Sentences
  were shortened and a few high-syllable words simplified.
- Two pre-existing em-dash / en-dash characters were cleaned up in field
  text that the voice-check does not currently scan: the en-dash in
  danish-pastry-plain.json `recipe.yieldDescription` (replaced with "to")
  and the em-dash in a supply card item name in watermarks-on-the-mould.json
  (replaced with a semicolon). Both are minor; flagged here in case the
  voice-check rules want extending to cover non-paragraph field text in a
  future pass.
- water-hardness-and-scale was the heaviest single file with 5 grade-level
  paragraphs (one at grade 17.2). The rewrites preserved every technical
  fact (salt cycle volume, polyphosphate dosing pot, magnetic-conditioner
  scepticism) while shortening sentences and swapping in plainer verbs.
- No word-count drops over 20% on any file. Rewrites added one or two
  sentences in places where breaking a complex sentence in half needed an
  extra linking clause.

## Forward read

- PUBLISHED tutorials with voiceRetrofittedAt IS NULL after this fire: 1978.

## Full list of slugs retrofitted in this batch

cooking (19):
- cacio-e-pepe
- caesar-salad-classic
- calamares-a-la-romana
- callaloo
- callaloo-soup-trinidad
- callaloo-stew
- calzone
- canard-aux-cerises
- caponata
- caprese
- caramelised-biscuit-truffles
- caramelized-onion-bacon-and-parmesan-risotto
- carbonnade-flamande
- caribbean-black-cake
- carrot-and-coriander-soup
- cassoulet
- cauliflower-bites
- cauliflower-cheese
- cauliflower-cheese-soup

baking (19):
- courgette-lemon-loaf
- cream-scones-devon-style
- cream-tea-scones
- croissants
- croissants-laminated
- crostata-di-marmellata
- crumpets
- crumpets-yeasted
- cupcakes-chocolate
- cupcakes-lemon
- cupcakes-red-velvet
- custard-creams
- custard-creams-homemade
- custard-tart-british
- custard-tart-english
- custard-tart-portuguese
- damper-australian
- danish-apple-custard
- danish-pastry-plain

mindset (19):
- i-release-the-need-to-chase-and-allow-effortless-flow
- i-release-the-need-to-force-sleep
- i-release-the-old-family-money-story-and-allow-a-new-one
- i-release-wealth-as-just-mine-and-allow-stewardship
- i-rest-because-i-am-valuable-energy-statement
- i-save-easily-and-joyfully
- i-say-yes-to-wealth-in-every-layer-of-me
- i-see-myself-thats-the-only-one-that-counts
- i-see-the-story-i-am-not-the-story
- i-show-up-daily-for-my-money
- i-steward-wealth-with-purpose-and-joy
- i-take-decisive-confident-action
- i-trust-my-body-completely-sleep-affirmation
- i-trust-my-skill-and-wisdom-to-build-property
- i-trust-that-perfect-timing-is-on-my-side
- i-trust-wealth-beyond-market-moods-affirmation
- i-welcome-the-unexpected
- i-will-keep-growing-i-will-keep-giving
- in-and-out-easy-and-clean-affirmation

paper-word (2):
- watercolour-journal-backgrounds
- watermarks-on-the-mould

sustainability (2):
- water-butt-elevated-stand
- water-hardness-and-scale

wood-natural-craft (2):
- whittled-ash-marking-gauge
- whittled-beech-kitchen-peg
