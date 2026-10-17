---
name: project_loom_stitch_engine
description: "The yarn-level crochet and knit stitch engine in short: the handbook is canonical, the two hard rules, how a stitch is built and checked. Rewritten 17 October 2026."
metadata:
  type: project
---

# Loom stitch engine (rewritten 17 October 2026)

**The handbook is canonical:** `apps/web/src/lib/loom/crochet/STITCH_ENGINE.md` (per-stitch state, failure log, every round's numbers). Follow the `loom-stitch` skill (`.claude/skills/loom-stitch/SKILL.md`). This note is the short version; the July build logs are in git history.

## The idea
- One continuous strand, traced as a hook lays it, then relaxed (`relax.ts`). The interlock is the yarn passing under the loop below, held by self-collision at one yarn diameter.
- No pinned drawn shapes, no springs joining rows ([No faking stitch formation](../feedback_no_faking_stitch_formation.md)).
- `dictionary.ts` is the single source of truth for stitches and swatch recipes (gauge, reference URL, lock status).

## Building or checking a stitch
1. Get a real reference photo and look at it.
2. Build it as one strand. `apps/web/scripts/loom-stitch.ts <stitch>` runs build, numeric audit (hard gate), render and report.
3. Compare beside the reference ([Compare reference before win](../feedback_compare_reference_before_win.md)). Only Bec locks a stitch.
4. Two failed construction attempts in a row: stop and write it up.

## Locked and open
- Locked crochet stitches: ch, slst, sc, hdc, dc, tr, dtr, scblo, scflo, fpdc, bpdc, postrib. Locked knit: stockinette, knitrib.
- Garter, yo and cable are parked with write-ups in the handbook (§8d). Knitting as a whole is parked ([Knitting state](../project_knitting_state.md)).
- Geometry changes move hashes. The presets hash guard (`engine/amigurumi-presets.test.ts`) catches it; regenerate the size table on purpose, never by accident.

## Where the code is
The module list is in [Crochet state](project_crochet_state.md). Renders go through Blender (`apps/web/scripts/loom_render_crochet.py`), on Fargate ([Loom: Fargate render](project_loom_fargate_render.md)).
