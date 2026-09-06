/**
 * Symbol assignment tests — the rules a printed chart's key depends on.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx src/lib/studio/symbol-assignment.test.ts
 *
 * The centrepiece is a synthetic 120-colour palette laid out as a chart, which
 * is the showpiece tier: enough colours that the catalogue's confusable groups
 * have to be reused, so the "never for two colours that touch" rule is doing
 * real work rather than being satisfied by having plenty of glyphs spare.
 */

import assert from 'node:assert/strict'
import {
  assignChartSymbols,
  buildAdjacency,
  symbolSpec,
  SYMBOL_GLYPHS,
  SYMBOL_SPECS,
  type SymbolColour,
} from './symbol-assignment'

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
// The catalogue itself
// ───────────────────────────────────────────────────────────────────────────

console.log('\ncatalogue')

test('every glyph appears exactly once', () => {
  assert.equal(new Set(SYMBOL_GLYPHS).size, SYMBOL_GLYPHS.length)
})

test('carries at least the 154 glyphs a showpiece chart can need', () => {
  assert.ok(SYMBOL_GLYPHS.length >= 154, `only ${SYMBOL_GLYPHS.length} glyphs`)
})

test('the known confusable groups are each one family', () => {
  const groups = [
    ['◐', '◑', '◒', '◓'],
    ['▴', '▵', '▸', '▹', '▾', '▿'],
    ['○', '◯', '◌'],
    ['▪', '▫', '■', '□'].filter((g) => symbolSpec(g)),
    ['◆', '◇'],
    ['★', '☆'],
    ['♥', '♡'],
  ]
  for (const group of groups) {
    const families = new Set(group.map((g) => symbolSpec(g)?.family))
    assert.equal(
      families.size,
      1,
      `${group.join('')} spans ${[...families].join(', ')}`,
    )
  }
})

test('the small triangles do not share a family with the large ones', () => {
  assert.notEqual(symbolSpec('▴')!.family, symbolSpec('▲')!.family)
})

test('the head of the catalogue is the distinctive marks', () => {
  const head = SYMBOL_GLYPHS.slice(0, 8)
  for (const g of ['×', '●', '▲', '■']) {
    assert.ok(head.includes(g), `${g} is not near the front (head: ${head.join('')})`)
  }
})

// ───────────────────────────────────────────────────────────────────────────
// A synthetic 120-colour showpiece
// ───────────────────────────────────────────────────────────────────────────

/**
 * 120 colours arranged as a 60 × 40 chart of horizontal bands, three rows per
 * colour, so every colour touches the two beside it in the ramp — the case
 * where a confusable pair would be most obvious to a stitcher. The ramp walks
 * hue and lightness together so neighbouring bands are also close in colour.
 */
function syntheticShowpiece(): {
  colours: SymbolColour[]
  cells: Array<{ x: number; y: number; s: string }>
  width: number
  height: number
} {
  const n = 120
  const width = 60
  const height = 360
  const colours: SymbolColour[] = []
  const cells: Array<{ x: number; y: number; s: string }> = []
  for (let i = 0; i < n; i++) {
    const key = `C${String(i).padStart(3, '0')}`
    colours.push({ key, rgb: rampColour(i, n), count: (n - i) * 40 })
    for (let row = 0; row < 3; row++) {
      const y = i * 3 + row
      for (let x = 0; x < width; x++) cells.push({ x, y, s: key })
    }
  }
  return { colours, cells, width, height }
}

/** A smooth ramp: hue rotates, lightness sweeps twice across the range. */
function rampColour(i: number, n: number): string {
  const hue = (i / n) * 360
  const light = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin((i / n) * Math.PI * 4))
  const [r, g, b] = hslToRgb(hue, 0.55, light)
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const [r1, g1, b1] =
    hp < 1 ? [c, x, 0]
    : hp < 2 ? [x, c, 0]
    : hp < 3 ? [0, c, x]
    : hp < 4 ? [0, x, c]
    : hp < 5 ? [x, 0, c]
    : [c, 0, x]
  const m = l - c / 2
  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ]
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

console.log('\n120-colour showpiece')

const show = syntheticShowpiece()
const adjacency = buildAdjacency(show.cells, show.width, show.height)
const assigned = assignChartSymbols(show.colours, adjacency)

test('every colour gets a symbol', () => {
  assert.equal(assigned.size, show.colours.length)
  for (const c of show.colours) {
    assert.ok(assigned.get(c.key), `${c.key} has no symbol`)
    assert.notEqual(assigned.get(c.key), '?', `${c.key} fell off the catalogue`)
  }
})

test('no two colours share a symbol', () => {
  const used = [...assigned.values()]
  assert.equal(new Set(used).size, used.length)
})

test('no two colours that touch share a confusable group', () => {
  const clashes: string[] = []
  for (const [key, neighbours] of adjacency) {
    const mine = symbolSpec(assigned.get(key)!)
    for (const other of neighbours) {
      const theirs = symbolSpec(assigned.get(other)!)
      if (mine && theirs && mine.family === theirs.family) {
        clashes.push(`${key}${mine.glyph} touches ${other}${theirs.glyph} (${mine.family})`)
      }
    }
  }
  assert.deepEqual(clashes, [])
})

test('no two colours close in colour share a confusable group', () => {
  const clashes: string[] = []
  for (let i = 0; i < show.colours.length; i++) {
    for (let j = i + 1; j < show.colours.length; j++) {
      const a = show.colours[i]!
      const b = show.colours[j]!
      if (rgbGap(a.rgb, b.rgb) >= 52) continue
      const fa = symbolSpec(assigned.get(a.key)!)?.family
      const fb = symbolSpec(assigned.get(b.key)!)?.family
      if (fa && fa === fb) clashes.push(`${a.key} / ${b.key} both ${fa}`)
    }
  }
  assert.deepEqual(clashes, [])
})

test('light-weight glyphs go to dark floss', () => {
  const misplaced: string[] = []
  for (const c of show.colours) {
    const spec = symbolSpec(assigned.get(c.key)!)
    if (spec?.weight === 'light' && luminance(c.rgb) > 0.58) {
      misplaced.push(`${spec.glyph} on ${c.rgb} (luminance ${luminance(c.rgb).toFixed(2)})`)
    }
  }
  assert.deepEqual(misplaced, [])
})

test('the busiest colours take the most distinctive marks', () => {
  const busiest = show.colours
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  for (const c of busiest) {
    const rank = SYMBOL_GLYPHS.indexOf(assigned.get(c.key)!)
    assert.ok(rank < 40, `${c.key} got ${assigned.get(c.key)} at catalogue rank ${rank}`)
  }
})

test('the catalogue is reused rather than wasted at 120 colours', () => {
  const families = new Set(
    [...assigned.values()].map((g) => symbolSpec(g)?.family),
  )
  // 120 colours across ~50 families means groups are genuinely reused; the
  // rules above are what keep that safe.
  assert.ok(families.size < show.colours.length, 'no family was reused at all')
})

function rgbGap(a: string, b: string): number {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  const dr = pa[0]! - pb[0]!
  const dg = pa[1]! - pb[1]!
  const db = pa[2]! - pb[2]!
  return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db) / 3
}

// ───────────────────────────────────────────────────────────────────────────
// Small charts
// ───────────────────────────────────────────────────────────────────────────

console.log('\nsmall charts')

test('a nine-colour chart takes nine different families', () => {
  const colours: SymbolColour[] = Array.from({ length: 9 }, (_, i) => ({
    key: `k${i}`,
    rgb: rampColour(i * 13, 120),
    count: 100 - i,
  }))
  const glyphs = assignChartSymbols(colours, new Map())
  const families = new Set([...glyphs.values()].map((g) => symbolSpec(g)?.family))
  assert.equal(families.size, 9)
})

test('assignment is deterministic', () => {
  const first = assignChartSymbols(show.colours, adjacency)
  const second = assignChartSymbols(show.colours.slice().reverse(), adjacency)
  for (const c of show.colours) {
    assert.equal(first.get(c.key), second.get(c.key), `${c.key} drifted`)
  }
})

test('the catalogue metadata covers every glyph', () => {
  for (const spec of SYMBOL_SPECS) {
    assert.ok(spec.family.length > 0)
    assert.ok(spec.weight === 'light' || spec.weight === 'solid')
  }
})

console.log(failures === 0 ? '\nall symbol-assignment tests passed' : `\n${failures} failing`)
process.exit(failures === 0 ? 0 : 1)
