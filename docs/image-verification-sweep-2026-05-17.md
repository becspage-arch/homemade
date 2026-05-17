# Image verification sweep — 2026-05-17

Retroactive sweep of UNVERIFIED hero Media rows shipped in `26bc629` (the
image-verification pipeline wire-up). Goal was to walk through the
~537-row backlog at 50 per batch, viewing each image via Claude Code's
multimodal Read tool and applying VERIFIED / REJECTED + re-source verdicts.

Three batches landed cleanly. Stopping here because of a structural
issue in the apply-verdicts logic (see "Stop reason" below).

## Headline numbers

| Batch | Commit | Verified | Re-sourced | Coverage delta |
|-------|--------|----------|------------|----------------|
| 001 | `a8af46d` | 26 | 24 | 0 → 26 |
| 002 | `caf99d7` | 18 | 32 | 26 → 44 |
| 003 | `bd1f253` | 17 | 33 | 44 → 61 |
| **Total** | — | **61** | **89** | — |

- 61 tutorial heroes stamped VERIFIED in production.
- 89 Media rows stamped REJECTED + a new UNVERIFIED Media row attached
  to each tutorial via the orchestrator's free-provider chain.
- 0 procedural fallbacks (Flux Schnell never invoked — see Stop reason).
- 0 deploy failures: all three batches went green on first push,
  `/healthz` returned 200 each round.

Remaining UNVERIFIED hero Media rows after batch 003: ~476 (out of an
original ~537). Coverage on `/admin/system/autopilot` should now read
roughly 11–12% (61 / 537).

## Stop reason — source-exclusion cycle

`apply-media-verdicts.ts` constructs `excludeSources` from
`media.source` only — the source of the single most-recent rejected
Media row. After a tutorial cycles through both `pexels` and `unsplash`
(the two providers indexed for most generic recipe search terms),
subsequent sweep rounds cycle back to the original rejected image.

What this looks like in practice for slugs like `afghan-cookies`:

1. Batch 001: source = `unsplash`, image = chocolate-chip cookies →
   REJECTED. Exclude `unsplash`. Re-source → got `pexels` image of a
   bakery display.
2. Batch 002: source = `pexels`, image = bakery display →
   REJECTED. Exclude `pexels`. Re-source → got `unsplash` image of
   chocolate-chip cookies (the original miss).
3. Batch 003: source = `unsplash`, image = chocolate-chip cookies →
   same image, same verdict, same cycle.

17 of the 32 batch-2-rejected slugs in batch 003 were byte-identical to
images batch 001 had already rejected.

The fix is in `packages/db/scripts/apply-media-verdicts.ts`:

- **Option A**: accumulate `excludeSources` across all prior rejections
  for the same tutorial (read `TutorialVersion` snapshots or maintain a
  rejection-history column on Media).
- **Option B**: cap attempts per tutorial — after N (say 3) free-source
  rejections, force `flux-schnell` directly so each stuck slug at least
  ends up as a procedural fallback rather than spinning forever.
- **Option C**: both — accumulate excludeSources AND cap at N attempts.

Option B is the simplest landing and aligns with the existing
"REJECTED_USED_PROCEDURAL" terminal state.

## Long-tail miss patterns

The 89 rejections cluster into a few recurring buckets — useful for
deciding whether option B (force-Flux fallback) is acceptable, since
these are the dishes that will end up as procedural cards if so:

- **Ingredient-shot tropes.** Free stocks index "apple chutney" → photo
  of whole apples, "bara brith" → photo of raw raisins, "banana cake" →
  bunch of bananas, "battenberg cake" → butter cubes on flour, "best
  ever brownies" → butter cubes on flour (twice), "cacio e pepe" → raw
  pasta shells. The free providers don't reliably distinguish ingredient
  flat-lays from finished dishes for these names.
- **Wrong-cuisine matches.** "Albondigas en salsa" → Italian spaghetti
  and meatballs (Spanish vs Italian). "Avgolemono soup" → Vietnamese pho
  bowl (Greek vs Vietnamese). "Beef goulash" first attempt → Chinese
  dark-braised beef (Hungarian vs Chinese).
- **Specific named dishes with weak stock coverage.** Battenberg,
  blanquette de veau, bourbon biscuits, brioche, bara brith, boeuf
  bourguignon (one attempt returned a French bistro window with the
  dish name painted on the glass — a literal text match).
- **Completely off-topic.** "Halloumi" → a hot-air balloon labelled
  "Halei" (text match on the brand). "French toast" → a handwritten
  manuscript page. "BBQ baby back ribs" → a photo of catering staff in
  Smokey's BBQ-branded shirts at what looks like a military mess hall.
- **Raw-ingredient prep shots.** "Air-fryer salmon" → raw salmon
  fillets, "air-fryer chicken thighs" → raw thighs on a board (batch 1
  only; batch 2's re-source produced a cooked dish that passed),
  "bbq ribs" → raw pork cuts, "beef wellington" → raw fillets next to
  sliced potatoes.

These categories suggest force-Flux fallback would be the right call —
the kinds of misses the free stocks return for these recipes are noisier
than even a mediocre AI illustration.

## Patterns that worked

Where free stocks coverage is dense and term-specific, the verifier
landed on a passing image quickly:

- Most cooked-pasta dishes (caesar salad, caprese, biscuits and gravy,
  cassoulet).
- Most named soups (butternut squash, broccoli and Stilton, carrot
  and coriander, borscht).
- Most baked goods with strong visual identity (cinnamon rolls,
  biscotti, brownies, pancakes, banana bread).
- Most simple plated proteins (beef wellington, beef goulash on second
  attempt, buffalo wings, burger patties).

Verify rate on **fresh slugs** (those first sourced through the
pipeline, not yet cycling): roughly 50-60% on first attempt. Verify
rate on **cycling slugs** (already rejected once): 25-30% per
subsequent attempt.

## Identical-image stock-photo issue

A few stock photos are being returned by Pexels / Unsplash / Pixabay
for several different search terms — meaning the same raw-courgettes
photo lands for `air-fryer-courgette-fries`, and the same raw-beef-on-
board photo lands for both `bigos` and `blanquette-de-veau`. The
orchestrator has no per-photo dedupe and treats each provider's reply
as fresh. If two adjacent tutorials in alphabetical order both fail on
the same stock photo, both end up cycling on it.

Not blocking — but worth a `media-dedupe` pass before each verify
attempt if/when the apply-script gets the cumulative-exclude fix.

## Files written

- `docs/image-verification-queue.json` (batch 003's manifest, last
  written).
- `docs/image-verification-verdicts.json` (batch 003's verdicts).
- `docs/image-verification-apply-2026-05-17.json` (cumulative apply
  report across all three batches that ran today — the script
  overwrites the file per run, so this is batch 003's outcome).
- `scripts/build-verdicts.mjs` (small helper that builds a verdicts
  JSON from a per-batch slug-→-verdict map; reusable for the next
  sweep round after the apply-script fix).

## Resume scope for the next sweep

After the `apply-media-verdicts.ts` source-exclusion fix lands (option
A or B above):

1. `pnpm --filter @homemade/db exec tsx scripts/verify-media-batch.ts --batch-size 50`
   to enqueue. The same 476-ish UNVERIFIED rows are waiting.
2. Author a per-batch verdicts map under `.claude/tmp/verdict-map-
   batch-004.json` and run `node scripts/build-verdicts.mjs
   docs/image-verification-queue.json .claude/tmp/verdict-map-batch-
   004.json` to emit `docs/image-verification-verdicts.json`.
3. `pnpm --filter @homemade/db exec tsx scripts/apply-media-verdicts.ts`
   to apply. With the fix, stubborn slugs should fall through to Flux
   Schnell on this round and exit the cycle.
4. Commit + push + verify deploy + healthz per `feedback_deploy_verification.md`.
5. Repeat until `verify-media-batch.ts` returns an empty manifest.

Context budget for the next worker session: this session viewed 150
images across 3 batches and stopped at a clean batch boundary. The next
worker can plan on ~3-5 batches before context pressure if running on
Sonnet per `feedback_model_choice.md`.
