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
  stitchPitch: { lo: 1.49, hi: 1.70, note: '14–16 sts / 10 cm' },
  rowPitch: { lo: 1.33, hi: 1.49, note: '16–18 rows / 10 cm' },
  crowding: { lo: 2.8, hi: 4.8, note: 'yarn length per unit cell area (derived from the two above)' },
  thickness: { lo: 1.8, hi: 2.2, note: 'sc fabric ≈ 2 yarn diameters thick' },
  crownProud: { lo: 0.0, hi: 0.5, note: 'top loops lie nearly flat — proud by under half a diameter' },
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
  for (const r of recs) {
    if (!interior(r)) continue
    const f = face(r.j)
    crownRel.push(n[r.crown]!.z * f)
    hookRel.push(n[r.hook]!.z * f)
    for (const k of r.legs) legRel.push(n[k]!.z * f)
    for (const k of r.crownTrail) trailRel.push(n[k]!.z * f)
    const L = r.legs
    if (L.length === 6) {
      // legs are pushed down-leg (3, descending) then up-leg (3, ascending), so
      // matching heights pair as (0,5), (1,4), (2,3).
      for (const [a, b] of [[0, 5], [1, 4], [2, 3]] as const) legSep.push(seg(L[a]!, L[b]!))
    }
    if (r.headPartner >= 0) headSep.push(seg(r.crown, r.headPartner))
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
    const t = key ? TARGETS[key]! : undefined
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
    const t = TARGETS.crowding!
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
  if (headSep.length) line('  head strand separation', mean(headSep))
  console.log('-'.repeat(74))
  console.log(`stitch cell: ${rowD(mean(pitchX))}d wide x ${rowD(mean(pitchY))}d tall (real sc ≈ 1.6d x 1.4d)`)
  console.log(`\ntargets, in words:`)
  for (const [k, t] of Object.entries(TARGETS)) console.log(`  ${k.padEnd(15)} ${t.note}`)
  console.log()
}

main()
