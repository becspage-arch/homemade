/**
 * Chart view tests — how the canvas opens, and how it zooms.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx src/lib/studio/chart-view.test.ts
 *
 * The case that matters is a phone. Fitting a 210-cell chart on a 390px
 * screen puts a square at under two pixels, which cannot be tapped and
 * cannot be read, so the first view has to open zoomed instead.
 *
 * The second half covers hit-testing the line and point work: which piece of
 * work a tap means when an outline, a knot and a square are all under the
 * finger, and what that costs on a chart with thousands of segments.
 */

import assert from 'node:assert/strict'
import { backstitchKey, type PaletteEntry, type PatternData } from '@homemade/db/pattern'
import {
  centreCellViewport,
  DEFAULT_CELL_PX,
  fitToScreen,
  FIRST_VIEW_CELL_PX,
  initialViewport,
  screenToCell,
  screenToCellPoint,
  FIT_FLOOR_CELL_PX,
  zoomAtPoint,
} from '@/components/studio/chart/render-helpers'
import {
  hitTestLineWork,
  MAX_TOLERANCE_CELLS,
  MIN_TOLERANCE_CELLS,
  pointInFractional,
  pointSegmentDistance,
  quadrantAt,
  segmentsCrossedBy,
  toleranceInCells,
} from '@/components/studio/chart/hit-test'

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

function chart(width: number, height: number): PatternData {
  return {
    schemaVersion: 1,
    type: 'CROSS_STITCH',
    grid: { width, height, cells: [], backstitch: [], frenchKnots: [], beads: [], fractional: [] },
    palette: [
      {
        symbol: 'a',
        brand: 'DMC',
        code: '310',
        name: 'Black',
        rgb: '#000000',
        strandsFullCross: 2,
        strandsBackstitch: 1,
      },
    ],
    fabric: { count: 14, colourRgb: '#F5EBD8', type: 'Aida' },
    metadata: {},
  }
}

console.log('\nthe first view')

test('a desktop always fits the whole chart', () => {
  const big = chart(210, 210)
  const view = initialViewport(big, 1440, 900)
  assert.deepEqual(view, fitToScreen(big, 1440, 900))
})

test('a phone still fits a small chart, so the whole design is visible', () => {
  const small = chart(30, 30)
  const view = initialViewport(small, 390, 700)
  assert.deepEqual(view, fitToScreen(small, 390, 700))
  assert.ok(view.scale * DEFAULT_CELL_PX >= FIT_FLOOR_CELL_PX)
})

test('a phone opens a showpiece chart zoomed, not fitted', () => {
  const big = chart(210, 210)
  const fitted = fitToScreen(big, 390, 700)
  // What the old behaviour gave: a square under two pixels across.
  assert.ok(fitted.scale * DEFAULT_CELL_PX < 2)
  const view = initialViewport(big, 390, 700)
  assert.equal(Math.round(view.scale * DEFAULT_CELL_PX), FIRST_VIEW_CELL_PX)
})

test('that first view lands on the middle of the chart', () => {
  const big = chart(210, 210)
  const view = initialViewport(big, 390, 700)
  const centre = screenToCell(195, 350, view)
  assert.equal(centre.x, 105)
  assert.equal(centre.y, 105)
})

test('a square in that first view is wide enough to put a finger on', () => {
  const view = initialViewport(chart(240, 255), 390, 700)
  assert.ok(view.scale * DEFAULT_CELL_PX >= 20)
})

test('the chart the audit found is no longer opened at two pixels a square', () => {
  const audited = chart(210, 210)
  const view = initialViewport(audited, 390, 844)
  assert.ok(view.scale * DEFAULT_CELL_PX > 20, 'first view is still too small to work from')
})

console.log('\ncentring and zooming')

test('centring puts the middle of the square in the middle of the canvas', () => {
  const view = centreCellViewport(10, 20, 0.75, 800, 600)
  const back = screenToCell(400, 300, view)
  assert.equal(back.x, 10)
  assert.equal(back.y, 20)
})

test('a pinch holds the point between the fingers still', () => {
  const before = { panX: -120, panY: -80, scale: 0.8 }
  const anchorX = 195
  const anchorY = 400
  const cellBefore = screenToCell(anchorX, anchorY, before)
  const after = zoomAtPoint(before, 2.4, anchorX, anchorY)
  const cellAfter = screenToCell(anchorX, anchorY, after)
  assert.equal(cellAfter.x, cellBefore.x)
  assert.equal(cellAfter.y, cellBefore.y)
})

test('the buttons and the pinch share the wheel zoom limits', () => {
  const wide = { panX: 0, panY: 0, scale: 0.05 }
  assert.equal(zoomAtPoint(wide, 0.5, 100, 100).scale, 0.05)
  const close = { panX: 0, panY: 0, scale: 12 }
  assert.equal(zoomAtPoint(close, 2, 100, 100).scale, 12)
})

// ───────────────────────────────────────────────────────────────────────────
// Hit-testing the line and point work
// ───────────────────────────────────────────────────────────────────────────

function palette(symbols: string[]): PaletteEntry[] {
  return symbols.map((symbol, i) => ({
    symbol,
    brand: 'DMC' as const,
    code: String(100 + i),
    name: `Colour ${symbol}`,
    rgb: '#aabbcc',
    strandsFullCross: 2,
    strandsBackstitch: 1,
  }))
}

function dressed(over: Partial<PatternData['grid']>, symbols = ['a', 'b']): PatternData {
  const base = chart(20, 20)
  return {
    ...base,
    grid: { ...base.grid, ...over },
    palette: palette(symbols),
  }
}

console.log('\ndistances, in cell units')

test('a point beside a line measures to the line', () => {
  assert.equal(pointSegmentDistance(2, 0.25, 0, 0, 4, 0), 0.25)
})

test('a point past the end of a line measures to the end, not to the line it lies on', () => {
  // On the infinite line through the segment this would be zero.
  assert.equal(pointSegmentDistance(6, 0, 0, 0, 4, 0), 2)
})

test('a diagonal measures square', () => {
  const d = pointSegmentDistance(1, 0, 0, 0, 2, 2)
  assert.ok(Math.abs(d - Math.SQRT1_2) < 1e-9)
})

test('a segment of no length is a point', () => {
  assert.equal(pointSegmentDistance(3, 4, 0, 0, 0, 0), 5)
})

test('a fingertip covers more squares the further out the chart is zoomed', () => {
  const zoomedIn = toleranceInCells(64)
  const zoomedOut = toleranceInCells(6)
  assert.ok(zoomedOut > zoomedIn)
  assert.equal(toleranceInCells(2000), MIN_TOLERANCE_CELLS)
  assert.equal(toleranceInCells(0.2), MAX_TOLERANCE_CELLS)
  assert.equal(toleranceInCells(0), MAX_TOLERANCE_CELLS)
})

console.log('\nwhat a tap means')

const OUTLINED = dressed({
  cells: [
    { x: 3, y: 3, s: 'a' },
    { x: 4, y: 3, s: 'a' },
  ],
  backstitch: [
    { x1: 3, y1: 3, x2: 5, y2: 3, s: 'b' },
    { x1: 10, y1: 10, x2: 10, y2: 14, s: 'b' },
  ],
  frenchKnots: [{ x: 7, y: 7, s: 'b' }],
})

function tap(pattern: PatternData, x: number, y: number, scaledCellPx = 32) {
  return hitTestLineWork(pattern, { x, y, scaledCellPx })
}

test('a tap on the outline is the outline', () => {
  const hit = tap(OUTLINED, 4, 3.02)
  assert.equal(hit?.kind, 'backstitch')
  assert.equal(hit?.index, 0)
})

test('a tap that is both on a square and near the line goes to the line, which is on top', () => {
  // Well inside the square at (3,3), and a fifth of a square below the
  // outline that runs along its top edge.
  const hit = tap(OUTLINED, 3.5, 3.2)
  assert.equal(hit?.kind, 'backstitch')
})

test('a tap in the middle of a square with no line near it is not a hit at all', () => {
  assert.equal(tap(OUTLINED, 3.5, 3.9), null)
})

test('the nearer of two lines wins', () => {
  const both = dressed({
    backstitch: [
      { x1: 0, y1: 5, x2: 10, y2: 5, s: 'b' },
      { x1: 0, y1: 5.4, x2: 10, y2: 5.4, s: 'b' },
    ],
  })
  assert.equal(tap(both, 5, 5.3)?.index, 1)
  assert.equal(tap(both, 5, 5.1)?.index, 0)
})

test('a knot is hit from anywhere in the middle of its square, and beats a line through it', () => {
  const knotOnLine = dressed({
    backstitch: [{ x1: 0, y1: 7.5, x2: 20, y2: 7.5, s: 'b' }],
    frenchKnots: [{ x: 7, y: 7, s: 'b' }],
  })
  assert.equal(tap(knotOnLine, 7.5, 7.5)?.kind, 'knot')
  // Step away from the knot and the line underneath answers again.
  assert.equal(tap(knotOnLine, 12.5, 7.5)?.kind, 'backstitch')
})

test('a part stitch is hit on the corner it covers', () => {
  const parts = dressed({
    fractional: [
      { x: 2, y: 2, q: 'tl', k: 'quarter', s: 'a' },
      { x: 2, y: 2, q: 'tl', k: 'threeQuarter', s: 'b' },
    ],
  })
  assert.equal(quadrantAt(2.2, 2.2), 'tl')
  assert.ok(pointInFractional(2.2, 2.2, { x: 2, y: 2, q: 'tl', k: 'quarter' }))
  assert.ok(!pointInFractional(2.8, 2.8, { x: 2, y: 2, q: 'tl', k: 'quarter' }))
  assert.equal(tap(parts, 2.2, 2.2)?.index, 0)
  assert.equal(tap(parts, 2.8, 2.8)?.index, 1)
})

test('a square holding one part stitch answers anywhere inside it', () => {
  const one = dressed({ fractional: [{ x: 2, y: 2, q: 'tl', k: 'quarter', s: 'a' }] })
  // The far corner is not the quarter it covers, but there is nothing else
  // in the square to mean, and a quarter of a square is too small to aim at.
  assert.equal(tap(one, 2.9, 2.9)?.kind, 'fractional')
  assert.equal(tap(one, 3.5, 3.5), null)
})

test('a layer switched off cannot be tapped', () => {
  const hit = hitTestLineWork(OUTLINED, {
    x: 4,
    y: 3.02,
    scaledCellPx: 32,
    layers: { backstitch: false },
  })
  assert.equal(hit, null)
})

test('isolating a colour hides the rest from the finger as well as from the eye', () => {
  const hit = hitTestLineWork(OUTLINED, { x: 4, y: 3.02, scaledCellPx: 32, isolate: 'a' })
  assert.equal(hit, null)
  assert.equal(hitTestLineWork(OUTLINED, { x: 4, y: 3.02, scaledCellPx: 32, isolate: 'b' })?.kind, 'backstitch')
})

test('showing only what is left hides what is done', () => {
  const worked = new Set([backstitchKey(OUTLINED.grid.backstitch[0]!)])
  const opts = { x: 4, y: 3.02, scaledCellPx: 32, stitched: worked }
  assert.equal(hitTestLineWork(OUTLINED, { ...opts, displayMode: 'remaining' as const }), null)
  assert.equal(hitTestLineWork(OUTLINED, { ...opts, displayMode: 'stitched' as const })?.kind, 'backstitch')
})

test('a tap converts from the screen through the viewport, whatever the zoom', () => {
  const view = centreCellViewport(4, 3, 0.75, 800, 600)
  const point = screenToCellPoint(400, 300, view)
  assert.ok(Math.abs(point.x - 4.5) < 1e-9)
  assert.ok(Math.abs(point.y - 3.5) < 1e-9)
})

console.log('\ndrawing along a line')

test('a drag along an outline marks every segment it crosses', () => {
  const run = dressed({
    backstitch: [
      { x1: 0, y1: 4, x2: 2, y2: 4, s: 'b' },
      { x1: 2, y1: 4, x2: 4, y2: 4, s: 'b' },
      { x1: 4, y1: 4, x2: 6, y2: 4, s: 'b' },
      { x1: 0, y1: 9, x2: 6, y2: 9, s: 'b' },
    ],
  })
  const crossed = segmentsCrossedBy(run, { x: 0.5, y: 4 }, { x: 5.5, y: 4 }, { x: 5.5, y: 4, scaledCellPx: 32 })
  assert.deepEqual(crossed, [0, 1, 2])
})

test('a fast sweep cannot step over a short segment between two samples', () => {
  const run = dressed({
    backstitch: [
      { x1: 0, y1: 4, x2: 0.5, y2: 4, s: 'b' },
      { x1: 3, y1: 4, x2: 3.5, y2: 4, s: 'b' },
      { x1: 8, y1: 4, x2: 8.5, y2: 4, s: 'b' },
    ],
  })
  // Two pointer samples a whole nine squares apart: the path between them is
  // what is tested, not the point it landed on.
  const crossed = segmentsCrossedBy(run, { x: 0, y: 4 }, { x: 9, y: 4 }, { x: 9, y: 4, scaledCellPx: 32 })
  assert.deepEqual(crossed, [0, 1, 2])
})

test('a drag across the chart does not sweep up lines it passed nowhere near', () => {
  const run = dressed({
    backstitch: [
      { x1: 0, y1: 4, x2: 6, y2: 4, s: 'b' },
      { x1: 0, y1: 12, x2: 6, y2: 12, s: 'b' },
    ],
  })
  const crossed = segmentsCrossedBy(run, { x: 0, y: 4 }, { x: 6, y: 4 }, { x: 6, y: 4, scaledCellPx: 32 })
  assert.deepEqual(crossed, [0])
})

console.log('\na big chart, zoomed out')

test('hit-testing a 600-square chart with thousands of segments stays well under a frame', () => {
  // The shape the brief names: 600 squares across, and an outline made of
  // several thousand segments.
  const size = 600
  const cells: PatternData['grid']['cells'] = []
  for (let y = 0; y < size; y += 3) {
    for (let x = 0; x < size; x += 3) cells.push({ x, y, s: 'a' })
  }
  const backstitch: PatternData['grid']['backstitch'] = []
  for (let i = 0; i < 4000; i++) {
    const y = (i * 7) % size
    const x = (i * 13) % (size - 4)
    backstitch.push({ x1: x, y1: y, x2: x + 4, y2: y, s: 'b' })
  }
  const frenchKnots: PatternData['grid']['frenchKnots'] = []
  for (let i = 0; i < 400; i++) frenchKnots.push({ x: (i * 11) % size, y: (i * 17) % size, s: 'b' })
  const big = dressed({ width: size, height: size, cells, backstitch, frenchKnots })

  // Zoomed right out: the whole 600 squares fitted on a laptop canvas, which
  // is where a scan over every segment would hurt most.
  const view = fitToScreen(big, 1440, 900)
  const scaledCellPx = view.scale * DEFAULT_CELL_PX
  assert.ok(scaledCellPx < 2, 'the fitted view should be well below one square per two pixels')

  const taps = 300
  const start = performance.now()
  let hits = 0
  for (let i = 0; i < taps; i++) {
    const point = screenToCellPoint((i * 37) % 1440, (i * 53) % 900, view)
    if (hitTestLineWork(big, { x: point.x, y: point.y, scaledCellPx })) hits++
  }
  const perTapMs = (performance.now() - start) / taps
  console.log(`       ${perTapMs.toFixed(3)} ms per tap over ${backstitch.length} segments (${hits} hits)`)
  // A frame is 16ms and a tap happens once, not sixty times a second, so this
  // has a lot of room. The point is that a linear scan is genuinely cheap.
  assert.ok(perTapMs < 4, `hit-testing cost ${perTapMs.toFixed(3)} ms a tap`)

  // The per-frame work of the drawing itself: bucketing every segment into
  // one path per colour, which is what the viewport does on each mark.
  const worked = new Set(backstitch.filter((_, i) => i % 2 === 0).map(backstitchKey))
  const buildStart = performance.now()
  const rounds = 20
  for (let r = 0; r < rounds; r++) {
    const done: string[] = []
    const todo: string[] = []
    for (const seg of big.grid.backstitch) {
      const d = `M${seg.x1 * 32} ${seg.y1 * 32}L${seg.x2 * 32} ${seg.y2 * 32}`
      ;(worked.has(backstitchKey(seg)) ? done : todo).push(d)
    }
    assert.ok(done.join('').length > 0 && todo.join('').length > 0)
  }
  const perBuildMs = (performance.now() - buildStart) / rounds
  console.log(`       ${perBuildMs.toFixed(3)} ms to rebuild every outline path`)
  assert.ok(perBuildMs < 16, `path rebuild cost ${perBuildMs.toFixed(3)} ms`)
})

console.log(failures === 0 ? '\nall chart view tests passed\n' : `\n${failures} chart view test(s) failed\n`)
process.exit(failures === 0 ? 0 : 1)
