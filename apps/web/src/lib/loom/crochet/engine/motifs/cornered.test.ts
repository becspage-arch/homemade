/**
 * Cornered motifs in the round (cornered.ts): the granny square, the solid
 * treble square and the solid hexagon. Opt-in pieces — not registered, so the
 * round 8/9 motif set (motifs.test.ts) is unchanged.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkCrochetPatternCompleteness, abbreviationsIn } from '@homemade/db/crochet-completeness'
import {
  CORNERED_PRESETS,
  SOLID_HEXAGON_STARTER,
  SOLID_SQUARE_STARTER,
  buildCornered,
  buildCorneredPreset,
  corneredChart,
  corneredCounts,
  corneredMetrics,
  type BuiltCornered,
} from './cornered'
import { listMotifs } from './index'

const IDS = Object.keys(CORNERED_PRESETS) as (keyof typeof CORNERED_PRESETS)[]
const built = new Map<string, BuiltCornered>()
const get = (id: keyof typeof CORNERED_PRESETS): BuiltCornered => {
  if (!built.has(id)) built.set(id, buildCorneredPreset(id))
  return built.get(id)!
}

test('cornered motifs are opt-in: the registered motif set does not include them', () => {
  const ids = listMotifs().map((d) => d.id as string)
  for (const id of IDS) assert.ok(!ids.includes(id), `${id} must not be registered`)
})

test('the presets make the starter rows\' counts where the stitch logic allows', () => {
  // granny-square-basic-three-round: 12, 24, 36 tr in 4, 8, 12 clusters
  assert.deepEqual(get('granny-square').cornered.counts, [12, 24, 36])
  assert.deepEqual(get('granny-square').cornered.clusters, [4, 8, 12])
  // solid square: round 1 is the starter's 12; rounds 2-3 add 4 per corner
  // ((2 tr, ch 2, 2 tr)), not the starter's 12/36/60 ((3 tr, ch 2, 3 tr)),
  // which lays 26-38% more stitch width than its side has room for (below)
  assert.deepEqual(get('solid-square').cornered.counts, [12, 28, 44])
  // solid hexagon: 12, 24 ((tr, ch 1, tr) corners); the starter's 18/54 is 2x over
  assert.deepEqual(get('solid-hexagon').cornered.counts, [12, 24])
})

test('the starter row counts do not fit flat: crowding over 1.2 and the audit fails', () => {
  for (const spec of [SOLID_SQUARE_STARTER, SOLID_HEXAGON_STARTER]) {
    const b = buildCornered(spec)
    assert.ok(Math.max(...b.cornered.crowding) > 1.2, `${spec.id} crowding ${b.cornered.crowding}`)
    assert.ok(b.problems.length > 0, `${spec.id} starter counts unexpectedly audit clean`)
  }
})

for (const id of IDS) {
  test(`${id}: genuinely stitched (one strand, every interlock held after relax)`, () => {
    const b = get(id)
    assert.deepEqual(b.problems, [])
    assert.equal(b.pieces.length, 1)
    const p = b.pieces[0]!
    assert.ok(p.built.links.length > 100)
    assert.equal(new Set(p.built.model.strand ?? [0]).size, 1)
    // every corner group / cluster stitch went under a whole chain (a space link with stations)
    assert.ok(p.built.links.some((l) => l.role === 'hook' && (l.belowAny?.length ?? 0) >= 3))
  })

  test(`${id}: no clipping, lies flat, corners true, every round fits its room`, () => {
    const b = get(id)
    const m = corneredMetrics(b)
    assert.equal(m.clips, 0, `${m.clips} yarn-through-yarn node pairs (closest ${m.minSepYr.toFixed(2)} yr)`)
    // flat on the table: the relaxed piece stays within its own thickness
    assert.ok(m.zP95Yr < 2.0 && m.zMaxYr < 3.0, `z p95 ${m.zP95Yr.toFixed(2)} max ${m.zMaxYr.toFixed(2)} yr`)
    const want = 180 - 360 / b.spec.corners
    for (const a of m.cornerDeg) assert.ok(Math.abs(a - want) < 6, `corner ${a.toFixed(1)} deg, want ${want}`)
    // no round lays more stitch width than its side has room for (a ruffle) or far less (a cup)
    for (const c of b.cornered.crowding) assert.ok(c > 0.8 && c < 1.08, `crowding ${b.cornered.crowding}`)
  })

  test(`${id}: written in UK terms, every round counted, counts equal the build`, () => {
    const b = get(id)
    const rounds = b.words.filter((w) => /^Round \d+/.test(w))
    assert.equal(rounds.length, b.cornered.counts.length)
    rounds.forEach((w, k) => {
      const mm = /\((\d+) sts\)$/.exec(w)
      assert.ok(mm, `no count: ${w}`)
      assert.equal(+mm![1]!, b.cornered.counts[k], w)
    })
    assert.deepEqual(corneredCounts(b.spec), b.cornered.counts)
    for (const w of b.words) assert.ok(!/\b(sc|hdc)\b/.test(w), `US term in: ${w}`)
    for (const w of b.words) assert.ok(!/[—–]/.test(w), `long dash in: ${w}`)
  })

  test(`${id}: the written pattern passes the crochet completeness gate`, () => {
    const b = get(id)
    const rows = b.words.map((instruction, i) => ({
      section: 'Pattern',
      rowNumber: i + 1,
      rowLabel: /^Round \d+/.exec(instruction)?.[0] ?? 'Finishing',
      instruction,
    }))
    const abbr = [...new Set(b.words.flatMap((w) => abbreviationsIn(w)))]
    const m = corneredMetrics(b)
    const gate = checkCrochetPatternCompleteness({
      name: b.label,
      description: b.spec.description,
      difficulty: 'BEGINNER',
      terminologyConvention: 'uk',
      primaryYarnWeightId: 'yarn-weight',
      primaryHookId: 'hook',
      gaugeText: 'About 22 tr and 11 rounds of tr to 10 cm in 4 ply cotton on a 2.5 mm hook.',
      finishedSizeText: `${(m.flatsMm / 10).toFixed(1)} cm across, blocked.`,
      estimatedHours: 1,
      rowsStructured: rows,
      chartData: corneredChart(b.spec),
      notions: ['2.5 mm crochet hook', 'Tapestry needle'],
      abbreviationsUsed: abbr,
      craftStitchSlugs: ['crochet-chain', 'crochet-slip-stitch', 'crochet-treble', 'crochet-magic-ring'],
      subCategorySlug: 'motif',
      designerId: 'designer',
    })
    assert.deepEqual(gate.reasons, [])
  })
}

test('finished sizes (mm): fine cotton by default, the starter DK square near 10 cm', () => {
  const g = corneredMetrics(get('granny-square'))
  const s = corneredMetrics(get('solid-square'))
  const h = corneredMetrics(get('solid-hexagon'))
  assert.ok(g.flatsMm > 50 && g.flatsMm < 70, `granny ${g.flatsMm.toFixed(1)} mm`)
  assert.ok(s.flatsMm > 50 && s.flatsMm < 70, `solid ${s.flatsMm.toFixed(1)} mm`)
  assert.ok(h.flatsMm > 35 && h.flatsMm < 55, `hexagon ${h.flatsMm.toFixed(1)} mm`)
  assert.ok(h.cornersMm > h.flatsMm)
  const dk = buildCorneredPreset('granny-square', { yarnWeight: 'dk' })
  assert.deepEqual(dk.problems, [])
  const d = corneredMetrics(dk)
  assert.ok(d.flatsMm > 80 && d.flatsMm < 105, `DK granny ${d.flatsMm.toFixed(1)} mm`)
})

test('granny: the colour change is opt-in per round, and a one-colour granny audits clean too', () => {
  const g = get('granny-square')
  assert.ok(g.words.some((w) => /^Round 2 \(outer colour\): fasten off centre colour; join outer colour with a sl st/.test(w)))
  assert.ok(g.words.some((w) => /^Round 3 \(outer colour\): sl st in each of the next 2 tr and into the next ch-2 corner sp/.test(w)))
  const one = buildCornered({ ...CORNERED_PRESETS['granny-square'], roundColour: ['outer', 'outer', 'outer'] })
  assert.deepEqual(one.problems, [])
})
