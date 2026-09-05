# Crochet / Knit Stitch Engine — Handbook

The complete context for the yarn-level stitch engine, so the learnings are never
lost between sessions. Read this + `../RENDER_PROCESS.md` before touching stitches.

Internal-fixture note: reference photos linked below are external, copyright their
owners (tutorial sites). They are used ONLY to calibrate our renders — never
shipped, redistributed, or republished. Our renders are loom-generated and ours.

---

## 1. What this is

A real **yarn-level stitch engine**: it builds a crochet/knit fabric as ONE
continuous strand of yarn (traced exactly as a hook lays it), relaxes it with
physics, and renders it photoreal. It replaces the earlier hand-authored per-stitch
geometry, which never read as real yarn (it came out as rope / dumplings / waffle /
knots — see the failure log in §9).

The engine is the deterministic-geometry front half of `RENDER_PROCESS.md` Step 4,
generalised so every stitch and every craft (crochet now, knit next) runs through
the same machinery; only the per-stitch path differs.

---

## 2. One continuous strand — what and why

We model the fabric as a **single unbroken yarn** that weaves the whole piece:
down into the stitch below, under that stitch's top, back up, throw its own loop,
on to the next; row after row, turning at each end.

**Why this and not separate per-stitch pieces:**
- It's the real thing — a crocheter works one strand. The interlock is the yarn
  physically passing under the loop below, held there by self-collision during
  relaxation — NOT springs pretending separate pieces are joined.
- It scales. A cluster, a post stitch, a cable, working into a chain-space — each is
  just "what the one strand does next," not a new special case.
- 3D falls out — the same strand path lives on a 3D surface (amigurumi rounds, a
  sleeve) instead of a flat plane.

The per-stitch-pieces approach (tried first) walled out immediately and is retired.

---

## 3. The engine — five stages + files

`dictionary → topology/path → form (2D now, 3D later) → RELAXATION → render`

Files (all under `apps/web`):
- `src/lib/loom/crochet/engine/dictionary.ts` — every stitch defined once by
  parameters (today: `heightFactor`; sc 1.0, hdc 1.45, dc 2.0, tr 2.7). Add a stitch = one entry.
- `src/lib/loom/crochet/engine/yarnPath.ts` — `buildContinuous(rowTypes, W, yr)`:
  emits the continuous strand (foundation + serpentine worked rows). Also home of
  the SHARED pieces every builder uses: `createStrand()` (the one-strand push with
  auto distance+bend bonds), `stitchDims`, and `emitPlainStitch` (the extracted
  plain-stitch excursion — see §8c for its two shaping generalisations).
- `src/lib/loom/crochet/engine/shaping.ts` — `buildShaped` (variable-width rows:
  increases + decreases) and `buildRounds` (working in the round off a magic
  ring). §8c.
- `src/lib/loom/crochet/engine/knitPath.ts` — `buildKnit` (stockinette + garter):
  the knit craft on the same engine. §8d.
- `src/lib/loom/crochet/engine/program.ts` — the PATTERN PROGRAM layer: one
  declarative pattern → geometry (compileProgram) + written instructions
  (writeInstructions) + the product's ChartDefinition (programFromChart). §8e.
  Proof suite: `scripts/loom-program.ts`.
- `src/lib/loom/crochet/engine/relax.ts` — the relaxer (generic; serves every
  stitch, 2D + 3D; `layoutMode: 'radial'` is the blocked-to-radius pull for rounds).
- `scripts/loom-link-debug.ts` — numeric dump of every link's settled offsets per
  row/round (the generalised ch-debug: get NUMBERS before theories).
- `src/lib/loom/crochet/yarnLoop.ts` — `pliedFilaments` (spirals plies around a 3D
  centre-line for spun-yarn fibre) + `smooth` (Catmull-Rom).
- `scripts/loom-continuous.ts` — driver. Args: `yarnRadiusMm`, `W`, `colourHex`,
  `name`, `stitch`.
- `scripts/loom-aspen-hero.ts` — photoreal finish: Fal clarity-upscaler (crochet
  prompt) + fidelity gate (structureScore must pass; no drift).
- `scripts/loom_render_crochet.py` — Blender backend (wool material, contrasting
  walnut ground, view controls).
- Retired (kept for history): `engine/scSwatch.ts`, `engine/swatch.ts`.

---

## 4. The relaxation — the crux (and the risk)

Position-based (Gauss-Seidel) constraint projection, no velocities. Per iteration:
1. **distance** constraints along the yarn (keep its length),
2. **bending** (i↔i+2; yarn resists kinking),
3. **self-collision at one yarn diameter** — two yarns may touch but never pass
   through each other,
4. soft **plane** pull (keeps a flat swatch flat, leaves relief).

The collision-at-diameter is THE idea: it forces every loop open to a yarn-width, so
topology resolves into recognisable stitches instead of a flat tangle, and it
preserves linking (loops that start linked stay linked). Collision skips bonded pairs
(joined by a constraint) and near-neighbours along the strand.

Stability gotchas already fixed: default node inverse-mass to 1 (undefined → NaN that
spread to every node); skip distance projection when two nodes are coincident
(`d < 1e-5`).

---

## 5. Per-stitch build process (do this for EVERY stitch)

1. **Get a real reference photo** of the finished stitch and LOOK at it (§7 links).
2. **Build it as one continuous strand** — add/adjust the per-stitch excursion in
   `yarnPath.ts`.
3. **Render** the deterministic base (Blender).
4. **Photoreal finish** — upscale + fidelity gate (structure must hold, no drift).
5. **Judge as a customer** (§6) against the reference.
6. **Confirm across weights** (fine / worsted / bulky) — change `yr` (+ stitch count).

Only keep what passes the customer eye, in every weight.

---

## 6. Customer-acceptance process — the HARD RULE

**Never present a render without first LOOKING at the finished image as a customer
would (the image, not the code).** Then a binary test: *would a customer be happy
with this?*
- **No** → keep iterating (or if it's awful, throw it out and rethink). Do NOT bring it.
- **Yes** → bring it.

Discipline: pull the real reference photo and compare against it (don't judge from
memory); describe honestly what it actually looks like to a fresh eye ("rows of white
rubber tubing", not "cosy crochet"); when unsure, treat as **no**; never oversell.

**How to report back in chat with a photo:** render to a PNG, then use the `Read`
tool on that PNG — it renders the image inline in the conversation. Show OUR render
(ours to show); LINK the copyrighted reference rather than embedding it. State which
reference it's compared to and the honest customer verdict.

---

## 7. Reference photos (external, linked for comparison only)

- Single crochet (sc): https://eyeloveknots.com/wp-content/uploads/2020/07/EYE_SC.jpg
  — tutorial: https://eyeloveknots.com/2020/07/how-to-single-crochet-us-photo-tutorial.html
- Half double crochet (hdc): https://eyeloveknots.com/wp-content/uploads/2021/01/ET_HDC_24.jpg
  — tutorial: https://eyeloveknots.com/2021/01/how-to-half-double-crochet-us-photo-tutorial.html
- Double crochet (dc): https://eyeloveknots.com/wp-content/uploads/2020/04/ET_DC_25.jpg
  — tutorial: https://eyeloveknots.com/2020/05/how-to-double-crochet-photo-tutorial.html
- Granny square: https://eyeloveknots.com/2015/06/how-to-crochet-granny-square-with-photo.html

What each reference shows (the target):
- **sc** — flat, dense, even; tidy little "V"s in tight rows; low relief.
- **hdc** — taller than sc; rows of V's separated by a horizontal **third-loop ridge**.
- **dc** — tall **vertical posts** (visible columns) topped by V's; more open/airy.

---

## 8. Current state — what's acceptable, what's not

**The engine was rebuilt to GENUINE topology on 2026-06-29 (the only model going
forward — see §8a).** Every stitch is one continuous strand, TURNED each row
(direction + worked-face flip), hooking under the crown below with the interlock
held by self-collision. Height relaxes out of the yarn fed + a "blocked flat"
y-pull (`layoutK`). No pinned shapes, no spring joins (HARD RULE, §9).

All statuses + full recipes (gauge, rows, view, audit size, reference URL) live in
`engine/dictionary.ts` (`SWATCH_RECIPES`) — THE single source of truth. The table
below is the narrative record.

Cross-weight note 2026-07-11: a FINE-weight (yr 1.5) audit sweep passed for every
stitch changed in the canopy/density/new-stitch session (mrdisc, ball, garter,
knitrib, vstitch, crossed, picot, bobble — 8/8), following the ch precedent of
audit-level cross-weight confirmation. scdec re-rendered (gate 0.926) and
stockinette re-rendered (gate 0.884), both consistent with their 07-10 looks.

| Stitch | Method (genuine engine) | Verdict |
|--------|-------------------------|---------|
| **sc** | short stitch, DENSE gauge (`1.8yr` — reference gaps are pinpricks, not holes) | ✅ **LOCKED**, re-verified vs reference 2026-07-02 (audit: was too open at 2.0yr, fixed) |
| **hdc** | mid stitch + the real **third-loop** yarn-over ridge per row; dense (`2.0yr`) | ✅ **LOCKED**, re-verified 2026-07-03 (was too open at 2.2yr, fixed) |
| **dc** | tall **post** (`heightFactor 3.2`), gauge `2.3yr` — posts lean together, slits not gaps | ✅ **LOCKED**, re-verified 2026-07-03 (was too open at 2.5yr, fixed) |
| **tr** | taller post (`heightFactor 4.2`), gauge `2.45yr` — AIRIER than dc, open channels | ✅ **LOCKED**, re-verified 2026-07-03 (was too DENSE at the shared 2.3yr — tall stitches got their own gauge) |
| **dtr** | taller again (`heightFactor 5.4`), gauge `2.45yr` | ✅ **LOCKED**, re-verified 2026-07-03 |
| **sl st** | shortest worked (`heightFactor 0.8` — a row is still ≈1 yarn thick), tight gauge | ✅ **LOCKED**, re-verified 2026-07-03. Audit caught its row-0 corner stitch strangling off the pinned foundation → fixed with the **turning chain** (real slack into every first stitch, all stitches benefit) |
| **ch** | REBUILT 2026-07-02 as the true pull-through topology: each loop a flat teardrop; BOTH strands of loop n thread loop n−1's opening; connector = the back bump behind the work; only the slip knot pinned. Soft chain collision (`collMinDist 1.0yr` — drawn-tight chain squashes), whisper plane pull, TABLE floor (`floorZ`), 400 iters. Settled geometry verified numerically (`scripts/loom-ch-debug.ts`): folds centred + hidden mid-depth, legs symmetric on the front, both crossings inside each hole, bumps at the back, loop rotation ~2°. Face = nested-V plait. | ✅ **LOCKED 2026-07-02** (Rebecca signed off vs the eyeloveknots chain reference). Cross-weight (fine/worsted) confirmation folded into the audit sweep. |
| **bobble** | gathered cluster: genuine base hook + N loops bulging forward to one top | ◑ **construction FIXED 2026-07-10, look not yet**. The 3 broken interlocks are gone (audit 3→0): the unsigned +z bulge had no slack, so it dragged the base hook AND the gathered head onto the wrong z-side. Fix = slack nodes at BOTH ends of the bulge + gather into a proper proud crown (zh*1.15, not the old weak z*0.95) + confine the swatch's dots to interior columns (a cluster hard on the pinned selvedge strangled its corner hook). The LOOK is still lumpy — berries don't pop from the busy sc ground; that's the separate look pass, deliberately deferred (scope was construction first). LOOK ATTEMPT 1 2026-07-11 (Opus worker), inside the cushioned bulge only (anchors untouched): bulge z·5→z·7 (~2.1yr), fan cw·1.5→cw·2.2, loop heights DOMED (centre fullest, outer ~0.85) so the five loops mound into a berry instead of a fence. Audit stays clean; probe: berries stand to 2.36yr off a 0.01yr-median flat ground. RENDERED 2026-07-11 (gate 0.908): berries now genuinely stand off the surface as raised domes with cast shadows — a real step past the fence — but vs the reference's crisp bobbles-on-flat-rows the fabric stays busy: the chunky sc GROUND competes with the berries. The remaining gap is the ground (library-wide roving softness/weight), not berry prominence — belongs to the possible library-wide yarn-crispness pass, not another berry tweak. Rebecca verdict pending. LOOK ATTEMPT 2 2026-07-11 (Opus round-2, the LAST under the cap): the round-2 verdict was amorphous lumps scattered in porridge vs the reference's tight ROWS of round balls. Re-recipe (bobbleDot) to the reference LAYOUT — plain sc on even rows, a dedicated bobble row every odd row with a berry every OTHER interior stitch, edges plain — replacing the staggered every-4th polka-dot; and tighter berries (fan cw·2.2→1.4, bulge z·7→6) so each mounds into a compact ball not a wide splat. Audit clean 112/112. Render now reads as tidy ROWS of berries on flatter sc rows (a real structural step from porridge). Residual = the busy sc GROUND (out-of-scope library-wide roving softness) leaves the berries less crisp than the reference's clean balls. CAP REACHED (2 look attempts): any further improvement is the library-wide yarn-crispness pass, not a bobble tweak. Rebecca verdict pending. |
| **sc blo / flo** | head split into a real back + front loop; hook one, float the other as a ridge | ✅ **LOCKED 2026-07-07** (Rebecca). Reference re-verification found + fixed a real bug (ridge was nudged AFTER placement → relaxation crushed it; now baked at creation, split 2.2/0.25 zh, settled gap ~0.76yr) + calmer twist (0.05). Chosen depiction = **faithful flat-turned**: because we turn every row, each row's unworked loop correctly lands on the face it was worked from, so the ridge shows every OTHER row on the viewed face (odd rows' ridge settles to −z, hidden). Signed off as structurally correct + consistent with the locked `sc` look. Remaining softness (ridge reads heavier than a clean reference line) is the shared engine yarn-look, not blo/flo-specific — deferred to a possible library-wide yarn-crispness pass. |
| **fpdc / bpdc** | post RINGS the stem below (collision-held); body pops front (fp) / back (bp), head stays at plane; dense gauge | ✅ **LOCKED 2026-07-07** (Rebecca delegated the call). Individual reference comparisons done vs clean single-stitch refs (fpdc = raised proud posts, acrochetedsimplicity; bpdc = recessed posts / horizontal-bar front, theloopholefox — old shared ref was a colourwork-cable photo). fp raised vs bp recessed reads correctly; the distinction is subtle in isolation (as in a real all-one-type swatch) — its point is the contrast in postrib/basketweave. |
| **postrib** (1×1 fp/bp rib) | alternating fpdc/bpdc columns → raised ribs beside recessed valleys | ✅ **LOCKED 2026-07-07** (Rebecca). Reads as distinct packed vertical ribs vs a clean 1×1 rib ref (doradoes). The initial open-gauge caveat was **fixed**: postrib inherited fpdc's 1.9 gauge which left daylight between ribs; a per-swatch `gaugeYr: 1.5` override (new — leaves locked fpdc/bpdc gauge untouched) packed the columns tight to match the reference. Basketweave = same move in blocks, still `wip` (needs a reference + build). |
| **scinc** (2 sc in one st, shaped rows) | growing trapezoid, inc both ends every row; two full audited hooks share one below-crown, legs fan from the base (§8c) | ◔ audit-clean (90/90). The foundation-edge LIP (prior render blemish) was eased 2026-07-10: buildShaped pinned its foundation as a continuous proud forward rail (fine hidden under wide flat fabric, but a shaped trapezoid fans up from a narrow base so the rail curls forward at the point). Fix = tuck the connectors BETWEEN crowns just below the plane so the edge is a row of low bumps, not a rail; the two EDGE crowns keep their proud connectors (the increase corner works two hooks into the one corner crown — tucking its connectors strangled that dive). Still 90/90; RE-RENDERED 2026-07-11 (gate 0.924) — the foundation edge now reads as low bumps, lip gone; corners slightly bulky but no rail. Rebecca verdict pending. |
| **scdec** (sc2tog, shaped rows) | shrinking trapezoid, dec both ends every row; one crown over two audited hooks (§8c) | ◔ audit-clean (60/60). Rendered 2026-07-10 (gate 0.928): trapezoid + converging decrease legs read; the fasten-off tail fixed the earlier frayed bottom corner. Awaiting Rebecca. |
| **mrdisc** (magic ring + rounds) | flat amigurumi circle: MR anchor, 6 sc in ring, +6/round continuous no-turn spiral, polar frame + radial blocked pull + table + fasten-off (§8c) | ◑ **audit-clean (126/126), LOOK still NOT at the bar.** 2026-07-10: added `legReliefScale` 0.7 (calms same-face leg bulge; 0.6 strands an inner hook) — moved it from knotted roving to concentric-but-lumpy rounds, a real step but Rebecca confirmed NOT customer grade (random lumps throughout). Then tried a tangential ANGULAR HOLD in the relax to order the rounds — it made clumping WORSE (gap-CV 1.1→2.2) and broke a hook, because the lumps are inner-round CROWDING (too many stitches for the small-radius circumference — measured, gap-CV ≈1.1 at baseline), not stitches sliding out of slots; pinning the angle just locks the crowding in. Reverted. **Root cause = crowding + same-face relief; the relief/ordering lever family (crownLay×2, leg-relief, angular-hold) is exhausted and none reach the bar.** RESOLVED at construction tier by the CROWN CANOPY (Fable 2026-07-11): per-node one-sided z bounds (YarnModel.zBand) — non-crown nodes UNDER the crown line, crown chain HALF A YARN PROUD of it, table deepened to 2 yarn-layers, pair-second hooks tuck deeper. Audit-clean 126/126; render gate 0.882. The wall (crowd erupting between the Vs) is BROKEN: the disc now reads as a flat crocheted spiral with a drawn-tight centre. Residual = crown ORIENTATION consistency (some Vs flop sideways) — RESOLVED 2026-07-11 (Opus worker): the canopy floor clamped the apex AND both flanks to ONE plane (probe: apexZ 0.97 vs flankZ 0.92, ~0.05yr — a flat dash, free to spin in-plane). Split the floor: apex rides a prouder floor (CANOPY+0.9yr) than its flanks (CANOPY+0.5yr) → each stitch is a real 3D chevron. Probe: flop (flank-axis vs tangential) mean 21°→8°, badly-flopped crowns 2→1; audit still 126/126. Render reads as consistent tidy Vs in clean spiral rounds. Residual now = DENSITY: mine is more open between rounds than the dense reference (separate gauge/drift calibration, not attempted — would risk the clean audit). Rebecca verdict pending. DENSITY PASS 2026-07-11 (Opus round-2): the sanctioned lever (radial pitch / disc gauge). Added a per-swatch `gaugeYr` override to buildRounds and tied the radial pitch to it (`drift = 0.9·sw`, bit-identical at the locked sc 1.8); mrdisc gaugeYr 1.5 + magic ring 1.15→0.85yr. Measured: round-to-round radial gaps 1.6→1.35yr (collision floor 1.25yr — trenches largely closed), round-0 crowns 2.53→2.03yr, centre closes to a pinprick. Audit still 126/126. Render: the rounds now pack tight (the coiled-rope trenches are gone) and the centre is tight, BUT per-stitch bumps still stand proud so it reads bulbous/bean-piled vs the flat reference. That residual is the z-amplitude (~2.2yr swing), which is the exhausted relief-lever family (crownLay/legRelief/angular-hold, §9) — a numeric flatten test (APEX/FLANK floors down) only moved amplitude 2.21→2.11yr while deepening valleys, so it was NOT shipped (would risk the just-landed crown-orientation fix). Rebecca verdict pending. |
| **stockinette / k** (KNIT) | loops drawn through loops, 'through' links, real 2-diameter fabric thickness (§8d) | ✅ **LOCKED 2026-07-11** (Rebecca). Audit-clean (216/216, settled leg-vs-head clearance ≈1.7yr everywhere). Reads immediately as chunky hand-knitted stockinette — interlocked V columns, correct nesting. The plumper Vs + slight column wobble vs the fine-cotton reference are chunky-weight presentation character (the library-wide roving softness), not a defect. |
| **yo** (yarn-over eyelet, KNIT) | stockinette + [yo, k2tog, k, k] eyelet courses; the yo is a fed OPEN loop over the needle with no head below, k2tog draws through TWO heads (§8d-shaping) | ◑ **audit-clean (230/230), LOOK soft.** 2026-07-11 (Opus KNIT-DEPTH worker): built the yo (bare loop, no 'through' link — the open span under it is the eyelet) + the knit single decreases k2tog/ssk (one loop through two heads, two audited 'through' links; the merged head rides its own column so the off-centre gather makes the lean). TWO yo constructions tried: (1) bare arc, (2) fed wide open loop. NEITHER opens a crisp hole — numeric probe: eyelet open gap 0.72yr ≈ plain 0.69yr, because the relaxer packs the short knit stitches to uniform density (x is free) and mesh tension can't hold a gap at this swatch scale (§9). The fed-loop version (kept) reads better — the yo rings stand as visible openings in the eyelet bands (tilt 28 + openFabric) — but softer than the reference's crisp round holes. Residual = the same library-wide roving softness/density (a separate worker's crispness pass), not a topology bug. Two-attempt cap on the hole-opening reached; the topology is genuine + audited. Rebecca/orchestrator verdict pending. |
| **k2tog / ssk** (single decreases, KNIT) | one loop drawn through TWO heads below (two audited 'through' links); merged head on its own column, gathered pair off-centre → the lean EMERGES (k2tog right, ssk left — §8d-shaping) | ◔ both audit-clean (196/196 each; fine yr1.5 audits pass). Numeric lean probe: k2tog mean +1.16yr (RIGHT), ssk mean −1.22yr (LEFT), consistent across all 10 decreases each — the mirrored pair is genuinely mirrored in data. Showcase swatch = two vertical [yo, dec] lines stacked over courses 2–6 on stockinette. RENDERED 2026-07-11: both leans visible as tilted gathered stitches along the decrease lines; busier/subtler than the fine-cotton references at this chunky weight (the merged-head parked OFF column was tried first and dragged the course above 2.1yr sideways — §9). References on file (nimble-needles finished swatches). Rebecca/orchestrator verdict pending. |
| **seed / moss** (KNIT) | checkerboard faceSign (+1 where j+c even — k1 p1 every stitch AND course) + garter's corrugation applied per-stitch (§8d) | ◔ audit-clean (240/240; fine yr1.5 passes) first build 2026-07-11. Pure pull-side work on the existing machinery; stockinette/knitrib/garter PROVEN bit-identical via settled-geometry sha256 hashes pre/post (the rib-refactor verification). Seed's head-below has the opposite face (same relation as garter's course flip) so it NEEDS the corrugation — without it the legs initialise ~0.1yr from the head they pass (the documented garter failure). RENDERED 2026-07-11: reads as a genuine checkerboard of alternating popped bumps and recessed loops (the moss texture); each bump is a big rounded loop vs the reference's tight pebbles = the library-wide chunky weight character. Rebecca/orchestrator verdict pending. |
| **cable** (2×2 left cross / C4F, KNIT) | each cable stitch = a genuine loop through a below-head TWO columns away: legs at the mouth's own column (audited 'through'), diagonal travel to the head at the new column; front pair (+z layer) travels LEFT over the back pair (−z) — collision holds the crossover (§8d-shaping) | ◑ **audit-clean (240/240; fine yr1.5 passes), crossover HELD in data, look chunky-fair.** 2026-07-11/12 (Opus KNIT-DEPTH worker), TWO attempts under the new-topology cap: (1) proud +1.6yr travel + bowed slack — audit + probe clean (front +2.1yr / back −2.5yr at both crossings) but the diagonals read as loose ROPES lying on the fabric, surplus shoved neighbour columns into gaps; (2) snug ±1.35yr layers, straight approach, chord-hugging diagonals — audit 240/240, probe front +1.9/back −2.2 HELD, and the render now reads as a genuine chunky left-cross cable (front pair sweeping up-left over the held pair, correct C4F anatomy). Residual: crossing-region fabric stays somewhat disturbed and it reads as super-bulky arm-knit cable, not the reference's crisp fine rope — partly weight character, partly that real cables PULL IN laterally (x-compression) which the free-x relaxer doesn't reproduce. Cap reached; no purl gutters yet (would need a per-column face + ops combination — a follow-on). PANEL PASS 2026-07-12 (Opus worker, recipe/faceSign tier ONLY — crossing construction untouched): turned the isolated crossing into a real cable PANEL. Three recipe moves: (1) recessed PURL GUTTERS via a new `knitPurlCols` recipe field threading a per-column purl set into buildKnit's `faceSign` (the rib mechanism — constant −1 up the column, corrugation-free; locked stockinette/knitrib/garter verified BIT-IDENTICAL by settled-geo sha256), sinking 2-col reverse-stockinette valleys either side; (2) the cross REPEATS every 4 courses up the full height (j=3,7,11,15) → a braided rope column, not one isolated cross; (3) sized into a stockinette FIELD (W16×18: 4-col field | 2-col gutter | 4-col cable c6 | 2-col gutter | 4-col field). Audit 576/576 clean. Construction discovery (numbers-first, one variable at a time): even-course crosses at this width left the inner-back leg (c7) settling behind its head (dz −0.4..−0.8yr); crosses must sit on ODD courses so work direction s=+1 through the group matches the proven crossing — a recipe PLACEMENT fix, not a crossing-construction change. Render (gate 0.888): reads as a braided rope column with recessed gutters in a knit field — a real step from two isolated crossings on plain stockinette. Residual: the central rope stays congested/lumpy between crossings (real cables pull IN laterally; the free-x relaxer can't reproduce that compression, compounded across 4 stacked crossings) and the gutters read softer than the reference's crisp valleys — the below-recipe-tier lateral-compression limit, not another recipe tweak. Rebecca/orchestrator verdict pending. |
| **knitrib** (1×1 rib, KNIT) | per-COLUMN pull side (even cols +z, odd −z), constant up each column — a purl column is a knit column seen from behind (§8d) | ✅ **LOCKED 2026-07-11** (Rebecca). Audit-clean (240/240); columns settle cleanly alternating (+0.35..0.39 knit / −0.34..−0.41 purl → a real rib). Built on `buildKnit`'s per-(course,column) `faceSign` (stockinette + garter bit-identical). Reads as clear 1×1 rib — raised knit columns as vertical V-chains, recessed valleys FILLED with purl bumps. Chunkier than the fine reference = library-wide weight character. |
| **shell** (5 dc in one base) | SHELL_N dc fanned into one below-crown, balanced by skipped stitches → constant-width scallops (§8c) | ◔ audit-clean (65/65) — all 5 fanned dc genuinely hook the shared base. New shaped-builder ops `shell`/`skip`; dec/st/inc paths byte-identical (scinc/scdec unchanged). RENDERED 2026-07-11 (hero passed): the 5-post fans radiate clearly from single bases, stacked and alternating; more open/skeletal than the reference's packed scallops (2 shells/row at chunky weight). Rebecca verdict pending. PACK 2026-07-11 (Opus round-2): the fabric was skeletal (big holes, backing showing). Added a per-swatch `gaugeYr`+`rowScale` override to buildShaped (locked stitch gauge/height untouched); shell gauge 2.3→1.5, row pitch 0.72 pack the columns + rows so the fans nest and touch. Plus the openFabric backing fix (below). Audit 65/65. Render now reads as a dense scalloped fabric with the fans touching — the big holes closed, matching the reference's density (chunkier yarn character remains). Rebecca verdict pending. |
| **hdcinc/hdcdec/dcinc/dcdec** | the SAME shaped builder, taller posts — emitDecrease + the inc path are stitch-generic | ◔ all audit-clean with NO engine change (hdcinc 70/70, hdcdec 60/60, dcinc 52/52, dcdec 44/44). Confirms the shaping paths are genuinely stitch-agnostic. ALL FOUR RENDERED 2026-07-11 (gates 0.935 / 0.925 / 0.940 / 0.923): clean trapezoids, edge shaping legible (fanned inc pairs, converging tog gathers), no foundation lip, no fraying. dcinc's reference photo found + on file (knotions 2dc — was the last empty referenceUrl). Rebecca verdicts pending. |
| **basketweave** (fp/bp blocks) | 3-wide fp/bp blocks swapping every 2 rows, off the locked fpdc/bpdc | ◔ audit-clean (96/96); reference photo added 2026-07-10 (was the last blocker). RENDERED 2026-07-11 (gate 0.854): the 3-wide blocks + every-2-rows alternation are discernible in bands, but the woven over-under illusion is weaker than the reference — fp/bp block contrast reads subtle at this weight. Honest verdict: borderline; likely needs a contrast pass (deeper bp recess or shallower tilt) if Rebecca calls it short. CONTRAST PASS 2026-07-11 (Opus round-2): the block alternation barely read (uniform vertical posts). Added a per-swatch `postReliefScale` opt to buildContinuous (default 1 — locked fpdc/bpdc/postrib bit-identical, postrib re-audited 96/96); basketweave deepens the fp/bp relief 1.35× so raised blocks pop over recessed ones, and packs the columns (gauge 2.3→1.9) so the 3-wide blocks tile tight. Audit 96/96. Render: the raised/recessed checkerboard now reads — the over-under basket tiling is legible (chunkier than the fine reference = yarn weight). Rebecca verdict pending. |
| **vstitch** (2 dc in one st + skip) | the inc machinery IS the V — 2 dc fanned from one shared base, balanced by a skip, Vs stacking row on row | ◔ audit-clean (60/60) first build 2026-07-11. DEPICTION: the airier dictionary form is (dc, ch 1, dc) into the ch-SPACE below — chain-spaces are new-topology tier, so this is the solid 2-dc V variant (a real accepted form). RENDERED 2026-07-11: open dc lace with pairs fanning from shared bases — V identity present, less crisp than the ch-1 reference; the backing plane edge shows through the open fabric (cosmetic render sizing — worth a backing tweak for open fabrics). Rebecca verdict pending. CALM 2026-07-11 (Opus round-2): the tall dc posts sagged + tangled into an untidy mesh. rowScale 0.8 firms the Vs vertically + twist 0.1→0.05 cleans the ply columns, gauge left OPEN so the lace stays airy; plus the openFabric backing fix (the dark rectangles are gone). Audit 60/60. Render: clean Vs in an open diamond lattice matching the reference's crisp mesh. Rebecca verdict pending. |
| **crossed** (crossed dc) | new 'cross' ShapeOp: skip 1, dc in next, dc in the skipped st — the strand reaches forward then back, legs genuinely cross; the second-worked stitch takes fuller leg relief (1.4 vs 0.6) so collision resolves the X to a consistent z-order | ◔ audit-clean (60/60) first build 2026-07-11. RENDERED 2026-07-11: genuine X crossings visible; some pairs read as parallel slants rather than crisp symmetric Xs; more open than the reference. Rebecca verdict pending. X-STRENGTHEN 2026-07-11 (Opus round-2): the parallel-slant pairs were settling both posts on the SAME z-side. Deepen the front/back z-split at the crossing (leg relief 0.6/1.4 → 0.4/1.75) so the second post unambiguously crosses in FRONT; plus a moderate pack (gauge 1.9, rowScale 0.85) firms the fabric to the reference's small eyelets, and the openFabric backing fix. Audit 60/60. Render: clear consistent X crossings dominate every pair, in packed rows. Rebecca verdict pending. |
| **picot** (ch-3 nub on sc) | sc + a fed ch-3 loop over the head, closed by a SLIP STITCH that genuinely dives under the stitch's own crown (a recorded, audited hook); top-row edging placement | ◔ audit-clean (116/116 — 112 sc + 4 picot sl-sts) first build 2026-07-11. RENDERED 2026-07-11: four evenly-spaced nub loops stand along the top edge, folding back into the sl-st closure; matches the reference edging's open loopy character. Rebecca verdict pending. TIGHTEN 2026-07-11 (Opus round-2): the picots hung as long floppy dangling loops (fed 2.2yr tall, cw·0.55 wide — too much yarn). Feed less — a short 1.35yr nub, narrow (cw·0.3), sides converging to a point apex, sl-st drawn tight — so each stands as a short FIRM nub (perky-point character). Audit 116/116. Residual heaviness vs the reference's delicate points is the chunky yarn weight (library-wide). Rebecca verdict pending. |
| **garter** (KNIT) | stockinette loop + worked-face flip per course + per-course CORRUGATION (`bz = 0.7yr·fz`, gated — stockinette + rib untouched) | ◔ audit-clean (240/240) — the corrugation restores a full collision diameter between each leg crossing and the head it passes. Rendered 2026-07-10 (gate 0.954): the alternating ridge rows read clearly and the loops are tidy, but the fabric is TOO OPEN vs the reference (see-through gaps; real garter is dense packed bumps). Density is identity — needs a garter-specific gauge/courseH calibration pass. Rebecca confirmed NOT passing 2026-07-10. DENSITY CALIBRATED 2026-07-11 (Opus worker): the see-through was VERTICAL (dark gaps between courses); courseScale 0.7→0.65 + gaugeScale 0.85→0.95 (edge legs need sideways slack — every tight-both-ways combo failed the audit at c0/c11, and bz below 0.55 loses the through-clearance). Audit 240/240; re-render is solid fabric, gaps closed. Two limits logged: settled z-thickness (~5.7yr) is the corrugation model's own (does not shrink with bz), and the truly-packed reference bump look still needs the parked accordion. Rebecca verdict pending. |
| **mrdisc look** (addendum) | crownLay (heads lying flat) tried at lay=1 + deeper dive | Both look-attempts FAILED the audit (flat crowns lose interlock disambiguity in relax — 13/126 same-side) → reverted to proud crowns under the two-attempt cap; audit-clean again. The knotty look remains open; note the raffamusa ball reference shows real amigurumi fabric IS visibly bumpy per stitch — the sin is bump SCALE, not existence. The `crownLay` capability stays in the emitter (identity at 0) for the next attempt. |
| **ball** (3D SPHERE) | full amigurumi ball on the curved-surface machinery (§8c-3D) | ◔ **audit-clean (320/320)** — the first 3D object: MR pole anchor, 6-in-ring, canonical ±6 staggered rounds, equator 30, mirrored decs, fasten-off into the bottom pole. Rendered 2026-07-10 (gate 0.774): true spherical silhouette, sits on the table, and the LOWER hemisphere reads as shingled crochet rounds — but the top cap is a jumble of fat loops (the disc's same-face-rounds knottiness, worst at the crowded pole). CANOPY GENERALISED TO THE SPHERE 2026-07-11 (Opus worker): the flat disc's z-canopy became a RADIAL band (YarnModel.radialBand + radialCenter — distance-from-centre bounds, the normal on a sphere being radial-from-centre). Non-crown nodes get a ceiling (R + crownNz·0.65 → the crowded pole legs resolve INWARD toward the stuffing, not out between the Vs); crowns a floor at/below their built relief so the pole is NOT pushed off-surface (ballooning is the documented failure). Ceiling ≤0.55·crownNz drops an interlock; 0.65 is the clean tuck. Audit still 320/320. Rebecca verdict pending on the re-render. DENSITY + FRAMING PASS 2026-07-11 (Opus round-2): three fixes. (1) DENSITY — a `gaugeYr` override on buildSphere packs the stitches around each round; equatorCount 30→36 at gauge 1.5 holds the ball size (R = eq·sw/2π = 30·1.8 = 36·1.5 constant) so it densifies without shrinking or losing rounds. Meridian pitch stays at the row height — tying it to sw floated a round-2 inc hook 1.49yr up-meridian (the sphere's tangential packing comes from the count derivation, not the meridian). (2) POLE — analytic magic ring 1.15→0.85yr closes the open top-pole hole to a pinprick (pattern-driven balls via program.ts keep rrHoist, unchanged). (3) FRAMING — a per-recipe `viewMargin` (0.35) threaded through loom-stitch.ts frames the FULL silhouette the tilted camera was clipping. Audit 388/388 clean. Render: full sphere in frame, pole closed, denser packed spiral rounds — a clear step from the cropped/open-hole/coiled version. Residual = the same per-stitch bulbousness (pinecone texture vs the reference's smooth ball) = the exhausted relief lever. Rebecca verdict pending. |

**Regenerating / building a stitch — use THE PIPELINE (one command, gates built in):**
```
cd apps/web && npx tsx scripts/loom-stitch.ts <stitch> [yarnRadiusMm] [hex]
# e.g.  npx tsx scripts/loom-stitch.ts sc          (defaults: 2.4mm, terracotta)
# builds → numeric audit (HARD GATE) → Blender render → hero + fidelity gate →
# prints the report block. Run it in the background (renders take minutes);
# ONE Blender at a time. Then do the reference comparison and post links — see
# the loom-stitch skill (.claude/skills/loom-stitch/SKILL.md).
```
`scripts/loom-audit.ts` re-runs the numeric audit for every dictionary entry.
`scripts/loom-continuous.ts` builds just the scene (no gates) if you need it.
(Colour is a saturated stand-in — pale wool still washes white, §11, fix pending.)
The user CANNOT see Read-tool images in their client; show renders via clickable
markdown links to the PNG, relative to the working dir (`.loom-scratch/crochet/...`).

## 8a. The genuine topology (the method that works — use for every new stitch)

`dictionary → continuous strand (yarnPath) → relax (collision holds the interlock) → render → photoreal finish`

- **One strand, turned each row.** `dir` alternates (serpentine); the first worked
  row starts where the foundation ends (no float). `fz = ±1` flips the worked FACE
  each row (right side / wrong side) — relief on alternate faces, gentle (`z≈0.3yr`,
  `zh≈0.5yr`) so it's flat, not corrugated.
- **Real interlock.** Each stitch: down-leg → **hook under the crown below** (dive to
  the FAR z-side of that crown — computed per stitch so it works on either face) →
  up-leg → throw its own crown (the next row hooks it). Collision keeps linked loops
  linked. Only the foundation chain is pinned.
- **Height relaxes out.** A dc feeds a longer leg than an sc; firm bending (`k≈0.7`)
  + the `layoutK` blocked-flat y-pull stop the long post coiling, so it stands.
- **Gauge is per-stitch and calibrated to the reference photo** (`gaugeYr` in the
  dictionary: sc 1.8 dense, hdc 2.0, dc 2.3 leaning posts, tr/dtr 2.45 open
  channels, slst/posts 1.9). Density is identity — compare it FIRST.
- **Per-stitch features are "what the one strand does next"** (e.g. hdc's third loop
  is the start-of-stitch yarn-over laid across the head line).
- **Renderer** floats the fabric above the table (back-face rows go −z) and slips the
  backing just under the lowest stitch (auto, from min-z).

## 8b. Working on stitches in ANY session/model — the guardrails (2026-07-03)

The stitch library is built by many sessions, not all of them Fable. The process
is therefore enforced by tooling, not discipline:

- **The skill** — `.claude/skills/loom-stitch/SKILL.md` — is the per-stitch
  process: the two hard rules, the loop, banned moves, judgment guardrails,
  scope tiers per model, new-craft rules. Read it before touching a stitch.
- **The dictionary** — `engine/dictionary.ts` — is the single source of truth
  (topology params + full swatch recipe + reference URL + lock status). Adding a
  stitch = one `STITCHES` + one `SWATCH_RECIPES` entry + its excursion in
  `yarnPath.ts` with `StitchLink`s recorded. Nothing else.
- **The pipeline** — `scripts/loom-stitch.ts <stitch>` — chains build → numeric
  audit (hard gate: genuinely stitched or it stops) → render → hero + fidelity
  gate → report block. The mechanical steps cannot be skipped or reordered.
- **The verdict** — Rebecca's, always. The pipeline ends by demanding the
  reference comparison + both links; only her sign-off sets `status: 'locked'`.

Scope tiers (also in the skill): combination stitches (shell/V/picot/inc/dec)
are safe for careful non-Fable sessions; new-topology stitches (bobble family,
magic ring, cables) need the most care — two failed construction attempts in a
row means stop and write up, not churn. Mechanical re-renders are safe for any
model. Locked stitches are never reworked without Rebecca's ask.

---


## 8c. SHAPING — increases, decreases, rounds, magic ring (2026-07-06)

Built on two generalisations of the shared plain-stitch emitter (`emitPlainStitch`
in yarnPath.ts), both identity for a plain grid stitch (verified bit-identical):

- **`xCrown` vs `xHook`** — where the stitch's crown lands on ITS row's lattice vs
  where its hook reaches. An INCREASE = two full stitches hooking the same
  below-crown (legs genuinely fan from the shared base). A DECREASE
  (`emitDecrease`, st2tog) = down-leg hooks below-crown A, rises partway, dives
  under below-crown B, throws ONE crown above the pair — two real audited hooks.
- **`place`** — an optional fabric-frame transform (along-row, row-height) → world
  xy, z untouched. Identity flat; polar for rounds (arc length ↔ x, radius ↔ y).

Construction rules that the audit forced (all real, none cosmetic):
- **Turning chain EVERY row** in shaped fabric (ch 1 + turn — what a crocheter
  does). The grid builder survives with row-0 slack only because its reaches are
  symmetric; a shaped row's first reach is eccentric and the corner hook strangles.
- **An edge increase works its over-the-base stitch FIRST, then the flare** (the
  real order at a row edge), and **an inc pair's two hooks initialise side by
  side (±0.6·pw), never coincident** — coincident inits force collision to split
  them in an arbitrary direction and the corner hook gets expelled over the crown.
- **Rows own their lattice at FULL width**: each row's crowns sit on that row's
  even spacing, centred over the fabric below; the fabric takes the real width an
  inc row adds. (Clamping the edge slots to "support" the flare compressed
  0.45·sw per row per edge into the corner and the stacked incs buckled forward
  out of plane — see §9.) Hooks reach to whatever the ops consume (the cursor);
  a row's ops MUST consume exactly the row below (builder throws otherwise).

**Working in the round (buildRounds):** a continuous spiral, NO turn (fz never
flips — every round works the same face, which is why amigurumi fabric looks
different from flat rows; it falls out of the model). The MAGIC RING is the
anchor (the foundation-chain analog): a pre-tightened pinned loop of the same
strand; round 1's stitches genuinely hook AROUND the ring strand. Every round
starts at the ring-end phase so the yarn steps straight from the ring into round
1 (no float across the hole) and round starts stack into a true spiral. Radii:
ring 1.15yr; each round +1.05·row-pitch. The relaxer holds rounds at their
worked RADIUS (`layoutMode: 'radial'` — the blocked-flat pull, polar). The audit
measures link offsets in the FABRIC frame: for `frame: 'polar'` builds,
along-row = tangential, row-height = radial ("floated above its crown" on a
disc means radially outward — world-y is meaningless there).

## 8c-3D. CURVED SURFACES — the sphere (2026-07-10)

The 3D generalisation, proven on the amigurumi BALL (`buildSphere`, swatch
`ball`): the same continuous no-turn spiral as the disc, laid on a sphere.
320/320 interlocks hold in data. The machinery:

- **Local frames end-to-end.** `emitPlainStitch`/`emitDecrease` take `place3`
  (along-round, meridian, NORMAL → world — relief rides the surface normal, not
  global z) and `bcNormalZ` (the dive side must come from the crown's normal
  offset; global z is meaningless on a sphere). Both identity for flat work.
- **The stuffing pull** (`layoutMode: 'surface'`): full-strength hold along the
  local meridian tangent (each round at its worked latitude) + a WHISPER-soft
  (0.4×) pull on the normal component toward each node's own worked offset.
  The soft normal term is hoop-tension/stuffing: without it the free normal
  direction carries a BULK drift mode and the pole cap balloons off the surface
  (measured +0.58 → +1.98yr). Pulling toward each node's OWN offset preserves
  relative interlock relief; collision still wins locally. The model carries
  per-node meridian tangents (`YarnModel.meridian`) for the pull and the audit.
- **Audit in the surface frame** (`frame: 'surface'`): along-round = tangential,
  row-height = meridian (via the below node's tangent), hook side = the local
  normal ("did not get under its crown" = dn not clearly inward).
- **The pattern is the craft's pattern.** 6 sc in the ring (the geometric count
  overcrowds the pole), ±6 count change per round toward the profile target
  (profile-hugging put 7 incs in a 12-stitch round — density no pattern uses),
  shaping positions STAGGERED half a segment on alternate rounds (`roundOps`
  stagger — stacked inc columns bulge and lose pair-hooks), fasten-off spiralling
  into the bottom pole. Every one of these "pattern conventions" turned out to be
  load-bearing physics, found via failed audits.
- **Round-1 links are role 'ring'** — magic-ring wraps encircle the ring STRAND
  (a stem), exactly like fpdc wraps a post; a drawn-tight ring squashes the wrap
  to sub-diameter clearance, so the crown depth check is the wrong test. This is
  taxonomy (the role existed for posts), not a threshold change.
- A ~4k-node closed surface settles slower: 'surface' relax runs 520 iterations.

Next 3D: tube/cylinder (chain-ring anchor instead of MR), then real amigurumi
programs (ball+tube compositions) → the crochet pattern engine's 3D output.

## 8d. KNIT — the new craft on the same engine (2026-07-06)

`buildKnit` (knitPath.ts): weft knitting, one strand, cast-on pinned as the
anchor. Each stitch = a loop drawn THROUGH the loop below: two LEGS (the V of
the knit face) crossing the old head's mouth on the face side — recorded as
`'through'` links with a `zSign` (which z-side the leg must hold; the audit
checks it) — a HEAD laid a full layer back, and SINKER arcs connecting
neighbours low + behind. STOCKINETTE = no face flip (knit out, purl back = every
loop pulled to the same face). GARTER = the flip every course (`knitFlip`).

**1×1 RIB (`knitFace: 'rib'`, 2026-07-10):** a purl is a knit loop pulled to the
OTHER face; in rib you knit one column and purl the next all the way up (on the
turned WS course you purl the knits and knit the purls to keep each column
consistent). Reasoned through the fabric frame, each column therefore holds ONE
face for its whole height (even +z, odd −z), constant across courses — the pull
side is per-COLUMN, NOT per-course like garter. `buildKnit`'s course-level face
sign became a per-(course,column) `faceSign()` (stockinette=+1, garter=per-course
flip, rib=per-column); the cast-on is face-aware too (a purl column's anchor head
sits on +z so the first purl leg passes in front of it). Audit-clean 240/240;
stockinette + garter geometry bit-identical after the refactor. A purl column is
just a knit column seen from behind — the vertical rib is the two face families
side by side, and the sinker between a knit and a purl column genuinely crosses
front↔back.

**KNIT SHAPING — yo / k2tog / ssk (2026-07-11):** `buildKnit` takes an optional
per-(course,column) op function (`knitStitch` in the recipe); absent → every
stitch a plain `k` and stockinette/rib/garter stay bit-identical (re-audited).
- **yo (yarn-over)** — the strand passes OVER the needle with NOTHING below it:
  a fed OPEN loop (sides spread ±0.62·gauge), no `'through'` link recorded (a yo
  genuinely interlocks with nothing below — the open span under it is the
  eyelet). The next course draws through its head from above like any head.
- **k2tog / ssk (single decreases)** — one new loop drawn through TWO heads below
  together: two `'through'` links (both audited). The merged head lands on the
  stitch's OWN column while the gathered pair sits off-centre, so the lean
  EMERGES from the geometry — k2tog gathers head-below + LEFT neighbour (pair
  midpoint left of the on-column head → leans RIGHT); ssk gathers below + RIGHT
  → leans LEFT. Parking the head off-column instead dragged the next course's
  legs 2.1yr sideways (§9); on-column keeps the course above clean.
- A yo (makes 1, consumes 0) + a k2tog/ssk (makes 1, consumes 2) is
  width-neutral, so an eyelet course stays W wide — no variable-width machinery.
  `buildKnit` asserts every head below is consumed exactly once per course.
- **The eyelet does NOT open crisply at this density** (§9): the deterministic
  relaxer packs short knit stitches to uniform density and mesh tension can't
  hold a gap at swatch scale. The topology is genuine + audited; the LOOK is soft
  (the fed yo rings read as openings but not clean holes) — a density/crispness
  limit, deferred to the library-wide yarn pass, not a topology fix.
- **seed (moss)** — the fourth `KnitFace`: checkerboard faceSign (+1 where j+c
  even). Needs garter's corrugation applied per-stitch (its head-below is on the
  opposite face, garter's exact relation); the gate `garter || seed` leaves
  stockinette/rib at bz = 0 and garter per-course values unchanged (all three
  PROVEN bit-identical by settled-geometry hash).
- **cable (2×2 left cross)** — `knitCables: {j, c}[]` in the recipe. Each cable
  stitch is a loop through a below-head TWO columns away: legs pass the mouth at
  the below-head's own column (the same audited 'through' interlock), then
  travel diagonally to throw the head at the new column. Front pair = relative
  cols 0,1 drawing through +2 (diagonals travel LEFT on a proud +1.35yr layer —
  the visible left-cross slant); back pair = cols 2,3 through −2 (−1.35yr,
  behind). Init separation 2.7yr > the 2.5yr collision diameter keeps the
  crossover ordered; 3 interior nodes per diagonal (node-based collision);
  straight buried approach (slack surplus reads as loose surface ropes — §9).

The two lessons that made stockinette pass (see §9):
- **Fabric thickness is a real budget.** Stockinette is ~2 yarn diameters thick.
  Seeded thin (±0.6yr relief), every course's legs squeezed the course below's
  leg-tops backward and the cascade collapsed each course's crossings onto its
  own head plane (dz → 0 across the fabric; garter escaped only because
  alternating faces push opposite ways). Seed the real budget: legs +1.1yr,
  heads/sinkers −1.0yr — settles at dz ≈ 1.7yr everywhere, fabric ~2.5yr thick.
- **Route the yarn genuinely under the old head** between sinker (back) and leg
  (front) — that is where the strand really crosses purl-side → face-side.
  Without that node the sinker→leg kink pulls the crossing back through the
  head before collision can hold it.

---

## 8e. THE PATTERN PROGRAM LAYER — the seed of the pattern engine (2026-07-10)

`engine/program.ts` + `scripts/loom-program.ts`: ONE declarative pattern source
(`CrochetProgram`: stitch + form flat/disc/sphere + foundation/rows/rounds)
compiles three ways so they can never drift apart:

1. **GEOMETRY** — `compileProgram()` → the existing builders → the same audit
   gate → the render pipeline. The hero IS the pattern.
2. **WORDS** — `writeInstructions()` → the locked PATTERN-template text (UK
   terms via the internal-US → UK map, `[...] N times` repeats, every line
   ending in its `(N sts)` count). Proof output reads as a real publishable
   pattern ("Round 4: [dc in next 2 sts, 2 dc in next st] 6 times. (24 sts)").
3. **CHART** — `programFromChart()` recovers a program from the product's
   stored `ChartDefinition` shape (craft-charts/types.ts), deriving shaping
   from consecutive round/row counts by the same even-distribution convention
   real patterns use (roundOps). Single-stitch charts only for now; the first
   unmapped/mixed symbol THROWS rather than silently mis-building.

`buildSphere` takes explicit `patternCounts` (a pattern's own rounds) — and a
pattern then defines its OWN surface (`intrinsicProfile`): radius per round
from its count (circumference = count·gauge, like the disc), height from
meridian-pitch continuity, corners smoothed (two Chaikin passes = the stuffing
rounding the crease), arclength-parameterised so fabric length maps 1:1. This
is the true geometry of real patterns — a +6 cap is intrinsically a flat disc
and the ball look comes from stuffing; forcing pattern counts onto the rigid
analytic sphere compressed the cap ~20% and one pair-hook never settled. The
canonical 13-round human ball passes 294/294 on its intrinsic surface. Tube /
egg / bowl now fall out of the same primitive (a tube is just constant counts —
it still needs its chain-ring anchor for an OPEN top; MR-anchored closed forms
work today). The analytic sphere stays for derived-count balls (the proven
`ball` swatch path, untouched).

Proof suite: `npx tsx scripts/loom-program.ts` — disc, canonical 13-round ball,
dec trapezoid, and a ChartDefinition round-trip, each compiled + audit-gated +
written out.

**What the pattern engine builds on this next** (Opus-scale, the spine exists):
mixed stitches per row (builders already take per-op ids; the program type
holds one stitch for now), colourwork, tube/cylinder + composition (ball+tube →
real amigurumi), Studio integration (Studio authors programs; renderHero-style
publish step renders them), and the reverse map (program → ChartDefinition for
the interactive chart).

## 8e-1. CROCHET PATTERN ENGINE — build 1 (flat, 12 locked stitches, 2026-07-11)

Build 1 of ~2 turned a stored program into a rendered, chart-bearing,
self-heroing FLAT pattern on the twelve locked stitches. It sits entirely in a
new program/pattern layer + the schema; NO stitch-geometry file was touched.

- **Mixed stitches per row.** `CrochetProgram` gained a `'grid'` form: a
  fixed-width flat piece whose every row is a per-cell `StitchId[]` (`gridWidth`
  wide), compiled through `buildContinuous` + `stitchAt` — the proven mixed-stitch
  path (postrib/basketweave build exactly this way). `compileProgram` routes
  flat→buildShaped, grid→buildContinuous, disc/sphere as before. An optional
  `gaugeYr` packs post-rib columns (1.5, the locked value). Yarn weight →
  render `yr` via `YARN_WEIGHT_RADIUS_MM` (lace…super-bulky); one program renders
  fine/worsted/bulky by swapping it.
- **Program → ChartDefinition (forward).** `programToChart()` emits the product's
  stored chart shape (`craft-charts/types.ts`) from the SAME program — grid/flat
  rows or disc/sphere rounds, worked stitches as cells (inc/dec read from the
  changing per-row count). Pairs with the existing `programFromChart` (reverse).
- **Render-on-publish.** `engine/programScene.ts` = the pure core (compile →
  relax → audit gate → Blender scene JSON + a stable `geometryHash`).
  `scripts/loom-pattern.ts` = the CLI/engine (`renderProgram()`): audit → base
  render → fidelity-gated photoreal hero (falls back to the exact base without
  FAL_KEY). `scripts/render-pattern-on-publish.ts` loads a stored
  `CrochetPattern.loomProgram`, renders its OWN exact hero, persists it, and
  writes back the loom* fields + regenerated `chartData`/`rowsStructured`
  (idempotent by `geometryHash`). Build-time only (Blender/Fal on a worker box).
- **Schema.** `CrochetPattern` gained `loomProgram` (the executable stitch
  program) + `loomHero`/`loomRenderStatus`/`loomRenderedAt`/`loomFidelityScore`/
  `loomGeometryHash`/`loomYarnRadiusMm` (migration
  `20260926000000_phase_crochet_pattern_engine_001`). The loom hero is the
  exact-pattern render, tracked distinctly from the Fal img2img hero.
- **Proofs.** `scripts/loom-pattern-proofs.ts` — three Homemade-original flat
  patterns across a complexity range (stripe dishcloth → 1×1 post-rib headband →
  texture sampler), all audit-clean, all locked stitches.
- **OUT (build 2 / later):** round/amigurumi composition, stranded/intarsia
  colourwork topology, knit patterns, the Studio "design your own" UI. Colour is
  stored on the program/schema now (no backfill) but the base render is
  single-colour — stripe/colourwork rendering is the next build.

## 8e-2. CROCHET PATTERN ENGINE — build 2 (2026-07-12)

Turns the program+render engine into one that produces customer-grade
finished-object HERO images. Three parts, each build → audit → render → judge
vs a real reference → commit + push.

- **Part A — COLOUR / stripe rendering (DONE 2026-07-12).** The program layer
  already expressed per-row colour (`GridRow.colourKey` + program `palette` /
  `rowColours`); now the RENDER shows it. Mechanism (render-only — NO geometry
  touched, geometryHash unchanged, single-colour programs bit-identical):
  1. `buildContinuous` now returns a `nodeRow: number[]` (parallel to
     `model.nodes`; -1 for the pinned foundation), captured from the node-index
     range each worked row pushes. Only the grid/flat-row builder populates it.
  2. `programScene` smooths + plies the ONE continuous strand exactly as before
     (so the twist runs unbroken across the whole piece), then `colourStrokes`
     cuts each ply polyline into maximal same-colour runs — one Blender curve
     per colour, which `build_yarn` already groups by hex into its own material.
     A 2-sample overlap at every colour boundary closes the seam; the boundary
     lands at the selvedge (where a real crocheter changes yarn), so it's clean.
  3. `rowColourResolver` maps a smoothed-centre sample → its control point → its
     strand node → row (via `nodeRow`) → colour. Anchor rows take the first
     worked row's colour so the cast-on edge matches the bottom stripe.
  Proof: `stripe-dishcloth` now carries two-row coral/teal contrast bands
  (palette + per-`GridRow` colourKey). Audit clean (126/126, hash 79f6a541);
  hero passed the fidelity gate. Reads as a genuine two-colour striped crochet
  fabric — distinct yarn colours, clean stripe boundaries — vs the woodsandwool
  modern-stripe reference (finer/tighter cotton; mine chunkier + more open =
  the documented library-wide density/roving softness, not a colour issue). The
  program-render background also moved to a clean off-white `#efece6` (the
  finished-object bar's white ground); the Fal hero cleans it to white.
- **Part B — round/amigurumi composition + PROTRUDING LIMBS (2026-07-12).** The
  composition layer stacks audit-gated balls into one staged object; the staged
  BALL was already customer-grade, but attached parts (ears) placed by centred
  overlap read as SUNK SWIRLS — a limb needs to stand proud as a 3-D form. Fixed
  with a **directional attach** (composition-layer only; the locked round builders
  are untouched): a new `{ on, dir, seat }` placement rotates a part so its long
  (pole-to-pole) axis points along `dir` (Rodrigues, `rotZTo` maps local +z → the
  outward unit vector), then seats only its base pole `seat` mm into the parent
  surface (parent half-extent along `dir`, ellipsoid approx) so the rest stands
  off the body. The transform is now `world = T + scale·R·(local − centre)` (R = I
  for ground/overlap). The proof creature is a bunny/bear: `body` (eq-30 ball) +
  `head` (eq-24 ball, overlap-stacked) + two `ear`s — an elongated tapered tube
  `[6,12,12,12,12,12,10,8,6]` (aspect ~1.5, audit-clean; slimmer eq-10 profiles
  FAIL the interlock gate) attached with `dir {±0.5, 0.14, 1}` (up, out, slightly
  back), `seat 6`. Probe: each ear stands ~28 mm proud of the head top and splays
  past the head silhouette. Audit clean (hash bc1c39d1). RENDERED (base): two
  darker ears stand clearly proud above the body as genuine 3-D forms with depth +
  cast shadow — reads as a two-eared amigurumi, no longer sunk swirls. Residual =
  the ear tips show the small magic-ring spiral (reads as the ear crown), and the
  per-stitch roving softness (library-wide) keeps the fabric chunkier than a smooth
  reference. Orientation tuning (which pole faces out, lean angle) is a design knob
  on the proof, not the engine.  Rebecca/orchestrator verdict pending.
- **Part B addendum — THE BEAR: a figure a customer recognises (2026-09-05).**
  Part B's creature passed every gate and still failed the fourth part of the
  customer bar: beside a real amigurumi bear it read as "a ball with two swirl
  discs on top", not an animal. Three separate causes, all in the COMPOSITION
  and STAGING layers — the locked round builders were not touched and the ball /
  creature hashes are unchanged (22357568 / 18b2f935).
  1. **The camera was nearly overhead.** `tiltDeg` is measured OFF STRAIGHT
     DOWN, and the compositions used 18–22 — a plan view of the crown of the
     piece. A toy is photographed from just above its own eye level, so a figure
     wants ~74. Three additive view knobs make that a real product shot
     (all default to the old behaviour, so every existing render is unchanged):
     `yawDeg` (swing round for the three-quarter angle), `aimHeightFrac` (aim up
     the object instead of at the table under it), `distScale`/`groundScale`, and
     `lightRig: 'product'` — the flat-fabric rig keys LOW from the far side,
     which back-lights a standing figure into a silhouette; the product rig keys
     high from the camera's left and fills from its right.
  2. **The ring pole faced the camera.** A limb is aimed by rotating its local +z
     (the MAGIC-RING pole) onto the attach direction, so the ring spiral ended
     up as the outward face — the "swirl disc" read. `poleIn: true` seats the
     ring pole INTO the parent instead, so the join hides it and the smooth
     fasten-off end faces out. Also new: `aim` (which way the piece points,
     separate from `dir` = where it is sewn on — a real arm joins at the
     shoulder and hangs down-forward; one direction cannot say both),
     `surfaceFit: 'ellipsoid'` (the exact ray/ellipsoid radius instead of the
     half-extent sum, which over-estimates on a diagonal by ~20% and made every
     `seat` a per-part guess), and a post-seat `offset` (drop a leg onto the
     table). Defaults reproduce the old placement arithmetic exactly.
  3. **A pattern shape is a CHOICE OF ROUND COUNTS, and the counts were wrong for
     a head.** `intrinsicProfile` derives radius from the count and height from
     meridian pitch, so a short count plateau settles OBLATE: the old
     `[6,12,18,24,24,18,12,6]` head is 31 mm wide × 14 mm tall — a pancake, which
     is why body and head merged into one ball. Measured h/w across the family
     (audit-clean ones only): eq-24 needs a SEVEN-round plateau to reach h/w 1.03
     (33.7 × 34.5, a genuinely round head); eq-30 with a five-round plateau is
     41 × 30 (a broad sitting body). Sizing an amigurumi part is a numeric probe,
     not a guess — and not every plateau length passes the interlock gate
     (eq-18 p5/p7/p9, eq-24 p5 and eq-30 p7 all FAIL).
  **The `props` layer (non-yarn notions).** A bear with no eyes or nose is not a
  bear, and eyes are not stitches — a real pattern lists "2 × 9 mm safety eyes"
  in its NOTIONS, next to the yarn. So the composition program gained
  `props: CompositionProp[]`: a moulded primitive seated on a crocheted part's
  surface exactly the way a limb is (`dir` + `seat`, `flatten`/`widen` for an
  oblate nose), resolved in `compileComposition` into a world centre plus three
  semi-axis VECTORS, and rendered by a new `build_props` block in
  `loom_render_crochet.py` as a smooth ellipsoid with a glossy plastic material.
  This is NOT faking a stitch — it renders the plastic part as plastic. Props sit
  outside the geometry hash and outside the audit (they carry no yarn), and the
  scene JSON omits the key entirely when a composition has none, so every
  existing render is bit-identical.
  **The bear itself** (`amigurumi-bear`, hash 70fc5299, 13 parts + 3 props, audit
  clean): body `[6,12,18,24,30,30,30,30,30,30,24,18,12,6]`, head `[6,12,18,24,
  24,24,24,24,24,24,24,18,12,6]` overlap-seated 9 mm into it, a cream muzzle,
  two ears on the top-back with `poleIn`, two arms sewn high at the shoulder and
  aimed down-forward, two legs sewn low at the front and aimed FORWARD along the
  table (settled minz 0.0 — it genuinely sits), cream paw pads on all four limbs,
  plus two glossy black safety eyes and an oblate nose. Settled size 59 × 57 ×
  60 mm. Variants `amigurumi-bear-plain` (no paw pads, arms lower) and
  `amigurumi-bear-mirror` (built facing the other way — the staging control that
  proves which way the camera looks at the composed world: FRONT IS +y, because
  the renderer maps blender-y = −loom-y and the camera sits at −blender-y).
  `amigurumi-creature` is left in place unchanged.
  **RENDERED (Fargate, the props image build first).** All three PASS the
  fidelity/structure gate — `amigurumi-bear` 0.923, `-plain` 0.911, `-mirror`
  0.915 (STRUCT_MIN 0.45), so the Fal step finished the exact deterministic
  render without inventing anything. The bear reads as a sitting crocheted
  teddy: round head over a broad body, two ears, glossy safety eyes, a cream
  muzzle with a nose, arms out to the sides and legs forward on the table, all
  in visibly real single-crochet spirals. `-plain` (no paw pads) reads WORSE —
  without the cream contrast the limbs merge into the body — which is the
  answer to whether the second colour earns its place. `-mirror` shows the
  bear's back, confirming the camera axis (front is +y) as designed.
  Second pass (staging/props only, geometry hash unchanged at 70fc5299): the
  first nose was 12 mm across on a 17 mm muzzle and mirror-glossy, reading as a
  plastic bead rather than a nose — shrunk and matted; and the ground rendered
  a shade grey at this low camera, so `bgHex`/`light`/`exposure` are now
  pass-throughs on the composition program (the renderer already read them; no
  render-script change, so no image rebuild).
  **ROUND 2 — the neck, the ears, the notions and the head turn (2026-09-05).**
  Beside a real styled amigurumi photo the round-1 bear read as a sitting teddy
  (the win) with four named defects. All four fixes are again COMPOSITION and
  STAGING only — no round builder, no relaxer, no render script was touched, so
  `amigurumi-ball` stays 22357568 and `amigurumi-creature` 18b2f935; the bear's
  own hash moves 70fc5299 -> 8b9b32cf because its ASSEMBLY changed.
  1. **A NECK — measured, not eyeballed.** Round 1 seated the head 9 mm into the
     body and the two balls merged into one loaf. The test is numeric: slice the
     body+neck+head control points every 1.5 mm and take the widest radius per
     slice, then read the narrowest slice between the body's widest and the
     head's middle as a percentage of the head width. Two constructions were
     built and probed (the two-attempt cap):
     - `neck: 'perch'` — no extra piece, head overlap dropped 9 -> 2 mm so the
       two balls are near-tangent. Waist **25.1 mm = 74% of the head width**.
       The silhouette does step in, but only by a quarter.
     - `neck: 'tube'` — a short narrow crocheted neck (`[6,12,12,6]`, eq-12,
       17 x 11 mm, scale 0.85 -> 14.6 mm wide) sunk 6 mm into the body's crown
       with the head then stacked on IT (overlap 2). Waist **14.5 mm = 43% of
       the head width**, holding across z 28.5-32. That is a real neck: the
       head is more than twice the width of its own join.
     A crocheted amigurumi neck is a PART, not a seating value — seating alone
     cannot make the join narrower than the two spheres' own tangent circle.
  2. **The ears had to STAND OFF, not just be big.** Round 1's ears were already
     47% of the head width and still read as two bumps, because they sat on the
     top-BACK of the crown and 5 of their 11.5 mm were seated inside the head.
     Moved to the SIDES of the crown (`dir` x +-0.95, z 0.95), leaned forward by
     a separate `aim`, and seated only 3.5 mm. Probe (projecting both ears and
     the head into the actual camera plane): **31% of each ear now falls outside
     the head's silhouette, tips 5.0-5.4 mm past the head edge**, symmetric
     left/right. `-bigear` (ear scale 1.12) takes that to 44% and 8 mm.
  3. **The FACE is turned to the camera; the BODY is not.** The camera yaws 26
     deg round the object for the three-quarter body, so a muzzle aimed straight
     down the bear's own +y presents at 26 deg to the lens and the far ear hides
     behind the crown. `faceDir` rotates every FACE feature's attach direction
     (muzzle, both eyes, both ears) back through the same 26 deg about z — a
     HEAD TURN. Probe: muzzle-to-lens cos 0.875 (the remaining 0.125 is the
     muzzle's deliberate 12 deg downward tip against the camera's 16 deg
     elevation), and the two ears project symmetrically. The limbs are
     deliberately NOT rotated: they belong to the body's three-quarter angle.
  4. **The notions are the size real notions are.** Round 1's safety eyes were
     8 mm across on a 34 mm head (23% of the head width) and rendered as grey
     glass marbles — a big smooth glossy sphere mirrors the whole white sweep
     back at the lens, and the grey IS the sweep. Real safety eyes are ~10% of
     the head width: 3.4 mm here (`-bigear` samples 4.4 mm at lower gloss). At
     that size the environment reflection collapses to a single highlight.
     Seating rule found: a notion's `seat` is measured against the strand
     CENTRE-LINE hull and the rendered yarn stands ~1.8 mm proud of it, so
     seating a safety eye by MINUS its own radius puts its equator at the wool
     surface and the whole dome proud — which is where a real safety eye sits
     once the shank is through the fabric. Nose likewise 12 mm -> 5.3 mm across
     and satin (gloss 0.4) instead of wet-look. No render-script change, so no
     image rebuild.
  Also in round 2: the arms now hang down the sides (joined higher at the
  shoulder, aimed down/out/forward) instead of splaying sideways, and each
  carries a +0.5 mm z nudge — without it the paw pad on a hanging arm reached
  1.2 mm BELOW the table, and the renderer floats the whole piece up to clear
  its lowest point, which lifted the legs off the ground. `marginFactor` 0.30 ->
  0.38 so the whole toy has room. Settled size 44 x 57 x 71 mm, minz 0.00 (it
  genuinely sits). All three variants audit clean.
  **RENDERED (Fargate, one concurrent batch of three; no render-script change,
  so no image rebuild).** All three PASS the fidelity/structure gate —
  `amigurumi-bear` 0.903, `-perch` 0.904, `-bigear` 0.910 (STRUCT_MIN 0.45) —
  so the Fal step finished the exact deterministic render without inventing
  anything. Face close-ups (`*-face.png`) are a centre-top 46% crop of each
  hero. What the renders show against the round-1 hero: both ears are now
  clearly in the silhouette and read as ears rather than crown bumps; the face
  meets the lens; the head/body join reads as a join rather than a loaf, most
  strongly on the two `tube` variants (`-perch`'s waist is visible but soft,
  which is what its 74% number predicted); and the safety eyes read as small
  beads instead of glass marbles. HONEST RESIDUALS, both for the orchestrator's
  verdict, not fixed here:
  - The eyes still render mid-DARK-GREY rather than pure black. Shrinking them
    removed the marble read but not the cause: `prop_material` in
    `loom_render_crochet.py` drives Roughness, Specular IOR Level AND Coat
    Weight from the single `gloss` value, so a glossy notion necessarily carries
    a strong clearcoat that mirrors the white sweep. The next lever is to
    decouple them (low roughness for a tight highlight, low coat for a dark
    body) — a render-script change, so it costs an image rebuild and was not
    taken on this pass.
  - The arms read faintly: joined at the shoulder and hanging down the side,
    they sit against the body in the same colour, so only the cream paw pads
    really separate them. A held-out-from-the-body arm angle, or contrast
    higher up the limb, is the open direction.
- **Part C — finished-object HERO staging across all forms (2026-07-12).** The
  four-part customer bar (correct genuinely-stitched stitches / real yarn colour on
  clean white / whole piece at size / staged as the finished object) for EVERY
  proof form. Before this, the flat proofs rendered as tight MACRO CROPS of the
  fabric — a stitch swatch, not a finished object. Added a `Staging` mode
  (`swatch` | `flatlay` | `loop`) threaded programScene → renderProgram → the CLI
  (per-proof map + `--staging=` override; render-only, no geometry, no schema
  change — the default `swatch` is bit-identical to the prior view):
  - `flatlay` — the WHOLE piece pulled back on the clean off-white ground, gentle
    3/4 tilt (15°) + soft drape, so it reads as a finished dishcloth / panel laid
    out. `stripe-dishcloth` hero (gate 0.925) + `texture-sampler-panel` hero (gate
    0.874) both PASS. The finished-object framing initially read OPEN/mesh — FIXED
    in the FLAT-DENSITY PASS below.
  - `loop` — the flat strip curled into a standing RING (`loopStrip`): the strip's
    long axis wraps to circumference, the short axis stands up Z as the band height,
    stitch relief rides the outward radial normal — a short ribbed cylinder standing
    on the table (a headband seamed into a loop). Two earlier mappings failed and
    are logged (flat coiled disc; radial sunburst); the standing-Z cylinder reads
    right. Needed the proof re-shaped LONG + THIN (52 sts × 4 rows) so there's a real
    central hole. `post-rib-headband` hero (gate 0.933) PASS — a standing ribbed
    loop. Honest residual: ribs read openwork/basket-ish, not a dense snug headband
    (same density residual, mildly amplified by the wrap).
    LOWERED-CAMERA REVISIT (2026-09-05, §8e-3): at a customer eye the standing
    loop read as a cuff or basket, and the far rim showed through past the
    near wall — camera-only fix, `loopStrip` geometry untouched. The Blender
    camera's height falls as `cos(tiltDeg)` at a roughly fixed distance
    (`loom_render_crochet.py`, untouched), so raising `tiltDeg` is a genuinely
    LOWER, more grazing camera nearer the ring's own eye level. Swept three
    values (each rendered + fidelity-gated, hash `e482eb7a` unchanged
    throughout — camera-only): 65° still let the far inner wall show through
    the open top (see-through NOT fixed); 82° (tighter `marginFactor` 0.3) hid
    the interior completely but cropped so close the loop/hole was no longer
    legible at all — reads as a solid drum, arguably less like a headband;
    **74° / `marginFactor` 0.4 (kept)** — no interior/far-wall visible through
    the top (the specific "see-through" defect is fixed) while the rim edge
    still reads as an open loop. Gate 0.921. The alternative considered (fold
    the strip flat into a `flatband` loop, "seam side down, two layers
    overlapping") was set aside on reasoning alone: with this proof's band
    height (~47mm) close to its own loop diameter (~61mm), laying the band
    width in-plane radially would put a fold radius near half the diameter —
    the same "band width in-plane" geometry that produced the two
    already-failed flat/radial loop mappings logged just above (reads as a
    filled disc, not a ribbon with a hole), so it was not attempted. Honest
    residual: the object's own proportions (band height close to its diameter)
    read as a squat drum/cuff from most angles regardless of camera — a real
    fix needs a THINNER band relative to its loop (a geometry/row-count
    change, out of scope here). Verdict pending — see the render report.
  - amigurumi (3-D) already stages itself via `compositionScene`; the creature hero
    (gate 0.920) and the ball are customer-grade.
  Every hero PASSES the fidelity/structure gate (all ≥ 0.874 ≫ STRUCT_MIN 0.45),
  confirming the Fal photoreal step finished the exact render without inventing
  stitches.

- **Part D — FLAT-FABRIC DENSITY PASS (2026-07-12).** The build-2 flatlay/loop
  heroes read as OPEN MESH — the orchestrator's hypothesis was an over-spaced grid
  ROW PITCH scaling wrong with stitch height. NUMBERS SAID OTHERWISE (numbers
  before theories, §9): dumped settled per-row Y for the grids vs the single-stitch
  swatches — the grid row pitch is BIT-FOR-BIT the swatch pitch (dc grid rows
  4.95yr vs the dc swatch's 4.96yr) and vertical course-to-course coverage is 0%
  gap at any tube radius. Row pitch was never the lever. Two real levers, both
  render/recipe (no geometry, no locked stitch touched, audit + geometryHash
  unchanged):
  1. **Yarn thickness (the root cause).** `programScene` plied the strand at
     `yr*0.62` — a value that PREDATED the crisp-plied-yarn pass (§11, commit
     e2de4fb6, ~12 h later) which moved the SWATCH call sites to `yr*0.85` and
     missed programScene. So the SAME grid geometry that reads dense in a swatch
     was rendered 27% thinner here, opening the between-post channels that are
     widest on the tall stitches. Measured AREAL front-face coverage (solid↔mesh):
     tr swatch 87.2%→99.7%, dc swatch 94.4%→100%, texture-sampler 96.2%→99.5%,
     dishcloth 99.6%→100%, headband 98.6%→99.9%, all at `yr*0.85`. Fixed
     programScene → `yr*0.85` (matches the swatch + §11). The amigurumi/composition
     path (`composition.ts`, still `0.62`, judged fine) is a SEPARATE renderer and
     was left untouched — the ball re-rendered bit-identical (hash 22357568, gate
     0.921). Render-only, geometryHash unchanged (dishcloth 79f6a541).
  2. **Grid column pack for a post-containing panel.** The texture-sampler mixes
     plain bands with a front/back POST-RIB band; at the grid default gauge (1.8,
     row 0's sc) the plain bands were solid but the panel could pack tighter. Set
     the sampler `gaugeYr: 1.6` — the tightest AUDIT-CLEAN value (1.5 fails the
     interlock gate) — plain bands go fully solid (between-post gap 0.11yr→−0.05yr)
     and the post-rib band packs (max window 0.88yr→0.54yr). Same lever the locked
     postrib swatch + headband proof use (1.5).
  Result: `stripe-dishcloth` reads as solid striped fabric, `post-rib-headband` as
  a dense snug ribbed loop, and the `texture-sampler` plain bands (sc/hdc/dc/blo,
  the top ~55%) are solid. HONEST RESIDUAL (two-attempt cap reached): the
  sampler's post-rib band still reads as an open ladder in this flat, few-row,
  top-down (15°) finished-object staging — the proud fpdc/bpdc post bars show
  inter-post background at the tilt, and a gauge sweep confirmed no viable value
  closes it (tighter breaks the audit; wider opens everything, post-band gap
  variance ~0.29yr at every gauge). The headband proves the SAME post-rib reads
  snug as a whole object (aran, curled face-on) — so it's the intrinsic
  post-stitch-in-flat-sampler-at-tilt limit + locked post geometry, not row
  density. Rebecca/orchestrator verdict pending.

## 8e-3. THE SIX-SAMPLE SIGN-OFF SET (2026-07-12)

The finished-object sign-off set the orchestrator packages for Rebecca's
quality-bar lock — six real, complete patterns spanning the full complexity
range ([[feedback_pattern_complexity_range]]), each rendered as a customer-grade
finished-object hero. All are program proofs (`scripts/loom-pattern-proofs.ts` +
`loom-composition-proofs.ts`), all audit-clean, every hero PASSED the
fidelity/structure gate (0.90–0.937 ≫ STRUCT_MIN 0.45 — the Fal step finished
the exact deterministic render, no invented stitches).

**New engine capability — PER-CELL (tapestry) colour (render-only, additive).**
Colour was per-ROW (stripes: `nodeRow` → `rowColourResolver`). Added a per-node
COLUMN map (`buildContinuous` now emits `nodeCol` alongside `nodeRow` from
recorded per-stitch spans) + `GridRow.cellColours[]` + a `cellColourResolver` in
`programScene` that resolves a colour per (row, column) CELL and cuts the one
continuous strand into per-colour runs (the existing `colourStrokes` path). This
is what lets a tapestry motif change colour WITHIN a row. Nothing in
relax/audit/geometryHash reads `nodeCol`, so single-colour + per-row-stripe
programs are BIT-IDENTICAL (verified: stripe-dishcloth 79f6a541, amigurumi-ball
22357568, unchanged from before the change).

| # | Sample | Range point | hash | gate | Honest verdict |
|---|--------|-------------|------|------|----------------|
| 1 | `simple-coaster` (solid sc square) | dead simple | 8fedd4c9 | 0.937 | ✅ customer-grade — dense solid single-crochet coaster, clean rows on white. The plainest end. |
| 2 | `stripe-dishcloth` (2-colour sc/hdc bands) | flat colourwork | 79f6a541 | 0.922 | ✅ customer-grade — genuine two-colour striped dishcloth, clean stripe boundaries. |
| 3 | `flat-texture-panel` (sc/hdc/dc/blo/flo bands) | flat texture | a36dacd7 | 0.901 | ✅ customer-grade — one-colour textured sampler, raised blo/flo ridge lines, solid throughout. NO post stitches (the derived rule: posts read open on a flat panel — they live on the worn/looped form). |
| 4 | `post-rib-headband` (1×1 fp/bp rib, looped) | worn item | e482eb7a | 0.924 | ✅ customer-grade — ribbed band seamed into a standing loop, vertical post ribs round the circumference. Correctly showcases post-rib on a curved/worn form. Residual: ribs read slightly openwork (documented). |
| 5a | `amigurumi-ball` (stuffed sc sphere) | amigurumi | 22357568 | 0.920 | ✅ customer-grade — stuffed crochet ball, clean spiral rounds from a tidy magic-ring centre. Chunkier per-stitch bumps than a fine reference (documented bulbousness residual), but unmistakably a real crocheted ball. |
| 5b | `amigurumi-creature` (body+head+2 ears) | amigurumi (multi-part) | 18b2f935 | 0.914 | ◑ reads as a two-eared stuffed amigurumi (genuine dense sc body, two proud ears) but the ear TIPS show the magic-ring swirl (documented "ear crown") + the ears read bulky. Borderline — the ball is the cleaner amigurumi. |
| 6 | `cottage-tapestry` (24×24 sc, 15 colours) | SHOWPIECE | a627f243 | 0.929 | ✅ customer-grade tapestry piece — a cottage-garden PICTURE (sky+sun, tree, cottage w/ roof/chimney/door/windows, grass+flowers). Reads exactly as real tapestry crochet (colour-block per stitch, cf. the lillabjorncrochet cushion reference); chunkier weight than a fine cotton reference. |

**Showpiece colour ceiling — the honest maximum.** `cottage-tapestry` carries
FIFTEEN distinct yarn colours, all resolving cleanly per-cell, the picture
legible. There is no hard colour-count wall in the engine — `colourStrokes`
groups the strand into one Blender curve set per distinct hex, so the count is
bounded only by render cost, not correctness. The honest LIMITS are: (a) the
motif must be drawn at the fabric's stitch resolution (a 24×24 grid = a bold
pixel picture, not photographic detail — finer pictures need more stitches =
more render time); (b) the library-wide chunky-weight/roving softness makes the
stitch Vs bigger than a fine-cotton reference; (c) a mid-row colour change cuts
the tube and re-colours (the render doesn't model the carried non-working yarn
inside the stitch — invisible on the front face, which is what a tapestry shows).
None of these is a topology or colour-count wall; the many-colour case is proven.

**References used for the customer comparison** (external, linked for calibration
only — never shipped): tapestry crochet cushion —
https://www.lillabjorncrochet.com/2016/07/how-to-do-tapestry-crochet-step-by-step.html ;
amigurumi ball — https://ribbelmonster.us/amigurumi-crochet-simple-small-ball/ .

**SIZE CONSISTENCY — a real audit gate (2026-09-05).** The hero must be the
exact pattern, so its declared `finishedSizeMm` must be true, not aspirational.
Two flat proofs (`simple-coaster`, `stripe-dishcloth`) rendered as landscape
RECTANGLES under a "square" declared size: too few rows for their stitch count
(sc/hdc rows are shorter than sc/hdc stitches are wide at this engine's
gauge/row-pitch), so a same-count grid settles wider than tall. Added a SIZE
CONSISTENCY check to the audit path (`compileRelaxAudit` in
`engine/programScene.ts` → `problems[]`, a real gate — a program with a
size-consistency problem does NOT render): `settledSizeMm()` measures the
RELAXED geometry's x/y extent, excluding the pinned foundation/anchor
(`built.anchorPins` leading nodes), and compares it against the program's
`finishedSizeMm` when declared; either axis off by more than ±12% is a problem,
reported as `declared W×Hmm but settled w×hmm`. Render/audit-only — no
relax/dictionary/geometry change, so every locked stitch's geometry hash and
every UNCHANGED proof's geometry hash stayed bit-identical
(`loom-geom-hash.ts` + `loom-audit.ts` before/after, diff clean).
- `simple-coaster`: 14×12 (settled ~52×40mm, nowhere near its own already
  non-square declared 100×90mm) → **26×30** (settled ~98×99mm) — a true 10×10cm
  coaster, declared 100×100mm. Hash `8fedd4c9` → `05ca93b7`.
- `stripe-dishcloth`: 14×12 (settled ~52×48mm vs declared 250×250mm) →
  **53×50** (settled ~200×201mm). A true 25cm dishcloth needs ~66×63 sts
  (~4,100 stitches) — too many to render sensibly in one batch pass, so this
  scales to a true 20×20cm dishcloth instead, declared 200×200mm; the 25
  colour bands (odd count) keep the first-and-last-band-match look. Hash
  `79f6a541` → `f2a840c7`.
- The gate also caught `post-rib-headband`'s declared 480×90mm against its own
  settled ~191×47mm (a pre-existing mismatch, not this session's regression) —
  fixed as a METADATA-only correction (declared → 190×48mm; the geometry, and
  so its hash `e482eb7a`, is unchanged) so the new gate doesn't block its
  render. `texture-sampler-panel`, `flat-texture-panel` and `cottage-tapestry`
  carry the SAME kind of declared-vs-settled gap (declared assumed a
  real-world gauge this engine's mm scale doesn't produce — a library-wide
  characteristic, not specific to any one proof) and now fail the gate too;
  left alone as out of scope for this session (their row/stitch counts are
  unchanged, hashes unchanged) — flagged for a follow-up size/gauge-text pass.

## 8f. CLOSE-RANGE LOOK PASS — the fabric was cut at 0.66× real size (2026-09-05)

The locked stitches pass at whole-object scale and FAIL close-up. Rebecca's
close-up comparison: ours reads as a row of fat coils under a thick proud cord;
a real worsted-cotton sc dishcloth is a flat tidy grid of small paired-loop tops
with pinprick holes, the fabric about two yarn diameters thick and the stitches
barely wider than the yarn. She reopened the locked stitches to fix it properly.
This section is `sc` only — the workhorse — with the lever designed to generalise.

### The unit: RENDERED yarn diameters

Everything below is in **d = 1.7·yr**, not 2·yr. Every render call site plies the
strand to a target OUTER radius of `yr*0.85` (§11's crisp-ply recipe), so the yarn
a viewer actually SEES is 1.7·yr across. Comparing our fabric with a photograph
means comparing stitch size to the yarn you can see, so that is what every
published gauge figure gets converted into. Reporting in 2·yr flatters us by 18%.

### The real-world targets (worsted / CYC 4 cotton, d ≈ 4.2 mm)

| quantity | real figure | in d |
|---|---|---|
| stitch pitch | 14–16 sc / 10 cm → 6.3–7.1 mm | **1.49–1.70** |
| row pitch | 16–18 rows / 10 cm → 5.6–6.3 mm | **1.33–1.49** |
| yarn per stitch | ~3–4 m per 100 sc → 3.0–4.0 cm | **7.0–9.5** |
| crowding (yarn length ÷ cell area) | derived from the two above | **2.8–4.8** |
| fabric thickness | ≈ 2 yarn diameters | **1.8–2.2** |
| crown proud of the fabric | top loops lie nearly flat | **< 0.5** |

They live in `scripts/loom-stitch-metrics.ts`, which dumps the SETTLED geometry
of any plain-family dictionary stitch beside them. It is the generalised
`loom-ch-debug.ts`: get NUMBERS before theories (§9).

### The measured table — before and after

| quantity | before | after | target |
|---|---|---|---|
| yarn fed per stitch | 3.51 d | **7.35 d** | 7.0–9.5 |
| stitch pitch | 1.07 d | **1.59 d** | 1.49–1.70 |
| row pitch | 0.91 d | **1.41 d** | 1.33–1.49 |
| crowding | 4.24 | **3.27** | 2.8–4.8 |
| fabric thickness | 1.82 d | 1.53 d | 1.8–2.2 |
| crown proud of its own legs | 0.46 d | 0.47 d | < 0.5 |
| **post leg separation** | **0.39 d** | **0.75 d** | ≥ ~0.7 to read as two strands |
| head strand separation | — (one node) | **0.82 d** | ≥ ~0.7 |

**What the numbers actually said** (not the hypothesis they were meant to test).
The brief's hypothesis was surplus yarn coiling into lobes. Half right: crowding
(yarn per unit cell area) was only 1.1× the real figure, and fabric thickness was
already about right. The real fault is that **the whole fabric was cut at ~0.66×
real size relative to the yarn we draw** — pitch 0.67×, row pitch 0.65×, yarn per
stitch 0.50×. At that scale nothing INSIDE a stitch can resolve:

- the post's two strands settled **0.39 d** apart, so they overlapped into one
  plump tube — the "fat coil". (The ~3 "wraps" of yarn visible per stitch in the
  close-up are the §11 ply barber-pole on that single merged tube, not three
  strands.)
- consecutive crown bumps, 1.07 d apart at 0.46 d proud, merged into one
  continuous ridge — the "thick proud cord" along every row top.
- there was nowhere for a pinprick hole to be.

And the missing yarn is almost all **the head**. A real sc's top is the loop that
was on the hook, laid down along the row: roughly 2 × the stitch width of
perimeter, ~5 d of yarn. Ours was a three-node BUMP carrying 0.5 d. Legs 2.8 d +
head 5 d ≈ the real 8 d budget; we had legs 2.2 d + head 0.5 d.

### The lever — a per-stitch fabric CELL, and a head that is a loop

Two changes, both construction, topology and every recorded interlock untouched:

1. **The cell.** `StitchDef` gained `rowYr`, `postHalfYr`, `crownHalfYr`,
   `headLoopYr` — this stitch's cell measured against its own published gauge, in
   yarn radii. Every one is optional and falls back to exactly the legacy shared
   lattice (`BASE_ROW_YR · heightFactor`, `stitchDims`), so a stitch that has not
   been re-cut is bit-identical. `rowPitchYr(id)` and `dimsFor(yr, id)` are the
   single accessors. sc: `gaugeYr` 1.8 → **2.7**, `rowYr` **2.4**, `postHalfYr`
   0.35 → **0.7** (the post's two strands now separate instead of merging).
2. **The head is a LOOP, not a bump** (`headLoopYr` 1.2). Traced as the hook lays
   it, so nothing is drawn: coming off the up-leg the strand runs BACK along the
   row top as the tucked strand, turns at the loop's tail, and comes FORWARD again
   past the column as the proud strand — which is still this stitch's crown, still
   the node the next row dives under, still the same `StitchLink`. It gives the
   head a real perimeter, a real hole, and TWO visible strands.

Audit **clean 36/36 at fine (1.5), worsted (2.4) and bulky (3.2)**. The §9 loop
budget is respected: the head is fed, never starved.

### What moved, and what is bit-identical

`loom-geom-hash.ts`, 32 of 36 swatches bit-identical. Moved (all of them sc
fabric, nothing else):

| swatch | before → after | why |
|---|---|---|
| `sc` | `5615e693ec3bc440` → `3fcc339c5313fa05` | the re-cut |
| `bobble` | `f8e613a49e46f856` → `fbe96143b96ef5dc` | its sc ground |
| `bobbles` | `f8e613a49e46f856` → `fbe96143b96ef5dc` | its sc ground |
| `picot` | `459e402588dad150` → `094308fee511eada` | its sc rows |

Two care points found while doing it, both worth knowing:

- **Re-associating a float moves every hash.** Writing the row pitch as
  `yr · (BASE_ROW_YR · heightFactor)` instead of `(yr · BASE_ROW_YR) · heightFactor`
  is the same number in algebra and a different one in binary — it moved `hdc`
  and `basketweave` for no reason at all. The builder keeps both branches
  written out separately so an un-recut stitch keeps its exact association.
- **Only the flat GRID builder takes the new cell.** The shaped, round, sphere
  and knit builders keep the legacy lattice: their crown canopies (`zBand`,
  `radialBand`), radial drifts, turning slack and intrinsic profiles were all
  calibrated on it, and re-cutting under them broke a disc interlock immediately
  (`mrdisc` j5 c28, hook 2.54yr sideways). `scinc`/`scdec` therefore pin
  `gaugeYr: 1.8` explicitly. Each of those builders needs its own pass.

### What generalises to the other stitches

The lever is the same for every one of them, and the work per stitch is small:

1. Look up the stitch's published gauge (sts and rows per 10 cm) in the weight
   the reference photo was shot at, and convert to **d = 1.7·yr**.
2. Set `gaugeYr` and `rowYr` to those figures; set `postHalfYr` so the post's two
   strands settle ≥ ~0.7 d apart; set `headLoopYr` (every crochet stitch has the
   same head, so the loop construction is shared as-is).
3. Re-measure with `loom-stitch-metrics.ts` and re-run `loom-audit.ts --yr=` at
   fine / worsted / bulky. Every headline number should land in its range.

Taller stitches (hdc/dc/tr/dtr) need their own `rowYr` from their own row gauge
rather than a heightFactor off sc — the real ratio of dc height to sc height is
not the ratio our `heightFactor` carries. The `emitDecrease` head is still a bump
and needs the same loop before the shaped builder can be re-cut.

### The flat proofs' stitch counts follow the gauge

A correct gauge makes the same stitch count a BIGGER piece, so the settled-size
gate (§8e-3) immediately failed `simple-coaster` (declared 100×100, settled
148×154) and `stripe-dishcloth` (declared 200×200, settled 300×248). That is the
gate doing its job: those counts were derived from a stitch that was half real
size. Re-derived from the corrected gauge (5.67 mm per sc, 5.04 mm per sc row):
coaster **26×30 → 18×20** (settles 102×103), dishcloth **53×50 → 35×42** (settles
197×206), with the gauge lines corrected to match. Both are now also what a
crocheter would actually get from the written gauge — and both are markedly
cheaper to render. The other flat proofs' declared sizes are driven by hdc/dc/post
stitches and stay as they are until those stitches take this pass.

---

## 8f-2. ROUND 2 — the bead becomes a V, and the cell goes library-wide (2026-09-05)

Round-1 verdict (orchestrator, judged close-up beside a real worsted-cotton sc
dishcloth): the fat coils and the proud cord are gone, stitches read as paired
loops with pinprick holes — **PASS at object scale, NEAR at close range**. The
residual: each stitch still read as a rounded BEAD where a real sc shows two
straight legs splaying into a V under a flat top.

### The leg numbers, before and after

| quantity | round 1 | round 2 | target |
|---|---|---|---|
| leg straightness, the visible leg (chord ÷ arc) | 0.83 | **1.00** | 0.93–1.0 |
| leg straightness including the dive corner | 0.83 | 0.87 | (a real corner; never 1.0) |
| V opening angle | 31° | **54°** | 40–60° |
| leg pair out of plane (p90) | 0.40 d | 0.40 d | ≤ 0.3 d |
| …the same, as a share of fabric thickness | 0.26 | 0.28 | 0 = mid-plane, 0.5 = the face |
| crown proud of its own legs | 0.47 d | **0.42 d** | ≤ 0.3 d |
| head strands: up the row / in depth | 0.25 / 0.45 d | 0.19 / 0.57 d | a pair, ~1 d apart |
| yarn per stitch · crowding · thickness | 7.35 d · 3.27 · 1.53 d | 6.75 d · 3.01 · 1.44 d | 7.0–9.5 · 2.8–4.8 · 1.8–2.2 |

### Why the V would not open — it was the ROUTE, not the values

A settled dump (`loom-stitch-metrics.ts` plus a per-node print) said it in one
look. The legacy post put the down-leg on the **leading** side of the column and
the up-leg on the trailing one, so the strand overshot the column, doubled back
to the insertion, and doubled back again: two hard reversals, one at each leg
top. Built at ±1.05yr the leg tops relaxed to ±0.6yr — the bending constraint
straightens a reversal corner and drags the leg top toward the chord. **No amount
of extra built width fixes that**; it only moves the fight (a sweep confirmed the
settled V is flat in `postHalfYr` beyond ~1.25).

Re-cut, the post runs **monotonically in the work direction** — down-leg
trailing, hook, up-leg leading — so the splay goes with the bend instead of
against it, and the loop's turn happens where a loop's turn belongs: at the head.
The head is now traced in the direction the up-leg already leans, and its entry
sits at the up-leg's own x (tying the head's start back to the column centre was
the second thing pinching the V shut). Leg half-width tapers with height, and the
nodes sit on the straight line that taper describes — hence straightness 1.00.

### The coupling that stops the last two targets being met

In this model **every part of a row sits on that row's own worked face**. Fabric
thickness therefore comes only from row-to-row alternation, and is about twice
the crown's proudness. A flat top and a two-diameter-thick fabric pull against
each other on one dial (the head-loop span), measured across a sweep:

| head span | yarn | crowding | thickness | V | crown proud | legs out of plane |
|---|---|---|---|---|---|---|
| 1.6 | 6.40 d | 2.85 | 1.03 d | 55° | **0.26 d** | **0.29 d** |
| 2.0 (shipped) | 6.75 d | 3.01 | 1.44 d | 54° | 0.42 d | 0.40 d |
| 2.5 | 7.40 d | 3.30 | **1.85 d** | 54° | 0.53 d | 0.48 d |

The shipped point keeps round 1's density and thickness while winning the V.
Breaking the coupling needs the post to cross **behind the head of the row
below** — a genuine front and back layer within one row — which is a construction
change, logged for round 3.

### The cell, library-wide across the flat family

Every stitch the flat grid builder makes now carries its OWN published worsted
gauge instead of sc's lattice scaled by `heightFactor`. **The row figure must come
from the stitch's own published row gauge**: the real ratio of dc height to sc
height is not the ratio `heightFactor` carries, which is precisely why one shared
lattice could never be right for all of them at once.

| stitch | pitch (d) | row (d) | `gaugeYr` | `rowYr` | measured pitch / row |
|---|---|---|---|---|---|
| sl st | 1.5 | 0.9 | 2.55 | 1.55 | 1.50 / 0.90 |
| sc, sc blo/flo, picot | 1.6 | 1.4 | 2.7 | 2.4 | 1.59 / 1.41 |
| hdc | 1.85 | 2.2 | 3.15 | 3.74 | 1.85 / 2.20 |
| dc | 2.0 | 3.7 | 3.4 | 6.29 | 2.00 / 3.70 |
| tr | 2.3 | 5.0 | 3.91 | 8.5 | 2.30 / 5.00 |
| dtr | 2.5 | 6.5 | 4.25 | 11.05 | 2.50 / 6.50 |
| fpdc / bpdc | 1.7 | 3.7 | 2.9 | 6.29 | (post branch) |

Every one lands on its own gauge to within 1% on both axes, every visible leg is
dead straight, and each V opens inside its own range — 54° for sc down to 21° for
dtr, which is the right direction: a treble's post is a near-parallel column, not
a splay. `postrib` and `basketweave`'s per-swatch packs were re-derived from the
corrected post cell (1.5 → 2.3, 1.9 → 2.9). blo/flo take the V post while keeping
their split back/front head — that split IS their identity, so the re-cut post and
the re-cut head are separate gates in the emitter.

**Residual, biggest on the tallest stitches:** yarn fed per stitch is 0.67–0.70×
real for dc / tr / dtr, and their crowding and thickness follow it down, because
our post is two straight legs where a real tall post also carries its yarn-over
wraps. That is a construction change for the tall stitches, not a cell value.

### Hashes — 15 moved, 21 bit-identical

`slst` 4c1f5a218e17f4f9→7f593ead9e9465cb · `sc` 5615e693ec3bc440→f54721a2c42603aa ·
`hdc` efc5ebe813082430→b3d2535fb4339765 · `dc` 0d06c96f4ce644b7→0338798a843fac2a ·
`tr` cd7218fd8f2527ff→097ace7ab1b448a1 · `dtr` b71c00e93697e278→d136eb5d1ce5902b ·
`scblo` 1a16a9311a35dff9→1c489d3d3ed7c249 · `scflo` e6648380a43e5b0a→70235400d6dd356b ·
`fpdc` 52184fe1f5698a56→15d9b46d2358df6a · `bpdc` 7e49178c803f513b→88a224a8c10e2ea8 ·
`postrib` 803878aa6f4bfff4→f7d2a22bd60e772c · `basketweave` 27994d3846b00d16→b94ede37a8ff6c6e ·
`bobble`/`bobbles` f8e613a49e46f856→87cfc76929d7631a · `picot` 459e402588dad150→08922a1137b5ff65.

Bit-identical: `ch`, `scinc`, `scdec`, `hdcinc`, `hdcdec`, `dcinc`, `dcdec`,
`shell`, `vstitch`, `crossed`, `mrdisc`, `ball`, `k`, `stockinette`, `garter`,
`knitrib`, `yo`, `k2tog`, `ssk`, `seed`, `cable`. Audit clean 36/36 at fine 1.5,
worsted 2.4 and bulky 3.2.

### ROUND 3 — what each remaining builder needs

- **Tall stitches (dc / tr / dtr).** Feed the post its yarn-over wraps. They are
  0.67–0.70× real on yarn per stitch, which drags crowding and thickness down
  with them; the cell is right, the post is thin.
- **The front/back layer.** Make the post cross BEHIND the head of the row below
  so a single row has a real front and back. This is what decouples "flat top"
  from "two-diameter fabric" — today they are one dial.
- **`buildShaped`.** Its `emitDecrease` head is still a bump, so the shaped
  swatches (`scinc`, `scdec`, `hdcinc`, `hdcdec`, `dcinc`, `dcdec`, `shell`,
  `vstitch`, `crossed`) are pinned to the pre-pass lattice by explicit
  `gaugeYr`. Give the decrease head the same loop, then drop the pins.
- **`buildRounds` / `buildSphere`** (`mrdisc`, `ball`). Their crown canopies
  (`zBand`, `radialBand`), radial drift and magic-ring radius were all calibrated
  against the legacy lattice; re-cutting under them broke a disc interlock
  immediately (`mrdisc` j5 c28, hook 2.54yr sideways). Re-derive the canopy and
  the drift from the new cell in the same pass, not after it.
- **`buildKnit`.** Untouched — knit has its own published gauge (`k` is still on
  the legacy lattice) and its own two-diameter thickness model (§8d), so it wants
  its own measurement pass rather than crochet's numbers.

## 8f-3. ROUND 3 — the yarn-over collars on the tall posts (2026-09-05)

Round-2 verdict: the flat family passes at object scale and sc passes close-up.
The residual it named first was that **dc / tr / dtr read as bare ladders** — two
straight legs and nothing else — and fed only 0.67–0.70× the real yarn per
stitch, which dragged their crowding and fabric thickness down with them.

### The construction — a yarn-over is a closed collar, not a decoration

A tall stitch is not a taller sc. Before the hook is ever inserted the yarn is
wrapped over it: **once for a dc, twice for a tr, three times for a dtr** — and
each of those wraps ends up as a closed ring of yarn round the finished post,
evenly spaced up its length. They are the bands a crocheter counts to name the
stitch, and they were simply missing.

They are built as what the one strand genuinely does, in the real order:

- the yarn-over happens BEFORE the insertion, so it comes first along the strand;
- coming off the previous head the strand descends the post line and, at each
  collar height, runs a **full turn round the column** — behind the post, round
  the leading edge, back across the FRONT — then carries on down to the insertion;
- nothing is linked at that moment. The collar closes only when the **up-leg
  rises back through it** on its way to the head, and self-collision is what then
  holds the up-leg inside the ring. That crossing is recorded as a `through`
  link, so the audit proves the wrap survived relaxation rather than trusting the
  render.

The legs are cut with a node at every collar height (one every quarter of a
collar gap), which is also what keeps every ring node further along the strand
from the up-leg it must collide with than the relaxer's adjacency window — a
collar built inside that window is a ring the up-leg can walk straight out of.

`yarnOvers` and `yarnOverYr` are dictionary fields; a stitch that declares
neither gets exactly the bare post it had before.

### The targets were wrong, and wrong in one specific way

Before changing anything, the tall stitches' yarn-per-stitch targets were
re-derived, because the measured shortfall was suspiciously uniform (0.67, 0.68,
0.70). The old figures came from scaling sc's published figure by how much taller
the post is — which counts the post and the head and **forgets the yarn-overs
entirely**. Built from the anatomy instead:

```
yarn per stitch = 2 × row pitch            (the post's two legs)
                + 2 × stitch pitch + 2     (the head loop's perimeter)
                + yarn-overs × 5.1         (one collar: ~2 d of span + π d of ends)
```

The check on the model is **sc**, whose figure is published independently
(~3–4 m per 100 sc): the model gives 8.0 d, the middle of its 7.0–9.5 range. It
also reproduces hdc (12.0 d against a measured 10.3 in a 9.5–13 range) — and hdc
correctly gets no collar, because its one yarn-over is drawn through all three
loops at once and lands as the third-loop ridge.

| stitch | old target (scaled) | anatomy | new range (±20%) |
|---|---|---|---|
| dc | 13.0–18.0 | 18.5 | **14.8–22.2** |
| tr | 17.0–24.0 | 26.8 | **21.4–32.2** |
| dtr | 21.0–30.0 | 35.3 | **28.2–42.4** |

Two published equal-area swatch tests bracket the new numbers rather than the
old: an sc-vs-dc test (37 yd vs 23 yd for the same 6×5 in) puts a dc at 2.05 × an
sc, i.e. 16.4 d, and an sc/hdc/dc/tr test at 2.6 ×, i.e. 21 d. Crowding targets
follow from the same figures over each stitch's own cell.

### The measured table — before and after (worsted, yr 2.4)

| quantity | dc before | dc after | tr before | tr after | dtr before | dtr after |
|---|---|---|---|---|---|---|
| yarn fed per stitch | 10.92 d | **16.00** | 13.85 d | **24.35** | 17.03 d | **33.01** |
| …as a share of target | 0.70× | **0.86×** | 0.68× | **0.91×** | 0.67× | **0.94×** |
| crowding | 1.47 | **2.16** | 1.20 | **2.12** | 1.05 | **2.03** |
| fabric thickness | 1.05 d | 1.31 d | 1.00 d | 1.31 d | 1.01 d | 1.38 d |
| stitch pitch / row pitch | 1.00× | 1.00× | 1.00× | 1.00× | 1.00× | 1.00× |
| leg straightness, visible | 1.00 | 0.96 | — | 0.94 | — | 0.93 |
| V opening angle | 28.9° | 28.2° | 24° | 24.2° | 20° | 20.2° |
| post leg separation | 1.05 d | 0.83 d | 1.22 d | 0.88 d | 1.32 d | 0.94 d |

Every one of the three now lands inside its own yarn and crowding range, at the
same gauge, with the V and the straight legs round 2 won still intact. The post
leg separation drops because the collar genuinely cinches the post — which is
what a collar does.

Two metric changes went with it, both in `loom-stitch-metrics.ts` only:
leg separation and straightness now walk however many leg nodes a stitch has
instead of assuming three a side, and the straightness figures walk the LEG
NODES rather than every strand node between them — otherwise a collar's genuine
excursion round the post is scored as leg bend (it read 0.60–0.67 and the leg
was dead straight). The with-dive figure therefore reads 0.99 for sc where round
2 reported 0.87; it is the same fabric, measured without the detours.

**Still open on the tall stitches:** fabric thickness is 1.31–1.38 d against a
real 1.8–2.2, and the leg pair sits 0.32–0.34 d out of plane against ≤0.3. Both
are the §8f-2 coupling, not the collars — every part of a row still sits on that
row's own worked face, so thickness can only come from row-to-row alternation.
The collars raised thickness from 1.00–1.05, which is as far as they reach.

### Hashes — 7 moved, 29 bit-identical

`dc` 0338798a843fac2a→6cf5d9a8ef407dee · `tr` 097ace7ab1b448a1→3be0cd4b6d701a38 ·
`dtr` d136eb5d1ce5902b→f4ed80ad99033afa · `fpdc` 15d9b46d2358df6a→d312f9ea41f3b549 ·
`bpdc` 88a224a8c10e2ea8→ddc3f2b65f36447d · `postrib` f7d2a22bd60e772c→d27a1dd46849bd1f ·
`basketweave` b94ede37a8ff6c6e→0de1315d830cb475.

The four post swatches moved only because their row 0 is a plain `dc` — the
fp/bp post branch itself is untouched. Everything else, the shaped / round /
sphere / knit builders included, is bit-identical: they call the shared emitter
without a yarn-over count, so they keep the bare post until their own pass.

---

## 9. What did NOT work (the failure log — don't repeat these)

- **Hand-drawn per-stitch centre-lines** (rib cord / bump / omega) → rope, food,
  waffle, pebble, quilt. No real loop topology.
- **Per-stitch pieces joined by springs** → not real yarn; didn't scale.
- **ThreadStroke arch (single z-hump)** → can't express the over/under weave at all.
- **Ply twist baked into the path** → twisted knots. (Keep twist only in the render
  plies, for fibre.)
- **High z-relief** → 3D dumplings/balls. sc must lie nearly flat.
- **Smooth, no-fibre yarn** → plastic/rubber-tubing look. Needs gentle ply + the
  photoreal fibre pass.
- **Sharp clean front V** → reads as knit stockinette, not crochet. Fixed with a
  flatter **barred** top + density.
- **dc with a hidden post** → no post at all; **visible post at sc/hdc gauge** →
  horizontal braid (too dense to stand up).
- **Pinning a drawn post shape to a grid + a spring join to the head below** → looks
  tidy but is faking the stitch formation (collapses to a braid the moment you
  un-pin, because there were no real linked loops). RETIRED 2026-06-29; replaced by
  the genuine topology (§8a). HARD RULE: no faking the stitch formation — the yarn
  must genuinely hook through the loop below, held by collision.
- **No turn (working in the round geometry on a flat swatch)** → invents the fabric;
  real crochet turns each row (alternating worked face). Fixed by the `fz` face-flip.
- **Too-strong face-flip relief** → corrugated bands, not flat fabric. Keep relief
  gentle (`z≈0.3yr`).
- **Chain: upright overlapping C-loops with alternating z tilts** → structurally a
  twisted cord, and that's exactly how it renders. A chain's loops lie FLAT in the
  plane; the next loop's two strands pass THROUGH the previous opening; the
  connector crosses the BACK (the bump). Build that topology or nothing else matters.
- **Chain: a loop tighter than its contents** → collision EXPELS a strand from the
  hole (it ends up outside the loop's own leg — check numerically, the renders lie
  to the eye). At collision distance d a loop wrapping two strands needs ≈ 2d+2πd
  of perimeter. Chain tightness comes from SOFT collision (squashed yarn), never
  from starving the loop.
- **Symmetric plane pull to flatten a chain** → crushes the front/back layering and
  the crowding resolves sideways (lean, escapes). Flatten with the one-sided TABLE
  (`floorZ`) — and give the back-bump layer real depth or the centre-back
  overcrowds and ejects the crossings.
- **Diagnose with numbers, not renders**: when a topology-correct build looks wrong,
  dump the settled positions per stitch (`scripts/loom-ch-debug.ts` pattern) before
  touching parameters. Two renders in a row got misread until the dump showed the
  expelled strand.
- **A flat program grid reading OPEN is NOT a row-pitch problem** (Part D density
  pass, 2026-07-12). The instinct (and the brief) was that the grid's vertical row
  pitch was over-spaced / scaled wrong with stitch height. Numbers killed it: the
  grid path (`buildContinuous`) shares `BASE_ROW_YR × heightFactor` AND the flat
  relax profile with the single-stitch swatch, so a dc grid row settles at 4.95yr
  vs the dc swatch's 4.96yr — identical — and vertical course coverage is 0% gap.
  The openness was HORIZONTAL (between-post channels) and the real lever was RENDER
  YARN THICKNESS: `programScene` plied at `yr*0.62`, 27% thinner than the swatch's
  post-crispness `yr*0.85`, so identical geometry read as mesh (worst on tall
  stitches, whose channels are widest). Don't touch row pitch to fix flat density;
  measure AREAL front-face coverage at the render radius first.
- **Staging a 3-D FIGURE with the flat-fabric camera and light rig** (bear,
  2026-09-05) → a plan view of the crown of the toy, back-lit. `tiltDeg` is off
  STRAIGHT DOWN, so the 18–22 that suits a piece of fabric on a table is nearly
  overhead for a figure; and the fabric key light sits low on the FAR side,
  which silhouettes anything that stands up. A figure needs ~74° tilt, a yaw for
  the three-quarter angle, the aim raised up the object, and a key on the
  camera's side. Nothing about the yarn was wrong — the photograph was.
- **Aiming an amigurumi limb by its MAGIC-RING pole** (bear, 2026-09-05) → every
  ear/muzzle presents its ring spiral to the camera and reads as a flat swirl
  disc stuck on the head. Both poles carry a worked hole; the ring one is the
  visible spiral, so it belongs in the JOIN (`poleIn`). Related: `dir` alone
  cannot express a sewn-on limb, because where a piece joins and which way it
  points are two different directions (`aim`) — an arm joined at the shoulder
  and forced to point along its own join direction sticks straight out sideways.
- **Seating an amigurumi head INTO the body to join it** (bear round 2,
  2026-09-05) → one loaf. Round 1 overlapped the head 9 mm into the body and the
  two balls merged; there is no neck to be had from a seating value, because the
  narrowest the join can get is the two spheres' own tangent circle. Probed by
  slicing the body+neck+head control points every 1.5 mm and reading the
  narrowest slice as a percentage of the head width: dropping the overlap to
  2 mm (near-tangent) only reaches 74%, while a short narrow crocheted NECK
  PIECE (eq-12, `[6,12,12,6]`, 14.6 mm wide) sunk into the crown with the head
  stacked on it reaches 43% — the head then reads as more than twice the width
  of its own join. A neck is a PART, not a placement number.
- **A limb seated by half its own height reads as a bump, however big it is**
  (bear round 2, 2026-09-05). Round 1's ears were already 47% of the head width
  and still looked like two nubs, so the instinct was "make them bigger". Wrong
  lever twice over: 5 of their 11.5 mm were INSIDE the head, and they sat on the
  top-BACK of the crown where the crown itself occludes them from a
  three-quarter front camera. Measure what a limb actually contributes: project
  the limb and its parent into the real camera plane and count the fraction of
  the limb outside the parent's projected silhouette. Moving the ears to the
  SIDES of the crown, leaning them forward with `aim`, and cutting `seat` 5 → 3.5
  took that from a bump to 31% outside / 5 mm past the head edge, at almost the
  same ear size.
- **A yawed camera makes one direction do two jobs — the FACE needs its own
  rotation** (bear round 2, 2026-09-05). With the camera yawed 26° for the
  three-quarter body, face features aimed straight down the figure's own front
  present at 26° to the lens and the far ear hides behind the crown. Rotating
  every FACE feature's attach direction back through the camera yaw about z (a
  head turn) puts the muzzle, both eyes and both ears in front of the lens while
  the body, limbs and shadow keep the three-quarter angle. Do NOT rotate the
  limbs with it — they belong to the body.
- **A big smooth glossy prop renders GREY, not black** (bear round 2,
  2026-09-05). Round 1's safety eyes were 8 mm across on a 34 mm head (23% of
  the head width) in a near-black glossy plastic and read as grey glass marbles.
  The material was not wrong: a large smooth sphere mirrors the whole white
  sweep back at the lens, so the grey IS the sweep, and the grazing rim goes
  brighter still. The fix is the real-notion SIZE — ~10% of the head width —
  at which the reflection collapses into the single highlight a safety eye
  actually shows. Reach for the notion's dimensions before its shader.
- **A hanging limb that reaches below the table lifts the WHOLE piece off it**
  (bear round 2, 2026-09-05). The renderer floats a composition up so its lowest
  point clears the ground (`z_offset = 0.08 - minz`), so an arm paw pad settling
  1.2 mm under z = 0 does not clip — it silently hoists the legs 1.3 mm into the
  air, shadow and all. Probe `minz` over every placed part after any pose change;
  it must be 0.00.
- **Guessing an amigurumi part's SHAPE from its round counts** (bear,
  2026-09-05) → a "head" that is a 31 × 14 mm pancake. On the intrinsic profile
  the radius comes from the count and the height from meridian pitch, so h/w is
  set by how many rounds the count plateau holds, and the ±6 up/down ramps alone
  give an oblate disc. Probe the family and MEASURE h/w before choosing (and
  re-check the audit: several plateau lengths fail the interlock gate).
- **Shaping: turning slack only at row 0** → a shaped row's eccentric first reach
  (an inc fanning, a dec spanning two crowns) strangles the corner hook at every
  turn. The turning chain (ch 1 + turn) goes into EVERY shaped row — it's what a
  crocheter actually does.
- **Two hooks of an inc pair initialised COINCIDENT under the shared crown** →
  collision must split them and picks an arbitrary direction; at a turn the bias
  expelled the first hook UP over the crown (probe: hz +0.98 vs its twin's −1.21,
  same-side audit fail). Real pair insertions enter side by side — offset the two
  hook inits ±0.6·pw along the row, and work the over-the-base stitch of an edge
  pair first. (TWO theory-first "fixes" missed this; the one-corner numeric probe
  found it in one look. Numbers before theories.)
- **Clamping an inc row's edge lattice slots ("support the flare")** → the wrong
  medicine for the coincident-hook defect above, and its own disease: it denies
  the fabric 0.45·sw of real width per row per edge, the compression collects in
  the corner, and the stacked edge incs buckle forward out of plane (probe: corner
  hook z drift 0 → 0.95 → 3.1yr up the rows). The lattice stays even and FULL
  width; shaping's extra width is real.
- **Rounds relaxed with free z and no table** → no-turn fabric piles every round's
  relief on the same face; nothing alternates to cancel it, and the disc bulged
  into coiled-rope lumps (read as a rope trivet, not crochet). Same cure as ch:
  the one-sided TABLE (`floorZ`), never a symmetric plane pull.
- **A tangential ANGULAR HOLD to "order" the disc rounds made it WORSE** (mrdisc,
  2026-07-10). The disc renders as random lumps; the theory was that stitches slide
  out of their even angular slots and tumble, so a soft pull holding each node near
  its worked angle should re-order them. Wrong: it raised the angular-gap CV from
  ~1.1 to ~2.2 and broke a hook. The lumps are inner-round CROWDING — at small
  radius the circumference can't fit the stitches, so collision needs to SPREAD
  them; pinning the angle fights that spreading and packs them tighter. Numbers
  first told the real story (gap-CV already high at baseline = crowded, not
  disordered). The relief/ordering lever family (crownLay×2, legReliefScale,
  angular-hold) is now exhausted on the round-fabric look and none reach the bar;
  the open direction is the radial pitch / disc gauge vs the +6 stitch count, i.e.
  give the crowded rounds real room — a construction change, not a relax tweak.
- **Audit offsets measured in world x/y on a POLAR fabric** → "floated above its
  crown" fired on healthy disc stitches (world +y is radially outward only at one
  angle). Measure link offsets in the FABRIC frame: `frame: 'polar'` maps along-row
  → tangential, row-height → radial.
- **Knit seeded thinner than real fabric (±0.6yr relief)** → every course's legs
  squeeze the course below's leg-tops backward; the cascade collapses each course's
  crossings onto its own head plane (dz → 0 fabric-wide). Stockinette is ~2 yarn
  diameters thick — seed the whole budget (legs +1.1yr, heads/sinkers −1.0yr) so
  nothing starts within a collision diameter of flipping. Garter escaped the thin
  version only because alternating faces push opposite ways — and regressed on the
  thick version (see §8 table) because its crossing side is relative, not absolute.
- **Knit sinker→leg with no routing node under the old head** → the kink's bending
  pull drags the crossing back through the head before collision can hold it. The
  strand genuinely passes UNDER the old head's bottom edge between purl side and
  face side — put that node in the path.
- **A pattern's counts forced onto the rigid ANALYTIC sphere** → the canonical
  ball pattern is not a metric sphere (its +6 cap is intrinsically a flat disc;
  stuffing makes the ball) — cap rounds compressed ~20% and one pair-hook never
  settled, at any iteration budget. The pattern defines its own surface
  (intrinsicProfile, §8e).
- **Per-node surface frames assigned AFTER build by nearest-segment lookup** →
  boundary nodes get a neighbour segment's tangent and the layout pull migrates
  them along the meridian (scattered "floated above its crown" at 1.2–1.4yr).
  Capture each node's exact frame AT BUILD TIME in the place3 closure (one call
  per node, in push order — assert the counts match).
- **A piecewise-linear profile with hard corners** → the fabric frame creases at
  cap→barrel corners and hooks reaching across the crease land displaced (fail
  clusters at EXACTLY both corners). Stuffed fabric cannot crease — smooth the
  profile (Chaikin ×2) and re-parameterise by arclength.
- **Garter as an ACCORDION (intra-course zigzag, Fable 2026-07-11, 2 attempts,
  both audit-fail — reverted to the corrugation model).** The theory is right
  (garter IS folded stockinette; ridges = heads + following sinkers at fold
  crests; legs hide in the fold interior) but the through-interlock cannot live
  INSIDE the fold with this crossing geometry: attempt 1 (crossing at crest
  −0.5yr) blew 73/240 crossings out sideways at the over-stacked crest; attempt
  2 (crest cluster spread, crossing −0.6yr, head bump 0.9yr) made it WORSE
  (100/240 — legs settle behind heads and slip sideways) because the leg's own
  fold diagonal drags its crossing across the head's z-side as it settles. The
  next garter-look effort must redesign the CROSSING itself — pass the old head
  at the fold's SIDE (x-offset around the head, like the crochet hook's dive)
  rather than beneath the crest — an interlock-level change, not placement
  values. The corrugation model (audit-clean 240/240, look "upright clusters")
  remains the shipping base.
- **A knit eyelet (yo) does NOT open into a crisp hole at this engine's density**
  (yo, 2026-07-11, two constructions, both audit-clean, both look-soft). The yo is
  genuine topology (a loop over the needle with no `'through'` link below — the
  audit confirms the open interlock), but the deterministic relaxer packs the
  short knit stitches to uniform density: numeric probe (nearest-yarn open gap)
  = 0.72yr at the eyelet ≈ 0.69yr in plain fabric, i.e. NO gap. Attempt 1 (a bare
  arc yo) and attempt 2 (a FED wide open loop, sides ±0.62·gauge) both closed —
  x is free so the W stitches just redistribute to even density, and there's no
  through-strand in the yo's lower mouth (nor enough mesh tension at swatch scale)
  to hold it open. A real knit eyelet stays open by MESH tension — the anchored
  surrounding loops leaving a gap the decrease removed — which this small floppy
  swatch doesn't reproduce. The fed-loop version is kept (the yo rings at least
  read as visible openings under tilt + openFabric). The likely real fix is the
  library-wide yarn-crispness/density pass (firmer, less-roving yarn holds mesh
  gaps), NOT another yo tweak — two-attempt cap reached. Do not chase it with
  more placement values; it needs firmer fabric.
- **Cable diagonals fed surplus yarn on a proud travel layer read as loose ropes
  lying ON the fabric, not a cable** (cable attempt 1, 2026-07-11). The crossing
  topology + audit + z-order probe were all clean; the LOOK failed because the
  +1.6yr travel layer + bowed slack let the relaxer park the extra length as a
  surface float, and the surplus shoved the neighbouring columns into gaps. A
  cable's crossing pairs hug the fabric — snug the travel layers to just over
  the collision floor (±1.35yr, separation 2.7yr > 2.5yr) and keep diagonals on
  their chord with a straight buried approach. Slack belongs at the ANCHOR ends
  (the bobble lesson), not spread along a visible travel. Remaining honest gap:
  real cables PULL IN laterally at the crossing; the free-x relaxer doesn't
  reproduce that compression, so the crossing region stays slightly disturbed —
  parked with the library-wide density/crispness questions, not another
  placement tweak.
- **A cable cross's work DIRECTION must match the proven crossing — put crosses on
  the right course parity, don't re-tune the crossing** (cable panel, 2026-07-12).
  Building the cable PANEL (gutters + repeat + field) the audit failed 4/448, all
  at the inner-back column, leg settling behind its head (dz −0.4..−0.8yr). The
  crossover diagonals themselves probed HELD (front +2.0 over back −2.5 at every
  cross) — so the CROSSING was fine; the fail was elsewhere. Numbers-first, one
  variable at a time from the proven config (W12 c4 j3,7 = 0 fails): widening,
  shifting the cable column, and repeating the cross all stayed 0; the fail
  appeared only when the crosses sat on EVEN courses. `emitCable` uses the work
  direction `s` (±1, alternating per course) in its node offsets, so a cross on
  the opposite parity flips those offsets and the inner-back leg loses its front
  hold. Fix = place the crosses on ODD courses (s=+1, the parity the crossing was
  built + proven on). A global gauge pack "fixed" the even version at exactly
  g=0.92 but was a knife-edge (0.90/0.94 both worse) and composed badly — the
  robust fix was the parity, not a magic number. Lesson: when a cable panel fails,
  check the cross's course parity against the proven swatch BEFORE touching any
  spacing param, and never re-tune the crossing construction to paper over a
  placement bug.
- **Headband LOOP staging — two wrong ring mappings before the standing cylinder**
  (Part C, 2026-07-12). Curling the flat strip into a ring for the headband hero.
  Attempt 1 (ring LIES FLAT, band width radial in-plane): a near-square proof
  swatch wrapped into a filled COILED DISC — no hole, reads as a basket coaster.
  Attempt 2 (same flat-lying mapping, proof re-shaped long+thin so a hole appears):
  the tall band spread radially turned the circumferential ribs into a radial
  SUNBURST/wheel. Root cause both times: putting the band width in-plane. Fix =
  ring axis along Z — circumference in X–Y (the footprint the camera frames off,
  so it frames cleanly), band height standing UP Z, relief on the outward radial
  normal → a short ribbed CYLINDER standing on the table (`loopStrip`). Also needs
  the proof to be a genuinely LONG THIN strip (52 sts × 4 rows) or there's no
  central hole. Reads as a real seamed ribbed headband; hero gate 0.933. Residual:
  the ribs read openwork (density residual, mildly amplified by the wrap).
- **A retroactive z-nudge on an already-placed node barely survives relaxation**
  (blo/flo ridge, 2026-07-07). Pushing `nodes[k].z *= 1.7` AFTER the node is placed
  fights its own recorded distance-constraint rest lengths; the relaxer mostly undoes
  it (measured ~0.25yr net gap, under 1/8 of a yarn diameter — invisible). Bake the
  offset in at node CREATION so the rest lengths are correct from the start (the blo
  ridge split then held ~0.76yr). General rule: shape belongs in the initial
  placement, never a post-hoc shove.
- **A big forward bulge with no slack drags its anchors off their z-side** (bobble,
  2026-07-10). The unsigned +z bobble bulge (bz = 5·z) started on the very next node
  after the base hook and ended jammed against the gathered head, so the dist+bend
  bonds pulled BOTH onto the wrong z-side (audit: base hook +0.21 vs its crown +0.42;
  the head dragged −0.28 → +0.09, and the sc worked into it then landed same-side).
  Cushion a bold z-excursion with slack nodes at BOTH ends so the yarn absorbs the
  pull instead of transmitting it, and gather into a PROPER proud crown (zh*1.15) the
  next row hooks normally — not a weak half-height loop. General: a stitch's ANCHORS
  (its hook under the below-crown, its own head) must be de-coupled from its own
  relief by real yarn, or relaxation pulls them off station.
- **A cluster hard on the pinned selvedge strangles its corner hook** (bobble, 2026-07-10).
  The grid builder only gives a turning-chain to row 0, so a big excursion (bobble)
  at the first stitch of a LATER row has no slack off the pinned edge and its base
  hook flips same-side. Real bobble/popcorn patterns keep the selvedge plain — confine
  the dots to interior columns; it's a recipe-correctness fix, not a dodge.
- **A pinned foundation rail curls into a lip at a shaped trapezoid's narrow point**
  (scinc, 2026-07-10). buildShaped pinned its foundation as a continuous proud
  forward rail (z ≈ +0.5yr), same as the grid builder — invisible under wide flat
  fabric (a straight bottom edge) but a shaped trapezoid fans UP from a narrow base,
  so the rail sticks forward at the point and reads as a curled lip. Tuck the
  connectors BETWEEN crowns just below the plane (a row of low bumps, not a rail);
  keep the crown APEXES proud (the dive needs them) and keep the two EDGE crowns'
  connectors proud too — the increase corner works two hooks into one corner crown
  and tucking its connectors strangled that dive (audit j0 c0). Only buildShaped's
  own foundation moved; no grid/knit/round stitch touched.
- **A per-column pull side is CONSTANT up the column, not per-course** (knit rib,
  2026-07-10). The instinct is to flip the face each course (like garter). Wrong for
  rib: because you purl the knits and knit the purls on the turned course, each
  column holds ONE fabric face its whole height. Reason the pull side in the FABRIC
  frame, not the viewer's — the turn cancels out and the column face is constant.
- **"Ridge only shows every other row" was NOT a bug** (blo/flo, 2026-07-07). We turn
  every row (faithful flat crochet), so each row's unworked loop lands on whichever
  FACE it was worked from; a top-down camera sees only the +z half → ridge every other
  row (`scripts/loom-blo-debug2.ts` dumps per-row ridge z: even rows +z visible, odd
  rows settle to ≈−2yr, hidden). That is correct flat-turned behaviour. The bolder
  every-row ridge in in-the-round dictionary photos is the NO-TURN presentation. A
  gated `noTurn` option (fz held +1) reproduces it and puts every ridge on the front —
  but in the serpentine strand model it strands the edge-column interlocks at the
  row-turns (the turning-chain slack assumed the face-flip); the clean fix would be
  true single-direction in-the-round construction. Left off — Rebecca chose the
  faithful flat-turned depiction. Don't "fix" the every-other-row ridge; it's real.

- **A stitch whose two legs DOUBLE BACK cannot splay, whatever width you build**
  (sc, §8f round 2). The legacy post put the down-leg on the leading side of the
  column and the up-leg on the trailing one, so the strand overshot, reversed at
  the insertion, and reversed again — and the bending constraint straightens a
  reversal corner, dragging both leg tops toward the chord. Built at ±1.05yr they
  settled at ±0.6yr; a sweep of the built width barely moved the settled V, it
  just moved the fight. The fix is the ROUTE, not the value: run the post
  monotonically in the work direction (down-leg trailing, hook, up-leg leading)
  so the splay goes WITH the bend, and let the loop's turn happen at the head
  where a loop's turn belongs. Numbers found it in one settled dump after two
  value-tuning attempts had moved the V by 4°.
- **Re-associating a floating-point product moves every geometry hash** (§8f).
  Writing the row pitch as `yr · (BASE_ROW_YR · heightFactor)` instead of
  `(yr · BASE_ROW_YR) · heightFactor` is the same number in algebra and a
  different one in binary; it moved `hdc` and `basketweave` for no reason at all.
  When refactoring a shared lattice, keep the untouched path's exact
  associativity, and diff `loom-geom-hash.ts` before believing a change is inert.

---

## 10. Next stitches (apply §8a methodology)

sc/hdc/dc LOCKED. Remaining (§12), grouped by how much NEW topology each needs:
- **Near-free (dictionary only):** tr, dtr — taller posts (heightFactor). ch + sl st —
  ch is the foundation chain already; sl st is the shortest join.
- **Hook-target variants (one parameter on the hook):** blo / flo / third-loop — hook
  under only the back / front / third strand of the crown below.
- **Post-wrap variants:** FPdc / BPdc — wrap the post around the post below (front/back)
  instead of into the head; waffle/basketweave = combinations of these.
- **Multi-into-one / into-a-space:** bobble, popcorn, puff, cluster, shell, V-stitch,
  picot — several partial stitches sharing one base/top, or worked into a chain-space.
- **Shaping:** increases (n stitches into one below-crown), decreases (one stitch
  pulling several below-crowns together), rounds + magic ring (circular column layout),
  corners (increase at a point).
- **Knit (new dictionary, same relax/render):** k, p, yo, k2tog, ssk, cables.
- **Then:** mixed-stitch combos (engine already takes a per-row stitch array) + 3D
  (the same strand on a curved surface) → Aspen Throw (hdc) as the easy case.

**General:** every new stitch — reference → shape its excursion → render → photoreal
finish → customer-check (against reference) → confirm across weights. Colours: §11.

---

## 11. Known issues

- **YARN CRISPNESS PASS 2026-07-12 (library-wide, render-only).** Every stitch
  used to render as soft twisted ROVING — plump fuzzy lobes, no visible ply —
  while real references show firm plied yarn with clean silhouettes. Root cause
  was threefold, all in the render half (no geometry touched):
  1. **Merged plies.** `pliedFilaments` sized each ply `bundleR/sqrt(nPly)`
     and Blender bevelled it a further 1.5× — the three plies overlapped into
     one smooth tube, so there was no ply line for light to catch.
  2. **Lazy twist.** Recipe twist (0.05–0.1/mm) barely rotated the plies over
     a stitch's length, so even the merged tube showed no spiral.
  3. **Felted material.** A 1.3-strength coarse noise bump + full-strength
     sheen (1.0) + chalk-matte roughness (0.62–0.86) read as felt/roving and
     buried what little structure survived 1+2.
  The recipe that passes the probe trio (sc + stockinette LOCKED-identity
  check, mrdisc the softness worst case) — all in `yarnLoop.pliedFilaments`
  and `loom_render_crochet.py`:
  - `PLY_RADIUS_FRAC 0.52` — ply tube radius as a fraction of the target
    outer radius (call sites pass `yr*0.85`). 0.46 read as rope (grooves too
    deep); ~0.55+ merges back toward roving. Blender bevels the ply 1.02×
    (the old 1.5× was what merged them).
  - `TWIST_GAIN 2.2` on the recipe twist — the barber-pole is visible;
    recipes keep their relative calm(0.05–0.08)/rustic(0.1) intent. 3.4 read
    as wrung corkscrew. mrdisc's twist moved 0.05→0.08: the old "calm" value
    was defending against merged-tube surface noise; in the distinct-ply
    model the twist IS the yarn identity.
  - Material: fibre bump 0.6 (1.3 felted; 0.3 read as moulded PLASTIC — the
    §9 "no-fibre" failure from the other side), fuzz 0.28, sheen weight 0.55,
    spec 0.18, roughness 0.55–0.78, default post-AgX saturation 1.4→1.2 (the
    crisper yarn oversaturated at 1.4).
  Levers, plainly: PLY_RADIUS_FRAC = ply definition (rope ↔ roving);
  TWIST_GAIN = spun-ness (smooth tube ↔ corkscrew); fibre/fuzz bump = wool
  (plastic ↔ felt); sheen weight = halo (crisp ↔ felted); roughness/spec =
  firmness of the light. The remaining per-stitch bulbousness (e.g. the
  disc's z-amplitude) is GEOMETRY, not yarn — the exhausted relief-lever
  family in §9, out of scope for the yarn pass.
- **Open-fabric backing — FIXED 2026-07-11.** Open lace (shell/V/crossed/dc
  increases) showed the yarn-coloured backing plane as solid dark rectangles
  behind the holes. A recipe `openFabric` flag (threaded into the render view)
  drops the backing for those swatches so each hole shows the table surface;
  dense fabrics keep the backing. Presentation only (loom_render_crochet.py).
- **Density/packing knobs added 2026-07-11** (all per-swatch, leaving locked
  dictionary gauges/heights untouched): `gaugeYr` now works on buildRounds
  (disc), buildSphere (ball) and buildShaped (shell/V/crossed); `rowScale`
  packs shaped row pitch; `postReliefScale` deepens fp/bp block contrast
  (basketweave); `viewMargin` frames a full 3D silhouette (ball); `openFabric`
  drops the backing; `knitPurlCols` (2026-07-12) sinks recessed purl gutters on a
  stockinette knit ground (per-column −1 face, the rib mechanism, corrugation-free
  — used to frame a cable column). Defaults reproduce the prior geometry exactly.
- **Pale colours wash toward white** under AgX in the photoreal grade (worsted
  "oatmeal" came out near-white). Saturated colours show fine. Fix: deepen the input
  hex, or boost the saturation grade in `loom_render_crochet.py` / the upscale, or
  grade after.

---

## 12. Full stitch list to build (each through §5 + §6)

**Crochet basics:** chain (ch), slip stitch (sl st), sc ✅, hdc ✅, dc ◑, treble (tr),
double treble (dtr).
**Loops/variants:** back-loop-only (blo), front-loop-only (flo), the third loop,
extended stitches.
**Texture:** front/back post (FPdc / BPdc), bobble, popcorn, puff, cluster, shell,
V-stitch, picot, crossed stitches, waffle/basketweave (post combos).
**Shaping:** increases (n-in-1), decreases (sc2tog / hdc2tog / hdc3tog / dc2tog),
working in rounds, the magic ring, chain-spaces, corners.
**Knit (same engine, new dictionary):** knit (k), purl (p), yarn-over (yo), k2tog,
ssk, slip, stockinette, garter, ribbing, cables.
**Then:** combos (mixed-stitch rows / motifs) and 3D forms (amigurumi sphere → garments)
→ the Aspen Throw renders as one easy case.
