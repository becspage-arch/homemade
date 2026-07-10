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

| Stitch | Method (genuine engine) | Verdict |
|--------|-------------------------|---------|
| **sc** | short stitch, DENSE gauge (`1.8yr` — reference gaps are pinpricks, not holes) | ✅ **LOCKED**, re-verified vs reference 2026-07-02 (audit: was too open at 2.0yr, fixed) |
| **hdc** | mid stitch + the real **third-loop** yarn-over ridge per row; dense (`2.0yr`) | ✅ **LOCKED**, re-verified 2026-07-03 (was too open at 2.2yr, fixed) |
| **dc** | tall **post** (`heightFactor 3.2`), gauge `2.3yr` — posts lean together, slits not gaps | ✅ **LOCKED**, re-verified 2026-07-03 (was too open at 2.5yr, fixed) |
| **tr** | taller post (`heightFactor 4.2`), gauge `2.45yr` — AIRIER than dc, open channels | ✅ **LOCKED**, re-verified 2026-07-03 (was too DENSE at the shared 2.3yr — tall stitches got their own gauge) |
| **dtr** | taller again (`heightFactor 5.4`), gauge `2.45yr` | ✅ **LOCKED**, re-verified 2026-07-03 |
| **sl st** | shortest worked (`heightFactor 0.8` — a row is still ≈1 yarn thick), tight gauge | ✅ **LOCKED**, re-verified 2026-07-03. Audit caught its row-0 corner stitch strangling off the pinned foundation → fixed with the **turning chain** (real slack into every first stitch, all stitches benefit) |
| **ch** | REBUILT 2026-07-02 as the true pull-through topology: each loop a flat teardrop; BOTH strands of loop n thread loop n−1's opening; connector = the back bump behind the work; only the slip knot pinned. Soft chain collision (`collMinDist 1.0yr` — drawn-tight chain squashes), whisper plane pull, TABLE floor (`floorZ`), 400 iters. Settled geometry verified numerically (`scripts/loom-ch-debug.ts`): folds centred + hidden mid-depth, legs symmetric on the front, both crossings inside each hole, bumps at the back, loop rotation ~2°. Face = nested-V plait. | ✅ **LOCKED 2026-07-02** (Rebecca signed off vs the eyeloveknots chain reference). Cross-weight (fine/worsted) confirmation folded into the audit sweep. |
| **bobble** | gathered cluster: genuine base hook + N loops bulging forward to one top | ◑ **construction FIXED 2026-07-10, look not yet**. The 3 broken interlocks are gone (audit 3→0): the unsigned +z bulge had no slack, so it dragged the base hook AND the gathered head onto the wrong z-side. Fix = slack nodes at BOTH ends of the bulge + gather into a proper proud crown (zh*1.15, not the old weak z*0.95) + confine the swatch's dots to interior columns (a cluster hard on the pinned selvedge strangled its corner hook). The LOOK is still lumpy — berries don't pop from the busy sc ground; that's the separate look pass, deliberately deferred (scope was construction first). Awaiting Rebecca. |
| **sc blo / flo** | head split into a real back + front loop; hook one, float the other as a ridge | ✅ **LOCKED 2026-07-07** (Rebecca). Reference re-verification found + fixed a real bug (ridge was nudged AFTER placement → relaxation crushed it; now baked at creation, split 2.2/0.25 zh, settled gap ~0.76yr) + calmer twist (0.05). Chosen depiction = **faithful flat-turned**: because we turn every row, each row's unworked loop correctly lands on the face it was worked from, so the ridge shows every OTHER row on the viewed face (odd rows' ridge settles to −z, hidden). Signed off as structurally correct + consistent with the locked `sc` look. Remaining softness (ridge reads heavier than a clean reference line) is the shared engine yarn-look, not blo/flo-specific — deferred to a possible library-wide yarn-crispness pass. |
| **fpdc / bpdc** | post RINGS the stem below (collision-held); body pops front (fp) / back (bp), head stays at plane; dense gauge | ✅ **LOCKED 2026-07-07** (Rebecca delegated the call). Individual reference comparisons done vs clean single-stitch refs (fpdc = raised proud posts, acrochetedsimplicity; bpdc = recessed posts / horizontal-bar front, theloopholefox — old shared ref was a colourwork-cable photo). fp raised vs bp recessed reads correctly; the distinction is subtle in isolation (as in a real all-one-type swatch) — its point is the contrast in postrib/basketweave. |
| **postrib** (1×1 fp/bp rib) | alternating fpdc/bpdc columns → raised ribs beside recessed valleys | ✅ **LOCKED 2026-07-07** (Rebecca). Reads as distinct packed vertical ribs vs a clean 1×1 rib ref (doradoes). The initial open-gauge caveat was **fixed**: postrib inherited fpdc's 1.9 gauge which left daylight between ribs; a per-swatch `gaugeYr: 1.5` override (new — leaves locked fpdc/bpdc gauge untouched) packed the columns tight to match the reference. Basketweave = same move in blocks, still `wip` (needs a reference + build). |
| **scinc** (2 sc in one st, shaped rows) | growing trapezoid, inc both ends every row; two full audited hooks share one below-crown, legs fan from the base (§8c) | ◔ audit-clean (90/90). The foundation-edge LIP (prior render blemish) was eased 2026-07-10: buildShaped pinned its foundation as a continuous proud forward rail (fine hidden under wide flat fabric, but a shaped trapezoid fans up from a narrow base so the rail curls forward at the point). Fix = tuck the connectors BETWEEN crowns just below the plane so the edge is a row of low bumps, not a rail; the two EDGE crowns keep their proud connectors (the increase corner works two hooks into the one corner crown — tucking its connectors strangled that dive). Still 90/90; re-render + Rebecca's verdict on the lip pending. |
| **scdec** (sc2tog, shaped rows) | shrinking trapezoid, dec both ends every row; one crown over two audited hooks (§8c) | ◔ audit-clean (60/60). Rendered 2026-07-10 (gate 0.928): trapezoid + converging decrease legs read; the fasten-off tail fixed the earlier frayed bottom corner. Awaiting Rebecca. |
| **mrdisc** (magic ring + rounds) | flat amigurumi circle: MR anchor, 6 sc in ring, +6/round continuous no-turn spiral, polar frame + radial blocked pull + table + fasten-off (§8c) | ◑ **construction audit-clean (126/126) but the LOOK is not there** — renders as a spiral mat of knotted roving, not radiating Vs (the table fixed the earlier coiled-basket read; the per-stitch knottiness of same-face rounds remains). Our own flat sc proves the engine reads as clean Vs at this scale, so this is a no-turn-fabric look problem: relief/leg-bulge tuning for same-face rounds, ~render-iteration work. Do NOT present as done. |
| **stockinette / k** (KNIT) | loops drawn through loops, 'through' links, real 2-diameter fabric thickness (§8d) | ◔ audit-clean (216/216, settled leg-vs-head clearance ≈1.7yr everywhere). Rendered 2026-07-10: reads immediately as chunky hand-knitted stockinette — interlocked V columns, correct nesting. Honest deltas vs the fine-cotton reference: plumper Vs + slight column wobble (weight mismatch + the library-wide roving softness). Awaiting Rebecca. |
| **knitrib** (1×1 rib, KNIT) | per-COLUMN pull side (even cols +z, odd −z), constant up each column — a purl column is a knit column seen from behind (§8d) | ◔ audit-clean (240/240); columns settle cleanly alternating (+0.35..0.39 knit / −0.34..−0.41 purl → a real rib). Built 2026-07-10 on `buildKnit`'s new per-(course,column) `faceSign`; stockinette + garter left bit-identical. Awaiting render + Rebecca. |
| **shell** (5 dc in one base) | SHELL_N dc fanned into one below-crown, balanced by skipped stitches → constant-width scallops (§8c) | ◔ audit-clean (65/65) — all 5 fanned dc genuinely hook the shared base. New shaped-builder ops `shell`/`skip`; dec/st/inc paths byte-identical (scinc/scdec unchanged). Awaiting render + Rebecca. |
| **hdcinc/hdcdec/dcinc/dcdec** | the SAME shaped builder, taller posts — emitDecrease + the inc path are stitch-generic | ◔ all audit-clean with NO engine change (hdcinc 70/70, hdcdec 60/60, dcinc 52/52, dcdec 44/44). Confirms the shaping paths are genuinely stitch-agnostic. Awaiting render + Rebecca. |
| **basketweave** (fp/bp blocks) | 3-wide fp/bp blocks swapping every 2 rows, off the locked fpdc/bpdc | ◔ audit-clean (96/96); reference photo added 2026-07-10 (was the last blocker). Awaiting render + Rebecca. |
| **garter** (KNIT) | stockinette loop + worked-face flip per course | ◑ **WIP — do not present.** Passed the audit at the THIN seeding, regressed when stockinette's real-thickness budget landed: with faces alternating, course j+1's legs now initialise on the SAME z-side as course j's head with ~0.1yr clearance, and the audit shows the whole first course slid ~2.2yr sideways along the pinned cast-on. The fix direction (untried, one attempt left under the cap): place each leg's crossing z RELATIVE to the old head's actual z (`hb.z + gap·fz`, gap ≥ collision diameter) instead of mirroring absolute constants — but verify stockinette's passing margins survive the same change before touching shared constants. |

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
