# Image relevance audit — recommendation

**Date:** 2026-05-25
**Sample:** 120 stratified images across 12 categories (out of 2,392 PUBLISHED real-photo + AI heroes)
**Audit doc:** [image-relevance-audit-2026-05-25-sample.md](image-relevance-audit-2026-05-25-sample.md)

## The headline

| Tier | Sample | Share |
|------|-------:|------:|
| EXACT | 30 | **25%** |
| PARTIAL | 36 | **30%** |
| WRONG | 54 | **45%** |

The 60% WRONG threshold for the strict sanity-check stop **was not
tripped** — but only 25% of hero images unambiguously show the named
subject of their tutorial. Three quarters of the audited corpus is either
adjacent (PARTIAL) or actively misleading (WRONG).

## The smoking gun: Pixabay

WRONG rate by source, across the same 120 samples:

| Source | Total scored | WRONG | WRONG% |
|--------|-------------:|------:|-------:|
| flux-schnell | 4 | 3 | 75% |
| wikimedia | 7 | 5 | 71% |
| **pixabay** | **40** | **26** | **65%** |
| pexels | 56 | 18 | 32% |
| unsplash | 13 | 2 | 15% |

Pixabay is both the **highest-volume source** in the published corpus
(1,195 of 2,392 heroes ≈ 50%) **and** the highest-WRONG rate of the
major sources. Two thirds of the Pixabay heroes audited showed a
different subject from their tutorial.

Pixabay's catalogue mixes commercial stock with low-quality contributions
and keyword-stuffed metadata. Their search returns photos that lexically
match the query rather than depict the named thing. That is exactly the
failure mode the calibration cases revealed: thyme on a bee, "bubble" as a
frozen ornament, pasta sheets for Yorkshire pudding.

Unsplash, by contrast, returns mostly editorial photography with curated
tagging — 15% WRONG on the audited sample. Pexels at 32% is middle of the
road. Wikimedia's small sample (7) makes its rate unreliable but the small
absolute volume keeps total damage low.

## Why I'm pausing before the bulk re-source

The prompt's Part 4 allows proceeding because the strict 60% threshold
isn't tripped. But re-sourcing under the current orchestrator priorities
would burn effort for limited gain:

- **The orchestrator still tries Pixabay** for almost every category. A
  re-source pass on 1,076 WRONG heroes that excludes only the rejected
  source will frequently land on a *different* Pixabay photo — which the
  data says has a 65% chance of being WRONG again.
- **The orchestrator's query building** is a stripped-down title plus
  optional first ingredient. It carries no semantic constraint — "Beef
  Wellington" is asked for verbatim and Pixabay returns "beef" photos.
  Re-sourcing without smarter queries won't fix that.
- **The 60% threshold's spirit**, even though its letter isn't met, is
  about whether mass re-sourcing makes sense. At 45% it's *barely*
  feasible — and at twice the WRONG rate of Unsplash, Pixabay would have
  to be deprioritised for the re-source to converge on something better.

This is a strategic call that belongs with Rebecca, not a worker session.

## Recommended next steps (in order)

1. **Reorder orchestrator priorities** in
   [apps/web/src/lib/image-sourcing/orchestrator.ts](../apps/web/src/lib/image-sourcing/orchestrator.ts)
   so Pixabay drops to last or is removed entirely. The current per-category
   chains either put it ahead of Wikimedia (cooking specialty, sustainability,
   home-repair, etc.) or before Flux Schnell (most chains). After reorder:
   - cooking + baking + sustainability + home-repair + natural-home →
     `[unsplash, pexels, wikimedia, flux-schnell]` (drop Pixabay)
   - craft chains → `[wikimedia, pexels, unsplash, flux-schnell]` (drop Pixabay)
   - mindset somatic → unchanged (Flux only)
2. **Audit a wider sample** (say 30 per category instead of 10) once the
   priority chain is fixed, to see if removing Pixabay alone moves the
   needle enough or whether the long tail of Wikimedia / Flux WRONG also
   needs query-construction work.
3. **Then bulk re-source the WRONG entries** via
   [apply-relevance-verdicts.ts](../packages/db/scripts/apply-relevance-verdicts.ts).
   The pipeline is built and ready — it consumes a verdicts JSON file and
   re-sources every WRONG entry through the (newly reordered) orchestrator,
   stamping replacements as UNVERIFIED for the next pass.
4. **Tighten orchestrator queries** as a longer-term improvement: noun-
   phrase extraction from the title (so "Yorkshire puddings" queries as
   "yorkshire pudding" + "british savoury batter" rather than just the
   title text). This is a bigger piece of work and out of scope for this
   recommendation.

## Alternative: accept procedural for the worst categories

If reordering doesn't help (a second-sample audit shows the WRONG rate
still > 50% after Pixabay drops out), the cheaper path is procedural
cards for the worst categories — particularly sustainability (80% WRONG),
fibre-arts (70%), pottery-ceramics (70%). Procedural cards bypass the
sourcing problem entirely. They already exist as a fallback in the
orchestrator's `outcome=failed` branch.

## What this session shipped

- **Relevance scorer module** at
  [apps/web/src/lib/image-sourcing/relevance.ts](../apps/web/src/lib/image-sourcing/relevance.ts) —
  three-tier verdict (EXACT / PARTIAL / WRONG), strict prompt, verdict
  parser, adapter to the orchestrator's existing `verify` callback.
- **Batch enqueue script** at
  [packages/db/scripts/score-relevance-batch.ts](../packages/db/scripts/score-relevance-batch.ts) —
  picks a batch of PUBLISHED heroes (filterable by category, source,
  verification status, with stratified sampling), downloads each to a
  cache, writes a queue manifest with prompt hints.
- **Verdict-apply script** at
  [packages/db/scripts/apply-relevance-verdicts.ts](../packages/db/scripts/apply-relevance-verdicts.ts) —
  consumes worker verdicts, stamps Media verification, re-sources WRONG
  via the orchestrator excluding the rejected source, mirrors the existing
  apply-media-verdicts cap behavior.
- **Audit doc generator** at
  [packages/db/scripts/generate-relevance-audit.ts](../packages/db/scripts/generate-relevance-audit.ts) —
  reads queue + verdicts, emits the per-category / per-source summary
  doc + machine-readable JSON.
- **Calibration record** at
  [image-relevance-calibration-2026-05-25.md](image-relevance-calibration-2026-05-25.md) —
  6/6 verdicts matched Rebecca's labels on the named test cases.
- **Sample audit doc** at
  [image-relevance-audit-2026-05-25-sample.md](image-relevance-audit-2026-05-25-sample.md) +
  the machine-readable [.json](image-relevance-audit-2026-05-25-sample.json).
- **Autopilot integration documentation** at
  [relevance-gate-autopilot.md](relevance-gate-autopilot.md) — how
  future autopilot worker sessions wire the relevance pass into the
  per-batch publish flow.

## What this session did NOT do

- **No bulk audit of the remaining 2,272 heroes** — sample data is
  sufficient to make the strategic call; auditing the rest before the
  orchestrator is fixed would just generate more data with the same
  shape.
- **No re-source of any WRONG entry** — every Media row is unchanged.
  Rebecca's call on orchestrator reorder gates that work.
- **No orchestrator priority changes** — the recommendation above is
  Rebecca's call to make.
- **No DRAFT-tutorial scoring** — explicitly out of scope per the
  worker prompt (DRAFT heroes are covered by the voice-and-UX session).
