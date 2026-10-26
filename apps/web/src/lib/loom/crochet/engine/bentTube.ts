/**
 * THE BENT TUBE — a tube that CURVES AS IT IS WORKED (bent-tube pass,
 * 2026-10-26; STITCH_ENGINE.md §8r). Horns with a cheeky upward curl, tails,
 * trunks, curved ears, a bent knee: the way designers write them.
 *
 * A designer curves a tube by making one side of every round LONGER than the
 * other: taller stitches (htr, US hdc) on the outside of the curve,
 * double crochet (US sc) on the inside. Each round is still a ring of `count`
 * stitches (its circumference is the count's), but along the outside it climbs
 * a taller stitch than along the inside, so the next ring cannot sit parallel
 * to the last: it tilts away from the tall side by the angle whose arc makes up
 * the difference. Round after round the tilts add up, and the tube bends.
 *
 * That is exactly what is built here, and nothing else bends it:
 *
 *   1. Every stitch of every round is its own stitch (sc, hdc or dc, `plan`),
 *      emitted by the locked emitters (`emitPlainStitch`, `emitDecrease`) on
 *      the stitch BELOW it, so every column climbs its own stitches' heights
 *      (the fabric coordinate at each angle is the sum of the heights worked
 *      there).
 *   2. Each round's ring is laid at the radius its count makes, and tilted
 *      from the last by the first Fourier (cos) component of that round's
 *      height difference around the ring, divided by the ring's radius: the
 *      only tilt under which both the ring's circumference AND every column's
 *      height are honoured. No angle is supplied to the builder; the bend is
 *      whatever the stitches add up to. (`planBend` chooses the stitches for a
 *      requested angle the way a designer would, from the same formula.)
 *   3. The fabric is relaxed like every tube (yarn length, bending, collision,
 *      the blocked hold along each node's own meridian — `YarnModel.frame3`,
 *      the curved-axis form of the 'surface' hold) and audited in the same
 *      per-node frame. `bentTubeMetrics` then MEASURES the bend off the settled
 *      nodes (round-plane normals), the outer/inner stitch heights, and checks
 *      no round has folded into another (self-intersection).
 *
 * Spiral only, magic-ring start (a horn tip, a tail tip, a foot), open end (the
 * piece is stuffed lightly and sewn on by its open end, which is how real
 * horns and tails are finished). Nothing here is imported by an existing
 * builder; an existing piece never reaches this file, so every geometry hash
 * is untouched by construction.
 */

import { STITCHES, type ShapeOp, type StitchId } from './dictionary'
import { HOOK_SPREAD_YR, createStrand, dimsFor, emitPlainStitch, headApexRelief, rowPitchYr, type BuiltContinuous, type StitchDims } from './yarnPath'
import { emitDecrease, roundOps } from './shaping'

/** The two stitches a bent round mixes (US names, the loom's internal ones):
 *  sc on the inside of the curve, hdc on the outside. (A dc outside was tried,
 *  hdc-flanked: a dc column is 2.6 x an sc's, the step round the ring is too
 *  big for the ring to take smoothly, and the settled piece lost a third of
 *  its bend and floated a hook — see §8r. A stronger curve is more rounds or
 *  a wider share of hdc.) */
export type BendStitch = 'sc' | 'hdc'

export interface BentTubeSpec {
  /** Stitches per round, round 1 worked into a magic ring. */
  rounds: number[]
  /** Per round, the stitch MADE at each position in work order (inc pairs are
   *  two entries, a decrease one entry and always sc). Absent round = all sc. */
  plan: BendStitch[][]
  /** Column-gauge override (yarn radii) — the density knob, as for a tube. */
  gaugeYr?: number
}

/** A designer's request for a bend (`planBend`). */
export interface BendRequest {
  /** The total bend, tip to base (degrees). */
  angleDeg: number
  /** Where along the piece the bend is worked, as fractions of the rounds from
   *  round 1 (the magic-ring end: the tip of a horn or tail). Default 0.15–0.8:
   *  the tip curls, the sewn end stays straight. */
  from?: number
  to?: number
  /** Rounds narrower than this are not bent (default 6: a tip of 4-5
   *  stitches has hardly a "side"). */
  minCount?: number
}

export interface BendPlan {
  spec: BentTubeSpec
  /** The bend the chosen stitches make, by the builder's own formula (deg). */
  predictedDeg: number
  /** The rounds (0-based) that carry tall stitches. */
  bentRounds: number[]
  /** The share of each bent round worked in hdc. */
  share: number
}

/** Meridian advance a round, × the row pitch — the tube's own DRIFT_SCALE. */
const DRIFT_SCALE = 1.05
const SURFACE_LAY = 1
const BACK_CROSS = 1
const RING_N = 18
/** The magic ring's radius in yarn radii (tube.ts `rr`). */
const RING_R_YR = 1.15
const PHASE = ((RING_N - 1) / RING_N) * Math.PI * 2
/** Body gauge: sc. */
const BODY: StitchId = 'sc'

/** One stitch's row pitch in yarn radii (its height, as a round of it climbs). */
const pitchYr = (id: StitchId): number => rowPitchYr(id) * DRIFT_SCALE

/** The angle of stitch i of a `count`-stitch round (tube.ts's own placement). */
const stitchAngle = (count: number, i: number): number => PHASE + ((i + 0.5) / count) * Math.PI * 2

/** The middle of each round: the tall stitches are centred here (the outside
 *  of the curve is the middle of the round, counted from its first stitch). */
const OUTER = PHASE + Math.PI

interface DryStitch {
  id: StitchId
  theta: number
  /** Fabric coordinate of its crown (yarn radii). */
  m: number
  op: ShapeOp
}

/** Walk the rounds exactly as the builder works them: which below stitch each
 *  op sits on, and the fabric height its crown reaches (yarn radii). */
function dryRun(spec: BentTubeSpec): DryStitch[][] {
  const out: DryStitch[][] = []
  const rr = RING_R_YR
  for (let k = 0; k < spec.rounds.length; k++) {
    const count = spec.rounds[k]!
    const ids = spec.plan[k] ?? Array<BendStitch>(count).fill('sc')
    const row: DryStitch[] = []
    if (k === 0) {
      for (let i = 0; i < count; i++) row.push({ id: ids[i]!, theta: stitchAngle(count, i), m: rr + pitchYr(ids[i]!), op: 'st' })
    } else {
      const below = out[k - 1]!
      const ops = roundOps(spec.rounds[k - 1]!, count, (k % 2) * 0.5)
      let bi = 0
      let li = 0
      for (const op of ops) {
        if (op === 'dec') {
          const b1 = below[bi++]!
          const b2 = below[bi++]!
          row.push({ id: 'sc', theta: stitchAngle(count, li), m: (b1.m + b2.m) / 2 + pitchYr('sc'), op })
          li++
        } else {
          const b = below[bi++]!
          const n = op === 'inc' ? 2 : 1
          for (let t = 0; t < n; t++) {
            const id = ids[li]!
            row.push({ id, theta: stitchAngle(count, li), m: b.m + pitchYr(id), op })
            li++
          }
        }
      }
    }
    out.push(row)
  }
  return out
}

/** A ring's radius (yarn radii) from its count, as the tube lays it. */
const ringR = (count: number, swYr: number): number => Math.max((count * swYr) / (2 * Math.PI), 0.6)

/**
 * Per round: the axis advance and the TILT the round's stitches make. The
 * heights round the ring are h(θ); their mean is the advance (less what the
 * radius change uses, the tube's pitch-continuity rule) and their first cos/sin
 * component (b, c) over the ring's mean radius is the tilt, toward the SHORT
 * side. Yarn-radius units; pure function of the counts and the stitches.
 */
function roundTilts(spec: BentTubeSpec, dry: DryStitch[][]): { adv: number; phi: number; dirTheta: number; r: number }[] {
  const swYr = spec.gaugeYr ?? STITCHES[BODY].gaugeYr
  const out: { adv: number; phi: number; dirTheta: number; r: number }[] = []
  let rPrev = RING_R_YR
  for (let k = 0; k < dry.length; k++) {
    const row = dry[k]!
    const r = ringR(spec.rounds[k]!, swYr)
    const n = row.length
    let A = 0, B = 0, C = 0
    for (const s of row) {
      const h = pitchYr(s.id)
      A += h / n
      B += (2 / n) * h * Math.cos(s.theta - OUTER)
      C += (2 / n) * h * Math.sin(s.theta - OUTER)
    }
    // Round 1 rises off the ring with no "side": no tilt.
    const amp = k === 0 ? 0 : Math.hypot(B, C)
    const rMean = (r + rPrev) / 2
    const dr = r - rPrev
    const adv = Math.sqrt(Math.max(A * A - dr * dr, (0.25 * A) ** 2))
    out.push({ adv, phi: amp / Math.max(rMean, 0.6), dirTheta: OUTER + Math.atan2(C, B), r })
    rPrev = r
  }
  return out
}

/** The bend (degrees) a spec's stitches make — the sum of its round tilts,
 *  measured as the angle between the first and last ring normals. */
export function predictedBendDeg(spec: BentTubeSpec): number {
  // Round 2's ring to the last but one's — the pair `bentTubeMetrics` measures.
  const rings = ringFrames(spec, roundTilts(spec, dryRun(spec)), 1)
  const a = rings[2]!.T
  const b = rings[rings.length - 2]!.T
  return (Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * 180) / Math.PI
}

/** The predicted axis of every ring (magic ring first), builder frame. */
export function predictedRingAxes(spec: BentTubeSpec): V3[] {
  return ringFrames(spec, roundTilts(spec, dryRun(spec)), 1).map((g) => g.T)
}

/** All-sc plan for a set of counts (a straight tube). */
export function straightPlan(rounds: number[]): BendStitch[][] {
  return rounds.map((c) => Array<BendStitch>(c).fill('sc'))
}

/** A round's stitches with `nTall` hdc centred on the round's middle. */
function roundPlan(count: number, nTall: number): BendStitch[] {
  const ids = Array<BendStitch>(count).fill('sc')
  if (nTall <= 0) return ids
  const mid = (count - 1) / 2
  // Rank positions by distance from the middle of the round.
  const order = Array.from({ length: count }, (_, i) => i).sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b)
  const core = order.slice(0, Math.min(nTall, count))
  for (const i of core) ids[i] = 'hdc'
  return ids
}

/** Positions of the decreases in a round (they must stay sc). */
function decSlots(prev: number, count: number, k: number): Set<number> {
  const out = new Set<number>()
  if (count >= prev) return out
  let li = 0
  for (const op of roundOps(prev, count, (k % 2) * 0.5)) {
    if (op === 'dec') out.add(li)
    li += op === 'inc' ? 2 : 1
  }
  return out
}

/**
 * The stitches for a requested bend, the way a designer works it out: over
 * the rounds in [from, to] (and at least `minCount` wide), the same share of
 * each round worked tall, centred on the middle of the round; the share is
 * chosen so the bend the stitches make (`predictedBendDeg`, the builder's own
 * rule) is as near the request as whole stitches allow. Half of every round
 * in hdc is the most a stretch of rounds can bend (`predictedDeg` says what
 * was reached; widen [from, to] or add rounds for more).
 */
export function planBend(rounds: number[], req: BendRequest, gaugeYr?: number): BendPlan {
  const from = req.from ?? 0.15
  const to = req.to ?? 0.8
  const minCount = req.minCount ?? 6
  const n = rounds.length
  const bentRounds: number[] = []
  // Rounds 3 .. n-1 only: round 1 has no side, and the bend is measured
  // between round 2's and the last but one's head lines.
  for (let k = 2; k < n - 1; k++) {
    const f = k / Math.max(1, n - 1)
    if (f >= from - 1e-9 && f <= to + 1e-9 && rounds[k]! >= minCount) bentRounds.push(k)
  }
  const make = (share: number, stride: number): BentTubeSpec => {
    const plan = straightPlan(rounds)
    bentRounds.forEach((k, i) => {
      if (i % stride !== 0) return
      const ids = roundPlan(rounds[k]!, Math.round(share * rounds[k]!))
      for (const d of decSlots(rounds[k - 1]!, rounds[k]!, k)) ids[d] = 'sc'
      plan[k] = ids
    })
    return { rounds, plan, gaugeYr }
  }
  // Whole-stitch shares: sweep finely and keep the nearest (the bend is not
  // smooth in the share — each round rounds its own count). Past half the
  // round the cos component of the step falls again, so half is the most. A
  // gentle curve that one htr a round would overshoot is worked on every
  // second or third round of the stretch instead (`stride`).
  let best = { spec: make(0, 1), deg: 0, share: 0 }
  for (const stride of [1, 2, 3]) {
    for (let s = 1; s <= 50; s++) {
      const spec = make(s / 100, stride)
      const deg = predictedBendDeg(spec)
      if (Math.abs(deg - req.angleDeg) < Math.abs(best.deg - req.angleDeg) - 0.5) best = { spec, deg, share: s / 100 }
    }
  }
  return { spec: best.spec, predictedDeg: best.deg, bentRounds: bentRounds.filter((k) => best.spec.plan[k]!.some((x) => x !== 'sc')), share: best.share }
}

// ── geometry ───────────────────────────────────────────────────────────────

interface V3 { x: number; y: number; z: number }
const add = (a: V3, b: V3): V3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z })
const sub = (a: V3, b: V3): V3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z })
const mul = (a: V3, s: number): V3 => ({ x: a.x * s, y: a.y * s, z: a.z * s })
const dot = (a: V3, b: V3): number => a.x * b.x + a.y * b.y + a.z * b.z
const cross = (a: V3, b: V3): V3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x })
const unit = (a: V3): V3 => mul(a, 1 / (Math.hypot(a.x, a.y, a.z) || 1))

interface Ring {
  C: V3
  T: V3
  E1: V3
  E2: V3
  r: number
}

/** Rotate v by the rotation taking T to T' in the plane (T, d), d ⟂ T. */
function rotInPlane(v: V3, T: V3, d: V3, phi: number): V3 {
  const w = cross(T, d)
  const vt = dot(v, T), vd = dot(v, d), vw = dot(v, w)
  const c = Math.cos(phi), s = Math.sin(phi)
  // T → cT − s d ; d → c d + s T (the ring tilts AWAY from the tall side d).
  return add(add(mul(T, vt * c + vd * s), mul(d, -vt * s + vd * c)), mul(w, vw))
}

/** The ring frames, from the magic ring (index 0) through every round. Units:
 *  `unitMm` per yarn radius. */
function ringFrames(spec: BentTubeSpec, tilts: ReturnType<typeof roundTilts>, unitMm: number): Ring[] {
  const rings: Ring[] = [{ C: { x: 0, y: 0, z: 0 }, T: { x: 0, y: 0, z: -1 }, E1: { x: 1, y: 0, z: 0 }, E2: { x: 0, y: 1, z: 0 }, r: RING_R_YR * unitMm }]
  for (let k = 0; k < tilts.length; k++) {
    const p = rings[rings.length - 1]!
    const t = tilts[k]!
    const d = unit(add(mul(p.E1, Math.cos(t.dirTheta)), mul(p.E2, Math.sin(t.dirTheta))))
    const Th = unit(rotInPlane(p.T, p.T, d, t.phi / 2))
    const C = add(p.C, mul(Th, t.adv * unitMm))
    rings.push({
      C,
      T: unit(rotInPlane(p.T, p.T, d, t.phi)),
      E1: unit(rotInPlane(p.E1, p.T, d, t.phi)),
      E2: unit(rotInPlane(p.E2, p.T, d, t.phi)),
      r: t.r * unitMm,
    })
  }
  return rings
}

const ringPoint = (g: Ring, th: number): V3 => add(g.C, add(mul(g.E1, g.r * Math.cos(th)), mul(g.E2, g.r * Math.sin(th))))

/** Catmull-Rom between p1 and p2 at t (p0, p3 the neighbours). */
function cr(p0: V3, p1: V3, p2: V3, p3: V3, t: number): V3 {
  const t2 = t * t, t3 = t2 * t
  const f = (a: number, b: number, c: number, d: number): number =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
  return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y), z: f(p0.z, p1.z, p2.z, p3.z) }
}

/** The loft through the rings: fabric (θ, ly) → point, outward normal and
 *  meridian tangent. `heads[j]` is ring j's head line in mm (j = 0 the ring). */
function makeLoft(rings: Ring[], heads: ((th: number) => number)[]): (th: number, ly: number) => { p: V3; n: V3; m: V3 } {
  const J = rings.length
  const ringAt = (j: number, th: number): V3 => {
    if (j < 0) return sub(mul(ringPoint(rings[0]!, th), 2), ringPoint(rings[1]!, th))
    if (j >= J) return sub(mul(ringPoint(rings[J - 1]!, th), 2), ringPoint(rings[J - 2]!, th))
    return ringPoint(rings[j]!, th)
  }
  const pos = (th: number, ly: number): V3 => {
    // The band [j, j+1] whose head lines bracket ly at this angle.
    let j = 0
    while (j < J - 2 && ly > heads[j + 1]!(th)) j++
    const h0 = heads[j]!(th)
    const h1 = heads[j + 1]!(th)
    const t = (ly - h0) / (h1 - h0 || 1)
    if (t < 0 || t > 1) {
      // Off the ends (a hook below the ring, the fasten-off past the rim): linear.
      const a = ringAt(j, th), b = ringAt(j + 1, th)
      return add(a, mul(sub(b, a), t))
    }
    return cr(ringAt(j - 1, th), ringAt(j, th), ringAt(j + 1, th), ringAt(j + 2, th), t)
  }
  return (th: number, ly: number) => {
    const p = pos(th, ly)
    const e = 1e-3
    const dTh = sub(pos(th + e, ly), pos(th - e, ly))
    const dM = sub(pos(th, ly + e * 10), pos(th, ly - e * 10))
    let n = unit(cross(dTh, dM))
    // Outward: away from the local axis (the nearest ring centre's line).
    let j = 0
    let best = Infinity
    for (let i = 0; i < J; i++) {
      const d = Math.hypot(p.x - rings[i]!.C.x, p.y - rings[i]!.C.y, p.z - rings[i]!.C.z)
      if (d < best) { best = d; j = i }
    }
    const g = rings[j]!
    const radial = sub(sub(p, g.C), mul(g.T, dot(sub(p, g.C), g.T)))
    if (dot(n, radial) < 0) n = mul(n, -1)
    const m = unit(sub(dM, mul(n, dot(dM, n))))
    return { p, n, m }
  }
}

/**
 * Build a bent tube. Result: frame 'surface', every node's fabric frame in
 * `model.frame3` (meridian + outward normal at build time), the magic ring
 * pinned, nothing else pinned, one strand, `nodeRow` the worked round. Laid
 * with its OPEN END at the bottom (the sewn end, local z min), the axis there
 * along +z, and the curve's INSIDE — the way the tip curls — toward +x.
 */
export function buildBentTube(spec: BentTubeSpec, yarnRadiusMm: number): BuiltContinuous {
  validateBentTube(spec)
  const yr = yarnRadiusMm
  const sw = yr * (spec.gaugeYr ?? STITCHES[BODY].gaugeYr)
  const counts = spec.rounds
  const dry = dryRun(spec)
  const tilts = roundTilts(spec, dry)
  const rings = ringFrames(spec, tilts, yr)
  // Head lines in mm: the ring at rr, then every round's. Each round climbs
  // the FIRST HARMONIC of its own stitches' heights round the ring (mean +
  // cos + sin) — exactly the part of them the ring's advance and tilt are
  // made of — so every crown sits ON its ring and the loft between two rings
  // is the fabric of one round. What the harmonic cannot carry (the step from
  // a dc to an htr beside it) each stitch takes up in its own round, a little
  // compressed or stretched: a real round does the same by leaning its
  // stitches, and it does not accumulate (a crown placed at its stitches'
  // running SUM drifts off its ring round after round and the inside of the
  // curve folds into itself — measured: rounds 7 and 10 within a yarn).
  const rr = RING_R_YR * yr
  const heads: ((th: number) => number)[] = [() => rr]
  for (const row of dry) {
    const n = row.length
    let A = 0, B = 0, C = 0
    for (const s of row) {
      const h = pitchYr(s.id) * yr
      A += h / n
      B += (2 / n) * h * Math.cos(s.theta - OUTER)
      C += (2 / n) * h * Math.sin(s.theta - OUTER)
    }
    const below = heads[heads.length - 1]!
    heads.push((th: number) => below(th) + A + B * Math.cos(th - OUTER) + C * Math.sin(th - OUTER))
  }
  const loft = makeLoft(rings, heads)

  // Final rigid placement: the last ring's axis (growth, out of the piece)
  // points DOWN, so the open end is the bottom and the tip is up; the curl's
  // inside (away from the tall stitches, transported to the base) is +x.
  const last = rings[rings.length - 1]!
  const outerEnd = unit(add(mul(last.E1, Math.cos(OUTER)), mul(last.E2, Math.sin(OUTER))))
  const ez = mul(last.T, -1)
  const ex = unit(sub(mul(outerEnd, -1), mul(ez, dot(mul(outerEnd, -1), ez))))
  const ey = cross(ez, ex)
  const toLocal = (v: V3): V3 => ({ x: dot(v, ex), y: dot(v, ey), z: dot(v, ez) })
  let zMin = Infinity
  for (const g of rings) for (let i = 0; i < 24; i++) zMin = Math.min(zMin, toLocal(sub(ringPoint(g, (i / 24) * Math.PI * 2), last.C)).z)
  const lift = yr * 2 - zMin
  const world = (v: V3): V3 => {
    const q = toLocal(sub(v, last.C))
    return { x: q.x, y: q.y, z: q.z + lift }
  }

  const S = createStrand()
  const { nodes, push } = S
  const frame3: { m: V3; n: V3 }[] = []
  const nodeRow: number[] = []
  let roundNow = -1
  const mkPlace3 =
    (rRef: number) =>
    (lx: number, ly: number, lz: number): V3 => {
      const th = lx / rRef
      const q = loft(th, ly)
      const n = toLocal(q.n)
      frame3.push({ m: toLocal(q.m), n })
      nodeRow.push(roundNow)
      return world(add(q.p, mul(q.n, lz)))
    }

  const dimsOf = new Map<StitchId, StitchDims>()
  const dimsFor2 = (id: StitchId): StitchDims => {
    let d = dimsOf.get(id)
    if (!d) {
      d = dimsFor(yr, id)
      if (id !== BODY) {
        // A taller stitch in an sc round is packed to the round's sc column
        // pitch (the tube's rib pack: the grid builder's post pack, §8f-7).
        const pack = sw / (yr * STITCHES[id].gaugeYr)
        d = { ...d, cw: d.cw * pack, pw: d.pw * pack }
      }
      dimsOf.set(id, d)
    }
    return d
  }
  const headLoop = (id: StitchId): number => yr * (STITCHES[id].headLoopYr ?? 0)
  const yarnOvers = (id: StitchId): number => STITCHES[id].yarnOvers ?? 0
  const crownNzOf = (id: StitchId): number => {
    const d = dimsFor2(id)
    return headLoop(id) > 0 ? headApexRelief(d.zh, SURFACE_LAY) : d.zh * 1.15
  }

  interface Crown { back: number; front: number; theta: number; m: number; nz: number }
  let below: Crown[] = []

  // ── THE MAGIC RING ──
  const ringNodes: number[] = []
  {
    const place = mkPlace3(rr)
    const zh = dimsFor2(BODY).zh
    for (let i = 0; i < RING_N; i++) {
      const a = (i / RING_N) * Math.PI * 2
      const p = place(a * rr, rr, zh * 0.5)
      push(p.x, p.y, p.z, 0)
      ringNodes.push(nodes.length - 1)
    }
  }

  // ── THE ROUNDS ──
  for (let k = 0; k < counts.length; k++) {
    const count = counts[k]!
    const prev = k === 0 ? 0 : counts[k - 1]!
    const row = dry[k]!
    const rRef = Math.max(rings[k + 1]!.r, 1e-3)
    roundNow = k
    const place3 = mkPlace3(rRef)
    const crowns: Crown[] = []
    if (k === 0) {
      const d = dimsFor2(BODY)
      const cyEff = rr * 0.95 + d.dh
      for (let i = 0; i < count; i++) {
        const s = row[i]!
        const dd = dimsFor2(s.id)
        const th = s.theta
        const ring = ringNodes[Math.round(((th / (Math.PI * 2)) % 1) * RING_N) % RING_N]!
        const xC = th * rRef
        const r = emitPlainStitch(S, dd, {
          j: k, c: i, id: s.id, s: 1, fz: 1, by: rr, ty: heads[1]!(th), xCrown: xC, xHook: xC,
          bcBack: ring, bcFront: ring, cyBelow: cyEff, bcNormalZ: d.zh * 0.5, place3,
          linkRole: 'ring', headLoopMm: headLoop(s.id), yarnOvers: yarnOvers(s.id), yarnOverMm: yr * (STITCHES[s.id].yarnOverYr ?? 1),
          surfaceLay: SURFACE_LAY, backCross: BACK_CROSS,
        })
        crowns.push({ back: r.crownBack, front: r.crownFront, theta: th, m: heads[1]!(th), nz: crownNzOf(s.id) })
      }
    } else {
      const ops = roundOps(prev, count, (k % 2) * 0.5)
      let bi = 0
      let li = 0
      for (let oi = 0; oi < ops.length; oi++) {
        const op = ops[oi]!
        if (op === 'dec') {
          const b1 = below[bi++]!
          const b2 = below[bi++]!
          const s = row[li]!
          const xC = s.theta * rRef
          const d = dimsFor2(BODY)
          const by = (b1.m + b2.m) / 2
          const r = emitDecrease(S, d, {
            j: k, c: oi, id: BODY, s: 1, fz: 1, by, ty: heads[k + 1]!(s.theta), xCrown: xC,
            b1: { back: b1.back, front: b1.front, x: b1.theta * rRef },
            b2: { back: b2.back, front: b2.front, x: b2.theta * rRef },
            cy1: b1.m, cy2: b2.m, bn1: b1.nz, bn2: b2.nz, place3, headLoopMm: headLoop(BODY),
            surfaceLay: SURFACE_LAY, backCross: BACK_CROSS,
          })
          crowns.push({ back: r.crown, front: r.crown, theta: s.theta, m: heads[k + 1]!(s.theta), nz: crownNzOf(BODY) })
          li++
        } else {
          const b = below[bi++]!
          const n = op === 'inc' ? 2 : 1
          for (let t = 0; t < n; t++) {
            const s = row[li]!
            const xC = s.theta * rRef
            const hookOff = n === 2 ? yr * HOOK_SPREAD_YR * 0.6 * (t === 0 ? 1 : -1) : 0
            const r = emitPlainStitch(S, dimsFor2(s.id), {
              j: k, c: oi, id: s.id, s: 1, fz: 1, by: b.m, ty: heads[k + 1]!(s.theta), xCrown: xC,
              xHook: b.theta * rRef + hookOff, bcBack: b.back, bcFront: b.front,
              cyBelow: b.m, bcNormalZ: b.nz, place3, hookDepthScale: n === 2 && t === 1 ? 1.5 : 1,
              headLoopMm: headLoop(s.id), yarnOvers: yarnOvers(s.id), yarnOverMm: yr * (STITCHES[s.id].yarnOverYr ?? 1),
              surfaceLay: SURFACE_LAY, backCross: BACK_CROSS,
            })
            crowns.push({ back: r.crownBack, front: r.crownFront, theta: s.theta, m: heads[k + 1]!(s.theta), nz: crownNzOf(s.id) })
            li++
          }
        }
      }
      if (bi !== below.length) throw new Error(`bent tube round ${k + 1}: consumed ${bi} of ${below.length} stitches below`)
    }
    below = crowns
  }

  // ── THE OPEN END: the tail woven back along the rim (tube.ts). ──
  {
    const kEnd = counts.length - 1
    roundNow = kEnd
    const rEnd = Math.max(rings[rings.length - 1]!.r, 1e-3)
    const placeEnd = mkPlace3(rEnd)
    const mEnd = Math.min(...below.map((c) => c.m))
    for (let t = 1; t <= 4; t++) {
      const th = PHASE + Math.PI * 2 * (1 + 0.012 * t)
      const p = placeEnd(th * rEnd, mEnd - pitchYr(BODY) * yr * 0.12 * t, yr * (0.3 - 0.25 * t))
      push(p.x, p.y, p.z)
    }
  }

  if (frame3.length !== nodes.length) throw new Error(`bent tube frame capture out of sync: ${frame3.length} for ${nodes.length}`)
  const halfSpan = Math.max(...counts.map((c) => (c * sw) / (2 * Math.PI))) + yr * 3
  return {
    // No `meridian` (the surface is not one of revolution) and no `round` (a
    // tube is fabric, not a pressurised bag): the hold and the audit read
    // `frame3`, each node's own meridian and normal.
    model: { nodes, dist: S.dist, bend: S.bend, strand: new Array(nodes.length).fill(0), along: nodes.map((_, i) => i), frame3 },
    strandPath: S.strandPath,
    links: S.links,
    yarnRadiusMm: yr,
    widthMm: halfSpan * 2,
    heightMm: halfSpan * 2,
    anchorPins: RING_N,
    frame: 'surface',
    nodeRow,
  }
}

export function validateBentTube(spec: BentTubeSpec): void {
  const { rounds, plan } = spec
  if (rounds.length < 4) throw new Error('bent tube: needs at least four rounds')
  if (rounds[0]! > 12 || rounds[0]! < 3) throw new Error(`bent tube: a magic ring takes 3–12 stitches (got ${rounds[0]})`)
  for (let k = 0; k < rounds.length; k++) {
    const ids = plan[k]
    if (ids && ids.length !== rounds[k]) throw new Error(`bent tube: round ${k + 1} plans ${ids.length} stitches for a count of ${rounds[k]}`)
    if (k === 0 && ids?.some((s) => s !== 'sc')) throw new Error('bent tube: round 1 (into the ring) is all sc')
    if (k > 0) {
      const prev = rounds[k - 1]!
      if (rounds[k]! > prev * 2 || rounds[k]! * 2 < prev) throw new Error(`bent tube: round ${k + 1} more than doubles or halves (${prev} → ${rounds[k]})`)
      for (const d of decSlots(prev, rounds[k]!, k)) if (ids && ids[d] !== 'sc') throw new Error(`bent tube: round ${k + 1} decrease at stitch ${d + 1} must be sc`)
    }
  }
}

// ── the written pattern ────────────────────────────────────────────────────

const UK: Record<BendStitch, string> = { sc: 'dc', hdc: 'htr' }

/** One round in UK terms, exactly as the builder works it: run-length groups
 *  of the stitches made, increases and decreases where `roundOps` puts them. */
export function bentRoundWords(spec: BentTubeSpec, k: number): string {
  const count = spec.rounds[k]!
  const ids = spec.plan[k] ?? Array<BendStitch>(count).fill('sc')
  if (k === 0) return `${count} ${UK.sc} into a magic ring`
  const ops = roundOps(spec.rounds[k - 1]!, count, (k % 2) * 0.5)
  const tokens: { kind: 'st' | 'inc' | 'dec'; a: BendStitch; b?: BendStitch }[] = []
  let li = 0
  for (const op of ops) {
    if (op === 'dec') { tokens.push({ kind: 'dec', a: 'sc' }); li++ }
    else if (op === 'inc') { tokens.push({ kind: 'inc', a: ids[li]!, b: ids[li + 1]! }); li += 2 }
    else { tokens.push({ kind: 'st', a: ids[li]! }); li++ }
  }
  if (tokens.every((t) => t.kind === 'st' && t.a === tokens[0]!.a)) return `${UK[tokens[0]!.a]} in each st around`
  const same = (x: (typeof tokens)[number], y: (typeof tokens)[number]): boolean => x.kind === y.kind && x.a === y.a && x.b === y.b
  const runs: string[] = []
  for (let i = 0; i < tokens.length; ) {
    let n = 1
    while (i + n < tokens.length && same(tokens[i + n]!, tokens[i]!)) n++
    const t = tokens[i]!
    if (t.kind === 'st') runs.push(`${UK[t.a]} in next ${n === 1 ? 'st' : `${n} sts`}`)
    else if (t.kind === 'dec') runs.push(n === 1 ? 'dc2tog' : `[dc2tog] ${n} times`)
    else {
      const one = t.a === t.b ? `2 ${UK[t.a]} in next st` : `(${UK[t.a]}, ${UK[t.b!]}) in next st`
      runs.push(n === 1 ? one : `[${one}] ${n} times`)
    }
    i += n
  }
  return runs.join(', ')
}

/** The whole piece in UK terms: every round with its count and how many of its
 *  stitches are the tall outside ones, then the finishing lines. */
export function bentTubeWords(spec: BentTubeSpec, opts: { name?: string; stuff?: boolean } = {}): string[] {
  const out: string[] = []
  let anyTall = false
  for (let k = 0; k < spec.rounds.length; k++) {
    const ids = spec.plan[k] ?? []
    const tall = ids.filter((s) => s !== 'sc').length
    if (tall) anyTall = true
    out.push(`Round ${k + 1}: ${bentRoundWords(spec, k)}. (${spec.rounds[k]} sts${tall ? `; ${tall} on the outside of the curve` : ''})`)
  }
  out.push('Work in a continuous spiral without joining; mark the first stitch of each round.')
  if (anyTall) {
    out.push(
      'The taller stitches (htr) fall in the middle of each round, one above the other: that side climbs further every round than the dc side, so the piece curves away from it as you work. Keep the marker in line so the tall stitches stack.',
    )
  }
  out.push(
    opts.stuff === false
      ? 'Fasten off leaving a long tail for sewing; leave the end open.'
      : 'Stuff lightly, just enough to hold the curve (packed hard, it straightens). Fasten off leaving a long tail for sewing; leave the end open.',
  )
  return out
}

// ── measured off the settled piece ─────────────────────────────────────────

export interface BentTubeMetrics {
  /** Angle between round 2's and the last but one round's head-line planes,
   *  settled (deg) — what `predictedBendDeg` predicts. */
  bendDeg: number
  /** Each round's head-line plane normal (PCA of its crowns), toward the
   *  open end; the last round has none. */
  normals: V3[]
  /** Mean crown-to-crown climb of the tall stitches and the sc in bent rounds (mm). */
  tallClimbMm: number
  scClimbMm: number
  /** Closest approach between nodes of rounds at least 3 apart (mm). */
  minGapMm: number
  /** Each round's head-line length / (count × column gauge). */
  ringStretch: number[]
}

/** Smallest-variance direction of a point set (power iteration on tr·I − C). */
function planeNormal(pts: V3[], hint: V3): V3 {
  const c = pts.reduce((a, p) => add(a, p), { x: 0, y: 0, z: 0 })
  const m = mul(c, 1 / pts.length)
  let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0
  for (const p of pts) {
    const a = p.x - m.x, b = p.y - m.y, d = p.z - m.z
    xx += a * a; xy += a * b; xz += a * d; yy += b * b; yz += b * d; zz += d * d
  }
  const tr = xx + yy + zz
  let v = unit(hint)
  for (let it = 0; it < 60; it++) {
    v = unit({
      x: tr * v.x - (xx * v.x + xy * v.y + xz * v.z),
      y: tr * v.y - (xy * v.x + yy * v.y + yz * v.z),
      z: tr * v.z - (xz * v.x + yz * v.y + zz * v.z),
    })
  }
  return dot(v, hint) < 0 ? mul(v, -1) : v
}

export function bentTubeMetrics(built: BuiltContinuous, spec: BentTubeSpec): BentTubeMetrics {
  const nodes = built.model.nodes
  const row = built.nodeRow!
  const K = spec.rounds.length
  // Each round's CROWNS (one per stitch, round the ring — the head line the
  // next round is worked into): the `below` of every hook link of the round
  // above. The last round has none; its plane is not measured.
  const crownsOf: number[][] = Array.from({ length: K }, () => [])
  for (const l of built.links) if (l.role === 'hook' && l.j >= 1) crownsOf[l.j - 1]!.push(l.below)
  const pts = crownsOf.map((cs) => [...new Set(cs)].map((i) => ({ x: nodes[i]!.x, y: nodes[i]!.y, z: nodes[i]!.z })))
  const cent = pts.map((ps) => mul(ps.reduce((a, p) => add(a, p), { x: 0, y: 0, z: 0 }), 1 / Math.max(1, ps.length)))
  const normals: V3[] = []
  for (let k = 0; k < K - 1; k++) {
    const hint = sub(cent[Math.min(K - 2, k + 1)]!, cent[Math.max(0, k - 1)]!)
    normals.push(planeNormal(pts[k]!, hint))
  }
  // From round 2's head line to the last but one's: every round `planBend`
  // may bend lies between them (round 1 has no side, the last no crowns).
  const a = normals[1]!
  const b = normals[K - 2]!
  const bendDeg = (Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * 180) / Math.PI

  // Crown climbs: each worked stitch's hook link joins it to the crown below;
  // the climb is the distance between consecutive rounds' crowns at the same
  // stitch, read as hook → below link per stitch (role 'hook').
  let tallSum = 0, tallN = 0, scSum = 0, scN = 0
  // Each worked stitch records one hook link into the crown it was worked
  // into: (round j, op c) → that crown.
  const crownOf = new Map<string, number>()
  for (const l of built.links) if (l.role === 'hook' && l.j >= 1) crownOf.set(`${l.j}:${l.c}`, l.below)
  for (let k = 1; k < K - 1; k++) {
    const ids = spec.plan[k] ?? []
    if (!ids.some((s) => s !== 'sc')) continue
    // Stitch li of round k: its crown is the `below` of the op in round k+1
    // that sits on it; its base is the `below` of its own op in round k.
    const opsK = roundOps(spec.rounds[k - 1]!, spec.rounds[k]!, (k % 2) * 0.5)
    const opsN = roundOps(spec.rounds[k]!, spec.rounds[k + 1]!, ((k + 1) % 2) * 0.5)
    // li → op index in round k
    const liToOp: number[] = []
    opsK.forEach((op, oi) => { const n = op === 'inc' ? 2 : 1; for (let t = 0; t < n; t++) liToOp.push(oi) })
    // below index (stitch li of round k) → op index in round k+1
    const biToOp: number[] = []
    opsN.forEach((op, oi) => { const n = op === 'dec' ? 2 : 1; for (let t = 0; t < n; t++) biToOp.push(oi) })
    for (let li = 0; li < ids.length; li++) {
      if (opsK[liToOp[li]!] !== 'st' || opsN[biToOp[li]!] !== 'st') continue
      const base = crownOf.get(`${k}:${liToOp[li]}`)
      const top = crownOf.get(`${k + 1}:${biToOp[li]}`)
      if (base === undefined || top === undefined) continue
      const d = Math.hypot(nodes[top]!.x - nodes[base]!.x, nodes[top]!.y - nodes[base]!.y, nodes[top]!.z - nodes[base]!.z)
      if (ids[li] === 'sc') { scSum += d; scN++ } else { tallSum += d; tallN++ }
    }
  }

  // Self-intersection: no two nodes of rounds ≥ 3 apart nearer than this.
  const cell = built.yarnRadiusMm * 3
  const grid = new Map<string, number[]>()
  const key = (p: V3): string => `${Math.floor(p.x / cell)},${Math.floor(p.y / cell)},${Math.floor(p.z / cell)}`
  nodes.forEach((p, i) => { if (row[i]! >= 0) { const kk = key(p); const g = grid.get(kk); if (g) g.push(i); else grid.set(kk, [i]) } })
  let minGap = Infinity
  nodes.forEach((p, i) => {
    if (row[i]! < 0) return
    const cx = Math.floor(p.x / cell), cy = Math.floor(p.y / cell), cz = Math.floor(p.z / cell)
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      for (const j of grid.get(`${cx + dx},${cy + dy},${cz + dz}`) ?? []) {
        if (j <= i || Math.abs(row[j]! - row[i]!) < 3) continue
        const q = nodes[j]!
        const d = Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z)
        if (d < minGap) minGap = d
      }
    }
  })

  // Ring stretch: each round's crowns in angle order, the closed polyline.
  const sw = built.yarnRadiusMm * (spec.gaugeYr ?? STITCHES[BODY].gaugeYr)
  const ringStretch: number[] = []
  for (let k = 1; k < K; k++) {
    const crowns: number[] = []
    for (const l of built.links) if (l.role === 'hook' && l.j === k + 1) crowns.push(l.below)
    const uniq = [...new Set(crowns)]
    if (uniq.length < 3) continue
    let L = 0
    for (let i = 0; i < uniq.length; i++) {
      const p = nodes[uniq[i]!]!, q = nodes[uniq[(i + 1) % uniq.length]!]!
      L += Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z)
    }
    ringStretch.push(L / (spec.rounds[k]! * sw))
  }
  return { bendDeg, normals, tallClimbMm: tallN ? tallSum / tallN : 0, scClimbMm: scN ? scSum / scN : 0, minGapMm: minGap, ringStretch }
}

/**
 * A TAPER from a tip to a widest round, the way a horn, a tail or a trunk is
 * worked tip first: `tip` stitches in the ring (5 = a point, 6 = a blunt nub;
 * a 4-stitch ring growing to 6 at once leaves its first increase's hook
 * 0.6 yr under its crown even straight, next to the 0.45 gate — measured,
 * a bend nearby tipped it over — so a point starts at 5),
 * growing to `widest` over `length` rounds. `plump` > 1 grows faster near the
 * tip and holds near the base (a plump, short horn); 1 is a straight cone.
 * Each round grows by at most what it can (never more than doubles).
 */
export function taperRounds(tip: number, widest: number, length: number, plump = 1): number[] {
  const out: number[] = [tip]
  for (let k = 1; k < length; k++) {
    const f = k / Math.max(1, length - 1)
    const target = Math.round(tip + (widest - tip) * (1 - Math.pow(1 - f, plump)))
    const prev = out[out.length - 1]!
    out.push(Math.max(prev, Math.min(prev * 2, target)))
  }
  return out
}
