/**
 * The PATTERN PROGRAM layer — the seed of the crochet pattern engine.
 *
 * One declarative description of a crochet pattern that compiles three ways
 * from a single source, so they can never drift apart:
 *
 *   1. GEOMETRY  — compileProgram() → the loom builders → the audit gate →
 *                  the render pipeline (the hero IS the pattern);
 *   2. WORDS     — writeInstructions() → the locked PATTERN-template text
 *                  (UK terms, `[...] N times` repeats, every line ending in
 *                  its `(N sts)` count);
 *   3. CHART     — the program maps 1:1 onto the product's stored
 *                  `ChartDefinition` (apps/web/src/lib/craft-charts/types.ts):
 *                  programFromChart() derives a program from a stored chart,
 *                  with shaping recovered from consecutive round/row counts by
 *                  the same even-distribution convention real patterns use.
 *
 * The program speaks the LOOM's internal (US) stitch ids; terminology is a
 * render-time concern (UK by default in the written output, matching the
 * content pipeline's convention).
 */

import { SWATCH_RECIPES, type StitchId, type ShapeOp } from './dictionary'
import { buildShaped, buildRounds, buildSphere, roundOps } from './shaping'
import type { BuiltContinuous } from './yarnPath'

/** The three fabric forms the loom can currently build from a program. */
export type ProgramForm = 'flat' | 'disc' | 'sphere'

export interface CrochetProgram {
  name: string
  /** The working stitch (one stitch per program for now — mixed-stitch rows
   *  are the pattern engine's next step, the builders already take per-op ids). */
  stitch: StitchId
  form: ProgramForm
  /** flat: foundation chain length. */
  foundation?: number
  /** flat: per-row shaping ops in WORK order (the precise form). */
  rows?: ShapeOp[][]
  /** disc/sphere: stitches per round. disc grows +6/round (magic-ring flat
   *  circle); sphere follows the canonical ball recipe (±6 per round). */
  rounds?: number[]
}

/** UK chart symbol → loom stitch id (the loom is US-internal). */
export const CHART_SYMBOL_TO_STITCH: Record<string, StitchId> = {
  chain: 'ch',
  'slip-stitch': 'slst',
  'double-crochet-uk': 'sc',
  'half-treble': 'hdc',
  treble: 'dc',
  'double-treble': 'tr',
  'triple-treble': 'dtr',
}

/** Loom stitch id → UK written abbreviation (the content pipeline's terms). */
const STITCH_TO_UK: Record<string, string> = {
  ch: 'ch',
  slst: 'sl st',
  sc: 'dc', // UK double crochet = US single crochet
  hdc: 'htr',
  dc: 'tr',
  tr: 'dtr',
  dtr: 'trtr',
}

const UK_DEC: Record<string, string> = {
  sc: 'dc2tog',
  hdc: 'htr2tog',
  dc: 'tr2tog',
}

/** Compile the program to relaxed, AUDITABLE loom geometry. The caller runs
 *  the audit + render through the normal pipeline — this only builds. */
export function compileProgram(p: CrochetProgram, yarnRadiusMm: number): BuiltContinuous {
  if (p.form === 'flat') {
    if (!p.foundation || !p.rows) throw new Error(`${p.name}: flat needs foundation + rows`)
    return buildShaped(p.stitch, p.rows, p.foundation, yarnRadiusMm)
  }
  if (!p.rounds || p.rounds.length === 0) throw new Error(`${p.name}: ${p.form} needs rounds`)
  if (p.form === 'disc') return buildRounds(p.stitch, p.rounds, yarnRadiusMm)
  // sphere: the builder validates the counts follow the ball recipe.
  return buildSphere(p.stitch, 0, yarnRadiusMm, p.rounds)
}

/** Recover a program from the product's stored ChartDefinition-shaped data.
 *  Shaping is derived from consecutive round/row counts using the same
 *  even-distribution convention real patterns (and roundOps) use. Only
 *  single-stitch charts compile for now — the first mixed symbol throws
 *  rather than silently mis-building. */
export function programFromChart(chart: {
  title?: string
  layout: 'round' | 'flat'
  rounds?: { roundNumber: number; stitches: { symbol: string; count?: number }[] }[]
  rows?: { rowNumber: number; stitches: { symbol: string; count?: number }[] }[]
}): CrochetProgram {
  const name = chart.title ?? 'untitled-pattern'
  const groups = chart.layout === 'round' ? chart.rounds : chart.rows
  if (!groups || groups.length === 0) throw new Error(`${name}: chart has no rounds/rows`)

  let stitch: StitchId | null = null
  const counts: number[] = []
  for (const g of groups) {
    let n = 0
    for (const s of g.stitches) {
      if (s.symbol === 'magic-ring') continue // the anchor, not a worked stitch
      const id = CHART_SYMBOL_TO_STITCH[s.symbol]
      if (!id) throw new Error(`${name}: chart symbol '${s.symbol}' has no loom mapping yet`)
      if (id === 'ch' || id === 'slst') continue // turning/joining chains don't consume the round
      if (stitch === null) stitch = id
      if (id !== stitch) throw new Error(`${name}: mixed stitches (${stitch} + ${id}) — the program layer is single-stitch for now`)
      n += s.count ?? 1
    }
    counts.push(n)
  }
  if (!stitch) throw new Error(`${name}: no worked stitches found`)

  if (chart.layout === 'round') {
    // Disc if it grows +6 every round from 6 (the flat-circle recipe);
    // sphere if it rises then falls (the ball recipe).
    const isDisc = counts.every((c, i) => c === 6 * (i + 1))
    return { name, stitch, form: isDisc ? 'disc' : 'sphere', rounds: counts }
  }
  // flat: derive each row's ops from its count vs the row below.
  const foundation = counts[0]!
  const rows: ShapeOp[][] = []
  for (let i = 0; i < counts.length; i++) {
    const prev = i === 0 ? foundation : counts[i - 1]!
    rows.push(roundOps(prev, counts[i]!, (i % 2) * 0.5))
  }
  return { name, stitch, form: 'flat', foundation, rows }
}

/** Emit the locked-template written instructions (UK terms; repeats as
 *  `[...] N times`; every line ends with its `(N sts)` count). */
export function writeInstructions(p: CrochetProgram): string[] {
  const uk = STITCH_TO_UK[p.stitch] ?? p.stitch
  const out: string[] = []

  if (p.form === 'flat') {
    out.push(`Foundation: ch ${p.foundation! + 1}. (${p.foundation} sts)`)
    let below = p.foundation!
    p.rows!.forEach((ops, i) => {
      const made = ops.reduce((a, o) => a + (o === 'inc' ? 2 : o === 'skip' ? 0 : 1), 0)
      out.push(`Row ${i + 1}: ch 1, turn, ${describeOps(ops, uk)}. (${made} sts)`)
      below = made
    })
    out.push('Fasten off and weave in the end.')
    return out
  }

  out.push(`Round 1: ${p.rounds![0]} ${uk} into a magic ring. (${p.rounds![0]} sts)`)
  for (let i = 1; i < p.rounds!.length; i++) {
    const prev = p.rounds![i - 1]!
    const cur = p.rounds![i]!
    out.push(`Round ${i + 1}: ${describeRound(prev, cur, uk)}. (${cur} sts)`)
  }
  out.push(
    p.form === 'sphere'
      ? 'Stuff firmly, then fasten off, thread the tail through the final round and draw the opening closed.'
      : 'Fasten off and weave in the end.',
  )
  return out
}

function describeOps(ops: ShapeOp[], uk: string): string {
  // Group the work-order ops into the pattern's repeat notation.
  const runs: string[] = []
  let i = 0
  while (i < ops.length) {
    const op = ops[i]!
    let n = 1
    while (i + n < ops.length && ops[i + n] === op) n++
    if (op === 'st') runs.push(`${uk} in next ${n === 1 ? 'st' : `${n} sts`}`)
    else if (op === 'inc') runs.push(n === 1 ? `2 ${uk} in next st` : `[2 ${uk} in next st] ${n} times`)
    else if (op === 'dec') runs.push(n === 1 ? (UK_DEC[uk === 'dc' ? 'sc' : uk] ?? `${uk}2tog`) : `[${UK_DEC['sc'] ?? `${uk}2tog`}] ${n} times`)
    else runs.push(`${op} ×${n}`)
    i += n
  }
  return runs.join(', ')
}

function describeRound(prev: number, cur: number, uk: string): string {
  if (cur === prev) return `${uk} in each st around`
  if (cur > prev) {
    const inc = cur - prev
    if (inc === prev) return `2 ${uk} in each st around`
    const per = Math.floor(prev / inc) - 1
    return `[${uk} in next ${per === 1 ? 'st' : `${per} sts`}, 2 ${uk} in next st] ${inc} times`
  }
  const dec = prev - cur
  const decName = uk === 'dc' ? 'dc2tog' : `${uk}2tog`
  if (dec === cur) return `${decName} around`
  const per = Math.floor(cur / dec) - 1
  return `[${uk} in next ${per === 1 ? 'st' : `${per} sts`}, ${decName}] ${dec} times`
}

/** The proof programs — the swatches the engine already renders, now expressed
 *  as PATTERNS. The regression test asserts these compile to geometry that
 *  passes the same audit as the recipe-built versions. */
export const PROOF_PROGRAMS: Record<string, CrochetProgram> = {
  'proof-disc': {
    name: 'proof-disc',
    stitch: 'sc',
    form: 'disc',
    rounds: SWATCH_RECIPES.mrdisc.roundCounts!,
  },
  'proof-ball': {
    name: 'proof-ball',
    stitch: 'sc',
    form: 'sphere',
    // the canonical ball at equator 30 — mirrors what buildSphere derives itself
    rounds: [6, 12, 18, 24, 30, 30, 30, 30, 30, 24, 18, 12, 6],
  },
  'proof-trapezoid': {
    name: 'proof-trapezoid',
    stitch: 'sc',
    form: 'flat',
    foundation: SWATCH_RECIPES.scdec.auditW,
    rows: SWATCH_RECIPES.scdec.shapeRows!,
  },
}
