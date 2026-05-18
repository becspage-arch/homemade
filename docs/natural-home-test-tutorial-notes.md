# Natural-home test tutorial notes

Notes on the two test tutorials at
`docs/natural-home-anchor-briefs/`, written during the pipeline-setup
session (2026-05-18). Saved here so Rebecca's review can see what
the worker was thinking on the rough edges, and so the eventual
`docs/natural-home-anti-tells.md` has somewhere to draw the first
pass from.

## What the two tutorials test

| Tutorial | Tests |
|---|---|
| `lavender-beeswax-balm` | The simplest natural-home shape — anhydrous, no cure, two ingredients + a fragrance, tool-light. Validates the balm sub-category as a beginner entry point and exercises the new `shelfLifeDays` + `shelfLifeNotes` fields on a 12-month product. |
| `cold-process-oatmeal-soap` | The hardest natural-home shape — gram-accurate, lye-handling, 4-6 week cure with `projectSchedule` milestones, tool-heavy. Validates the soap sub-category and exercises the multi-day arc pattern at its longest natural-home stretch. |

Together they cover BEGINNER + ADVANCED, balm + soap, single-session
+ multi-day, no-lye + lye, anhydrous + cold-process — the full
register the pipeline needs to support.

## Self-critique against the natural-home prompt

### Lavender beeswax balm

- **No DIY prefix.** Title is "Lavender beeswax balm" — no "DIY
  beauty" framing.
- **Safety as body steps.** Patch-test lives in its own H2; nut
  allergy and pregnancy-caution are named in prose. No boxed
  warning.
- **Gram-accurate.** Every ingredient in grams (sweet almond oil
  40 g, beeswax 10 g, essential oil 0.5 g by weight). Drop count
  noted as approximate and the scale as authoritative.
- **Percentages anchor.** "1% essential oil load, 1:4 beeswax-to-
  oil" stated in the intro.
- **Shelf life named.** 12 months (`shelfLifeDays: 365`) in intro,
  Storage H2, structured field. Spoilage cues — white spots,
  paint-like smell — named.
- **Glossary inline coverage.** Three terms: anhydrous, melt-point,
  patch-test. All three appear inline wrapped in `glossaryTooltip`
  marks.
- **Technique linking.** `double-boiler-method` referenced inline
  via `techniqueLink` mark; the underlying technique is the only
  one that genuinely matters for the recipe.

### Cold-process oatmeal soap

- **No DIY prefix.** Title is "Cold-process oatmeal soap" — no
  "DIY soap" framing.
- **Lye safety as body steps.** Every safety beat is a numbered
  imperative: open the window, move pets out, put on goggles and
  gloves, never water-into-lye, vinegar in reach. No boxed
  warning callout — the gravity is in the steps.
- **Gram-accurate.** Olive 600 g / coconut 300 g / castor 100 g /
  water 330 g / NaOH 143 g / oatmeal 30 g / EO 20 g. Lye
  calculator output line printed verbatim so a reader can audit
  the arithmetic.
- **Percentages anchor.** 60/30/10 oil split, 33% lye discount,
  5% superfat, 2% EO load — all stated in the intro.
- **Shelf life named.** 2 years (`shelfLifeDays: 730`) in intro,
  Storage H2, structured field. DOS named as the failure mode.
- **ProjectSchedule populated.** Four steps at offsetDays 1, 14,
  28, 42 — day 1 / 28 / 42 as HERO, day 14 as RAIL_CARD.
- **Cure-test instruction present.** pH strip optional but
  recommended; "use the test sliver as the household soap" gives
  a real action for the day-28 step instead of a passive wait.
- **Troubleshooter populated.** Five failure modes with
  cause/fix: false trace, seize, soda ash, overheated gel, high
  pH at cure.

## Open questions for Rebecca's review

1. **Sub-category structure — is five enough?** The five I went
   with are `soap`, `candles`, `beauty`, `cleaning`, `fragrance`.
   A sixth on `wellness-bath` (bath bombs, bath salts, bath
   melts) is a plausible split — at the moment those land under
   `beauty`. I've kept it at five because the prompt called for
   five and the bath-product overlap with `beauty` is mostly the
   same chemistry. Flag if you want bath split out.

2. **CPSR + legal framing.** I added the `cpsr` glossary term
   covering UK Cosmetic Product Safety Reports. The author prompt
   notes that home-batch products for personal use are not subject
   to CPSR but that selling a home cosmetic without one is
   illegal. I haven't built that into a separate Foundations
   reading — that's a follow-up if Rebecca wants the legal
   framing surfaced as a stand-alone tutorial.

3. **Liquid soap (KOH) deferred.** The author prompt mentions
   liquid soap and the master ingredient list has KOH ready, but
   the launch test batch only covers bar soap. Liquid soap-paste
   is a different shape (longer cook, dilution phase, mandatory
   preservative for the diluted product) and I'd rather get the
   bar shape proven first.

4. **Preservative discussion in `beauty`.** The lotion sub-track
   needs the broad-spectrum preservative discussion. I've put a
   glossary term in (`broad-spectrum-preservative`) and the
   author prompt covers it, but no test tutorial in this batch
   exercises a water-containing lotion. Pilot batch will need at
   least one lotion entry to prove the shape.

5. **Pet-toxic essential oils — explicit list.** The author
   prompt names tea tree, peppermint, eucalyptus, citrus, ylang-
   ylang, pennyroyal, wintergreen, pine, sweet birch as toxic to
   cats. I added that list as a hard-rule body item rather than
   a disclaimer. The cleaning sub-track will need this called
   out particularly clearly (cats walk on the surfaces).

6. **Image-sourcing chain.** I added a natural-home branch to the
   orchestrator with Pexels-first. Pexels has strong coverage of
   the soap / candle / amber-bottle aesthetic. Worth a sanity
   check once the heroes batch-generate against the cold-process
   soap and balm test rows.

7. **Schema additions.** Added `Tutorial.shelfLifeDays` (Int?) and
   `Tutorial.shelfLifeNotes` (String?) per the pipeline-setup
   brief. The integer goes through to a B-tree index for the
   "what keeps longer than 6 months" filter. Both fields are
   nullable; cooking + baking rows leave them null. If the
   product-shelf-life concept proves out, we can backfill
   `shelfLifeDays` onto existing herbal REMEDY rows in a later
   pass — the `makeAheadNotes` field on those rows currently
   carries the same information in prose.

8. **Did NOT flip pipelineStatus.** Per the brief, the flip
   script at `packages/db/scripts/flip-natural-home-ready.ts` is
   present but not run. Autopilot will continue to skip
   natural-home until Rebecca flips manually.

## Author prompt voice — known gaps

The author prompt is on its first draft. A few patterns that may
need anti-tells once a pilot batch is in:

- **Cosmetic chemistry "magic" framing** — the urge to talk about
  saponification in mystical terms. The prompt flags this but a
  pilot will surface specific phrasings to ban.
- **"Natural" hand-waving** — "all natural", "chemical-free"
  (chemically inaccurate), "pure" (vague). The prompt names
  these but specific patterns ("pure plant-based", "100%
  natural") may need to land in a banned-phrase list.
- **Essential-oil safety over-claiming** — "lavender helps with
  anxiety", "tea tree is antibacterial" stray into medical-claim
  territory. The herbal voice rules cover this but a
  natural-home draft may need an explicit nudge that the same
  rules apply.
- **Pet-safety as a footnote rather than a body step** — the
  prompt names this but the pilot may reveal authors stuffing
  pet-toxic cautions into a wrap-up paragraph rather than
  body-step prose.

These don't need to be solved before the pilot — they're things
to watch for in the first 5-10 authored entries.
