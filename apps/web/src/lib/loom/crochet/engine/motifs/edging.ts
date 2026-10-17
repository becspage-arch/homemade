/**
 * EDGINGS WORKED IN ROWS — the picot edging, the shell lace edging and the
 * chain-loop edging (opt-in; not in `index.ts`, so `listMotifs()` and every
 * existing motif, hash and size table are untouched).
 *
 * An edging is a narrow strip worked in TURNED ROWS along a foundation chain:
 *   Row 1: 1 dc in the 2nd ch from the hook and in each ch along (the base row);
 *   Row 2: ch 1 and turn, 1 dc in the first dc, then a REPEAT across the base:
 *     - picot:  [ch 3, sl st in the 3rd ch from the hook, skip 1 dc, 1 dc in the next dc]
 *     - shell:  [skip 2 dc, 5 tr in the next dc, skip 2 dc, 1 dc in the next dc]
 *     - loop:   [ch 5, skip 2 dc, 1 dc in the next dc]
 * so the base row is a multiple of (repeat width) plus 1 dc, and the
 * foundation chain is that plus 1.
 *
 * Everything is the kit's genuine construction (one strand, every interlock
 * recorded and audited after relax). Two things are new here:
 *
 *  - THE TURN. A turned row is worked from the other face. In the fabric's
 *    fixed frame that is the ordinary stitch rotated half a turn about its own
 *    height axis: its along-row direction reversed, its height the same, its
 *    relief (z) flipped. `alongTurned` / `polarTurned` are the frames whose
 *    height is the along-row direction turned +90° (the mirror of `along` /
 *    `polar`), and the stitch is built with the kit's `fz: -1`. Row 1 is worked
 *    right to left from the front (+z) face, row 2 left to right from the back,
 *    exactly as the flat row builder (`buildContinuous`) turns its rows.
 *  - THE FOUNDATION CHAIN IS THE PINNED ANCHOR, as it is for every flat row
 *    build (`buildContinuous`, handbook §2): the real chain (the kit's
 *    pull-through `chain`), but held where it was laid. The motif rounds found
 *    that a stitch worked into a FREE chain's leg drags the chain's crossings
 *    out of their folds (§8m); an edging's base row is worked into every chain
 *    of one, so the foundation is the strip's anchor edge, the same edge a
 *    border worked onto finished fabric would have.
 *
 * Counts are written the standard way: a picot and a chain loop are not
 * stitches (the row counts its dc), each tr of a shell is.
 */

import { STITCHES, rowPitchYr, type StitchId } from '../dictionary'
import {
  MotifStrand,
  add,
  along,
  left,
  len,
  mul,
  right,
  sub,
  unit,
  type ChainLoop,
  type Crown,
  type Frame,
  type StitchSpec,
  type V2,
} from './kit'
import { UK, assemble, materialsLine, motifYarn, pieceOf } from './common'
import type { BuiltMotif, MotifId, MotifOptions } from './types'

export type EdgingKind = 'picot' | 'shell' | 'loop'

export interface EdgingSpec {
  id: MotifId
  label: string
  kind: EdgingKind
  /** How many times row 2's bracket is worked. */
  repeats: number
  /** Base dc skipped: under a picot / a loop, or on EACH side of a shell. */
  skip: number
  /** Shell: tr in each shell (worked into one dc). */
  shell?: number
  /** Loop: chains in each loop. */
  loopCh?: number
  /** Picot: chains in each picot (closed with a sl st in the first of them). */
  picotCh?: number
  colour: string
  /** The description for a pattern row. */
  description: string
}

/** What the builder measured and the tests check. */
export interface EdgingReport {
  /** Sts per row as built (row 1, row 2), counted the standard way. */
  counts: number[]
  /** Row 2's dc anchors (crown nodes) in work order, left to right. */
  anchors: number[]
  /** Per repeat, the node of its feature (picot tip, shell's middle tr crown, loop apex chain). */
  features: number[]
  /** Row 1's crown nodes (the base row), left to right. */
  base: number[]
  /** Row 2's fit, the worst repeat: shell = the tr's laid width / the arc of room
   *  over its skipped dc; loop = chord / chain length (over 1 = the chain cannot
   *  reach); picot = half its chain / the room over the skipped dc. */
  crowding: number
}

export type BuiltEdging = BuiltMotif & { edging: EdgingReport; spec: EdgingSpec }

/** Base-row dc consumed by one repeat. */
export function edgingRepeatWidth(spec: EdgingSpec): number {
  return spec.kind === 'shell' ? 2 * spec.skip + 2 : spec.skip + 1
}

/** Row 1's dc count (a multiple of the repeat width plus 1). */
export function edgingBaseCount(spec: EdgingSpec): number {
  return 1 + spec.repeats * edgingRepeatWidth(spec)
}

/** The stitch counts the spec makes: row 1 and row 2, counted the standard way. */
export function edgingCounts(spec: EdgingSpec): number[] {
  const base = edgingBaseCount(spec)
  const row2 = spec.kind === 'shell' ? 1 + spec.repeats * ((spec.shell ?? 5) + 1) : 1 + spec.repeats
  return [base, row2]
}

// ── Frames ───────────────────────────────────────────────────────────────

/** Worked along a line through `o` in direction `a` FROM THE OTHER FACE (a
 *  turned row): height = a turned +90° (the mirror of `along`). Build its
 *  stitches with `fz: -1`. */
export function alongTurned(o: V2, a0: V2): Frame {
  const a = unit(a0)
  const h = left(a)
  return {
    place: (lx, ly) => add(o, add(mul(a, lx), mul(h, ly))),
    local: (p) => {
      const d = sub(p, o)
      return { lx: d.x * a.x + d.y * a.y, ly: d.x * h.x + d.y * h.y }
    },
    axesAt: () => ({ a, h }),
  }
}

/** Worked in a fan about `c` from the other face (a shell in a turned row):
 *  lx = arc length at rRef, increasing CLOCKWISE from straight up (+y); height
 *  = radial. The mirror of the kit's `polar`. */
export function polarTurned(c: V2, rRef: number): Frame {
  const th = (lx: number): number => Math.PI / 2 - lx / rRef
  return {
    place: (lx, ly) => ({ x: c.x + Math.cos(th(lx)) * ly, y: c.y + Math.sin(th(lx)) * ly }),
    local: (p) => {
      const d = sub(p, c)
      let a = Math.PI / 2 - Math.atan2(d.y, d.x)
      while (a > Math.PI) a -= Math.PI * 2
      while (a < -Math.PI) a += Math.PI * 2
      return { lx: a * rRef, ly: len(d) }
    },
    axesAt: (p) => {
      const h = unit(sub(p, c))
      return { a: right(h), h }
    },
  }
}

/** The construction's settled values (probes in the handbook §8p). Mutable
 *  only so a probe script can sweep them; nothing in the build writes them. */
export const EDGING_TUNE = {
  /** Picot: how high its tip stands above the row (yr), its chain pitch, how
   *  wide the ring is (yr), and how many of its chains turn back (wrap links). */
  picotRiseYr: 3.4,
  picotPitchYr: 2.5,
  picotWideYr: 0.8,
  picotTurning: 2,
  /** The picot's closing sl st: its dive under the first chain (× the stitch's own). */
  picotSlDepth: 1.5,
  /** Which of the first chain's legs the sl st dives past (1 = its R leg,
   *  −1 = its L), and its frame: along the row (0), along that chain (1), or
   *  against it (−1, so the sl st stands toward the inside of the picot ring). */
  picotSlLeg: 1,
  picotSlAlongChain: -1,
  /** The foundation: the first chain's start past the slip knot (yr), and the
   *  base row's hook depth (under the chain's top loops, over its back bump). */
  knotGapYr: 1.2,
  /** How far the turning ch 1 leans out past the strip's end (yr). */
  turnLeanYr: 0.6,
  /** Its chain's pitch, × the row height. */
  turnPitch: 1.0,
  baseHookDepth: 0.5,
  /** A loop's chain pitch (yr). */
  loopPitchYr: 3.2,
  /** How far short of the next dc's crown the loop's chain path ends (yr). */
  loopEndYr: 1.0,
  /** A shell's fan: how far below the base crown the fan's centre sits (yr),
   *  and the hook spread / deeper tuck of the shell's later tr. */
  shellDropYr: 2.4,
  shellSpread: 0,
  shellDepth: 1.5,
  /** Relax iterations (the cornered motifs' 500). */
  relaxIterations: 500,
}

export function buildEdging(spec: EdgingSpec, o?: MotifOptions): BuiltEdging {
  const y = motifYarn(o)
  const yr = y.yr
  const colour = o?.colours?.main ?? spec.colour
  const dcId: StitchId = 'sc' // UK dc
  const trId: StitchId = 'dc' // UK tr
  const W = STITCHES[dcId].gaugeYr * yr
  const Wtr = STITCHES[trId].gaugeYr * yr
  const H = rowPitchYr(dcId) * yr
  const Htr = rowPitchYr(trId) * yr
  const base = edgingBaseCount(spec)
  const nCh = base + 1
  const rw = edgingRepeatWidth(spec)
  const X: V2 = { x: 1, y: 0 }
  const NX: V2 = { x: -1, y: 0 }

  const m = new MotifStrand(yr, colour)
  const nodePos = (i: number): V2 => ({ x: m.nodes[i]!.x, y: m.nodes[i]!.y })
  type Into = StitchSpec['into']

  /** One stitch with its crown at `crownW`; `turned` = a row-2 stitch. */
  const put = (id: StitchId, into: Into, hookNode: number, crownW: V2, turned: boolean, extra: Partial<StitchSpec> = {}): Crown => {
    const f = turned ? alongTurned(crownW, X) : along(crownW, NX)
    const hl = f.local(nodePos(hookNode))
    return m.stitch({ id, frame: f, xCrown: 0, xHook: hl.lx, into, by: Math.min(hl.ly, -yr * 0.5), ty: 0, ...(turned ? { fz: -1 } : {}), ...extra })
  }
  const crownInto = (c: Crown): { into: Into; node: number } => ({ into: { kind: 'crown', crown: c }, node: c.back })
  const loopInto = (L: ChainLoop): { into: Into; node: number } => ({
    into: { kind: 'space', near: L.legL, far: L.legR, nearAll: L.sections.map((s) => s.l), farAll: L.sections.map((s) => s.r) },
    node: L.legR,
  })

  // ── Foundation chain (the pinned anchor) ─────────────────────────────────
  m.sectionName = 'foundation'
  m.slipKnot({ x: 0, y: 0 }, X)
  // the first chain starts clear of the knot (pinned, the two never settle apart)
  const fch = m.chain(nCh, [{ x: yr * EDGING_TUNE.knotGapYr, y: 0 }, { x: (nCh + 2) * W, y: 0 }], { pitchYr: W / yr })
  for (const n of m.nodes) n.w = 0
  m.anchorPins = m.nodes.length

  // ── Row 1: 1 dc in the 2nd ch from the hook, then in each ch (right to left) ─
  m.sectionName = 'row 1'
  const r1: Crown[] = [] // work order: right to left
  for (let i = 0; i < base; i++) {
    const L = fch[nCh - 2 - i]!
    const q = loopInto(L)
    // under the chain's two top loops and OVER its back bump (pinned, it cannot
    // make way for a hook dived the full depth)
    r1.push(put(dcId, q.into, q.node, { x: L.c.x, y: H }, false, { hookDepthScale: EDGING_TUNE.baseHookDepth }))
  }
  const b1 = [...r1].reverse() // left to right

  // ── Row 2 ────────────────────────────────────────────────────────────────
  m.sectionName = 'row 2'
  const y2 = H + H
  // ch 1 and turn
  m.chain(1, [m.cursor, add(m.cursor, { x: -yr * EDGING_TUNE.turnLeanYr, y: H })], { pitchYr: (H / yr) * EDGING_TUNE.turnPitch, fz: -1 })
  const anchors: Crown[] = []
  const features: number[] = []
  const dcAt = (k: number): Crown => {
    const q = crownInto(b1[k]!)
    const c = put(dcId, q.into, q.node, { x: b1[k]!.p.x, y: y2 }, true)
    anchors.push(c)
    return c
  }
  let crowding = 0
  dcAt(0)
  for (let r = 0; r < spec.repeats; r++) {
    const a = r * rw // the dc this repeat starts from
    const xa = b1[a]!.p.x
    const xb = b1[a + rw]!.p.x
    if (spec.kind === 'picot') {
      const n = spec.picotCh ?? 3
      // the picot rises off the dc just made, over the skipped dc, and turns back down
      const mid = (xa + xb) / 2
      const T = EDGING_TUNE
      const tip = { x: mid, y: y2 + yr * T.picotRiseYr }
      const loops = m.chain(n, [m.cursor, { x: mid - yr * T.picotWideYr, y: y2 + yr * T.picotRiseYr * 0.8 }, tip, { x: mid + yr * T.picotWideYr, y: y2 + yr * T.picotRiseYr * 0.6 }, { x: mid + yr * 0.2, y: y2 + yr * 0.2 }], { pitchYr: T.picotPitchYr, turning: T.picotTurning, fz: -1 })
      features.push(loops[Math.floor(n / 2)]!.apex)
      // sl st into the 3rd ch from the hook (the first of the picot's chains)
      const L0 = loops[0]!
      const legs = T.picotSlLeg > 0 ? { near: L0.legL, far: L0.legR, nearAll: L0.sections.map((x) => x.l), farAll: L0.sections.map((x) => x.r) } : { near: L0.legR, far: L0.legL, nearAll: L0.sections.map((x) => x.r), farAll: L0.sections.map((x) => x.l) }
      const p = nodePos(legs.far)
      m.stitch({ id: 'slst', frame: alongTurned(p, T.picotSlAlongChain ? mul(L0.u, T.picotSlAlongChain) : X), xCrown: 0, xHook: 0, into: { kind: 'space', ...legs }, by: 0, fz: -1, hookDepthScale: T.picotSlDepth })
      crowding = Math.max(crowding, (n * EDGING_TUNE.picotPitchYr * yr * 0.5) / Math.max(1e-6, xb - xa))
      dcAt(a + rw)
    } else if (spec.kind === 'loop') {
      const n = spec.loopCh ?? 5
      const L = n * EDGING_TUNE.loopPitchYr * yr
      const chord = xb - xa
      const h = Math.sqrt(Math.max(0, (L / 2) ** 2 - (chord / 2) ** 2))
      const mid = (xa + xb) / 2
      const e = yr * EDGING_TUNE.loopEndYr
      const loops = m.chain(n, [m.cursor, { x: xa + chord * 0.15, y: y2 + h * 0.7 }, { x: mid, y: y2 + h }, { x: xb - chord * 0.15, y: y2 + h * 0.7 }, { x: xb - e, y: y2 + e * 0.5 }], { pitchYr: EDGING_TUNE.loopPitchYr, fz: -1 })
      features.push(loops[Math.floor(n / 2)]!.apex)
      crowding = Math.max(crowding, chord / Math.max(1e-6, L))
      dcAt(a + rw)
    } else {
      // skip `skip`, `shell` tr in the next dc, skip `skip`, dc in the next
      const n = spec.shell ?? 5
      const bc = b1[a + spec.skip + 1]!
      const c = { x: bc.p.x, y: bc.p.y - yr * EDGING_TUNE.shellDropYr }
      const R = EDGING_TUNE.shellDropYr * yr + Htr
      // the tr fan out at their own width round the arc; the room is the arc
      // whose ends stand over the outermost skipped dc (past them a shell
      // runs into its neighbour)
      const half = spec.skip * W + W * 0.5
      const phi = ((n - 1) * Wtr) / (2 * R)
      const phiMax = Math.asin(Math.min(1, half / R))
      crowding = Math.max(crowding, (n * Wtr) / (2 * phiMax * R + Wtr))
      const f = polarTurned(c, R)
      const hookLx = f.local(nodePos(bc.back)).lx
      const crowns: Crown[] = []
      for (let t = 0; t < n; t++) {
        const lx = (-phi + (2 * phi * t) / Math.max(1, n - 1)) * R
        crowns.push(m.stitch({
          id: trId, frame: f, xCrown: lx, xHook: hookLx, into: { kind: 'crown', crown: bc }, by: EDGING_TUNE.shellDropYr * yr, ty: R, fz: -1,
          spread: n === 1 ? 0 : EDGING_TUNE.shellSpread * (t === 0 ? 1 : t === n - 1 ? -1 : 0), hookDepthScale: n > 1 && t > 0 ? EDGING_TUNE.shellDepth : 1,
        }))
      }
      features.push(crowns[Math.floor(n / 2)]!.back)
      dcAt(a + rw)
    }
  }

  m.fastenOff(X)
  const built = m.finish(base * W + yr * 4, H * 3 + Htr)
  const piece = pieceOf(spec.id, m, built, undefined, EDGING_TUNE.relaxIterations)
  const b = assemble(spec.id, spec.label, o, [piece], edgingWords(spec), materialsLine(o, ['one colour']))
  const counts = [r1.length, spec.kind === 'shell' ? anchors.length + spec.repeats * (spec.shell ?? 5) : anchors.length]
  return {
    ...b,
    edging: { counts, anchors: anchors.map((c) => c.back), features, base: b1.map((c) => c.back), crowding },
    spec,
  }
}

// ── Words ──────────────────────────────────────────────────────────────────

const TIMES = (n: number): string => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`)
const PLURAL = (n: number, w: string): string => `${n} ${w}${n === 1 ? '' : 's'}`

/** The written pattern, UK terms, every row ending in its count. */
export function edgingWords(spec: EdgingSpec): string[] {
  const [base, row2] = edgingCounts(spec)
  const rw = edgingRepeatWidth(spec)
  const dc = UK.sc
  const tr = UK.dc
  const out: string[] = []
  out.push(
    `Row 1: make a foundation chain of ${base! + 1} chains (a multiple of ${rw} plus 2). Work 1 ${dc} in the 2nd chain from the hook, then 1 ${dc} in each of the next ${base! - 1} chains. (${base} sts)`,
  )
  const turn = `Row 2: ch 1 and turn (the ch 1 does not count as a st). 1 ${dc} in the first ${dc}.`
  const sk = (n: number): string => `skip ${n} ${dc}`
  if (spec.kind === 'picot') {
    const n = spec.picotCh ?? 3
    out.push(
      `${turn} [Ch ${n}, sl st into the ${n}${n === 3 ? 'rd' : 'th'} chain from the hook to make a picot, ${sk(spec.skip)}, 1 ${dc} in the next ${dc}] ${TIMES(spec.repeats)}. ` +
        `${PLURAL(spec.repeats, 'picot')} sit between ${row2} ${dc}; a picot is not counted as a st. (${row2} sts)`,
    )
  } else if (spec.kind === 'shell') {
    const n = spec.shell ?? 5
    out.push(
      `${turn} [${sk(spec.skip)[0]!.toUpperCase()}${sk(spec.skip).slice(1)}, ${n} ${tr} in the next ${dc} to make a shell, ${sk(spec.skip)}, 1 ${dc} in the next ${dc}] ${TIMES(spec.repeats)}. ` +
        `${PLURAL(spec.repeats, 'shell')} sit between ${spec.repeats + 1} ${dc}; each ${tr} of a shell counts as a st (${spec.repeats + 1} ${dc} and ${spec.repeats * n} ${tr}). (${row2} sts)`,
    )
  } else {
    const n = spec.loopCh ?? 5
    out.push(
      `${turn} [Ch ${n}, ${sk(spec.skip)}, 1 ${dc} in the next ${dc}] ${TIMES(spec.repeats)}. ` +
        `${spec.repeats} chain loop${spec.repeats === 1 ? '' : 's'} sit between ${row2} ${dc}; the chains of a loop are not counted as sts. (${row2} sts)`,
    )
  }
  out.push('Fasten off and weave in the ends.')
  out.push('Block the strip flat, pinning out each ' + (spec.kind === 'picot' ? 'picot' : spec.kind === 'shell' ? 'shell' : 'loop') + '.')
  return out
}

/** A row chart in the shape the crochet pattern rows carry (`chartData`). */
export function edgingChart(spec: EdgingSpec): Record<string, unknown> {
  const [base] = edgingCounts(spec)
  const r2: Record<string, unknown>[] = [{ symbol: 'chain', count: 1, label: 'turning ch' }, { symbol: 'double', count: 1 }]
  for (let r = 0; r < spec.repeats; r++) {
    if (spec.kind === 'picot') r2.push({ symbol: 'picot', count: 1, label: `ch ${spec.picotCh ?? 3} picot` }, { symbol: 'skip', count: spec.skip }, { symbol: 'double', count: 1 })
    else if (spec.kind === 'loop') r2.push({ symbol: 'chain', count: spec.loopCh ?? 5, label: 'loop' }, { symbol: 'skip', count: spec.skip }, { symbol: 'double', count: 1 })
    else r2.push({ symbol: 'skip', count: spec.skip }, { symbol: 'treble', count: spec.shell ?? 5, label: 'shell' }, { symbol: 'skip', count: spec.skip }, { symbol: 'double', count: 1 })
  }
  return {
    title: `${spec.label} chart`,
    layout: 'rows',
    craft: 'crochet',
    terminologyConvention: 'uk',
    caption: `Read row 1 from right to left and row 2 from left to right. The repeat is ${edgingRepeatWidth(spec)} sts of row 1.`,
    rows: [
      { rowNumber: 0, label: 'Foundation', stitches: [{ symbol: 'chain', count: base! + 1 }] },
      { rowNumber: 1, label: 'Row 1', stitches: [{ symbol: 'double', count: base }] },
      { rowNumber: 2, label: 'Row 2', stitches: r2 },
    ],
  }
}

// ── Presets ────────────────────────────────────────────────────────────────

const PICOT: EdgingSpec = {
  id: 'picot-edging', label: 'Picot edging', kind: 'picot', repeats: 9, skip: 1, picotCh: 3, colour: '#e9dcc3',
  description: 'A two-row picot trim: a firm row of double crochet, then small chain picots between the stitches of the second row.',
}
const SHELL: EdgingSpec = {
  id: 'shell-lace-edging', label: 'Shell lace edging', kind: 'shell', repeats: 3, skip: 2, shell: 5, colour: '#d9b7b0',
  description: 'A two-row scalloped trim: a firm row of double crochet, then shells of five trebles held between single double crochet stitches.',
}
const LOOP: EdgingSpec = {
  id: 'chain-loop-edging', label: 'Chain-loop edging', kind: 'loop', repeats: 6, skip: 2, loopCh: 5, colour: '#a9b79a',
  description: 'A two-row trim of chain loops: a firm row of double crochet, then arches of five chains anchored by double crochet.',
}

/** The three June starter rows' counts, as specs: picot 19 / 10, shell 19 / 19, loop 19 / 7. */
export const EDGING_STARTERS = { 'picot-edging': PICOT, 'shell-lace-edging': SHELL, 'chain-loop-edging': LOOP } as const

/** A neighbour that does NOT fit, kept as the rail's proof that it discriminates:
 *  7 tr in one dc over the shell's 6-st repeat (the fan has room for 5). */
export const SHELL_CROWDED: EdgingSpec = { ...SHELL, shell: 7 }

export const EDGING_PRESETS = {
  'picot-edging': PICOT,
  'shell-lace-edging': SHELL,
  'chain-loop-edging': LOOP,
} as const

export function buildEdgingPreset(id: keyof typeof EDGING_PRESETS, o?: MotifOptions): BuiltEdging {
  return buildEdging(EDGING_PRESETS[id], o)
}

// ── Measures (the tests' rails) ─────────────────────────────────────────────

export interface EdgingMetrics {
  /** Relaxed node heights over the table (yarn radii): 95th percentile and max, from the median. */
  zP95Yr: number
  zMaxYr: number
  /** Non-neighbour strand node pairs (more than 9 apart along the strand)
   *  closer than 0.6 yr: yarn passing through yarn (as cornered.ts). */
  clips: number
  minSepYr: number
  /** The base row's worst departure from a straight line (yr): a strip that
   *  bows or snakes in its own plane is crowded on one edge. */
  bowYr: number
  /** Settled strip length and depth (mm), anchor excluded. */
  lengthMm: number
  depthMm: number
  /** Per repeat: its length (mm, between the row-2 anchors that bound it),
   *  and its feature's height above the base row's crowns (mm). */
  repeatMm: number[]
  /** Per repeat: its length along the base row (mm), between the base dc its
   *  bounding anchors are worked into. */
  baseRepeatMm: number[]
  featureMm: number[]
  /** Where each feature sits across its repeat (0 = first anchor, 1 = the next). */
  featureAt: number[]
}

export function edgingMetrics(b: BuiltEdging): EdgingMetrics {
  const piece = b.pieces[0]!
  const nodes = piece.built.model.nodes
  const yr = b.yr
  const pts = nodes.map((n) => ({ x: n.x, y: n.y, z: n.z }))
  const body = pts.slice(piece.built.anchorPins)
  const zs = body.map((p) => p.z).sort((a, c) => a - c)
  const med = zs[Math.floor(zs.length / 2)]!
  const dev = body.map((p) => Math.abs(p.z - med)).sort((a, c) => a - c)
  // clipping: a grid hash over the relaxed strand
  const cell = yr
  const clipAt = yr * 0.6
  let minSep = Infinity
  let clips = 0
  const grid = new Map<string, number[]>()
  const key = (x: number, y: number, z: number): string => `${x},${y},${z}`
  pts.forEach((p, i) => {
    const k = key(Math.floor(p.x / cell), Math.floor(p.y / cell), Math.floor(p.z / cell))
    const a = grid.get(k)
    if (a) a.push(i)
    else grid.set(k, [i])
  })
  pts.forEach((p, i) => {
    const cx = Math.floor(p.x / cell), cy = Math.floor(p.y / cell), cz = Math.floor(p.z / cell)
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      for (const j of grid.get(key(cx + dx, cy + dy, cz + dz)) ?? []) {
        if (j <= i + 9) continue
        const q = pts[j]!
        const dd = Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z)
        minSep = Math.min(minSep, dd)
        if (dd < clipAt) clips++
      }
    }
  })
  // the base row's straightness: residual from its least-squares line
  const bs = b.edging.base.map((i) => pts[i]!)
  const mx = bs.reduce((a, p) => a + p.x, 0) / bs.length
  const my = bs.reduce((a, p) => a + p.y, 0) / bs.length
  let sxx = 0, sxy = 0
  for (const p of bs) { sxx += (p.x - mx) ** 2; sxy += (p.x - mx) * (p.y - my) }
  const slope = sxy / Math.max(sxx, 1e-9)
  const bow = Math.max(...bs.map((p) => Math.abs(p.y - (my + slope * (p.x - mx))) / Math.hypot(1, slope)))
  const baseY = (x: number): number => my + slope * (x - mx)
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity
  for (const p of body) { minx = Math.min(minx, p.x); maxx = Math.max(maxx, p.x); miny = Math.min(miny, p.y); maxy = Math.max(maxy, p.y) }
  const an = b.edging.anchors.map((i) => pts[i]!)
  const repeatMm: number[] = []
  const rw = edgingRepeatWidth(b.spec)
  const baseRepeatMm = b.edging.features.map((_, r) => Math.hypot(bs[(r + 1) * rw]!.x - bs[r * rw]!.x, bs[(r + 1) * rw]!.y - bs[r * rw]!.y))
  const featureMm: number[] = []
  const featureAt: number[] = []
  b.edging.features.forEach((fi, r) => {
    const a0 = an[r]!, a1 = an[r + 1]!
    repeatMm.push(Math.hypot(a1.x - a0.x, a1.y - a0.y))
    // the feature's highest point: its node and the nodes either side of it along the strand
    let top = -Infinity, topX = 0
    for (let k = fi - 6; k <= fi + 6; k++) {
      const q = pts[k]
      if (q && q.y - baseY(q.x) > top) { top = q.y - baseY(q.x); topX = q.x }
    }
    featureMm.push(top)
    featureAt.push((topX - a0.x) / Math.max(1e-9, a1.x - a0.x))
  })
  return {
    zP95Yr: dev[Math.floor(0.95 * (dev.length - 1))]! / yr,
    zMaxYr: dev[dev.length - 1]! / yr,
    clips,
    minSepYr: minSep / yr,
    bowYr: bow / yr,
    lengthMm: maxx - minx,
    depthMm: maxy - miny,
    repeatMm,
    baseRepeatMm,
    featureMm,
    featureAt,
  }
}
