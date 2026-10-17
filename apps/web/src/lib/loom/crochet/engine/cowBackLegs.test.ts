/**
 * SEATED BACK LEGS (`CowChoices.seatBackLegs`, cow back-legs pass 2026-10-17;
 * job log `crochet-bar/jobs/cow-legs.md` in the shared folder).
 *
 * The default calf's back legs float ~12 mm off the body and pass 15-24 mm
 * into the front legs (squashMetrics, soft-squash groundwork). The knob
 * re-seats them against the body's flanks. This test holds it to:
 *   - OFF MEANS OFF: absent / false builds the same program as today (so the
 *     default hash and size tables cannot move), and on changes only the
 *     two back legs;
 *   - for cow M at gauge 1, 1.3 and 1.4, and with `cuppedEars`: the audits
 *     are clean, each back leg is SEWN to the body (gap <= 0, contact patch
 *     > 0, its join no deeper than the front legs' own joins), it passes at
 *     most one yarn radius into a front leg (the squash harness's
 *     unjoined-pieces limit), the calf sits on the table (minz within
 *     0.5 mm) and its settled size is within 5% of the size table.
 *
 *   cd apps/web && pnpm exec tsx --conditions react-server --test src/lib/loom/crochet/engine/cowBackLegs.test.ts
 *
 * ~1 min a compile; COW_LEGS_VARIANTS=g1,g13,g14,cup narrows the slow part
 * (COW_LEGS_VARIANTS=none runs only the program checks).
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildCowProgram, COW_DEFAULTS, type CowChoices } from './cowPreset'
import { compileComposition } from './composition'
import { writeCompositionInstructions } from './compositionPattern'
import { PRESET_SETTLED_SIZE_MM_GENERATED } from './amigurumiSizes.generated'
import { SQUASH_RAILS, measureSquash, squashInputFromCompiled } from './squashMetrics'

/** Programs carry closures (custom pieces); compare what they say. */
const same = (a: unknown, b: unknown, msg?: string): void => assert.equal(JSON.stringify(a), JSON.stringify(b), msg)

test('off means off, and on moves only the back legs', () => {
  for (const extra of [{}, { gauge: 1.4 }, { cuppedEars: true }] as Partial<CowChoices>[]) {
    const off = buildCowProgram({ ...COW_DEFAULTS, ...extra })
    same(buildCowProgram({ ...COW_DEFAULTS, ...extra, seatBackLegs: false }), off)
    const on = buildCowProgram({ ...COW_DEFAULTS, ...extra, seatBackLegs: true })
    assert.deepEqual(on.parts.map((p) => p.name), off.parts.map((p) => p.name))
    on.parts.forEach((p, i) => {
      const o = off.parts[i]!
      if (!/^back-leg-/.test(p.name)) return same(p, o, p.name)
      // The same piece (rounds, words), sewn somewhere else.
      same(p.rounds, o.rounds, `${p.name} rounds`)
      assert.notEqual(JSON.stringify(p.place), JSON.stringify(o.place))
      assert.notEqual(p.sewNote, o.sewNote)
    })
    same({ ...on, parts: [] }, { ...off, parts: [] }, 'everything but the parts')
  }
  // The written pattern says where the legs now go.
  const words = writeCompositionInstructions(buildCowProgram({ ...COW_DEFAULTS, seatBackLegs: true })).join('\n')
  assert.ok(/by the inner side, low on each side of the body just behind the front legs/.test(words), 'the seated sewing line is in the words')
  assert.ok(!/lying forward along the table outside the front legs/.test(words), 'the old sewing line is gone')
})

const VARIANTS: Record<string, Partial<CowChoices>> = {
  g1: {},
  g13: { gauge: 1.3 },
  g14: { gauge: 1.4 },
  cup: { cuppedEars: true },
}
const wanted = (process.env.COW_LEGS_VARIANTS ?? 'all').toLowerCase()
const RUN = wanted === 'all' ? Object.keys(VARIANTS) : wanted === 'none' ? [] : wanted.split(',').filter((k) => k in VARIANTS)
const SIZE_TOLERANCE = 0.05

for (const key of RUN) {
  test(`cow M ${key}: the back legs are sewn to the body and clear of the front legs`, () => {
    const program = buildCowProgram({ ...COW_DEFAULTS, ...VARIANTS[key], seatBackLegs: true })
    const compiled = compileComposition(program)
    assert.deepEqual(compiled.problems, [], compiled.problems.join(' | '))

    let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity
    for (const p of compiled.placed) {
      minx = Math.min(minx, p.bounds.minx); maxx = Math.max(maxx, p.bounds.maxx)
      minz = Math.min(minz, p.bounds.minz); maxz = Math.max(maxz, p.bounds.maxz)
    }
    assert.ok(Math.abs(minz) <= 0.5, `minz ${minz.toFixed(2)} mm: not sitting on the table`)
    const recorded = PRESET_SETTLED_SIZE_MM_GENERATED['cow-M']!
    for (const [what, got, want] of [['width', maxx - minx, recorded.width], ['height', maxz - minz, recorded.height]] as const) {
      const d = Math.abs(got - want) / want
      assert.ok(d <= SIZE_TOLERANCE, `${what} ${got.toFixed(1)} mm is ${(d * 100).toFixed(1)}% off the table's ${want} mm`)
    }

    // Each back foot rests ON the table, not just the calf as a whole.
    for (const p of compiled.placed.filter((p) => /^back-leg-/.test(p.part.name)))
      assert.ok(Math.abs(p.bounds.minz) <= 0.5, `${p.part.name} minz ${p.bounds.minz.toFixed(2)} mm: not resting on the table`)
    const m = measureSquash(squashInputFromCompiled(`cow-M-${key}`, compiled))
    assert.ok(m.minZ >= -SQUASH_RAILS.maxBelowFloorMm, `minZ ${m.minZ}`)
    const pair = (a: string, b: string) =>
      m.pairs.find((p) => (p.child === a && p.parent === b) || (p.child === b && p.parent === a))
    const frontJoin = Math.max(...['l', 'r'].map((s) => pair(`front-leg-${s}`, 'body')!.penetrationMm))
    for (const s of ['l', 'r']) {
      const j = pair(`back-leg-${s}`, 'body')
      assert.ok(j && j.joined, `back-leg-${s} > body is not measured as a join`)
      console.log(`      ${key} back-leg-${s}>body gap ${j.gapMm} pen ${j.penetrationMm} patch ${j.contactPatchMm2} fill ${j.contactFill}`)
      assert.ok(j.gapMm != null && j.gapMm <= 0, `back-leg-${s} gap ${j.gapMm} mm: not touching the body`)
      assert.ok(j.contactPatchMm2 > 0, `back-leg-${s}: no contact patch`)
      assert.ok(j.penetrationMm <= frontJoin, `back-leg-${s} sewn ${j.penetrationMm} mm deep, deeper than the front legs' ${frontJoin}`)
      const f = pair(`back-leg-${s}`, `front-leg-${s}`)
      const fp = f?.penetrationMm ?? 0
      console.log(`      ${key} back-leg-${s}~front-leg-${s} gap ${f?.gapMm ?? 'none'} pen ${fp}`)
      assert.ok(fp <= SQUASH_RAILS.maxUnjoinedPenetrationYr * m.yr, `back-leg-${s} passes ${fp} mm into the front leg (limit ${SQUASH_RAILS.maxUnjoinedPenetrationYr * m.yr})`)
      // No yarn clips into the front leg deeper than a sewn join's own contact.
      if (f?.gapMm != null) assert.ok(f.gapMm > -m.yr, `back-leg-${s} clips the front leg by ${-f.gapMm} mm`)
    }
  })
}
