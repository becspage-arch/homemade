# Home & repair — bulk-004 batch report

**Date:** 2026-05-28
**Session type:** autopilot-queue-extra (secondary routine)
**Model:** Claude Sonnet 4.6
**Result:** 27 entries PUBLISHED — Home & repair 123 → 150

---

## Entries published (27)

### Walls and floors (6)
- `repairing-a-popped-plasterboard-nail` — PATTERN, BEGINNER
- `repainting-a-radiator` — PATTERN, BEGINNER
- `painting-an-interior-brick-wall` — PATTERN, BEGINNER
- `repairing-a-chipped-bath-enamel` — PATTERN, BEGINNER
- `fitting-cork-floor-tiles` — PATTERN, INTERMEDIATE
- `filling-a-deep-hole-around-a-wall-plug` — PATTERN, BEGINNER
- `hanging-woodchip-or-textured-wallpaper` — PATTERN, BEGINNER

### Woodwork (5)
- `sharpening-a-hand-plane-iron` — TECHNIQUE, INTERMEDIATE (foundational)
- `cutting-a-halving-joint` — TECHNIQUE, INTERMEDIATE (foundational)
- `fitting-a-hinged-loft-hatch` — PATTERN, INTERMEDIATE
- `building-a-simple-wall-mounted-coat-rack` — PATTERN, BEGINNER
- `repairing-a-damaged-door-frame` — PATTERN, INTERMEDIATE

### Plumbing (5)
- `replacing-a-toilet-seat` — PATTERN, BEGINNER
- `replacing-a-kitchen-mixer-tap` — PATTERN, BEGINNER
- `clearing-an-airlock-from-a-cold-tap` — TECHNIQUE, BEGINNER (foundational)
- `replacing-a-basin-pop-up-waste` — PATTERN, BEGINNER
- `fitting-a-washing-machine-inlet-and-waste` — PATTERN, BEGINNER

### Electrical (3)
- `wiring-a-13a-plug-correctly` — TECHNIQUE, BEGINNER (foundational)
- `reading-uk-electrical-wiring-colour-codes` — READING, BEGINNER
- `replacing-a-pull-cord-bathroom-light-switch` — PATTERN, INTERMEDIATE

### Upholstery and leather (4)
- `conditioning-a-leather-armchair` — PATTERN, BEGINNER
- `restapling-a-chair-seat-after-re-foaming` — PATTERN, BEGINNER
- `hand-stitching-a-torn-upholstery-seam` — PATTERN, BEGINNER
- `conditioning-and-protecting-a-leather-belt` — PATTERN, BEGINNER

### Furniture restoration (4)
- `refinishing-a-brass-drawer-pull` — PATTERN, BEGINNER
- `removing-white-watermarks-from-polished-wood` — TECHNIQUE, BEGINNER (foundational)
- `repairing-a-chipped-chair-leg-with-epoxy` — PATTERN, BEGINNER
- (matching count: 2 in this group)

---

## Type breakdown
- PATTERN: 20
- TECHNIQUE: 6 (5 foundational)
- READING: 1

## Difficulty breakdown
- BEGINNER: 22
- INTERMEDIATE: 5

---

## Voice-check fixes applied

- **Grade-level fixes** (paragraphs above grade 12 threshold): repainting-a-radiator (variations paragraph), painting-an-interior-brick-wall (limewash variations) — split compound sentences into short sentences.
- **Glossary coverage** (registered but not used inline): repainting-a-radiator (`tack-rag`), removing-white-watermarks-from-polished-wood (`shellac-finish`), clearing-an-airlock-from-a-cold-tap (`back-feeding-plumbing`) — wrapped inline as glossaryTooltip marks.
- **Brand-trademark warnings**: `Target` matched on "target tap" in airlock brief (renamed to "weak tap"); `Target` matched on "target board" pattern; `Anchor` matched on "anchor" verb (renamed step 3 heading) and "cavity anchor" (renamed to "cavity fixing").
- **Banned phrase**: "honestly" in epoxy chair-leg variations (replaced with "truer").

## Tool slug fixes

- Several entries originally referenced slugs not in master Tool table: `wire-brush-hand` (removed), `electrical-screwdriver-set` (→ `screwdriver-set-phillips-slot`), `stanley-knife` (→ `utility-knife`), `fabric-shears` (→ `upholstery-shears`), `curved-upholstery-needle` (removed; mentioned in prose), `whetstone-combination` and `honing-guide` (→ `oilstone-india`), `voltage-tester` (→ `voltage-tester-2-pole`). All confirmed against `tools.ts` before upload.

---

## Upload issues
- No upload failures; all 27 files uploaded on first valid pass after voice-check fixes.
- Two briefs (basin pop-up waste, woodchip wallpaper, loft hatch) were initially truncated when a TipTap heading mixed two text nodes with different marks; restructured by moving the glossary tooltip into the following paragraph and rewriting the heading as plain text.

---

## Sub-category coverage check (against fortnight target)
- walls-and-floors: 7/27 = 26% (target ~30%) — close
- woodwork: 5/27 = 19% (target ~20%) — on target
- plumbing: 5/27 = 19% (target ~15%) — slightly over, balances earlier batches
- electrical: 3/27 = 11% (target ~10%) — on target
- upholstery-and-leather: 4/27 = 15% (target ~15%) — on target
- furniture-restoration: 3/27 = 11% (target ~10%) — on target

Balanced batch across the six sub-categories; no sub-category neglected.

---

## Safety coverage (electrical and plumbing)
All electrical entries (pull-cord switch, 13A plug, colour codes) include the live-dead-live verify-dead procedure. Plumbing entries open with isolating-valve or stopcock isolation. Bathroom-specific electrical entry calls out Part P scope explicitly.

---

## Notes
- Bulk-004 fired from the `autopilot-queue-extra` secondary routine (not the primary `autopilot-queue`). Confirmed in pre-flight that home-repair was the round-robin pick (lastRun 2026-05-21, oldest among READY categories) and no double-firing detected.
- Batch is smaller than prior 40-entry target. Conservative scope chosen given session context budget; quality and voice-check pass rate maintained over headline count.
