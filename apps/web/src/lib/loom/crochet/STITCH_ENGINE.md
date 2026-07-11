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
  drops the backing. Defaults reproduce the prior geometry exactly.
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
