/**
 * A YARN POMPOM — made the way a maker makes one, as geometry.
 *
 * A real pompom is yarn wrapped many times round a card or a fork, tied tight
 * through the middle, the loops cut, and the ball trimmed round. What is left
 * is a few hundred short cut STRANDS, every one passing through (or very near)
 * the tie at the centre and pointing in its own direction, their cut ends
 * lying on a sphere. That is exactly what this builds: `strands` straight-ish
 * lengths of the same yarn, each threaded through the tie bundle at a random
 * orientation, each cut where it meets the trimmed radius, with the slight bow
 * a cut strand keeps from having been wound. Nothing is a sphere mesh or a
 * fuzz shader: the render sweeps real yarn along every strand with the piece's
 * own fibre (chenille, fine cotton …), so a pompom in fine cotton looks like a
 * fine-cotton pompom and the written pattern's "wrap, tie, cut, trim" produces
 * what is shown.
 *
 * Render strokes only: a pompom carries no stitches, so it is outside the audit
 * and the geometry hash, like a safety eye.
 */

import { pliedFilaments, type V3 } from '../yarnLoop'

export interface PompomSpec {
  /** Centre of the trimmed ball (world mm). */
  centre: V3
  /** Trimmed radius (mm). */
  radiusMm: number
  /** The yarn's radius (mm): the same yr the piece it is sewn to renders at. */
  yarnRadiusMm: number
  colourHex: string
  /** Cut strands (default: enough to cover the trimmed surface with cut ends,
   *  ~2 ends a strand at the yarn's own diameter — a full, dense pompom). */
  strands?: number
  /** Deterministic seed (the same spec always builds the same pompom). */
  seed?: number
}

export interface YarnStrokeOut {
  hex: string
  sheen: number
  radiusMm: number
  filaments: number[][][]
  /** A fibre look of its own (loom_render_crochet.py groups strokes by it). */
  fibre?: string
}

/** mulberry32 — a tiny deterministic PRNG so a pompom is reproducible. */
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

/** How many cut strands fill a pompom of this size in this yarn: the trimmed
 *  surface divided by the footprint of two cut ends, packed a little loose. */
export function pompomStrandCount(radiusMm: number, yarnRadiusMm: number): number {
  // Cut ends do not tile the surface: strands leave it at every angle and the
  // trimmed ball is packed solid underneath, so a full pompom carries several
  // strands per end-footprint of surface (a real 4 cm pompom in DK is wound
  // ~150 times round a 3-arm maker: ~450 cut strands; r1 at 1.9 per footprint
  // rendered as a sparse knobbly ball).
  const surface = 4 * Math.PI * radiusMm * radiusMm
  const endArea = Math.PI * yarnRadiusMm * yarnRadiusMm
  return Math.max(300, Math.min(3000, Math.round((surface / (2 * endArea)) * 9)))
}

/**
 * The strokes of one pompom: one stroke per cut strand (3 plies each, so the
 * renderer's fibre re-ply sees a clean plied set and rebuilds the strand in the
 * scene's fibre exactly as it does for the stitches).
 */
export function pompomStrokes(spec: PompomSpec, twist = 0.08): YarnStrokeOut[] {
  const R = spec.radiusMm
  const yr = spec.yarnRadiusMm
  const n = spec.strands ?? pompomStrandCount(R, yr)
  const rnd = prng(spec.seed ?? 7)
  const C = spec.centre
  const out: YarnStrokeOut[] = []
  // The tie bundle: strands pass through a core of this radius, not a point —
  // a tied pompom's middle is a knot of yarn as thick as the tie can gather.
  const core = Math.min(R * 0.35, yr * 5)
  for (let i = 0; i < n; i++) {
    // A uniformly random direction.
    const z = 2 * rnd() - 1
    const ph = 2 * Math.PI * rnd()
    const sxy = Math.sqrt(Math.max(0, 1 - z * z))
    const d: V3 = { x: sxy * Math.cos(ph), y: sxy * Math.sin(ph), z }
    // Two perpendiculars.
    const ref: V3 = Math.abs(d.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 }
    const u = norm(cross(d, ref))
    const v = cross(d, u)
    // Where it threads the core (offset across the strand's own direction).
    const oa = core * Math.sqrt(rnd())
    const oph = 2 * Math.PI * rnd()
    const ou = oa * Math.cos(oph)
    const ov = oa * Math.sin(oph)
    // Cut where the strand meets the trimmed sphere, each end its own trim.
    const half = Math.sqrt(Math.max(R * R - oa * oa, (yr * 2) ** 2))
    const tA = -half * (1 - 0.1 * rnd())
    const tB = half * (1 - 0.1 * rnd())
    // The bow a wound strand keeps: a gentle arc across its length.
    const bowAmp = R * (0.04 + 0.08 * rnd())
    const bowPh = 2 * Math.PI * rnd()
    const bu = Math.cos(bowPh)
    const bv = Math.sin(bowPh)
    const pts: V3[] = []
    const steps = 7
    for (let k = 0; k <= steps; k++) {
      const f = k / steps
      const t = tA + (tB - tA) * f
      const bow = bowAmp * Math.sin(Math.PI * f)
      pts.push({
        x: C.x + d.x * t + u.x * (ou + bu * bow) + v.x * (ov + bv * bow),
        y: C.y + d.y * t + u.y * (ou + bu * bow) + v.y * (ov + bv * bow),
        z: C.z + d.z * t + u.z * (ou + bu * bow) + v.z * (ov + bv * bow),
      })
    }
    // A cut strand's ends untwist and fluff: the strands render a little
    // thinner than the worked yarn and there are more of them (r2 at the
    // yarn's full radius rendered as a ball of beads).
    const { radiusMm, filaments } = pliedFilaments(pts, yr * 0.85 * 0.62, 3, twist * 0.6)
    out.push({ hex: spec.colourHex, sheen: 0.85, radiusMm, filaments })
  }
  return out
}

/** The maker's line for a pompom of this size (UK pattern wording). */
export function pompomInstruction(radiusMm: number, where: string, yarn = 'the yarn'): string {
  const cm = (2 * radiusMm) / 10
  const card = Math.round(cm * 1.5 * 2) / 2
  return `Make a pompom: wrap ${yarn} about ${Math.round(40 + cm * 25)} times round a ${card} cm card (or a pompom maker), tie tightly through the middle with a length of yarn, cut the loops and trim to a ${cm.toFixed(1).replace(/\.0$/, '')} cm ball. Sew it to ${where} with the tie ends.`
}

function cross(a: V3, b: V3): V3 {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }
}
function norm(a: V3): V3 {
  const l = Math.hypot(a.x, a.y, a.z) || 1
  return { x: a.x / l, y: a.y / l, z: a.z / l }
}
