/**
 * THE MOTIF KIT — free-form flat crochet pieces (audit rounds 8 and 9: stars,
 * hearts, leaves, butterflies, daisies, roses, vines).
 *
 * A motif is still ONE continuous strand, genuinely stitched, held by
 * self-collision and audited like every other build. What it adds over the
 * row / round builders is that a motif's stitches are not all worked in one
 * frame: a star's centre is worked in the round, but its points are CHAINED
 * OUT and WORKED BACK along the chain; a leaf is worked up one side of a chain
 * and down the other; a heart is a run of different-height stitches into one
 * magic ring. So every stitch here is placed in its OWN fabric frame:
 *
 *   - `polar(c, r)`  — worked in the round about a centre (along-row =
 *     tangential, height = radial), exactly buildRounds' frame;
 *   - `along(o, a)`  — worked along a chain or an edge running in direction a
 *     (height = a turned −90°, the same handedness as the round frame, so a
 *     stitch worked back along a star point is the same stitch as one worked
 *     in the round, just rotated).
 *
 * The stitch itself is `emitPlainStitch` with the real cell (head loop,
 * yarn-over collars) and the no-turn settings the round builders use
 * (surfaceLay, backCross, calmed legs). Nothing is drawn: each stitch hooks a
 * real loop — a magic-ring strand ('ring'), the head of a stitch below
 * ('hook'), or one leg of a CHAIN loop ('hook') — and chains are the genuine
 * pull-through topology (each loop's two strands threaded through the loop
 * before, 'cross' links), never a pinned rail. The only pins are the magic
 * ring / slip knot anchor at the start of the strand.
 *
 * Every link records the frame it was worked in (`StitchLink.axis`) so the
 * audit measures it there, and every node records its stitch's height axis
 * (`YarnModel.layoutAxis`) for the blocked-flat hold (relax layoutMode
 * 'axis') — the same hold rows ('y') and rounds ('radial') get.
 */

import { STITCHES, rowPitchYr, type StitchId } from '../dictionary'
import {
  createStrand,
  dimsFor,
  emitPlainStitch,
  headApexRelief,
  looseFlags,
  HOOK_SPREAD_YR,
  type BuiltContinuous,
  type StrandCtx,
  type StitchLink,
} from '../yarnPath'
import { relax } from '../relax'
import { auditProblems } from '../auditChecks'

export interface V2 {
  x: number
  y: number
}

const v = (x: number, y: number): V2 => ({ x, y })
export const add = (a: V2, b: V2): V2 => v(a.x + b.x, a.y + b.y)
export const sub = (a: V2, b: V2): V2 => v(a.x - b.x, a.y - b.y)
export const mul = (a: V2, k: number): V2 => v(a.x * k, a.y * k)
export const len = (a: V2): number => Math.hypot(a.x, a.y)
export const unit = (a: V2): V2 => {
  const l = len(a) || 1
  return v(a.x / l, a.y / l)
}
export const dot = (a: V2, b: V2): number => a.x * b.x + a.y * b.y
/** a turned −90° — the height direction of a stitch travelling along a. */
export const right = (a: V2): V2 => v(a.y, -a.x)
/** a turned +90°. */
export const left = (a: V2): V2 => v(-a.y, a.x)
export const polarV = (c: V2, r: number, th: number): V2 => v(c.x + Math.cos(th) * r, c.y + Math.sin(th) * r)

/** A fabric frame: (lx along the row, ly up the stitch) → world xy, and the
 *  frame's own unit axes at a world point (for the audit + the layout hold). */
export interface Frame {
  place: (lx: number, ly: number) => V2
  /** World point → (lx, ly) in this frame. */
  local: (p: V2) => { lx: number; ly: number }
  /** Along-row and height unit vectors at a world point. */
  axesAt: (p: V2) => { a: V2; h: V2 }
}

/** Worked in the round about `c` (lx = arc length at radius rRef). */
export function polar(c: V2, rRef: number): Frame {
  return {
    place: (lx, ly) => polarV(c, ly, lx / rRef),
    local: (p) => {
      const d = sub(p, c)
      return { lx: Math.atan2(d.y, d.x) * rRef, ly: len(d) }
    },
    axesAt: (p) => {
      const h = unit(sub(p, c))
      return { a: left(h), h }
    },
  }
}

/** Worked along a straight line through `o` in direction `a`. */
export function along(o: V2, a0: V2): Frame {
  const a = unit(a0)
  const h = right(a)
  return {
    place: (lx, ly) => add(o, add(mul(a, lx), mul(h, ly))),
    local: (p) => {
      const d = sub(p, o)
      return { lx: dot(d, a), ly: dot(d, h) }
    },
    axesAt: () => ({ a, h }),
  }
}

/** A worked stitch's head: the loop the next stitch hooks. */
export interface Crown {
  back: number
  front: number
  /** World xy of the apex as built. */
  p: V2
  id: StitchId
}

/** One loop of a chain: the strand nodes later stitches hook. */
export interface ChainLoop {
  /** The fold (the chain's head, tucked behind). */
  apex: number
  /** The leg on the chain's left (+lateral) side, and on its right. */
  legL: number
  legR: number
  /** Loop centre on the chain line, and the chain's direction there. */
  c: V2
  u: V2
}

/** The magic ring. */
export interface Ring {
  c: V2
  r: number
  nodes: number[]
}

export interface StitchSpec {
  id: StitchId
  frame: Frame
  /** Where the crown lands and where the hook enters, in the frame (lx). */
  xCrown: number
  xHook?: number
  /** The loop it is worked into: a crown, a chain leg (node), or the ring. */
  into: { kind: 'crown'; crown: Crown } | { kind: 'node'; node: number } | { kind: 'ring'; ring: Ring; th: number }
  /** Row bottom (ly, default the hooked loop's ly) and height scale (1). */
  by?: number
  heightScale?: number
  /** Absolute top (ly) — overrides the stitch's own row pitch. */
  ty?: number
  hookDepthScale?: number
  /** Side-by-side offset (yarn radii) when two stitches share one loop. */
  spread?: number
}

/** The no-turn settings every motif stitch is worked with (buildRounds'). */
const SURFACE_LAY = 1
const BACK_CROSS = 1
const LEG_RELIEF = 0.7

export class MotifStrand {
  readonly S: StrandCtx
  readonly yr: number
  colour: string
  readonly nodeColour: string[] = []
  readonly axis: ({ hx: number; hy: number } | null)[] = []
  private readonly apex = new Set<number>()
  private readonly exempt = new Set<number>()
  private readonly free = new Set<number>()
  private readonly apexZ = new Map<number, number>()
  anchorPins = 0
  /** Per-node piece-section label (for words / colour / later assembly). */
  readonly section: string[] = []
  sectionName = ''
  private j = 0

  constructor(yr: number, colour: string) {
    this.yr = yr
    this.colour = colour
    this.S = createStrand()
  }

  get nodes() {
    return this.S.nodes
  }

  /** Last node's world position. */
  get cursor(): V2 {
    const n = this.S.nodes[this.S.nodes.length - 1]!
    return v(n.x, n.y)
  }

  setColour(hex: string): void {
    this.colour = hex
  }

  private tag(from: number, axis: { hx: number; hy: number } | null | ((i: number) => { hx: number; hy: number } | null)): void {
    for (let i = from; i < this.S.nodes.length; i++) {
      if (this.nodeColour[i] !== undefined) continue
      this.nodeColour[i] = this.colour
      this.section[i] = this.sectionName
      this.axis[i] = typeof axis === 'function' ? axis(i) : axis
    }
  }

  /** Plain pushes (e.g. a tail, a sewing strand) in the current colour. */
  push(p: V2, z: number, w = 1, axis: { hx: number; hy: number } | null = null): number {
    const from = this.S.nodes.length
    const i = this.S.push(p.x, p.y, z, w)
    this.tag(from, axis)
    return i
  }

  /** The magic ring at `c` — the pinned anchor (must be first). */
  /** `radiusYr`: the ring's drawn-tight radius. A ring is pulled closed until
   *  the stitch bases worked into it jam, so a ring holding a whole motif (a
   *  heart's 14 stitches and 4 chains) closes to a bigger hole than a ring of
   *  5 or 6 dc (0.85, buildRounds' ring). */
  magicRing(c: V2, radiusYr = 0.85): Ring {
    if (this.S.nodes.length) throw new Error('the magic ring is the anchor and must start the strand')
    const yr = this.yr
    const zh = dimsFor(yr, 'sc').zh
    const rr = yr * radiusYr
    const N = 18
    const nodes: number[] = []
    const from = this.S.nodes.length
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2
      nodes.push(this.S.push(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr, zh * 0.5, 0))
    }
    this.tag(from, null)
    this.anchorPins = N
    return { c, r: rr, nodes }
  }

  /** A slip knot anchor at `p` (a piece that starts with a chain). */
  slipKnot(p: V2, u: V2): void {
    if (this.S.nodes.length) throw new Error('the slip knot is the anchor and must start the strand')
    const yr = this.yr
    const l = left(unit(u))
    const from = this.S.nodes.length
    this.S.push(p.x - u.x * yr * 0.4 + l.x * yr * 0.3, p.y - u.y * yr * 0.4 + l.y * yr * 0.3, yr * 0.2, 0)
    this.S.push(p.x + l.x * yr * 0.5, p.y + l.y * yr * 0.5, yr * 0.25, 0)
    this.S.push(p.x - l.x * yr * 0.5, p.y - l.y * yr * 0.5, yr * 0.25, 0)
    this.S.push(p.x - u.x * yr * 0.2, p.y - u.y * yr * 0.2, -yr * 0.4, 0)
    this.tag(from, null)
    this.anchorPins = 4
  }

  /**
   * One stitch, in its frame. Returns its crown.
   */
  stitch(spec: StitchSpec): Crown {
    const yr = this.yr
    const { id, frame } = spec
    const d = dimsFor(yr, id)
    const def = STITCHES[id]
    const from = this.S.nodes.length
    const linksFrom = this.S.links.length
    let bcBack: number, bcFront: number, belowP: V2, role: 'hook' | 'ring' = 'hook'
    if (spec.into.kind === 'crown') {
      bcBack = spec.into.crown.back
      bcFront = spec.into.crown.front
    } else if (spec.into.kind === 'node') {
      bcBack = spec.into.node
      bcFront = spec.into.node
    } else {
      const R = spec.into.ring
      const t = (((spec.into.th / (Math.PI * 2)) % 1) + 1) % 1
      bcBack = R.nodes[Math.round(t * R.nodes.length) % R.nodes.length]!
      bcFront = bcBack
      role = 'ring'
    }
    const bn = this.S.nodes[bcBack]!
    belowP = v(bn.x, bn.y)
    const bl = frame.local(belowP)
    const xHook0 = spec.xHook ?? bl.lx
    const xHook = xHook0 + yr * HOOK_SPREAD_YR * (spec.spread ?? 0)
    const by = spec.by ?? bl.ly
    const ty = spec.ty ?? by + yr * rowPitchYr(id) * (spec.heightScale ?? 1)
    const r = emitPlainStitch(this.S, d, {
      j: this.j,
      c: this.S.links.length,
      id,
      s: 1,
      fz: 1,
      by,
      ty,
      xCrown: spec.xCrown,
      xHook,
      bcBack,
      bcFront,
      cyBelow: bl.ly,
      bcNormalZ: bn.z,
      place: (lx, ly) => frame.place(lx, ly),
      legReliefScale: LEG_RELIEF,
      surfaceLay: SURFACE_LAY,
      backCross: BACK_CROSS,
      linkRole: role,
      hookDepthScale: spec.hookDepthScale,
      headLoopMm: yr * (def.headLoopYr ?? 0),
      yarnOvers: def.yarnOvers ?? 0,
      yarnOverMm: yr * (def.yarnOverYr ?? 1),
    })
    this.j++
    // Each link measured in the frame it was worked in, at the loop it hooks.
    for (let k = linksFrom; k < this.S.links.length; k++) {
      const l = this.S.links[k]!
      const b = this.S.nodes[l.below]!
      const { a, h } = frame.axesAt(v(b.x, b.y))
      l.axis = { ax: a.x, ay: a.y, hx: h.x, hy: h.y }
    }
    this.tag(from, (i) => {
      const n = this.S.nodes[i]!
      const { h } = frame.axesAt(v(n.x, n.y))
      return { hx: h.x, hy: h.y }
    })
    for (const k of r.head) if (k !== r.crownBack) this.exempt.add(k)
    this.apex.add(r.crownBack)
    this.apexZ.set(r.crownBack, headApexRelief(d.zh, SURFACE_LAY))
    const cn = this.S.nodes[r.crownBack]!
    return { back: r.crownBack, front: r.crownFront, p: v(cn.x, cn.y), id }
  }

  /**
   * A CHAIN of `n` loops along a polyline (from its first point), the genuine
   * pull-through topology of the locked `ch` (yarnPath): each loop's two
   * strands pass through the loop before (two 'cross' links each), the
   * connector runs across the back (the back bump), the fold tucks behind.
   * The first loop is pulled through the loop already on the hook (the last
   * stitch's head), which is not a chain fold, so it records no link. Returns
   * n + 1 loops: the n chains, then the loop left on the hook.
   * `pitchYr` is the chain's pitch in yarn radii.
   */
  chain(n: number, path: V2[], opts: { pitchYr?: number; hold?: boolean; turning?: number } = {}): ChainLoop[] {
    const yr = this.yr
    const p = yr * (opts.pitchYr ?? CHAIN_PITCH_YR)
    const hw = yr * 1.05
    const r = yr * CHAIN_REACH_YR
    const zf = yr * 0.45
    const zfold = -yr * 0.5
    const zb = yr * 1.4
    const yin = yr * 0.3
    // Arclength sampler along the path (extended along its last direction).
    const segs: { a: V2; u: V2; L: number; s0: number }[] = []
    let acc = 0
    for (let i = 0; i + 1 < path.length; i++) {
      const L = len(sub(path[i + 1]!, path[i]!))
      if (L < 1e-9) continue
      segs.push({ a: path[i]!, u: unit(sub(path[i + 1]!, path[i]!)), L, s0: acc })
      acc += L
    }
    if (!segs.length) throw new Error('chain path needs two distinct points')
    const at = (s: number): { p: V2; u: V2 } => {
      let sg = segs[segs.length - 1]!
      for (const g of segs) if (s <= g.s0 + g.L) { sg = g; break }
      if (s < 0) sg = segs[0]!
      return { p: add(sg.a, mul(sg.u, s - sg.s0)), u: sg.u }
    }
    const loops: ChainLoop[] = []
    let prevApex = -1
    const from0 = this.S.nodes.length
    // n completed chains, then the loop left ON THE HOOK (loops[n]), which the
    // next stitch is worked from.
    for (let k = 0; k <= n; k++) {
      const t = k * p
      const from = this.S.nodes.length
      const base = at(t)
      const u = base.u
      const l = left(u)
      // local (along t, lateral w, z) → world, along the path
      // Each control point is pushed with a midpoint before it: a chain loop is
      // a tight little loop, and at the worked fabric's collision window (nodes
      // within 9 along the strand never collide) the loop's own fold could not
      // see the strand threaded through it — the back bump and the crossing were
      // 7-9 nodes from the fold and slid round it (audit: 'crossing past its
      // loop's fold' along every chain worked on both sides). Sampling the same
      // loop twice as finely puts the threading outside that window, the way the
      // standalone chain swatch gets it from its own 2-node window.
      let lastQ: { x: number; y: number; z: number } | null = this.S.nodes.length ? { ...this.S.nodes[this.S.nodes.length - 1]! } : null
      const P = (tt: number, w: number, z: number): number => {
        const q = at(tt)
        const ll = left(q.u)
        const pt = { x: q.p.x + ll.x * w, y: q.p.y + ll.y * w, z }
        if (lastQ && CHAIN_SUBDIV) this.S.push((lastQ.x + pt.x) / 2, (lastQ.y + pt.y) / 2, (lastQ.z + pt.z) / 2)
        lastQ = pt
        return this.S.push(pt.x, pt.y, pt.z)
      }
      // back bump: the connector runs across the BACK
      P(t - p * 0.65, 0, -zb)
      P(t - p * 0.3, 0, -zb)
      P(t, yin, -zb * 0.5)
      const crossUp = P(t, yin, zf * 0.1)
      P(t + p * 0.2, hw * 0.35, zf)
      P(t + p * 0.55, hw * 0.6, zf)
      const legL = P(t + p * 0.9, hw * 0.85, zf * 0.6)
      P(t + p + r * 0.7, hw * 0.9, zfold * 0.8)
      // THE LAST LOOP IS THE LOOP ON THE HOOK: only the strand pulled up through
      // the loop before exists yet — the hook holds its fold, and the working
      // yarn leaves from there into whatever is worked next. Tracing a full
      // closed loop here (and a second crossing back down) left the turning
      // chain of every star point dragged clean out of its neighbour's fold
      // (audit: 'crossing past its loop's fold' on every tip, both builds).
      const last = k === n
      const apex = P(t + p + r, 0, last ? zf * 0.4 : zfold)
      let legR = apex // the hook loop's far side is the working yarn itself
      let crossDn = -1
      if (!last) {
        P(t + p + r * 0.7, -hw * 0.9, zfold * 0.8)
        legR = P(t + p * 0.9, -hw * 0.85, zf * 0.6)
        P(t + p * 0.55, -hw * 0.6, zf)
        P(t + p * 0.2, -hw * 0.35, zf)
        crossDn = P(t, -yin, zf * 0.1)
        P(t, -yin, -zb * 0.5)
      }
      if (prevApex >= 0) {
        const ax = { ax: u.x, ay: u.y, hx: l.x, hy: l.y }
        // A completed chain is threaded through the fold before it ('cross').
        // The loop on the hook is not a chain yet: the next stitch pulls it
        // round over that fold (at a star point's tip it turns 180°), so what
        // it must keep is WRAPPING the fold, not lying inside its mouth.
        // `turning` chains at the end (the skipped chain a star point or leaf
        // tip turns on) are bent back over the chain before them by the stitch
        // worked into it, so they too are held by wrapping that fold.
        const wrap = last || k >= n - (opts.turning ?? 0)
        this.S.links.push({ j: this.j, c: k, role: wrap ? 'ring' : 'cross', hook: crossUp, below: prevApex, axis: ax })
        if (crossDn >= 0 && wrap) this.S.links.push({ j: this.j, c: k, role: 'ring', hook: crossDn, below: prevApex, axis: ax })
        else if (crossDn >= 0) this.S.links.push({ j: this.j, c: k, role: 'cross', hook: crossDn, below: prevApex, axis: ax })
      }
      prevApex = apex
      // A chain is held along its line (laterally) when blocked; free along it.
      this.tag(from, opts.hold === false ? null : { hx: l.x, hy: l.y })
      for (let i = from; i < this.S.nodes.length; i++) this.free.add(i)
      const c = at(t + p * 0.6)
      loops.push({ apex, legL, legR, c: c.p, u })
    }
    this.j++
    void from0
    return loops
  }

  /** Fasten off: the tail drawn through and woven in behind along `dir`. */
  fastenOff(dir: V2): void {
    const yr = this.yr
    const c = this.cursor
    const u = unit(dir)
    for (let t = 1; t <= 4; t++) this.push(add(c, mul(u, yr * 0.7 * t)), yr * (0.3 - 0.3 * t))
  }

  /** Mark the nodes from `from` on as free-hanging (tails, a yarn body). */
  markLoose(from: number): void {
    for (let i = from; i < this.S.nodes.length; i++) this.S.loose.push(i)
  }

  /** The built piece: one strand, its links, the canopy and layout axes. */
  finish(widthMm: number, heightMm: number): BuiltContinuous {
    const { nodes } = this.S
    const loose = looseFlags(this.S)
    const zBand = nodes.map((n, i) => {
      if (n.w === 0 || loose?.[i] || this.free.has(i)) return null
      if (this.apex.has(i)) return { lo: this.apexZ.get(i)! }
      if (this.exempt.has(i)) return null
      return { hi: CANOPY_FRAC * headApexRelief(dimsFor(this.yr, 'sc').zh, SURFACE_LAY) }
    })
    return {
      model: {
        nodes,
        dist: this.S.dist,
        bend: this.S.bend,
        strand: new Array(nodes.length).fill(0),
        along: nodes.map((_, i) => i),
        zBand,
        layoutAxis: this.axis.slice(0, nodes.length),
        ...(loose ? { loose } : {}),
      },
      strandPath: this.S.strandPath,
      links: this.S.links,
      yarnRadiusMm: this.yr,
      widthMm,
      heightMm,
      anchorPins: this.anchorPins,
    }
  }
}

/** The chain pitch a motif chain is made at (yarn radii) — looser than the
 *  standalone drawn-tight chain swatch (2.2) because a motif is relaxed with the
 *  worked fabric's firmer collision (1.25 yr, not the chain's squashed 1.0), and
 *  a loop must be fed enough yarn to contain what passes through it. */
export const CHAIN_PITCH_YR = 2.6
/** How far a chain's fold reaches past its pitch (yr): 0.7 left the crossings of
 *  a chain worked on both sides sliding round the fold; 0.9-1.4 are all clean. */
export const CHAIN_REACH_YR = 1.2
const CANOPY_FRAC = 0.65
const CHAIN_SUBDIV = true

/** Relax a motif: worked-fabric collision, blocked along each stitch's own
 *  axis, a table under it. */
export function relaxMotif(built: BuiltContinuous, iterations = 380): void {
  const yr = built.yarnRadiusMm
  relax(built.model, {
    collMinDist: yr * 1.25,
    collK: 0.28,
    collAdjacency: 9,
    planeZ: 0,
    planeK: 0,
    layoutK: 0.06,
    layoutMode: 'axis',
    floorZ: -yr * 1.6,
    iterations,
  })
}

/** The audit gate on a relaxed motif piece. */
export function auditMotif(built: BuiltContinuous, name: string): string[] {
  return auditProblems({ built, recipe: undefined as never }, name, 0, built.yarnRadiusMm)
}

/** Settled footprint (mm) of a built piece, anchor excluded. */
export function footprintMm(built: BuiltContinuous): { minx: number; maxx: number; miny: number; maxy: number; w: number; h: number } {
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity
  for (const n of built.model.nodes) {
    minx = Math.min(minx, n.x); maxx = Math.max(maxx, n.x)
    miny = Math.min(miny, n.y); maxy = Math.max(maxy, n.y)
  }
  return { minx, maxx, miny, maxy, w: maxx - minx, h: maxy - miny }
}

export type { StitchLink }

/** The angle `th` moved by whole turns to lie within half a turn of `ref`. */
export function nearAngle(th: number, ref: number): number {
  let t = th
  while (t - ref > Math.PI) t -= Math.PI * 2
  while (t - ref < -Math.PI) t += Math.PI * 2
  return t
}

/** Where the magic ring's working end leaves it: rounds start here so the
 *  yarn steps straight from the ring into round 1 (buildRounds' phase). */
export const RING_PHASE = (17 / 18) * Math.PI * 2

/** A round worked into the magic ring: `ids[i]` into the ring, evenly spaced
 *  from `th0` over `span` radians (a full round by default). */
export function intoRingRound(
  m: MotifStrand, ring: Ring, ids: StitchId[], th0 = RING_PHASE, span = Math.PI * 2,
  opts: { heightScale?: (i: number) => number } = {},
): Crown[] {
  const out: Crown[] = []
  const n = ids.length
  for (let i = 0; i < n; i++) {
    const id = ids[i]!
    const th = th0 + ((i + 0.5) / n) * span
    const rK = ring.r + m.yr * rowPitchYr(id) * (opts.heightScale?.(i) ?? 1)
    const f = polar(ring.c, rK)
    const node = ring.nodes[Math.round(((((th / (Math.PI * 2)) % 1) + 1) % 1) * ring.nodes.length) % ring.nodes.length]!
    const nb = m.nodes[node]!
    const thH = nearAngle(Math.atan2(nb.y - ring.c.y, nb.x - ring.c.x), th)
    out.push(m.stitch({ id, frame: f, xCrown: th * rK, xHook: thH * rK, into: { kind: 'ring', ring, th }, by: ring.r, ty: rK, heightScale: opts.heightScale?.(i) }))
  }
  return out
}

/** One round worked into the crowns of the round below about `c`: `ops` in
 *  work order ('st' = one stitch into the next crown, 'inc' = two). */
export function crownRound(
  m: MotifStrand, c: V2, below: Crown[], ops: ('st' | 'inc')[], id: StitchId, rPrev: number,
): { crowns: Crown[]; r: number } {
  const count = ops.reduce((a, o) => a + (o === 'inc' ? 2 : 1), 0)
  if (ops.length !== below.length) throw new Error(`round ops consume ${ops.length}, round below has ${below.length}`)
  const rK = rPrev + m.yr * rowPitchYr(id)
  const f = polar(c, rK)
  const th0 = Math.atan2(below[0]!.p.y - c.y, below[0]!.p.x - c.x)
  const crowns: Crown[] = []
  let li = 0
  for (let oi = 0; oi < ops.length; oi++) {
    const b = below[oi]!
    const thB = nearAngle(Math.atan2(b.p.y - c.y, b.p.x - c.x), th0 + (oi / below.length) * Math.PI * 2)
    const nmk = ops[oi] === 'inc' ? 2 : 1
    for (let t = 0; t < nmk; t++) {
      // crowns evenly round this round, phased so the first sits over the first below
      const th = th0 + ((li + 0.5) / count) * Math.PI * 2 - (0.5 / below.length) * Math.PI * 2
      crowns.push(m.stitch({
        id, frame: f, xCrown: nearAngle(th, thB) * rK, xHook: thB * rK,
        into: { kind: 'crown', crown: b }, by: rPrev, ty: rK,
        spread: nmk === 1 ? 0 : 0.6 * (t === 0 ? 1 : -1), hookDepthScale: nmk === 2 && t === 1 ? 1.5 : 1,
      }))
      li++
    }
  }
  return { crowns, r: rK }
}

/** One round into the crowns of the round below about `c` where each crown
 *  takes its own stitch and count (`{ id, n }`, n stitches of id fanned into
 *  it) — a round whose OUTLINE comes from the heights (a star's points, a
 *  scalloped edge). Crowns are spread evenly round the circle in work order. */
export function shapedRound(
  m: MotifStrand, c: V2, below: Crown[], ops: { id: StitchId; n: number }[], rPrev: number,
  o: { spreadRad?: number } = {},
): Crown[] {
  if (ops.length !== below.length) throw new Error(`round ops consume ${ops.length}, round below has ${below.length}`)
  const count = ops.reduce((a, q) => a + q.n, 0)
  const th0 = Math.atan2(below[0]!.p.y - c.y, below[0]!.p.x - c.x)
  const crowns: Crown[] = []
  let li = 0
  for (let oi = 0; oi < ops.length; oi++) {
    const b = below[oi]!
    const { id, n } = ops[oi]!
    const rB = Math.max(rPrev * 0.5, Math.hypot(b.p.x - c.x, b.p.y - c.y))
    const rK = rB + m.yr * rowPitchYr(id)
    const f = polar(c, rK)
    const thB = nearAngle(Math.atan2(b.p.y - c.y, b.p.x - c.x), th0 + (oi / below.length) * Math.PI * 2)
    for (let t = 0; t < n; t++) {
      const th = o.spreadRad !== undefined && n > 1
        ? thB + (t - (n - 1) / 2) * o.spreadRad
        : th0 + ((li + 0.5) / count) * Math.PI * 2 - (0.5 / below.length) * Math.PI * 2
      crowns.push(m.stitch({
        id, frame: f, xCrown: nearAngle(th, thB) * rK, xHook: thB * rK,
        into: { kind: 'crown', crown: b }, by: rB, ty: rK,
        spread: n === 1 ? 0 : 0.6 * (t === 0 ? 1 : t === n - 1 ? -1 : 0), hookDepthScale: n > 1 && t > 0 ? 1.5 : 1,
      }))
      li++
    }
  }
  return crowns
}
