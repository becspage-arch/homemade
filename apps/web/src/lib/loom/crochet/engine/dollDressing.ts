/**
 * THE DOLL'S DRESSING (fairy doll rounds 9+; bar: bar-fairy-doll.png).
 *
 * The small free-form pieces a fine-cotton doll maker adds to the base, each
 * built with the MOTIF KIT (motifs/kit.ts) the way the maker crochets it,
 * relaxed and AUDITED flat exactly as worked, then POSED (a rigid or maker's
 * staging bend: a strip rolled into a rose, a strip twisted into a corkscrew,
 * a frill gathered round a hem) the way the finished piece sits on the doll:
 *
 *  - CORKSCREW RINGLET: ch N, then 3 dc (UK) in each ch back along the chain.
 *    Three stitches on every chain make the stitch edge three times longer
 *    than the chain edge, and the strip can only lie as a spiral: the chain
 *    is the core of a tight helix and the stitches fan outward round it.
 *  - LACE LOBE (a wing): a big two-sided leaf worked round a foundation chain
 *    with a ch-1 space between every stitch (skip a chain each time), graded
 *    heights up to trtr (UK) in the middle, a (dc, ch 3, dc) point at the tip.
 *    Two lobes, an upper and a lower, sewn by their stems make one fairy wing.
 *  - FRILL: a long strip of graded scallops (the rose strip's topology) worked
 *    along a foundation chain, gathered and sewn to the skirt's hem.
 *  - HAIR ROSE: the rolled rose strip, four small petals, rolled from the
 *    first petal (the centre) outward.
 *  - SMALL FLOWER: a magic-ring centre and one round of five hdc-high petals.
 *  - LEAF: the motif leaf, small.
 *
 * Every piece's words are written from the same counts.
 */

import type { StitchId } from './dictionary'
import { rowPitchYr } from './dictionary'
import { MotifStrand, along, add, mul, intoRingRound, shapedRound, sub, unit, type ChainLoop, type Crown } from './motifs/kit'
import { intoChain, leafPiece, runWords } from './motifs/leaf'
import { rolledStrip } from './motifs/rolled-rose'
import { UK, pieceOf } from './motifs/common'
import type { MotifPiece, V3 } from './motifs/types'

/** A built dressing piece: the flat relaxed strand with its audit result and
 *  the pose that puts it on the doll. The composition applies `pose` to the
 *  nodes AFTER the audit (composition.ts `custom`). */
export interface DressingPiece {
  built: MotifPiece['built']
  problems: string[]
  pose?: (p: V3, node: number) => V3
}

const asDressing = (p: MotifPiece, pose?: DressingPiece['pose']): DressingPiece => ({ built: p.built, problems: p.problems, pose: pose ?? p.pose })

/** Foundation-chain pitch the kit makes chains at (yr). */
const CH = 2.6

// ── Corkscrew ringlet ───────────────────────────────────────────────────────

/** Stitches fanned into each chain: 2.5 = 3 and 2 alternately. (A full 3 in
 *  every chain is the classic recipe, and it audits clean at 30-55 chains,
 *  but at the 44-64 chains a doll's ringlet needs the fan at the free end of
 *  the chain slid a stitch along it in one hook of three hundred; 3 and 2
 *  alternately is clean at every length, and still a tight corkscrew.) */
export const RINGLET_PER_CH = 2.5
/** The helix the strip twists into: the stitch edge is `per` times the chain
 *  edge, so the chain winds at a core radius of (stitch height)/(per − 1) and
 *  the stitch tops `per` times further out: at fine cotton a dc (UK) is
 *  ~3.1 mm tall, the core ~2.1 mm, the curl ~10 mm across — a hollow spring,
 *  the bar's pencil curl. `RINGLET_PITCH_MM` is the drop per turn. */
export const RINGLET_CORE_MM = +((2.4 * 1.3) / (RINGLET_PER_CH - 1)).toFixed(2)
export const RINGLET_PITCH_MM = 4.4
const RINGLET_LEAN = (8 * Math.PI) / 180

/** The flat strip: `chains` chains, then `per` dc (UK) in the 2nd ch from the
 *  hook and in each ch back along. The flat relaxed strip ruffles (the extra
 *  stitches have nowhere to go) and is audited as worked; `ringletPose` winds
 *  it. The root (the slip knot end, where the maker sews it on) is at x = 0,
 *  the strip runs along −x, stitches toward −y. */
export function corkscrewStrip(yr: number, hex: string, chains: number, per = RINGLET_PER_CH, name = 'ringlet', o: { iterations?: number; spreadYr?: number } = {}): DressingPiece {
  const nCh = chains + 1 // + the chain skipped at the hook end (turning)
  const pitch = yr * CH
  const m = new MotifStrand(yr, hex)
  m.slipKnot({ x: 0, y: 0 }, { x: -1, y: 0 })
  m.sectionName = 'chain'
  const loops = m.chain(nCh, [{ x: 0, y: 0 }, { x: -pitch * nCh, y: 0 }], { turning: 1 })
  m.sectionName = 'stitches'
  // From the 2nd ch from the hook (loops[nCh - 2]) back to the first chain.
  // The two END chains take one stitch fewer (2 dc in the 2nd ch from the
  // hook, 2 in the last): a full fan on a free chain end slid off its leg.
  const fans = ringletFans(chains, per)
  for (let k = nCh - 2; k >= 0; k--) fanIntoChain(m, loops[k]!, 'sc', fans[nCh - 2 - k]!, o.spreadYr ?? RINGLET_SPREAD_YR)
  m.fastenOff({ x: 1, y: 0 })
  const built = m.finish(pitch * nCh, yr * 6)
  return asDressing(pieceOf(name, m, built, undefined, o.iterations ?? RINGLET_ITERATIONS))
}

/** How many stitches go into each chain, in work order (from the 2nd ch from
 *  the hook to the last): 2 in the first and last chain, `per` in each between
 *  (a fractional `per` alternates its two neighbours: 2.5 = 3, 2, 3, 2 ...).
 *  The builder and the words both read this. */
export function ringletFans(chains: number, per = RINGLET_PER_CH): number[] {
  const hi = Math.ceil(per), lo = Math.floor(per)
  return Array.from({ length: chains }, (_, i) => (i === 0 || i === chains - 1 ? Math.min(2, lo) : Number.isInteger(per) ? per : i % 2 === 1 ? hi : lo))
}

/** `n` stitches of `id` fanned into one chain loop (its left leg, travelling
 *  back toward the chain's start), spread along the chain the way a round's
 *  increase spreads two stitches over one crown. */
/** The fan's crowns span this many yarn radii along the chain, and the
 *  flat strip is relaxed this long (a 200 mm strip of fanned stitches needs
 *  longer than a motif to settle its ruffle). */
const RINGLET_SPREAD_YR = 1.9
const RINGLET_ITERATIONS = 420

function fanIntoChain(m: MotifStrand, L: ChainLoop, id: StitchId, n: number, spreadYr = RINGLET_SPREAD_YR): Crown[] {
  const out: Crown[] = []
  for (let t = 0; t < n; t++) {
    const u = n === 1 ? 0 : t / (n - 1) - 0.5 // −0.5 … 0.5
    const f = along(L.c, mul(L.u, -1))
    const leg = m.nodes[L.legL]!
    const loc = f.local({ x: leg.x, y: leg.y })
    out.push(m.stitch({
      id, frame: f, xCrown: loc.lx + u * m.yr * spreadYr, into: { kind: 'node', node: L.legL },
      spread: n === 1 ? 0 : -u * 1.2, hookDepthScale: t > 0 ? 1.5 : 1,
    }))
  }
  return out
}

/**
 * Wind the flat strip into its helix about a hanging AXIS given as a polyline
 * (the maker's curl falls along the head and shoulders, so the axis need not be
 * straight): arclength along the chain becomes the turn angle, the stitch
 * height stands out from the core, the strip's thickness lies along the axis.
 * `axis` is sampled by arclength from the root; `frameAt(a)` returns the point
 * and a transported frame at axial distance `a`.
 */
export function ringletPose(
  p: V3, o: { coreMm: number; pitchMm: number; frameAt: (a: number) => { p: V3; t: V3; n: V3; b: V3 } },
): V3 {
  const s = Math.max(0, -p.x)
  const h = Math.max(0, -p.y)
  const k = Math.hypot(o.coreMm, o.pitchMm / (2 * Math.PI))
  const phi = s / k
  const a = (phi * o.pitchMm) / (2 * Math.PI) + h * Math.sin(RINGLET_LEAN) + p.z * 0.3
  const rho = o.coreMm + h * Math.cos(RINGLET_LEAN)
  const F = o.frameAt(a)
  const c = Math.cos(phi) * rho, sn = Math.sin(phi) * rho
  return {
    x: F.p.x + F.n.x * c + F.b.x * sn,
    y: F.p.y + F.n.y * c + F.b.y * sn,
    z: F.p.z + F.n.z * c + F.b.z * sn,
  }
}

/** A parallel-transported frame along a polyline, by arclength. Past the end
 *  the line continues along its last direction. */
export function polylineFrame(path: V3[]): (a: number) => { p: V3; t: V3; n: V3; b: V3 } {
  const pts: V3[] = []
  const acc: number[] = [0]
  for (const q of path) {
    if (pts.length && Math.hypot(q.x - pts[pts.length - 1]!.x, q.y - pts[pts.length - 1]!.y, q.z - pts[pts.length - 1]!.z) < 1e-6) continue
    if (pts.length) acc.push(acc[acc.length - 1]! + Math.hypot(q.x - pts[pts.length - 1]!.x, q.y - pts[pts.length - 1]!.y, q.z - pts[pts.length - 1]!.z))
    pts.push(q)
  }
  if (pts.length < 2) throw new Error('polylineFrame: need two points')
  const T: V3[] = []
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)]!, b = pts[Math.min(pts.length - 1, i + 1)]!
    T.push(unit3({ x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }))
  }
  // Transport a normal along the tangents.
  const N: V3[] = []
  const ref: V3 = Math.abs(T[0]!.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 }
  N.push(unit3(cross(cross(T[0]!, ref), T[0]!)))
  for (let i = 1; i < pts.length; i++) {
    const prev = N[i - 1]!
    const t = T[i]!
    const d = prev.x * t.x + prev.y * t.y + prev.z * t.z
    N.push(unit3({ x: prev.x - d * t.x, y: prev.y - d * t.y, z: prev.z - d * t.z }))
  }
  const total = acc[acc.length - 1]!
  return (a: number) => {
    if (a >= total) {
      const i = pts.length - 1
      const t = T[i]!, n = N[i]!
      const e = a - total
      return { p: { x: pts[i]!.x + t.x * e, y: pts[i]!.y + t.y * e, z: pts[i]!.z + t.z * e }, t, n, b: cross(t, n) }
    }
    let i = 0
    while (i + 1 < acc.length - 1 && acc[i + 1]! <= a) i++
    const u = (a - acc[i]!) / Math.max(1e-9, acc[i + 1]! - acc[i]!)
    const lerp = (A: V3, B: V3): V3 => ({ x: A.x + (B.x - A.x) * u, y: A.y + (B.y - A.y) * u, z: A.z + (B.z - A.z) * u })
    const t = unit3(lerp(T[i]!, T[i + 1]!))
    const n0 = lerp(N[i]!, N[i + 1]!)
    const d = n0.x * t.x + n0.y * t.y + n0.z * t.z
    const n = unit3({ x: n0.x - d * t.x, y: n0.y - d * t.y, z: n0.z - d * t.z })
    return { p: lerp(pts[i]!, pts[i + 1]!), t, n, b: cross(t, n) }
  }
}

const unit3 = (v: V3): V3 => {
  const l = Math.hypot(v.x, v.y, v.z) || 1
  return { x: v.x / l, y: v.y / l, z: v.z / l }
}
const cross = (a: V3, b: V3): V3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x })

/** How far down the axis a ringlet of `chains` chains reaches (mm). */
export function ringletDropMm(chains: number, yr: number, coreMm = RINGLET_CORE_MM, pitchMm = RINGLET_PITCH_MM): number {
  const k = Math.hypot(coreMm, pitchMm / (2 * Math.PI))
  return ((chains * yr * CH) / k) * (pitchMm / (2 * Math.PI))
}

export function ringletWords(chains: number, per = RINGLET_PER_CH, count: number, hairLabel: string): string[] {
  const fans = ringletFans(chains, per)
  const total = fans.reduce((a, b) => a + b, 0)
  const middle = Number.isInteger(per)
    ? `${per} ${UK.sc} in each ch to the last`
    : `then ${fans[1]} ${UK.sc} in the next ch and ${fans[2]} ${UK.sc} in the next, and so on alternately to the last ch`
  return [
    `Ringlets (make ${count}), in ${hairLabel}: ch ${chains + 1}.`,
    `Row 1: ${fans[0]} ${UK.sc} in the 2nd ch from the hook, ${middle}, ${fans[chains - 1]} ${UK.sc} in the last ch; the strip twists into a corkscrew as you go. (${total} sts)`,
    'Fasten off, leaving a tail at the starting end for sewing. Wind each ringlet once round a pencil and let it spring back.',
  ]
}

// ── Lace lobe (wing) ────────────────────────────────────────────────────────

/** One side of the upper and lower lobes, stem end to tip (UK: dc, tr, dtr,
 *  trtr ...). A ch-1 space is worked between every stitch. */
export const WING_UPPER: StitchId[] = ['hdc', 'tr', 'dtr', 'dtr', 'dtr', 'dtr', 'tr', 'hdc']
export const WING_LOWER: StitchId[] = ['hdc', 'tr', 'dtr', 'dtr', 'tr', 'hdc']
export const WING_STEM = 2

/**
 * A lobe worked both sides of a chain with a ch-1 space between every stitch:
 * `side` stitches each into every OTHER chain (the skipped chain under each
 * ch-1 is the lace hole), a (dc, ch 3, dc) point in the tip chain, back down the
 * other side, sl st into the first stem chain. Tip at the origin, the chain
 * along −x, the stem end at x ≈ −L.
 */
export function laceLobe(yr: number, hex: string, side: StitchId[], stem = WING_STEM, name = 'wing lobe'): DressingPiece {
  const n = side.length
  const lobeCh = 2 * n - 1
  const nCh = 1 + lobeCh + stem + 1 // tip chain + lobe chains + stem + turning chain
  const pitch = yr * CH
  const L0 = pitch * nCh
  const m = new MotifStrand(yr, hex)
  m.slipKnot({ x: 0, y: 0 }, { x: -1, y: 0 })
  m.sectionName = 'chain'
  const loops = m.chain(nCh, [{ x: 0, y: 0 }, { x: -L0, y: 0 }], { turning: 1 })
  // loops[0] = the tip chain, loops[1 .. lobeCh] = the lobe, loops[lobeCh+1 .. lobeCh+stem] = the stem.
  m.sectionName = 'stem'
  for (let i = 0; i < stem; i++) intoChain(m, loops[nCh - 2 - i]!, 'slst', 'L')
  m.sectionName = 'lobe'
  const space = (from: ChainLoop, to: ChainLoop, sideSign: 1 | -1, h: number): void => {
    // The ch-1 between two stitches: a chain lying along the edge, from the
    // crown just made toward the next stitch, at the stitch tops.
    const dir = unit(sub(to.c, from.c))
    const o = m.cursor
    m.chain(1, [o, add(o, mul(dir, yr * 2.2))], { hold: false })
    void sideSign
    void h
  }
  // Side A: from the stem end (loops[lobeCh]) to the tip, every other chain.
  for (let i = 0; i < n; i++) {
    const k = lobeCh - 2 * i
    intoChain(m, loops[k]!, side[i]!, 'L')
    if (i < n - 1) space(loops[k]!, loops[k - 2]!, 1, 0)
  }
  // The point: (dc, ch 3, dc) in the tip chain.
  const tipL = loops[0]!
  space(loops[1]!, tipL, 1, 0)
  intoChain(m, tipL, 'sc', 'L')
  const out = add(tipL.c, mul(tipL.u, -yr * 3.6))
  m.chain(3, [m.cursor, out], { turning: 3 })
  intoChain(m, tipL, 'sc', 'R')
  space(tipL, loops[1]!, -1, 0)
  // Side B: tip to stem, the heights reversed.
  for (let i = 0; i < n; i++) {
    const k = 1 + 2 * i
    intoChain(m, loops[k]!, side[n - 1 - i]!, 'R')
    if (i < n - 1) space(loops[k]!, loops[k + 2]!, -1, 0)
  }
  intoChain(m, loops[lobeCh + 1]!, 'slst', 'R')
  m.fastenOff({ x: -1, y: 0.3 })
  const built = m.finish(L0, yr * 24)
  return asDressing(pieceOf(name, m, built, undefined, 420))
}

/** The lobe stood up as a composition piece: its spine along local +z with
 *  the STEM at the bottom (the end that is sewn on) and the tip at the top,
 *  its face normal along local +x (so `spin` can turn it to the camera). */
export function lobeUprightPose(lengthMm: number): (p: V3) => V3 {
  // (x, y, z) → (z, −y, L + x): a rotation (det +1), the stem end x ≈ −L → z ≈ 0.
  return (p) => ({ x: p.z, y: -p.y, z: lengthMm + p.x })
}

export function wingWordsLace(upper: StitchId[], lower: StitchId[], stem: number, wingLabel: string): string[] {
  const lobe = (side: StitchId[], which: string): string[] => {
    const n = side.length
    const nCh = 1 + (2 * n - 1) + stem + 1
    const lace = (ids: StitchId[]): string => ids.map((id) => `${UK[id]} in next ch, ch 1, skip 1 ch`).join(', ').replace(/, ch 1, skip 1 ch$/, '')
    return [
      `${which} lobe: ch ${nCh}.`,
      `Stem: sl st in 2nd ch from hook and in the next ch. (${stem} sts)`,
      `First side: ${lace(side)}, ch 1, skip 1 ch. (${n} sts)`,
      `Tip: (${UK.sc}, ch 3, ${UK.sc}) in the last ch, ch 1.`,
      `Second side: working along the other side of the chain, ${lace([...side].reverse())}, sl st in the next ch. (${n + 1} sts)`,
      'Fasten off, leaving a tail for sewing.',
    ]
  }
  return [
    `Each wing is two lace lobes in ${wingLabel}, an upper and a lower, sewn together at their stems.`,
    ...lobe(upper, 'Upper'),
    ...lobe(lower, 'Lower'),
  ]
}

// ── Frill ───────────────────────────────────────────────────────────────────

export const FRILL_SCALLOP: StitchId[] = ['sc', 'hdc', 'dc', 'dc', 'hdc', 'sc']

/** The frill strip: `scallops` scallops of `FRILL_SCALLOP` (each followed by a
 *  sl st) along a foundation chain, gathered round a ring of radius `radiusMm`
 *  as a wave of `scallops` waves whose arclength is the chain's own length.
 *  Local: the chain edge is the piece's LOWEST plane (z ≈ 0, the edge sewn to
 *  the hem) and the scallops stand to +z, leaning outward. */
export function frillStrip(yr: number, hex: string, scallops: number, radiusMm: number, name = 'frill'): DressingPiece {
  const petals = Array.from({ length: scallops }, () => FRILL_SCALLOP)
  const piece = rolledStrip(yr, hex, petals, name)
  const nodes = piece.built.model.nodes
  let xmin = Infinity
  for (const q of nodes) xmin = Math.min(xmin, q.x)
  let xmax = -Infinity
  for (const q of nodes.slice(4)) xmax = Math.max(xmax, q.x)
  const L = xmax - xmin
  // The wave r(θ) = R + A sin(mθ) with the amplitude set so one turn is L long.
  const R = radiusMm
  const m = scallops
  const extra = Math.max(0, (L / (2 * Math.PI)) ** 2 - R * R)
  const A = Math.min(R * 0.5, (Math.sqrt(2 * extra) / m) * 1.0)
  const N = 4000
  const th: number[] = [0]
  const arc: number[] = [0]
  let prev = { x: R + A * Math.sin(0), y: 0 }
  for (let i = 1; i <= N; i++) {
    const t = (2 * Math.PI * i) / N
    const r = R + A * Math.sin(m * t)
    const q = { x: r * Math.cos(t), y: r * Math.sin(t) }
    arc.push(arc[i - 1]! + Math.hypot(q.x - prev.x, q.y - prev.y))
    th.push(t)
    prev = q
  }
  const total = arc[N]!
  const lean = (28 * Math.PI) / 180
  const pose = (p: V3): V3 => {
    const s = Math.max(0, Math.min(L, p.x - xmin))
    const target = (s / L) * total
    let i = 0
    while (i < N - 1 && arc[i + 1]! < target) i++
    const u = (target - arc[i]!) / Math.max(1e-9, arc[i + 1]! - arc[i]!)
    const t = th[i]! + (th[i + 1]! - th[i]!) * u
    const r = R + A * Math.sin(m * t)
    const h = Math.max(0, -p.y)
    const rr = r + h * Math.sin(lean) + p.z
    return { x: rr * Math.cos(t), y: rr * Math.sin(t), z: h * Math.cos(lean) + yr }
  }
  return asDressing(piece, pose)
}

export function frillWords(scallops: number, hemRound: number, frillLabel: string): string[] {
  const nCh = scallops * (FRILL_SCALLOP.length + 1) + 1
  return [
    `Frill, in ${frillLabel}: ch ${nCh}.`,
    `Row 1: starting in the 2nd ch from the hook, [${runWords(FRILL_SCALLOP)}, sl st in next ch] ${scallops} times. (${scallops} scallops)`,
    `Fasten off, leaving a long tail. Gather the chain edge a little and sew it round the skirt's last round (round ${hemRound}) with the scallops hanging below the hem, the join at the back.`,
  ]
}

// ── Roses, flowers and leaves for the hair ──────────────────────────────────

export const HAIR_ROSE_PETALS: StitchId[][] = [
  ['sc', 'hdc', 'sc'],
  ['hdc', 'dc', 'hdc'],
  ['hdc', 'dc', 'dc', 'hdc'],
  ['hdc', 'dc', 'tr', 'dc', 'hdc'],
]
/** The bouquet rose: three petals, a rose she can hold in front of the dress. */
export const BOUQUET_PETALS: StitchId[][] = [
  ['sc', 'hdc', 'sc'],
  ['sc', 'hdc', 'hdc', 'sc'],
  ['hdc', 'dc', 'dc', 'hdc'],
]
const ROSE_PITCH_YR = 3.0
const ROSE_R0_YR = 1.4

/** A small rolled rose: the strip is rolled from its FIRST petal (the centre)
 *  outward, the chain edge at the bottom (local z ≈ 0, where it is sewn),
 *  the petals standing up and leaning out toward the rim. */
export function hairRose(yr: number, hex: string, petals: StitchId[][] = HAIR_ROSE_PETALS, name = 'rose'): DressingPiece {
  const piece = rolledStrip(yr, hex, petals, name)
  let xmin = Infinity
  for (const q of piece.built.model.nodes) xmin = Math.min(xmin, q.x)
  const b = (yr * ROSE_PITCH_YR) / (2 * Math.PI)
  const r0 = yr * ROSE_R0_YR
  const pose = (p: V3): V3 => {
    const s = Math.max(0, p.x - xmin)
    const th = (-r0 + Math.sqrt(r0 * r0 + 2 * b * s)) / b
    const r = r0 + b * th
    const turns = th / (Math.PI * 2)
    const lean = ((6 + 30 * Math.min(1, turns / 2)) * Math.PI) / 180
    const h = Math.max(0, -p.y)
    const rr = r + p.z + h * Math.sin(lean)
    return { x: rr * Math.cos(th), y: rr * Math.sin(th), z: h * Math.cos(lean) + yr }
  }
  return asDressing(piece, pose)
}

export function hairRoseWords(label: string, count: number, petals: StitchId[][] = HAIR_ROSE_PETALS): string[] {
  const nCh = petals.reduce((a, p) => a + p.length + 1, 0) + 1
  return [
    `Roses (make ${count}), in ${label}: ch ${nCh}.`,
    `Row 1: starting in the 2nd ch from the hook, ${petals.map((p) => `[${runWords(p)}, sl st in next ch]`).join(', ')}. (${petals.length} petals)`,
    'Fasten off, leaving a long tail. Roll the strip from the first (smallest) petal with the chain edge level at the bottom, and stitch through the base to hold the roll.',
  ]
}

/** A small flat five-petal flower: 5 dc (UK) into the ring, then 2 htr in
 *  each stitch: every pair of htr sharing a stitch is one little petal.
 *  Local z up = its right side. */
export function smallFlower(yr: number, hex: string, name = 'flower'): DressingPiece {
  const m = new MotifStrand(yr, hex)
  const c = { x: 0, y: 0 }
  const ring = m.magicRing(c)
  m.sectionName = 'centre'
  const r1 = intoRingRound(m, ring, new Array(5).fill('sc'))
  const r = ring.r + yr * rowPitchYr('sc')
  m.sectionName = 'petals'
  shapedRound(m, c, r1, r1.map(() => ({ id: 'hdc' as StitchId, n: 2 })), r)
  m.fastenOff(unit(sub(c, m.cursor)))
  const R = r + yr * rowPitchYr('hdc')
  const piece = pieceOf(name, m, m.finish(R * 2, R * 2))
  return asDressing(piece, (p) => ({ x: p.x, y: p.y, z: p.z + yr }))
}

export function smallFlowerWords(label: string, count: number): string[] {
  return [
    `Small flowers (make ${count}), in ${label}: make a magic ring.`,
    `Round 1: 5 ${UK.sc} into the ring. (5 sts)`,
    `Round 2 (petals): 2 ${UK.hdc} in each st around. (10 sts)`,
    'Fasten off with a sl st, leaving a tail for sewing.',
  ]
}

export const HAIR_LEAF_SIDE: StitchId[] = ['hdc', 'dc', 'dc', 'hdc']
export const HAIR_LEAF_STEM = 1

/** The motif leaf, small, lying flat (local z up). */
export function hairLeaf(yr: number, hex: string, name = 'leaf'): DressingPiece {
  const piece = leafPiece(yr, hex, HAIR_LEAF_SIDE, HAIR_LEAF_STEM, name)
  return asDressing(piece, (p) => ({ x: p.x, y: p.y, z: p.z + yr }))
}

export function hairLeafWords(label: string, count: number): string[] {
  const n = HAIR_LEAF_SIDE.length
  const nCh = n + 1 + HAIR_LEAF_STEM + 1
  return [
    `Leaves (make ${count}), in ${label}: ch ${nCh}.`,
    `Stem: sl st in 2nd ch from hook. (${HAIR_LEAF_STEM} st)`,
    `First side: ${runWords(HAIR_LEAF_SIDE)}. (${n} sts)`,
    `Tip: (${UK.sc}, ch 2, ${UK.sc}) in the last ch.`,
    `Second side: working along the other side of the chain, ${runWords([...HAIR_LEAF_SIDE].reverse())}, sl st in the next ch. (${n + 1} sts)`,
    'Fasten off, leaving a tail for sewing.',
  ]
}

/** A flat piece (flower, leaf) lifted so its right side faces local +z and
 *  turned so its long axis runs along local +y. Used with placement `dir`
 *  (local +z toward the parent's outside = seated flat) — the composition
 *  seats the min-z pole, which for a flat piece is its back. */
export function flatOnSurfacePose(p: V3, yr: number): V3 {
  return { x: p.x, y: p.y, z: p.z + yr }
}
