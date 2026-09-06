/**
 * Fractional-stitch tests — synthetic grids, one per thing the smoothing has to
 * get right, plus the geometry the renderer relies on.
 *
 *   cd apps/web && pnpm exec tsx src/lib/studio/generation/bulk/fractionals.test.ts
 */

import assert from 'node:assert/strict'
import {
  computePatternMetrics,
  parsePatternData,
  type PatternData,
  type PatternCell,
  type PaletteEntry,
} from '@homemade/db'
import { deriveFractionals, MAX_FRACTIONAL_SHARE } from './fractionals'
import { fractionalAreaPath, fractionalThreadPath } from '@/components/studio/chart/render-helpers'

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

function entry(symbol: string, code: string, name: string, rgb: string): PaletteEntry {
  return { symbol, brand: 'DMC', code, name, rgb, strandsFullCross: 2, strandsBackstitch: 1 }
}

const RED = entry('X', '321', 'Red', '#bd1136')
const BLUE = entry('O', '336', 'Navy blue', '#0c275e')
/** Two flosses nobody could tell apart at arm's length. */
const RED2 = entry('x', '304', 'Medium red', '#c21c3c')

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
    grid: { width, height, cells, backstitch: [], frenchKnots: [], beads: [], fractional: [] },
    palette,
    fabric: { count: 14, colourRgb: '#FCFAF6', type: 'Aida' },
    metadata: {},
  }
}

/** A 20x20 chart split by a staircase diagonal: blue above it, red below. */
function staircase(): PatternData {
  const rows: string[] = []
  for (let y = 0; y < 20; y++) {
    let row = ''
    for (let x = 0; x < 20; x++) row += x < y ? 'X' : 'O'
    rows.push(row)
  }
  return chart(rows, [RED, BLUE])
}

// ─── The smoothing ─────────────────────────────────────────────────────────

record('a stair-stepped diagonal gets its corner cells shared', () => {
  const out = deriveFractionals(staircase())
  assert.ok(out.cellsShared > 0, 'nothing was smoothed')
  assert.equal(out.stitches, out.cellsShared * 2, 'each shared cell is two stitches')
})

record('a shared cell loses its full cross', () => {
  const before = staircase()
  const out = deriveFractionals(before)
  assert.equal(
    out.data.grid.cells.length,
    before.grid.cells.length - out.cellsShared,
    'the cross under a shared cell was left in',
  )
  for (const f of out.data.grid.fractional) {
    assert.ok(
      !out.data.grid.cells.some((c) => c.x === f.x && c.y === f.y),
      `cell (${f.x},${f.y}) is both a cross and a fractional`,
    )
  }
})

record('the two fractionals in a cell tile it: same quarter, one of each kind', () => {
  const out = deriveFractionals(staircase())
  const byCell = new Map<string, typeof out.data.grid.fractional>()
  for (const f of out.data.grid.fractional) {
    const key = `${f.x},${f.y}`
    const list = byCell.get(key) ?? []
    list.push(f)
    byCell.set(key, list)
  }
  for (const [key, list] of byCell) {
    assert.equal(list.length, 2, `cell ${key} has ${list.length} fractionals`)
    assert.equal(list[0]!.q, list[1]!.q, `cell ${key} splits on two different quarters`)
    assert.notEqual(list[0]!.k, list[1]!.k, `cell ${key} has two of the same kind`)
    assert.notEqual(list[0]!.s, list[1]!.s, `cell ${key} is shared with itself`)
  }
})

record('the smoothed chart still validates against the schema', () => {
  const out = deriveFractionals(staircase())
  const parsed = parsePatternData(out.data)
  assert.ok(parsed.grid.fractional.length > 0)
})

record('metrics see the fractionals', () => {
  const out = deriveFractionals(staircase())
  const m = computePatternMetrics(out.data)
  assert.equal(m.hasQuarterStitches, true)
  assert.equal(m.totalStitches, out.data.grid.cells.length + out.data.grid.fractional.length)
})

// ─── What it must leave alone ──────────────────────────────────────────────

record('a step between two flosses nobody can tell apart is left alone', () => {
  const rows: string[] = []
  for (let y = 0; y < 20; y++) {
    let row = ''
    for (let x = 0; x < 20; x++) row += x < y ? 'X' : 'x'
    rows.push(row)
  }
  const out = deriveFractionals(chart(rows, [RED, RED2]))
  assert.equal(out.cellsShared, 0)
})

record('a boundary against bare fabric is never shared', () => {
  // A blue triangle on bare cloth: every step corner is against the fabric, and
  // sharing those would erode the silhouette the outline is drawn along.
  const rows: string[] = []
  for (let y = 0; y < 20; y++) {
    let row = ''
    for (let x = 0; x < 20; x++) row += x < y ? 'O' : ' '
    rows.push(row)
  }
  const out = deriveFractionals(chart(rows, [BLUE]))
  assert.equal(out.cellsShared, 0)
})

record('a lone speck at a corner is not a staircase', () => {
  const rows: string[] = []
  for (let y = 0; y < 20; y++) rows.push('O'.repeat(20))
  rows[10] = 'O'.repeat(9) + 'X' + 'O'.repeat(10)
  const out = deriveFractionals(chart(rows, [RED, BLUE]))
  assert.equal(out.cellsShared, 0)
})

record('a straight edge has no steps to take out', () => {
  const rows: string[] = []
  for (let y = 0; y < 20; y++) rows.push('X'.repeat(10) + 'O'.repeat(10))
  const out = deriveFractionals(chart(rows, [RED, BLUE]))
  assert.equal(out.cellsShared, 0)
})

record('the cap holds on a chart that is nothing but steps', () => {
  const out = deriveFractionals(staircase())
  const cap = Math.floor(400 * MAX_FRACTIONAL_SHARE)
  assert.ok(out.cellsShared <= cap, `${out.cellsShared} shared cells is over the cap of ${cap}`)
})

record('a chart that already carries fractionals is never smoothed twice', () => {
  const once = deriveFractionals(staircase())
  const twice = deriveFractionals(once.data)
  assert.equal(twice.cellsShared, 0)
  assert.equal(twice.data.grid.fractional.length, once.data.grid.fractional.length)
})

record('the derivation never mutates the chart it was given', () => {
  const data = staircase()
  const before = data.grid.cells.length
  deriveFractionals(data)
  assert.equal(data.grid.fractional.length, 0)
  assert.equal(data.grid.cells.length, before)
})

// ─── The geometry the renderer draws ───────────────────────────────────────

record('a quarter covers its own corner of the cell, at quarter size', () => {
  const d = fractionalAreaPath({ x: 2, y: 3, q: 'tl', k: 'quarter' }, 10)
  // Cell (2,3) at 10px runs x 20-30, y 30-40; the top-left quarter is 20-25 / 30-35.
  assert.equal(d, 'M20 30L25 30L25 35L20 35Z')
})

record('a three-quarter is the cell with that corner cut off', () => {
  const d = fractionalAreaPath({ x: 0, y: 0, q: 'tl', k: 'threeQuarter' }, 10)
  // Round the cell from the left edge midpoint, through the centre, to the top
  // edge midpoint, then the three whole corners.
  assert.equal(d, 'M0 5L5 5L5 0L10 0L10 10L0 10Z')
})

record('the thread of a quarter runs corner to centre', () => {
  assert.equal(fractionalThreadPath({ x: 0, y: 0, q: 'br', k: 'quarter' }, 10), 'M10 10L5 5')
})

record('the thread of a three-quarter is a full diagonal plus a half leg', () => {
  // Missing the top-left: the diagonal that misses it runs top-right to
  // bottom-left, and the half leg comes in from the bottom-right corner.
  assert.equal(
    fractionalThreadPath({ x: 0, y: 0, q: 'tl', k: 'threeQuarter' }, 10),
    'M10 0L0 10M10 10L5 5',
  )
})

// ─── Report ────────────────────────────────────────────────────────────────

const failed = results.filter((r) => !r.passed)
for (const r of results) {
  console.log(`${r.passed ? 'PASS' : 'FAIL'}: ${r.name}`)
  if (!r.passed && r.detail) console.log(`     ${r.detail}`)
}
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length > 0) process.exit(1)
