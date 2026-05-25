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

2. **Hero fill.** Run
   `pnpm --filter @homemade/db exec tsx scripts/fixup-hero-fill.ts`
   for the newly-published categor(ies). Sources via the orchestrator;
   attaches the first quality-passing candidate as UNVERIFIED. The
   batch ends with N tutorials whose `Media.verificationStatus =
   UNVERIFIED`.

3. **Relevance enqueue.** Run
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

## PARTIAL acceptance rationale

PARTIAL means "right class, wrong specific subject" — a generic stew for
a regional stew, a thyme sprig for a thyme-syrup tutorial, a hen for a
specific-hen-disease tutorial. The image still depicts something
recognisably related to the tutorial; it isn't actively misleading.

The autopilot keeps PARTIAL because:
- Free-source catalogues often have no closer match. A thyme-cough-syrup
  with a thyme sprig hero is better than a procedural card.
- The lenient-disagreements section of the audit doc surfaces these for
  Rebecca's manual review; she can flip individual entries to procedural
  or hand-source replacements.

If Rebecca later wants the autopilot stricter, the single change is to
flip `verdictToVerify(verdict)` in
[relevance.ts](../apps/web/src/lib/image-sourcing/relevance.ts) so
PARTIAL maps to `rejected` instead of `verified`. The orchestrator and
apply-script behaviour then forces PARTIAL through the same re-source
cycle as WRONG.

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
