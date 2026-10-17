---
name: project_loom_engine_build_state
description: "The loom's render pipeline in short (embroidery thread strokes, the Blender base, the locked Fal finish and the fidelity gate) and the hard lessons from building it. Rewritten 17 October 2026."
metadata:
  type: project
---

# Loom render pipeline (rewritten 17 October 2026)

The June embroidery build log is in git history. What stands today:

## The pipeline
- Follow `apps/web/src/lib/loom/RENDER_PROCESS.md` exactly: get the pattern into our format first, validate the line art against the original, then render.
- One entrypoint: `renderHero` in `apps/web/scripts/loom-render-hero.ts`. Exact stitches, then a Blender base render (local, or Fargate with `LOOM_RENDER=fargate`), then the locked Fal creative upscale, then the fidelity gate (`apps/web/scripts/loom-fidelity-gate.ts`), then R2.
- If the finish drifts, it retries at lower creativity, then ships the base render. It never ships drift ([Hero must be the exact pattern](../feedback_hero_must_be_exact_pattern.md)).
- Pieces: `apps/web/src/lib/loom/core/` (vector, noise, colour), `render/` (`renderPattern.ts`, `blenderScene.ts`, `thread.ts`, `fabric.ts`, `framebuffer.ts`), `stitches/` (the embroidery stitch library), `trace/`.
- Crochet uses the same chain through `programScene.ts` and `loom_render_crochet.py` ([Loom: stitch engine](project_loom_stitch_engine.md)).

## Hard lessons
- A vector pattern PDF: extract its paths. Never rasterise, trace and classify it.
- Never drop a whole colour family as "labels". Look at the diagram and the render and check every element type is there.
- Our own patterns carry stitch and colour as data, so none of the PDF recovery problems apply to them.
- Raking light with real contact shadows reads as 3D; high ambient light flattens it.
- Any loom script that imports `dotenv` must be in the `apps/web/tsconfig.json` exclude, or the deploy typecheck breaks.

## Open
- A tapestry branch (`claude/crochet-tapestry-fix`, not in the train yet) stops the AI finish on per-stitch colour charts. Check the tracker before relying on it.
