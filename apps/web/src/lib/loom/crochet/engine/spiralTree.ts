/**
 * SPIRAL SHAPING — the corkscrew Christmas tree (audit round 10; bar:
 * bar-spiral-trees.png). Built the way every corkscrew-tree maker builds it: a
 * long foundation chain, then ONE row worked back along it with heavy
 * increases (3 stitches in every chain), the stitches getting taller toward
 * the base. The outer edge of that row is three times the length of the
 * chain it sits on, so the strip cannot lie flat: it twists into a
 * corkscrew, and because the stitches grow taller toward the base, the
 * corkscrew widens into a cone.
 *
 * ONE STRAND, GENUINELY STITCHED. A slip knot at the base (the only pinned
 * nodes), the kit's genuine pull-through chain (motifs/kit.ts: each loop's two
 * strands threaded through the loop before, 'cross' links) climbing the tree,
 * then each stitch hooking a chain loop ('hook' links) with the real cell
 * (emitPlainStitch, the round builders' no-turn settings), then a fasten-off.
 *
 * WHERE THE TWIST COMES FROM: the counts. The strip is laid on the helicoid
 * whose radius is SOLVED from the stitch counts — the one radius at which the
 * chain keeps its own pitch along the inner edge AND each of the k stitches
 * worked into a chain gets its own gauge width along the outer edge (see
 * `solveInnerRadius`). That is the shape the counts force; nothing bends a flat
 * build afterwards and no node outside the slip knot is pinned. The relax then
 * holds the strip blocked to that shape (layout 'radial' about the tree axis =
 * the stitch-height direction of a strip lying round the axis). The job log
 * (jobs/spiral.md) records the control: the same chain with 1 stitch in each
 * chain has no corkscrew solution at all (q = 1).
 *
 * Axes: the tree axis is world z (top up). Each stitch's frame on the strip:
 * along-row = the helix tangent T (θ increasing = down the tree), height = H
 * (out from the axis, drooping by `droopDeg`), worked face = N = H × T (up).
 */

import { STITCHES, rowPitchYr, type StitchId } from './dictionary'
import {
  createStrand,
  dimsFor,
  emitPlainStitch,
  HOOK_SPREAD_YR,
  type BuiltContinuous,
  type StrandCtx,
  type StitchLink,
} from './yarnPath'
import { relax } from './relax'
import { auditProblems } from './auditChecks'
import { CHAIN_PITCH_YR, CHAIN_REACH_YR } from './motifs/kit'
import { UK } from './motifs/common'

type Vec = [number, number, number]
const v3 = (x: number, y: number, z: number): Vec => [x, y, z]
const addv = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const scl = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k, a[2] * k]
const subv = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dotv = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const norm = (a: Vec): Vec => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}

/** One graded block of the row, from the top of the tree down. */
export interface SpiralBlock {
  /** Internal (US) stitch id: sc, hdc, dc, tr, dtr. */
  id: StitchId
  /** How many chains this block is worked into. */
  chains: number
  /** Stitches worked into each chain (the increase). */
  perChain: number
  /** Coil pitch (vertical drop per turn), yarn radii. */
  pitchYr: number
}

export interface SpiralSpec {
  yr: number
  blocks: SpiralBlock[]
  /** How far the strip's outer edge droops below horizontal (deg). */
  droopDeg: number
  colour: string
}

/** The engine's corkscrew tree, top to base: UK dc, htr, tr, dtr, trtr. */
export const TREE_BLOCKS: SpiralBlock[] = [
  { id: 'sc', chains: 6, perChain: 2, pitchYr: 4.2 },
  { id: 'hdc', chains: 8, perChain: 2, pitchYr: 5.0 },
  { id: 'dc', chains: 10, perChain: 3, pitchYr: 6.2 },
  { id: 'tr', chains: 12, perChain: 3, pitchYr: 7.2 },
  { id: 'dtr', chains: 8, perChain: 3, pitchYr: 8.0 },
]

/**
 * The inner (chain-line) radius at which a strip of crown height `a` (measured
 * along the strip, times cos droop) with edge ratio q = k·gauge / chain pitch
 * and coil rate c = pitch/2π keeps BOTH edges at their natural lengths:
 *   sqrt((r + a)² + c²) = q · sqrt(r² + c²).
 * No solution (the strip would be pulled straight) → throws.
 */
export function solveInnerRadius(a: number, q: number, c: number): number {
  const q2 = q * q - 1
  if (q2 <= 0) throw new Error(`spiral: edge ratio ${q.toFixed(2)} ≤ 1 — no increase, no corkscrew`)
  const disc = a * a * q * q - q2 * q2 * c * c
  if (disc < 0) throw new Error(`spiral: coil pitch too steep for the counts (c=${c.toFixed(2)})`)
  return (a + Math.sqrt(disc)) / q2
}

interface Geo {
  /** Arc along the chain line from the top worked chain (S=0) down. */
  S: Float64Array
  th: Float64Array
  r: Float64Array
  z: Float64Array
  c: Float64Array
  ca: number
  sa: number
}

/** World point + frame on the strip at angle θ. */
interface StripFrame {
  C: Vec
  T: Vec
  H: Vec
  N: Vec
  r: number
  c: number
}

export interface BuiltSpiral {
  built: BuiltContinuous
  colourOf: (node: number) => string
  problems: string[]
  words: string[]
  /** Settled measurements (mm): per block mean inner/outer radius, coil pitch. */
  measures: { id: StitchId; rIn: number; rOut: number; rInBuilt: number; rOutBuilt: number; crownGapYr: number }[]
  heightMm: number
  topZ: number
  baseZ: number
  maxRadiusMm: number
}

export function buildSpiralTree(spec: SpiralSpec, o: { relaxK?: number; iterations?: number } = {}): BuiltSpiral {
  const { yr, blocks } = spec
  const pc = yr * CHAIN_PITCH_YR
  const reach = yr * CHAIN_REACH_YR
  const alpha = (spec.droopDeg * Math.PI) / 180
  const ca = Math.cos(alpha), sa = Math.sin(alpha)
  // Worked chain i (0 = the top) → its block.
  const chainBlock: number[] = []
  blocks.forEach((b, bi) => { for (let k = 0; k < b.chains; k++) chainBlock.push(bi) })
  const W = chainBlock.length
  // The stitch's crown sits a chain leg (≈0.9 yr) out from the chain line.
  const LEG_LY = yr * 1.05 * 0.85
  const blockR = blocks.map((b) => {
    const h = LEG_LY + yr * rowPitchYr(b.id)
    const q = (b.perChain * yr * STITCHES[b.id].gaugeYr) / pc
    const c = (yr * b.pitchYr) / (Math.PI * 2)
    return { r: solveInnerRadius(h * ca, q, c), c, h }
  })
  // Params along S, blended linearly over one chain at block boundaries.
  // A smooth step between blocks over BLEND chains (a block change is a change
  // of stitch, but the strip itself turns smoothly through it).
  const BLEND = 2
  const raw = (i: number, f: (bi: number) => number): number => f(chainBlock[Math.max(0, Math.min(W - 1, i))]!)
  const param = (S: number, f: (bi: number) => number): number => {
    const x = S / pc - 0.5
    let acc = 0, wsum = 0
    for (let d = -BLEND; d <= BLEND; d++) {
      const i = Math.round(x) + d
      const w = Math.max(0, 1 - Math.abs(i - x) / (BLEND + 0.5))
      acc += w * raw(i, f)
      wsum += w
    }
    return acc / wsum
  }
  // Integrate θ and z down the chain line.
  const S0 = -4 * pc, S1 = (W + 3) * pc
  const dS = yr * 0.02
  const n = Math.ceil((S1 - S0) / dS) + 1
  const G: Geo = { S: new Float64Array(n), th: new Float64Array(n), r: new Float64Array(n), z: new Float64Array(n), c: new Float64Array(n), ca, sa }
  for (let i = 0; i < n; i++) {
    const S = S0 + i * dS
    G.S[i] = S
    G.r[i] = param(S, (bi) => blockR[bi]!.r)
    G.c[i] = param(S, (bi) => blockR[bi]!.c)
    if (i > 0) {
      const rho = Math.hypot(G.r[i - 1]!, G.c[i - 1]!)
      G.th[i] = G.th[i - 1]! + dS / rho
      G.z[i] = G.z[i - 1]! - (dS * G.c[i - 1]!) / rho
    }
  }
  // Shift so S=0 sits at θ=0, z=0.
  const i0 = Math.round(-S0 / dS)
  const th0 = G.th[i0]!, z0 = G.z[i0]!
  for (let i = 0; i < n; i++) { G.th[i] = G.th[i]! - th0; G.z[i] = G.z[i]! - z0 }
  const lerpAt = (arr: Float64Array, key: Float64Array, k: number): number => {
    let lo = 0, hi = n - 1
    if (k <= key[0]!) return arr[0]!
    if (k >= key[n - 1]!) return arr[n - 1]!
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (key[m]! <= k) lo = m; else hi = m }
    const t = (k - key[lo]!) / (key[hi]! - key[lo]!)
    return arr[lo]! + (arr[hi]! - arr[lo]!) * t
  }
  const frameAtTh = (th: number): StripFrame => {
    const r = lerpAt(G.r, G.th, th)
    const z = lerpAt(G.z, G.th, th)
    const c = lerpAt(G.c, G.th, th)
    const cs = Math.cos(th), sn = Math.sin(th)
    const C = v3(r * cs, r * sn, z)
    const T = norm(v3(-r * sn, r * cs, -c))
    const H0 = v3(ca * cs, ca * sn, -sa)
    const N = norm(cross(H0, T))
    const H = norm(cross(T, N))
    return { C, T, H, N, r, c }
  }
  const thOfS = (S: number): number => lerpAt(G.th, G.S, S)
  const at = (f: StripFrame, ly: number, lz: number): Vec => addv(addv(f.C, scl(f.H, ly)), scl(f.N, lz))

  const S = createStrand()
  const colour: string[] = []

  // ── THE SLIP KNOT (the anchor, the only pins) at the base ─────────────────
  const Sknot = W * pc + pc * 0.9
  {
    const f = frameAtTh(thOfS(Sknot))
    const up = scl(f.T, -1) // the chain climbs: travel = −T
    const pts: [number, number, number, number][] = [
      [-0.4, 0.3, 0.2, 0], [0, 0.5, 0.25, 0], [0, -0.5, 0.25, 0], [-0.2, 0, -0.4, 0],
    ]
    for (const [t, w, z] of pts) {
      const p = addv(addv(addv(f.C, scl(up, t * yr)), scl(f.H, w * yr)), scl(f.N, z * yr))
      S.push(p[0], p[1], p[2], 0)
    }
  }
  const anchorPins = S.nodes.length

  // ── THE FOUNDATION CHAIN, climbing the tree ──────────────────────────────
  // W worked chains + 1 turning chain, then the loop on the hook. Loop k sits
  // at t = k·pitch from the knot; t → S = W·pc − t (S runs down the tree).
  const nCh = W + 1
  const loops = chain3(S, yr, nCh, (t) => W * pc - t, thOfS, frameAtTh, { turning: 1 })
  // ── ROW 1, worked back down the chain ─────────────────────────────────────
  // Worked chain i = loops[nCh − 2 − i] (the 2nd ch from the hook is i = 0).
  let st = 0
  const crowns: { i: number; node: number; bi: number }[] = []
  for (let i = 0; i < W; i++) {
    const bi = chainBlock[i]!
    const b = blocks[bi]!
    const L = loops[nCh - 2 - i]!
    const id = b.id
    const d = dimsFor(yr, id)
    const def = STITCHES[id]
    const thA = thOfS(i * pc), thB = thOfS((i + 1) * pc)
    const leg = S.nodes[L.legL]!
    // The leg's own place on the strip.
    const thLeg = nearTh(Math.atan2(leg.y, leg.x), (thA + thB) / 2)
    const fl = frameAtTh(thLeg)
    const lp = v3(leg.x, leg.y, leg.z)
    const by = dotv(subv(lp, fl.C), fl.H)
    const bz = dotv(subv(lp, fl.C), fl.N)
    const ty = by + yr * rowPitchYr(id)
    const k = b.perChain
    for (let m = 0; m < k; m++) {
      const thC = thA + ((m + 0.5) / k) * (thB - thA)
      // Arc per radian at this stitch's crown line: its lx unit.
      const fc = frameAtTh(thC)
      const rho = Math.hypot(fc.r + ty * ca, fc.c)
      const place3 = (lx: number, ly: number, lz: number): { x: number; y: number; z: number } => {
        const p = at(frameAtTh(lx / rho), ly, lz)
        return { x: p[0], y: p[1], z: p[2] }
      }
      const spread = k === 1 ? 0 : 0.6 * (m === 0 ? 1 : m === k - 1 ? -1 : 0)
      const linksFrom = S.links.length
      const from = S.nodes.length
      const r = emitPlainStitch(S, d, {
        j: 1, c: st, id, s: 1, fz: 1, by, ty,
        xCrown: thC * rho,
        xHook: thLeg * rho + yr * HOOK_SPREAD_YR * spread,
        bcBack: L.legL, bcFront: L.legL, cyBelow: by, bcNormalZ: bz,
        place3,
        legReliefScale: 0.7, surfaceLay: 1, backCross: 1, linkRole: 'hook',
        hookDepthScale: k > 1 && m > 0 ? 1.5 : 1,
        headLoopMm: yr * (def.headLoopYr ?? 0),
        yarnOvers: def.yarnOvers ?? 0,
        yarnOverMm: yr * (def.yarnOverYr ?? 1),
      })
      for (let q = linksFrom; q < S.links.length; q++) frameLink(S, S.links[q]!, frameAtTh, false, thLeg)
      for (let q = from; q < S.nodes.length; q++) colour[q] = spec.colour
      crowns.push({ i, node: r.crownBack, bi })
      st++
    }
  }
  // ── FASTEN OFF: the tail run back up inside the last stitches ────────────
  {
    const last = S.nodes[S.nodes.length - 1]!
    const lp = v3(last.x, last.y, last.z)
    const f = frameAtTh(nearTh(Math.atan2(last.y, last.x), thOfS(W * pc)))
    for (let t = 1; t <= 4; t++) {
      const p = addv(addv(lp, scl(f.H, -yr * 0.7 * t)), scl(f.N, -yr * 0.25 * t))
      S.push(p[0], p[1], p[2])
    }
  }
  for (let q = 0; q < S.nodes.length; q++) if (colour[q] === undefined) colour[q] = spec.colour

  // Built radii of the crowns, per block (for the measures).
  const builtR = crowns.map((c) => Math.hypot(S.nodes[c.node]!.x, S.nodes[c.node]!.y))
  const builtRin = loops.map((L) => Math.hypot(S.nodes[L.apex]!.x, S.nodes[L.apex]!.y))

  const nodes = S.nodes
  let zmin = Infinity, zmax = -Infinity, rmax = 0
  for (const p of nodes) { zmin = Math.min(zmin, p.z); zmax = Math.max(zmax, p.z); rmax = Math.max(rmax, Math.hypot(p.x, p.y)) }
  const built: BuiltContinuous = {
    model: {
      nodes,
      dist: S.dist,
      bend: S.bend,
      strand: new Array(nodes.length).fill(0),
      along: nodes.map((_, i) => i),
    },
    strandPath: S.strandPath,
    links: S.links,
    yarnRadiusMm: yr,
    widthMm: rmax * 2,
    heightMm: zmax - zmin,
    anchorPins,
  }
  // RELAX: worked-fabric collision, the strip blocked to its worked radius
  // about the tree axis (= each stitch's height direction), no table.
  relax(built.model, {
    collMinDist: yr * 1.25,
    collK: 0.28,
    collAdjacency: 9,
    planeZ: 0,
    planeK: 0,
    layoutK: o.relaxK ?? 0.06,
    layoutMode: 'radial',
    iterations: o.iterations ?? 380,
  })
  const problems = auditProblems({ built, recipe: undefined as never }, 'spiral', 0, yr)

  const measures = blocks.map((b, bi) => {
    const cs = crowns.filter((c) => c.bi === bi)
    const rOut = mean(cs.map((c) => Math.hypot(nodes[c.node]!.x, nodes[c.node]!.y)))
    const rOutBuilt = mean(cs.map((c) => builtR[crowns.indexOf(c)]!))
    const ls = chainBlock.map((x, i) => (x === bi ? loops[nCh - 2 - i]! : null)).filter((x): x is ChainLoop3 => !!x)
    const rIn = mean(ls.map((L) => Math.hypot(nodes[L.apex]!.x, nodes[L.apex]!.y)))
    const rInBuilt = mean(ls.map((L) => builtRin[loops.indexOf(L)]!))
    // Settled crown-to-crown distance against the stitch's gauge.
    const gaps: number[] = []
    for (let k = 1; k < cs.length; k++) {
      const a = nodes[cs[k - 1]!.node]!, c = nodes[cs[k]!.node]!
      gaps.push(Math.hypot(a.x - c.x, a.y - c.y, a.z - c.z))
    }
    return { id: b.id, rIn, rOut, rInBuilt, rOutBuilt, crownGapYr: mean(gaps) / yr / STITCHES[b.id].gaugeYr }
  })
  zmin = Infinity; zmax = -Infinity; rmax = 0
  for (const p of nodes) { zmin = Math.min(zmin, p.z); zmax = Math.max(zmax, p.z); rmax = Math.max(rmax, Math.hypot(p.x, p.y)) }
  return {
    built,
    colourOf: (i) => colour[i] ?? spec.colour,
    problems,
    words: spiralWords(blocks),
    measures,
    heightMm: zmax - zmin,
    topZ: zmax,
    baseZ: zmin,
    maxRadiusMm: rmax,
  }
}

function mean(a: number[]): number {
  return a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0
}

function nearTh(th: number, ref: number): number {
  let t = th
  while (t - ref > Math.PI) t -= Math.PI * 2
  while (t - ref < -Math.PI) t += Math.PI * 2
  return t
}

/** Record a link's 3D frame at its below loop (the audit measures it there). */
function frameLink(S: StrandCtx, l: StitchLink, frameAtTh: (th: number) => StripFrame, chainTravel: boolean, thHint?: number): void {
  const b = S.nodes[l.below]!
  const th = nearTh(Math.atan2(b.y, b.x), thHint ?? Math.atan2(b.y, b.x))
  const f = frameAtTh(th)
  const bp = v3(b.x, b.y, b.z)
  const ly = dotv(subv(bp, f.C), f.H)
  const o = addv(f.C, scl(f.H, ly))
  l.frame3 = { a: chainTravel ? scl(f.T, -1) : f.T, h: f.H, n: f.N, o }
}

export interface ChainLoop3 {
  apex: number
  legL: number
  legR: number
}

/**
 * The kit's genuine pull-through chain (motifs/kit.ts `MotifStrand.chain`,
 * same control points, same links), traced on the strip: chain-local
 * (t along the chain's travel, w to its left = +H, z on the worked face = +N).
 * `Sof(t)` maps the chain's own distance to the strip's arc S.
 */
export function chain3(
  S: StrandCtx, yr: number, n: number, Sof: (t: number) => number, thOfS: (S: number) => number,
  frameAtTh: (th: number) => StripFrame, opts: { turning?: number } = {},
): ChainLoop3[] {
  const p = yr * CHAIN_PITCH_YR
  const hw = yr * 1.05
  const r = yr * CHAIN_REACH_YR
  const zf = yr * 0.45
  const zfold = -yr * 0.5
  const zb = yr * 1.4
  const yin = yr * 0.3
  const loops: ChainLoop3[] = []
  let prevApex = -1
  let lastQ: Vec | null = S.nodes.length ? v3(S.nodes[S.nodes.length - 1]!.x, S.nodes[S.nodes.length - 1]!.y, S.nodes[S.nodes.length - 1]!.z) : null
  const P = (tt: number, w: number, z: number): number => {
    const f = frameAtTh(thOfS(Sof(tt)))
    const pt = addv(addv(f.C, scl(f.H, w)), scl(f.N, z))
    if (lastQ) S.push((lastQ[0] + pt[0]) / 2, (lastQ[1] + pt[1]) / 2, (lastQ[2] + pt[2]) / 2)
    lastQ = pt
    return S.push(pt[0], pt[1], pt[2])
  }
  for (let k = 0; k <= n; k++) {
    const t = k * p
    P(t - p * 0.65, 0, -zb)
    P(t - p * 0.3, 0, -zb)
    P(t, yin, -zb * 0.5)
    const crossUp = P(t, yin, zf * 0.1)
    P(t + p * 0.2, hw * 0.35, zf)
    P(t + p * 0.55, hw * 0.6, zf)
    const legL = P(t + p * 0.9, hw * 0.85, zf * 0.6)
    P(t + p + r * 0.7, hw * 0.9, zfold * 0.8)
    const last = k === n
    const apex = P(t + p + r, 0, last ? zf * 0.4 : zfold)
    let legR = apex
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
      const wrap = last || k >= n - (opts.turning ?? 0)
      const thHint = thOfS(Sof(t))
      const add = (hook: number, role: 'ring' | 'cross'): void => {
        const l: StitchLink = { j: 0, c: k, role, hook, below: prevApex }
        frameLink(S, l, frameAtTh, true, thHint)
        S.links.push(l)
      }
      add(crossUp, wrap ? 'ring' : 'cross')
      if (crossDn >= 0) add(crossDn, wrap ? 'ring' : 'cross')
    }
    prevApex = apex
    loops.push({ apex, legL, legR })
  }
  return loops
}

/** The written row, UK terms. */
export function spiralWords(blocks: SpiralBlock[]): string[] {
  const W = blocks.reduce((s, b) => s + b.chains, 0)
  const total = blocks.reduce((s, b) => s + b.chains * b.perChain, 0)
  const parts = blocks.map((b, i) => {
    const first = i === 0
    const n = first ? b.chains - 1 : b.chains
    const lead = first ? `${b.perChain} ${UK[b.id]} in 2nd ch from hook, ` : ''
    return `${lead}${b.perChain} ${UK[b.id]} in each of next ${n} ch`
  })
  return [
    `Ch ${W + 1}.`,
    `Row 1: ${parts.join(', ')}. (${total} sts)`,
    'The row twists into a corkscrew as you work it. Fasten off, leaving a long tail at the base for the bead.',
  ]
}
