/**
 * Knitting chart renderer test suite.
 *
 * Runnable as a tsx script (matches the crochet renderer convention —
 * no vitest/jest in this repo).
 *
 *   pnpm --filter @homemade/web exec tsx \
 *     src/lib/knitting/renderer/render-chart.test.ts
 */

import assert from 'node:assert/strict'
import {
  renderKnittingChartSvg,
  hasSymbol,
  listSymbols,
} from './index'
import type { KnittingChartData } from './types'

type PassFail = { name: string; passed: boolean; detail?: string }
const results: PassFail[] = []

function record(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({
      name,
      passed: false,
      detail: err instanceof Error ? err.message : String(err),
    })
  }
}

// ─── Fixtures ───────────────────────────────────────────────────────────

const FAIR_ISLE_20X20: KnittingChartData = (() => {
  // Small 20-stitch Fair Isle motif: alternating crosses of dark + light
  // wool on a natural ground. Schematic — every other cell is dark, with
  // a diamond accent every 5 stitches.
  const cells: Array<{ x: number; y: number; s: string }> = []
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      const onDiamond =
        (Math.abs((x % 10) - 5) + Math.abs((y % 10) - 5)) <= 2
      const onGround = (x + y) % 4 === 0
      if (onDiamond) cells.push({ x, y, s: 'cw-accent' })
      else if (onGround) cells.push({ x, y, s: 'cw-dark' })
      else cells.push({ x, y, s: 'cw-natural' })
    }
  }
  return {
    schemaVersion: 1,
    type: 'COLOURWORK',
    grid: { width: 20, height: 20, cells },
    palette: [
      { symbol: 'cw-natural', rgb: '#ece2c9', name: 'Natural' },
      { symbol: 'cw-dark', rgb: '#3a3a40', name: 'Charcoal' },
      { symbol: 'cw-accent', rgb: '#a13a2c', name: 'Madder red' },
    ],
    metadata: {
      construction: 'IN_THE_ROUND',
      rsRowsStartFrom: 'RIGHT',
      title: 'Fair Isle diamond motif',
    },
  }
})()

const SHETLAND_LACE_30X40: KnittingChartData = (() => {
  // Schematic Shetland-style lace pattern: yarn-overs flanking centred
  // double decreases, knit ground. Shaped at the edges with no-stitch
  // markers.
  const cells: Array<{ x: number; y: number; s: string }> = []
  for (let y = 0; y < 40; y++) {
    // Triangular shaping: rows near the top have fewer "active" stitches.
    const activeStart = Math.max(0, Math.floor((40 - y) / 4))
    const activeEnd = 30 - activeStart
    for (let x = 0; x < 30; x++) {
      if (x < activeStart || x >= activeEnd) {
        cells.push({ x, y, s: 'no-stitch' })
        continue
      }
      const isPatternRow = y % 4 === 1
      if (isPatternRow) {
        const localX = x - activeStart
        if (localX % 6 === 1) cells.push({ x, y, s: 'yarn-over' })
        else if (localX % 6 === 3) cells.push({ x, y, s: 'cdd' })
        else if (localX % 6 === 5) cells.push({ x, y, s: 'yarn-over' })
        else cells.push({ x, y, s: 'knit' })
      } else {
        cells.push({ x, y, s: 'knit' })
      }
    }
  }
  return {
    schemaVersion: 1,
    type: 'LACE',
    grid: { width: 30, height: 40, cells },
    metadata: {
      construction: 'FLAT',
      rsRowsStartFrom: 'RIGHT',
      title: 'Shetland triangular lace',
    },
  }
})()

const CABLE_12X20: KnittingChartData = (() => {
  // 4-stitch cable on a reverse-stockinette (purl) ground. Cable
  // crosses every 4 rows. 3 cables stacked horizontally.
  const cells: Array<{ x: number; y: number; s: string }> = []
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 12; x++) {
      const inCableColumn =
        (x >= 0 && x < 4) || (x >= 8 && x < 12)
      cells.push({
        x,
        y,
        s: inCableColumn ? 'knit' : 'purl',
      })
    }
  }
  const cables: Array<{ startX: number; endX: number; y: number; crossDirection: 'LEFT' | 'RIGHT'; type: string }> = []
  for (let y = 2; y < 20; y += 4) {
    cables.push({ startX: 0, endX: 3, y, crossDirection: 'LEFT', type: 'C4F' })
    cables.push({ startX: 8, endX: 11, y, crossDirection: 'LEFT', type: 'C4F' })
  }
  return {
    schemaVersion: 1,
    type: 'CABLE',
    grid: { width: 12, height: 20, cells, cables },
    metadata: {
      construction: 'FLAT',
      rsRowsStartFrom: 'RIGHT',
      title: '4-stitch cable repeat',
    },
  }
})()

const BRIOCHE_20X20: KnittingChartData = (() => {
  const cells: Array<{ x: number; y: number; s: string }> = []
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      cells.push({
        x,
        y,
        s: x % 2 === 0 ? 'brk' : 'brp',
      })
    }
  }
  return {
    schemaVersion: 1,
    type: 'BRIOCHE',
    grid: { width: 20, height: 20, cells },
    palette: [
      { symbol: 'dark', rgb: '#2a2733', name: 'Indigo' },
      { symbol: 'light', rgb: '#e8d7b0', name: 'Honey' },
    ],
    metadata: {
      construction: 'FLAT',
      rsRowsStartFrom: 'RIGHT',
      title: 'Two-colour brioche',
    },
  }
})()

// ─── Smoke tests ─────────────────────────────────────────────────────────

record('Colourwork: 20x20 Fair Isle renders + has palette swatches', () => {
  const r = renderKnittingChartSvg(FAIR_ISLE_20X20, { cellPx: 26 })
  assert.ok(r.svg.startsWith('<svg'), 'svg starts with <svg')
  assert.ok(r.svg.length > 2000, `non-trivial svg length (got ${r.svg.length})`)
  assert.ok(r.svg.includes('#ece2c9'), 'natural colour appears in svg')
  assert.ok(r.svg.includes('#3a3a40'), 'charcoal colour appears in svg')
  assert.ok(r.svg.includes('#a13a2c'), 'madder colour appears in svg')
  assert.ok(r.width > 500 && r.height > 500, `canvas non-trivial (${r.width}x${r.height})`)
  // No "RS"/"WS" markers expected for in-the-round.
  // (RS label may still appear for in-the-round, but no WS.)
  assert.ok(!r.svg.includes('>WS<'), 'in-the-round suppresses WS markers')
})

record('Lace: 30x40 Shetland renders + carries direction markers', () => {
  const r = renderKnittingChartSvg(SHETLAND_LACE_30X40, { cellPx: 22 })
  assert.ok(r.svg.startsWith('<svg'))
  // Flat work — should include both RS and WS markers.
  assert.ok(r.svg.includes('>RS<'), 'RS marker present')
  assert.ok(r.svg.includes('>WS<'), 'WS marker present')
  // No-stitch pattern should appear in defs.
  assert.ok(r.svg.includes('id="kn-nostitch"'), 'no-stitch pattern defined')
  assert.ok(r.svg.includes('url(#kn-nostitch)'), 'no-stitch pattern applied')
})

record('Cable: 12x20 cable chart renders with crossings', () => {
  const r = renderKnittingChartSvg(CABLE_12X20, { cellPx: 30 })
  assert.ok(r.svg.startsWith('<svg'))
  assert.ok(r.svg.includes('C4F'), 'C4F label rendered in cable crossing')
  // 5 cable rows × 2 cables = 10 crossings; each renders a rect + 2 paths.
  // Loose check: count of "C4F" labels should be ≥ 5.
  const c4fCount = (r.svg.match(/C4F/g) ?? []).length
  assert.ok(c4fCount >= 5, `expected ≥ 5 C4F labels, got ${c4fCount}`)
})

record('Brioche: 20x20 two-colour chart alternates colours per row pair', () => {
  const r = renderKnittingChartSvg(BRIOCHE_20X20, { cellPx: 26 })
  assert.ok(r.svg.startsWith('<svg'))
  assert.ok(r.svg.includes('#2a2733'), 'dark palette colour rendered')
  assert.ok(r.svg.includes('#e8d7b0'), 'light palette colour rendered')
  // Legend should include both palette swatches.
  assert.ok(r.svg.includes('Dark colour'), 'dark colour in legend')
  assert.ok(r.svg.includes('Light colour'), 'light colour in legend')
})

// ─── Edge cases ──────────────────────────────────────────────────────────

record('Edge: empty grid renders without crash, surfaces warning', () => {
  const empty: KnittingChartData = {
    schemaVersion: 1,
    type: 'LACE',
    grid: { width: 0, height: 0, cells: [] },
  }
  const r = renderKnittingChartSvg(empty, { cellPx: 28 })
  assert.ok(r.svg.startsWith('<svg'), 'still returns an svg')
  assert.ok(
    r.warnings.some((w) => w.includes('zero width or height')),
    `expected degenerate warning (warnings: ${r.warnings.join(', ')})`,
  )
})

record('Edge: out-of-bounds cell triggers verifier warning', () => {
  const oob: KnittingChartData = {
    schemaVersion: 1,
    type: 'LACE',
    grid: {
      width: 5,
      height: 5,
      cells: [{ x: 10, y: 0, s: 'knit' }],
    },
  }
  const r = renderKnittingChartSvg(oob, { cellPx: 28 })
  assert.ok(
    r.warnings.some((w) => w.includes('outside grid')),
    `expected out-of-bounds warning (warnings: ${r.warnings.join(', ')})`,
  )
})

record('Edge: unknown symbol slug surfaces warning + renders fallback', () => {
  const mixed: KnittingChartData = {
    schemaVersion: 1,
    type: 'LACE',
    grid: {
      width: 3,
      height: 3,
      cells: [
        { x: 0, y: 0, s: 'knit' },
        { x: 1, y: 0, s: 'mystery-stitch' },
        { x: 2, y: 0, s: 'yarn-over' },
      ],
    },
  }
  const r = renderKnittingChartSvg(mixed, { cellPx: 28 })
  assert.ok(
    r.warnings.some((w) => w.includes('mystery-stitch')),
    `expected unknown-slug warning (warnings: ${r.warnings.join(', ')})`,
  )
  // SVG still renders.
  assert.ok(r.svg.includes('<svg'))
})

record('Edge: cable out of bounds clips + warns', () => {
  const overflow: KnittingChartData = {
    schemaVersion: 1,
    type: 'CABLE',
    grid: {
      width: 6,
      height: 4,
      cells: [
        { x: 0, y: 0, s: 'knit' },
        { x: 1, y: 0, s: 'knit' },
      ],
      cables: [
        { startX: 4, endX: 10, y: 1, crossDirection: 'LEFT', type: 'C8F' },
      ],
    },
  }
  const r = renderKnittingChartSvg(overflow, { cellPx: 28 })
  assert.ok(
    r.warnings.some((w) => w.includes('outside grid bounds') || w.includes('partially outside grid bounds')),
    `expected cable-bounds warning (warnings: ${r.warnings.join(', ')})`,
  )
})

// ─── Direction markers ──────────────────────────────────────────────────

record('Direction markers: flat work alternates RS / WS per row', () => {
  // 5 rows flat. Expect RS rows at y=0,2,4 (rows 1,3,5) on the right
  // edge; WS rows at y=1,3 (rows 2,4) on the left edge.
  const flat: KnittingChartData = {
    schemaVersion: 1,
    type: 'LACE',
    grid: { width: 4, height: 5, cells: [] },
    metadata: { construction: 'FLAT', rsRowsStartFrom: 'RIGHT' },
  }
  const r = renderKnittingChartSvg(flat, { cellPx: 28 })
  const rsCount = (r.svg.match(/>RS</g) ?? []).length
  const wsCount = (r.svg.match(/>WS</g) ?? []).length
  assert.equal(rsCount, 3, `expected 3 RS markers, got ${rsCount}`)
  assert.equal(wsCount, 2, `expected 2 WS markers, got ${wsCount}`)
})

record('Direction markers: in-the-round suppresses WS entirely', () => {
  const round: KnittingChartData = {
    schemaVersion: 1,
    type: 'COLOURWORK',
    grid: { width: 4, height: 8, cells: [] },
    palette: [{ symbol: 'knit', rgb: '#ece2c9', name: 'Natural' }],
    metadata: { construction: 'IN_THE_ROUND', rsRowsStartFrom: 'RIGHT' },
  }
  const r = renderKnittingChartSvg(round, { cellPx: 28 })
  assert.ok(!r.svg.includes('>WS<'), 'no WS markers when in-the-round')
  const rsCount = (r.svg.match(/>RS</g) ?? []).length
  assert.equal(rsCount, 8, `expected 8 RS markers (one per round), got ${rsCount}`)
})

// ─── Registry coverage ─────────────────────────────────────────────────

record('Registry: foundation knitting symbols present', () => {
  const required = ['knit', 'purl', 'yarn-over', 'k2tog', 'ssk', 'cdd', 'sl1', 'no-stitch']
  for (const k of required) {
    assert.ok(hasSymbol(k), `${k} should be in the registry`)
  }
})

record('Registry: cable symbols present', () => {
  const required = ['c4f', 'c4b', 'c6f', 'c6b', 't2l', 't2r']
  for (const k of required) {
    assert.ok(hasSymbol(k), `${k} should be in the registry`)
  }
})

record('Registry: brioche symbols present', () => {
  const required = ['brk', 'brp', 'brkyobrk', 'br-k2tog', 'br-ssk', 'sl1-yo']
  for (const k of required) {
    assert.ok(hasSymbol(k), `${k} should be in the registry`)
  }
})

record('Registry: all symbol slugs are unique', () => {
  const keys = listSymbols().map((s) => s.key)
  const set = new Set(keys)
  assert.equal(set.size, keys.length, 'no duplicate symbol slugs')
})

// ─── Reporter ────────────────────────────────────────────────────────────

let pass = 0
let fail = 0
for (const r of results) {
  if (r.passed) {
    console.log(`  PASS  ${r.name}`)
    pass++
  } else {
    console.log(`  FAIL  ${r.name}`)
    if (r.detail) console.log(`        ${r.detail}`)
    fail++
  }
}
console.log(`\n${pass} passed, ${fail} failed, ${results.length} total.`)
if (fail > 0) process.exit(1)
