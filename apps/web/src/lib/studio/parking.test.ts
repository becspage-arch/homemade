/**
 * Parking tests — the ordering and next-cell functions the whole feature
 * rests on.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx src/lib/studio/parking.test.ts
 *
 * Covers all three working orders, the parked-cell answer after a mark and
 * after an undo, line advancing, charts with and without back-stitch, and a
 * timed pass over a 240x255 chart with 120 colours to hold the per-mark cost
 * flat as the chart grows.
 */

import assert from 'node:assert/strict'
import { cellKey, type PatternData, type PaletteEntry } from '@homemade/db/pattern'
import { useChartStore } from '@/components/studio/chart/chart-store'
import {
  applyMark,
  buildParkingIndex,
  cellLabel,
  cellRank,
  lineBounds,
  lineCountFor,
  lineHasWork,
  lineIndexOf,
  lineLabel,
  nextColourUp,
  nextLineWithWork,
  parkedCellFor,
  parseParkingDirection,
  previousLineWithWork,
  refreshParked,
  resetProgress,
  PARKING_BLOCK_SIZE,
} from './parking'

let failures = 0
function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  ok   ${name}`)
  } catch (err) {
    failures++
    console.log(`  FAIL ${name}`)
    console.log(`       ${err instanceof Error ? err.message : String(err)}`)
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Fixtures
// ───────────────────────────────────────────────────────────────────────────

function paletteEntry(symbol: string, i: number): PaletteEntry {
  return {
    symbol,
    brand: 'DMC',
    code: String(100 + i),
    name: `Colour ${symbol}`,
    rgb: '#aabbcc',
    strandsFullCross: 2,
    strandsBackstitch: 1,
  }
}

/** Build a pattern from an ASCII picture. A dot means bare fabric. */
function patternFromRows(rows: string[]): PatternData {
  const height = rows.length
  const width = Math.max(...rows.map((r) => r.length))
  const symbols = new Set<string>()
  const cells: Array<{ x: number; y: number; s: string }> = []
  rows.forEach((row, y) => {
    ;[...row].forEach((ch, x) => {
      if (ch === '.') return
      symbols.add(ch)
      cells.push({ x, y, s: ch })
    })
  })
  return {
    schemaVersion: 1,
    type: 'CROSS_STITCH',
    grid: { width, height, cells, backstitch: [], frenchKnots: [], beads: [], fractional: [] },
    palette: [...symbols].sort().map(paletteEntry),
    fabric: { count: 14, colourRgb: '#F5EBD8', type: 'Aida' },
    metadata: {},
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Working orders
// ───────────────────────────────────────────────────────────────────────────

console.log('\nworking orders')

test('rows read left to right, top to bottom', () => {
  const w = 4
  const h = 3
  const ranks: number[] = []
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) ranks.push(cellRank(x, y, 'rows', w, h))
  assert.deepEqual(ranks, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
})

test('columns read top to bottom, left to right', () => {
  const w = 4
  const h = 3
  // Walking down column 0 then column 1 gives a strictly rising order.
  const order: number[] = []
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) order.push(cellRank(x, y, 'columns', w, h))
  for (let i = 1; i < order.length; i++) assert.ok(order[i]! > order[i - 1]!)
  // And a cell lower in the same column beats a cell in the next column.
  assert.ok(cellRank(0, 2, 'columns', w, h) < cellRank(1, 0, 'columns', w, h))
})

test('blocks finish a 10x10 square before moving on', () => {
  const w = 25
  const h = 25
  // Bottom-right of block 0 comes before top-left of block 1.
  assert.ok(cellRank(9, 9, 'blocks', w, h) < cellRank(10, 0, 'blocks', w, h))
  // Block 1 (x 10-19) comes before the block below it on the next band.
  assert.ok(cellRank(10, 0, 'blocks', w, h) < cellRank(0, 10, 'blocks', w, h))
  // Inside a block the order is rows, same as the whole-chart row order.
  assert.ok(cellRank(3, 4, 'blocks', w, h) < cellRank(4, 4, 'blocks', w, h))
  assert.ok(cellRank(9, 4, 'blocks', w, h) < cellRank(0, 5, 'blocks', w, h))
})

test('block ordering stays strictly increasing across a partial edge block', () => {
  // 25 wide is two whole blocks and one 5-wide remainder, which is where an
  // off-by-one in the block index would show up.
  const w = 25
  const h = 25
  const seen: number[] = []
  const blocksPerRow = Math.ceil(w / PARKING_BLOCK_SIZE)
  for (let by = 0; by < Math.ceil(h / PARKING_BLOCK_SIZE); by++) {
    for (let bx = 0; bx < blocksPerRow; bx++) {
      for (let dy = 0; dy < PARKING_BLOCK_SIZE; dy++) {
        for (let dx = 0; dx < PARKING_BLOCK_SIZE; dx++) {
          const x = bx * PARKING_BLOCK_SIZE + dx
          const y = by * PARKING_BLOCK_SIZE + dy
          if (x >= w || y >= h) continue
          seen.push(cellRank(x, y, 'blocks', w, h))
        }
      }
    }
  }
  for (let i = 1; i < seen.length; i++) assert.ok(seen[i]! > seen[i - 1]!, `rank ${i} did not rise`)
})

test('line index and line count agree for every direction', () => {
  const w = 25
  const h = 12
  assert.equal(lineCountFor('rows', w, h), 12)
  assert.equal(lineCountFor('columns', w, h), 25)
  assert.equal(lineCountFor('blocks', w, h), 3 * 2)
  assert.equal(lineIndexOf(7, 4, 'rows', w), 4)
  assert.equal(lineIndexOf(7, 4, 'columns', w), 7)
  assert.equal(lineIndexOf(21, 11, 'blocks', w), 1 * 3 + 2)
})

test('line bounds clamp to the grid on a partial edge block', () => {
  const w = 25
  const h = 12
  assert.deepEqual(lineBounds(3, 'rows', w, h), { x0: 0, y0: 3, x1: 24, y1: 3 })
  assert.deepEqual(lineBounds(3, 'columns', w, h), { x0: 3, y0: 0, x1: 3, y1: 11 })
  // Block 5 is the bottom-right one: 5 wide and 2 tall once clamped.
  assert.deepEqual(lineBounds(5, 'blocks', w, h), { x0: 20, y0: 10, x1: 24, y1: 11 })
})

test('labels read the way a stitcher counts, from one', () => {
  assert.equal(lineLabel(40, 'rows'), 'row 41')
  assert.equal(lineLabel(40, 'columns'), 'column 41')
  assert.equal(lineLabel(6, 'blocks'), 'block 7')
  assert.equal(cellLabel({ x: 11, y: 40 }), 'row 41, col 12')
})

test('a stored direction that is not one of ours falls back to rows', () => {
  assert.equal(parseParkingDirection('blocks'), 'blocks')
  assert.equal(parseParkingDirection('columns'), 'columns')
  assert.equal(parseParkingDirection(null), 'rows')
  assert.equal(parseParkingDirection('diagonal'), 'rows')
})

// ───────────────────────────────────────────────────────────────────────────
// Parked positions
// ───────────────────────────────────────────────────────────────────────────

console.log('\nparked positions')

const CONFETTI = patternFromRows([
  'ABA.',
  'B.CB',
  'ACAB',
  '.BCA',
])

test('a fresh chart parks every colour at its first cell in working order', () => {
  const index = buildParkingIndex(CONFETTI, 'rows')
  const stitched = new Set<string>()
  const parked = refreshParked(index, stitched)
  assert.deepEqual(pick(parked, 'A'), { x: 0, y: 0 })
  assert.deepEqual(pick(parked, 'B'), { x: 1, y: 0 })
  assert.deepEqual(pick(parked, 'C'), { x: 2, y: 1 })
})

test('marking a cell moves that colour on and leaves the others alone', () => {
  const index = buildParkingIndex(CONFETTI, 'rows')
  const stitched = new Set<string>()
  stitched.add(cellKey(0, 0))
  applyMark(index, 0, 0, true, 'A')
  const parked = refreshParked(index, stitched)
  assert.deepEqual(pick(parked, 'A'), { x: 2, y: 0 })
  assert.deepEqual(pick(parked, 'B'), { x: 1, y: 0 })
  assert.deepEqual(pick(parked, 'C'), { x: 2, y: 1 })
})

test('a finished colour parks nowhere', () => {
  const index = buildParkingIndex(CONFETTI, 'rows')
  const stitched = new Set<string>()
  for (const cell of CONFETTI.grid.cells) {
    if (cell.s !== 'C') continue
    stitched.add(cellKey(cell.x, cell.y))
    applyMark(index, cell.x, cell.y, true, 'C')
  }
  const parked = refreshParked(index, stitched)
  assert.equal(parked.has('C'), false)
  assert.ok(parked.has('A'))
})

test('the columns order parks colours down the chart, not across it', () => {
  const index = buildParkingIndex(CONFETTI, 'columns')
  const parked = refreshParked(index, new Set())
  // Column 0 top-down is A, B, A, blank — so A parks at (0,0) and B at (0,1).
  assert.deepEqual(pick(parked, 'A'), { x: 0, y: 0 })
  assert.deepEqual(pick(parked, 'B'), { x: 0, y: 1 })
  // Walking down column 1 reaches C at (1,2) before column 2's C at (2,1),
  // which is the whole difference between the two orders.
  assert.deepEqual(pick(parked, 'C'), { x: 1, y: 2 })
})

test('the block order finishes one 10x10 square before the next', () => {
  // Two colours: X only in the left block, Y only in the right one.
  const rows: string[] = []
  for (let y = 0; y < 12; y++) {
    let row = ''
    for (let x = 0; x < 20; x++) row += x < 10 ? 'X' : 'Y'
    rows.push(row)
  }
  const pattern = patternFromRows(rows)
  const index = buildParkingIndex(pattern, 'blocks')
  const parked = refreshParked(index, new Set())
  assert.deepEqual(pick(parked, 'X'), { x: 0, y: 0 })
  assert.deepEqual(pick(parked, 'Y'), { x: 10, y: 0 })
  // Next up is X, because block 0 holds only X.
  assert.equal(nextColourUp(parked), 'X')
})

test('next up is the colour parked earliest in working order', () => {
  const index = buildParkingIndex(CONFETTI, 'rows')
  const stitched = new Set<string>()
  assert.equal(nextColourUp(refreshParked(index, stitched)), 'A')
  stitched.add(cellKey(0, 0))
  applyMark(index, 0, 0, true, 'A')
  assert.equal(nextColourUp(refreshParked(index, stitched)), 'B')
})

// ───────────────────────────────────────────────────────────────────────────
// Undo
// ───────────────────────────────────────────────────────────────────────────

console.log('\nafter an undo')

test('unmarking a cell parks the colour back on it', () => {
  const index = buildParkingIndex(CONFETTI, 'rows')
  const stitched = new Set<string>()
  for (const [x, y] of [[0, 0], [2, 0]] as const) {
    stitched.add(cellKey(x, y))
    applyMark(index, x, y, true, 'A')
  }
  assert.deepEqual(pick(refreshParked(index, stitched), 'A'), { x: 0, y: 2 })

  // Undo the first mark. The cursor has to rewind, not stay where it was.
  stitched.delete(cellKey(0, 0))
  applyMark(index, 0, 0, false, 'A')
  assert.deepEqual(pick(refreshParked(index, stitched), 'A'), { x: 0, y: 0 })
})

test('unmarking a cell behind the cursor restores the earlier park', () => {
  const index = buildParkingIndex(CONFETTI, 'rows')
  const stitched = new Set<string>()
  // Finish A entirely.
  for (const cell of CONFETTI.grid.cells) {
    if (cell.s !== 'A') continue
    stitched.add(cellKey(cell.x, cell.y))
    applyMark(index, cell.x, cell.y, true, 'A')
  }
  assert.equal(refreshParked(index, stitched).has('A'), false)
  // Undo the very first A. It parks there again.
  stitched.delete(cellKey(0, 0))
  applyMark(index, 0, 0, false, 'A')
  assert.deepEqual(pick(refreshParked(index, stitched), 'A'), { x: 0, y: 0 })
})

test('a wholesale progress reset agrees with the incremental path', () => {
  const incremental = buildParkingIndex(CONFETTI, 'rows')
  const stitched = new Set<string>()
  const marks: Array<[number, number]> = [[0, 0], [1, 0], [2, 1], [3, 2], [1, 3]]
  for (const [x, y] of marks) {
    stitched.add(cellKey(x, y))
    applyMark(incremental, x, y, true)
  }
  stitched.delete(cellKey(1, 0))
  applyMark(incremental, 1, 0, false)

  // Same progress arriving whole, the way a cross-device sync delivers it.
  const synced = buildParkingIndex(CONFETTI, 'rows')
  resetProgress(synced, stitched)

  assert.deepEqual(
    [...refreshParked(incremental, stitched)].sort(cmp),
    [...refreshParked(synced, stitched)].sort(cmp),
  )
  assert.deepEqual([...incremental.lineRemaining], [...synced.lineRemaining])
})

// ───────────────────────────────────────────────────────────────────────────
// Lines
// ───────────────────────────────────────────────────────────────────────────

console.log('\nlines')

test('a line stops having work once its last square is stitched', () => {
  const index = buildParkingIndex(CONFETTI, 'rows')
  assert.equal(lineHasWork(index, 0), true)
  const stitched = new Set<string>()
  for (const [x, y] of [[0, 0], [1, 0], [2, 0]] as const) {
    stitched.add(cellKey(x, y))
    applyMark(index, x, y, true)
  }
  assert.equal(lineHasWork(index, 0), false)
  assert.equal(nextLineWithWork(index, 0), 1)
})

test('line stepping skips finished lines and wraps round', () => {
  const index = buildParkingIndex(CONFETTI, 'rows')
  const stitched = new Set<string>()
  // Finish row 1 entirely.
  for (const cell of CONFETTI.grid.cells) {
    if (cell.y !== 1) continue
    stitched.add(cellKey(cell.x, cell.y))
    applyMark(index, cell.x, cell.y, true)
  }
  assert.equal(nextLineWithWork(index, 1), 2)
  assert.equal(previousLineWithWork(index, 2), 0)
  // From the last row, forward wraps back to the first with work.
  assert.equal(nextLineWithWork(index, 3), 3)
  assert.equal(previousLineWithWork(index, 0), 3)
})

test('a finished chart leaves the line where it is', () => {
  const index = buildParkingIndex(CONFETTI, 'rows')
  const stitched = new Set<string>()
  for (const cell of CONFETTI.grid.cells) {
    stitched.add(cellKey(cell.x, cell.y))
    applyMark(index, cell.x, cell.y, true)
  }
  assert.equal(nextLineWithWork(index, 2), 2)
  assert.equal(refreshParked(index, stitched).size, 0)
})

// ───────────────────────────────────────────────────────────────────────────
// Chart shapes
// ───────────────────────────────────────────────────────────────────────────

console.log('\nchart shapes')

test('back-stitch and French knots do not touch the working order', () => {
  const bare = patternFromRows(['AB', 'BA'])
  const dressed: PatternData = {
    ...bare,
    grid: {
      ...bare.grid,
      backstitch: [{ x1: 0, y1: 0, x2: 2, y2: 0, s: 'A' }],
      frenchKnots: [{ x: 1, y: 1, s: 'B' }],
    },
  }
  const a = refreshParked(buildParkingIndex(bare, 'rows'), new Set())
  const b = refreshParked(buildParkingIndex(dressed, 'rows'), new Set())
  assert.deepEqual([...a].sort(cmp), [...b].sort(cmp))
})

test('a chart with no back-stitch at all parks normally', () => {
  const pattern = patternFromRows(['A.A', '.A.', 'A.A'])
  assert.equal(pattern.grid.backstitch.length, 0)
  const index = buildParkingIndex(pattern, 'rows')
  const parked = refreshParked(index, new Set())
  assert.deepEqual(pick(parked, 'A'), { x: 0, y: 0 })
})

test('bare fabric squares are skipped, not parked on', () => {
  const pattern = patternFromRows(['..A', '...', 'B..'])
  const index = buildParkingIndex(pattern, 'rows')
  const parked = refreshParked(index, new Set())
  assert.deepEqual(pick(parked, 'A'), { x: 2, y: 0 })
  assert.deepEqual(pick(parked, 'B'), { x: 0, y: 2 })
  // Row 1 is empty, so it never counts as work.
  assert.equal(lineHasWork(index, 1), false)
})

test('a palette colour that no square uses parks nowhere', () => {
  const pattern = patternFromRows(['AA', 'AA'])
  pattern.palette.push(paletteEntry('Z', 9))
  const index = buildParkingIndex(pattern, 'rows')
  assert.equal(refreshParked(index, new Set()).has('Z'), false)
})

// ───────────────────────────────────────────────────────────────────────────
// Cost on a showpiece chart
// ───────────────────────────────────────────────────────────────────────────

console.log('\ncost on a 240 x 255 chart with 120 colours')

test('the whole chart marks through at a flat per-mark cost', () => {
  const width = 240
  const height = 255
  const colours = 120
  const glyphs = Array.from({ length: colours }, (_, i) => `c${i}`)
  const cells: Array<{ x: number; y: number; s: string }> = []
  // Confetti: a cheap hash spreads all 120 colours through every row, which
  // is the worst case for parking because every colour is live at once.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push({ x, y, s: glyphs[(x * 7 + y * 13 + ((x * y) % 11)) % colours]! })
    }
  }
  const pattern: PatternData = {
    schemaVersion: 1,
    type: 'CROSS_STITCH',
    grid: { width, height, cells, backstitch: [], frenchKnots: [], beads: [], fractional: [] },
    palette: glyphs.map(paletteEntry),
    fabric: { count: 14, colourRgb: '#F5EBD8', type: 'Aida' },
    metadata: {},
  }

  const buildStart = performance.now()
  const index = buildParkingIndex(pattern, 'rows')
  const buildMs = performance.now() - buildStart

  const stitched = new Set<string>()
  const markStart = performance.now()
  for (const cell of cells) {
    const k = cellKey(cell.x, cell.y)
    stitched.add(k)
    applyMark(index, cell.x, cell.y, true, cell.s)
    // The parked answer the Studio needs on every mark.
    parkedCellFor(index, cell.s, stitched)
  }
  const markMs = performance.now() - markStart
  const perMarkUs = (markMs / cells.length) * 1000

  const refreshStart = performance.now()
  for (let i = 0; i < 1000; i++) refreshParked(index, stitched)
  const refreshUs = ((performance.now() - refreshStart) / 1000) * 1000

  console.log(
    `       ${cells.length.toLocaleString()} cells, ${colours} colours\n` +
      `       build ${buildMs.toFixed(1)} ms\n` +
      `       mark + parked lookup ${perMarkUs.toFixed(3)} us per mark (${markMs.toFixed(1)} ms total)\n` +
      `       refreshParked (all ${colours} colours) ${refreshUs.toFixed(1)} us`,
  )

  // Every colour is finished, so nothing is parked anywhere.
  assert.equal(refreshParked(index, stitched).size, 0)
  assert.ok(index.lineRemaining.every((n) => n === 0))
  // A generous ceiling: the point is that the cost does not scale with the
  // chart, not that any given runner is fast.
  assert.ok(perMarkUs < 20, `per-mark cost ${perMarkUs.toFixed(3)} us is too high`)
})

test('undoing the whole chart back out costs the same per unmark', () => {
  const width = 240
  const height = 255
  const colours = 120
  const glyphs = Array.from({ length: colours }, (_, i) => `c${i}`)
  const cells: Array<{ x: number; y: number; s: string }> = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push({ x, y, s: glyphs[(x * 7 + y * 13) % colours]! })
    }
  }
  const pattern: PatternData = {
    schemaVersion: 1,
    type: 'CROSS_STITCH',
    grid: { width, height, cells, backstitch: [], frenchKnots: [], beads: [], fractional: [] },
    palette: glyphs.map(paletteEntry),
    fabric: { count: 14, colourRgb: '#F5EBD8', type: 'Aida' },
    metadata: {},
  }

  const index = buildParkingIndex(pattern, 'rows')
  const stitched = new Set<string>()
  for (const cell of cells) {
    stitched.add(cellKey(cell.x, cell.y))
    applyMark(index, cell.x, cell.y, true, cell.s)
  }

  const start = performance.now()
  for (let i = cells.length - 1; i >= 0; i--) {
    const cell = cells[i]!
    stitched.delete(cellKey(cell.x, cell.y))
    applyMark(index, cell.x, cell.y, false, cell.s)
    parkedCellFor(index, cell.s, stitched)
  }
  const perUnmarkUs = ((performance.now() - start) / cells.length) * 1000
  console.log(`       ${perUnmarkUs.toFixed(3)} us per unmark`)

  // Back to a blank chart: every colour parks on its first cell again.
  const rebuilt = buildParkingIndex(pattern, 'rows')
  assert.deepEqual(
    [...refreshParked(index, stitched)].sort(cmp),
    [...refreshParked(rebuilt, new Set())].sort(cmp),
  )
  assert.ok(perUnmarkUs < 20, `per-unmark cost ${perUnmarkUs.toFixed(3)} us is too high`)
})

// ───────────────────────────────────────────────────────────────────────────
// Through the chart store — the wiring the Studio actually uses
// ───────────────────────────────────────────────────────────────────────────

console.log('\nthrough the chart store')

function loadStore(pattern: PatternData, stitched: Iterable<string> = []) {
  // The store is a singleton, so each case starts from the same footing
  // rather than inheriting the previous one's working direction.
  useChartStore.getState().setPattern(pattern)
  useChartStore.getState().setParkingDirection('rows')
  useChartStore.getState().setStitchedCells(new Set(stitched))
  useChartStore.getState().setParkingEnabled(true)
  return () => useChartStore.getState()
}

test('switching parking on parks every colour and lands on a line with work', () => {
  const get = loadStore(CONFETTI)
  assert.equal(get().parkingEnabled, true)
  assert.deepEqual(pick(get().parkedCells, 'A'), { x: 0, y: 0 })
  assert.deepEqual(pick(get().parkedCells, 'C'), { x: 2, y: 1 })
  assert.equal(get().parkingLine, 0)
})

test('tapping a square stitched moves only that colour on', () => {
  const get = loadStore(CONFETTI)
  get().toggleStitched(0, 0)
  assert.deepEqual(pick(get().parkedCells, 'A'), { x: 2, y: 0 })
  assert.deepEqual(pick(get().parkedCells, 'B'), { x: 1, y: 0 })
})

test('tapping it again puts the colour back where it was', () => {
  const get = loadStore(CONFETTI)
  get().toggleStitched(0, 0)
  get().toggleStitched(0, 0)
  assert.deepEqual(pick(get().parkedCells, 'A'), { x: 0, y: 0 })
})

test('finishing the current row moves the working line on by itself', () => {
  const get = loadStore(CONFETTI)
  assert.equal(get().parkingLine, 0)
  get().markStitchedBatch([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }], true)
  assert.equal(get().parkingLine, 1)
})

test('isolating a colour leaves every parked position alone', () => {
  const get = loadStore(CONFETTI)
  const before = new Map(get().parkedCells)
  get().setIsolate('B')
  assert.deepEqual([...get().parkedCells].sort(cmp), [...before].sort(cmp))
  get().setIsolate(null)
  assert.deepEqual([...get().parkedCells].sort(cmp), [...before].sort(cmp))
})

test('a progress set arriving from another device rebuilds the parks', () => {
  const get = loadStore(CONFETTI)
  get().setStitchedCells(new Set([cellKey(0, 0), cellKey(2, 0), cellKey(0, 2)]))
  assert.deepEqual(pick(get().parkedCells, 'A'), { x: 2, y: 2 })
  assert.equal(get().progressDirty, false)
})

test('clearing all progress parks every colour at the start again', () => {
  const get = loadStore(CONFETTI)
  get().markStitchedBatch([{ x: 0, y: 0 }, { x: 2, y: 0 }], true)
  get().clearAllStitched()
  assert.deepEqual(pick(get().parkedCells, 'A'), { x: 0, y: 0 })
  assert.equal(get().parkingLine, 0)
})

test('changing the working direction reorders the parks', () => {
  const get = loadStore(CONFETTI)
  get().setParkingDirection('columns')
  assert.equal(get().parkingDirection, 'columns')
  assert.deepEqual(pick(get().parkedCells, 'C'), { x: 1, y: 2 })
  assert.equal(get().parkingDirty, true)
})

test('painting the chart withholds the markers, and marking rebuilds them', () => {
  const get = loadStore(CONFETTI)
  get().setCurrentSymbol('C')
  // Repaint the very first square from A to C.
  get().paintCell(0, 0, 'C')
  assert.equal(get().parkingStale, true)
  assert.equal(get().parkedCells.size, 0)
  // The next mark-stitched rebuilds against the edited chart: C now starts
  // at (0,0) and A has lost its first square.
  get().toggleStitched(3, 3)
  assert.equal(get().parkingStale, false)
  assert.deepEqual(pick(get().parkedCells, 'C'), { x: 0, y: 0 })
  assert.deepEqual(pick(get().parkedCells, 'A'), { x: 2, y: 0 })
})

test('undoing that paint puts the parks back as they were', () => {
  const get = loadStore(CONFETTI)
  const before = new Map(get().parkedCells)
  get().setCurrentSymbol('C')
  get().paintCell(0, 0, 'C')
  get().syncParkingIndex()
  assert.notDeepEqual([...get().parkedCells].sort(cmp), [...before].sort(cmp))
  get().undo()
  get().syncParkingIndex()
  assert.deepEqual([...get().parkedCells].sort(cmp), [...before].sort(cmp))
})

test('a new pattern drops the old chart\'s ordered lists', () => {
  const get = loadStore(CONFETTI)
  get().setPattern(patternFromRows(['ZZ', 'ZZ']))
  assert.equal(get().parkingIndex, null)
  assert.equal(get().parkedCells.size, 0)
  // Switching parking on again builds against the new chart.
  get().setParkingEnabled(true)
  assert.deepEqual(pick(get().parkedCells, 'Z'), { x: 0, y: 0 })
})

test('turning parking off stops answering, and back on picks up where it was', () => {
  const get = loadStore(CONFETTI)
  get().toggleStitched(0, 0)
  get().setParkingEnabled(false)
  assert.equal(get().parkingEnabled, false)
  get().setParkingEnabled(true)
  assert.deepEqual(pick(get().parkedCells, 'A'), { x: 2, y: 0 })
})

test('centring on a square puts it in the middle of the canvas', () => {
  const get = loadStore(CONFETTI)
  get().setContainerSize(800, 600)
  get().centreOnCell(2, 3)
  const { viewport } = get()
  const cellPx = 32
  assert.ok(Math.abs(viewport.panX + (2 + 0.5) * cellPx * viewport.scale - 400) < 0.001)
  assert.ok(Math.abs(viewport.panY + (3 + 0.5) * cellPx * viewport.scale - 300) < 0.001)
})

// ───────────────────────────────────────────────────────────────────────────

function pick(parked: ReadonlyMap<string, { x: number; y: number }>, symbol: string) {
  const cell = parked.get(symbol)
  if (!cell) return null
  return { x: cell.x, y: cell.y }
}

function cmp(a: [string, unknown], b: [string, unknown]) {
  return a[0].localeCompare(b[0])
}

console.log(failures === 0 ? '\nall parking tests passed\n' : `\n${failures} parking test(s) failed\n`)
process.exit(failures === 0 ? 0 : 1)
