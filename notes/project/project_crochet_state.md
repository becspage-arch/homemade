---
name: project_crochet_state
description: "Where crochet stands (17 October 2026): the live tracker, the bar, who does what, when credits are spent, the train, and the engine modules on the train branch."
metadata:
  type: project
---

# Crochet: where it stands (17 October 2026)

Replaces the June and July crochet and loom logs. Their old text is in git history.

## Read first
1. `/mnt/project-files/homemade/crochet-bar/TRACKER.md` (shared project folder, not the repo). It is the live list of jobs, branches and the next steps. Only the orchestrator edits it.
2. `QUALITY-BAR.md` in the same folder, and [Crochet quality bar](../feedback_crochet_quality_bar.md).
3. The job log for your job: `crochet-bar/jobs/<job>.md`. Workers edit only their own log.
4. The handbook `apps/web/src/lib/loom/crochet/STITCH_ENGINE.md` and the `loom-stitch` skill.

## The bar
- Only Bec's five `bar-*.png` photos (cow, bunny, fairy doll, flower wall hanging, spiral trees). They live in the shared folder and never go in the repo.
- `real/` and `research-top-patterns.md` are average designers. Use them to learn how a part is made, never as the pass test.
- Each round: render, put beside the bar photo at the same size, write what is wrong in the job log, fix. A Claude pass is a draft until Bec signs off.

## Who does what (Bec, 17 October)
- Opus builds tools on pass/fail rails: audits, tests, merges, switches that default to off and change no hash or pixel when off. No fine-tuning by eye.
- Fable fine-tunes by eye against the bar, and does new engine construction (for example soft squash). Up to six rounds a job, then stop and log the blocker.

## When credits are spent
- Homemade runs only at the end of each week, on leftover credits. Never auto-start at a new week.
- When a limit hits, commit and push WIP first, then stop. Nothing restarts until Bec says.

## The train
- `claude/crochet-train-1009` is the train: main plus every finished crochet branch. Every crochet branch starts from it.
- Workers push their own branch, never merge to main, no PRs. The orchestrator merges finished branches into the train and pushes it.
- Merging the train to main is held for Bec, with one deploy verification (`CLAUDE.md`). Docs and notes ride it.
- Renders use the Fargate probe task def and their own S3 `jobs/<job>-<n>/` prefix. Never touch the production task def, service or image.
- Before merging a branch that moves amigurumi presets, regenerate the size table (`apps/web/scripts/loom-preset-sizes.ts`) and run `amigurumi-presets.test.ts`.

## Engine modules (`apps/web/src/lib/loom/crochet/engine/`, on the train)
- Core: `yarnPath.ts` (one continuous strand), `relax.ts`, `dictionary.ts` (stitch definitions, the single source), `auditChecks.ts`, `buildSwatch.ts`, `shaping.ts` (increases, decreases, rounds), `knitPath.ts`.
- Pattern layer: `program.ts` (one program gives geometry, written rounds and chart), `programScene.ts` (geometry to Blender scene, geometry hash), `composition.ts` and `compositionPattern.ts` (multi-part amigurumi and its words).
- Shapes: `roundProfiles.ts`, `sphereProfile.ts`, `tube.ts`, `tubeStaging.ts`, `drape.ts` (cloth sim for soft pieces), `spiralTree.ts`, `spiralHanging.ts`.
- Toys: `amigurumiPresets.ts` with the generated `amigurumiSizes.generated.ts`, `cowPreset.ts`, `doll.ts`, `dollHair.ts`, `dollDressing.ts`, `faceEmbroidery.ts`, `loopStitch.ts`, `hairPatch.ts`, `hatAccessory.ts`, `pompom.ts`.
- Flat motifs: `motifs/` (`kit.ts` with chain spaces, `registry.ts`, `motifScene.ts`, and the motifs: star, heart, leaf, leaf-vine, butterfly, berry, daisy, rolled rose, layered rose, garland). Opt-in, not registered: `motifs/cornered.ts` (granny square, solid square, solid hexagon in the round; handbook §8o). Also opt-in: `motifs/edging.ts` (picot, shell lace and chain-loop edgings in turned rows at the June starter counts; handbook §8p, job log `crochet-bar/jobs/edging.md`).
- Old, kept for history: `swatch.ts`, `scSwatch.ts`.
- Render side: `apps/web/src/lib/loom/render/blenderScene.ts` (stage variants picked by `stageSeed`), `apps/web/scripts/loom_render_crochet.py`.
- Bulk side: `apps/web/src/lib/studio/generation/bulk/crochet-*.ts` (planner, design to program, idea backlog, dedupe, cost, session contract) and `spend-guard.ts` (the $100 a month cap).

## Held for Bec
- The crochet autopilot (spends money; only after the toys pass).
- Go-live gates, then adding `crochet` to `LAUNCH_VISIBLE_CATEGORY_SLUGS`. Readiness report (17 Oct): `crochet-bar/GO-LIVE-READINESS.md` in the shared folder. Re-check any time, read-only: `pnpm --filter "@homemade/db" exec tsx scripts/crochet-golive-check.ts`. Tag backfill: `scripts/crochet-tag-backfill.ts` (dry run unless `--apply`). Biggest gap: no public crochet pattern page, so no pattern can reach the sitemap.
- The train to main.

## Decisions from June that still stand
- The loom is render-only. Crochet owns generation (brief to stitch program); the loom renders what it is handed.
- The program is the pattern's source of truth, so the words, the chart and the hero cannot drift.
- Never publish a pattern the engine cannot make; a dry shelf waits.
- Post stitches show on worn or curved pieces, not flat panels.
- The teaching library is already published; don't re-author it ([Crochet: anchor batch](project_crochet_anchor.md)).
