/**
 * Outline (back-stitch) tests — synthetic grids, one per thing the derivation
 * has to get right, plus the lane/style mode rule.
 *
 *   cd apps/web && pnpm exec tsx src/lib/studio/generation/bulk/outline.test.ts
 */

import assert from 'node:assert/strict'
import { parsePatternData, type PatternData, type PatternCell, type PaletteEntry } from '@homemade/db'
import { clearBackground } from './bare-fabric'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import {
  deriveBackstitch,
  embellishChart,
  outlineModeFor,
  outlineLengthCap,
  looksLikeLineWork,
  MIN_EDGE_DELTA_E,
} from './outline'

type PassFail = { name: string; passed: boolean; detail?: string }
const results: PassFail[] = []

function record(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: err instanceof Error ? err.message : String(err) })
  }
}

// ─── Palette ───────────────────────────────────────────────────────────────

function entry(symbol: string, code: string, name: string, rgb: string): PaletteEntry {
  return { symbol, brand: 'DMC', code, name, rgb, strandsFullCross: 2, strandsBackstitch: 1 }
}

const RED = entry('X', '321', 'Red', '#bd1136')
const BLUE = entry('O', '336', 'Navy blue', '#0c275e')
const DARK = entry('#', '3371', 'Black brown', '#1e1108')
/** Two flosses a stitcher could not tell apart across a room. */
const RED2 = entry('x', '304', 'Medium red', '#c21c3c')
const PINK = entry('P', '3716', 'Pale pink', '#f6c3c8')
const CREAM = entry('c', '746', 'Off white', '#faf2d5')

/** Build a chart from an ASCII picture — a space is bare fabric. */
function chart(rows: string[], palette: PaletteEntry[]): PatternData {
  const height = rows.length
  const width = Math.max(...rows.map((r) => r.length))
  const cells: PatternCell[] = []
  rows.forEach((row, y) => {
    for (let x = 0; x < width; x++) {
      const s = row[x] ?? ' '
      if (s !== ' ') cells.push({ x, y, s })
    }
  })
  return {
    schemaVersion: 1,
    type: 'CROSS_STITCH',
    grid: { width, height, cells, backstitch: [], frenchKnots: [], beads: [] },
    palette,
    fabric: { count: 14, colourRgb: '#FCFAF6', type: 'Aida' },
    metadata: {},
  }
}

/** A w x h solid block of one symbol, inset by `pad` in a bare grid. */
function block(symbol: string, w: number, h: number, pad: number, palette: PaletteEntry[]): PatternData {
  const rows: string[] = []
  for (let y = 0; y < h + pad * 2; y++) {
    rows.push(
      y < pad || y >= h + pad
        ? ' '.repeat(w + pad * 2)
        : ' '.repeat(pad) + symbol.repeat(w) + ' '.repeat(pad),
    )
  }
  return chart(rows, palette)
}

function totalLength(data: PatternData): number {
  return data.grid.backstitch.reduce((a, s) => a + Math.hypot(s.x2 - s.x1, s.y2 - s.y1), 0)
}

// ─── The silhouette ────────────────────────────────────────────────────────

record('silhouette: a solid block is outlined once round its edge', () => {
  const data = block('X', 10, 10, 3, [RED, DARK])
  const out = deriveBackstitch(data, { mode: 'silhouette' })
  assert.equal(out.segments, 4, `expected 4 sides, got ${out.segments}`)
  assert.equal(Math.round(totalLength(out.data)), 40)
  // Every segment sits on the block's boundary corners.
  for (const s of out.data.grid.backstitch) {
    for (const v of [s.x1, s.x2]) assert.ok(v === 3 || v === 13, `x ${v} off the block edge`)
    for (const v of [s.y1, s.y2]) assert.ok(v === 3 || v === 13, `y ${v} off the block edge`)
  }
})

record('silhouette: the outline is worked in the palette dark, not a new floss', () => {
  const out = deriveBackstitch(block('X', 10, 10, 3, [RED, DARK]), { mode: 'silhouette' })
  assert.equal(out.addedSymbols.length, 0)
  assert.ok(out.data.grid.backstitch.every((s) => s.s === DARK.symbol))
})

record('silhouette: a pastel palette gets one dark floss added, with a free symbol', () => {
  const out = deriveBackstitch(block('P', 10, 10, 3, [PINK, CREAM]), { mode: 'silhouette' })
  assert.equal(out.addedSymbols.length, 1)
  const added = out.data.palette.find((p) => p.symbol === out.addedSymbols[0])
  assert.ok(added, 'the added floss is in the palette')
  assert.ok(!['P', 'c'].includes(added!.symbol), 'the added symbol is not already taken')
  assert.equal(out.data.palette.length, 3)
  parsePatternData(out.data)
})

record('silhouette: a lone speck is never drawn round', () => {
  const data = chart(
    [
      '          ',
      '  XXXXXX  ',
      '  XXXXXX  ',
      '  XXXXXX  ',
      '          ',
      '        X ',
      '          ',
    ],
    [RED, DARK],
  )
  const out = deriveBackstitch(data, { mode: 'silhouette' })
  for (const s of out.data.grid.backstitch) {
    assert.ok(s.y1 <= 4 && s.y2 <= 4, 'the speck at (8,5) was outlined')
  }
})

// ─── Internal edges ────────────────────────────────────────────────────────

const HALVES = [
  '                ',
  '  XXXXXXOOOOOO  ',
  '  XXXXXXOOOOOO  ',
  '  XXXXXXOOOOOO  ',
  '  XXXXXXOOOOOO  ',
  '  XXXXXXOOOOOO  ',
  '  XXXXXXOOOOOO  ',
  '                ',
]

record('full: a strong internal boundary is stitched', () => {
  const out = deriveBackstitch(chart(HALVES, [RED, BLUE, DARK]), { mode: 'full' })
  const internal = out.data.grid.backstitch.filter((s) => s.x1 === 8 && s.x2 === 8)
  assert.equal(internal.length, 1, 'the red/blue join is one long line')
  assert.equal(Math.abs(internal[0]!.y2 - internal[0]!.y1), 6)
})

record('silhouette: the same internal boundary is left alone', () => {
  const out = deriveBackstitch(chart(HALVES, [RED, BLUE, DARK]), { mode: 'silhouette' })
  assert.equal(out.data.grid.backstitch.filter((s) => s.x1 === 8 && s.x2 === 8).length, 0)
})

record('full: two flosses a stitcher cannot tell apart are not divided by a line', () => {
  const rows = HALVES.map((r) => r.replace(/O/g, 'x'))
  const out = deriveBackstitch(chart(rows, [RED, RED2, DARK]), { mode: 'full' })
  assert.equal(out.data.grid.backstitch.filter((s) => s.x1 === 8 && s.x2 === 8).length, 0)
})

record('full: a small blob of shading inside a region is not outlined', () => {
  const rows = [
    '                ',
    '  XXXXXXXXXXXX  ',
    '  XXXXXXXXXXXX  ',
    '  XXXXXOOXXXXX  ',
    '  XXXXXOOXXXXX  ',
    '  XXXXXXXXXXXX  ',
    '  XXXXXXXXXXXX  ',
    '                ',
  ]
  const out = deriveBackstitch(chart(rows, [RED, BLUE, DARK]), { mode: 'full' })
  const inside = out.data.grid.backstitch.filter(
    (s) => s.x1 > 2 && s.x2 < 14 && s.y1 > 1 && s.y2 < 7,
  )
  assert.equal(inside.length, 0, 'the four-cell blob was outlined')
})

record('the grid edge is never mistaken for a silhouette', () => {
  // Full coverage: every cell stitched, two colours meeting down the middle.
  const rows: string[] = []
  for (let y = 0; y < 20; y++) rows.push('X'.repeat(10) + 'O'.repeat(10))
  // The fragment floor is off here: one join across a toy chart is a fragment by
  // design, and this case is about WHERE the line lands, not whether it is worth
  // stitching.
  const out = deriveBackstitch(chart(rows, [RED, BLUE, DARK]), { mode: 'full', minShareOfCap: 0 })
  for (const s of out.data.grid.backstitch) {
    const onEdge =
      (s.x1 === 0 && s.x2 === 0) ||
      (s.x1 === 20 && s.x2 === 20) ||
      (s.y1 === 0 && s.y2 === 0) ||
      (s.y1 === 20 && s.y2 === 20)
    assert.ok(!onEdge, 'the chart was framed in back-stitch instead of outlined')
  }
  assert.ok(out.segments > 0, 'the join down the middle is still stitched')
})

record('a boundary that jitters cell by cell is not stitched at all', () => {
  // The painterly case: two colours meeting along an edge that wanders one cell
  // at a time. There is no line there to work, and drawing one is a scribble.
  const rows: string[] = []
  const wobble = [0, 1, -1, 2, 0, 1, -1, 0, 2, -1, 1, 0, -1, 2, 1, -1, 0, 1, -1, 2]
  for (let y = 0; y < 20; y++) {
    const cut = 10 + (wobble[y] ?? 0)
    rows.push('X'.repeat(cut) + 'O'.repeat(20 - cut))
  }
  const out = deriveBackstitch(chart(rows, [RED, BLUE, DARK]), { mode: 'full' })
  assert.equal(out.segments, 0, 'a jittering boundary was outlined')
})

record('a straight boundary in the same chart IS stitched', () => {
  const rows: string[] = []
  for (let y = 0; y < 20; y++) rows.push('X'.repeat(10) + 'O'.repeat(10))
  const out = deriveBackstitch(chart(rows, [RED, BLUE, DARK]), { mode: 'full', minShareOfCap: 0 })
  assert.ok(out.segments > 0)
})

record('one stray line in a big chart is a fragment, and is dropped', () => {
  // Twenty cells of drawable edge in a four-hundred-cell chart. A line there
  // reads as something somebody forgot to rub out, not as an outline.
  const rows: string[] = []
  for (let y = 0; y < 20; y++) rows.push('X'.repeat(10) + 'O'.repeat(10))
  const out = deriveBackstitch(chart(rows, [RED, BLUE, DARK]), { mode: 'full' })
  assert.equal(out.segments, 0)
  assert.match(out.reason, /fragment/)
})

// ─── Diagonals ─────────────────────────────────────────────────────────────

record('a staircase boundary is stitched as diagonals, not brickwork', () => {
  const rows = [
    '            ',
    '  X         ',
    '  XX        ',
    '  XXX       ',
    '  XXXX      ',
    '  XXXXX     ',
    '  XXXXXX    ',
    '  XXXXXXX   ',
    '            ',
  ]
  const out = deriveBackstitch(chart(rows, [RED, DARK]), { mode: 'silhouette' })
  const diagonals = out.data.grid.backstitch.filter(
    (s) => s.x1 !== s.x2 && s.y1 !== s.y2,
  )
  assert.ok(diagonals.length >= 1, 'the hypotenuse is stitched as diagonals')
  for (const d of diagonals) {
    assert.equal(Math.abs(d.x2 - d.x1), Math.abs(d.y2 - d.y1), 'a diagonal runs at 45 degrees')
  }
  // ...and the whole staircase comes back as ONE line, not eight little ones.
  const longest = Math.max(...diagonals.map((d) => Math.abs(d.x2 - d.x1)))
  assert.ok(longest >= 3, `the diagonals were not merged — longest run ${longest}`)
})

// ─── The cap ───────────────────────────────────────────────────────────────

record('the cap keeps a busy chart an outline rather than a scribble', () => {
  // Alternating 4-cell stripes of two strongly different colours: every join is
  // a real edge, so without the cap the whole grid fills with line.
  const rows: string[] = []
  for (let y = 0; y < 40; y++) {
    let row = ''
    for (let x = 0; x < 40; x++) row += Math.floor(x / 4) % 2 === 0 ? 'X' : 'O'
    rows.push(row)
  }
  const data = chart(rows, [RED, BLUE, DARK])
  const out = deriveBackstitch(data, { mode: 'full' })
  const cap = outlineLengthCap(data.grid.cells.length)
  const everyJoin = 9 * 40 + 160
  assert.ok(cap < everyJoin, 'the cap has to bite on a chart like this')
  assert.ok(totalLength(out.data) <= cap + 0.001, `${totalLength(out.data)} over the cap ${cap}`)
  assert.ok(out.segments > 0, 'but it still gets some outline')
})

// ─── Housekeeping ──────────────────────────────────────────────────────────

record('the derivation never mutates the chart it was given', () => {
  const data = block('X', 10, 10, 3, [RED, DARK])
  deriveBackstitch(data, { mode: 'silhouette' })
  assert.equal(data.grid.backstitch.length, 0)
  assert.equal(data.palette.length, 2)
})

record('running it twice adds nothing the second time', () => {
  const once = deriveBackstitch(block('X', 10, 10, 3, [RED, DARK]), { mode: 'silhouette' })
  const twice = deriveBackstitch(once.data, { mode: 'silhouette' })
  assert.equal(twice.segments, 0)
  assert.equal(twice.data.grid.backstitch.length, once.data.grid.backstitch.length)
})

record('the outlined chart still validates against the schema', () => {
  const out = deriveBackstitch(chart(HALVES, [RED, BLUE, DARK]), { mode: 'full' })
  const parsed = parsePatternData(out.data)
  assert.ok(parsed.grid.backstitch.length > 0)
})

record('mode none leaves the chart exactly as it was', () => {
  const data = chart(HALVES, [RED, BLUE, DARK])
  const out = deriveBackstitch(data, { mode: 'none' })
  assert.equal(out.segments, 0)
  assert.equal(out.data, data)
})

record('an empty chart is left alone', () => {
  const data = chart(['    ', '    '], [RED])
  assert.equal(deriveBackstitch(data, { mode: 'full' }).segments, 0)
})

record('the delta-E floor is the published constant', () => {
  assert.equal(MIN_EDGE_DELTA_E, 26)
})

// ─── The mode rule ─────────────────────────────────────────────────────────

record('mode: Delft and blackwork are line work already', () => {
  const data = chart(HALVES, [RED, BLUE, DARK])
  assert.equal(outlineModeFor(data, { shelf: 'monochrome' }).mode, 'none')
  // Two colours beside the white, whatever the shelf says.
  assert.equal(outlineModeFor(chart(HALVES, [RED, BLUE]), {}).mode, 'none')
  // Delft: one blue in five shades on white. More than three colours, but not a
  // picture — and a line through it would add nothing.
  const delft = [
    entry('1', '3750', 'Antique blue vy dk', '#3a5b74'),
    entry('2', '311', 'Navy medium', '#1c5174'),
    entry('3', '322', 'Baby blue dark', '#5c86a8'),
    entry('4', '3325', 'Baby blue light', '#b7cfe3'),
    entry('5', '775', 'Baby blue vy lt', '#dbe9f2'),
    entry('.', 'B5200', 'Snow white', '#ffffff'),
  ]
  assert.equal(looksLikeLineWork(chart(HALVES, delft)).yes, true)
  assert.equal(outlineModeFor(chart(HALVES, delft), { style: 'cute' }).mode, 'none')
  // Blackwork: greys only.
  const grey = [
    entry('1', '310', 'Black', '#1c1c1c'),
    entry('2', '413', 'Pewter grey dark', '#565656'),
    entry('3', '415', 'Pearl grey', '#c4c4c4'),
    entry('4', '318', 'Steel grey light', '#9d9d9d'),
    entry('.', 'B5200', 'Snow white', '#ffffff'),
  ]
  assert.equal(looksLikeLineWork(chart(HALVES, grey)).yes, true)
})

record('mode: the dense showpiece tier is left alone', () => {
  const palette = Array.from({ length: 8 }, (_, i) =>
    entry(String.fromCharCode(65 + i), `${100 + i}`, `Colour ${i}`, '#123456'),
  )
  const data = chart(HALVES, [RED, BLUE, DARK, ...palette])
  assert.equal(outlineModeFor(data, { lane: 'dense', style: 'showpiece' }).mode, 'none')
  assert.equal(outlineModeFor(data, { lane: 'large', style: 'showpiece' }).mode, 'none')
})

record('mode: bold flat lanes get the full outline, soft lanes the silhouette', () => {
  const palette = Array.from({ length: 8 }, (_, i) =>
    entry(String.fromCharCode(65 + i), `${100 + i}`, `Colour ${i}`, '#123456'),
  )
  const data = chart(HALVES, [RED, BLUE, DARK, ...palette])
  assert.equal(outlineModeFor(data, { lane: 'small', style: 'cute' }).mode, 'full')
  assert.equal(outlineModeFor(data, { lane: 'small', style: 'bright' }).mode, 'full')
  assert.equal(outlineModeFor(data, { lane: 'medium', style: 'botanical' }).mode, 'silhouette')
  assert.equal(outlineModeFor(data, { lane: 'medium', style: 'pastel' }).mode, 'silhouette')
})

record('mode: a chart that already has back-stitch is never re-outlined', () => {
  const out = deriveBackstitch(chart(HALVES, [RED, BLUE, DARK]), { mode: 'full' })
  assert.equal(outlineModeFor(out.data, { style: 'cute' }).mode, 'none')
})

// ─── The pass as a whole ───────────────────────────────────────────────────

record('embellish: knots are worked before the outline goes over them', () => {
  const rows = [
    '                ',
    '  XXXXXXXXXXXX  ',
    '  XXXXXXXXXXXX  ',
    '  XXXXX#XXXXXX  ',
    '  XXXXXXXXXXXX  ',
    '  XXXXXXXXXXXX  ',
    '  XXXXXXXXXXXX  ',
    '                ',
  ]
  const out = embellishChart(chart(rows, [RED, DARK, BLUE, PINK]), { style: 'cute' })
  assert.equal(out.mode, 'full')
  assert.equal(out.frenchKnots, 1)
  assert.ok(out.backstitchSegments > 0)
  // The knot's cell was refilled with the field colour, so the outline never
  // saw a one-cell region to draw round.
  assert.ok(out.data.grid.cells.every((c) => c.s === RED.symbol))
  parsePatternData(out.data)
})

record('embellish: a chart the rule says no to comes back untouched', () => {
  const data = chart(HALVES, [RED, BLUE])
  const out = embellishChart(data, { shelf: 'monochrome' })
  assert.equal(out.mode, 'none')
  assert.equal(out.unchanged, true)
  assert.equal(out.data, data)
})

// ─── Pipeline order ────────────────────────────────────────────────────────

/**
 * A motif on a stitched white background — the fault the bare-fabric pass
 * exists for. The order the converter runs these two in is load-bearing.
 */
const ON_WHITE = [
  '..............',
  '..............',
  '....XXXXXX....',
  '....XXXXXX....',
  '....XXXXXX....',
  '....XXXXXX....',
  '..............',
  '..............',
]
const WHITE = entry('.', 'B5200', 'Snow white', '#ffffff')

record('order: bare fabric is cleared first, so the silhouette is the motif', () => {
  const cleared = clearBackground(chart(ON_WHITE, [WHITE, RED, DARK]))
  assert.ok(cleared.removed > 0, 'the white ground goes')
  const out = deriveBackstitch(cleared.data, { mode: 'silhouette' })
  assert.equal(out.segments, 4)
  for (const s of out.data.grid.backstitch) {
    for (const v of [s.x1, s.x2]) assert.ok(v === 4 || v === 10, `x ${v} is not on the motif`)
    for (const v of [s.y1, s.y2]) assert.ok(v === 2 || v === 6, `y ${v} is not on the motif`)
  }
})

record('order: outlining first would draw round the white ground instead', () => {
  // The wrong order, asserted so nobody quietly swaps the two steps: with the
  // background still stitched, the only silhouette is the edge of the grid.
  const out = deriveBackstitch(chart(ON_WHITE, [WHITE, RED, DARK]), { mode: 'silhouette' })
  const onTheMotif = out.data.grid.backstitch.filter(
    (s) => (s.x1 === 4 || s.x1 === 10) && s.y1 >= 2 && s.y1 <= 6,
  )
  assert.equal(onTheMotif.length, 0, 'the motif edge is invisible while the ground is stitched')
})

record('order: a chart cleared and then outlined keeps a valid palette', () => {
  const cleared = clearBackground(chart(ON_WHITE, [WHITE, RED, DARK]))
  const out = embellishChart(cleared.data, { style: 'cute' })
  parsePatternData(out.data)
})

// ─── The renderer draws it ─────────────────────────────────────────────────

record('the beauty render draws the back-stitch and the knots', () => {
  const rows = [
    '                ',
    '  XXXXXXXXXXXX  ',
    '  XXXXXXXXXXXX  ',
    '  XXXXX#XXXXXX  ',
    '  XXXXXXXXXXXX  ',
    '  XXXXXXXXXXXX  ',
    '  XXXXXXXXXXXX  ',
    '                ',
  ]
  const out = embellishChart(chart(rows, [RED, DARK, BLUE, PINK]), { style: 'cute' })
  assert.ok(out.backstitchSegments > 0 && out.frenchKnots > 0)
  const svg = renderPatternSvgString(out.data, {
    mode: 'beauty',
    cellPx: 16,
    showSymbols: false,
    showGrid: false,
    showCentreCrosshairs: false,
  })
  // One path per outline colour, and a disc per knot.
  assert.ok(svg.includes('stroke-linecap="round" fill="none"'), 'no back-stitch layer in the render')
  assert.ok(/<circle /.test(svg), 'no French knot in the render')
  // The line is drawn at worked-thread weight, not as a hairline.
  const widths = [...svg.matchAll(/stroke-width="([\d.]+)"/g)].map((m) => Number(m[1]))
  assert.ok(widths.some((w) => w >= 16 * 0.14), 'the back-stitch is too thin to see')
})

// ─── Report ────────────────────────────────────────────────────────────────

const failed = results.filter((r) => !r.passed)
for (const r of results) {
  console.log(`${r.passed ? 'PASS' : 'FAIL'}: ${r.name}`)
  if (!r.passed && r.detail) console.log(`     ${r.detail}`)
}
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length > 0) process.exit(1)
