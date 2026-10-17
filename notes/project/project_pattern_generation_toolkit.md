---
name: pattern-generation-toolkit
description: "Cross-stitch generation: where the code lives today, the rules it locks in, and the thumbnail and sub-category facts. Rewritten from the code 17 October 2026."
metadata:
  type: project
---

# Cross-stitch generation: code map (rewritten 17 October 2026)

Cross-stitch is signed off as complete (Bec, 9 October) and its cron stays off. This note maps the generation code for anyone fixing or reusing it. The June worker-tooling text is in git history. State and numbers: [Cross-stitch state](project_cross_stitch_state.md).

## Where the code is (`apps/web/src/lib/studio/generation/`)
- `spec.ts`: the `Spec` union and `buildFromSpec`. Tiers: scene, illustration, botanical, retro, celestial, sampler, typo, mixed, minimal.
- `quote-engine.ts`: the caption and quote builders (`buildIllustration`, `buildBotanical`, the flat styles, `stripCaption`). It moved here from `apps/web/scripts/`; it was not deleted.
- `sources.ts` (Flux schnell, `fluxIllustrationPro` for the dense tier, Met, Commons, Twemoji), `convert.ts` (`imageToChart`, `crispChart`), `procedural.ts`, `pattern-engine.ts`.
- `qc.ts` (structural and licence checks), `vision-gate.ts` (keep, repair or kill), `autopilot.ts` (`runSpecBatch`, saves UNLISTED for review).
- `samplers/`: the samplers "Make it yours" builders.
- `bulk/`: the cron pipeline. `cross-stitch.ts`, `planner.ts`, `candidates.ts` (the parking bay the judging routine reads), `quick-win.ts`, `showpiece.ts`, `dedupe-guard.ts`, `spend-guard.ts`, and the chart checks (`vividness.ts`, `bare-fabric.ts`, `outline.ts`, `french-knots.ts`).
- `categories.ts`: `CROSS_STITCH_SHELVES`, the canonical shelf list and targets.
- Guides beside the code: `NORTH_STAR.md`, `AI_DESIGN_SYSTEM.md`, `GATE_CHECKLIST.md`.
- Runners: the Inngest cron `apps/web/src/inngest/functions/bulk-generation.ts`, the judging prompt `docs/autopilot-prompts/cross-stitch.md`, and the JSON batch script `apps/web/scripts/xs-gen-from-json.ts`.

## Rules the code locks in
- The AI never draws the words. Text is a crisp overlay snapped to the palette.
- Text and flat art never go through the quantiser; they go through `crispChart`.
- A reserved caption band needs `preprocess: { trim: false }`, or the trim crops it off.
- Every pattern gets a sub-category on publish. The public grid (`pattern-layout.tsx`) filters on `subCategory.categoryId`, so a pattern without one never shows.

## Thumbnails (`apps/web/src/lib/studio/pattern-thumbnail.ts`)
- The card image is rendered once, stored in R2 and recorded on `Pattern.thumbnailMediaId`. Never write `heroMediaId`; that is the finished-piece photo slot.
- The on-demand thumbnail route redirects to the saved asset and saves one on first miss.

## Dense colour counts
- `apps/web/src/lib/studio/photo-to-pattern.ts` takes `maxColours` (lifts the 96 cap, clamped to the symbol count) and `flossRange: 'full'` (the full DMC range). The Studio default is unchanged.
- The limit on colour count is the source image, not the converter. Dense pieces use Flux 1.1 Pro, with no denoise.
