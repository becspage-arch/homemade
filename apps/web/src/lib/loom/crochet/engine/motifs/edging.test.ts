/**
 * Edgings worked in rows (edging.ts): the picot edging, the shell lace edging
 * and the chain-loop edging. Opt-in pieces, not registered, so the round 8/9
 * motif set (motifs.test.ts) is unchanged.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkCrochetPatternCompleteness, abbreviationsIn } from '@homemade/db/crochet-completeness'
import {
  EDGING_PRESETS,
  EDGING_STARTERS,
  SHELL_CROWDED,
  buildEdging,
  buildEdgingPreset,
  edgingBaseCount,
  edgingChart,
  edgingCounts,
  edgingMetrics,
  edgingRepeatWidth,
  type BuiltEdging,
} from './edging'
import { listMotifs } from './index'

const IDS = Object.keys(EDGING_PRESETS) as (keyof typeof EDGING_PRESETS)[]
const built = new Map<string, BuiltEdging>()
const get = (id: keyof typeof EDGING_PRESETS): BuiltEdging => {
  if (!built.has(id)) built.set(id, buildEdgingPreset(id))
  return built.get(id)!
}
const spread = (a: number[]): number => Math.max(...a) - Math.min(...a)
const mean = (a: number[]): number => a.reduce((s, x) => s + x, 0) / a.length

test('edgings are opt-in: the registered motif set does not include them', () => {
  const ids = listMotifs().map((d) => d.id as string)
  for (const id of IDS) assert.ok(!ids.includes(id), `${id} must not be registered`)
})

test('the presets are the June starter rows: 19 dc, then 10 / 19 / 7 sts', () => {
  // every starter count audits clean, so each preset IS its starter spec
  for (const id of IDS) assert.equal(EDGING_PRESETS[id], EDGING_STARTERS[id])
  assert.deepEqual(get('picot-edging').edging.counts, [19, 10]) // 9 picots between 10 dc
  assert.deepEqual(get('shell-lace-edging').edging.counts, [19, 19]) // 3 shells of 5 tr between 4 dc
  assert.deepEqual(get('chain-loop-edging').edging.counts, [19, 7]) // 6 ch-5 loops between 7 dc
  // the repeat: a multiple of N plus 1 dc on a chain of that plus 1
  assert.deepEqual(IDS.map((id) => edgingRepeatWidth(EDGING_PRESETS[id])), [2, 6, 3])
  for (const id of IDS) {
    const s = EDGING_PRESETS[id]
    assert.equal((edgingBaseCount(s) - 1) % edgingRepeatWidth(s), 0)
  }
})

test('a shell too big for its repeat crowds and fails the audit (the rail discriminates)', () => {
  // 7 tr into one dc over the same 6-st repeat: 40% more st width than the fan has room for
  const b = buildEdging(SHELL_CROWDED)
  assert.ok(b.edging.crowding > 1.2, `crowding ${b.edging.crowding}`)
  assert.ok(b.problems.length > 0, 'the crowded shell unexpectedly audits clean')
})

for (const id of IDS) {
  test(`${id}: genuinely stitched (one strand, every interlock held after relax)`, () => {
    const b = get(id)
    assert.deepEqual(b.problems, [])
    assert.equal(b.pieces.length, 1)
    const p = b.pieces[0]!
    assert.ok(p.built.links.length > 100)
    assert.equal(new Set(p.built.model.strand ?? [0]).size, 1)
    // the base row went under the foundation chain's loops (a space link with its sections)
    assert.ok(p.built.links.some((l) => l.role === 'hook' && (l.belowAny?.length ?? 0) >= 2))
    // row 2 is a TURNED row: worked along +x with its height still +y (the mirrored frame)
    const turned = p.built.links.filter((l) => l.axis && l.axis.ax > 0.9 && l.axis.hy > 0.9)
    assert.ok(turned.length >= b.edging.counts[1]!, `${turned.length} turned links`)
  })

  test(`${id}: no clipping, lies flat, stays straight`, () => {
    const m = edgingMetrics(get(id))
    assert.equal(m.clips, 0, `${m.clips} yarn-through-yarn node pairs (closest ${m.minSepYr.toFixed(2)} yr)`)
    assert.ok(m.zP95Yr < 2.0 && m.zMaxYr < 3.0, `z p95 ${m.zP95Yr.toFixed(2)} max ${m.zMaxYr.toFixed(2)} yr`)
    // a strip that ruffles or cups bows its base row out of line
    assert.ok(m.bowYr < 1.0, `base row bows ${m.bowYr.toFixed(2)} yr`)
  })

  test(`${id}: the repeat is periodic`, () => {
    const b = get(id)
    const m = edgingMetrics(b)
    assert.equal(m.featureMm.length, b.spec.repeats)
    // along the base row every interior repeat is the same length (within 4%);
    // the two end repeats, with a neighbour on one side only, within 10% of them
    const all = m.baseRepeatMm.map((x) => x.toFixed(2)).join(' ')
    const inner = m.baseRepeatMm.length > 2 ? m.baseRepeatMm.slice(1, -1) : m.baseRepeatMm
    assert.ok(spread(inner) / mean(inner) < 0.04, `interior base repeats ${all}`)
    for (const end of [m.baseRepeatMm[0]!, m.baseRepeatMm[m.baseRepeatMm.length - 1]!]) {
      assert.ok(Math.abs(end / mean(inner) - 1) < 0.1, `end base repeats ${all}`)
    }
    // every feature stands the same height (within 0.6 mm) at the same place in its repeat (within 0.15)
    assert.ok(spread(m.featureMm) < 0.6, `feature heights ${m.featureMm.map((x) => x.toFixed(2))}`)
    assert.ok(spread(m.featureAt) < 0.15, `feature places ${m.featureAt.map((x) => x.toFixed(2))}`)
    for (const h of m.featureMm) assert.ok(h > 0, 'a feature stands above the base row')
  })

  test(`${id}: written in UK terms, every row counted, written counts equal the build`, () => {
    const b = get(id)
    const rows = b.words.filter((w) => /^Row \d+/.test(w))
    assert.equal(rows.length, 2)
    rows.forEach((w, k) => {
      const mm = /\((\d+) sts\)$/.exec(w)
      assert.ok(mm, `no count: ${w}`)
      assert.equal(+mm![1]!, b.edging.counts[k], w)
    })
    assert.deepEqual(edgingCounts(b.spec), b.edging.counts)
    // the counting convention is written into the row
    assert.match(rows[1]!, b.spec.kind === 'shell' ? /each tr of a shell counts as a st/ : /not counted as (a st|sts)/)
    for (const w of b.words) assert.ok(!/\b(sc|hdc)\b/.test(w), `US term in: ${w}`)
    for (const w of b.words) assert.ok(!/[—–]/.test(w), `long dash in: ${w}`)
  })

  test(`${id}: the written pattern passes the crochet completeness gate`, () => {
    const b = get(id)
    const rows = b.words.map((instruction, i) => ({
      section: 'Pattern',
      rowNumber: i + 1,
      rowLabel: /^Row \d+/.exec(instruction)?.[0] ?? 'Finishing',
      instruction,
    }))
    const abbr = [...new Set(b.words.flatMap((w) => abbreviationsIn(w)))]
    const m = edgingMetrics(b)
    const gate = checkCrochetPatternCompleteness({
      name: b.label,
      description: b.spec.description,
      difficulty: 'BEGINNER',
      terminologyConvention: 'uk',
      primaryYarnWeightId: 'yarn-weight',
      primaryHookId: 'hook',
      gaugeText: 'About 28 dc and 32 rows of dc to 10 cm in 4 ply cotton on a 2.5 mm hook.',
      finishedSizeText: `${(m.lengthMm / 10).toFixed(1)} by ${(m.depthMm / 10).toFixed(1)} cm, blocked.`,
      estimatedHours: 1,
      rowsStructured: rows,
      chartData: edgingChart(b.spec),
      notions: ['2.5 mm crochet hook', 'Tapestry needle for weaving in the ends'],
      abbreviationsUsed: abbr,
      craftStitchSlugs: ['crochet-chain', 'crochet-slip-stitch', 'crochet-double-crochet', ...(b.spec.kind === 'shell' ? ['crochet-treble'] : [])],
      subCategorySlug: 'edging',
      designerId: 'designer',
    })
    assert.deepEqual(gate.reasons, [])
  })
}

test('finished size per repeat (mm), fine cotton: picot 7, shell 21, loop 10.5; the strip about 70 mm', () => {
  const want = { 'picot-edging': 7.0, 'shell-lace-edging': 21.1, 'chain-loop-edging': 10.5 } as const
  for (const id of IDS) {
    const m = edgingMetrics(get(id))
    const r = mean(m.baseRepeatMm)
    assert.ok(Math.abs(r - want[id]) < 0.8, `${id} repeat ${r.toFixed(2)} mm`)
    assert.ok(m.lengthMm > 60 && m.lengthMm < 80, `${id} length ${m.lengthMm.toFixed(1)} mm`)
    assert.ok(m.depthMm > 10 && m.depthMm < 22, `${id} depth ${m.depthMm.toFixed(1)} mm`)
  }
})

test('DK: the same three audit clean at about 10 cm', () => {
  for (const id of IDS) {
    const b = buildEdgingPreset(id, { yarnWeight: 'dk' })
    assert.deepEqual(b.problems, [], id)
    const m = edgingMetrics(b)
    assert.equal(m.clips, 0, id)
    assert.ok(m.lengthMm > 95 && m.lengthMm < 112, `${id} DK length ${m.lengthMm.toFixed(1)} mm`)
  }
})
