/**
 * A DOLL'S HAIR (audit round 4 for dolls; bar: the fairy doll).
 *
 * Built the way fine-cotton doll makers build long hair, in two honest parts:
 *
 *  1. A HAIR CAP: a small hat worked from a magic ring at the crown in the hair
 *     colour, increasing like a head and a little wider than it, so it sits
 *     over the crown and comes down to the brow at the front and the nape at
 *     the back (it is sewn on tilted back). A real stitched tube piece
 *     (tube.ts, `cap: 'dome'`), built, relaxed and audited like any other
 *     composition part.
 *  2. ROOTED STRANDS: cut lengths of the same yarn, folded in half and pulled
 *     through the stitches of the cap's last round with a lark's head knot, so
 *     two ends hang from every root. They fall over the cap, past the
 *     shoulders and down the back, and the lower part of each is wound into a
 *     loose ringlet (cotton holds a curl wound round a pencil). The render lays
 *     each end as a loose plied strand: outward from its root, over the cap and
 *     head (kept outside them), hanging under gravity, kept outside the body and
 *     shoulders, curling toward the tip. Nothing here is a stitch, so nothing
 *     is drawn as one: the strands are yarn, the cap is the stitched piece.
 *
 * The cap is an ordinary `AmigurumiPart`; the strands are a
 * `CompositionAccessory` of kind 'rooted-hair' laid on the COMPILED composition
 * (like the nightcap), outside the geometry hash.
 */

import type { AmigurumiPart, CompiledComposition, PlacedPart } from './composition'
import { strandRounds } from './composition'
import { pliedFilaments, smooth, type V3 } from '../yarnLoop'
import type { YarnStrokeOut } from './pompom'
import { writeInstructions, type CrochetProgram } from './program'
import { RINGLET_CORE_MM, RINGLET_PITCH_MM, RINGLET_PER_CH, corkscrewStrip, polylineFrame, ringletPose, ringletWords, type DressingPiece } from './dollDressing'

export interface RootedHairSpec {
  kind: 'rooted-hair'
  /** The hair cap part the strands are rooted in (its last round). */
  on: string
  /** The parts a strand must stay outside of, in order of size: the head and
   *  the body (names). */
  clear: string[]
  colourHex: string
  /** Hanging length of each end (mm), before the curl takes some of it up. */
  lengthMm: number
  /** The face direction (world, unit-ish): roots are left out of a front arc so
   *  the face is clear. */
  forward: { x: number; y: number; z: number }
  /** Half-angle (deg) of the front arc left without strands (default 42). */
  clearDeg?: number
  /** Ringlet radius (mm, default 2.6) and turns over the curled part (default
   *  2.5). 0 radius = straight hair. */
  curl?: { radiusMm?: number; turns?: number }
  /** Root every n-th stitch of the round (default 1 = every stitch). */
  every?: number
  seed?: number
}

/**
 * CROCHETED CORKSCREW RINGLETS (fairy doll round 9): each ringlet is a real
 * stitched strip (dollDressing.corkscrewStrip: ch N, 3 dc in each ch), built
 * and audited flat, then wound round its own hanging line — out from its root
 * on the hair cap's last round, over the cap, down under gravity, kept outside
 * the head and body — the way a maker's sewn-on corkscrew falls. One ringlet
 * per rooted stitch, sewn on by its starting end.
 */
export interface RingletHairSpec {
  kind: 'ringlet-hair'
  on: string
  clear: string[]
  colourHex: string
  /** Chain counts of the ringlets, cycled round the roots (longest first:
   *  the first roots either side of the face take the longest). */
  chains: number[]
  forward: { x: number; y: number; z: number }
  clearDeg?: number
  /** Root every n-th stitch of the round (default 2). */
  every?: number
  /** Stitches fanned into each chain (default 3). */
  per?: number
  seed?: number
  /** How far the hanging lines stand off the head and body (mm, default the
   *  ringlet's own radius so the curls lie on the surface, not in it). */
  standOffMm?: number
  /** Half-angle (deg) at the BACK of the head left without ringlets (the
   *  nape stays the cap's; default 0 = ringlets all round the back). */
  backClearDeg?: number
  /** A side-swept FRINGE: `count` lengths of the hair yarn laid side by side
   *  over the forehead from the parting (`partAz` degrees from centre front,
   *  + = her right) sweeping down to the other temple, sewn down at both ends.
   *  The bar's hair line: fringe to just above the eyes, one brow showing. */
  fringe?: { count: number; partAz?: number }
}

/** mulberry32 — the same tiny PRNG the pompom uses, so the hair is reproducible. */
function prng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const norm = (v: V3): V3 => {
  const l = Math.hypot(v.x, v.y, v.z) || 1
  return { x: v.x / l, y: v.y / l, z: v.z / l }
}

interface Ellipsoid { c: V3; r: V3 }

function ellipsoidOf(pp: PlacedPart, pad: number): Ellipsoid {
  const b = pp.bounds
  return {
    c: { x: (b.minx + b.maxx) / 2, y: (b.miny + b.maxy) / 2, z: (b.minz + b.maxz) / 2 },
    r: { x: (b.maxx - b.minx) / 2 + pad, y: (b.maxy - b.miny) / 2 + pad, z: (b.maxz - b.minz) / 2 + pad },
  }
}

/** Push `p` out to the ellipsoid's surface if it is inside; returns the point. */
function keepOutside(p: V3, e: Ellipsoid): V3 {
  const u = { x: (p.x - e.c.x) / e.r.x, y: (p.y - e.c.y) / e.r.y, z: (p.z - e.c.z) / e.r.z }
  const d = Math.hypot(u.x, u.y, u.z)
  if (d >= 1 || d < 1e-6) return p
  const k = 1 / d
  return { x: e.c.x + u.x * k * e.r.x, y: e.c.y + u.y * k * e.r.y, z: e.c.z + u.z * k * e.r.z }
}

/**
 * The hair cap's rounds: a head's own ascent (the counts a head of this
 * equator climbs through) worked one size up so it fits over the head, plus
 * `extra` straight rounds so it comes down over the ears.
 */
export function hairCapRounds(headRounds: number[], extra = 1): number[] {
  const widest = Math.max(...headRounds)
  const top = headRounds.indexOf(widest)
  // Two stitches more per round than the head from round 3 on (the extra
  // circumference a cap worked in the same yarn needs to sit over the head's
  // thickness), capped at +6 so the widest round is the head's plus eight: at M
  // 6, 12, 20, 28, 36, 42 ... 72.
  const up = headRounds.slice(0, top + 1).map((c, i) => c + Math.min(8, Math.max(0, i - 1) * 2))
  return [...up, ...Array.from({ length: extra }, () => up[up.length - 1]!)]
}

/** The hair cap as a composition part, sewn on the head tilted back a little so
 *  its edge sits at the brow in front and the nape behind. */
export function hairCapPart(headRounds: number[], hex: string, gaugeYr: number | undefined, forward: V3, tiltDeg = 18, extra = 1, sideTiltDeg = 0): AmigurumiPart {
  const rounds = hairCapRounds(headRounds, extra)
  const t = (tiltDeg * Math.PI) / 180
  const f = norm(forward)
  // Up, tilted back (away from the face) by `tiltDeg`; and, for a SIDE
  // PARTING, tilted toward her right by `sideTiltDeg` so the crown (where the
  // rounds start) sits off-centre and the cap comes lower over her left brow.
  const up = norm({ x: -f.x * Math.sin(t), y: -f.y * Math.sin(t), z: Math.cos(t) })
  const rt = norm({ x: f.y, y: -f.x, z: 0 })
  const sd = (sideTiltDeg * Math.PI) / 180
  const dir = norm({ x: up.x * Math.cos(sd) + rt.x * Math.sin(sd), y: up.y * Math.cos(sd) + rt.y * Math.sin(sd), z: up.z * Math.cos(sd) })
  return {
    name: 'hair-cap',
    stitch: 'sc',
    rounds,
    colourHex: hex,
    ...(gaugeYr != null ? { gaugeYr } : {}),
    tube: { anchor: 'ring', join: 'spiral', cap: 'dome' },
    place: { on: 'head', dir, aim: { x: -dir.x, y: -dir.y, z: -dir.z }, poleIn: true, seat: -1.2, surfaceFit: 'ellipsoid' },
    words: hairCapWords(rounds),
    joinWords:
      (sideTiltDeg
        ? 'Pin the hair cap on the head with its magic ring a little to the right of the crown (the side parting), tilted a little back so its edge sits just above the brows at the front and lower at the nape, and sew it on round its last round.'
        : 'Pin the hair cap on the head with its magic ring at the crown, tilted a little back so its edge sits just above the brows at the front and lower at the nape, and sew it on round its last round.'),
  }
}

function hairCapWords(rounds: number[]): string[] {
  const p: CrochetProgram = { name: 'Hair cap', form: 'tube', stitch: 'sc', rounds, tube: { anchor: 'ring', join: 'spiral', cap: 'dome' } }
  return [
    'Start with the crown (the magic ring), in the hair colour.',
    ...writeInstructions(p)
      .filter((l) => !/^Fasten off/.test(l))
      .map((l) => (/^Work in a continuous spiral/.test(l) ? 'Work every stitch in a continuous spiral without joining; mark the first stitch of each round.' : l)),
    'Fasten off, leaving a long tail for sewing the cap to the head.',
  ]
}

/** The strand count and length line for the pattern, from the same spec the render uses. */
export function rootedHairWords(spec: RootedHairSpec, capLastRound: number): string[] {
  const every = spec.every ?? 1
  const clear = spec.clearDeg ?? 42
  const roots = Math.round((capLastRound * (360 - 2 * clear)) / 360 / every)
  const cm = Math.round((spec.lengthMm * 2 + 20) / 10)
  const curl = spec.curl?.radiusMm === 0 ? '' : ' Wind the lower half of each strand round a pencil, damp it, and leave it to dry so it holds a loose ringlet.'
  return [
    `Hair: cut about ${roots} lengths of the hair yarn, each ${cm} cm long. Fold a length in half, push the hook from the outside through a stitch of the hair cap's last round, catch the fold and pull it through, then pass both ends through the loop and pull snug (a lark's head knot). ` +
      `Root one in ${every === 1 ? 'every stitch' : `every ${every === 2 ? 'other' : `${every}th`} stitch`} of the last round from one side of the face round the back to the other, leaving the front clear above the eyes. Trim the ends level once they hang past the shoulders.${curl}`,
  ]
}

/**
 * Lay the strands on the compiled composition: every rooted end as a loose
 * plied strand in the hair yarn. Deterministic (seeded) so the same doll
 * always renders the same hair.
 */
export function rootedHairStrokes(compiled: CompiledComposition, spec: RootedHairSpec, twist = 0.08): YarnStrokeOut[] {
  const yr = compiled.yr
  const rnd = prng(spec.seed ?? 11)
  const { roots, obstacles, capE } = hairRoots(compiled, spec.on, spec.clear, spec.forward, spec.clearDeg ?? 42, spec.every ?? 1, 0)
  const out: YarnStrokeOut[] = []
  const curlR = spec.curl?.radiusMm ?? 2.6
  const turns = spec.curl?.turns ?? 2.5
  for (const root of roots) {
    for (let end = 0; end < 2; end++) {
      const len = spec.lengthMm * (0.88 + 0.24 * rnd())
      const side = end === 0 ? -1 : 1
      const phase0 = 2 * Math.PI * rnd()
      const curlFrom = len * (0.35 + 0.25 * rnd())
      // Every ringlet its own: radius and turns vary strand to strand.
      const myR = curlR * (0.7 + 0.6 * rnd())
      const myTurns = turns * (0.7 + 0.6 * rnd())
      const pts = hangPath(root, side, len, capE, obstacles, yr, rnd, (p, dir, travelled) => {
        if (!(curlR > 0 && travelled > curlFrom)) return p
        // Wind round the hanging line: a helix of `turns` over the curled part.
        const u = (travelled - curlFrom) / Math.max(1, len - curlFrom)
        const ph = phase0 + side * u * myTurns * 2 * Math.PI
        const r = myR * Math.min(1, u * 3) * (1 - 0.15 * u)
        const ref: V3 = Math.abs(dir.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 }
        const axisU = norm({ x: dir.y * ref.z - dir.z * ref.y, y: dir.z * ref.x - dir.x * ref.z, z: dir.x * ref.y - dir.y * ref.x })
        const axisV = { x: dir.y * axisU.z - dir.z * axisU.y, y: dir.z * axisU.x - dir.x * axisU.z, z: dir.x * axisU.y - dir.y * axisU.x }
        let c: V3 = { x: p.x + (axisU.x * Math.cos(ph) + axisV.x * Math.sin(ph)) * r, y: p.y + (axisU.y * Math.cos(ph) + axisV.y * Math.sin(ph)) * r, z: p.z + (axisU.z * Math.cos(ph) + axisV.z * Math.sin(ph)) * r }
        for (const e of obstacles) c = keepOutside(c, e)
        return c
      })
      const { radiusMm, filaments } = pliedFilaments(pts, yr * 0.62, 3, twist)
      out.push({ hex: spec.colourHex, sheen: 0.85, radiusMm, filaments })
    }
  }
  return out
}

/** The roots along the cap's last round (one per `every`-th stitch outside the
 *  front arc) and the obstacles a strand must stay outside of. `standOff`
 *  pads the head/body obstacles (mm) so a thick curl hangs off the surface. */
function hairRoots(
  compiled: CompiledComposition, on: string, clear: string[], forward: V3, clearDeg: number, every: number, standOff: number, backClearDeg = 0,
): { roots: V3[]; obstacles: Ellipsoid[]; capE: Ellipsoid } {
  const cap = compiled.placed.find((pp) => pp.part.name === on)
  if (!cap || !cap.built) throw new Error(`hair: no built part named '${on}'`)
  const yr = compiled.yr
  const obstacles: Ellipsoid[] = []
  const capE = ellipsoidOf(cap, yr * 1.4 + standOff)
  obstacles.push(capE)
  for (const name of clear) {
    const pp = compiled.placed.find((q) => q.part.name === name)
    if (pp) obstacles.push(ellipsoidOf(pp, yr * 1.3 + standOff))
  }
  // The roots: the cap's last worked round, one root per stitch of that
  // round's COUNT, spaced evenly round the cap's axis (the strand's control
  // points zigzag with the stitch relief, so a walk along them over-counts
  // the stitches about threefold).
  const rounds = strandRounds(cap)
  const last = Math.max(...rounds)
  const ring = cap.ctrl.filter((_, i) => rounds[i] === last)
  const count = cap.part.rounds[cap.part.rounds.length - 1] ?? ring.length
  const f = norm(forward)
  const clearR = (clearDeg * Math.PI) / 180
  const angOf = (q: V3): number => Math.atan2(q.y - capE.c.y, q.x - capE.c.x)
  const faceAng = Math.atan2(f.y, f.x)
  const roots: V3[] = []
  for (let k = 0; k < count; k += every) {
    // Stitch k's angle, counted from the back of the head round to the front.
    const th = faceAng + Math.PI + ((k + 0.5) / count) * 2 * Math.PI
    let best: V3 | null = null
    let bd = Infinity
    for (const q of ring) {
      let d = angOf(q) - th
      while (d > Math.PI) d -= 2 * Math.PI
      while (d < -Math.PI) d += 2 * Math.PI
      if (Math.abs(d) < bd) { bd = Math.abs(d); best = q }
    }
    if (!best) continue
    // Leave the front arc clear: angle between this root's outward direction
    // (about the cap's axis) and the face.
    const d = norm({ x: best.x - capE.c.x, y: best.y - capE.c.y, z: 0 })
    const ang = Math.acos(Math.max(-1, Math.min(1, d.x * f.x + d.y * f.y)))
    if (ang < clearR) continue
    if (ang > Math.PI - (backClearDeg * Math.PI) / 180) continue
    roots.push(best)
  }
  return { roots, obstacles, capE }
}

/** One hanging line from a root: out through the cap's thickness, then
 *  stepped 2 mm at a time, part its own direction and part gravity with a
 *  small sideways drift, kept outside the obstacles, stopping at the table.
 *  `decorate` may move each point (the yarn strand's pencil curl). */
function hangPath(
  root: V3, side: -1 | 1, len: number, capE: Ellipsoid, obstacles: Ellipsoid[], yr: number, rnd: () => number,
  decorate?: (p: V3, dir: V3, travelled: number) => V3,
  fall: { gravity?: number; drift?: V3; driftK?: number; pullTo?: V3; pullK?: number; pullBelowZ?: number } = {},
): V3[] {
  const step = 2.0
  // The knot: out through the cap's thickness, then over its surface.
  const n = norm({ x: root.x - capE.c.x, y: root.y - capE.c.y, z: (root.z - capE.c.z) * 0.6 })
  // Each end leaves the knot a little to one side along the round.
  const tang = norm({ x: -n.y, y: n.x, z: 0 })
  const pts: V3[] = [root]
  let p: V3 = { x: root.x + n.x * yr * 1.2 + tang.x * side * yr * 0.8, y: root.y + n.y * yr * 1.2 + tang.y * side * yr * 0.8, z: root.z + n.z * yr * 1.2 }
  pts.push(p)
  let dir: V3 = norm({ x: n.x * 0.25 + tang.x * side * 0.15, y: n.y * 0.25 + tang.y * side * 0.15, z: -0.8 })
  const g: V3 = { x: 0, y: 0, z: -1 }
  const gK = fall.gravity ?? 0.45
  // A gentle sideways drift per strand so the hair is not combed.
  const drift = fall.drift ?? norm({ x: rnd() - 0.5, y: rnd() - 0.5, z: 0 })
  const driftK = fall.driftK ?? 0.02 + 0.05 * rnd()
  let travelled = 0
  const steps = Math.ceil(len / step)
  for (let s = 0; s < steps; s++) {
    // Hair resting on a doll leans IN toward her under the head (it lies on
    // the shoulders and the dress, not out in the air): a pull toward the
    // body's axis below `pullBelowZ`; the obstacles keep it off the surface.
    let pull: V3 = { x: 0, y: 0, z: 0 }
    if (fall.pullTo && p.z < (fall.pullBelowZ ?? -Infinity)) {
      const toAxis = norm({ x: fall.pullTo.x - p.x, y: fall.pullTo.y - p.y, z: 0 })
      pull = { x: toAxis.x * (fall.pullK ?? 0.12), y: toAxis.y * (fall.pullK ?? 0.12), z: 0 }
    }
    dir = norm({
      x: dir.x * (1 - gK) + g.x * gK + drift.x * driftK + pull.x,
      y: dir.y * (1 - gK) + g.y * gK + drift.y * driftK + pull.y,
      z: dir.z * (1 - gK) + g.z * gK,
    })
    let q: V3 = { x: p.x + dir.x * step, y: p.y + dir.y * step, z: p.z + dir.z * step }
    for (const e of obstacles) q = keepOutside(q, e)
    // The settled direction after the obstacles had their say.
    dir = norm({ x: q.x - p.x, y: q.y - p.y, z: q.z - p.z })
    travelled += step
    p = q
    pts.push(decorate ? decorate(p, dir, travelled) : p)
    if (p.z < yr * 1.5) break // the table
  }
  return pts
}

/** The ringlet pieces of a spec, one build per distinct chain count (built,
 *  relaxed and audited flat; `problems` non-empty = not genuinely stitched). */
export function ringletPieces(spec: RingletHairSpec, yr: number): Map<number, DressingPiece> {
  const out = new Map<number, DressingPiece>()
  for (const n of spec.chains) if (!out.has(n)) out.set(n, corkscrewStrip(yr, spec.colourHex, n, spec.per ?? RINGLET_PER_CH))
  return out
}

/** The roots a ringlet spec sews to (count and placement), for the words and
 *  the strokes alike. */
export function ringletRoots(compiled: CompiledComposition, spec: RingletHairSpec): V3[] {
  const r = RINGLET_CORE_MM + compiled.yr * 0.8
  return hairRoots(compiled, spec.on, spec.clear, spec.forward, spec.clearDeg ?? 30, spec.every ?? 2, spec.standOffMm ?? r, spec.backClearDeg ?? 0).roots
}

/**
 * The FRINGE: `count` lengths of the hair yarn lying over the forehead, side
 * by side, from the parting (high on one side of the crown) sweeping down
 * across the brow to the other temple, each a plied strand laid on the cap's
 * outer surface (the head's ellipsoid padded by the cap's thickness, kept
 * outside the cap itself). The ends are sewn down under the flowers.
 */
export function fringeStrokes(compiled: CompiledComposition, spec: RingletHairSpec, twist = 0.08): YarnStrokeOut[] {
  if (!spec.fringe) return []
  const yr = compiled.yr
  const head = compiled.placed.find((pp) => pp.part.name === (spec.clear[0] ?? 'head'))
  const cap = compiled.placed.find((pp) => pp.part.name === spec.on)
  if (!head || !cap) return []
  const rnd = prng((spec.seed ?? 11) + 7)
  const headE = ellipsoidOf(head, yr * 2.3)
  const capE = ellipsoidOf(cap, yr * 1.3)
  const f = norm(spec.forward)
  const rt = norm({ x: f.y, y: -f.x, z: 0 })
  const at = (azDeg: number, elDeg: number): V3 => {
    const a = (azDeg * Math.PI) / 180
    const e = (elDeg * Math.PI) / 180
    const d = { x: rt.x * Math.sin(a) * Math.cos(e) + f.x * Math.cos(a) * Math.cos(e), y: rt.y * Math.sin(a) * Math.cos(e) + f.y * Math.cos(a) * Math.cos(e), z: Math.sin(e) }
    const p = { x: headE.c.x + d.x * headE.r.x, y: headE.c.y + d.y * headE.r.y, z: headE.c.z + d.z * headE.r.z }
    return keepOutside(p, capE)
  }
  const n = spec.fringe.count
  const partAz = spec.fringe.partAz ?? -14
  const sweep = partAz < 0 ? 1 : -1 // the fringe sweeps away from the parting
  const out: YarnStrokeOut[] = []
  for (let i = 0; i < n; i++) {
    const k = i - (n - 1) / 2
    // From the parting (fanned a little) down across the forehead to the far
    // temple, the strands spread along the brow line; a slight sag midway.
    const az0 = partAz - sweep * k * 3.2 + (rnd() - 0.5) * 3
    const el0 = 48 - k * 2.2 + (rnd() - 0.5) * 3
    const az1 = sweep * (60 + k * 6) + (rnd() - 0.5) * 6
    const el1 = -3 - k * 3.6 + (rnd() - 0.5) * 3
    const sag = 4 + 4 * rnd()
    const pts: V3[] = []
    const steps = 26
    // Each strand rides a little higher or lower off the surface than its
    // neighbours (r16's nine, all exactly on it, fused into one flat band).
    const lift = (rnd() - 0.3) * yr * 1.1
    for (let s = 0; s <= steps; s++) {
      const t = s / steps
      const az = az0 + (az1 - az0) * t
      const el = el0 + (el1 - el0) * (t * t * (3 - 2 * t)) - sag * Math.sin(Math.PI * t)
      const q = at(az, el)
      const n = norm({ x: q.x - headE.c.x, y: q.y - headE.c.y, z: q.z - headE.c.z })
      pts.push({ x: q.x + n.x * lift, y: q.y + n.y * lift, z: q.z + n.z * lift })
    }
    const { radiusMm, filaments } = pliedFilaments(smooth(pts, 3), yr * 0.62, 3, twist)
    out.push({ hex: spec.colourHex, sheen: 0.85, radiusMm, filaments })
  }
  return out
}

/**
 * Lay the ringlets on the compiled composition: every root gets one wound
 * corkscrew strip, its axis the root's hanging line. Throws if a strip fails
 * the audit (the doll test checks them too). Deterministic (seeded).
 */
export function ringletHairStrokes(compiled: CompiledComposition, spec: RingletHairSpec, twist = 0.08): YarnStrokeOut[] {
  const yr = compiled.yr
  const rnd = prng(spec.seed ?? 11)
  const standOff = spec.standOffMm ?? RINGLET_CORE_MM + yr * 0.8
  const { roots, obstacles, capE } = hairRoots(compiled, spec.on, spec.clear, spec.forward, spec.clearDeg ?? 30, spec.every ?? 2, standOff, spec.backClearDeg ?? 0)
  const pieces = ringletPieces(spec, yr)
  // The body's axis and the head's underside, for the inward lean of hair
  // resting on the shoulders.
  const body = compiled.placed.find((pp) => pp.part.name === (spec.clear[1] ?? 'body'))
  const head = compiled.placed.find((pp) => pp.part.name === (spec.clear[0] ?? 'head'))
  const axis: V3 = body ? { x: (body.bounds.minx + body.bounds.maxx) / 2, y: (body.bounds.miny + body.bounds.maxy) / 2, z: 0 } : { x: capE.c.x, y: capE.c.y, z: 0 }
  const underHead = head ? head.bounds.minz + 4 : capE.c.z - capE.r.z
  for (const [n, pc] of pieces) if (pc.problems.length) throw new Error(`ringlet of ${n} ch failed the audit: ${pc.problems[0]}`)
  // The thin obstacles the finished curl itself must stay outside of.
  const tight = [ellipsoidOf(compiled.placed.find((pp) => pp.part.name === spec.on)!, yr * 1.2)]
  for (const name of spec.clear) {
    const pp = compiled.placed.find((q) => q.part.name === name)
    if (pp) tight.push(ellipsoidOf(pp, yr * 1.2))
  }
  const f = norm(spec.forward)
  // Order the roots by how far round from the face they sit, so the chain
  // lengths (longest first) go to the roots framing the face.
  const byFront = roots
    .map((r) => ({ r, ang: Math.acos(Math.max(-1, Math.min(1, norm({ x: r.x - capE.c.x, y: r.y - capE.c.y, z: 0 }).x * f.x + norm({ x: r.x - capE.c.x, y: r.y - capE.c.y, z: 0 }).y * f.y))) }))
    .sort((a, b) => a.ang - b.ang)
  const out: YarnStrokeOut[] = fringeStrokes(compiled, spec, twist)
  byFront.forEach(({ r: root, ang }, i) => {
    // The four framing the face take the longest chain, the back third the
    // shortest (so the mass of curls narrows behind her and the wings show),
    // the sides a random pick of the rest.
    const last = spec.chains.length - 1
    const chains = spec.chains[i < 4 ? 0 : i >= Math.floor((byFront.length * 2) / 3) ? last : Math.min(last, 1 + Math.floor(rnd() * last))]!
    const piece = pieces.get(chains)!
    const side: -1 | 1 = rnd() < 0.5 ? -1 : 1
    // Gravity leads (0.65): the curl drops from its root rather than standing
    // out from the head; the ones framing the face drift FORWARD so they fall
    // in front of the shoulders (the bar's), and below the head every curl
    // leans in to rest against the body.
    const frontness = 0.55 * Math.max(0, 1 - ang / (Math.PI * 0.6))
    const drift = norm({ x: f.x * frontness + (rnd() - 0.5) * 0.3, y: f.y * frontness + (rnd() - 0.5) * 0.3, z: 0 })
    const path = hangPath(root, side, 400, capE, obstacles, yr, rnd, undefined, {
      gravity: 0.65, drift, driftK: 0.04 + 0.06 * frontness, pullTo: axis, pullK: 0.14, pullBelowZ: underHead,
    })
    const frameAt = polylineFrame(path)
    const nodes = piece.built.model.nodes
    const phase = 2 * Math.PI * rnd()
    const cs = Math.cos(phase), sn = Math.sin(phase)
    const pts: V3[] = piece.built.strandPath.map((ni) => {
      const q = nodes[ni]!
      // Each ringlet starts its turn at its own angle round the line.
      const wound = ringletPose({ x: q.x, y: q.y, z: q.z }, {
        coreMm: RINGLET_CORE_MM, pitchMm: RINGLET_PITCH_MM,
        frameAt: (a) => {
          const F = frameAt(a)
          return { p: F.p, t: F.t, n: { x: F.n.x * cs + F.b.x * sn, y: F.n.y * cs + F.b.y * sn, z: F.n.z * cs + F.b.z * sn }, b: { x: F.b.x * cs - F.n.x * sn, y: F.b.y * cs - F.n.y * sn, z: F.b.z * cs - F.n.z * sn } }
        },
      })
      let c = wound
      for (const e of tight) c = keepOutside(c, e)
      if (c.z < yr * 0.8) c = { x: c.x, y: c.y, z: yr * 0.8 }
      return c
    })
    // Smoothed like every placed piece's strand (the raw node polyline
    // rendered as a nubbly caterpillar in round 9), through every THIRD node
    // at three points a segment (one point a node, ~1.1 mm apart, still ~22
    // points a turn): the ringlets are a third of the scene's filament points
    // and the render task runs out of memory above a ~97 MB scene (rounds 10,
    // 12 and the first r16 scene).
    const every3 = pts.filter((_, i) => i % 3 === 0 || i === pts.length - 1)
    const { radiusMm, filaments } = pliedFilaments(smooth(every3, 3), yr * 0.62, 3, twist)
    out.push({ hex: spec.colourHex, sheen: 0.85, radiusMm, filaments })
  })
  return out
}

/** The ringlets' pattern lines, from the same spec the render uses. */
export function ringletHairWords(spec: RingletHairSpec, capLastRound: number, hairLabel: string): string[] {
  const every = spec.every ?? 2
  const clear = spec.clearDeg ?? 30
  const roots = Math.round((capLastRound * (360 - 2 * clear)) / 360 / every)
  const counts = [...new Set(spec.chains)]
  const lines: string[] = []
  const perLen = Math.round(roots / counts.length)
  counts.forEach((n, i) => {
    const count = i === 0 ? roots - perLen * (counts.length - 1) : perLen
    lines.push(...ringletWords(n, spec.per ?? RINGLET_PER_CH, count, hairLabel))
  })
  lines.push(
    `Sew the ringlets by their starting ends to ${every === 1 ? 'every stitch' : every === 2 ? 'every other stitch' : every === 3 ? 'every third stitch' : `every ${every}th stitch`} of the hair cap's last round, from one side of the face round the back to the other, the longest ones nearest the face so they fall in front of the shoulders. Leave the front clear above the eyes.`,
  )
  if (spec.fringe) {
    const partSide = (spec.fringe.partAz ?? -14) < 0 ? 'left' : 'right'
    const far = partSide === 'left' ? 'right' : 'left'
    lines.push(
      `Fringe: cut ${spec.fringe.count} lengths of ${hairLabel} about 12 cm long. Lay them side by side over the forehead from the parting (a little to her ${partSide} of the crown) sweeping down across the brow to her ${far} temple, just above the eyes. Sew each end down with a small stitch in matching thread and tuck the ends under the flowers.`,
    )
  }
  return lines
}
