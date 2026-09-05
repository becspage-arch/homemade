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
 */

import { buildRelaxedSwatch, isSwatchArg } from '../src/lib/loom/crochet/engine/buildSwatch'
import { SWATCH_RECIPES } from '../src/lib/loom/crochet/engine/dictionary'
import { stitchDebugNodes } from '../src/lib/loom/crochet/engine/yarnPath'

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
  if (!isSwatchArg(arg)) {
    console.error(`unknown stitch '${arg}' — known: ${Object.keys(SWATCH_RECIPES).join(', ')}`)
    process.exit(2)
  }
  const yr = Number(process.argv[3] ?? 2.4)
  // The normaliser is the RENDERED yarn diameter, not 2·yr. Every render call
  // site plies the strand to a target OUTER radius of yr*0.85 (§11 crisp-ply
  // recipe), so the yarn a viewer actually sees is 1.7·yr across. Comparing our
  // fabric with a photograph means comparing stitch size to the yarn you can
  // SEE, so that is the unit every published gauge figure is converted into.
  const d = yr * 1.7
  const recipe = SWATCH_RECIPES[arg]
  const T: typeof TARGETS = { ...TARGETS }
  for (const [k, v] of Object.entries(BY_STITCH[recipe.stitch] ?? {})) {
    T[k] = { ...T[k]!, ...(v as { lo: number; hi: number }) }
  }
  const W = recipe.auditW
  const { built } = buildRelaxedSwatch(arg, W, yr)
  const n = built.model.nodes
  const recs = stitchDebugNodes.slice()
  if (!recs.length) {
    console.error(
      `no plain-stitch records for '${arg}' — this dump covers the flat grid builder's plain-stitch family (buildContinuous + emitPlainStitch).`,
    )
    process.exit(2)
  }
  const rows = Math.max(...recs.map((r) => r.j)) + 1
  const seg = (a: number, b: number): number => Math.hypot(n[a]!.x - n[b]!.x, n[a]!.y - n[b]!.y, n[a]!.z - n[b]!.z)

  // Index the records by (row, column) so a column can be walked up the rows.
  const byRC = new Map<string, (typeof recs)[number]>()
  for (const r of recs) byRC.set(`${r.j},${r.c}`, r)
  // Interior only: the selvedge stitches carry the turn's slack and row 0 carries
  // the turning chain off the pinned foundation, so neither is representative.
  const interior = (r: { j: number; c: number }): boolean => r.j >= 1 && r.c >= 2 && r.c <= W - 3

  // --- yarn fed per stitch: the arc length of the ONE strand over one excursion.
  // Node index == position along the strand for buildContinuous, so a stitch owns
  // [start, nextStart) — which correctly includes the travel from the previous
  // head into this stitch (a real crocheter's yarn-per-stitch includes it too).
  const sorted = [...recs].sort((a, b) => a.start - b.start)
  const yarnPer: number[] = []
  for (let i = 0; i < sorted.length - 1; i++) {
    const r = sorted[i]!
    if (!interior(r)) continue
    if (sorted[i + 1]!.j !== r.j) continue // don't measure across a turn
    let L = 0
    for (let k = r.start; k < sorted[i + 1]!.start; k++) L += seg(k, k + 1)
    yarnPer.push(L)
  }

  // --- settled pitches, crown to crown.
  const pitchX: number[] = []
  const pitchY: number[] = []
  for (const r of recs) {
    if (!interior(r)) continue
    const right = byRC.get(`${r.j},${r.c + 1}`)
    if (right) pitchX.push(Math.abs(n[right.crown]!.x - n[r.crown]!.x))
    const up = byRC.get(`${r.j + 1},${r.c}`)
    if (up) pitchY.push(Math.abs(n[up.crown]!.y - n[r.crown]!.y))
  }

  // --- relief on the row's own WORKED FACE. fz = +1 on even rows, −1 on odd, so
  // raw z cancels across rows; multiplying by the face sign measures "how far
  // this part stands out of the fabric on the side it was worked from".
  const face = (j: number): number => (j % 2 === 0 ? 1 : -1)
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
  for (const r of recs) {
    if (!interior(r)) continue
    const f = face(r.j)
    crownRel.push(n[r.crown]!.z * f)
    hookRel.push(n[r.hook]!.z * f)
    for (const k of r.legs) legRel.push(n[k]!.z * f)
    for (const k of r.crownTrail) trailRel.push(n[k]!.z * f)
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
      headSepY.push(Math.abs(a.y - b.y))
      headSepZ.push(Math.abs(a.z - b.z))
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
      // THE V: the angle the two legs open by, measured in the fabric PLANE
      // (x along the row, y up it) from the shared insertion at the hook.
      const H = n[r.hook]!
      const A = n[L[0]!]!
      const B = n[L[L.length - 1]!]!
      const ang = (P: typeof A): number => Math.atan2(P.y - H.y, P.x - H.x)
      let dv = Math.abs(ang(A) - ang(B))
      if (dv > Math.PI) dv = Math.PI * 2 - dv
      vAngle.push((dv * 180) / Math.PI)
      // OUT OF PLANE: the worst leg node's distance from the fabric mid-plane.
      for (const k of L) legOut.push(Math.abs(n[k]!.z))
    }
  }

  // --- thickness: robust z extent of the WORKED fabric (skip the pinned anchor).
  const zs: number[] = []
  for (let k = built.anchorPins; k < n.length; k++) zs.push(n[k]!.z)
  const thickness = pct(zs, 98) - pct(zs, 2)

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

  console.log(`\nSETTLED METRICS — ${arg} [${recipe.status}]  W=${W} rows=${rowsWorked} yr=${yr}mm (rendered yarn diameter d=${d.toFixed(2)}mm)`)
  console.log(`measured over ${yarnPer.length} interior stitches; targets are worsted cotton, in yarn diameters\n`)
  console.log(`${'quantity'.padEnd(26)}${'ours(d)'.padStart(8)}${'ours(mm)'.padStart(10)}${'target(d)'.padStart(13)}${'ratio'.padStart(9)}`)
  console.log('-'.repeat(74))
  line('yarn fed per stitch', mean(yarnPer), 'yarnPerStitch')
  line('stitch pitch (along row)', mean(pitchX), 'stitchPitch')
  line('row pitch (up column)', mean(pitchY), 'rowPitch')
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
  line('fabric thickness (z p2–98)', thickness, 'thickness')
  line('crown proud of its legs', mean(crownRel) - mean(legRel), 'crownProud')
  console.log('-'.repeat(74))
  line('  crown apex relief', mean(crownRel))
  line('  crown trail relief', mean(trailRel))
  line('  leg relief', mean(legRel))
  line('  hook relief', mean(hookRel))
  line('  post leg separation', mean(legSep))
  if (headSep.length) {
    line('  head strand separation', mean(headSep))
    line('    …of which up the row', mean(headSepY))
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
  line('leg pair out of plane (max)', pct(legOut, 90), 'legOutOfPlane')
  console.log(`${'  …as a share of thickness'.padEnd(26)}${(pct(legOut, 90) / thickness).toFixed(2).padStart(8)}     ratio   (0 = the mid-plane, 0.5 = the face)`)
  line('crown proud (flat-top bar)', mean(crownRel) - mean(legRel), 'crownProudFlat')
  console.log('-'.repeat(74))
  console.log(`stitch cell: ${rowD(mean(pitchX))}d wide x ${rowD(mean(pitchY))}d tall (real sc ≈ 1.6d x 1.4d)`)
  console.log(`\ntargets, in words:`)
  for (const [k, t] of Object.entries(T)) console.log(`  ${k.padEnd(15)} ${t.note}`)
  console.log()
}

main()
