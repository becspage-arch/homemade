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

import { SWATCH_RECIPES, SHELL_N, type StitchId, type ShapeOp } from './dictionary'
import { buildShaped, buildRounds, buildSphere, roundOps } from './shaping'
import { buildContinuous, type BuiltContinuous } from './yarnPath'

/** The fabric forms the loom can build from a program.
 *  - 'flat'   — a shaped, single-stitch flat piece (variable-width rows: incs /
 *               decs / shells). Trapezoids, triangles, C2C. (buildShaped)
 *  - 'grid'   — a fixed-width flat piece whose rows can MIX stitch types per
 *               row (post ribbing, blo ridges, moss / textured rectangles).
 *               Every row is `gridWidth` stitches. (buildContinuous + stitchAt)
 *  - 'disc'   — a flat circle worked in the round off a magic ring. (buildRounds)
 *  - 'sphere' — an amigurumi ball. (buildSphere) */
export type ProgramForm = 'flat' | 'grid' | 'disc' | 'sphere'

/** Real yarn weights → yarn RADIUS in mm (the loom's `yr` knob). One program
 *  renders at any weight; the same stitch program is fine / worsted / bulky just
 *  by swapping this. Radii are half the nominal strand thickness of each weight. */
export type YarnWeight = 'lace' | 'fine' | 'sport' | 'dk' | 'worsted' | 'aran' | 'bulky' | 'super-bulky'

export const YARN_WEIGHT_RADIUS_MM: Record<YarnWeight, number> = {
  lace: 1.0,
  fine: 1.3,
  sport: 1.7,
  dk: 1.9,
  worsted: 2.1,
  aran: 2.4,
  bulky: 3.0,
  'super-bulky': 3.8,
}

/** One row of a 'grid' program — a full-width row whose cells may be different
 *  stitch types (mixed stitches per row). `stitches.length` must equal the
 *  program's `gridWidth`. Colour is optional and STORED for the pattern engine's
 *  colourwork step; the current base render is single-colour (stripes / colourwork
 *  rendering is the next build — the schema + program carry the data now so there
 *  is no backfill later). */
export interface GridRow {
  /** Per-cell stitch id in WORK order, left→right in the fabric frame. */
  stitches: StitchId[]
  /** Whole-row colour (a stripe) — a key into the program `palette`. */
  colourKey?: string
  /** Per-CELL colour keys (parallel to `stitches`, left→right in the fabric
   *  frame) — tapestry / intarsia colourwork, where the colour changes within a
   *  row. Each entry is a key into the program `palette`; a missing entry falls
   *  back to `colourKey`, then the base colour. When present, this drives a
   *  per-(row, column) render colour. Render-only (the geometry is unchanged). */
  cellColours?: string[]
}

export interface CrochetProgram {
  name: string
  form: ProgramForm

  /** The working stitch for the single-stitch forms (flat / disc / sphere).
   *  Ignored by 'grid' (each cell carries its own stitch). */
  stitch?: StitchId

  /** flat: foundation chain length. */
  foundation?: number
  /** flat: per-row shaping ops in WORK order (the precise form). */
  rows?: ShapeOp[][]

  /** grid: the mixed-stitch rows (each `gridWidth` wide). */
  grid?: GridRow[]
  /** grid: stitches per row (constant width). */
  gridWidth?: number
  /** grid: column-spacing (gauge) override in yarn radii, when the pattern packs
   *  tighter/looser than the driving stitch's default — e.g. 1×1 post rib packs
   *  its columns to 1.5 (the locked postrib swatch value) so the ribs touch. */
  gaugeYr?: number

  /** disc/sphere: stitches per round. disc grows +6/round (magic-ring flat
   *  circle); sphere follows the canonical ball recipe (±6 per round). */
  rounds?: number[]

  // ── Yarn, colour, sizing — everything a stored pattern needs to render + list.
  //    All optional so the existing single-stitch proofs stay valid; a real
  //    stored pattern fills them in.

  /** Yarn weight → the render `yr`. Defaults to worsted when a caller omits an
   *  explicit radius. */
  yarnWeight?: YarnWeight
  /** Base yarn colour (hex). The render's default single colour. */
  colourHex?: string
  /** Colour palette: key → hex, for `GridRow.colourKey` stripes / colourwork. */
  palette?: Record<string, string>
  /** Per-row colour keys for the shaped 'flat' form (stripes) — the grid form
   *  carries colour on each `GridRow` instead. Stored now; rendered next build. */
  rowColours?: string[]
  /** Human gauge line ("12 sc x 14 rows = 10 cm"). */
  gaugeText?: string
  /** Finished dimensions in mm (for the catalogue + the schematic). */
  finishedSizeMm?: { width: number; height: number }
  /** Recommended hook size in mm. */
  hookMm?: number
  /** Free-text designer notes (construction hints, blocking, edging). */
  notes?: string

  /** Finished-object staging (Part C, STITCH_ENGINE.md §8e-2/§8e-3) — how a real
   *  stored pattern's OWN hero should present it (render-on-publish and the
   *  publish batch both read this when a caller doesn't force a different one).
   *  Proof scripts still get their per-name override from `loom-pattern.ts`'s
   *  `PROOF_STAGING` map; this field is what lets a program that ISN'T a named
   *  proof (a real customer pattern) carry its own staging choice. Render/
   *  staging only: not part of the geometry, never reaches the geometry hash.
   *  Default 'swatch' (the stitch-proof crop). */
  staging?: Staging

  /** Minimum camera field of view (mm, across the frame's SHORTER side) for a
   *  finished-object staging (`flatlay` / `loop` / `flatband` — never `swatch`,
   *  the stitch-proof macro crop). A real product photo holds one consistent
   *  SCALE regardless of how small the object is — a coaster sits in the frame
   *  with white space round it, it does not fill the frame the way a dishcloth
   *  does. Without a floor, a small finished object is framed exactly as tight
   *  as a large one (the margin logic scales with the object, not against an
   *  absolute size), so a 58mm ball reads ~40× life-size while a 101mm bear in
   *  the same fabric reads at product scale. Defaults to 160 (mm) in the scene
   *  builder when unset; an object whose own margined frame is already wider
   *  than the floor on both axes is completely unaffected — this only ever
   *  pulls the camera BACK, never in. Render/staging only: not part of the
   *  geometry, never reaches the geometry hash. */
  minFieldMm?: number
}

/** Finished-object staging (Part C — the four-part customer bar's "staged as the
 *  finished object" leg):
 *   - `swatch`   — a tight macro crop of the fabric (the stitch-proof look).
 *   - `flatlay`  — the WHOLE piece pulled back on a clean surface with a gentle
 *     3/4 tilt + soft drape, so it reads as a finished dishcloth / panel laid out,
 *     not a fabric close-up.
 *   - `loop`     — the flat strip curled into a standing RING (a headband seamed
 *     into a loop, worn form): presentation only — the stitches are the exact
 *     same genuinely-stitched geometry, just curved along the band.
 *   - `flatband` — the flat strip laid on the ground as a PRODUCT PHOTO instead
 *     of worn/standing: a gentle in-plane S-curve (not curled into a ring, not
 *     stood on end) so a long thin strip (a headband, a belt, a tie) reads as a
 *     finished item laid out for a listing photo, ribs still reading as straight
 *     bars across the curve. Presentation only — same genuinely-stitched geometry. */
export type Staging = 'swatch' | 'flatlay' | 'loop' | 'flatband'

/** Resolve the render yarn radius (mm) for a program: an explicit override wins,
 *  else the program's yarn weight, else worsted. */
export function programYarnRadiusMm(p: CrochetProgram, override?: number): number {
  if (override != null) return override
  return YARN_WEIGHT_RADIUS_MM[p.yarnWeight ?? 'worsted']
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
  scblo: 'dc-blo', // UK dc worked in the back loop only
  scflo: 'dc-flo',
  fpdc: 'FPtr', // US front-post dc = UK front-post treble
  bpdc: 'BPtr',
  bobble: 'bobble',
  k: 'k',
}

const UK_DEC: Record<string, string> = {
  sc: 'dc2tog',
  hdc: 'htr2tog',
  dc: 'tr2tog',
}

/** Compile the program to unrelaxed loom geometry (the caller relaxes + audits +
 *  renders through the normal pipeline — this only builds the yarn path). */
export function compileProgram(p: CrochetProgram, yarnRadiusMm: number): BuiltContinuous {
  if (p.form === 'flat') {
    if (!p.foundation || !p.rows) throw new Error(`${p.name}: flat needs foundation + rows`)
    if (!p.stitch) throw new Error(`${p.name}: flat needs a stitch`)
    return buildShaped(p.stitch, p.rows, p.foundation, yarnRadiusMm)
  }
  if (p.form === 'grid') {
    if (!p.grid || p.grid.length === 0 || !p.gridWidth) throw new Error(`${p.name}: grid needs grid rows + gridWidth`)
    const W = p.gridWidth
    p.grid.forEach((r, j) => {
      if (r.stitches.length !== W)
        throw new Error(`${p.name}: grid row ${j} has ${r.stitches.length} stitches but gridWidth is ${W}`)
    })
    // Each row's HEIGHT is driven by its representative (first) stitch; each CELL
    // picks its own excursion via stitchAt. This is the proven mixed-stitch path
    // (postrib / basketweave build exactly this way). One column gauge across the
    // piece comes from the driving stitch of row 0 (or an explicit gaugeYr).
    const rowTypes = p.grid.map((r) => r.stitches[0]!)
    const stitchAt = (j: number, c: number): StitchId => p.grid![j]!.stitches[c]!
    return buildContinuous(rowTypes, W, yarnRadiusMm, { stitchAt, gaugeYr: p.gaugeYr })
  }
  if (!p.rounds || p.rounds.length === 0) throw new Error(`${p.name}: ${p.form} needs rounds`)
  if (!p.stitch) throw new Error(`${p.name}: ${p.form} needs a stitch`)
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
  const uk = STITCH_TO_UK[p.stitch ?? 'sc'] ?? p.stitch ?? 'sc'
  const out: string[] = []

  if (p.form === 'grid') {
    const W = p.gridWidth!
    out.push(`Foundation: ch ${W + 1}. (${W} sts)`)
    p.grid!.forEach((row, i) => {
      out.push(`Row ${i + 1}: ch 1, turn, ${describeGridRow(row.stitches)}. (${W} sts)`)
    })
    out.push('Fasten off and weave in the end.')
    return out
  }

  if (p.form === 'flat') {
    out.push(`Foundation: ch ${p.foundation! + 1}. (${p.foundation} sts)`)
    let _below = p.foundation!
    p.rows!.forEach((ops, i) => {
      const made = ops.reduce((a, o) => a + (o === 'inc' ? 2 : o === 'skip' ? 0 : 1), 0)
      out.push(`Row ${i + 1}: ch 1, turn, ${describeOps(ops, uk)}. (${made} sts)`)
      _below = made
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

/** Describe a mixed-stitch grid row in UK terms. A short repeating unit becomes
 *  `[FPtr, BPtr] 9 times`; otherwise run-length groups ("2 htr, 4 FPtr, 2 htr"). */
function describeGridRow(cells: StitchId[]): string {
  const n = cells.length
  const term = (id: StitchId): string => STITCH_TO_UK[id] ?? id
  // Whole-row repeat of a short (2–4 cell) mixed unit → bracket notation.
  for (let p = 2; p <= 4 && p <= n / 2; p++) {
    if (n % p !== 0) continue
    let periodic = true
    for (let i = p; i < n && periodic; i++) if (cells[i] !== cells[i - p]) periodic = false
    if (!periodic) continue
    const unit = cells.slice(0, p)
    if (unit.every((u) => u === unit[0])) break // uniform — run-length says it better
    return `[${unit.map(term).join(', ')}] ${n / p} times`
  }
  const runs: string[] = []
  let i = 0
  while (i < n) {
    const id = cells[i]!
    let run = 1
    while (i + run < n && cells[i + run] === id) run++
    runs.push(run === 1 ? `${term(id)} in next st` : `${term(id)} in next ${run} sts`)
    i += run
  }
  return runs.join(', ')
}

/** Loom stitch id → the product's crochet chart symbol key (chart-symbols.ts,
 *  craft 'crochet'). fp/bp posts have no dedicated glyph in the starter set, so
 *  they map to the treble glyph (they are dc-family posts) — the caption notes the
 *  post placement. This is the INVERSE direction of CHART_SYMBOL_TO_STITCH plus
 *  the texture stitches. */
const STITCH_TO_CHART_SYMBOL: Record<StitchId, string> = {
  ch: 'chain',
  slst: 'slip-stitch',
  sc: 'double-crochet-uk',
  hdc: 'half-treble',
  dc: 'treble',
  tr: 'double-treble',
  dtr: 'triple-treble',
  scblo: 'back-loop',
  scflo: 'front-loop',
  fpdc: 'treble',
  bpdc: 'treble',
  bobble: 'bobble',
  picot: 'picot',
  k: 'knit',
}

const CHART_STITCH_LABEL: Partial<Record<StitchId, string>> = {
  fpdc: 'FPtr',
  bpdc: 'BPtr',
}

/** Expand a shaping op into the chart symbols it PRODUCES (what the row's cells
 *  are). 'st' → 1, 'inc' → 2, 'dec' → 1, 'shell' → SHELL_N, 'skip' → 0. */
function opToSymbols(op: ShapeOp, sym: string): { symbol: string; label?: string }[] {
  const n = op === 'inc' ? 2 : op === 'shell' ? SHELL_N : op === 'skip' ? 0 : 1
  return Array.from({ length: n }, () => ({ symbol: sym }))
}

/**
 * FORWARD map — a stored program → the product's `ChartDefinition` (the shape
 * `apps/web/src/lib/craft-charts/svg-chart.tsx` renders and `CrochetPattern.
 * chartData` stores). So a stored pattern carries its Step-3 symbol chart, built
 * from the SAME program the geometry + words come from — the three can't drift.
 *
 * Emits the worked stitches per row/round as chart cells; increases/decreases
 * are conveyed by the changing per-row count (real symbol charts read the shape
 * that way). Returns a `ChartDefinition`-shaped object (typed loosely here to
 * avoid a cross-package import cycle; it validates against
 * `craft-charts/types.ts`).
 */
export function programToChart(p: CrochetProgram): {
  title: string
  layout: 'round' | 'flat'
  craft: 'crochet'
  terminologyConvention: 'uk'
  rounds?: { roundNumber: number; label?: string; stitches: { symbol: string; count?: number; label?: string }[] }[]
  rows?: { rowNumber: number; rightSide?: boolean; stitches: { symbol: string; label?: string }[] }[]
  caption?: string
} {
  const base = { title: p.name, craft: 'crochet' as const, terminologyConvention: 'uk' as const }
  const postNote = 'Front/back-post stitches are shown with the treble glyph (FPtr/BPtr).'

  if (p.form === 'disc' || p.form === 'sphere') {
    const sym = STITCH_TO_CHART_SYMBOL[p.stitch ?? 'sc']
    const rounds = p.rounds!.map((count, i) => ({
      roundNumber: i + 1,
      label: `Rnd ${i + 1}`,
      stitches:
        i === 0
          ? [{ symbol: 'magic-ring' as string }, { symbol: sym, count }]
          : [{ symbol: sym, count }],
    }))
    return {
      ...base,
      layout: 'round',
      rounds,
      caption:
        p.form === 'sphere'
          ? 'Worked in a continuous spiral; stuff before closing.'
          : 'Worked in a continuous spiral from the centre out.',
    }
  }

  // Flat / grid → a flat chart, row 1 at the bottom, RS/WS alternating.
  const rows: { rowNumber: number; rightSide?: boolean; stitches: { symbol: string; label?: string }[] }[] = []
  let usesPost = false

  if (p.form === 'grid') {
    p.grid!.forEach((row, j) => {
      const stitches = row.stitches.map((id) => {
        if (id === 'fpdc' || id === 'bpdc') usesPost = true
        return { symbol: STITCH_TO_CHART_SYMBOL[id], label: CHART_STITCH_LABEL[id] }
      })
      rows.push({ rowNumber: j + 1, rightSide: j % 2 === 0, stitches })
    })
  } else {
    // shaped flat
    const sym = STITCH_TO_CHART_SYMBOL[p.stitch ?? 'sc']
    p.rows!.forEach((ops, j) => {
      const stitches = ops.flatMap((op) => opToSymbols(op, sym))
      rows.push({ rowNumber: j + 1, rightSide: j % 2 === 0, stitches })
    })
  }

  return {
    ...base,
    layout: 'flat',
    rows,
    caption: `Read right-side rows right-to-left, wrong-side rows left-to-right.${usesPost ? ` ${postNote}` : ''}`,
  }
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
