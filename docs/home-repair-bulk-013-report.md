# Home & repair — bulk-013 batch report

**Date:** 2026-06-02
**Session type:** autopilot-queue
**Model:** Claude Sonnet 4.6
**Status:** 40 entries PUBLISHED
**Home & repair total:** 465 → 505

## Sub-category breakdown

- **walls-and-floors ×12:** fitting-polystyrene-coving-with-adhesive, laying-solid-wood-parquet-floor-tiles-in-adhesive, applying-pebbledash-to-an-exterior-wall, painting-a-concrete-garage-floor, using-hollow-wall-anchors-on-plasterboard (TECHNIQUE), fitting-a-tile-edge-trim-strip-to-an-exposed-tile-cut (TECHNIQUE), fitting-a-letterbox-draught-seal, re-grouting-and-resealing-a-tiled-shower-enclosure, fitting-a-fireplace-surround-to-a-chimney-breast, fitting-an-extractor-duct-liner-through-a-cavity-wall, fitting-a-decorative-wood-panel-below-a-dado-rail, repairing-a-sagging-plasterboard-ceiling
- **woodwork ×8:** fitting-a-kitchen-plinth, fitting-kitchen-cornice-and-pelmet-rail, making-a-simple-drawer-box-from-plywood, fitting-a-window-opening-restrictor, sharpening-a-bench-chisel-on-a-whetstone (TECHNIQUE), fitting-a-door-finger-plate-and-kick-plate, fitting-cabinet-knobs-and-cup-pulls, hanging-a-wooden-shed-door-with-tee-hinges
- **plumbing ×6:** draining-and-refilling-a-central-heating-system, fitting-a-shower-enclosure-to-a-shower-tray, unblocking-a-foul-drain-with-drain-rods, fitting-a-kitchen-monoblock-tap, fitting-copper-pipe-clips-and-running-a-pipe-through-a-joist (TECHNIQUE), fitting-a-plastic-rodding-eye-to-a-soil-pipe
- **electrical ×4:** fitting-a-cat6-data-socket-on-a-wall-plate, fitting-a-wireless-doorbell-push-and-chime-unit, replacing-a-ceiling-fan-with-a-pendant-light-fitting, understanding-18th-edition-wiring-regulations (READING)
- **upholstery-and-leather ×6:** re-covering-a-footstool-lid-with-foam-and-fabric, making-a-leather-passport-holder, making-a-leather-watch-strap, lacing-leather-through-punched-holes-with-a-running-stitch (TECHNIQUE), making-a-fitted-loose-cover-for-a-dining-chair-seat, fitting-a-pull-stitch-through-foam-to-hold-upholstery-fabric (TECHNIQUE)
- **furniture-restoration ×4:** repairing-a-bowed-tabletop-with-timber-batten-braces, applying-raw-linseed-oil-to-an-old-pine-piece, cleaning-and-polishing-a-verdigris-brass-fitting, replacing-a-leather-writing-surface-on-a-writing-desk

## Type / difficulty mix

PATTERN ×27, TECHNIQUE ×8, READING ×1 (understanding-18th-edition-wiring-regulations), TECHNIQUE ×4 (hollow-wall-anchors, tile-edge-trim, chisel-sharpening, pipe-clips, lacing-leather, pull-stitch).  
BEGINNER ×24, INTERMEDIATE ×15, ADVANCED ×0, READING ×1.

## Voice-check fixes

All 40 entries passed voice-check (0 errors) before upload.

Issues found and fixed during self-critique and voice-check passes:

- **Em-dash rule** (11 files): "Step 1 — ..." headings and em-dashes in body text removed. Replaced with colons, commas, semicolons, or removed prefix.
- **Medical claim "cures"** (2 files): "cures" → "sets" (render) and "dries" (linseed oil).
- **Grade-level failures** (6 files): long sentences in "Choose the position" (rodding eye), Part P list sentence, "BS 7671 covers" paragraph, Re-lacquer paragraph, bullet items, and "Where to find more" section — all simplified by sentence-breaking and vocabulary reduction.
- **JSON malformed heading strings** (24 files): an artifact where ASCII apostrophes replaced closing double-quotes in heading strings across files authored in the second half of the session; fixed with a Node.js bulk-replace script.
- **Banned phrase "honest"** (1 file): "looks more honest" → "gives a period look".
- **Unused glossary terms** (2 files): `plasterboard-nail-pop` removed from file 12 (not used in body); `oil-fire-hazard` removed from file 38 (covered by infoPanel); `part-p-notification` gained an inline glossaryTooltip in file 30.
- **Grade 12.0 === threshold** (1 file): file 40 paragraph at exactly grade 12.0 fails the strict threshold; simplified to pass.

## Post-publish QC

- **hero-fill:** 40 home-repair entries — 35 pexels, 5 unsplash, 0 flux-schnell, 0 failed
- **qc-fix:** 49 candidates, pass=47, still_blocked=2 (within 24-hour skip window, hourly batch picks up)

## Notes

- Round-robin picked home-repair (oldest lastRun at 03:54 UTC) from 8 READY categories.
- Batch 013 takes home-repair from 465 → 505 (63% of 800 target).
- The "Step 1 —" em-dash heading pattern is a recurring authoring artifact; added to self-critique checklist.
