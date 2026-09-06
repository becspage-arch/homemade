/**
 * Chart view tests — how the canvas opens, and how it zooms.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx src/lib/studio/chart-view.test.ts
 *
 * The case that matters is a phone. Fitting a 210-cell chart on a 390px
 * screen puts a square at under two pixels, which cannot be tapped and
 * cannot be read, so the first view has to open zoomed instead.
 */

import assert from 'node:assert/strict'
import type { PatternData } from '@homemade/db/pattern'
import {
  centreCellViewport,
  DEFAULT_CELL_PX,
  fitToScreen,
  FIRST_VIEW_CELL_PX,
  initialViewport,
  screenToCell,
  FIT_FLOOR_CELL_PX,
  zoomAtPoint,
} from '@/components/studio/chart/render-helpers'

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
    grid: { width, height, cells: [], backstitch: [], frenchKnots: [], beads: [] },
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

console.log(failures === 0 ? '\nall chart view tests passed\n' : `\n${failures} chart view test(s) failed\n`)
process.exit(failures === 0 ? 0 : 1)
