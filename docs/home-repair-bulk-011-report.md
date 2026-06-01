# Home & repair — bulk-011 batch report

**Date:** 2026-06-01
**Session type:** autopilot-queue
**Model:** Claude Sonnet 4.6
**Status:** 40 entries PUBLISHED
**Home & repair total:** 385 → 425

## Sub-category breakdown

- walls-and-floors ×12 (hanging-lining-paper-before-decorating, hanging-a-wallpaper-border-above-a-dado-rail, applying-a-silicone-mastic-bath-seal, painting-over-a-dark-colour-on-interior-walls, tiling-an-external-step-with-quarry-tiles, filling-a-large-plasterboard-hole-with-a-patch-plate, fitting-a-bath-panel-with-hinged-access, repairing-a-hollow-sounding-floor-tile, tanking-a-cellar-wall-with-waterproofing-slurry, laying-glue-down-vinyl-plank-flooring, painting-exterior-timber-window-frames, patching-and-colour-matching-a-painted-wall)
- woodwork ×8 (fitting-a-bi-fold-wardrobe-door-kit, making-a-simple-timber-sawhorse, fitting-a-solid-lipped-edging-strip-to-a-shelf, making-a-timber-tool-tote-tray, fitting-a-pull-out-larder-drawer-unit, fitting-a-door-viewer-peephole-into-a-front-door, fitting-a-door-frame-to-a-stud-wall-opening, fitting-a-plywood-back-panel-to-open-back-kitchen-cabinets)
- plumbing ×6 (fitting-an-electric-shower-unit, routing-a-condensing-boiler-condensate-pipe-to-a-drain, fitting-a-saniflo-macerator-pump-to-a-wc, repairing-a-continuously-running-wc-cistern, fitting-a-bibcock-garden-tap-on-a-copper-supply-pipe, fitting-a-bottle-trap-to-a-basin-waste)
- electrical ×4 (fitting-a-recessed-led-downlight-into-a-plasterboard-ceiling, fitting-a-programmable-room-thermostat, fitting-an-indoor-pir-motion-sensor-light-switch, understanding-rcd-mcb-and-rcbo-protection-in-a-consumer-unit)
- upholstery-and-leather ×6 (re-covering-a-padded-storage-bench, fitting-a-gusset-panel-to-a-box-cushion-cover, making-a-leather-bag-strap-with-a-swivel-snap-hook, making-a-leather-luggage-tag, replacing-a-seat-pad-on-a-wooden-bar-stool, cleaning-and-conditioning-a-leather-jacket)
- furniture-restoration ×4 (applying-polyurethane-varnish-to-bare-wood-furniture, repairing-a-loose-chair-leg-with-a-corner-glue-block, filling-a-deep-gouge-in-a-wood-tabletop-with-two-part-wood-filler, applying-shellac-sanding-sealer-before-varnishing-or-painting)

## Type / difficulty mix

PATTERN ×27, TECHNIQUE ×12, READING ×1 (understanding-rcd-mcb-and-rcbo-protection-in-a-consumer-unit).
BEGINNER ×28, INTERMEDIATE ×11, ADVANCED ×1 (fitting-an-electric-shower-unit).

## Voice-check fixes

- **em-dash bulk replace** (all 40 files): " — " → "; " via fix-emdash-briefs.mjs
- **grade-level rewrites** (16 files): opening and mid-body paragraphs simplified to grade 6–8 register — walls-and-floors entries (09, 12, 20), plumbing (17, 21, 24, 25), electrical (28, 29, 30), upholstery (31, 32, 34, 36), varnish entry (37, 40). For files with tooltips splitting text nodes, fixes targeted specific plain-text nodes rather than full paragraph replacement.
- **medical-claim "cures"** (files 05, 15, 37, 38, 40): "cures" → "sets", "dries", or "dried"; "cured" → "set" or "dried"
- **price-mention** (file 14): "£10 to £15" → "a small extra cost"
- **criticalTechniques mismatch** (file 21): `criticalTechniques: ["radial-circuit-shower"]` cleared as the technique tutorial does not exist; entry still includes full safety/Part-P guidance in body
- **shellac paragraph restructure** (file 40): grade-28 list-style paragraph rewritten as four short numbered sentences; compatibility-note paragraph also simplified
- **glossary-coverage** (files 01, 37): auto-injected inline glossaryTooltip marks for `lining-paper` and `raising-the-grain` terms not wrapped in body

## Post-publish QC

- hero-fill: 40 home-repair entries processed — 34 pexels, 4 unsplash, 2 flux-schnell, 0 failed
- qc-fix: 70 candidates processed (80 total, 10 previously unfixable excluded), pass=62, still_blocked=8 (in 24-hour skip window; hourly qc-fix-batch picks up)
