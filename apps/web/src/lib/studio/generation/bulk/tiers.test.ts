/**
 * THE TWO NEW SIZE TIERS — the quick-win clarity guard and the range rule that
 * spreads a batch across quick → mini → small/medium → large → one Pro piece.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx src/lib/studio/generation/bulk/tiers.test.ts
 *
 * Everything here is pure. `range.ts` was split out of the server-only planner
 * so the range rule could be tested at all, and `quick-win.ts` reads numbers
 * off a grid.
 */

import assert from 'node:assert/strict'
import { parsePatternData, PATTERN_SCHEMA_VERSION, type PatternData } from '@homemade/db'
import {
  enforceRange,
  laneFits,
  quickCapableSubjects,
  reserveQuickWin,

  FALLBACK_MID_CELLS,
  MAX_CELLS,
  MAX_COLOURS,
  QUICK_BATCH_FLOOR,
  DENSE_BATCH_FLOOR,
} from './range'
import {
  showpieceVerdict,
  SHOWPIECE_MIN_COLOURS,
  SHOWPIECE_MAX_COLOURS,
  SHOWPIECE_MIN_CELLS,
} from './showpiece'
import { SYMBOL_GLYPHS } from '@/lib/studio/symbol-assignment'
import {
  quickWinVerdict,
  measureQuickWin,
  QUICK_MAX_COLOURS,
  QUICK_MIN_BOX_SHARE,
  QUICK_MAX_STITCHED_SHARE,
} from './quick-win'
import { CROSS_STITCH_SIZE_LANES, SIZE_LANE_BY_NAME, LANE_ORDER } from './subject-pool'
import { fullCoverageByIntent } from './bare-fabric'
import { outlineModeFor } from './outline'
import { smoothingWantedFor } from './fractionals'
import type { CrossStitchBrief } from './planner'

/** Distinct chart symbols for the synthetic palettes below. */
const GLYPHS = '×●▲■◆★✚♥♠♣♦✦⬟◉►▴▼◐OSHMWKAEeRTZG9BPNYCUVJ'

const results: { name: string; passed: boolean; detail?: string }[] = []
function record(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: err instanceof Error ? err.message : String(err) })
  }
}

// ─────────────────────────── the lane table ───────────────────────────

record('both new lanes are in the table, in size order', () => {
  const names = CROSS_STITCH_SIZE_LANES.map((l) => l.lane)
  assert.deepEqual(names, [...LANE_ORDER])
  assert.equal(SIZE_LANE_BY_NAME.quick!.cells, '40–60')
  assert.equal(SIZE_LANE_BY_NAME.quick!.colours, '6–14')
  assert.equal(SIZE_LANE_BY_NAME.showpiece!.cells, '400–600')
  assert.equal(SIZE_LANE_BY_NAME.showpiece!.colours, '200–300')
})

record('the fallback canvas for each lane sits inside its own band', () => {
  for (const lane of CROSS_STITCH_SIZE_LANES) {
    const [lo, hi] = lane.cells.split('–').map((s) => parseInt(s, 10))
    const mid = FALLBACK_MID_CELLS[lane.lane]!
    assert.ok(mid >= lo! && mid <= hi!, `${lane.lane}: ${mid} outside ${lane.cells}`)
  }
})

record('the clamps reach the heirloom tier and no further', () => {
  assert.equal(MAX_CELLS, 600)
  assert.ok(MAX_COLOURS >= 300, 'a 300-colour showpiece would be clamped')
})

// ─────────────────── what the showpiece lane switches off ───────────────────

record('the showpiece lane is full coverage by intent', () => {
  assert.equal(fullCoverageByIntent({ lane: 'showpiece', style: 'scene' }), true)
  assert.equal(fullCoverageByIntent({ lane: 'showpiece', style: 'cute' }), true)
  // ...and the quick tier is emphatically not: its whole look is a motif on cloth.
  assert.equal(fullCoverageByIntent({ lane: 'quick', style: 'cute' }), false)
})

record('the showpiece lane takes no outline and no fractionals', () => {
  const chart = solidChart(20, 20, 6)
  assert.equal(outlineModeFor(chart, { lane: 'showpiece' }).mode, 'none')
  assert.equal(smoothingWantedFor(chart, { lane: 'showpiece' }).yes, false)
  // The quick tier keeps both — a small motif needs its edges drawn.
  assert.notEqual(outlineModeFor(chart, { lane: 'quick' }).mode, 'none')
})

// ─────────────────────────── the quick-win guard ───────────────────────────

record('a clean single motif passes the clarity guard', () => {
  const chart = motifChart(48, { radius: 17, colours: 8 })
  const verdict = quickWinVerdict(chart)
  assert.ok(verdict.ok, verdict.reasons.join(' · '))
})

record('a motif adrift in the frame is refused', () => {
  const chart = motifChart(48, { radius: 6, colours: 8 })
  const verdict = quickWinVerdict(chart)
  assert.equal(verdict.ok, false)
  assert.ok(
    verdict.reasons.some((r) => r.includes('fills only')),
    verdict.reasons.join(' · '),
  )
  assert.ok(verdict.measures.boxShare < QUICK_MIN_BOX_SHARE)
})

record('a full-coverage chart shrunk to 48 cells is refused', () => {
  const chart = solidChart(48, 48, 10)
  const verdict = quickWinVerdict(chart)
  assert.equal(verdict.ok, false)
  assert.ok(verdict.measures.stitchedShare > QUICK_MAX_STITCHED_SHARE)
})

record('too many flosses for a one-evening make is refused', () => {
  const chart = motifChart(48, { radius: 17, colours: QUICK_MAX_COLOURS + 4 })
  const verdict = quickWinVerdict(chart)
  assert.equal(verdict.ok, false)
  assert.ok(verdict.reasons.some((r) => r.includes('flosses')), verdict.reasons.join(' · '))
})

record('a chart of scattered single stitches is refused', () => {
  const chart = confettiChart(48, 10)
  const verdict = quickWinVerdict(chart)
  assert.equal(verdict.ok, false)
})

record('the measures are the same every time', () => {
  const chart = motifChart(48, { radius: 17, colours: 8 })
  assert.deepEqual(measureQuickWin(chart), measureQuickWin(chart))
})

// ─────────────────────────── the range rule ───────────────────────────

record('a batch of twelve carries at most ONE expensive Pro piece', () => {
  const briefs = batch(12)
  for (let seed = 0; seed < 12; seed++) {
    const out = enforceRange(briefs, 12, { rng: () => seed / 12 })
    const pro = out.filter((b) => b.lane === 'dense' || b.lane === 'showpiece')
    assert.ok(pro.length <= 1, `${pro.length} Pro briefs: ${pro.map((b) => b.lane).join(', ')}`)
  }
})

record('the heirloom takes the Pro slot when the draw says so, the dense tier otherwise', () => {
  const briefs = batch(12)
  const heirloom = enforceRange(briefs, 12, { rng: () => 0 })
  const dense = enforceRange(briefs, 12, { rng: () => 0.99 })
  assert.equal(heirloom.filter((b) => b.lane === 'showpiece').length, 1)
  assert.equal(heirloom.filter((b) => b.lane === 'dense').length, 0)
  assert.equal(dense.filter((b) => b.lane === 'showpiece').length, 0)
  assert.equal(dense.filter((b) => b.lane === 'dense').length, 1)
})

record('a batch of twelve carries at least one quick win', () => {
  const out = enforceRange(batch(12), 12, { rng: () => 0.5 })
  assert.equal(out.filter((b) => b.lane === 'quick').length, 1)
})

record('a quick win only ever goes to a subject tagged for it', () => {
  for (const seed of [0, 0.3, 0.6, 0.9]) {
    const out = enforceRange(batch(12), 12, { rng: () => seed })
    for (const b of out.filter((x) => x.lane === 'quick')) {
      assert.ok(laneFits(b.themeId, b.subject, 'quick'), `"${b.subject}" is not tagged for the quick lane`)
    }
  }
})

record('a showpiece only ever goes to a subject tagged for it', () => {
  for (const seed of [0, 0.1, 0.2]) {
    const out = enforceRange(batch(12), 12, { rng: () => seed })
    for (const b of out.filter((x) => x.lane === 'showpiece')) {
      assert.ok(laneFits(b.themeId, b.subject, 'showpiece'), `"${b.subject}" is not tagged for the showpiece lane`)
    }
  }
})

record('the rest of the range still holds', () => {
  const out = enforceRange(batch(12), 12, { rng: () => 0.5 })
  assert.ok(out.some((b) => b.lane === 'mini'), 'no mini')
  assert.ok(out.some((b) => b.lane === 'large'), 'no large')
  assert.ok(out.filter((b) => b.lane === 'small' || b.lane === 'medium').length >= 2, 'no middle')
})

record('a batch too small for the tiers gets neither', () => {
  const out = enforceRange(batch(3), 3, { rng: () => 0 })
  assert.equal(out.filter((b) => b.lane === 'showpiece' || b.lane === 'dense').length, 0)
  assert.equal(out.filter((b) => b.lane === 'quick').length, 0)
  assert.ok(QUICK_BATCH_FLOOR > 3 || DENSE_BATCH_FLOOR > 3)
})

record('a batch of subjects none of which can be a quick win runs without one', () => {
  // Every brief here is a scene, which at 48 cells is a guaranteed kill. The
  // rule declines rather than mushing one.
  const scenes = Array.from({ length: 12 }, (_, i) =>
    brief(`a mountain lake at sunset ${i}`, 'landscapes', 'landscapes', 'large'),
  )
  const out = enforceRange(scenes, 12, { rng: () => 0.5 })
  assert.equal(out.filter((b) => b.lane === 'quick').length, 0)
})

// ─────────────────────── the quick-win reservation ───────────────────────

record('the pool tags enough subjects across enough shelves for the quick tier', () => {
  const subjects = quickCapableSubjects()
  assert.ok(subjects.length >= 20, `only ${subjects.length} quick subjects`)
  const shelves = new Set(subjects.map((s) => s.theme.shelf))
  assert.ok(shelves.size >= 5, `quick subjects only on ${[...shelves].join(', ')}`)
})

record('a batch with no quick-capable subject has one reserved for it', () => {
  const scenes = Array.from({ length: 12 }, (_, i) =>
    brief(`a mountain lake at sunset ${i}`, 'landscapes', 'landscapes', 'large'),
  )
  const out = reserveQuickWin(scenes, 12, reservation())
  assert.equal(out.length, 12)
  const quick = out.filter((b) => b.lane === 'quick')
  assert.equal(quick.length, 1)
  assert.ok(laneFits(quick[0]!.themeId, quick[0]!.subject, 'quick'))
})

record('the reservation takes its slot off a shelf that has more than one brief', () => {
  const briefs = [
    brief('a mountain lake at sunset', 'landscapes', 'landscapes', 'large'),
    brief('a fell path along a drystone wall', 'landscapes', 'landscapes', 'large'),
    brief('a negroni with an orange twist', 'cocktails', 'cocktails', 'small'),
    brief('a glass terrarium on a windowsill', 'floral', 'houseplants', 'small'),
  ]
  const out = reserveQuickWin(briefs, 12, reservation())
  // `cocktails` had one brief and keeps it; `landscapes` had two and gives one up.
  assert.ok(out.some((b) => b.shelf === 'cocktails'))
  assert.equal(out.filter((b) => b.shelf === 'landscapes').length, 1)
})

record('a batch that already has a quick-capable subject is left alone', () => {
  const briefs = [
    brief('a ripe scarlet strawberry', 'small-makes', 'small-makes', 'mini'),
    brief('a mountain lake at sunset', 'landscapes', 'landscapes', 'large'),
    brief('a negroni with an orange twist', 'cocktails', 'cocktails', 'small'),
    brief('a badger at dusk', 'animals', 'woodland', 'medium'),
  ]
  assert.deepEqual(reserveQuickWin(briefs, 12, reservation()), briefs)
})

record('a batch below the floor is never given a quick win', () => {
  const briefs = [brief('a mountain lake at sunset', 'landscapes', 'landscapes', 'large')]
  assert.deepEqual(reserveQuickWin(briefs, QUICK_BATCH_FLOOR - 1, reservation()), briefs)
})

// ─────────────────────────── helpers ───────────────────────────

function brief(subject: string, shelf: string, themeId: string, lane: string): CrossStitchBrief {
  const mid = FALLBACK_MID_CELLS[lane] ?? 155
  return {
    slug: `t-${subject.replace(/[^a-z]+/gi, '-')}-${lane}`,
    subject,
    subjectKey: subject.toLowerCase(),
    style: 'bright',
    w: mid,
    h: mid,
    colours: 20,
    lane,
    source: 'sampler',
    plannerMode: 'constrained',
    dressed: false,
    shelf,
    shelfName: shelf,
    themeId,
  }
}

/** A batch drawn from real pool subjects, so the lane tags are the real ones. */
function batch(n: number): CrossStitchBrief[] {
  const seeds: Array<[string, string, string]> = [
    ['a thatched cottage with climbing roses and a packed garden', 'scenes', 'cosy-scenes'],
    ['a mountain lake at sunset', 'landscapes', 'landscapes'],
    ['a ripe scarlet strawberry', 'small-makes', 'small-makes'],
    ['a badger at dusk', 'animals', 'woodland'],
    ['a negroni with an orange twist', 'cocktails', 'cocktails'],
    ['a luna moth', 'animals', 'birds-bugs'],
    ['a monstera in a woven pot', 'floral', 'houseplants'],
    ['a proud rooster', 'animals', 'farm'],
    ['a steam train', 'transport', 'transport'],
    ['a china teacup in cornflower blue', 'small-makes', 'small-makes'],
    ['a crab on pale sand', 'coastal', 'coastal'],
    ['a phoenix', 'fantasy', 'fantasy-creatures'],
  ]
  return seeds.slice(0, n).map(([subject, shelf, themeId]) => brief(subject, shelf, themeId, 'medium'))
}

function reservation() {
  return {
    mintSlug: (themeId: string, subject: string) => `${themeId}-${subject.replace(/[^a-z]+/gi, '-')}`,
    subjectKey: (s: string) => s.toLowerCase(),
    plannerMode: 'constrained' as const,
    taken: () => false,
  }
}

/** A chart of one round motif on bare cloth, in `colours` concentric bands. */
function motifChart(size: number, opts: { radius: number; colours: number }): PatternData {
  const cells: Array<{ x: number; y: number; s: string }> = []
  const palette = Array.from({ length: opts.colours }, (_, i) => paletteEntry(i))
  const c = (size - 1) / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - c, y - c)
      if (d > opts.radius) continue
      // Wide concentric bands — solid areas, which is what the guard asks for.
      const band = Math.min(opts.colours - 1, Math.floor((d / opts.radius) * opts.colours))
      cells.push({ x, y, s: palette[band]!.symbol })
    }
  }
  return chart(size, size, cells, palette)
}

/** A chart with every cell stitched — a full-coverage scene at motif size. */
function solidChart(w: number, h: number, colours: number): PatternData {
  const palette = Array.from({ length: colours }, (_, i) => paletteEntry(i))
  const cells: Array<{ x: number; y: number; s: string }> = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      cells.push({ x, y, s: palette[Math.floor((y / h) * colours) % colours]!.symbol })
    }
  }
  return chart(w, h, cells, palette)
}

/** A chart of single stitches with nothing touching anything. */
function confettiChart(size: number, colours: number): PatternData {
  const palette = Array.from({ length: colours }, (_, i) => paletteEntry(i))
  const cells: Array<{ x: number; y: number; s: string }> = []
  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      cells.push({ x, y, s: palette[(x + y) % colours]!.symbol })
    }
  }
  return chart(size, size, cells, palette)
}

function paletteEntry(i: number) {
  const hue = (i * 47) % 360
  return {
    symbol: GLYPHS[i % GLYPHS.length]!,
    brand: 'DMC' as const,
    code: `${300 + i}`,
    name: `Test ${i}`,
    rgb: hslHex(hue, 0.6, 0.35 + 0.3 * ((i % 3) / 2)),
    strandsFullCross: 2,
    strandsBackstitch: 1,
  }
}

function chart(
  width: number,
  height: number,
  cells: Array<{ x: number; y: number; s: string }>,
  palette: ReturnType<typeof paletteEntry>[],
): PatternData {
  const used = new Set(cells.map((c) => c.s))
  return parsePatternData({
    schemaVersion: PATTERN_SCHEMA_VERSION,
    type: 'CROSS_STITCH',
    grid: { width, height, cells, backstitch: [], frenchKnots: [], beads: [], fractional: [] },
    palette: palette.filter((p) => used.has(p.symbol)),
    fabric: { count: 14, colourRgb: '#FCFAF6', type: 'Aida' },
    metadata: {},
  })
}

function hslHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const [r1, g1, b1] =
    hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x]
  const m = l - c / 2
  return `#${[r1, g1, b1].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('')}`
}


// ─────────────────────── the showpiece guard ───────────────────────

record('an heirloom chart inside its bands passes', () => {
  const v = showpieceVerdict(bandChart(500, 500, 234))
  assert.deepEqual(v.reasons, [])
  assert.ok(v.ok)
})

record('an heirloom-sized chart short of the floss floor is refused', () => {
  const v = showpieceVerdict(bandChart(500, 500, 122))
  assert.ok(!v.ok)
  assert.ok(
    v.reasons.some((r) => r.includes(`under the ${SHOWPIECE_MIN_COLOURS}`)),
    v.reasons.join(' / '),
  )
})

record('a chart past the top of the floss band is refused too', () => {
  const v = showpieceVerdict(bandChart(500, 500, SHOWPIECE_MAX_COLOURS + 20))
  assert.ok(!v.ok)
  assert.ok(v.reasons.some((r) => r.includes('printed key')), v.reasons.join(' / '))
})

record('the guard checks the size band as well as the colours', () => {
  const v = showpieceVerdict(bandChart(240, 240, 234))
  assert.ok(!v.ok)
  assert.ok(v.reasons.some((r) => r.includes(`${SHOWPIECE_MIN_CELLS}`)), v.reasons.join(' / '))
})

record('the symbol catalogue covers a chart at the top of the heirloom band', () => {
  // The tier's headline is 200–300 distinct symbols on one chart, in the
  // working chart, the print legend and the Studio key alike. They all read the
  // same catalogue, so the catalogue covering the band is the whole of it.
  assert.ok(
    SYMBOL_GLYPHS.length >= SHOWPIECE_MAX_COLOURS,
    `${SYMBOL_GLYPHS.length} glyphs cannot symbolise a ${SHOWPIECE_MAX_COLOURS}-colour chart`,
  )
  assert.equal(new Set(SYMBOL_GLYPHS).size, SYMBOL_GLYPHS.length, 'the catalogue repeats a glyph')
  const top = bandChart(500, 500, SHOWPIECE_MAX_COLOURS)
  assert.equal(top.palette.length, SHOWPIECE_MAX_COLOURS)
  assert.equal(new Set(top.palette.map((p) => p.symbol)).size, SHOWPIECE_MAX_COLOURS)
})

/** A chart of horizontal bands, one per colour — enough colours for the
 *  heirloom tier, so it draws its symbols from the real catalogue. */
function bandChart(w: number, h: number, colours: number): PatternData {
  const palette = Array.from({ length: colours }, (_, i) => ({
    symbol: SYMBOL_GLYPHS[i]!,
    brand: 'DMC' as const,
    code: `T${i}`,
    name: `Test ${i}`,
    rgb: hslHex((i * 47) % 360, 0.6, 0.3 + 0.4 * ((i % 5) / 4)),
    strandsFullCross: 2,
    strandsBackstitch: 1,
  }))
  const cells: Array<{ x: number; y: number; s: string }> = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      cells.push({ x, y, s: palette[Math.min(colours - 1, Math.floor((y / h) * colours))]!.symbol })
    }
  }
  return chart(w, h, cells, palette)
}

// ─────────────────────────── report ───────────────────────────

const failed = results.filter((r) => !r.passed)
for (const r of results) {
  console.log(`${r.passed ? 'PASS' : 'FAIL'}: ${r.name}`)
  if (!r.passed && r.detail) console.log(`     ${r.detail}`)
}
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length > 0) process.exit(1)

