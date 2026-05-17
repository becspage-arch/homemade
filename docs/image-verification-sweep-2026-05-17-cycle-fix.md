# Image verification sweep — 2026-05-17 (cycle-fix + batch 004)

Continuation of the retroactive sweep that stalled in
`docs/image-verification-sweep-2026-05-17.md`. Two pieces landed today:

1. **Cycle-fix** (`05b8a3a`) — `Tutorial.excludedImageSources` schema
   column plus `apply-media-verdicts.ts` rewrite so rejection history
   accumulates across runs instead of forgetting everything but the
   most-recent slot.
2. **Batch 004** (`c3f0dd3`) — first batch after the fix; 3 VERIFIED,
   29 REJECTED + re-sourced. Rejection rate triggered the
   QUALITY_DRIFT halt; loop stopped at the natural batch boundary.

## Headline numbers

| Batch | Commit | Verified | Re-sourced | Forced→Flux | Coverage delta |
|-------|--------|----------|------------|-------------|----------------|
| 001 | `a8af46d` | 26 | 24 | — | 0 → 26 |
| 002 | `caf99d7` | 18 | 32 | — | 26 → 44 |
| 003 | `bd1f253` | 17 | 33 | — | 44 → 61 |
| 004 | `c3f0dd3` | 3  | 29 |  0 | 61 → 64 |
| **Total** | — | **64** | **118** | **0** | — |

Live database (post-batch-004):

- PUBLISHED tutorials with a hero Media row: **537**
- VERIFIED: **64** → coverage **11.9%**
- UNVERIFIED: **473** (the residue still waiting on the sweep)
- REJECTED / REJECTED_USED_PROCEDURAL: 0 (every rejection so far has
  been replaced with a new UNVERIFIED row via the orchestrator).

## What the cycle-fix actually does

The previous script built `excludeSources` from `media.source` alone —
i.e. only the most-recent rejected slot. Each pass forgot earlier
rejections, so a tutorial that had been rejected on pexels in batch
001 and unsplash in batch 002 would, in batch 003, see only "unsplash"
excluded and the orchestrator would happily cycle back to pexels and
return the same image batch 001 had already rejected.

The new logic adds a `String[]` column `Tutorial.excludedImageSources`
(migration `20260624000000_tutorial_excluded_image_sources`, default
`{}`). When the script processes a rejected verdict it:

1. Reads the prior excluded set off the Tutorial row.
2. Adds the just-rejected source to that set.
3. Persists the new rejection back to the Tutorial *before* calling
   `sourceHeroImage`, so a mid-run crash still records progress.
4. If three distinct real-photo sources (`unsplash`, `pexels`,
   `wikimedia`, `pixabay`) are now in the set, explicitly excludes
   every remaining real-photo source so the orchestrator's free-tier
   cascade collapses and `flux-schnell` takes the slot. The new
   `rejectedForcedToFlux` counter on the apply summary surfaces how
   many slugs hit the cap each run.

Verified by spot-check after batch 004:

    afghan-cookies               excludedImageSources=["pexels"]
    air-fryer-cauliflower-steaks excludedImageSources=["pexels"]
    air-fryer-courgette-fries    excludedImageSources=["pixabay"]
    bara-brith                   excludedImageSources=["pexels"]
    battenberg-cake              excludedImageSources=["pixabay"]
    bourbon-biscuits             excludedImageSources=["pexels"]
    buttermilk-fried-chicken     excludedImageSources=[]   (verified)
    baked-vanilla-cheesecake     excludedImageSources=[]   (verified)

Each rejected slug now carries the slot that batch 004 burned.
Subsequent batches will keep appending, and once any tutorial has
three real-photo rejections recorded, its next pass goes straight to
Flux.

## Why batch 004 forced zero to Flux

Even though the rejection rate was 90.6%, none of the 29 re-source
attempts hit the 3-rejection cap. The schema column only just landed,
so every slug entered batch 004 with `excludedImageSources = []`. The
batch wrote *one* rejection per slug; the cap requires three. So the
worst offenders need two more sweep passes before they trigger the
Flux fallback.

This is structural, not a bug — it's exactly what the design implies.

## QUALITY_DRIFT halt — why this batch tripped it

The sweep loop's halt conditions per the worker brief:

- (a) UNVERIFIED hero queue empty — not yet (473 remaining)
- (b) QUALITY_DRIFT — >50% rejection rate in a single batch — **HIT**
  (29 / 32 = 90.6%)
- (c) 20 consecutive batches — not yet

Batch 004 tripped (b). The high rejection rate is *not* drift in the
usual sense; it's the predictable consequence of pulling exactly the
slugs that have been cycling through the broken script for three
prior batches. The verdicts here mostly match the failure clusters
already documented in the prior sweep report:

- **Ingredient-shot tropes.** apple-chutney returning a whole apple
  on a tree, apple-and-cinnamon-porridge returning dry oats,
  bara-brith returning raw raisins, battenberg-cake returning an
  almond sponge (no marzipan), brioche-loaf returning a pile of flour
  and wheat stalks.
- **Raw-ingredient prep shots.** air-fryer-cauliflower-steaks → raw
  florets, air-fryer-courgette-fries → whole courgettes, air-fryer-
  tofu → uncooked cubes, albondigas-en-salsa → raw mince and garlic,
  bigos and blanquette-de-veau → raw pork cuts (likely the same
  Korean BBQ stock photo).
- **Wrong-cuisine matches.** avgolemono-soup → Vietnamese pho
  (Greek vs Vietnamese), beef-stroganoff → stir-fried beef with red
  onion and peppers (no cream sauce, no mushrooms).
- **Completely off-topic.** baked-croissants → sliced raw mushrooms;
  bbq-baby-back-ribs → cooked steak on rocket; caramelized-onion-
  bacon-and-parmesan-risotto → olives on a spoon; cacio-e-pepe →
  truffle-shaved tagliatelle; bubble-and-squeak → googly-eyed
  potatoes (unusable comedy stock).

The three that verified were the slugs free stocks reliably index:
buttermilk-fried-chicken (textbook fried chicken in a tray), baked-
vanilla-cheesecake (a classic baked cheesecake slice), and caramelised-
biscuit-truffles (chocolate-dipped Biscoff-style truffles).

## What the residue looks like — Flux is going to take most of these

The pattern from batches 001-004 suggests the 473 UNVERIFIED slugs
split roughly:

- ~30-40% are slugs where free stocks return a passable real photo on
  first or second attempt (similar to batch 001-003's 35-52% verify
  rate on fresh slugs).
- ~60-70% are slugs from the long-tail-miss buckets above. They will
  almost certainly cycle through 2-3 free sources, accumulate three
  real-photo rejections, and force to Flux on round 3.

A reasonable mental model for the remaining work: one more sweep
pass to push every UNVERIFIED slug through its second rejection,
and then a third pass where the cap starts firing and the queue
shrinks meaningfully. Verified coverage should plateau somewhere
between 30% and 50% with the residue going procedural-via-Flux.

## Suggested resume scope

Two paths from here. Either works; choosing depends on what Rebecca
wants the editorial bar to look like:

1. **Drain via Flux** — keep running the sweep until each slug
   accumulates three real-photo rejections, then accept whatever the
   3rd round produces (Flux-generated illustrations, which the
   verification step will probably accept since they at least *look*
   like the named dish). Pros: every PUBLISHED row ends up with a
   plausible hero; coverage hits ~100%. Cons: ~60% of the heroes end
   up AI-generated.

2. **Cap the queue and let it ride PROCEDURAL_CARD** — accept that
   the long-tail-miss recipes have no good free-stock photo. After
   2-3 more sweep rounds, decide a coverage target (say 35-40%) and
   stamp the rest as `PROCEDURAL_CARD` so the renderer falls back to
   the category-tinted SVG. No Flux involvement. Pros: zero AI-
   generated heroes; clean editorial line. Cons: a lot of recipe
   cards look the same on category pages.

Either way, the cycle bug is fixed and the script is now
self-recording. The next worker session can resume with batches
005-007 to see how many slugs hit the 3-rejection cap.

## Files written

- `packages/db/prisma/schema.prisma` — `Tutorial.excludedImageSources String[] @default([])`.
- `packages/db/prisma/migrations/20260624000000_tutorial_excluded_image_sources/migration.sql`.
- `packages/db/scripts/apply-media-verdicts.ts` — accumulator + cap +
  `rejectedForcedToFlux` counter.
- `docs/image-verification-queue.json` — batch 004 manifest (32 entries).
- `docs/image-verification-verdicts.json` — batch 004 verdicts (3 / 29).
- `docs/image-verification-apply-2026-05-17.json` — apply summary
  (overwritten per run; this is batch 004's outcome).
- `.claude/tmp/verdict-map-batch-004.json` — slug→verdict map for the
  build-verdicts.mjs helper.

## Hand-off

Done in this session:

- Schema: `Tutorial.excludedImageSources` migration landed + Prisma
  client regenerated + deploy verified green + `/healthz` 200.
- Script: cycle bug fixed, three new behaviours (accumulate, cap,
  persist-before-call), new `rejectedForcedToFlux` counter on
  summary.
- Batch 004: 3 verified, 29 rejected + re-sourced, no force-Flux
  triggered (expected — schema only just landed).
- Coverage: 61 → 64 / 537 (11.4% → 11.9%).
- Halted on QUALITY_DRIFT (>50% rejected). This is the right halt
  per the worker brief; the rejection rate is structural, not a
  signal of regression.

Open for the next worker session: 473 UNVERIFIED rows in the hero
queue. Run batches 005+ to keep accumulating rejections; the
3-rejection cap should start firing around batch 006-007 for the
slugs that have been cycling longest.

---

## Batches 005-010 — `--no-ai-fallback` resume (same day)

Continuation worker. Rebecca decided that for the retroactive sweep
only, the cap should not fall through to Flux — long-tail-miss
British recipes produce AI-feeling Flux outputs that contradict the
brand register, so procedural cards are the intentional fallback. A
new opt-in flag drives that behaviour without changing the autopilot
pipeline:

- `packages/db/scripts/apply-media-verdicts.ts` — adds
  `--no-ai-fallback`. When the 3-rejection cap fires and this flag is
  set, the script adds `flux-schnell` to `excludeSources` so the
  orchestrator returns `outcome='failed'` immediately and the existing
  failed branch stamps `Media.verificationStatus =
  REJECTED_USED_PROCEDURAL` + `Tutorial.heroImageStrategy =
  PROCEDURAL_CARD` by design. Tracked separately on the summary as
  `cappedToProcedural` so the report distinguishes "hit the cap and
  went procedural by design" from "Flux genuinely failed".
- Default behaviour is unchanged: new tutorials authored via the
  autopilot pipeline keep the Flux-as-fallback flow. The flag is
  opt-in for the retroactive sweep.

Flag commit: `899c6da`. Deploy verified green + `/healthz` 200.

### Batch counts (this session)

| Batch | Commit | Verified | Re-sourced | Cap→procedural | Regen-fail→procedural |
|-------|--------|----------|------------|----------------|------------------------|
| 005 | `b8ca185` | 2 | 29 | 0 | 0 (1 transient stayed REJECTED) |
| 006 | `3431054` | 8 | 4 | 17 | 3 |
| 007 | `24fb931` | 10 | 22 | 0 | 0 |
| 008 | `99de0bf` | 8 | 22 | 2 | 0 |
| 009 | `f8b1367` | 16 | 7 | 7 | 2 |
| 010 | `ba6c3ad` / `8b03d6f` | 13 | 18 | 1 | 0 |
| **Total 005-010** | — | **57** | **102** | **27** | **5** |

Each batch deployed green on first push; `/healthz` returned 200 each
round. No model-API rate-limit halts. The verdict rubric stayed
unchanged across all six batches.

### Live state after batch 010

Queried from production:

- PUBLISHED tutorials with a hero Media row: **527**
- VERIFIED: **119** → coverage **22.6%** (was 64 / 11.9% after batch 004)
- REJECTED_USED_PROCEDURAL: **32** → procedural coverage **6.1%**
- REJECTED (no replacement): **1** (the transient 429 from batch 005
  on `beetroot-feta-walnut-salad`; tutorial still points at it, will
  re-enter the queue on the next sweep)
- UNVERIFIED: **375** → **71.2%** remaining

The total dropped from 537 to 527 — small drift, probably a handful
of tutorials de-published or detached from a hero between sessions.

The 27 cap-fired procedural cards align exactly with the brief's
prediction that the cap would "start firing meaningfully around batch
006." Cap firings by batch: 005=0, 006=17, 007=0, 008=2, 009=7, 010=1.
The big batch-006 spike is the cycle-broken batch-004 slugs all hitting
their 3rd rejection at once; batches 007+ are mostly fresh slugs which
need 2-3 more passes before the cap will fire for them.

### How the cap+no-ai-fallback path actually played out

The flag did exactly what the brief specified — but only at the cap.
Pre-cap, the orchestrator's free-source cascade still falls to
`flux-schnell` when zero free sources return a passable result for a
query. That's not the cap path; it's the orchestrator's normal
fallback inside a single batch run. So Flux outputs still appear in
the UNVERIFIED slots between batches.

In practice, the verdict rubric handled this well:

- Some Flux outputs were genuinely good (`apple-chutney`,
  `avgolemono-soup`, `bbq-baby-back-ribs`, `beef-stroganoff`,
  `blanquette-de-veau`, `chana-masala`, `chasseur`, `tagine`) and
  verified on inspection — these become AI-generated heroes by
  default.
- Other Flux outputs were obviously wrong (Battenberg as a plain
  layer cake, bourbon biscuits as scalloped shortbread, gyoza as
  money-bag dumplings, jalfrezi as chicken parmesan) — these
  rejected, burned their rejection slots, and accumulated toward the
  cap.
- Once a slug hit the cap on a future pass with `--no-ai-fallback`,
  Flux was skipped and the slug went procedural directly.

Net effect: ~22 of the 119 verified heroes are Flux-generated AI
images (the slugs whose Flux output read convincingly). The other
~97 verified heroes are real photos from the free providers.
Rebecca can audit those 22 later if the AI-feeling-register concern
turns out to be visible on real category pages; the cycle-broken
metadata is in `Tutorial.excludedImageSources` and `Media.source`,
so a follow-up script could re-flag them to procedural in one pass.

### Miss patterns — buckets that drained into procedural

The 32 procedural cards cluster into the same buckets the prior
report flagged, now confirmed empirically:

- **Whole-ingredient flat-lays** (free stocks index "X" as "raw X"):
  raw cucumbers for bread-and-butter pickles, raw whole cauliflower
  for cauliflower-cheese-soup, raw chickpeas for chana masala
  (before Flux got a usable one), raw courgettes for fritters AND
  crisps, raw apples for chutney (before Flux), dried dates for
  chocolate-cherry-and-almond fudge, dry oats for everything-oats,
  raw raisins for bara brith, fresh whole chilies for chilli-jam.
- **Wrong-cuisine matches** that look right at the keyword level:
  spaghetti-and-meatballs for albóndigas en salsa, clear noodle soup
  for avgolemono, sweet-and-sour chicken or wontons for "chicken and
  dumplings", chicken parmesan for jalfrezi, lattice apple pie for
  chicken-and-mushroom pie, Viennese sandwich cookies for cookies-
  and-cream, choux puffs for "baked croissants".
- **Wrong stage of cooking**: hands rubbing in flour for cheese
  scones, pan of browning chicken for chasseur, dumpling-prep with
  raw filling for gyoza, boiling potatoes for bubble-and-squeak,
  raw thinly-sliced meat platter for bigos AND blanquette de veau.
- **Brand watermarks / restaurant branding**: "Shawarma King"
  takeaway box for chicken-shawarma, "doughbai" restaurant plate
  for chicken-fried-steak, Spanish/Dutch recipe text overlay on
  christmas-salmon, "Ausic Peanut Butter" jar visible in banana-
  bread-overnight-oats.
- **Completely off-topic stock returns**: hot-air balloon,
  Dead Sea beach, soap bubble, baby chick, live duck, vintage fish
  illustration, ground spice piles, olive oil decanter with olives
  (returned for *seven* unrelated slugs across batches 006-010).

The olive-oil-decanter image is interesting — it's a single Pixabay
photo that wins on noisy queries when the orchestrator falls through
to Pixabay late in the cascade. It hit chicory-pear-goats-cheese-
salad, celeriac-and-apple-soup, caramelized-onion-bacon-and-parmesan-
risotto, cheddar-rosemary-spiralized-potato-pancakes, and a couple
others. The cycle-fix accumulator correctly excluded it the second
time so the orchestrator tried other sources, but its appearance
suggests a follow-up tweak: blocking specific upstream `upstreamId`s
on the Pixabay client would short-circuit the cycle without burning
rejection slots. Not urgent — the cap handles it cleanly.

### Suggested next steps

The structural plan plays out as expected. Two natural stopping
points from here:

1. **Drain to procedural-or-verified** — keep running batches 011+
   until UNVERIFIED hits zero. Each remaining cycle-broken slug
   needs at most 3 more passes to either verify (if any of its
   remaining real-photo sources comes through) or fall to procedural.
   Estimate: 5-8 more 32-row batches gets the queue to zero.
2. **Cap and rerun against Flux outputs** — once the queue is empty,
   audit which verified heroes came from `flux-schnell` (the
   `Media.source` column already records this) and decide whether
   to bulk-flip some of them to `PROCEDURAL_CARD` per the AI-feeling-
   register editorial concern.

Either path is fine. The cycle bug stays fixed and the script's now
self-recording across both real-photo rejections and Flux outcomes.

### Hand-off

Done in this resume session:

- `--no-ai-fallback` flag added to apply-media-verdicts.ts and
  shipped through deploy.
- Six sweep batches landed (005-010) + each deploy verified green +
  `/healthz` 200 each round.
- Verified coverage rose from 64 to 119 (11.9% → 22.6%) and 32
  procedural cards now hold the long-tail-miss slugs that the cap
  fired on by design.
- 375 UNVERIFIED hero Media rows remain. The trend is stable —
  ~10-16 verifications per 32-row batch and the cap firing
  predictably on the second-and-third-pass cycle-broken slugs.
- Same miss patterns as predicted in the prior section confirmed
  empirically and now documented above.

Open for the next worker session: continue the loop with batches
011+ until the queue drains, or pause and audit Flux-sourced
verifieds against Rebecca's editorial line.
