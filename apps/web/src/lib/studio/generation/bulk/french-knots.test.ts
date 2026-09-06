/**
 * French-knot tests — synthetic grids, one per condition the rule has to hold.
 *
 *   cd apps/web && pnpm exec tsx src/lib/studio/generation/bulk/french-knots.test.ts
 */

import assert from 'node:assert/strict'
import { parsePatternData, type PatternData, type PatternCell, type PaletteEntry } from '@homemade/db'
import { deriveFrenchKnots, MAX_KNOTS } from './french-knots'

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

/** The face. */
const SKIN = entry('F', '3856', 'Mahogany ult vy lt', '#ffcfad')
/** The eye. */
const DARK = entry('#', '3371', 'Black brown', '#1e1108')
/** A shade of the face that is nearly the face. */
const SHADE = entry('s', '945', 'Tawny', '#fbd3ba')
/** A bright white glint. */
const WHITE = entry('.', 'B5200', 'Snow white', '#ffffff')

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

/** A field of `fill` with the given specks dropped into it. */
function field(fill: string, w: number, h: number, specks: [number, number, string][]): string[] {
  const rows: string[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => fill))
  for (const [x, y, s] of specks) rows[y]![x] = s
  return rows.map((r) => r.join(''))
}

// ─── The eye ───────────────────────────────────────────────────────────────

record('a lone dark stitch inside a face becomes a knot', () => {
  const out = deriveFrenchKnots(chart(field('F', 12, 12, [[5, 5, '#']]), [SKIN, DARK]))
  assert.equal(out.knots, 1)
  assert.deepEqual(out.data.grid.frenchKnots, [{ x: 5, y: 5, s: '#' }])
})

record('the cell under the knot is refilled with the field colour', () => {
  const out = deriveFrenchKnots(chart(field('F', 12, 12, [[5, 5, '#']]), [SKIN, DARK]))
  const cell = out.data.grid.cells.find((c) => c.x === 5 && c.y === 5)
  assert.equal(cell?.s, 'F', 'a knot is worked over the field, not over a hole')
  assert.equal(out.data.grid.cells.length, 144, 'no stitch is lost')
})

record('a pair of eyes both become knots', () => {
  const out = deriveFrenchKnots(
    chart(field('F', 14, 14, [[5, 6, '#'], [9, 6, '#']]), [SKIN, DARK]),
  )
  assert.equal(out.knots, 2)
})

record('a bright glint inside a dark field counts as well as a dark eye', () => {
  const out = deriveFrenchKnots(chart(field('#', 12, 12, [[5, 5, '.']]), [DARK, WHITE]))
  assert.equal(out.knots, 1)
  assert.equal(out.data.grid.frenchKnots[0]?.s, '.')
})

record('a white glint on pale skin is not bright enough to be worth a knot', () => {
  const out = deriveFrenchKnots(chart(field('F', 12, 12, [[5, 5, '.']]), [SKIN, WHITE]))
  assert.equal(out.knots, 0)
})

// ─── What it must leave alone ──────────────────────────────────────────────

record('a speck barely different from its field is left as a stitch', () => {
  const out = deriveFrenchKnots(chart(field('F', 12, 12, [[5, 5, 's']]), [SKIN, SHADE]))
  assert.equal(out.knots, 0)
})

record('a speck on the silhouette edge is left alone', () => {
  const rows = field('F', 12, 12, [[5, 5, '#']])
  // Open the fabric up beside the speck: it is no longer interior.
  rows[4] = rows[4]!.slice(0, 4) + '   ' + rows[4]!.slice(7)
  const out = deriveFrenchKnots(chart(rows, [SKIN, DARK]))
  assert.equal(out.knots, 0)
})

record('a speck on a boundary between two fields is left alone', () => {
  // Half face, half dark: the 5x5 ring round the speck is not one field.
  const rows: string[] = []
  for (let y = 0; y < 12; y++) rows.push('FFFFFF######')
  const withSpeck = rows.map((r, y) => (y === 5 ? 'FFFFF#######' : r))
  const out = deriveFrenchKnots(chart(withSpeck, [SKIN, DARK]))
  assert.equal(out.knots, 0)
})

record('a two-stitch mark is a shape, not a knot', () => {
  const out = deriveFrenchKnots(
    chart(field('F', 12, 12, [[5, 5, '#'], [5, 6, '#']]), [SKIN, DARK]),
  )
  assert.equal(out.knots, 0)
})

record('a chart that already carries knots is never re-knotted', () => {
  const once = deriveFrenchKnots(chart(field('F', 12, 12, [[5, 5, '#']]), [SKIN, DARK]))
  const twice = deriveFrenchKnots(once.data)
  assert.equal(twice.knots, 0)
  assert.equal(twice.data.grid.frenchKnots.length, 1)
})

record('the derivation never mutates the chart it was given', () => {
  const data = chart(field('F', 12, 12, [[5, 5, '#']]), [SKIN, DARK])
  deriveFrenchKnots(data)
  assert.equal(data.grid.frenchKnots.length, 0)
  assert.equal(data.grid.cells.find((c) => c.x === 5 && c.y === 5)?.s, '#')
})

record('the ceiling holds on a chart full of specks', () => {
  const specks: [number, number, string][] = []
  for (let y = 3; y < 60; y += 4) {
    for (let x = 3; x < 60; x += 4) specks.push([x, y, '#'])
  }
  const out = deriveFrenchKnots(chart(field('F', 64, 64, specks), [SKIN, DARK]))
  assert.ok(out.knots <= MAX_KNOTS, `${out.knots} knots is more than the ceiling`)
  assert.ok(out.knots > 0)
})

record('the knotted chart still validates against the schema', () => {
  const out = deriveFrenchKnots(chart(field('F', 12, 12, [[5, 5, '#']]), [SKIN, DARK]))
  const parsed = parsePatternData(out.data)
  assert.equal(parsed.grid.frenchKnots.length, 1)
})

// ─── Report ────────────────────────────────────────────────────────────────

const failed = results.filter((r) => !r.passed)
for (const r of results) {
  console.log(`${r.passed ? 'PASS' : 'FAIL'}: ${r.name}`)
  if (!r.passed && r.detail) console.log(`     ${r.detail}`)
}
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length > 0) process.exit(1)
