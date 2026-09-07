/**
 * Skein-estimate tests — the one-pass palette summary against the per-symbol
 * estimate it replaced.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd packages/db && pnpm exec tsx src/pattern-skeins.test.ts
 *
 * `summarisePaletteUsage` exists so a 224-colour showpiece is walked once
 * rather than 224 times. It is only worth having if it gives the same numbers,
 * so the test that matters is the equivalence: for every symbol on a chart that
 * exercises all four layers, the summary's skein count is the number
 * `estimateSkeinCount` has always printed on the floss key.
 */

import assert from 'node:assert/strict'
import {
  estimateSkeinCount,
  summarisePaletteUsage,
  skeinCountFromUsage,
  parsePatternData,
  type PatternData,
  type PaletteEntry,
} from './pattern'

let passed = 0
let failed = 0
function test(name: string, fn: () => void): void {
  try {
    fn()
    passed++
    console.log(`PASS: ${name}`)
  } catch (err) {
    failed++
    console.error(`FAIL: ${name}\n  ${(err as Error).message}`)
  }
}

function entry(symbol: string, strandsFullCross = 2): PaletteEntry {
  return {
    symbol,
    brand: 'DMC',
    code: `${symbol.charCodeAt(0)}`,
    name: `Colour ${symbol}`,
    rgb: '#334455',
    strandsFullCross,
    strandsBackstitch: 1,
  }
}

/**
 * A chart that uses every layer: full crosses, back-stitch of varying lengths,
 * French knots and both kinds of fractional. One symbol ('·') is in the palette
 * and worked nowhere, which is the case that used to be answered by a `?? 0`
 * fallback and now has to come back as a real zero-usage entry.
 */
function fixture(): PatternData {
  const cells: PatternData['grid']['cells'] = []
  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 12; x++) {
      cells.push({ x, y, s: (x + y) % 3 === 0 ? 'a' : (x + y) % 3 === 1 ? 'b' : 'c' })
    }
  }
  return parsePatternData({
    schemaVersion: 1,
    type: 'CROSS_STITCH',
    grid: {
      width: 12,
      height: 12,
      cells,
      backstitch: [
        { x1: 0, y1: 0, x2: 8, y2: 0, s: 'a' },
        { x1: 0, y1: 0, x2: 3, y2: 4, s: 'a' },
        { x1: 2, y1: 2, x2: 2, y2: 9, s: 'b' },
      ],
      frenchKnots: [
        { x: 1, y: 1, s: 'b' },
        { x: 4, y: 5, s: 'b' },
        { x: 7, y: 2, s: 'c' },
      ],
      fractional: [
        { x: 5, y: 5, q: 'tl', k: 'threeQuarter', s: 'a' },
        { x: 5, y: 5, q: 'tl', k: 'quarter', s: 'c' },
        { x: 9, y: 9, q: 'br', k: 'quarter', s: 'b' },
      ],
      beads: [],
    },
    palette: [entry('a'), entry('b', 3), entry('c', 1), entry('·')],
    fabric: { count: 16, colourRgb: '#ffffff', type: 'Aida' },
    metadata: {},
  })
}

test('the summary gives the same skein count as the per-symbol estimate', () => {
  const data = fixture()
  const usage = summarisePaletteUsage(data)
  for (const p of data.palette) {
    const fromSummary = skeinCountFromUsage(usage.get(p.symbol)!, p, data.fabric.count)
    assert.equal(
      fromSummary,
      estimateSkeinCount(data, p.symbol),
      `symbol ${p.symbol} disagrees`,
    )
  }
})

test('a palette entry worked nowhere still has an entry, all zeroes', () => {
  const data = fixture()
  const usage = summarisePaletteUsage(data)
  assert.deepEqual(usage.get('·'), {
    fullCrossCount: 0,
    backstitchCells: 0,
    frenchKnotCount: 0,
    fractionalCrosses: 0,
  })
})

test('the counted usage is the work actually on the chart', () => {
  const data = fixture()
  const usage = summarisePaletteUsage(data)
  const a = usage.get('a')!
  assert.equal(a.fullCrossCount, data.grid.cells.filter((c) => c.s === 'a').length)
  // 8 cells of straight line plus a 3-4-5 diagonal.
  assert.equal(a.backstitchCells, 13)
  assert.equal(a.frenchKnotCount, 0)
  assert.equal(a.fractionalCrosses, 0.75)

  const b = usage.get('b')!
  assert.equal(b.backstitchCells, 7)
  assert.equal(b.frenchKnotCount, 2)
  assert.equal(b.fractionalCrosses, 0.25)
})

test('the same-brand strand count still moves the estimate', () => {
  // Three strands over two makes a colour cost more per stitch, so the heavier
  // entry must never come out cheaper on identical work.
  const data = fixture()
  const usage = summarisePaletteUsage(data).get('a')!
  const light = skeinCountFromUsage(usage, entry('a', 1), data.fabric.count)
  const heavy = skeinCountFromUsage(usage, entry('a', 6), data.fabric.count)
  assert.ok(heavy > light, `${heavy} should be more than ${light}`)
})

test('summarising walks the chart once, not once per colour', () => {
  // The regression this guards: a 600x408 showpiece with 224 colours took
  // seconds on the pattern page because every colour re-read every cell. The
  // shape of the fix is what is asserted — the summary's cost tracks the chart,
  // so a wide palette over the same grid must not multiply the time.
  const cells: PatternData['grid']['cells'] = []
  const palette: PaletteEntry[] = []
  const symbols = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (const s of symbols) palette.push(entry(s))
  for (let y = 0; y < 400; y++) {
    for (let x = 0; x < 400; x++) {
      cells.push({ x, y, s: symbols[(x * 7 + y * 13) % symbols.length]! })
    }
  }
  const data = parsePatternData({
    schemaVersion: 1,
    type: 'CROSS_STITCH',
    grid: { width: 400, height: 400, cells, backstitch: [], frenchKnots: [], fractional: [], beads: [] },
    palette,
    fabric: { count: 14, colourRgb: '#ffffff', type: 'Aida' },
    metadata: {},
  })

  const startSummary = performance.now()
  const usage = summarisePaletteUsage(data)
  const summaryMs = performance.now() - startSummary

  const startPerColour = performance.now()
  for (const p of data.palette) estimateSkeinCount(data, p.symbol)
  const perColourMs = performance.now() - startPerColour

  for (const p of data.palette) {
    assert.equal(
      skeinCountFromUsage(usage.get(p.symbol)!, p, data.fabric.count),
      estimateSkeinCount(data, p.symbol),
    )
  }
  // A generous floor: the palette is 62 colours, so the honest expectation is
  // an order of magnitude. Asserting only 4x keeps the test from flaking on a
  // loaded machine while still failing outright if the per-colour walk returns.
  assert.ok(
    summaryMs * 4 < perColourMs,
    `summary ${summaryMs.toFixed(1)}ms vs per-colour ${perColourMs.toFixed(1)}ms`,
  )
})

console.log(`\n${passed}/${passed + failed} passed`)
if (failed > 0) process.exit(1)
