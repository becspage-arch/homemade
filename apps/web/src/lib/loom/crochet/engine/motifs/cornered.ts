/**
 * CORNERED MOTIFS IN THE ROUND — the granny square, the solid square and the
 * solid hexagon (opt-in; not in `index.ts`, so `listMotifs()` and every
 * existing motif, hash and size table are untouched).
 *
 * A cornered round is worked from a magic ring with SET CORNERS: N corners
 * (4 = square, 6 = hexagon), each a chain space (ch 1, 2 or 3) that the next
 * round works its corner group into — "(3 tr, ch 2, 3 tr) in the corner sp".
 * Between the corners each side is either
 *   - CLUSTERS (the granny): a cluster of tr into every side chain space of the
 *     round below, with a ch 1 between, or
 *   - EACH (solid): 1 tr in each st of the round below.
 * Each round starts with a standing ch 3 (it counts as the first tr) and is
 * joined with a sl st in the 3rd ch of that ch 3. The next round is reached by
 * sl st across the rest of the first corner group into the corner sp, or — a
 * colour change — the new colour is joined straight into that corner sp.
 *
 * Everything is the kit's genuine construction: the stitches into the ring
 * hook the ring strand; every corner group and cluster goes UNDER the whole
 * chain of its space (the kit's chain-space hook, `into: 'space'`, at its own
 * cross-section along the space); the solid sides hook the crowns below; the
 * ch 3's top is hooked under both legs of its 3rd chain. The written rounds
 * are generated from the same spec that builds the strand, and every round's
 * count is the number of tr the builder actually made.
 *
 * Geometry: round k's crowns are laid on a regular N-gon of apothem A_k (A_1 =
 * the ring + one tr, then one tr per round), each corner chain arching round a
 * corner, each stitch in its own `along` frame (along its side, height = the
 * side's outward normal), leaning from the loop it hooks to its crown. The
 * relax then settles it, blocked flat on the table.
 */

import { STITCHES, rowPitchYr, type StitchId } from '../dictionary'
import {
  MotifStrand,
  RING_PHASE,
  add,
  along,
  chainSpace,
  len,
  mul,
  polarV,
  sub,
  unit,
  type ChainLoop,
  type ChainSpace,
  type Crown,
  type Ring,
  type V2,
} from './kit'
import { UK, assemble, materialsLine, motifYarn, pieceOf } from './common'
import type { BuiltMotif, MotifId, MotifOptions } from './types'

/** Round 1: `perSide` sts into the ring per side, `cornerCh` chains at each corner. */
export interface CorneredRingRound {
  perSide: number
  cornerCh: number
  /** The magic ring's drawn-tight radius (yarn radii). */
  ringYr: number
}

/** A round worked into the round below. */
export interface CorneredRound {
  /** Sts in each half of a corner group ("(3 tr, ch 2, 3 tr)" = 3). */
  corner: number
  cornerCh: number
  side: 'clusters' | 'each'
  /** Clusters: sts per cluster in each side space, and the chain between. */
  cluster?: number
  sideCh?: number
}

export interface CorneredSpec {
  id: MotifId
  label: string
  /** The shape's name in the words ("square", "hexagon"). */
  shape: string
  corners: number
  /** Which leg of the standing ch 3's 3rd chain the join (and a solid round's
   *  tr into it) is built to dive past first: 'L' or 'R'. Both legs are
   *  recorded and audited either way; this only picks the insertion's starting
   *  geometry, which the audit is sensitive to (see the handbook §8o). */
  ch3Leg?: 'L' | 'R'
  /** The body stitch (internal id; 'dc' = UK tr). */
  stitch: StitchId
  ring: CorneredRingRound
  rounds: CorneredRound[]
  /** Colour role per round (round 1 first), and the roles' defaults. */
  roundColour: string[]
  colours: Record<string, string>
  /** The colour roles' names in the words ("centre colour", "outer colour"). */
  colourNames: Record<string, string>
  /** The description for a pattern row. */
  description: string
}

/** A stitch top the next round can hook: a stitch's crown, or the 3rd chain of a standing ch 3. */
type Top = { kind: 'crown'; crown: Crown } | { kind: 'ch3'; near: number; far: number; p: V2; nearAll?: number[]; farAll?: number[] }

interface RoundOut {
  /** Per geometric side i (corner i → corner i+1), the tops in work order. */
  sides: Top[][]
  /** Per geometric corner, the corner chain's space. */
  cornerSpace: ChainSpace[]
  /** Per side, the side chain spaces in order. */
  sideSpaces: ChainSpace[][]
  /** The ch 3 top the round was joined to. */
  start: Top
  /** The corner the round started in (round 1: −1, it starts on side 0). */
  startCorner: number
  /** Body sts made (the ch 3 counted as one). */
  count: number
  apothem: number
}

/** What the builder measured and the tests check. */
export interface CorneredReport {
  /** Sts per round as built (the ch 3 counts as a st). */
  counts: number[]
  /** Clusters per round (granny), or 0. */
  clusters: number[]
  /** The last round's crown nodes, per geometric side. */
  outerSides: number[][]
  /** Per round, the crowding of the busiest side: laid st width / room (1 = exact). */
  crowding: number[]
}

export type BuiltCornered = BuiltMotif & { cornered: CorneredReport; spec: CorneredSpec }

const CH_W_YR = 2.6
/** The corner and side chains' pitch (yr). Probed 2.4-3.6 (r1): 2.6 left the
 *  chain short of the corner, 3.0+ pulled crossings past their folds. */
const CORNER_PITCH_YR = 2.8
/** How far a chain worked over by the next round sits off the work (yr). */
const CHAIN_LIFT_YR = 1.0
/** How far past the corner a corner chain arches (yr). */
const APEX_YR = 0.3
/** How far up its own line the standing ch 3 starts (in pitches). */
const STAND_OFFSET = 0.1
const RELAX_ITERATIONS = 500

/** Canonical side normal angle (side 0 at the bottom, so a square sits level). */
function sideNormal(N: number, i: number): number {
  return -Math.PI / 2 + (2 * Math.PI * i) / N
}

export function buildCornered(spec: CorneredSpec, o?: MotifOptions): BuiltCornered {
  const y = motifYarn(o)
  const yr = y.yr
  const col = { ...spec.colours, ...(o?.colours ?? {}) }
  const N = spec.corners
  const st = spec.stitch
  const H = rowPitchYr(st) * yr
  const W = (STITCHES[st].gaugeYr ?? 3.4) * yr
  const CW = CH_W_YR * yr
  const tanH = Math.tan(Math.PI / N)
  const c: V2 = { x: 0, y: 0 }
  const nRounds = 1 + spec.rounds.length

  // ── Layout ───────────────────────────────────────────────────────────────
  // The whole build is rotated by `rot` so round 1's standing ch 3 leaves the
  // ring where its working end is (RING_PHASE); the pose turns it back.
  let rot = 0
  const cornerAt = (i: number, A: number): V2 => {
    const a = sideNormal(N, i) - Math.PI / N + rot
    return polarV(c, A / Math.cos(Math.PI / N), a)
  }
  const sideDir = (i: number): V2 => {
    const a = sideNormal(N, i) + rot
    return { x: -Math.sin(a), y: Math.cos(a) } // CCW tangent (normal turned +90°)
  }
  /** Slot centres along side i at apothem A for items of the given widths, between the corner chains. */
  const slots = (i: number, A: number, widths: number[], gap0: number, gap1: number): { p: V2[]; crowd: number } => {
    const Ls = 2 * A * tanH
    const room = Math.max(1e-6, Ls - gap0 - gap1)
    const total = widths.reduce((a, b) => a + b, 0)
    const k = room / Math.max(total, 1e-6)
    const p0 = cornerAt(i, A)
    const d = sideDir(i)
    const out: V2[] = []
    let s = gap0
    for (const w of widths) {
      out.push(add(p0, mul(d, s + (w * k) / 2)))
      s += w * k
    }
    return { p: out, crowd: total / room }
  }

  const m = new MotifStrand(yr, col[spec.roundColour[0]!]!)
  const nodePos = (i: number): V2 => ({ x: m.nodes[i]!.x, y: m.nodes[i]!.y })

  /** One stitch with its crown at `crownW`, standing outward from side `dir`. */
  const put = (id: StitchId, into: Parameters<MotifStrand['stitch']>[0]['into'], hookNode: number, crownW: V2, dir: V2): Crown => {
    const f = along(crownW, dir)
    const hl = f.local(nodePos(hookNode))
    return m.stitch({ id, frame: f, xCrown: 0, xHook: hl.lx, into, by: Math.min(hl.ly, -yr * 0.5), ty: 0 })
  }
  /** A sl st into a top or a space station (short: it rises one sl st). */
  const slInto = (into: Parameters<MotifStrand['stitch']>[0]['into'], hookNode: number, dir: V2): Crown => {
    const p = nodePos(hookNode)
    const f = along(p, dir)
    return m.stitch({ id: 'slst', frame: f, xCrown: 0, xHook: 0, into, by: 0 })
  }
  const topInto = (t: Top): { into: Parameters<MotifStrand['stitch']>[0]['into']; node: number } =>
    t.kind === 'crown' ? { into: { kind: 'crown', crown: t.crown }, node: t.crown.back } : ch3Into(t)
  const ch3Into = (t: Extract<Top, { kind: 'ch3' }>): { into: Parameters<MotifStrand['stitch']>[0]['into']; node: number } =>
    ({ into: { kind: 'space', near: t.near, far: t.far, nearAll: t.nearAll, farAll: t.farAll }, node: t.far })
  const spaceInto = (sp: ChainSpace, si: number): { into: Parameters<MotifStrand['stitch']>[0]['into']; node: number } => {
    const s = sp.stations[Math.max(0, Math.min(sp.stations.length - 1, si))]!
    return {
      into: { kind: 'space', near: s.near, far: s.far, nearAll: sp.stations.map((x) => x.near), farAll: sp.stations.map((x) => x.far) },
      node: s.far,
    }
  }
  /** Station for st j of n in [lo, hi) of a space's stations. */
  const station = (sp: ChainSpace, j: number, n: number, lo: number, hi: number): number => {
    const S = sp.stations.length
    const a = lo * S, b = hi * S
    return Math.min(S - 1, Math.floor(a + ((j + 0.5) / n) * (b - a)))
  }
  /** The standing ch 3 from the cursor up to `crownW`; its top is its 3rd chain. */
  const standingCh = (crownW: V2): Top => {
    const L = len(sub(crownW, m.cursor))
    const pitchYr = Math.max(1.9, Math.min(2.6, L / 3.5 / yr))
    const u0 = unit(sub(crownW, m.cursor))
    // started a little up its own line: its first back bump laid at the sl st
    // pressed the corner chain's second crossing under its fold (r1 probes)
    const p0 = add(m.cursor, mul(u0, pitchYr * yr * STAND_OFFSET))
    const loops = m.chain(3, [p0, crownW], { turning: 1, pitchYr })
    const top = loops[2]!
    // the sl st that joins the round goes under the top of the 3rd ch, which the
    // loop pulled up into the next tr draws tight against: either may hold it
    const sec = [...loops[2]!.sections, ...loops[3]!.sections]
    const sw = (spec.ch3Leg ?? 'L') === 'R'
    return { kind: 'ch3', near: sw ? top.legR : top.legL, far: sw ? top.legL : top.legR, p: top.c, nearAll: sec.map((x) => (sw ? x.r : x.l)), farAll: sec.map((x) => (sw ? x.l : x.r)) }
  }
  const chainTo = (n: number, path: V2[], lift: boolean): ChainLoop[] =>
    m.chain(n, path, { pitchYr: CORNER_PITCH_YR, ...(lift ? { lift: yr * CHAIN_LIFT_YR } : {}) })

  const crowding: number[] = []
  const counts: number[] = []
  const clusters: number[] = []

  // ── Round 1: into the ring ───────────────────────────────────────────────
  const R1 = spec.ring
  const A1 = yr * R1.ringYr + H
  const g1 = (R1.cornerCh * CW) / 2
  const sideW1 = new Array<number>(R1.perSide).fill(W)
  {
    // Solve `rot` so the ch 3 crown lies at the ring's working end.
    const p = slots(0, A1, sideW1, g1, g1).p[0]!
    rot = RING_PHASE - Math.atan2(p.y, p.x)
  }
  m.sectionName = 'round 1'
  const ring: Ring = m.magicRing(c, R1.ringYr)
  const ringTh = (p: V2): number => Math.atan2(p.y - c.y, p.x - c.x)
  let prev: RoundOut
  {
    const sides: Top[][] = []
    const cornerSpace: ChainSpace[] = new Array(N)
    let start: Top | null = null
    let crowd1 = 0
    for (let i = 0; i < N; i++) {
      const sl = slots(i, A1, sideW1, g1, g1)
      crowd1 = Math.max(crowd1, sl.crowd)
      const tops: Top[] = []
      const d = sideDir(i)
      for (let j = 0; j < R1.perSide; j++) {
        const pw = sl.p[j]!
        if (i === 0 && j === 0) {
          start = standingCh(pw)
          tops.push(start)
          continue
        }
        const th = ringTh(pw)
        const node = ring.nodes[Math.round(((((th / (Math.PI * 2)) % 1) + 1) % 1) * ring.nodes.length) % ring.nodes.length]!
        tops.push({ kind: 'crown', crown: put(st, { kind: 'ring', ring, th }, node, pw, d) })
              }
      sides.push(tops)
      // the corner chain round corner i+1, worked over by round 2
      const k = (i + 1) % N
      const apex = add(cornerAt(k, A1), mul(unit(sub(cornerAt(k, A1), c)), yr * APEX_YR))
      const next = add(cornerAt(k, A1), mul(sideDir(k), g1))
      const loops = chainTo(R1.cornerCh, [m.cursor, apex, next], nRounds > 1)
      cornerSpace[k] = chainSpace(loops, 'R')
    }
    const j = topInto(start!)
    slInto(j.into, j.node, sideDir(0))
    prev = { sides, cornerSpace, sideSpaces: sides.map(() => []), start: start!, startCorner: -1, count: N * R1.perSide, apothem: A1 }
    counts.push(prev.count)
    clusters.push(N)
    crowding.push(crowd1)
  }

  // ── Rounds 2+ ────────────────────────────────────────────────────────────
  for (let r = 0; r < spec.rounds.length; r++) {
    const R = spec.rounds[r]!
    const last = r === spec.rounds.length - 1
    const A = prev.apothem + H
    const g = (R.cornerCh * CW) / 2
    const roleNow = spec.roundColour[r + 1] ?? spec.roundColour[r]!
    const rolePrev = spec.roundColour[r]!
    const newColour = roleNow !== rolePrev
    // The corner it starts in: round 2 the first corner after round 1's first
    // group (corner 1); later rounds the corner they joined beside.
    const s = prev.startCorner < 0 ? 1 % N : prev.startCorner
    // Reach the corner space: sl st across the rest of the first group (same
    // colour), or a new colour joined straight into it (a hop, not worked).
    const groupEnd = prev.startCorner < 0 ? prev.sides[0]! : prev.sides[(s - 1 + N) % N]!
    const firstGroup = prev.startCorner < 0 ? groupEnd : groupEnd.slice(groupEnd.length - spec.rounds[r - 1]!.corner)
    const csp = prev.cornerSpace[s]!
    if (!newColour) {
      for (const t of firstGroup.slice(1)) {
        const q = topInto(t)
        slInto(q.into, q.node, sideDir(prev.startCorner < 0 ? 0 : (s - 1 + N) % N))
      }
      m.sectionName = `round ${r + 2}`
      const q = spaceInto(csp, 0)
      // station 0 of the corner chain lies on the side before the corner: the
      // sl st stands as that side's stitches do
      slInto(q.into, q.node, sideDir((s - 1 + N) % N))
    } else {
      // The old colour is fastened off at the join and the new one joined in the
      // corner sp: one strand in the model, the hop between them a loose tail
      // carried over the stitch tops.
      const from = m.nodes.length
      const sp0 = nodePos(csp.stations[0]!.far)
      const cur = m.cursor
      for (let t = 1; t <= 3; t++) m.push(add(cur, mul(sub(sp0, cur), t / 4)), yr * 0.9)
      m.markLoose(from)
      m.setColour(col[roleNow]!)
      m.sectionName = `round ${r + 2}`
      const q = spaceInto(csp, 0)
      // station 0 of the corner chain lies on the side before the corner: the
      // sl st stands as that side's stitches do
      slInto(q.into, q.node, sideDir((s - 1 + N) % N))
    }
    m.setColour(col[roleNow]!)

    // Per side i, the items in order: second half of corner i, the middle,
    // first half of corner i+1. Widths for the layout.
    type Item = { kind: 'st'; half?: 'first' | 'second'; corner?: number; j?: number; from?: Top; space?: ChainSpace; sj?: number; sn?: number } | { kind: 'ch'; n: number }
    const sideItems: Item[][] = []
    for (let i = 0; i < N; i++) {
      const items: Item[] = []
      for (let j = 0; j < R.corner; j++) items.push({ kind: 'st', half: 'second', corner: i, j })
      if (R.side === 'clusters') {
        const ch = R.sideCh ?? 1
        const cl = R.cluster ?? 3
        items.push({ kind: 'ch', n: ch })
        for (const sp of prev.sideSpaces[i]!) {
          for (let j = 0; j < cl; j++) items.push({ kind: 'st', space: sp, sj: j, sn: cl })
          items.push({ kind: 'ch', n: ch })
        }
      } else {
        for (const t of prev.sides[i]!) items.push({ kind: 'st', from: t })
      }
      for (let j = 0; j < R.corner; j++) items.push({ kind: 'st', half: 'first', corner: (i + 1) % N, j })
      sideItems.push(items)
    }
    const sidePos: V2[][] = []
    let crowd = 0
    for (let i = 0; i < N; i++) {
      const sl = slots(i, A, sideItems[i]!.map((it) => (it.kind === 'st' ? W : it.n * CW)), g, g)
      sidePos.push(sl.p)
      crowd = Math.max(crowd, sl.crowd)
    }
    crowding.push(crowd)

    const sides: Top[][] = sideItems.map(() => [])
    const sideSpaces: ChainSpace[][] = sideItems.map(() => [])
    const cornerSpace: ChainSpace[] = new Array(N)
    let start: Top | null = null
    let count = 0
    let nClusters = 0
    const work = (i: number, k: number): void => {
      const it = sideItems[i]![k]!
      const pw = sidePos[i]![k]!
      const d = sideDir(i)
      if (it.kind === 'ch') {
        const nextP = k + 1 < sidePos[i]!.length ? sidePos[i]![k + 1]! : add(pw, mul(d, CW))
        const loops = chainTo(it.n, [m.cursor, add(pw, mul(d, -CW * 0.2)), nextP], !last)
        sideSpaces[i]!.push(chainSpace(loops, 'R'))
        return
      }
      count++
      if (it.half) {
        const sp = prev.cornerSpace[it.corner!]!
        if (it.half === 'first' && it.corner === s && it.j === 0) {
          start = standingCh(pw)
          sides[i]!.push(start)
          return
        }
        const si = it.half === 'first' ? station(sp, it.j!, R.corner, 0, 0.5) : station(sp, it.j!, R.corner, 0.5, 1)
        const q = spaceInto(sp, si)
        sides[i]!.push({ kind: 'crown', crown: put(st, q.into, q.node, pw, d) })
        return
      }
      if (it.space) {
        const q = spaceInto(it.space, station(it.space, it.sj!, it.sn!, 0, 1))
        sides[i]!.push({ kind: 'crown', crown: put(st, q.into, q.node, pw, d) })
        if (it.sj === 0) nClusters++
        return
      }
      const q = topInto(it.from!)
      sides[i]!.push({ kind: 'crown', crown: put(st, q.into, q.node, pw, d) })
    }
    const nFirst = R.corner
    const prevSide = (i: number): number => (i - 1 + N) % N
    for (let t = 0; t < N; t++) {
      const ci = (s + t) % N
      const ps = prevSide(ci)
      const L = sideItems[ps]!.length
      // first half of corner ci = the last `corner` items of side ci−1
      for (let k = L - nFirst; k < L; k++) work(ps, k)
      // the corner chain round corner ci
      const apex = add(cornerAt(ci, A), mul(unit(sub(cornerAt(ci, A), c)), yr * APEX_YR))
      const nextP = sidePos[ci]![0] ?? add(cornerAt(ci, A), mul(sideDir(ci), g))
      const loops = chainTo(R.cornerCh, [m.cursor, apex, nextP], !last)
      cornerSpace[ci] = chainSpace(loops, 'R')
      // second half + the middle of side ci (not its first-half tail: that is
      // the next corner's)
      const Lc = sideItems[ci]!.length
      for (let k = 0; k < Lc - nFirst; k++) work(ci, k)
    }
    if (R.corner > 0) nClusters += 2 * N
    // Join: sl st in the 3rd ch of the beginning ch 3.
    const jn = topInto(start!)
    slInto(jn.into, jn.node, sideDir(prevSide(s)))
    // The sides' tops in geometric order: the first-half items were pushed
    // into side ps before its own second half when ps's turn came... re-sort
    // each side's tops into side order (second half, middle, first half).
    for (let i = 0; i < N; i++) {
      const L = sideItems[i]!.length
      const t = sides[i]!
      if (t.length === L && i === prevSide(s)) {
        // for the start corner's previous side, the first-half tops were made first
        sides[i] = [...t.slice(nFirst), ...t.slice(0, nFirst)]
      }
    }
    prev = { sides, cornerSpace, sideSpaces, start: start!, startCorner: s, count, apothem: A }
    counts.push(count)
    clusters.push(R.side === 'clusters' ? nClusters : 0)
  }

  m.fastenOff(sideDir(0))
  const Rout = prev.apothem / Math.cos(Math.PI / N) + yr * 2
  const built = m.finish(Rout * 2, Rout * 2)
  const cs = Math.cos(-rot), sn = Math.sin(-rot)
  const piece = pieceOf(spec.id, m, built, (p) => ({ x: p.x * cs - p.y * sn, y: p.x * sn + p.y * cs, z: p.z }), RELAX_ITERATIONS)
  const outerSides = prev.sides.map((t) => t.map((x) => (x.kind === 'crown' ? x.crown.back : x.far)))
  const names = [...new Set(spec.roundColour)].map((k) => spec.colourNames[k] ?? k)
  const b = assemble(spec.id, spec.label, o, [piece], corneredWords(spec), materialsLine(o, names))
  return { ...b, cornered: { counts, clusters, outerSides, crowding }, spec }
}

// ── Words ──────────────────────────────────────────────────────────────────

const TIMES = (n: number): string => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`)

/** The stitch counts the spec makes, round by round (the ch 3 counts as a st). */
export function corneredCounts(spec: CorneredSpec): number[] {
  const N = spec.corners
  const out = [N * spec.ring.perSide]
  let perSide = spec.ring.perSide // sts on each side of the round below
  let sideSpaces = 0
  for (const R of spec.rounds) {
    if (R.side === 'clusters') {
      const next = 2 * R.corner + sideSpaces * (R.cluster ?? 3)
      sideSpaces = sideSpaces + 1
      perSide = next
    } else {
      perSide = 2 * R.corner + perSide
    }
    out.push(N * perSide)
  }
  return out
}

/** The written pattern, UK terms, every round ending in its count. */
export function corneredWords(spec: CorneredSpec): string[] {
  const N = spec.corners
  const tr = UK[spec.stitch]
  const counts = corneredCounts(spec)
  const R1 = spec.ring
  const nm = (role: string) => spec.colourNames[role] ?? role
  const out: string[] = []
  const c0 = nm(spec.roundColour[0]!)
  out.push(
    `Round 1 (${c0}): make a magic ring, ch 3 (counts as 1 ${tr} here and at the start of every round), ${R1.perSide - 1} ${tr} into the ring, ch ${R1.cornerCh}, ` +
      `[${R1.perSide} ${tr} into the ring, ch ${R1.cornerCh}] ${TIMES(N - 1)}, sl st in the 3rd ch of the beginning ch 3 to join, then pull the tail to close the ring. ` +
      `${N} groups of ${R1.perSide} ${tr} and ${N} ch-${R1.cornerCh} corner sps. (${counts[0]} sts)`,
  )
  let prevCornerCh = R1.cornerCh
  let prevCorner = 0
  let perSide = R1.perSide
  let sideSpaces = 0
  for (let r = 0; r < spec.rounds.length; r++) {
    const R = spec.rounds[r]!
    const roleNow = spec.roundColour[r + 1] ?? spec.roundColour[r]!
    const rolePrev = spec.roundColour[r]!
    const restOfGroup = r === 0 ? R1.perSide - 1 : prevCorner - 1
    const reach = roleNow !== rolePrev
      ? `fasten off ${nm(rolePrev)}; join ${nm(roleNow)} with a sl st in the next ch-${prevCornerCh} corner sp`
      : restOfGroup > 0
        ? `sl st in ${restOfGroup === 1 ? `the next ${tr}` : `each of the next ${restOfGroup} ${tr}`} and into the next ch-${prevCornerCh} corner sp`
        : `sl st into the next ch-${prevCornerCh} corner sp`
    const corner = `(${R.corner} ${tr}, ch ${R.cornerCh}, ${R.corner} ${tr}) in the next ch-${prevCornerCh} corner sp`
    const firstCorner = R.corner > 1
      ? `ch 3, (${R.corner - 1} ${tr}, ch ${R.cornerCh}, ${R.corner} ${tr}) in the same sp`
      : `ch 3, (ch ${R.cornerCh}, ${R.corner} ${tr}) in the same sp`
    let side: string
    let next: number
    if (R.side === 'clusters') {
      const ch = R.sideCh ?? 1
      const cl = R.cluster ?? 3
      side = [`ch ${ch}`, ...new Array(sideSpaces).fill(`${cl} ${tr} in the next ch-${ch} sp, ch ${ch}`)].join(', ')
      next = 2 * R.corner + sideSpaces * cl
      sideSpaces++
    } else {
      side = `1 ${tr} in each of the next ${perSide} ${tr}`
      next = 2 * R.corner + perSide
    }
    const count = counts[r + 1]!
    const tail = R.side === 'clusters'
      ? `${(2 + (sideSpaces - 1)) * N} clusters of ${R.cluster ?? 3} ${tr}, ${N} ch-${R.cornerCh} corner sps`
      : `${next} ${tr} on each side, ${N} ch-${R.cornerCh} corner sps`
    out.push(
      `Round ${r + 2} (${nm(roleNow)}): ${reach}, ${firstCorner}, ${side}, [${corner}, ${side}] ${TIMES(N - 1)}, sl st in the 3rd ch of the beginning ch 3 to join. ${tail}. (${count} sts)`,
    )
    prevCornerCh = R.cornerCh
    prevCorner = R.corner
    perSide = next
  }
  out.push('Fasten off and weave in the ends.')
  out.push(`Block the ${spec.shape} flat with its corners pinned out ${N === 4 ? 'square' : 'evenly'}.`)
  return out
}

/** A round chart in the shape the crochet pattern rows carry (`chartData`). */
export function corneredChart(spec: CorneredSpec): Record<string, unknown> {
  const N = spec.corners
  const sym = spec.stitch === 'dc' ? 'treble' : UK[spec.stitch]
  const rounds: { roundNumber: number; label: string; stitches: Record<string, unknown>[] }[] = []
  const r1: Record<string, unknown>[] = [{ symbol: 'magic-ring', label: 'magic ring centre' }]
  for (let i = 0; i < N; i++) r1.push({ symbol: sym, count: spec.ring.perSide }, { symbol: 'chain', count: spec.ring.cornerCh, label: `ch ${spec.ring.cornerCh} corner` })
  rounds.push({ roundNumber: 1, label: 'Rnd 1', stitches: r1 })
  let perSide = spec.ring.perSide
  let sideSpaces = 0
  spec.rounds.forEach((R, r) => {
    const s: Record<string, unknown>[] = []
    for (let i = 0; i < N; i++) {
      s.push({ symbol: sym, count: R.corner }, { symbol: 'chain', count: R.cornerCh, label: `ch ${R.cornerCh} corner` }, { symbol: sym, count: R.corner })
      if (R.side === 'clusters') {
        s.push({ symbol: 'chain', count: R.sideCh ?? 1, label: 'side ch' })
        for (let k = 0; k < sideSpaces; k++) s.push({ symbol: sym, count: R.cluster ?? 3 }, { symbol: 'chain', count: R.sideCh ?? 1, label: 'side ch' })
      } else {
        s.push({ symbol: sym, count: perSide })
      }
    }
    if (R.side === 'clusters') sideSpaces++
    else perSide = 2 * R.corner + perSide
    rounds.push({ roundNumber: r + 2, label: `Rnd ${r + 2}`, stitches: s })
  })
  return {
    title: `${spec.label} chart`,
    layout: 'round',
    craft: 'crochet',
    terminologyConvention: 'uk',
    caption: `Read each round outwards from the centre. The corner chain spaces sit at the ${N} corners of the ${spec.shape}.`,
    rounds,
  }
}

// ── Presets ────────────────────────────────────────────────────────────────

/** The classic three-round granny square: 12, 24, 36 tr in clusters of 3,
 *  ch-2 corners, ch-1 side spaces; round 1 in the centre colour, rounds 2-3 in
 *  the outer colour (the starter row `granny-square-basic-three-round`). */
export const GRANNY_SQUARE: CorneredSpec = {
  id: 'granny-square',
  label: 'Granny square',
  shape: 'square',
  corners: 4,
  stitch: 'dc',
  ring: { perSide: 3, cornerCh: 2, ringYr: 2.2 },
  rounds: [
    { corner: 3, cornerCh: 2, side: 'clusters', cluster: 3, sideCh: 1 },
    { corner: 3, cornerCh: 2, side: 'clusters', cluster: 3, sideCh: 1 },
  ],
  roundColour: ['centre', 'outer', 'outer'],
  colours: { centre: '#c39433', outer: '#e2d2b4' },
  colourNames: { centre: 'centre colour', outer: 'outer colour' },
  description: 'The classic three-round granny square: clusters of three trebles and chain-space corners, worked from a magic ring in two colours.',
}

/** A solid treble square in the round: tr in each tr along the sides, a
 *  corner group in each ch-2 corner space. */
export const SOLID_SQUARE: CorneredSpec = {
  id: 'solid-square',
  label: 'Solid treble square',
  shape: 'square',
  corners: 4,
  stitch: 'dc',
  ch3Leg: 'R',
  ring: { perSide: 3, cornerCh: 2, ringYr: 2.2 },
  rounds: [
    { corner: 2, cornerCh: 2, side: 'each' },
    { corner: 2, cornerCh: 2, side: 'each' },
  ],
  roundColour: ['main', 'main', 'main'],
  colours: { main: '#9c6c78' },
  colourNames: { main: 'main colour' },
  description: 'A solid treble square worked in the round from a magic ring, with a chain-space corner at each of its four corners.',
}

/** The starter row's solid square counts (12, 36, 60: "(3 tr, ch 2, 3 tr)"
 *  corners with 1 tr in each tr), kept to measure against. */
export const SOLID_SQUARE_STARTER: CorneredSpec = {
  ...SOLID_SQUARE,
  rounds: [
    { corner: 3, cornerCh: 2, side: 'each' },
    { corner: 3, cornerCh: 2, side: 'each' },
  ],
}

/** A solid treble hexagon in the round. */
export const SOLID_HEXAGON: CorneredSpec = {
  id: 'solid-hexagon',
  label: 'Solid treble hexagon',
  shape: 'hexagon',
  corners: 6,
  stitch: 'dc',
  ch3Leg: 'R',
  ring: { perSide: 2, cornerCh: 1, ringYr: 2.2 },
  rounds: [{ corner: 1, cornerCh: 1, side: 'each' }],
  roundColour: ['main', 'main'],
  colours: { main: '#7f8f6a' },
  colourNames: { main: 'main colour' },
  description: 'A solid treble hexagon worked in the round from a magic ring, with a chain-space corner at each of its six corners.',
}

/** The starter row's hexagon counts (18, 54: "(3 tr, ch 1, 3 tr)" corners). */
export const SOLID_HEXAGON_STARTER: CorneredSpec = {
  ...SOLID_HEXAGON,
  ring: { perSide: 3, cornerCh: 1, ringYr: 2.6 },
  rounds: [{ corner: 3, cornerCh: 1, side: 'each' }],
}

export const CORNERED_PRESETS = {
  'granny-square': GRANNY_SQUARE,
  'solid-square': SOLID_SQUARE,
  'solid-hexagon': SOLID_HEXAGON,
} as const

export function buildCorneredPreset(id: keyof typeof CORNERED_PRESETS, o?: MotifOptions): BuiltCornered {
  return buildCornered(CORNERED_PRESETS[id], o)
}


// ── Measures (the tests' rails) ─────────────────────────────────────────────

export interface CorneredMetrics {
  /** Relaxed node heights over the table (yarn radii): 95th percentile and max, from the median. */
  zP95Yr: number
  zMaxYr: number
  /** Non-neighbour strand node pairs (more than 9 apart along the strand) whose
   *  centrelines are closer than 0.6 yr: yarn passing through yarn, not just
   *  squashed against it (the relax's own collision floor is 1.25 yr; the
   *  registered star settles to 0.3 yr at its tips). */
  clips: number
  /** The closest such pair (yr). */
  minSepYr: number
  /** Interior angle at each corner (deg) from lines fitted to the last round's crowns on each side. */
  cornerDeg: number[]
  /** Across the flats (mm), side to opposite side, and across the corners. */
  flatsMm: number
  cornersMm: number
}

export function corneredMetrics(b: BuiltCornered): CorneredMetrics {
  const piece = b.pieces[0]!
  const nodes = piece.built.model.nodes
  const P = (i: number) => {
    const n = nodes[i]!
    return piece.pose ? piece.pose({ x: n.x, y: n.y, z: n.z }, i) : { x: n.x, y: n.y, z: n.z }
  }
  const pts = nodes.map((_, i) => P(i))
  const body = pts.slice(piece.built.anchorPins)
  const zs = body.map((p) => p.z).sort((a, c) => a - c)
  const med = zs[Math.floor(zs.length / 2)]!
  const dev = body.map((p) => Math.abs(p.z - med)).sort((a, c) => a - c)
  const yr = b.yr
  // clipping: a grid hash over the relaxed strand
  const cell = yr * 1.0
  const clipAt = yr * 0.6
  let minSep = Infinity
  const grid = new Map<string, number[]>()
  pts.forEach((p, i) => {
    const k = `${Math.floor(p.x / cell)},${Math.floor(p.y / cell)},${Math.floor(p.z / cell)}`
    const a = grid.get(k)
    if (a) a.push(i)
    else grid.set(k, [i])
  })
  let clips = 0
  pts.forEach((p, i) => {
    const cx = Math.floor(p.x / cell), cy = Math.floor(p.y / cell), cz = Math.floor(p.z / cell)
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      for (const j of grid.get(`${cx + dx},${cy + dy},${cz + dz}`) ?? []) {
        if (j <= i + 9) continue
        const q = pts[j]!
        const dd = Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z)
        minSep = Math.min(minSep, dd)
        if (dd < clipAt) clips++
      }
    }
  })
  // corners: fit a line (PCA) to each side's outer crowns
  const N = b.spec.corners
  const lines = b.cornered.outerSides.map((ids) => {
    const q = ids.map((i) => pts[i]!)
    const mx = q.reduce((a, p) => a + p.x, 0) / q.length, my = q.reduce((a, p) => a + p.y, 0) / q.length
    let sxx = 0, sxy = 0, syy = 0
    for (const p of q) { sxx += (p.x - mx) ** 2; sxy += (p.x - mx) * (p.y - my); syy += (p.y - my) ** 2 }
    const th = 0.5 * Math.atan2(2 * sxy, sxx - syy)
    return { mx, my, ux: Math.cos(th), uy: Math.sin(th) }
  })
  const cornerDeg: number[] = []
  for (let i = 0; i < N; i++) {
    const a = lines[i]!, c = lines[(i + 1) % N]!
    const cosA = Math.abs(a.ux * c.ux + a.uy * c.uy)
    // interior angle of a convex polygon between two side lines: 180 − the angle between their directions
    cornerDeg.push(180 - (Math.acos(Math.min(1, cosA)) * 180) / Math.PI)
  }
  // size: the outline's extent along each side normal (flats) and to the corners
  let flats = 0
  for (let i = 0; i < N; i++) {
    const a = sideNormal(N, i)
    const nx = Math.cos(a), ny = Math.sin(a)
    let lo = Infinity, hi = -Infinity
    for (const p of body) { const d = p.x * nx + p.y * ny; lo = Math.min(lo, d); hi = Math.max(hi, d) }
    flats += (hi - lo) / N
  }
  let corners = 0
  for (let i = 0; i < N; i++) {
    const a = sideNormal(N, i) - Math.PI / N
    const nx = Math.cos(a), ny = Math.sin(a)
    let lo = Infinity, hi = -Infinity
    for (const p of body) { const d = p.x * nx + p.y * ny; lo = Math.min(lo, d); hi = Math.max(hi, d) }
    corners += (hi - lo) / N
  }
  return {
    zP95Yr: dev[Math.floor(0.95 * (dev.length - 1))]! / yr,
    zMaxYr: dev[dev.length - 1]! / yr,
    clips,
    minSepYr: minSep / yr,
    cornerDeg,
    flatsMm: flats,
    cornersMm: corners,
  }
}
