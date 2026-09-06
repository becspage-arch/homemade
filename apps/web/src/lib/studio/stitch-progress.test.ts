/**
 * Progress-key and counting tests — how a chart records what has been worked
 * once back-stitch, French knots and part stitches can be ticked off too.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx src/lib/studio/stitch-progress.test.ts
 *
 * The two things worth holding still: a key means the same piece of work
 * every time the chart is opened, and an edit to the chart can only ever cost
 * the elements that actually changed.
 */

import assert from 'node:assert/strict'
import {
  backstitchKey,
  cellKey,
  countStitchProgress,
  countStitchProgressBySymbol,
  fractionalKey,
  frenchKnotKey,
  parseProgressKey,
  progressKeyFor,
  type BackstitchSegment,
  type PaletteEntry,
  type PatternData,
} from '@homemade/db/pattern'
import { useChartStore } from '@/components/studio/chart/chart-store'

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

function paletteEntry(symbol: string, i = 0): PaletteEntry {
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

function chart(over: Partial<PatternData['grid']> = {}, symbols = ['A', 'B']): PatternData {
  return {
    schemaVersion: 1,
    type: 'CROSS_STITCH',
    grid: {
      width: 10,
      height: 10,
      cells: [],
      backstitch: [],
      frenchKnots: [],
      beads: [],
      fractional: [],
      ...over,
    },
    palette: symbols.map((s, i) => paletteEntry(s, i)),
    fabric: { count: 14, colourRgb: '#F5EBD8', type: 'Aida' },
    metadata: {},
  }
}

// ───────────────────────────────────────────────────────────────────────────
// The key codec
// ───────────────────────────────────────────────────────────────────────────

console.log('\nprogress keys')

test('a square still keys the way it always has', () => {
  assert.equal(cellKey(12, 7), '12,7')
  assert.deepEqual(parseProgressKey('12,7'), { kind: 'cell', x: 12, y: 7 })
})

test('a segment keys by its endpoints, not by where it sits in the array', () => {
  const key = backstitchKey({ x1: 0, y1: 0, x2: 4, y2: 0 })
  assert.equal(key, 'bs:0,0,4,0')
  assert.deepEqual(parseProgressKey(key), { kind: 'backstitch', x1: 0, y1: 0, x2: 4, y2: 0 })
})

test('the same line drawn backwards is the same piece of work', () => {
  assert.equal(
    backstitchKey({ x1: 4, y1: 2, x2: 1, y2: 2 }),
    backstitchKey({ x1: 1, y1: 2, x2: 4, y2: 2 }),
  )
})

test('half-cell endpoints survive the round trip', () => {
  const key = backstitchKey({ x1: 1.5, y1: 2, x2: 3, y2: 4.25 })
  assert.equal(key, 'bs:1.5,2,3,4.25')
  assert.deepEqual(parseProgressKey(key), { kind: 'backstitch', x1: 1.5, y1: 2, x2: 3, y2: 4.25 })
})

test('a coordinate written three different ways writes one key', () => {
  const a = backstitchKey({ x1: 4, y1: 0, x2: 8, y2: 0 })
  const b = backstitchKey({ x1: 4.0, y1: -0, x2: 8.0000001, y2: 0 })
  assert.equal(a, b)
})

test('a knot keys by its square', () => {
  assert.equal(frenchKnotKey({ x: 9, y: 3 }), 'kn:9,3')
  assert.deepEqual(parseProgressKey('kn:9,3'), { kind: 'knot', x: 9, y: 3 })
})

test('a three-quarter and the quarter that completes it are two keys', () => {
  const quarter = fractionalKey({ x: 9, y: 3, q: 'tl', k: 'quarter' })
  const three = fractionalKey({ x: 9, y: 3, q: 'tl', k: 'threeQuarter' })
  assert.equal(quarter, 'fr:9,3,tl,q')
  assert.equal(three, 'fr:9,3,tl,t')
  assert.notEqual(quarter, three)
  assert.deepEqual(parseProgressKey(three), {
    kind: 'fractional',
    x: 9,
    y: 3,
    q: 'tl',
    k: 'threeQuarter',
  })
})

test('progressKeyFor writes what parseProgressKey reads, for every kind', () => {
  const keys = ['3,4', 'bs:0,0,4,0', 'kn:9,3', 'fr:9,3,br,q']
  for (const key of keys) {
    const element = parseProgressKey(key)
    assert.ok(element, `${key} did not parse`)
    assert.equal(progressKeyFor(element), key)
  }
})

test('a key from a future version parses as nothing rather than throwing', () => {
  for (const key of ['bd:1,2', 'bs:1,2', 'bs:a,b,c,d', 'fr:1,2,zz,q', 'fr:1,2,tl,x', 'kn:1', '']) {
    assert.equal(parseProgressKey(key), null, `${key} should not have parsed`)
  }
})

test('an edit that deletes one segment leaves every other tick where it was', () => {
  const segments: BackstitchSegment[] = [
    { x1: 0, y1: 0, x2: 2, y2: 0, s: 'A' },
    { x1: 2, y1: 0, x2: 4, y2: 0, s: 'A' },
    { x1: 4, y1: 0, x2: 6, y2: 0, s: 'A' },
  ]
  const worked = new Set(segments.map(backstitchKey))
  // The editor removes the middle one. With array indices, every tick after
  // it would slide onto the wrong line; with endpoint keys, nothing moves.
  const edited = [segments[0]!, segments[2]!]
  assert.ok(edited.every((seg) => worked.has(backstitchKey(seg))))
  // And the deleted segment's tick names work that is no longer in the chart,
  // so it counts for nothing without touching anything else.
  const after = countStitchProgress(chart({ backstitch: edited }), worked)
  assert.equal(after.complete, true)
  assert.equal(after.lineCellsTotal, 4)
})

// ───────────────────────────────────────────────────────────────────────────
// Counting
// ───────────────────────────────────────────────────────────────────────────

console.log('\ncounting what is done')

const MIXED = chart({
  cells: [
    { x: 0, y: 0, s: 'A' },
    { x: 1, y: 0, s: 'A' },
    { x: 2, y: 0, s: 'B' },
  ],
  // Ten cells of line in one segment, plus two in another.
  backstitch: [
    { x1: 0, y1: 1, x2: 10, y2: 1, s: 'B' },
    { x1: 0, y1: 2, x2: 2, y2: 2, s: 'B' },
  ],
  frenchKnots: [{ x: 5, y: 5, s: 'A' }],
  fractional: [{ x: 6, y: 6, q: 'tl', k: 'quarter', s: 'A' }],
})

test('back-stitch counts in cells of line, not in segments', () => {
  const totals = countStitchProgress(MIXED, new Set())
  assert.equal(totals.lineCellsTotal, 12)
  assert.equal(totals.cellsTotal, 3)
  assert.equal(totals.knotsTotal, 1)
  assert.equal(totals.fractionalTotal, 1)
  assert.equal(totals.total, 17)
  assert.equal(totals.done, 0)
  assert.equal(totals.percent, 0)
})

test('one long segment ticked off moves the bar by its length', () => {
  const worked = new Set([backstitchKey(MIXED.grid.backstitch[0]!)])
  const totals = countStitchProgress(MIXED, worked)
  assert.equal(totals.lineCellsDone, 10)
  assert.equal(totals.done, 10)
  assert.equal(totals.percent, 59)
})

test('every square done is not the whole chart done', () => {
  const worked = new Set(MIXED.grid.cells.map((c) => cellKey(c.x, c.y)))
  const totals = countStitchProgress(MIXED, worked)
  assert.equal(totals.complete, false)
  assert.ok(totals.percent < 100)
})

test('the percentage never rounds up to 100 with work left', () => {
  const cells = Array.from({ length: 400 }, (_, i) => ({ x: i % 20, y: Math.floor(i / 20), s: 'A' }))
  const nearly = chart({ cells })
  const worked = new Set(cells.slice(0, 399).map((c) => cellKey(c.x, c.y)))
  const totals = countStitchProgress(nearly, worked)
  assert.equal(totals.percent, 99)
  assert.equal(totals.complete, false)
})

test('finished means every kind of work is finished', () => {
  const worked = new Set<string>([
    ...MIXED.grid.cells.map((c) => cellKey(c.x, c.y)),
    ...MIXED.grid.backstitch.map(backstitchKey),
    ...MIXED.grid.frenchKnots.map(frenchKnotKey),
    ...MIXED.grid.fractional.map(fractionalKey),
  ])
  const totals = countStitchProgress(MIXED, worked)
  assert.equal(totals.complete, true)
  assert.equal(totals.percent, 100)
})

test('an empty chart is empty, not finished', () => {
  const totals = countStitchProgress(chart(), new Set())
  assert.equal(totals.complete, false)
  assert.equal(totals.percent, 0)
})

test('a colour is only clear of the floss key when its line work is done too', () => {
  const worked = new Set([cellKey(2, 0)])
  const bySymbol = countStitchProgressBySymbol(MIXED, worked)
  const b = bySymbol.get('B')!
  assert.equal(b.cellsDone, 1)
  assert.equal(b.cellsTotal, 1)
  assert.equal(b.complete, false, 'B still has twelve cells of outline to work')
  assert.equal(b.lineCellsTotal, 12)

  const withLine = new Set([...worked, ...MIXED.grid.backstitch.map(backstitchKey)])
  assert.equal(countStitchProgressBySymbol(MIXED, withLine).get('B')!.complete, true)
})

test('a floss used for nothing but the outline still counts', () => {
  const outlineOnly = chart(
    { cells: [{ x: 0, y: 0, s: 'A' }], backstitch: [{ x1: 0, y1: 0, x2: 3, y2: 0, s: 'B' }] },
    ['A', 'B'],
  )
  const b = countStitchProgressBySymbol(outlineOnly, new Set()).get('B')!
  assert.equal(b.cellsTotal, 0)
  assert.equal(b.lineCellsTotal, 3)
  assert.equal(b.total, 3)
})

test('every palette entry answers, even one the chart never uses', () => {
  const bySymbol = countStitchProgressBySymbol(chart({}, ['A', 'B', 'C']), new Set())
  assert.deepEqual([...bySymbol.keys()].sort(), ['A', 'B', 'C'])
  assert.equal(bySymbol.get('C')!.total, 0)
})

test('a key the counter does not understand changes no count', () => {
  const strange = new Set(['xx:1,2,3', 'bs:1', cellKey(0, 0)])
  const totals = countStitchProgress(MIXED, strange)
  assert.equal(totals.cellsDone, 1)
  assert.equal(totals.done, 1)
})

// ───────────────────────────────────────────────────────────────────────────
// Through the chart store — the wiring the Studio actually uses
// ───────────────────────────────────────────────────────────────────────────

console.log('\nthrough the chart store')

function load(pattern: PatternData) {
  useChartStore.getState().setPattern(pattern)
  useChartStore.getState().setStitchedCells(new Set())
  return () => useChartStore.getState()
}

test('ticking a segment stores it under its endpoints', () => {
  const get = load(MIXED)
  get().toggleStitchedSegment(0)
  assert.deepEqual([...get().stitchedCells], ['bs:0,1,10,1'])
  assert.equal(get().progressDirty, true)
})

test('ticking it again takes it back off', () => {
  const get = load(MIXED)
  get().toggleStitchedSegment(0)
  get().toggleStitchedSegment(0)
  assert.equal(get().stitchedCells.size, 0)
})

test('knots and part stitches tick the same way', () => {
  const get = load(MIXED)
  get().toggleStitchedKnot(0)
  get().toggleStitchedFractional(0)
  assert.deepEqual([...get().stitchedCells].sort(), ['fr:6,6,tl,q', 'kn:5,5'])
})

test('a run of segments marks in one go, and all of them follow the first', () => {
  const get = load(MIXED)
  get().markSegmentsBatch([0, 1], true)
  assert.equal(get().stitchedCells.size, 2)
  get().markSegmentsBatch([0, 1], false)
  assert.equal(get().stitchedCells.size, 0)
})

test('a tick that names nothing in the chart is not stored', () => {
  const get = load(MIXED)
  get().toggleStitchedSegment(99)
  get().toggleStitchedKnot(99)
  get().toggleStitchedFractional(99)
  assert.equal(get().stitchedCells.size, 0)
})

test('line work and squares live in the one set, so one save carries both', () => {
  const get = load(MIXED)
  get().toggleStitched(0, 0)
  get().toggleStitchedSegment(1)
  assert.deepEqual([...get().stitchedCells].sort(), ['0,0', 'bs:0,2,2,2'])
  // Which is what the autosave posts: a flat record of key -> true.
  const payload: Record<string, true> = {}
  for (const k of get().stitchedCells) payload[k] = true
  assert.deepEqual(payload, { '0,0': true, 'bs:0,2,2,2': true })
})

console.log(
  failures === 0 ? '\nall stitch progress tests passed\n' : `\n${failures} stitch progress test(s) failed\n`,
)
process.exit(failures === 0 ? 0 : 1)
