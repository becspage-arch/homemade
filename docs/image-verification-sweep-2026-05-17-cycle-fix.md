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
