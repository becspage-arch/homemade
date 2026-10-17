---
name: project_loom_render_engine
description: "The 22 June 2026 platform decision: one deterministic, stitch-accurate render engine (the loom) for every pattern craft, render-only, with each craft owning its own generation. Trimmed 17 October 2026."
metadata:
  type: project
---

# The loom: platform decision (ratified 22 June 2026, trimmed 17 October 2026)

One deterministic, stitch-accurate render engine for every pattern craft (cross-stitch, needlework, crochet, knitting, sewing, and later non-fibre crafts). The June planning text (crochet targets, template research, the embroidery reset) is in git history; current crochet facts are in [Crochet state](project_crochet_state.md).

## The principle
- The render is a deterministic function of the pattern's complete structured data: accurate by construction, never invented.
- Every craft's pattern carries full machine-renderable structure (crochet: the stitch program; needlework: regions, thread direction and stitch type; sewing: panels and seams). Prose and a chart alone are not enough.
- The process is `apps/web/src/lib/loom/RENDER_PROCESS.md`. Cross-stitch's grid renderer is the accuracy reference.

## Three layers
1. Brief: the shared design direction (`packages/db/prisma/design-direction.ts`).
2. Generation (brief to structured data): owned by each craft.
3. Render: the loom. Render-only; it renders what it is handed, the same for our patterns, Studio users and designers.

## Three tiers (by dimension, not craft)
- Grid: cross-stitch and counted needlework (already works).
- 2D: free embroidery, flat crochet and knit.
- 3D: amigurumi, garments, bags, hats.

## Rules that still stand
- The loom gates a category going fully public, not its content build; patterns built meanwhile still carry complete structured data.
- No free AI image generation of a pattern. AI may only finish a locked render behind the fidelity gate ([Hero must be the exact pattern](../feedback_hero_must_be_exact_pattern.md)).
- The loom also owns stitch teaching diagrams, drawn from the same primitives.
- The crochet bar is Bec's five photos ([Crochet quality bar](../feedback_crochet_quality_bar.md)).
