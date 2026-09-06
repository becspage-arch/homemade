/**
 * SOFTNESS METRICS — is a settled round part a rigid frame or a stuffed bag?
 *
 * NUMBERS BEFORE THEORIES (§9). `loom-stitch-metrics.ts` measures the STITCH
 * (does one stitch lie in the fabric); this measures the PART (does the settled
 * surface read as a pressurised fabric bag). A real amigurumi is stuffed: the
 * filling pushes outward everywhere, the yarn pulls back, and the settled shape
 * has no hard edge anywhere — flat tops dome, cap/wall corners round off, walls
 * bulge a little past what the stitch count alone implies, and two stuffed parts
 * flatten where they press together.
 *
 *   cd apps/web && npx tsx scripts/loom-soft-metrics.ts ball [yr]
 *   cd apps/web && npx tsx scripts/loom-soft-metrics.ts sphere:6,12,18,24,24,24,18,12,6
 *   cd apps/web && npx tsx scripts/loom-soft-metrics.ts comp:amigurumi-bear-bigear
 *
 * The five figures, all read off the SETTLED (post-relax) geometry:
 *
 *  (a) CREASE ANGLE at the cap/wall junction — the turn angle of the settled
 *      meridian profile across the last increase round, i.e. the angle between
 *      the surface normals either side of it. A stuffed part has no crease:
 *      < 15 deg. A rigid cylinder-plus-flat-disc-cap has ~90.
 *  (b) SILHOUETTE CURVATURE CONTINUITY — max |second difference| of the profile
 *      radius per round step (mm, and in rendered yarn diameters). A smooth
 *      settled silhouette varies gently; a hard corner spikes.
 *  (c) h/w — settled height over settled width. The canonical +-6 ball wants
 *      ~1.0; unstuffed it is oblate.
 *  (d) WALL BULGE — the widest settled radius over a count plateau against the
 *      radius that plateau's stitch count implies (circumference = count.gauge).
 *      Real stuffed fabric stands 5-10% proud of its own count.
 *  (e) JOIN FLATTENING (compositions) — each part's settled shell recovered as a
 *      surface of revolution about its own pole-to-pole axis, then the
 *      neighbour's fabric measured against it: how deep inside it goes (the
 *      seam), how many of its nodes lie in the contact band, and the RMS gap of
 *      those nodes. Two rigid shells cross at a LINE, so the band nodes are
 *      spread right across it; two stuffed parts share a flattened lens, so
 *      they cluster on the surface and the RMS falls.
 */

import { buildRelaxedSwatch, isSwatchArg } from '../src/lib/loom/crochet/engine/buildSwatch'
import { SWATCH_RECIPES, STITCHES } from '../src/lib/loom/crochet/engine/dictionary'
import { stitchDebugNodes, type BuiltContinuous } from '../src/lib/loom/crochet/engine/yarnPath'
import { buildSphere } from '../src/lib/loom/crochet/engine/shaping'
import { relax, STUFF_PRESSURE, STUFF_PRIOR } from '../src/lib/loom/crochet/engine/relax'
import { compileComposition, type CompositionProgram } from '../src/lib/loom/crochet/engine/composition'
import { COMPOSITION_PROOFS } from './loom-composition-proofs'

interface V3 { x: number; y: number; z: number }

/** Per-round mid-surface profile: the mean cylindrical radius and height of all
 *  the nodes a round put down. Rounds are the fabric's own sampling of the
 *  meridian, so the profile needs no binning or smoothing of its own. */
function roundProfile(built: BuiltContinuous, recs: { j: number; start: number; end: number }[]): {
  r: number; z: number; n: number
}[] {
  const nodes = built.model.nodes
  const byRound = new Map<number, { r: number; z: number; n: number }>()
  for (const rec of recs) {
    for (let i = rec.start; i < rec.end; i++) {
      const p = nodes[i]!
      const acc = byRound.get(rec.j) ?? { r: 0, z: 0, n: 0 }
      acc.r += Math.hypot(p.x, p.y)
      acc.z += p.z
      acc.n += 1
      byRound.set(rec.j, acc)
    }
  }
  return [...byRound.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, a]) => ({ r: a.r / a.n, z: a.z / a.n, n: a.n }))
}

/** Turn angle (deg) of the profile polyline at index k — the angle between the
 *  surface normals either side of round k, which is the same number. */
function turnAt(P: { r: number; z: number }[], k: number): number {
  if (k <= 0 || k >= P.length - 1) return NaN
  const a = { r: P[k]!.r - P[k - 1]!.r, z: P[k]!.z - P[k - 1]!.z }
  const b = { r: P[k + 1]!.r - P[k]!.r, z: P[k + 1]!.z - P[k]!.z }
  const la = Math.hypot(a.r, a.z) || 1
  const lb = Math.hypot(b.r, b.z) || 1
  const c = Math.max(-1, Math.min(1, (a.r * b.r + a.z * b.z) / (la * lb)))
  return (Math.acos(c) * 180) / Math.PI
}

function partMetrics(
  label: string,
  built: BuiltContinuous,
  recs: { j: number; start: number; end: number }[],
  counts: number[],
  yr: number,
  stitch: keyof typeof STITCHES,
): void {
  const d = yr * 1.7
  const sw = yr * STITCHES[stitch].gaugeYr
  const P = roundProfile(built, recs)
  // (a) the cap/wall junction = the LAST round that increased. On a ball the
  //     mirrored decrease side has one too; report the worse of the two.
  let lastInc = -1
  let firstDec = -1
  for (let k = 1; k < counts.length; k++) {
    if (counts[k]! > counts[k - 1]!) lastInc = k
    if (firstDec < 0 && counts[k]! < counts[k - 1]!) firstDec = k - 1
  }
  const creaseTop = lastInc > 0 && lastInc < P.length - 1 ? turnAt(P, lastInc) : NaN
  const creaseBot = firstDec > 0 && firstDec < P.length - 1 ? turnAt(P, firstDec) : NaN
  let creaseMax = 0
  let creaseAt = -1
  for (let k = 1; k < P.length - 1; k++) {
    const t = turnAt(P, k)
    if (t > creaseMax) { creaseMax = t; creaseAt = k }
  }
  // (b) curvature continuity: max |second difference| of the profile radius.
  let d2 = 0
  let d2At = -1
  for (let k = 1; k < P.length - 1; k++) {
    const v = Math.abs(P[k + 1]!.r - 2 * P[k]!.r + P[k - 1]!.r)
    if (v > d2) { d2 = v; d2At = k }
  }
  // (c) h/w on the settled cloud (excluding the pinned anchor ring).
  const nodes = built.model.nodes.slice(built.anchorPins)
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity, minz = Infinity, maxz = -Infinity
  for (const n of nodes) {
    minx = Math.min(minx, n.x); maxx = Math.max(maxx, n.x)
    miny = Math.min(miny, n.y); maxy = Math.max(maxy, n.y)
    minz = Math.min(minz, n.z); maxz = Math.max(maxz, n.z)
  }
  const w = Math.max(maxx - minx, maxy - miny)
  const h = maxz - minz
  // (d) wall bulge over the widest count plateau.
  const maxCount = Math.max(...counts)
  const plateau: number[] = []
  for (let k = 0; k < counts.length; k++) if (counts[k]! === maxCount) plateau.push(k)
  const rImplied = (maxCount * sw) / (2 * Math.PI)
  let rPlateau = 0
  for (const k of plateau) if (k < P.length && P[k]!.r > rPlateau) rPlateau = P[k]!.r
  const bulge = rImplied > 0 ? (rPlateau / rImplied - 1) * 100 : NaN

  console.log(`\n=== ${label} ===  (yr ${yr}, d ${d.toFixed(2)} mm, ${counts.length} rounds, widest ${maxCount})`)
  console.log(`  profile (round: r mm, z mm)`)
  console.log(
    '   ' + P.map((p, i) => `${i}:${p.r.toFixed(1)}/${p.z.toFixed(1)}`).join('  '),
  )
  console.log(`  (a) crease at cap/wall junction (round ${lastInc})   ${fmt(creaseTop)} deg   [target < 15]`)
  if (firstDec >= 0) console.log(`      crease at wall/base junction (round ${firstDec})  ${fmt(creaseBot)} deg`)
  console.log(`      worst crease anywhere (round ${creaseAt})        ${fmt(creaseMax)} deg`)
  console.log(`  (b) max |2nd difference| of radius (round ${d2At})    ${fmt(d2)} mm = ${fmt(d2 / d)} d`)
  console.log(`  (c) settled h/w                                ${fmt(h / w)}   (${h.toFixed(1)} x ${w.toFixed(1)} mm)`)
  console.log(`  (d) wall bulge over the plateau                ${fmt(bulge)} %   (settled r ${rPlateau.toFixed(2)} vs count-implied ${rImplied.toFixed(2)} mm)   [real +5..10]`)
}

function fmt(v: number): string {
  return Number.isFinite(v) ? v.toFixed(2).padStart(6) : '   n/a'
}

/** A part is a SURFACE OF REVOLUTION by construction (every builder lays rounds
 *  about one axis) and placement is a rigid transform, so its settled shell can
 *  be recovered exactly wherever it ends up: take the cloud's principal axis,
 *  bin along it, and read the widest cylindrical radius per bin. `inside` is
 *  then an honest solid test — rho < R(zeta) — not a convex-hull guess. */
interface Shell {
  c: V3
  axis: V3
  z0: number
  step: number
  R: number[]
}

function buildShell(cloud: V3[], bins = 24): Shell {
  // The axis of revolution is the part's own POLE-TO-POLE line: the strand path
  // starts on the magic ring at one pole and fastens off at the other, so the
  // first and last control points name it exactly, whatever rigid transform the
  // placement applied. (PCA would pick the WIDEST axis, which on an oblate ball
  // is an equatorial one — the degenerate pair, not the axis.)
  const p0 = cloud[0]!
  const p1 = cloud[cloud.length - 1]!
  let cx = 0, cy = 0, cz = 0
  for (const p of cloud) { cx += p.x; cy += p.y; cz += p.z }
  const c: V3 = { x: cx / cloud.length, y: cy / cloud.length, z: cz / cloud.length }
  const ax = p1.x - p0.x, ay = p1.y - p0.y, az = p1.z - p0.z
  const al = Math.hypot(ax, ay, az) || 1
  const axis: V3 = { x: ax / al, y: ay / al, z: az / al }
  let lo = Infinity, hi = -Infinity
  for (const p of cloud) {
    const t = (p.x - c.x) * axis.x + (p.y - c.y) * axis.y + (p.z - c.z) * axis.z
    lo = Math.min(lo, t); hi = Math.max(hi, t)
  }
  const step = (hi - lo) / bins || 1
  const R = new Array<number>(bins + 1).fill(0)
  for (const p of cloud) {
    const dx = p.x - c.x, dy = p.y - c.y, dz = p.z - c.z
    const t = dx * axis.x + dy * axis.y + dz * axis.z
    const rho = Math.sqrt(Math.max(dx * dx + dy * dy + dz * dz - t * t, 0))
    const k = Math.max(0, Math.min(bins, Math.round((t - lo) / step)))
    if (rho > R[k]!) R[k] = rho
  }
  return { c, axis, z0: lo, step, R }
}

/** Signed depth of a world point inside a shell: > 0 = inside, in mm. */
function shellDepth(sh: Shell, p: V3): number {
  const dx = p.x - sh.c.x, dy = p.y - sh.c.y, dz = p.z - sh.c.z
  const t = dx * sh.axis.x + dy * sh.axis.y + dz * sh.axis.z
  const rho = Math.sqrt(Math.max(dx * dx + dy * dy + dz * dz - t * t, 0))
  const f = (t - sh.z0) / sh.step
  if (f < -0.5 || f > sh.R.length - 0.5) return -Infinity // past a pole: outside
  const i = Math.max(0, Math.min(sh.R.length - 2, Math.floor(f)))
  const u = Math.max(0, Math.min(1, f - i))
  const R = sh.R[i]! * (1 - u) + sh.R[i + 1]! * u
  return R - rho
}

function compMetrics(prog: CompositionProgram, yr: number): void {
  const d = yr * 1.7
  const c = compileComposition(prog, yr)
  console.log(`\n=== composition ${prog.name} === (${c.placed.length} parts, hash ${c.geometryHash})`)
  if (c.problems.length) console.log(`  AUDIT PROBLEMS: ${c.problems.length}`)
  const centroid = (pts: V3[]): V3 => {
    let x = 0, y = 0, z = 0
    for (const p of pts) { x += p.x; y += p.y; z += p.z }
    return { x: x / pts.length, y: y / pts.length, z: z / pts.length }
  }
  const byName = new Map(c.placed.map((p) => [p.part.name, p]))
  const shells = new Map<string, Shell>()
  for (const pp of c.placed) shells.set(pp.part.name, buildShell(pp.ctrl))
  for (const pp of c.placed) {
    const place = pp.part.place as { on: string }
    if (place.on === 'ground') continue
    const parent = byName.get(place.on)
    if (!parent) continue
    const sh = shells.get(place.on)!
    let deepest = 0
    let inside = 0
    let sumDepth = 0
    const contact: V3[] = []
    const gaps: number[] = []
    for (const p of pp.ctrl) {
      const depth = shellDepth(sh, p)
      if (!Number.isFinite(depth)) continue
      if (depth > 0) { inside++; sumDepth += depth; if (depth > deepest) deepest = depth }
      if (Math.abs(depth) < d) { contact.push(p); gaps.push(depth) }
    }
    let rms = 0
    for (const g of gaps) rms += g * g
    rms = contact.length ? Math.sqrt(rms / contact.length) : 0
    let patch = 0
    if (contact.length > 2) {
      const cc = centroid(contact)
      for (const p of contact) patch = Math.max(patch, Math.hypot(p.x - cc.x, p.y - cc.y, p.z - cc.z))
    }
    console.log(
      `  ${pp.part.name} -> ${place.on}: nodes inside ${inside}/${pp.ctrl.length}` +
        ` (${((100 * inside) / pp.ctrl.length).toFixed(1)}%), deepest ${deepest.toFixed(2)} mm = ${(deepest / d).toFixed(2)} d,` +
        ` mean ${(inside ? sumDepth / inside : 0).toFixed(2)} mm; contact nodes ${contact.length}, patch r ${patch.toFixed(1)} mm,` +
        ` gap rms ${rms.toFixed(2)} mm = ${(rms / d).toFixed(2)} d`,
    )
  }
}

function main(): void {
  const arg = process.argv[2] ?? 'ball'
  const yr = Number(process.argv[3] ?? 2.4)
  if (arg.startsWith('comp:')) {
    const name = arg.slice(5)
    const prog = COMPOSITION_PROOFS[name]
    if (!prog) {
      console.error(`unknown composition '${name}' — known: ${Object.keys(COMPOSITION_PROOFS).join(', ')}`)
      process.exit(2)
    }
    compMetrics(prog, yr)
    return
  }
  stitchDebugNodes.length = 0
  let built: BuiltContinuous
  let counts: number[]
  let stitch: keyof typeof STITCHES = 'sc'
  if (arg.startsWith('sphere:')) {
    counts = arg.slice(7).split(',').map(Number)
    built = buildSphere('sc', 0, yr, counts)
    relax(built.model, {
      collMinDist: yr * 1.25, collK: 0.28, collAdjacency: 9,
      planeZ: 0, planeK: 0, layoutK: 0.06, layoutMode: 'surface', floorZ: 0, iterations: 560,
      stuffing: STUFF_PRESSURE, stuffPrior: STUFF_PRIOR,
    })
  } else if (isSwatchArg(arg)) {
    const recipe = SWATCH_RECIPES[arg]
    stitch = recipe.stitch
    built = buildRelaxedSwatch(arg, recipe.auditW, yr).built
    counts = recipe.roundCounts ?? []
    if (!counts.length) {
      // A derived-count sphere: recover the counts from the build's own records.
      const per = new Map<number, number>()
      for (const r of stitchDebugNodes) per.set(r.j, (per.get(r.j) ?? 0) + 1)
      counts = [...per.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v)
    }
  } else {
    console.error(`unknown target '${arg}' — a swatch name, sphere:<counts>, or comp:<name>`)
    process.exit(2)
    return
  }
  const recs = stitchDebugNodes.map((r) => ({ j: r.j, start: r.start, end: r.end }))
  if (!recs.length) {
    console.error(`no round records for '${arg}' — this dump covers the round/sphere builders.`)
    process.exit(2)
  }
  partMetrics(arg, built, recs, counts, yr, stitch)
}

main()
