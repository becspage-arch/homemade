# Autopilot relevance gate — per-batch workflow

The autopilot has historically attached hero images post-publish via
[fixup-hero-fill.ts](../packages/db/scripts/fixup-hero-fill.ts) without
any subject-relevance check. Rebecca's 2026-05-25 homepage audit found
that 9 of 10 hero images on the popular rails showed a different subject
from their tutorial. The
[sample audit](image-relevance-audit-2026-05-25-sample.md) confirmed
the broader corpus: 45% WRONG, 30% PARTIAL, 25% EXACT.

This doc captures the new per-batch sequence autopilot worker sessions
should follow. The infrastructure to support it is already in place
([relevance.ts](../apps/web/src/lib/image-sourcing/relevance.ts) +
[score-relevance-batch.ts](../packages/db/scripts/score-relevance-batch.ts) +
[apply-relevance-verdicts.ts](../packages/db/scripts/apply-relevance-verdicts.ts)).

## The principle

By the time a tutorial appears on a public rail, its hero image has been
strict-subject-matched to the title. WRONG candidates have either been
re-sourced via the orchestrator (excluding the rejected source) or
fallen to a procedural card. UNVERIFIED + REJECTED heroes never reach
the homepage rails.

This is a *gate before live*, not a *gate before DB write*. The Media
row may exist as UNVERIFIED briefly during the gate sequence; the
sequence runs entirely before any public-rail surface re-renders.

## The sequence

For each per-batch autopilot run that publishes ≥ 1 tutorial:

1. **Drafts publish as usual.** Existing `upload-tutorial.ts --status
   PUBLISHED` flow. Heroes are *not* attached at this point — the per-
   tutorial author writes the body, the publisher flips status, and the
   tutorial lands live with `heroImageStrategy = UNSET` and
   `heroMediaId = null`. The public renderer falls back to the
   procedural card automatically (see [tutorial-hero.ts](../apps/web/src/lib/tutorial-hero.ts)).

2. **Hero fill + relevance enqueue (one step).** Run
   `pnpm --filter @homemade/db exec tsx scripts/fixup-hero-fill.ts \
      --category {SLUG} \
      --emit-relevance-queue docs/image-relevance-queue-batch-{N}.json`.
   The `--emit-relevance-queue` flag (added 2026-05-25) tells the script
   to write a relevance manifest alongside the run — one entry per newly
   attached hero, with the just-downloaded image bytes cached locally so
   the worker doesn't fetch them again. Saves the separate
   score-relevance-batch.ts step entirely on this first cycle.

3. **(Subsequent cycles only) Relevance enqueue.** If after step 5 there
   are still UNVERIFIED Media rows (re-sourced replacements need scoring
   too), run
   `pnpm --filter @homemade/db exec tsx scripts/score-relevance-batch.ts \
      --unverified-only --batch-size 1000 \
      --queue docs/image-relevance-queue-batch-{N}.json`.
   The `--unverified-only` flag (added 2026-05-25) restricts to Media
   rows whose verification is still UNVERIFIED, i.e. the rows
   fixup-hero-fill just attached. Output is one queue manifest per batch.

4. **Worker scores.** Worker session reads each `imagePath` in the
   manifest with its Read tool (multimodal), applies the rubric in
   `entry.promptHints`, emits a three-line verdict per image. Writes a
   verdicts JSON file at
   `docs/image-relevance-verdicts-batch-{N}.json` with shape:
   `{ "verdicts": [ { mediaId, tier, reason, confidence } ] }`.

5. **Apply verdicts.** Run
   `pnpm --filter @homemade/db exec tsx scripts/apply-relevance-verdicts.ts \
      --verdicts docs/image-relevance-verdicts-batch-{N}.json`.
   This:
   - EXACT → stamps `verificationStatus = VERIFIED` + `verifiedAt`
   - PARTIAL → stamps `verifiedAt` + reason annotation, leaves status
     alone (PARTIAL is accepted as "good enough for live" by the
     [autopilot rule](#partial-acceptance-rationale) below; flag for
     Rebecca review via [the lenient-disagreements report](image-relevance-audit-2026-05-25-sample.md#lenient-rubric-disagreements))
   - WRONG → stamps `REJECTED`, appends source to
     `Tutorial.excludedImageSources`, calls
     `sourceHeroImage({ excludeSources })` for a replacement. Replacement
     attached as UNVERIFIED. After 3 distinct real-photo rejections,
     orchestrator caps to Flux (or with `--no-ai-fallback`, procedural).

6. **Loop if any new UNVERIFIED.** Step 5 produces UNVERIFIED rows for
   every re-sourced replacement. Re-run steps 3 → 5 until the
   `--unverified-only` queue at step 3 has zero entries.

7. **Audit-log summary.** `apply-relevance-verdicts.ts` writes a per-run
   summary at `docs/image-relevance-apply-YYYY-MM-DD.json` with counts
   for EXACT / PARTIAL / wrongRegenerated / wrongRegenFailed /
   cappedToProcedural. This is the per-batch log the autopilot reports
   in its hand-off summary.

## PARTIAL → re-source (Rebecca's "100% correct" rule)

Per Rebecca's 2026-05-25 instruction, PARTIAL is *not* good enough — only
EXACT is acceptable for live tutorials. `apply-relevance-verdicts.ts`
treats PARTIAL the same as WRONG: stamps REJECTED, appends source to
`Tutorial.excludedImageSources`, calls the orchestrator excluding the
rejected source. After 3 distinct real-photo rejections the orchestrator
falls to Flux Schnell.

## Flux billing — automatic notification + auto-backfill

fal.ai (Flux Schnell) is a paid API. When the balance is exhausted,
fal.ai returns `HTTP 403 { "detail": "User is locked. Reason: Exhausted balance." }`.
The Flux client recognises this and throws `FluxBillingError`.

### What happens automatically when billing fails

The bulk-Flux scripts (`fixup-hero-fill`, `apply-relevance-verdicts`)
do three things on the first billing error of a run:

1. **Create a SYSTEM Notification** for `rebecca@homemade.education` —
   the existing `Notification` pipeline fires a push to her mobile and
   surfaces a banner in `/admin`. No checking files required. The
   notification body includes the current backlog (`PUBLISHED` tutorials
   with no hero) and an estimated top-up cost (£0.0024 × 30 % of backlog)
   to clear the remaining work.
2. **Write a halt-signal file** at `docs/_flux-billing-halt.md` with the
   full HTTP response, backlog count, and estimated top-up. (Belt-and-
   braces for anyone watching the filesystem.)
3. **Continue the run in skip-Flux mode.** The script does NOT exit.
   For the remaining tutorials in this batch:
   - Free sources (Unsplash / Pexels / Wikimedia) still run normally.
   - Tutorials that would have needed Flux fall to `outcome='failed'`
     and stay with `heroMediaId = null` — they are NOT stamped
     `PROCEDURAL_CARD`. The renderer shows the temporary procedural
     fallback for those entries until the next batch picks them up.

`rescue-procedural-via-flux.ts` is the exception: every entry there
needs Flux, so it does exit on billing failure (still creates the
notification first).

### Auto-backfill on next batch

Because skipped tutorials stay as `heroImageStrategy = UNSET` +
`heroMediaId = null`, the next `fixup-hero-fill` run picks them up
automatically — `fixup-hero-fill.ts` already queries on those exact
conditions. The autopilot's per-batch finalize step calls
`fixup-hero-fill` at the end of every publish batch, so as soon as
balance is healthy the backlog drains over the next 1-2 batches.

### Cost guide

| Action | Estimated Flux calls | Estimated £ |
|---|---:|---:|
| Per new tutorial via autopilot | ~0.3 | ~£0.001 |
| Per 1,000 new tutorials | ~300 | ~£0.72 |
| Per 5,000 new tutorials | ~1,500 | ~£3.60 |
| Worst case (every new tutorial needs Flux) | 1.0 per tutorial | £0.0024 per tutorial |

The 30 % rate is what the 2026-05-25 audit observed after Pixabay was
dropped from the orchestrator. £10 of credit covers ~4,000 new tutorials
at the typical 30 % rate. A £5 top-up is plenty for routine autopilot
batches.

### Manual balance check

To check whether fal.ai is responsive without running a bulk job:

```bash
pnpm --filter @homemade/db exec tsx scripts/check-fal-balance.ts
```

Exit codes: 0 = healthy, 2 = `BILLING_LOCKED`, 1 = transient / unknown.

## Threshold guidance for autopilot batches

A per-batch sanity check inside the autopilot worker:
- If a single batch's WRONG rate (from the apply summary) > 60% of its
  scored set, **PAUSE the autopilot** and report. That's the same rule
  this session applies to the corpus audit and signals either an
  orchestrator misconfiguration, a source outage, or category content
  that doesn't yet have viable free imagery.
- If the *cumulative-since-last-pause* WRONG rate trends above 50%,
  same rule — pause and report.

## Caveat: pre-relevance heroes

The PUBLISHED corpus today contains ~2,272 heroes attached *before* this
gate existed. They sit as UNVERIFIED with no relevance verdict. The
[recommendation doc](image-relevance-audit-2026-05-25-recommendation.md)
covers Rebecca's strategic options for cleaning them up; that work is
separate from the per-batch gate documented here.

## Future improvement: pre-attach gate

The cleanest implementation gates BEFORE the Media row is created. A
follow-on session could refactor `fixup-hero-fill.ts` into two scripts:

- `stage-hero-candidates.ts` — for each tutorial, source top candidates
  from every source in the priority chain, download each to cache,
  write a candidates manifest. Don't create Media rows.
- `attach-chosen-hero.ts` — read worker verdicts on each candidate, pick
  the best EXACT (or PARTIAL if no EXACT), create the Media row, attach
  to the tutorial. Fall to procedural if all candidates WRONG.

That refactor was deemed out of scope for the 2026-05-25 work; the
post-attach loop described above achieves the same outcome with the
existing tooling.
