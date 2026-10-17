/**
 * xs-halo-backfill helper tests: the un-embellish step has to be the exact
 * inverse of the converter's outline and fractional passes, or the backfill
 * would re-derive a chart that differs from the one it read.
 *
 *   cd apps/web && pnpm exec tsx scripts/xs-halo-backfill/lib.test.ts
 */
import assert from 'node:assert/strict'
import type { PatternData, PatternCell, PaletteEntry } from '@homemade/db'
import { unembellish, reembellish, sameChart } from './lib'

let passed = 0
let failed = 0
function test(name: string, fn: () => void): void {
  try {
    fn()
    passed++
    console.log(`PASS: ${name}`)
  } catch (err) {
    failed++
    console.log(`FAIL: ${name}\n     ${err instanceof Error ? err.message : String(err)}`)
  }
}

const P = (symbol: string, code: string, rgb: string): PaletteEntry => ({
  symbol, brand: 'DMC', code, name: code, rgb, strandsFullCross: 2, strandsBackstitch: 1,
})
const PALETTE = [
  P('R', '321', '#bd1136'),
  P('D', '814', '#7b0f2a'),
  P('Y', '307', '#fde13b'),
  P('G', '699', '#05652e'),
  P('L', '704', '#9ed24a'),
]

/** A red disc with a dark rim, a yellow wedge, a green stalk and a leaf, on bare cloth: diagonals to smooth, an edge to outline. */
function motif(): PatternData {
  const W = 40
  const H = 40
  const cells: PatternCell[] = []
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - 20
      const dy = y - 22
      const r2 = dx * dx + dy * dy
      if (r2 <= 13 * 13) cells.push({ x, y, s: dx > dy ? 'Y' : r2 > 10 * 10 ? 'D' : 'R' })
      else if (x >= 19 && x <= 21 && y >= 3 && y < 9) cells.push({ x, y, s: 'G' })
      else if (x >= 22 && x <= 28 && y >= 4 && y < 8) cells.push({ x, y, s: 'L' })
    }
  }
  return {
    schemaVersion: 1,
    type: 'CROSS_STITCH',
    grid: { width: W, height: H, cells, backstitch: [], frenchKnots: [], beads: [], fractional: [] },
    palette: PALETTE,
    fabric: { count: 14, colourRgb: '#FCFAF6', type: 'Aida' },
    metadata: {},
  }
}

const GM = { brief: { lane: 'quick', shelf: 'small-makes' } }

test('the converter passes add an outline and fractionals to the test motif', () => {
  const shipped = reembellish(motif(), GM)
  assert.ok(shipped.grid.backstitch.length > 0, 'outline')
  assert.ok(shipped.grid.fractional.length > 0, 'fractionals')
})

test('unembellish gives back the chart as it stood before the passes', () => {
  const base = motif()
  const back = unembellish(reembellish(base, GM))
  assert.ok(sameChart(back, base))
  assert.equal(back.grid.backstitch.length, 0)
  assert.equal(back.grid.fractional.length, 0)
  assert.deepEqual(back.palette.map((p) => p.code).sort(), ['307', '321', '699', '704', '814'], 'an outline-only ink leaves the key')
})

test('re-deriving the un-embellished chart reproduces the shipped one', () => {
  const shipped = reembellish(motif(), GM)
  assert.ok(sameChart(reembellish(unembellish(shipped), GM), shipped))
})

test('sameChart notices a moved stitch', () => {
  const a = motif()
  const b: PatternData = { ...a, grid: { ...a.grid, cells: a.grid.cells.slice(1) } }
  assert.equal(sameChart(a, b), false)
})

console.log(`\n${passed}/${passed + failed} passed`)
if (failed > 0) process.exit(1)
