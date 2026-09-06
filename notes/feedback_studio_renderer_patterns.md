---
name: Studio + renderer shared patterns — reusable across categories
description: Patterns proven across cross-stitch, crochet, and knitting Studios that should carry forward to sewing + future categories. Plus the renderer-barrel client-safety rule.
type: feedback
originSessionId: 6c0cfe69-6a03-4d34-a559-3fe119b4afe7
---

**Renderer barrel exports must split server vs client when sharp is imported.**

K-3 hit this: K-2's `apps/web/src/lib/knitting/renderer/index.ts` re-exports `rasteriseSvg` from `png-rasteriser.ts`, which imports `sharp` (a Node-only native module). Client-side Studio code went through the barrel and the build failed with "Module not found: Can't resolve 'fs' from detect-libc."

K-3 worked around with a parallel `client.ts` entry that imports per-type layouts + composer directly, bypassing the rasteriser.

**The fix going forward:** every renderer module that imports sharp must export two barrels:

- `index.ts` — server-only, includes the rasteriser
- `index-server.ts` (alias) OR `client.ts` — explicitly client-safe, no sharp

Apply this rule to: the cross-stitch chart engine, the crochet renderer, the knitting renderer (existing — clean up), and any future renderer (sewing, needlework specialist).

**Studio shared patterns proven across two categories (crochet + knitting):**

1. **Autosave via `pendingState` / `pendingPrefs` ref split** — view-mode and project-state writes interleave cleanly through one debounced flush. Used in `apps/web/src/components/studio/crochet/` and copied to `apps/web/src/components/studio/knitting/`. Should become a shared hook at `apps/web/src/lib/studio/use-autosave.ts` when sewing's Studio lands or in a focused cleanup worker.

2. **Project setup card re-prompts on skip** — if the user skips the setup (size / yarn / gauge picker), the card returns next time the project is opened. Kind / teacher-y default. Crochet did it; knitting matched.

3. **Stash page CSS shared at `stash.css`** — knitting and crochet stash pages reference the same CSS so refactoring to a shared `<StashGrid />` component is one move. Sewing will reuse.

4. **Colour-accent per category** — cross-stitch warm taupe, crochet sage, knitting sage-blue (#6b8a9b). Each Studio gets a distinct subtle accent so users moving between them have spatial memory. Sewing should pick one accent in the same family.

**Knitting-specific renderer rule (chart-type registration):**

For `COLOURWORK` charts only, the cell's `s` field identifies a palette colour, not a stitch symbol. The underlying stitch is always knit. The naive approach (look every slug up in the symbol registry) flags every colourwork chart's palette keys as "unknown symbols."

The fix lives in K-2's `buildGridLayout`: it accepts a `forceSymbolSlug` option that the colourwork chart-type sets to `'knit'`. The cell slug still indexes the palette by colour; only the symbol lookup is overridden.

Lace / cable / brioche charts use the cell slug as the symbol slug as expected.

If a future chart type (sewing-pattern-piece, perhaps?) needs a similar override, follow the same pattern: route through `forceSymbolSlug` rather than special-casing the registry lookup.

**Cleanup follow-ups (small worker can bundle):**

- Split K-2 renderer barrel into client-safe + server-only entries
- Promote autosave hook to `apps/web/src/lib/studio/use-autosave.ts`
- Extract `<StashGrid />` shared component when sewing's Stash needs the same shape
