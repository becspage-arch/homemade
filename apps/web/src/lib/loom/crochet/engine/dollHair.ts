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
import { pliedFilaments, type V3 } from '../yarnLoop'
import type { YarnStrokeOut } from './pompom'
import { writeInstructions, type CrochetProgram } from './program'

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
export function hairCapPart(headRounds: number[], hex: string, gaugeYr: number | undefined, forward: V3, tiltDeg = 18, extra = 1): AmigurumiPart {
  const rounds = hairCapRounds(headRounds, extra)
  const t = (tiltDeg * Math.PI) / 180
  const f = norm(forward)
  // Up, tilted back (away from the face) by `tiltDeg`.
  const dir = norm({ x: -f.x * Math.sin(t), y: -f.y * Math.sin(t), z: Math.cos(t) })
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
      'Pin the hair cap on the head with its magic ring at the crown, tilted a little back so its edge sits just above the brows at the front and lower at the nape, and sew it on round its last round.',
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
  const cap = compiled.placed.find((pp) => pp.part.name === spec.on)
  if (!cap || !cap.built) throw new Error(`rooted-hair: no built part named '${spec.on}'`)
  const yr = compiled.yr
  const rnd = prng(spec.seed ?? 11)
  const obstacles: Ellipsoid[] = []
  const capE = ellipsoidOf(cap, yr * 1.4)
  obstacles.push(capE)
  for (const name of spec.clear) {
    const pp = compiled.placed.find((q) => q.part.name === name)
    if (pp) obstacles.push(ellipsoidOf(pp, yr * 1.3))
  }
  // The roots: the cap's last worked round, in strand order, one root per
  // stitch (the strand carries ~4 control points a stitch at the fine gauge;
  // take points one stitch-width apart along the round).
  const rounds = strandRounds(cap)
  const last = Math.max(...rounds)
  const ring = cap.ctrl.filter((_, i) => rounds[i] === last)
  const sw = yr * (cap.part.gaugeYr ?? 2.7)
  const roots: V3[] = []
  let acc = Infinity
  const every = spec.every ?? 1
  const f = norm(spec.forward)
  const clear = ((spec.clearDeg ?? 42) * Math.PI) / 180
  let k = 0
  for (let i = 1; i < ring.length; i++) {
    const a = ring[i - 1]!, b = ring[i]!
    acc += Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z)
    if (acc < sw) continue
    acc = 0
    k++
    if (k % every !== 0) continue
    // Leave the front arc clear: angle between this root's outward direction
    // (about the cap's axis) and the face.
    const d = norm({ x: b.x - capE.c.x, y: b.y - capE.c.y, z: 0 })
    const ang = Math.acos(Math.max(-1, Math.min(1, d.x * f.x + d.y * f.y)))
    if (ang < clear) continue
    roots.push(b)
  }
  const out: YarnStrokeOut[] = []
  const curlR = spec.curl?.radiusMm ?? 2.6
  const turns = spec.curl?.turns ?? 2.5
  const step = 2.0
  for (const root of roots) {
    for (let end = 0; end < 2; end++) {
      const len = spec.lengthMm * (0.88 + 0.24 * rnd())
      // The knot: out through the cap's thickness, then over its surface.
      const n = norm({ x: root.x - capE.c.x, y: root.y - capE.c.y, z: (root.z - capE.c.z) * 0.6 })
      const side = end === 0 ? -1 : 1
      // Each end leaves the knot a little to one side along the round.
      const tang = norm({ x: -n.y, y: n.x, z: 0 })
      const pts: V3[] = [root]
      let p: V3 = { x: root.x + n.x * yr * 1.2 + tang.x * side * yr * 0.8, y: root.y + n.y * yr * 1.2 + tang.y * side * yr * 0.8, z: root.z + n.z * yr * 1.2 }
      pts.push(p)
      let dir: V3 = norm({ x: n.x * 0.25 + tang.x * side * 0.15, y: n.y * 0.25 + tang.y * side * 0.15, z: -0.8 })
      const g: V3 = { x: 0, y: 0, z: -1 }
      // A gentle sideways drift per strand so the hair is not combed.
      const drift = norm({ x: rnd() - 0.5, y: rnd() - 0.5, z: 0 })
      const driftK = 0.02 + 0.05 * rnd()
      let travelled = 0
      const phase0 = 2 * Math.PI * rnd()
      const curlFrom = len * (0.45 + 0.1 * rnd())
      const steps = Math.ceil(len / step)
      // Each ringlet winds about its own hanging axis.
      let axisU: V3 = { x: 1, y: 0, z: 0 }
      let axisV: V3 = { x: 0, y: 1, z: 0 }
      for (let s = 0; s < steps; s++) {
        dir = norm({ x: dir.x * 0.55 + g.x * 0.45 + drift.x * driftK, y: dir.y * 0.55 + g.y * 0.45 + drift.y * driftK, z: dir.z * 0.55 + g.z * 0.45 })
        let q: V3 = { x: p.x + dir.x * step, y: p.y + dir.y * step, z: p.z + dir.z * step }
        for (const e of obstacles) q = keepOutside(q, e)
        // The settled direction after the obstacles had their say.
        dir = norm({ x: q.x - p.x, y: q.y - p.y, z: q.z - p.z })
        travelled += step
        p = q
        if (curlR > 0 && travelled > curlFrom) {
          // Wind round the hanging line: a helix of `turns` over the curled part.
          const u = (travelled - curlFrom) / Math.max(1, len - curlFrom)
          const ph = phase0 + side * u * turns * 2 * Math.PI
          const r = curlR * Math.min(1, u * 3) * (1 - 0.15 * u)
          const ref: V3 = Math.abs(dir.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 }
          axisU = norm({ x: dir.y * ref.z - dir.z * ref.y, y: dir.z * ref.x - dir.x * ref.z, z: dir.x * ref.y - dir.y * ref.x })
          axisV = { x: dir.y * axisU.z - dir.z * axisU.y, y: dir.z * axisU.x - dir.x * axisU.z, z: dir.x * axisU.y - dir.y * axisU.x }
          let c: V3 = { x: p.x + (axisU.x * Math.cos(ph) + axisV.x * Math.sin(ph)) * r, y: p.y + (axisU.y * Math.cos(ph) + axisV.y * Math.sin(ph)) * r, z: p.z + (axisU.z * Math.cos(ph) + axisV.z * Math.sin(ph)) * r }
          for (const e of obstacles) c = keepOutside(c, e)
          pts.push(c)
        } else {
          pts.push(p)
        }
        if (p.z < yr * 1.5) break // the table
      }
      const { radiusMm, filaments } = pliedFilaments(pts, yr * 0.62, 3, twist)
      out.push({ hex: spec.colourHex, sheen: 0.85, radiusMm, filaments })
    }
  }
  return out
}
