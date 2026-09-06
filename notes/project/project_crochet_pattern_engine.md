---
name: project_crochet_pattern_engine
description: "Crochet pattern engine build 1 (flat, program layer + render-on-publish) — landed + Rebecca-approved on a branch, awaiting orchestrator merge; build 2 next"
metadata: 
  node_type: memory
  type: project
  originSessionId: 17803a49-8d6f-456e-9479-16c7b402aa19
---

The crochet PATTERN engine turns a stored stitch program into a rendered,
chart-bearing, self-heroing pattern. Built on the loom stitch engine
([[project_loom_stitch_engine]]); it is the program/pattern LAYER, not stitch
geometry.

**Build 1 (flat, 12 locked stitches) — DONE + Rebecca-approved 2026-07-11.**
Branch `claude/crochet-pattern-engine` (off `claude/loom-shaping-knit`), pushed,
NOT merged — the orchestrator merges after the look session's locks. Commit
`cbaf8348`. What it added (no stitch-geometry file touched):
- `engine/program.ts`: new `'grid'` form (mixed stitch types per row via
  `buildContinuous` + `stitchAt` — the proven postrib/basketweave path), yarn
  weight→`yr` map, colour/palette/sizing fields, `gaugeYr` override, and
  `programToChart()` (FORWARD map → the product's `ChartDefinition`). Pairs with
  the existing `programFromChart` (reverse).
- `engine/programScene.ts`: pure compile→relax→audit→Blender scene + a stable
  `geometryHash` (render cache key).
- `scripts/loom-pattern.ts`: `renderProgram()` engine + CLI (audit gate → base
  render → fidelity-gated hero, falls back to the exact base without FAL_KEY) +
  writes instructions + ChartDefinition + a standalone chart SVG.
- `scripts/render-pattern-on-publish.ts`: a stored `CrochetPattern` heroes itself
  from its `loomProgram`; persists the hero, writes the loom* fields +
  regenerated chart/words, idempotent by `geometryHash`. Build-time only. WRITTEN
  + typechecked but NOT yet run against the live DB (no deploy that session).
- Schema: `CrochetPattern.loomProgram` + `loomHero`/`loomRenderStatus`/
  `loomRenderedAt`/`loomFidelityScore`/`loomGeometryHash`/`loomYarnRadiusMm`
  (migration `20260926000000_phase_crochet_pattern_engine_001` — NOT applied to
  the live DB yet; applies at merge). Loom hero tracked distinctly from the Fal
  img2img hero. Extends the existing model per [[project_crochet_anchor]].
- Proofs (`scripts/loom-pattern-proofs.ts`): stripe dishcloth, 1×1 post-rib
  headband, texture sampler — all audit-clean, all locked stitches. Rendered +
  Rebecca approved the look (post-rib strongest; the other two chunkier/rustic —
  the known library roving softness, not a program fault). Handbook record:
  `STITCH_ENGINE.md` §8e-1.

**Build 2 / later (OUT of build 1):** round/amigurumi composition (ball+tube),
stranded/intarsia colourwork topology, knit patterns, the Studio "design your
own" UI. Colour is STORED on the program/schema now (no backfill) but the base
render is single-colour — stripe/colourwork RENDERING is the next build.
