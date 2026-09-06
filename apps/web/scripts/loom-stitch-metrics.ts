/**
 * NUMBERS BEFORE THEORIES (§9) — the generalised settled-geometry metrics dump.
 *
 * `loom-ch-debug.ts` did this for the chain by hard-coding node offsets. This
 * does it for ANY plain-family dictionary stitch, in REAL-WORLD units, and puts
 * the measurement beside the published real-world figure for the same quantity,
 * so a look problem can be diagnosed as a number instead of argued from renders.
 *
 *   cd apps/web && npx tsx scripts/loom-stitch-metrics.ts [stitch=sc] [yr=2.4]
 *
 * Everything is reported in RENDERED YARN DIAMETERS (d = 1.7·yr — see below) as
 * well as mm, because that is the only yr-independent way to compare our fabric
 * with a photograph: a real crocheter's gauge is fixed by the hook relative to
 * the yarn, so "stitches per 10 cm" is really "stitch pitch in yarn diameters".
 *
 * Measured, per stitch, from the SETTLED (post-relax) positions:
 *   - yarn fed per stitch  — the arc length of the one strand across one stitch
 *     excursion (including the travel into it): the single number that says
 *     whether the cell has more yarn in it than a real stitch does.
 *   - stitch pitch         — settled crown-to-crown spacing along a row.
 *   - row pitch            — settled crown-to-crown spacing up a column.
 *   - crowding             — yarn length per unit of fabric CELL AREA. Above the
 *     real figure, the surplus has nowhere to go but out of plane: it coils.
 *   - relief               — crown / leg / hook offsets measured on the row's own
 *     WORKED FACE (fz alternates every row, so raw z averages to nothing), plus
 *     how proud the crown chain rides above its own legs (the "proud cord").
 *   - thickness            — robust z extent of the worked fabric.
 *
 * ROUND WORK (§8f-5). A disc and a ball have no global "plane" to measure
 * against: a stitch's relief rides the local surface NORMAL, and "along the
 * row" is the tangential direction, not world x. So every relief, splay and
 * out-of-plane figure below is computed in the LOCAL SURFACE FRAME —
 *   t = the round's tangent, m = the meridian (radially outward on a disc,
 *   down the meridian on a ball), n = m x t, the outward surface normal —
 * and the "plane" the fabric is measured against is the settled MID-SURFACE:
 * the median height of the worked fabric at that radius (disc) / that polar
 * angle (ball), so a bowl or an oblate ball is not scored as relief. Flat
 * builds keep exactly the old measurement (n = +z, mid-surface z = 0), so the
 * flat control's numbers are directly comparable round to round.
 */

import { buildRelaxedSwatch, isSwatchArg } from '../src/lib/loom/crochet/engine/buildSwatch'
import { SWATCH_RECIPES } from '../src/lib/loom/crochet/engine/dictionary'
import { stitchDebugNodes, postDebugNodes, type BuiltContinuous } from '../src/lib/loom/crochet/engine/yarnPath'
import { buildSphere } from '../src/lib/loom/crochet/engine/shaping'
import { relax, STUFF_PRESSURE, STUFF_PRIOR } from '../src/lib/loom/crochet/engine/relax'

/**
 * Published real-world figures for WORSTED (CYC 4) cotton, the weight the
 * close-range judgement is made at — yarn radius ≈ 2.1 mm, diameter ≈ 4.2 mm.
 * Expressed in yarn diameters so they hold at any render yr.
 *   - gauge:  single crochet in worsted runs ~14–16 sts and ~16–18 rows per
 *             10 cm → 6.3–7.1 mm and 5.6–6.3 mm.
 *   - yarn:   ~3–4 m per 100 sc → ~3.0–4.0 cm per stitch.
 *   - fabric: sc fabric is about two yarn diameters thick; the two top loops
 *             lie nearly flat, proud by well under half a diameter.
 */
interface Target { lo: number; hi: number; note: string }
const TARGETS: Record<string, Target> = {
  yarnPerStitch: { lo: 7.0, hi: 9.5, note: '~3.0–4.0 cm per sc at d=4.2 mm (~3–4 m per 100 sc)' },
  legStraight: { lo: 0.93, hi: 1.0, note: 'a real sc leg is nearly STRAIGHT (chord ÷ arc = 1 is a ruler)' },
  vAngle: { lo: 40, hi: 60, note: 'the two legs splay from the insertion into a V, ~40-60 degrees (DEGREES, not d)' },
  legOutOfPlane: { lo: 0.0, hi: 0.3, note: 'the leg pair lies IN the fabric — worst leg node under ~0.3 d off the plane' },
  crownProudFlat: { lo: 0.0, hi: 0.3, note: 'the top loop LIES FLAT — under ~0.3 d proud of its own legs' },
  stitchPitch: { lo: 1.49, hi: 1.70, note: '14–16 sts / 10 cm' },
  rowPitch: { lo: 1.33, hi: 1.49, note: '16–18 rows / 10 cm' },
  crowding: { lo: 2.8, hi: 4.8, note: 'yarn length per unit cell area (derived from the two above)' },
  thickness: { lo: 1.8, hi: 2.2, note: 'sc fabric ≈ 2 yarn diameters thick' },
  crownProud: { lo: 0.0, hi: 0.5, note: 'top loops lie nearly flat — proud by under half a diameter' },
  mound: { lo: 0.0, hi: 2.2, note: 'a stitch lies IN the fabric — its own peak-to-trough along the normal is about one fabric thickness, not a bead standing off it' },
}

/**
 * Per-stitch overrides of the shared targets. Gauge, row pitch and yarn usage are
 * NOT the same for every stitch — a treble is intrinsically wider, much taller
 * and airier than a single crochet — so comparing a dc against sc's figures says
 * nothing. Each row is the stitch's own published worsted gauge (sts and rows per
 * 10 cm) converted to rendered yarn diameters, with the yarn-per-stitch figure
 * scaled by how much taller the post is. Anything absent falls back to TARGETS.
 */
/**
 * THE YARN-PER-STITCH FIGURE FOR A TALL STITCH (re-derived 2026-09-05, §8f-3).
 *
 * The first version of this table got a tall stitch's yarn budget by scaling
 * sc's published figure by how much taller the post is. That is wrong, and it is
 * wrong in one specific way: it counts the post and the head and forgets the
 * YARN-OVERS. A dc is made with one yarn over, a tr with two, a dtr with three,
 * and every one of them ends up as a closed collar of yarn round the post. So
 * the budget is built from the anatomy instead:
 *
 *     yarn per stitch  =  2 × row pitch      (the post's two legs)
 *                      +  2 × stitch pitch + 2   (the head loop's perimeter)
 *                      +  yarn-overs × 5.1       (one collar round the post:
 *                                                 ~2 d of span + π d of ends)
 *
 * The check on the model is sc, whose figure is published independently (~3–4 m
 * per 100 sc): 2(1.4) + 2(1.6) + 2 = 8.0 d, the middle of its 7.0–9.5 range. It
 * also reproduces hdc (12.0 d against a measured 10.3 and a range of 9.5–13).
 * On the tall stitches it gives dc 18.5, tr 26.8, dtr 35.3 — where the scaled
 * figures said 15.5, 20.5, 25.5. Two published swatch experiments bracket the
 * new numbers rather than the old: an equal-area sc-vs-dc test (37 yd vs 23 yd)
 * puts a dc at 2.05 × an sc (16.4 d), and an equal-area sc/hdc/dc/tr test puts
 * it at 2.6 × (21 d). Ranges below are the anatomy figure ±20%.
 */
const BY_STITCH: Record<string, Partial<Record<keyof typeof TARGETS, { lo: number; hi: number }>>> = {
  // ~15 sts, ~28 rows / 10 cm — a slip-stitch row is barely taller than the yarn.
  slst: { stitchPitch: { lo: 1.4, hi: 1.6 }, rowPitch: { lo: 0.8, hi: 1.0 }, yarnPerStitch: { lo: 4.5, hi: 6.5 }, crowding: { lo: 3.0, hi: 5.5 }, vAngle: { lo: 45, hi: 80 } },
  // ~12-14 sts, ~10-12 rows / 10 cm. Its one yarn-over is drawn through all three
  // loops at once, so it lands as the third-loop ridge, not as a collar.
  hdc: { stitchPitch: { lo: 1.7, hi: 2.0 }, rowPitch: { lo: 2.0, hi: 2.4 }, yarnPerStitch: { lo: 9.5, hi: 13.0 }, crowding: { lo: 2.2, hi: 3.6 }, vAngle: { lo: 30, hi: 55 } },
  // ~11-13 sts, ~6-7 rows / 10 cm — posts lean together into slits, not gaps.
  // 1 yarn-over: 7.4 + 6.0 + 5.1 = 18.5 d, crowding 18.5 / (2.0 × 3.7) = 2.50.
  dc: { stitchPitch: { lo: 1.85, hi: 2.2 }, rowPitch: { lo: 3.4, hi: 4.0 }, yarnPerStitch: { lo: 14.8, hi: 22.2 }, crowding: { lo: 2.0, hi: 3.0 }, vAngle: { lo: 18, hi: 40 } },
  // ~10-11 sts, ~4.5-5 rows / 10 cm — airier again, real open channels.
  // 2 yarn-overs: 10.0 + 6.6 + 10.2 = 26.8 d, crowding 26.8 / (2.3 × 5.0) = 2.33.
  tr: { stitchPitch: { lo: 2.2, hi: 2.4 }, rowPitch: { lo: 4.8, hi: 5.3 }, yarnPerStitch: { lo: 21.4, hi: 32.2 }, crowding: { lo: 1.85, hi: 2.80 }, vAngle: { lo: 14, hi: 34 } },
  // 3 yarn-overs: 13.0 + 7.0 + 15.3 = 35.3 d, crowding 35.3 / (2.5 × 6.5) = 2.17.
  dtr: { stitchPitch: { lo: 2.4, hi: 2.6 }, rowPitch: { lo: 6.2, hi: 6.8 }, yarnPerStitch: { lo: 28.2, hi: 42.4 }, crowding: { lo: 1.75, hi: 2.60 }, vAngle: { lo: 12, hi: 30 } },
  scblo: {}, scflo: {}, picot: {},
}

const mean = (a: number[]): number => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN)
const pct = (a: number[], p: number): number => {
  const s = [...a].sort((x, y) => x - y)
  return s[Math.min(s.length - 1, Math.max(0, Math.round((p / 100) * (s.length - 1))))]!
}

function main(): void {
  const arg = process.argv[2] ?? 'sc'
  // A COMPOSITION PART is not a dictionary swatch (§8f-6): the bear's head and
  // muzzle are spheres built from an explicit round profile, through the same
  // buildSphere the `ball` swatch uses but on the pattern branch. Measuring them
  // beside the swatches is the whole point of the round-5 comparison, so the
  // dump takes `sphere:6,12,18,...` as well as a swatch name and relaxes it with
  // exactly the 'surface' profile buildSwatch uses.
  const profileArg = arg.startsWith('sphere:') ? arg.slice(7).split(',').map(Number) : null
  if (!profileArg && !isSwatchArg(arg)) {
    console.error(`unknown stitch '${arg}' — known: ${Object.keys(SWATCH_RECIPES).join(', ')}, or sphere:<counts>`)
    process.exit(2)
  }
  const yr = Number(process.argv[3] ?? 2.4)
  // The normaliser is the RENDERED yarn diameter, not 2·yr. Every render call
  // site plies the strand to a target OUTER radius of yr*0.85 (§11 crisp-ply
  // recipe), so the yarn a viewer actually sees is 1.7·yr across. Comparing our
  // fabric with a photograph means comparing stitch size to the yarn you can
  // SEE, so that is the unit every published gauge figure is converted into.
  const d = yr * 1.7
  const recipe = profileArg
    ? ({ stitch: 'sc', auditW: 16, status: 'part' } as unknown as (typeof SWATCH_RECIPES)['sc'])
    : SWATCH_RECIPES[arg as keyof typeof SWATCH_RECIPES]
  const T: typeof TARGETS = { ...TARGETS }
  for (const [k, v] of Object.entries(BY_STITCH[recipe.stitch] ?? {})) {
    T[k] = { ...T[k]!, ...(v as { lo: number; hi: number }) }
  }
  const W = recipe.auditW
  // Only buildContinuous clears the shared diagnostic log; a round or sphere
  // build appends to it, so clear it here too and measure exactly one build.
  stitchDebugNodes.length = 0
  postDebugNodes.length = 0
  let built: BuiltContinuous
  if (profileArg) {
    built = buildSphere('sc', 0, yr, profileArg)
    relax(built.model, {
      collMinDist: yr * 1.25,
      collK: 0.28,
      collAdjacency: 9,
      planeZ: 0,
      planeK: 0,
      layoutK: 0.06,
      layoutMode: 'surface',
      floorZ: 0,
      stuffing: STUFF_PRESSURE,
      stuffPrior: STUFF_PRIOR,
      iterations: 560,
    })
  } else {
    built = buildRelaxedSwatch(arg as keyof typeof SWATCH_RECIPES, W, yr).built
  }
  const n = built.model.nodes
  const recs = stitchDebugNodes.slice()
  const posts = postDebugNodes.slice()
  if (posts.length) {
    postBlock(built, yr, d, posts)
    return
  }
  if (!recs.length) {
    console.error(
      `no plain-stitch records for '${arg}' — this dump covers the flat grid builder's plain-stitch family (buildContinuous + emitPlainStitch).`,
    )
    process.exit(2)
  }
  const rows = Math.max(...recs.map((r) => r.j)) + 1
  const seg = (a: number, b: number): number => Math.hypot(n[a]!.x - n[b]!.x, n[a]!.y - n[b]!.y, n[a]!.z - n[b]!.z)

  // ---- THE FABRIC FRAME (§8f-5). A flat swatch is measured against the world
  // plane, exactly as before. A disc or a ball has no such plane: relief rides
  // the LOCAL SURFACE NORMAL and "along the row" is the round's tangent, so the
  // frame is built per node and the reference "plane" is the settled MID-SURFACE.
  interface Vec { x: number; y: number; z: number }
  const frame: 'flat' | 'polar' | 'surface' = built.frame ?? 'flat'
  const curved = frame !== 'flat'
  const C = built.model.radialCenter ?? { x: 0, y: 0, z: 0 }
  const merid = built.model.meridian
  /** t = round tangent, m = meridian, n = m x t (the OUTWARD surface normal). */
  const frameAt = (i: number): { t: Vec; m: Vec; n: Vec } => {
    if (!curved) return { t: { x: 1, y: 0, z: 0 }, m: { x: 0, y: 1, z: 0 }, n: { x: 0, y: 0, z: 1 } }
    const p = n[i]!
    const rc = Math.hypot(p.x, p.y) || 1
    const t: Vec = { x: -p.y / rc, y: p.x / rc, z: 0 }
    const q = merid?.[i]
    const m: Vec = q
      ? { x: q.tr * (p.x / rc), y: q.tr * (p.y / rc), z: q.tz }
      : { x: p.x / rc, y: p.y / rc, z: 0 }
    const c: Vec = { x: m.y * t.z - m.z * t.y, y: m.z * t.x - m.x * t.z, z: m.x * t.y - m.y * t.x }
    const L = Math.hypot(c.x, c.y, c.z) || 1
    return { t, m, n: { x: c.x / L, y: c.y / L, z: c.z / L } }
  }
  // Where a node sits ACROSS the fabric (radius on a disc, polar angle on a
  // ball) and how far OUT it sits (z on a disc, distance from the centre on a
  // ball). The mid-surface is the median "out" per band of "across", so a disc
  // that dishes or a ball that is oblate is not scored as per-stitch relief.
  const across = (i: number): number => {
    const p = n[i]!
    if (frame === 'polar') return Math.hypot(p.x, p.y)
    if (frame === 'surface') return Math.atan2(Math.hypot(p.x - C.x, p.y - C.y), p.z - C.z)
    return 0
  }
  const out = (i: number): number => {
    const p = n[i]!
    if (frame === 'polar') return p.z
    if (frame === 'surface') return Math.hypot(p.x - C.x, p.y - C.y, p.z - C.z)
    return p.z
  }
  const BINS = 40
  let refAt: (i: number) => number = () => 0
  if (curved) {
    const cs: number[] = []
    const hs: number[] = []
    for (let k = built.anchorPins; k < n.length; k++) {
      cs.push(across(k))
      hs.push(out(k))
    }
    const lo = Math.min(...cs)
    const hi = Math.max(...cs)
    const w = (hi - lo) / BINS || 1
    const bins: number[][] = Array.from({ length: BINS + 1 }, () => [])
    for (let k = 0; k < cs.length; k++) bins[Math.min(BINS, Math.max(0, Math.floor((cs[k]! - lo) / w)))]!.push(hs[k]!)
    const med = bins.map((b) => (b.length ? [...b].sort((x, y) => x - y)[b.length >> 1]! : NaN))
    for (let i = 0; i < med.length; i++) {
      if (Number.isFinite(med[i]!)) continue
      let a = i
      while (a >= 0 && !Number.isFinite(med[a]!)) a--
      let b = i
      while (b < med.length && !Number.isFinite(med[b]!)) b++
      med[i] = a >= 0 ? med[a]! : med[b]!
    }
    refAt = (i: number): number => {
      const x = (across(i) - lo) / w
      const b = Math.min(BINS, Math.max(0, Math.floor(x)))
      const f = Math.min(1, Math.max(0, x - b))
      return med[b]! + (med[Math.min(BINS, b + 1)]! - med[b]!) * f
    }
  }
  /** Signed offset from the fabric's own mid-surface along the outward normal. */
  const nOff = (i: number): number => (curved ? out(i) - refAt(i) : n[i]!.z)

  // Index the records by (row, column) so a column can be walked up the rows.
  const byRC = new Map<string, (typeof recs)[number]>()
  for (const r of recs) byRC.set(`${r.j},${r.c}`, r)
  const maxJ = Math.max(...recs.map((r) => r.j))
  // Interior only: the selvedge stitches carry the turn's slack and row 0 carries
  // the turning chain off the pinned foundation, so neither is representative.
  // In the round the "selvedge" is the ring round and the outermost/last round —
  // one is hooked around the ring strand, the other carries the fasten-off.
  const interior = (r: { j: number; c: number }): boolean =>
    curved ? r.j >= 1 && r.j <= maxJ - 1 : r.j >= 1 && r.c >= 2 && r.c <= W - 3

  // --- yarn fed per stitch: the arc length of the ONE strand over one excursion.
  // Node index == position along the strand, so a stitch owns [start, nextStart)
  // — which correctly includes the travel from the previous head into this stitch
  // (a real crocheter's yarn-per-stitch includes it too).
  const sorted = [...recs].sort((a, b) => a.start - b.start)
  const yarnPer: number[] = []
  for (let i = 0; i < sorted.length - 1; i++) {
    const r = sorted[i]!
    if (!interior(r)) continue
    // A flat row ends at a TURN (don't measure across it); a spiral round does
    // not — the strand runs straight on into the next round, which is the point.
    if (!curved && sorted[i + 1]!.j !== r.j) continue
    let L = 0
    for (let k = r.start; k < sorted[i + 1]!.start; k++) L += seg(k, k + 1)
    yarnPer.push(L)
  }

  // --- settled pitches, crown to crown. Flat: along the row lattice and up the
  // column. Round: consecutive crowns in the same round, and the nearest crown
  // in the round below (the round pitch — a spiral has no column to walk).
  const pitchX: number[] = []
  const pitchY: number[] = []
  if (!curved) {
    for (const r of recs) {
      if (!interior(r)) continue
      const right = byRC.get(`${r.j},${r.c + 1}`)
      if (right) pitchX.push(Math.abs(n[right.crown]!.x - n[r.crown]!.x))
      const up = byRC.get(`${r.j + 1},${r.c}`)
      if (up) pitchY.push(Math.abs(n[up.crown]!.y - n[r.crown]!.y))
    }
  } else {
    const byRound = new Map<number, (typeof recs)[number][]>()
    for (const r of sorted) {
      if (!byRound.has(r.j)) byRound.set(r.j, [])
      byRound.get(r.j)!.push(r)
    }
    for (let i = 0; i < sorted.length - 1; i++) {
      const r = sorted[i]!
      if (!interior(r)) continue
      const nx = sorted[i + 1]!
      if (nx.j === r.j) pitchX.push(seg(r.crown, nx.crown))
      const belowRound = byRound.get(r.j - 1) ?? []
      let best = Infinity
      for (const b of belowRound) best = Math.min(best, seg(r.crown, b.crown))
      if (Number.isFinite(best)) pitchY.push(best)
    }
  }

  // --- relief, measured on the row's own WORKED FACE and against the fabric's
  // own mid-surface. Flat fabric turns every row (fz = +1 on even rows, −1 on
  // odd) so raw z cancels across rows; the round builders never turn, so every
  // round works the same face and the sign is simply +1.
  const face = (j: number): number => (curved ? 1 : j % 2 === 0 ? 1 : -1)
  const crownRel: number[] = []
  const legRel: number[] = []
  const hookRel: number[] = []
  const trailRel: number[] = []
  // The settled gap between a post's DOWN-leg and UP-leg. Below one rendered
  // yarn diameter the two strands merge into a single plump lobe instead of
  // reading as the two strands of a post — the close-range "fat coil".
  const legSep: number[] = []
  // The two strands of the HEAD, at this stitch's column — a real stitch's top
  // reads as a pair; below one diameter apart it reads as one cord.
  const headSep: number[] = []
  const headSepY: number[] = []
  const headSepZ: number[] = []
  const legStraight: number[] = []
  const legStraightVis: number[] = []
  const vAngle: number[] = []
  const legOut: number[] = []
  // THE MOUND (§8f-5): how far a single stitch's own yarn stands out of the
  // fabric, peak to trough, along the surface normal. A tidy V-grid stitch lies
  // in the fabric and this figure is about one fabric thickness; a stitch that
  // reads as a knot or a coiled bead standing off the surface has a mound
  // taller than the fabric it sits in, which is exactly what a close-up sees.
  const mound: number[] = []
  const crownOutAbs: number[] = []
  for (const r of recs) {
    if (!interior(r)) continue
    const f = face(r.j)
    crownRel.push(nOff(r.crown) * f)
    hookRel.push(nOff(r.hook) * f)
    for (const k of r.legs) legRel.push(nOff(k) * f)
    for (const k of r.crownTrail) trailRel.push(nOff(k) * f)
    let mLo = Infinity
    let mHi = -Infinity
    for (let k = r.start; k < r.end; k++) {
      const v = nOff(k) * f
      if (v < mLo) mLo = v
      if (v > mHi) mHi = v
    }
    if (Number.isFinite(mLo)) mound.push(mHi - mLo)
    crownOutAbs.push(Math.abs(nOff(r.crown)))
    const L = r.legs
    // Legs are pushed down-leg first (descending) then up-leg (ascending), so a
    // node and its opposite number pair as (k, len-1-k) whatever the leg
    // resolution is — 3 a side for a bare post, more for a stitch whose
    // yarn-over collars need a leg node at every collar height.
    const half = L.length >> 1
    if (L.length >= 4 && L.length % 2 === 0) {
      for (let k = 0; k < half; k++) legSep.push(seg(L[k]!, L[L.length - 1 - k]!))
    }
    if (r.headPartner >= 0) {
      headSep.push(seg(r.crown, r.headPartner))
      const a = n[r.crown]!
      const b = n[r.headPartner]!
      if (curved) {
        // In the surface frame the head's two strands separate ALONG the round
        // and along the NORMAL, not in world y and z.
        const F = frameAt(r.crown)
        const dx = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
        headSepY.push(Math.abs(dx.x * F.t.x + dx.y * F.t.y + dx.z * F.t.z))
        headSepZ.push(Math.abs(nOff(r.crown) - nOff(r.headPartner)))
      } else {
        headSepY.push(Math.abs(a.y - b.y))
        headSepZ.push(Math.abs(a.z - b.z))
      }
    }
    if (L.length >= 4 && L.length % 2 === 0) {
      // STRAIGHTNESS: chord ÷ arc along each leg's own line of nodes. 1.0 is a
      // ruler; a bowed leg reads as the knobbly bead the close-up shows. It is
      // measured over the LEG NODES (plus the hook, for the with-dive figure)
      // rather than every strand node between them: a stitch with yarn-over
      // collars sends the strand on a genuine excursion round the post at each
      // collar, and counting that as leg arc would report a straight leg as bent.
      const down = L.slice(0, half)
      const up = L.slice(half)
      const polyArc = (ks: number[]): number => {
        let arc = 0
        for (let k = 0; k + 1 < ks.length; k++) arc += seg(ks[k]!, ks[k + 1]!)
        return arc > 0 ? seg(ks[0]!, ks[ks.length - 1]!) / arc : NaN
      }
      legStraight.push(polyArc([...down, r.hook]))
      legStraight.push(polyArc([r.hook, ...up]))
      // The VISIBLE leg on its own — the part a close-up actually reads, without
      // the dive corner at the insertion, which is a real corner and can never
      // measure straight.
      legStraightVis.push(polyArc(down))
      legStraightVis.push(polyArc(up))
      // THE V: the angle the two legs open by, measured IN the fabric surface
      // (t along the round, m up the meridian) from the shared insertion at the
      // hook. Flat builds get t = x, m = y — the original measurement exactly.
      const H = n[r.hook]!
      const F = frameAt(r.hook)
      const A = n[L[0]!]!
      const B = n[L[L.length - 1]!]!
      const ang = (P: typeof A): number => {
        const d0 = { x: P.x - H.x, y: P.y - H.y, z: P.z - H.z }
        const u = d0.x * F.t.x + d0.y * F.t.y + d0.z * F.t.z
        const v = d0.x * F.m.x + d0.y * F.m.y + d0.z * F.m.z
        return Math.atan2(curved ? -v : v, u)
      }
      let dv = Math.abs(ang(A) - ang(B))
      if (dv > Math.PI) dv = Math.PI * 2 - dv
      vAngle.push((dv * 180) / Math.PI)
      // OUT OF THE SURFACE: the worst leg node's distance from the mid-surface.
      for (const k of L) legOut.push(Math.abs(nOff(k)))
    }
  }

  // --- thickness: robust extent of the WORKED fabric across its own surface
  // (z for a flat swatch, the normal offset for a disc or a ball).
  const zs: number[] = []
  for (let k = built.anchorPins; k < n.length; k++) zs.push(nOff(k))
  const thickness = pct(zs, 98) - pct(zs, 2)

  // --- ROUND-5 DIAGNOSTICS (§8f-6). Three figures the round-4 write-up reached
  // for by hand, now part of the dump so head/muzzle/ball/disc are read the same
  // way: what is CROWDING each crown, how far the round's crowns are sheared off
  // the crowns they hook, and whether each round sits at the radius its own
  // stitch count wants.
  //
  // 1. CROWN COLLISION CONTACTS — non-adjacent nodes inside the collision
  //    distance of a crown node. Every one of them pushes the crown along the
  //    line between them, and on no-turn fabric the resultant is outward: this
  //    is the census that said the crown "floors" at 0.5-0.67 d proud.
  const collD = yr * 1.25
  const ADJ = 9
  const crownIdx = recs.filter(interior).map((r) => r.crown)
  let contacts = 0
  {
    // A uniform grid over the settled cloud keeps this O(n) rather than O(n^2).
    const cell = collD
    const key = (x: number, y: number, z: number): string =>
      `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`
    const grid = new Map<string, number[]>()
    for (let i = built.anchorPins; i < n.length; i++) {
      const k = key(n[i]!.x, n[i]!.y, n[i]!.z)
      if (!grid.has(k)) grid.set(k, [])
      grid.get(k)!.push(i)
    }
    for (const ci of crownIdx) {
      const p = n[ci]!
      const bx = Math.floor(p.x / cell)
      const by = Math.floor(p.y / cell)
      const bz = Math.floor(p.z / cell)
      for (let ax = -1; ax <= 1; ax++)
        for (let ay = -1; ay <= 1; ay++)
          for (let az = -1; az <= 1; az++)
            for (const j of grid.get(`${bx + ax},${by + ay},${bz + az}`) ?? []) {
              if (Math.abs(j - ci) <= ADJ) continue
              if (seg(ci, j) < collD) contacts++
            }
    }
  }
  const crownContacts = crownIdx.length ? contacts / crownIdx.length : NaN

  // 2. SHEAR — how far ALONG the round a crown sits from the crown its own hook
  //    dives under. Zero in flat grid work by construction; on a round it is
  //    what an increase column produces, and a sheared crown is one the next
  //    round cannot sit squarely on.
  const shear: number[] = []
  if (curved) {
    for (const r of recs) {
      if (!interior(r)) continue
      const c = n[r.crown]!
      const h = n[r.hook]!
      const F = frameAt(r.crown)
      const dv = { x: c.x - h.x, y: c.y - h.y, z: c.z - h.z }
      shear.push(Math.abs(dv.x * F.t.x + dv.y * F.t.y + dv.z * F.t.z))
    }
  }

  // 3. PER-ROUND RADIUS vs the radius the round's own stitch COUNT wants
  //    (count x stitch gauge / 2pi) — the figure that found the stretched pole.
  interface RoundRow { j: number; count: number; rMeas: number; rWant: number; pitch: number; inc: boolean }
  const roundRows: RoundRow[] = []
  if (curved) {
    const swMm = yr * (SWATCH_RECIPES.sc.gaugeYr ?? 2.7)
    const byJ = new Map<number, (typeof recs)[number][]>()
    for (const r of sorted) {
      if (!byJ.has(r.j)) byJ.set(r.j, [])
      byJ.get(r.j)!.push(r)
    }
    let prevCount = 0
    for (const j of [...byJ.keys()].sort((a, b) => a - b)) {
      const rs = byJ.get(j)!
      const cnt = rs.length
      const rMeas = mean(rs.map((r) => Math.hypot(n[r.crown]!.x, n[r.crown]!.y)))
      const ps: number[] = []
      for (let i = 0; i + 1 < rs.length; i++) ps.push(seg(rs[i]!.crown, rs[i + 1]!.crown))
      roundRows.push({ j, count: cnt, rMeas, rWant: (cnt * swMm) / (2 * Math.PI), pitch: mean(ps), inc: cnt !== prevCount })
      prevCount = cnt
    }
  }

  const cellArea = mean(pitchX) * mean(pitchY)
  const rowsWorked = rows

  const rowD = (v: number): string => (v / d).toFixed(2)
  /** `mm` is the measured value in mm; it is reported in yarn diameters too. */
  const line = (label: string, mm: number, key?: keyof typeof TARGETS): void => {
    const vd = mm / d
    const t = key ? T[key]! : undefined
    const tgt = t ? `${t.lo.toFixed(2)}–${t.hi.toFixed(2)}` : '—'
    const ratio = t ? (vd / ((t.lo + t.hi) / 2)).toFixed(2) + '×' : '—'
    const verdict = !t ? '' : vd < t.lo ? 'UNDER' : vd > t.hi ? 'OVER' : 'ok'
    console.log(
      `${label.padEnd(26)}${vd.toFixed(2).padStart(8)}${mm.toFixed(2).padStart(10)}${tgt.padStart(13)}${ratio.padStart(9)}  ${verdict}`,
    )
  }

  const what = frame === 'polar' ? 'rounds' : frame === 'surface' ? 'rounds (surface frame)' : 'rows'
  console.log(`\nSETTLED METRICS — ${arg} [${recipe.status}]  W=${W} ${what}=${rowsWorked} yr=${yr}mm (rendered yarn diameter d=${d.toFixed(2)}mm)`)
  console.log(`measured over ${yarnPer.length} interior stitches; targets are worsted cotton, in yarn diameters`)
  if (curved) console.log(`frame: ${frame} — pitch is along the round, row pitch is round-to-round, relief is along the local surface normal off the settled mid-surface\n`)
  else console.log('')
  console.log(`${'quantity'.padEnd(26)}${'ours(d)'.padStart(8)}${'ours(mm)'.padStart(10)}${'target(d)'.padStart(13)}${'ratio'.padStart(9)}`)
  console.log('-'.repeat(74))
  line('yarn fed per stitch', mean(yarnPer), 'yarnPerStitch')
  line(curved ? 'stitch pitch (round)' : 'stitch pitch (along row)', mean(pitchX), 'stitchPitch')
  line(curved ? 'round pitch' : 'row pitch (up column)', mean(pitchY), 'rowPitch')
  console.log('-'.repeat(74))
  // crowding is a length per area — its "d" column is per-diameter, its mm column per-mm
  {
    const c = mean(yarnPer) / cellArea
    const t = T.crowding!
    const cd = c * d
    console.log(
      `${'crowding (yarn/cell area)'.padEnd(26)}${cd.toFixed(2).padStart(8)}${c.toFixed(3).padStart(10)}${`${t.lo}–${t.hi}`.padStart(13)}${(cd / ((t.lo + t.hi) / 2)).toFixed(2).padStart(8)}×  ${cd < t.lo ? 'UNDER' : cd > t.hi ? 'OVER' : 'ok'}`,
    )
  }
  console.log('-'.repeat(74))
  line('fabric thickness (p2–98)', thickness, 'thickness')
  line('crown proud of its legs', mean(crownRel) - mean(legRel), 'crownProud')
  // §8f-6: once a builder puts its crossing region in a SECOND depth band, "the
  // crown minus its own legs" stops measuring proudness and starts measuring the
  // layer — the legs are genuinely a yarn behind the surface, so the difference
  // grows even as the crown settles further into the fabric. What still means
  // what it says is where the crown sits ACROSS the fabric's own thickness:
  // 0.5 is the face, and flat sc (one layer, alternating rows) sits at 0.49.
  console.log(
    `${'  crown, share of thickness'.padEnd(26)}${(mean(crownRel) / thickness).toFixed(2).padStart(8)}     ratio   (0.5 = the face; flat sc 0.49)`,
  )
  line('per-stitch mound (peak-tr)', mean(mound), 'mound')
  console.log('-'.repeat(74))
  line('  crown apex relief', mean(crownRel))
  line('  crown trail relief', mean(trailRel))
  line('  leg relief', mean(legRel))
  line('  hook relief', mean(hookRel))
  line('  post leg separation', mean(legSep))
  if (headSep.length) {
    line('  head strand separation', mean(headSep))
    line(curved ? '    …of which along round' : '    …of which up the row', mean(headSepY))
    line('    …of which in depth', mean(headSepZ))
  }
  console.log('-'.repeat(74))
  // The bead-vs-V block (§8f round 2). Straightness and the V angle are ratios
  // and degrees, so they bypass the mm→d conversion.
  {
    const row = (label: string, v: number, key: keyof typeof TARGETS, unit = ''): void => {
      const t = T[key]!
      console.log(
        `${label.padEnd(26)}${v.toFixed(2).padStart(8)}${unit.padStart(10)}${`${t.lo}–${t.hi}`.padStart(13)}${(v / ((t.lo + t.hi) / 2)).toFixed(2).padStart(8)}×  ${v < t.lo ? 'UNDER' : v > t.hi ? 'OVER' : 'ok'}`,
      )
    }
    row('leg straightness, visible', mean(legStraightVis), 'legStraight', 'ratio')
    row('leg straightness, w/ dive', mean(legStraight), 'legStraight', 'ratio')
    row('V opening angle', mean(vAngle), 'vAngle', 'deg')
  }
  line(curved ? 'legs out of surface (p90)' : 'leg pair out of plane (max)', pct(legOut, 90), 'legOutOfPlane')
  console.log(`${'  …as a share of thickness'.padEnd(26)}${(pct(legOut, 90) / thickness).toFixed(2).padStart(8)}     ratio   (0 = the mid-plane, 0.5 = the face)`)
  line('crown proud (flat-top bar)', mean(crownRel) - mean(legRel), 'crownProudFlat')
  console.log('-'.repeat(74))
  console.log(`${'crown collision contacts'.padEnd(26)}${crownContacts.toFixed(2).padStart(8)}     per crown  (non-adjacent nodes inside the collision diameter)`)
  if (curved) {
    line('  crown shear along round', mean(shear))
    console.log(`\nPER ROUND — is each round at the radius its own count wants?`)
    console.log(`${'round'.padStart(6)}${'sts'.padStart(6)}${'inc?'.padStart(6)}${'r meas'.padStart(9)}${'r want'.padStart(9)}${'meas/want'.padStart(11)}${'pitch/gauge'.padStart(13)}`)
    const swMm = yr * (SWATCH_RECIPES.sc.gaugeYr ?? 2.7)
    for (const r of roundRows) {
      console.log(
        `${String(r.j).padStart(6)}${String(r.count).padStart(6)}${(r.inc ? 'y' : '·').padStart(6)}${r.rMeas.toFixed(2).padStart(9)}${r.rWant.toFixed(2).padStart(9)}${(r.rMeas / (r.rWant || 1)).toFixed(3).padStart(11)}${(r.pitch / swMm).toFixed(3).padStart(13)}`,
      )
    }
    const plateau = roundRows.filter((r) => !r.inc && r.j > 0)
    const shaped = roundRows.filter((r) => r.inc && r.j > 0)
    console.log(
      `${'plateau rounds'.padStart(20)}: ${plateau.length}/${roundRows.length}   mean pitch/gauge ${mean(plateau.map((r) => r.pitch / swMm)).toFixed(3)}` +
        `    shaped rounds: ${shaped.length}   mean pitch/gauge ${mean(shaped.map((r) => r.pitch / swMm)).toFixed(3)}`,
    )
    console.log('')
  }
  console.log(`stitch cell: ${rowD(mean(pitchX))}d wide x ${rowD(mean(pitchY))}d tall (real sc ≈ 1.6d x 1.4d)`)
  console.log(`\ntargets, in words:`)
  for (const [k, t] of Object.entries(T)) console.log(`  ${k.padEnd(15)} ${t.note}`)
  console.log()
}

/**
 * THE POST FAMILY (§8f-7). fpdc / bpdc / postrib / basketweave do not go through
 * emitPlainStitch — the post branch of buildContinuous rings the stem below
 * instead of hooking the head — so none of the figures above exist for them and
 * the dump reported NaN across the board. These are the figures a 1x1 post rib
 * is actually judged on, and the reason the headband reads as a lattice.
 *
 * Real worsted 1x1 fp/bp rib, measured off reference photographs, in rendered
 * yarn diameters:
 *   - post pitch 1.4-1.6 d: the columns are packed, not spaced.
 *   - the ribs TOUCH — the settled gap between one rib's yarn and the next
 *     rib's yarn is at or below zero, because the raised fp columns lean over
 *     the recessed bp column between them and close it off.
 *   - lean 35-60 degrees: the line from a raised post to the recessed post
 *     beside it is steeply tilted out of the fabric plane. A flat lattice is 0.
 *   - the row structure HIDES: standing in front of the fabric you see vertical
 *     ribs, not the horizontal head line of the row below. Under ~15% of the
 *     row-boundary line should be exposed between the posts.
 *   - fabric thickness 1.8-2.2 d, like every other real crochet fabric.
 */
function postBlock(
  built: BuiltContinuous,
  yr: number,
  d: number,
  posts: typeof postDebugNodes,
): void {
  const n = built.model.nodes
  const rY = d / 2 // the rendered yarn's own radius: what a viewer sees
  const maxJ = Math.max(...posts.map((p) => p.j))
  const maxC = Math.max(...posts.map((p) => p.c))
  const interior = (p: { j: number; c: number }): boolean =>
    p.j >= 1 && p.j <= maxJ - 1 && p.c >= 2 && p.c <= maxC - 2
  const inner = posts.filter(interior)
  /** A post's settled centre in the fabric's front view, and its depth. */
  const centre = (p: (typeof posts)[number]): { x: number; z: number } => ({
    x: mean(p.legs.map((k) => n[k]!.x)),
    z: mean(p.legs.map((k) => n[k]!.z)),
  })

  const byRow = new Map<number, (typeof posts)[number][]>()
  for (const p of inner) {
    if (!byRow.has(p.j)) byRow.set(p.j, [])
    byRow.get(p.j)!.push(p)
  }
  const pitch: number[] = []
  const ribPitch: number[] = []
  const gap: number[] = []
  const lean: number[] = []
  for (const row of byRow.values()) {
    const sortedRow = [...row].sort((a, b) => a.c - b.c)
    for (let i = 0; i + 1 < sortedRow.length; i++) {
      const A = sortedRow[i]!
      const B = sortedRow[i + 1]!
      if (B.c !== A.c + 1) continue
      const ca = centre(A)
      const cb = centre(B)
      pitch.push(Math.abs(cb.x - ca.x))
      // EDGE TO EDGE, seen from the front: the nearest strand of one post to the
      // nearest strand of the next, minus one rendered yarn diameter. <= 0 means
      // the two ribs' yarn touches or overlaps in the front view, which is what
      // a real packed rib does.
      const ax = Math.max(...A.legs.map((k) => n[k]!.x))
      const bx = Math.min(...B.legs.map((k) => n[k]!.x))
      gap.push(bx - ax - d)
      // LEAN: how far out of the fabric plane the line from one post to the next
      // is tilted. A flat lattice of posts all at one depth measures 0; a real
      // rib's raised columns stand well proud of the valley between them.
      lean.push((Math.atan2(Math.abs(cb.z - ca.z), Math.abs(cb.x - ca.x)) * 180) / Math.PI)
    }
    const fps = sortedRow.filter((p) => p.mode === 'fp').sort((a, b) => a.c - b.c)
    for (let i = 0; i + 1 < fps.length; i++) ribPitch.push(Math.abs(centre(fps[i + 1]!).x - centre(fps[i]!).x))
  }

  // FRONT-FACE COVERAGE and ROW-LINE EXPOSURE, rastered at the render radius
  // (§9: measure areal coverage, never argue density from a render). Every
  // worked node is a disc of the rendered yarn's radius in the front view; the
  // frontmost disc covering a sample point is what the eye sees there.
  // The yarn is CONTINUOUS between nodes, so the front view has to be rastered
  // against the SEGMENTS (capsules of the rendered radius), not the nodes. A
  // post's nodes sit up to 1.2 d apart, so a node-only raster reports the
  // stitch's own body as a hole and every coverage figure it produces is wrong.
  const worked: number[] = []
  for (let k = built.anchorPins; k < n.length; k++) worked.push(k)
  const isPost = new Set<number>()
  const isFp = new Set<number>()
  for (const p of posts)
    for (let k = p.start; k < p.end; k++) {
      isPost.add(k)
      if (p.mode === 'fp') isFp.add(k)
    }
  interface Seg { ax: number; ay: number; bx: number; by: number; az: number; bz: number; post: boolean; fp: boolean }
  const segs: Seg[] = []
  for (let i = 0; i + 1 < worked.length; i++) {
    const a = n[worked[i]!]!
    const b = n[worked[i + 1]!]!
    // Skip the jump where the strand leaves one row and starts the next far away.
    if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) > yr * 8) continue
    segs.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, az: a.z, bz: b.z, post: isPost.has(worked[i]!) && isPost.has(worked[i + 1]!), fp: isFp.has(worked[i]!) && isFp.has(worked[i + 1]!) })
  }
  /** Nearest point on a segment to (x, y) in the front view, and its depth. */
  const hit = (sg: Seg, x: number, y: number): number | null => {
    const dx = sg.bx - sg.ax
    const dy = sg.by - sg.ay
    const L2 = dx * dx + dy * dy
    const t = L2 > 0 ? Math.min(1, Math.max(0, ((x - sg.ax) * dx + (y - sg.ay) * dy) / L2)) : 0
    const px2 = sg.ax + dx * t
    const py2 = sg.ay + dy * t
    if ((px2 - x) ** 2 + (py2 - y) ** 2 > rY * rY) return null
    return sg.az + (sg.bz - sg.az) * t
  }
  const xs = inner.map((p) => centre(p).x)
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const ys = inner.flatMap((p) => p.legs.map((k) => n[k]!.y))
  const y0 = Math.min(...ys)
  const y1 = Math.max(...ys)
  const STEP = rY / 3
  let samples = 0
  let covered = 0
  // The row boundaries are where the heads of one row meet the posts of the next
  // — the horizontal line a lattice shows through and a real rib hides.
  const rowYs = [...new Set(inner.map((p) => p.j))].map((j) => {
    const hs = posts.filter((p) => p.j === j).map((p) => n[p.crown]!.y)
    return mean(hs)
  })
  let lineSamples = 0
  let lineExposed = 0
  // What the face is MADE of. The complaint a post-rib close-up reads as a
  // lattice is not that the face has holes (it does not) — it is that the
  // raised fp ribs are too narrow to close over the valley, so between them the
  // eye meets the recessed bp posts and the row's own head line. In a real 1x1
  // rib the raised columns own most of the face.
  let fpFront = 0
  for (let x = x0; x <= x1; x += STEP) {
    for (let y = y0; y <= y1; y += STEP) {
      let frontZ = -Infinity
      let frontIsPost = false
      let frontIsFp = false
      let any = false
      for (const sg of segs) {
        if (Math.min(sg.ax, sg.bx) - rY > x || Math.max(sg.ax, sg.bx) + rY < x) continue
        if (Math.min(sg.ay, sg.by) - rY > y || Math.max(sg.ay, sg.by) + rY < y) continue
        const zz = hit(sg, x, y)
        if (zz === null) continue
        any = true
        if (zz > frontZ) {
          frontZ = zz
          frontIsPost = sg.post
          frontIsFp = sg.fp
        }
      }
      samples++
      if (any) covered++
      if (any && frontIsFp) fpFront++
      // On the row line: is what the eye meets there a POST, or the row's own
      // head showing through the gap?
      if (rowYs.some((ry) => Math.abs(y - ry) <= rY * 0.7)) {
        lineSamples++
        if (!any || !frontIsPost) lineExposed++
      }
    }
  }

  const zs = worked.map((k) => n[k]!.z)
  const thickness = pct(zs, 98) - pct(zs, 2)
  const row = (label: string, v: number, lo: number, hi: number, unit: string): void =>
    console.log(
      `${label.padEnd(30)}${v.toFixed(2).padStart(8)}${unit.padStart(8)}${`${lo}–${hi}`.padStart(13)}   ${v < lo ? 'UNDER' : v > hi ? 'OVER' : 'ok'}`,
    )
  console.log(`\nPOST-RIB METRICS — ${inner.length} interior posts, yr=${yr}mm (rendered yarn diameter d=${d.toFixed(2)}mm)`)
  console.log(`${'quantity'.padEnd(30)}${'ours'.padStart(8)}${'unit'.padStart(8)}${'target'.padStart(13)}`)
  console.log('-'.repeat(72))
  row('post pitch', mean(pitch) / d, 1.4, 1.6, 'd')
  row('fp rib pitch', mean(ribPitch) / d, 2.8, 3.2, 'd')
  row('inter-post gap (front face)', mean(gap) / d, -0.4, 0.0, 'd')
  row('post lean out of plane', mean(lean), 35, 60, 'deg')
  row('row line exposed between posts', (100 * lineExposed) / (lineSamples || 1), 0, 15, '%')
  row('front-face coverage', (100 * covered) / (samples || 1), 90, 100, '%')
  row('face owned by raised ribs', (100 * fpFront) / (samples || 1), 55, 80, '%')
  row('fabric thickness (p2–98)', thickness / d, 1.8, 2.2, 'd')
  console.log('-'.repeat(72))
  console.log(`post half-span (front view)  ${(mean(inner.map((p) => (Math.max(...p.legs.map((k) => n[k]!.x)) - Math.min(...p.legs.map((k) => n[k]!.x))) / 2)) / d).toFixed(2)} d`)
  console.log(`fp / bp depth separation     ${(Math.abs(mean(inner.filter((p) => p.mode === 'fp').map((p) => centre(p).z)) - mean(inner.filter((p) => p.mode === 'bp').map((p) => centre(p).z))) / d || 0).toFixed(2)} d`)
  console.log()
}

main()
