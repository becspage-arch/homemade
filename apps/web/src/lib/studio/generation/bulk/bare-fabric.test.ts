/**
 * Bare-fabric rule tests — synthetic grids, one per case the flood fill has to
 * get right, plus the binary rule's exclusions.
 *
 *   cd apps/web && pnpm exec tsx src/lib/studio/generation/bulk/bare-fabric.test.ts
 */

import assert from 'node:assert/strict'
import type { PatternData, PatternCell, PaletteEntry } from '@homemade/db'
import {
  isNearWhite,
  scanBackground,
  bareFabricVerdict,
  clearBackground,
  MIN_BACKGROUND_SHARE,
  MIN_OPEN_PERIMETER,
  fullCoverageByIntent,
  laneForSize,
} from './bare-fabric'

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

// ─── Grid builders ─────────────────────────────────────────────────────────

const WHITE: PaletteEntry = {
  symbol: '.', brand: 'DMC', code: 'B5200', name: 'Snow white', rgb: '#ffffff',
  strandsFullCross: 2, strandsBackstitch: 1,
}
const RED: PaletteEntry = {
  symbol: 'X', brand: 'DMC', code: '321', name: 'Red', rgb: '#bd1136',
  strandsFullCross: 2, strandsBackstitch: 1,
}
const BLUE: PaletteEntry = {
  symbol: 'O', brand: 'DMC', code: '336', name: 'Blue', rgb: '#0c275e',
  strandsFullCross: 2, strandsBackstitch: 1,
}

/**
 * Build a chart from an ASCII picture. One character per cell; a space is bare
 * fabric, any other character is a stitch in the palette entry with that symbol.
 */
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

/** Render a chart back to ASCII so a test can assert on the whole picture. */
function picture(data: PatternData): string[] {
  const { width, height, cells } = data.grid
  const rows = Array.from({ length: height }, () => Array<string>(width).fill(' '))
  for (const c of cells) rows[c.y]![c.x] = c.s
  return rows.map((r) => r.join(''))
}

// ─── What counts as white ──────────────────────────────────────────────────

record('isNearWhite: the white flosses are white', () => {
  for (const [code, rgb] of [['B5200', '#ffffff'], ['BLANC', '#fbfaf6'], ['3865', '#f6efe1']] as const) {
    assert.equal(isNearWhite({ brand: 'DMC', code, rgb }), true, `${code} should be near-white`)
  }
  assert.equal(isNearWhite({ brand: 'ANCHOR', code: '2', rgb: '#ffffff' }), true)
  assert.equal(isNearWhite({ brand: 'MADEIRA', code: '2402', rgb: '#ffffff' }), true)
})

record('isNearWhite: warm creams are design colours, not background', () => {
  // Ecru and Off White 746 are chosen on purpose for an ivory ground or a pale
  // petal. Only a colourless white is background.
  assert.equal(isNearWhite({ brand: 'DMC', code: 'Ecru', rgb: '#fff7e7' }), false)
  assert.equal(isNearWhite({ brand: 'DMC', code: '746', rgb: '#faf2d5' }), false)
  assert.equal(isNearWhite({ brand: 'DMC', code: '762', rgb: '#e8e9e8' }), false, 'pale grey is not white')
  assert.equal(isNearWhite({ brand: 'DMC', code: '321', rgb: '#bd1136' }), false)
})

record('isNearWhite: an unlisted code still reads off its colour', () => {
  assert.equal(isNearWhite({ brand: 'DMC', code: '9999', rgb: '#fefefe' }), true)
})

// ─── The flood fill ────────────────────────────────────────────────────────

record('background: white touching the border is background', () => {
  const data = chart(
    [
      '........',
      '........',
      '..XXXX..',
      '..XXXX..',
      '..XXXX..',
      '........',
    ],
    [WHITE, RED],
  )
  const s = scanBackground(data)
  assert.equal(s.nearWhiteCells, 36)
  assert.equal(s.borderWhiteCells, 36)
  assert.equal(s.interiorWhiteCells, 0)
  assert.equal(s.borderWhiteShare, 36 / 48)
})

record('background: white inside a stitched frame is the design ground, kept', () => {
  // Delft / blackwork: a stitched border, white inside it. Nothing to clear.
  const data = chart(
    [
      'XXXXXXXX',
      'X......X',
      'X..OO..X',
      'X..OO..X',
      'X......X',
      'XXXXXXXX',
    ],
    [WHITE, RED, BLUE],
  )
  const s = scanBackground(data)
  assert.equal(s.nearWhiteCells, 20)
  assert.equal(s.borderWhiteCells, 0, 'the frame stops the fill')
  assert.equal(s.interiorWhiteCells, 20)
  assert.equal(bareFabricVerdict(data).convert, false)
})

record('background: an interior white is never touched', () => {
  // A white cat inside a red field that runs to the edge.
  const data = chart(
    [
      'XXXXXXXX',
      'XXXXXXXX',
      'XX....XX',
      'XX....XX',
      'XXXXXXXX',
      'XXXXXXXX',
    ],
    [WHITE, RED],
  )
  const s = scanBackground(data)
  assert.equal(s.borderWhiteCells, 0)
  assert.equal(s.interiorWhiteCells, 8)
})

record('background: the fill runs through bare fabric to reach outer white', () => {
  // A row of bare fabric between the border and a white halo — still outside.
  const data = chart(
    [
      '        ',
      ' ...... ',
      ' .XXXX. ',
      ' .XXXX. ',
      ' ...... ',
      '        ',
    ],
    [WHITE, RED],
  )
  const s = scanBackground(data)
  assert.equal(s.borderWhiteCells, 16)
  assert.equal(s.interiorWhiteCells, 0)
})

record('background: a diagonal outline is a wall, not a sieve', () => {
  // Four-connectivity is load-bearing. This diamond's edge is a one-cell
  // staircase; an eight-connected fill would slip diagonally between two steps
  // and eat the 24 white cells inside it. White surrounds it as well, so both
  // halves of the count have to come out right.
  const data = chart(
    [
      '...XX...',
      '..X..X..',
      '.X....X.',
      'X......X',
      'X......X',
      '.X....X.',
      '..X..X..',
      '...XX...',
    ],
    [WHITE, RED],
  )
  const s = scanBackground(data)
  assert.equal(s.nearWhiteCells, 48)
  assert.equal(s.borderWhiteCells, 24, 'the white outside the diamond')
  assert.equal(s.interiorWhiteCells, 24, 'the white inside it survives')
})

// ─── The binary rule ───────────────────────────────────────────────────────

record('rule: a border-connected white background converts', () => {
  const data = chart(
    [
      '........',
      '..XXXX..',
      '..XXXX..',
      '........',
    ],
    [WHITE, RED],
  )
  const v = bareFabricVerdict(data)
  assert.equal(v.convert, true)
  assert.ok(v.reason.includes('white background'), v.reason)
})

record('rule: a sliver of edge white is left alone', () => {
  // Two white cells in 48 — 4%, under the floor.
  const data = chart(
    [
      '.XXXXXX.',
      'XXXXXXXX',
      'XXXXXXXX',
      'XXXXXXXX',
      'XXXXXXXX',
      'XXXXXXXX',
    ],
    [WHITE, RED],
  )
  const s = scanBackground(data)
  assert.ok(s.borderWhiteShare < MIN_BACKGROUND_SHARE)
  assert.equal(bareFabricVerdict(data).convert, false)
})

record('rule: white that is part of the picture is left alone', () => {
  // A full-bleed painted scene: stitched corner to corner, with a bank of white
  // cloud along the top edge. The cloud reaches the border, but only a sliver of
  // the chart's edge is open — so the white is picture, not ground.
  const data = chart(
    [
      'OOO....OOO',
      'OOO....OOO',
      'OOO....OOO',
      'XXXXXXXXXX',
      'XXXXXXXXXX',
      'XXXXXXXXXX',
      'XXXXXXXXXX',
      'XXXXXXXXXX',
      'XXXXXXXXXX',
      'XXXXXXXXXX',
    ],
    [WHITE, RED, BLUE],
  )
  const s = scanBackground(data)
  assert.equal(s.borderWhiteCells, 12, 'the cloud is border-connected')
  assert.ok(s.borderWhiteShare >= MIN_BACKGROUND_SHARE, 'and big enough to trip the share test')
  assert.ok(s.openPerimeterShare < MIN_OPEN_PERIMETER, `edge open ${s.openPerimeterShare}`)
  const v = bareFabricVerdict(data)
  assert.equal(v.convert, false)
  assert.ok(v.reason.includes('part of the picture'), v.reason)
})

record('rule: a background that goes all the way round converts', () => {
  // The same amount of white, but round the outside of the design instead of
  // inside the picture.
  const data = chart(
    [
      '..........',
      '.OOOOOOOO.',
      '.OOOOOOOO.',
      '.XXXXXXXX.',
      '.XXXXXXXX.',
      '.XXXXXXXX.',
      '.XXXXXXXX.',
      '.XXXXXXXX.',
      '.XXXXXXXX.',
      '..........',
    ],
    [WHITE, RED, BLUE],
  )
  const s = scanBackground(data)
  assert.equal(s.openPerimeterShare, 1)
  assert.equal(bareFabricVerdict(data).convert, true)
})

record('rule: full coverage in real colour is exempt', () => {
  // 94% stitched in colour with a couple of white corners: a showpiece, not a
  // white background.
  const rows = Array.from({ length: 10 }, () => 'X'.repeat(10))
  rows[0] = '.' + 'X'.repeat(8) + '.'
  rows[9] = '.' + 'X'.repeat(8) + '.'
  const data = chart(rows, [WHITE, RED])
  const s = scanBackground(data)
  assert.equal(s.nonWhiteCoverage, 0.96)
  assert.equal(bareFabricVerdict(data).convert, false)
})

record('rule: the showpiece colour ceiling is exempt', () => {
  const rows = ['........', '..XXXX..', '..XXXX..', '........']
  const filler: PaletteEntry[] = Array.from({ length: 60 }, (_, i) => ({
    ...BLUE,
    symbol: `f${i}`,
    code: `f${i}`,
  }))
  const data = chart(rows, [WHITE, RED, ...filler])
  const v = bareFabricVerdict(data)
  assert.equal(v.convert, false)
  assert.ok(v.reason.includes('showpiece tier'), v.reason)
})

record('rule: a brief that says full coverage overrides the grid', () => {
  const data = chart(['........', '..XXXX..', '..XXXX..', '........'], [WHITE, RED])
  assert.equal(bareFabricVerdict(data).convert, true)
  assert.equal(bareFabricVerdict(data, { fullCoverageByIntent: true }).convert, false)
})

// ─── Full coverage by intent (the converter's exemption) ───────────────────

record('intent: the dense lane is full coverage whatever style it is', () => {
  for (const style of ['bright', 'cute', 'scene', 'showpiece']) {
    assert.equal(fullCoverageByIntent({ lane: 'dense', style }), true, style)
  }
})

record('intent: large scenes, showpieces and landscapes are full coverage', () => {
  for (const style of ['scene', 'showpiece', 'landscape']) {
    assert.equal(fullCoverageByIntent({ lane: 'large', style }), true, style)
  }
})

record('intent: every other lane and style clears its background', () => {
  assert.equal(fullCoverageByIntent({ lane: 'large', style: 'cute' }), false)
  assert.equal(fullCoverageByIntent({ lane: 'medium', style: 'scene' }), false)
  assert.equal(fullCoverageByIntent({ lane: 'small', style: 'bright' }), false)
  assert.equal(fullCoverageByIntent({ lane: 'mini', style: 'cute' }), false)
})

record('intent: a row with no brief on record falls through to the grid rule', () => {
  assert.equal(fullCoverageByIntent({}), false)
  assert.equal(fullCoverageByIntent({ lane: null, style: null }), false)
})

record('laneForSize: reads a lane off the longest side', () => {
  assert.equal(laneForSize(68, 68), 'mini')
  assert.equal(laneForSize(112, 112), 'small')
  assert.equal(laneForSize(150, 165), 'medium')
  assert.equal(laneForSize(205, 110), 'large')
  assert.equal(laneForSize(300, 300), 'huge')
})

// ─── The rewrite ───────────────────────────────────────────────────────────

record('clear: background goes, interior white and the design stay', () => {
  const data = chart(
    [
      '........',
      '..XXXX..',
      '..X..X..',
      '..XXXX..',
      '........',
    ],
    [WHITE, RED],
  )
  const out = clearBackground(data)
  assert.equal(out.removed, 28)
  assert.deepEqual(picture(out.data), [
    '        ',
    '  XXXX  ',
    '  X..X  ',
    '  XXXX  ',
    '        ',
  ])
  assert.deepEqual(out.droppedSymbols, [], 'white is still used inside the design')
  assert.equal(out.data.palette.length, 2)
})

record('clear: an unused white palette entry is dropped', () => {
  const data = chart(
    [
      '........',
      '..XXXX..',
      '..XXXX..',
      '........',
    ],
    [WHITE, RED],
  )
  const out = clearBackground(data)
  assert.deepEqual(out.droppedSymbols, ['.'])
  assert.deepEqual(out.data.palette.map((p) => p.symbol), ['X'])
})

record('clear: a white kept alive by back-stitch stays in the key', () => {
  const data = chart(['........', '..XXXX..', '..XXXX..', '........'], [WHITE, RED])
  data.grid.backstitch = [{ x1: 2, y1: 1, x2: 6, y2: 1, s: '.' }]
  const out = clearBackground(data)
  assert.deepEqual(out.droppedSymbols, [])
  assert.equal(out.data.palette.length, 2)
})

record('clear: idempotent — a second pass removes nothing', () => {
  const data = chart(['........', '..XXXX..', '..XXXX..', '........'], [WHITE, RED])
  const once = clearBackground(data)
  const twice = clearBackground(once.data)
  assert.equal(twice.removed, 0)
  assert.deepEqual(picture(twice.data), picture(once.data))
})

record('clear: leaves the original untouched', () => {
  const data = chart(['........', '..XXXX..', '..XXXX..', '........'], [WHITE, RED])
  const before = data.grid.cells.length
  clearBackground(data)
  assert.equal(data.grid.cells.length, before)
})

record('clear: an all-white chart is left alone rather than emptied', () => {
  const data = chart(['....', '....', '....'], [WHITE])
  const out = clearBackground(data)
  assert.equal(out.removed, 0)
  assert.equal(out.data.palette.length, 1)
})

// ─── Report ────────────────────────────────────────────────────────────────

const failed = results.filter((r) => !r.passed)
for (const r of results) {
  console.log(`${r.passed ? 'PASS' : 'FAIL'}: ${r.name}`)
  if (!r.passed && r.detail) console.log(`     ${r.detail}`)
}
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length > 0) process.exit(1)
