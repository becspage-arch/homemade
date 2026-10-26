/**
 * The Studio designer's save gate for the fine-gauge knob and the opt-in
 * switches (designer-choices.ts, engine/designerAudit.ts).
 *
 *  - the schema takes gauge 1, 1.3, 1.4 and 1.6 and nothing else, and the
 *    switches (cupped ears, seated back legs, curved horns, tapered legs)
 *    only where an engine test audited them;
 *  - the defaults build exactly the program they always did (so every saved
 *    design and every geometry hash is unchanged);
 *  - a gauge-1.4 bunny saved through the gate, stored as JSON and read back,
 *    is exactly the program gauge.test.ts builds and audits.
 *
 * Fast (no compile):
 *
 *   cd apps/web && pnpm exec tsx --conditions react-server --test src/lib/studio/crochet/designer-choices.test.ts
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DesignerChoicesSchema, buildDesignerProgram, normaliseDesignerChoices } from './designer-choices'
import {
  allPresetChoices,
  buildAmigurumiProgram,
  isAuditedProfile,
  presetSettledSizeMm,
  type AmigurumiChoices,
} from '@/lib/loom/crochet/engine/amigurumiPresets'
import { buildCowProgram } from '@/lib/loom/crochet/engine/cowPreset'
import { DESIGNER_GAUGES, designerAuditedChoices, gaugeAudited, isDesignerAuditedProfile } from '@/lib/loom/crochet/engine/designerAudit'
import { TESTED_GAUGES } from '@/lib/loom/crochet/engine/gauge'

/** The choices gauge.test.ts builds (its `choices` literal). */
const TOY = { mainHex: '#b5814e', contrastHex: '#e6d3ae', eyeMm: 9, nose: true, paws: true }
const choices = (extra: Partial<AmigurumiChoices>): AmigurumiChoices => ({ base: 'bunny', size: 'M', ...TOY, ...extra })
/** A body as it arrives on the wire. */
const wire = (c: unknown): unknown => JSON.parse(JSON.stringify(c))
const parse = (c: unknown) => DesignerChoicesSchema.safeParse(wire(c))
const same = (a: unknown, b: unknown, msg?: string): void => assert.equal(JSON.stringify(a), JSON.stringify(b), msg)

test('the audited gauges are exactly 1 and the tested ones', () => {
  assert.deepEqual([...DESIGNER_GAUGES], [1, 1.3, 1.4, 1.6])
  assert.deepEqual([...DESIGNER_GAUGES.slice(1)], [...TESTED_GAUGES])
})

test('the schema takes the audited gauges and refuses every other', () => {
  for (const base of ['bear', 'bunny', 'cow'] as const) {
    for (const gauge of [1, 1.3, 1.4, 1.6]) {
      const r = parse(choices({ base, gauge }))
      assert.ok(r.success, `${base} @ ${gauge}: ${r.success ? '' : r.error.issues.map((i) => i.message).join('; ')}`)
    }
  }
  for (const gauge of [1.2, 2, 1.35, 1.5, 0.5, 0, -1.4, 1.40001]) {
    const r = parse(choices({ gauge }))
    assert.ok(!r.success, `gauge ${gauge} was accepted`)
    assert.ok(r.error.issues.some((i) => /gauge must be one of 1, 1.3, 1.4, 1.6/.test(i.message)), `gauge ${gauge}: ${r.error.issues.map((i) => i.message)}`)
  }
  assert.ok(!parse({ ...choices({}), gauge: '1.4' }).success, 'a string gauge')
  assert.ok(!parse({ ...choices({}), gauge: null }).success, 'a null gauge')
})

test('a finer gauge only where gauge.test.ts builds the whole toy', () => {
  // Bases the gauge test does not build, sizes it does not build, and a hat.
  for (const extra of [
    { base: 'cat', gauge: 1.4 }, { base: 'ball', gauge: 1.3 }, { base: 'doll', gauge: 1.4 },
    { gauge: 1.4, hat: 'nightcap' },
  ] as Partial<AmigurumiChoices>[]) {
    assert.ok(!parse(choices(extra)).success, `accepted ${JSON.stringify(extra)}`)
  }
  // Exactly the size x gauge pairs gauge.test.ts passed (GAUGE_AUDITED).
  for (const base of ['bear', 'bunny', 'cow'] as const) {
    for (const size of ['S', 'M', 'L'] as const) {
      for (const gauge of TESTED_GAUGES) {
        const r = parse(choices({ base, size, gauge }))
        assert.equal(r.success, gaugeAudited(base, size, gauge), `${base}/${size} @ ${gauge}`)
      }
    }
  }
  for (const extra of [
    { size: 'S', gauge: 1.4 }, { base: 'bear', size: 'S', gauge: 1.4 }, { size: 'L', gauge: 1.3 },
    { base: 'cow', size: 'S', gauge: 1.3 }, { base: 'cow', size: 'L', gauge: 1.4 },
  ] as Partial<AmigurumiChoices>[]) {
    assert.ok(parse(choices(extra)).success, `refused ${JSON.stringify(extra)} (audited clean in gauge.test.ts)`)
  }
  // Gauge 1 is fine everywhere (it is today's toy).
  for (const extra of [{ base: 'cat', gauge: 1 }, { size: 'S', gauge: 1, hat: 'nightcap' }] as Partial<AmigurumiChoices>[]) {
    assert.ok(parse(choices(extra)).success, `refused ${JSON.stringify(extra)}`)
  }
})

test('the switches only where their tests audited them', () => {
  for (const [extra, ok] of [
    [{ cuppedEars: true }, true],
    [{ cuppedEars: true, size: 'S' }, true],
    [{ cuppedEars: true, gauge: 1.6 }, true],
    [{ base: 'cow', size: 'L', cuppedEars: true }, true],
    [{ base: 'bear', cuppedEars: true }, false],
    [{ base: 'cat', cuppedEars: true }, false],
    [{ base: 'bear', cuppedEars: false }, true],
    [{ base: 'cow', seatBackLegs: true }, true],
    [{ base: 'cow', seatBackLegs: true, gauge: 1.3 }, true],
    [{ base: 'cow', seatBackLegs: true, gauge: 1.4, cuppedEars: true }, true],
    [{ base: 'cow', seatBackLegs: true, gauge: 1.6 }, false],
    [{ base: 'cow', size: 'S', seatBackLegs: true }, false],
    [{ base: 'bunny', seatBackLegs: true }, false],
    [{ base: 'bunny', seatBackLegs: false }, true],
    [{ base: 'cow', curvedHorns: true }, true],
    [{ base: 'cow', size: 'S', taperedLegs: true }, true],
    [{ base: 'cow', size: 'L', gauge: 1.3, curvedHorns: true, taperedLegs: true }, true],
    [{ base: 'cow', gauge: 1.3, cuppedEars: true, seatBackLegs: true, curvedHorns: true, taperedLegs: true }, true],
    [{ base: 'cow', gauge: 1.4, curvedHorns: true }, false],
    [{ base: 'cow', gauge: 1.6, taperedLegs: true }, false],
    [{ base: 'bunny', curvedHorns: true }, false],
    [{ base: 'bear', taperedLegs: true }, false],
    [{ base: 'bear', curvedHorns: false, taperedLegs: false }, true],
  ] as Array<[Partial<AmigurumiChoices>, boolean]>) {
    const r = parse(choices(extra))
    assert.equal(r.success, ok, `${JSON.stringify(extra)}: ${r.success ? 'accepted' : r.error.issues.map((i) => i.message).join('; ')}`)
  }
  assert.ok(!parse({ ...choices({ base: 'cow' }), seatBackLegs: 'yes' }).success)
  assert.ok(!parse({ ...choices({ base: 'cow' }), curvedHorns: 1 }).success)
})

test('defaults unchanged: every preset saves the program it always did', () => {
  for (const c of allPresetChoices()) {
    const before = { ...buildAmigurumiProgram(c), name: 'n', finishedSizeMm: presetSettledSizeMm(c.base, c.size) }
    for (const extra of [{}, { gauge: 1 }, { cuppedEars: false }, { seatBackLegs: false }, { curvedHorns: false, taperedLegs: false }, { gauge: 1, cuppedEars: false, seatBackLegs: false, curvedHorns: false, taperedLegs: false }]) {
      const r = parse({ ...c, ...extra })
      assert.ok(r.success, `${c.base}/${c.size} ${JSON.stringify(extra)}`)
      const n = normaliseDesignerChoices(r.data)
      for (const k of ['gauge', 'cuppedEars', 'seatBackLegs', 'curvedHorns', 'taperedLegs']) assert.ok(!(k in n), `the off ${k} is not passed on`)
      const built = buildDesignerProgram(n, 'n')
      assert.ok('program' in built, `${c.base}/${c.size}: ${'problems' in built ? built.problems : ''}`)
      same(built.program, before, `${c.base}/${c.size} ${JSON.stringify(extra)}`)
    }
  }
})

test('a gauge-1.4 bunny round-trips the save to exactly the program gauge.test.ts audits', () => {
  const r = parse({ ...choices({ gauge: 1.4 }), name: undefined })
  assert.ok(r.success)
  const built = buildDesignerProgram(normaliseDesignerChoices(r.data), 'My bunny')
  assert.ok('program' in built, 'problems' in built ? built.problems.join('; ') : '')
  // Stored as JSON (the loomProgram column) and read back by the render job.
  const stored = JSON.parse(JSON.stringify(built.program))
  assert.deepStrictEqual(stored, built.program, 'nothing is lost to JSON (no closures in the program)')
  const engine = buildAmigurumiProgram(choices({ gauge: 1.4 }))
  assert.deepStrictEqual(stored, { ...engine, name: 'My bunny', finishedSizeMm: presetSettledSizeMm('bunny', 'M') })
  // It IS the fine toy: the finer yarn, the gauge line the save keeps, the
  // scaled counts (and so not the gauge-1 toy).
  assert.ok(Math.abs((stored.yarnRadiusMm ?? NaN) - 1.3 / 1.4) < 1e-12, `yarn ${stored.yarnRadiusMm}`)
  assert.ok(stored.gaugeText && /hook/.test(stored.gaugeText))
  const one = buildAmigurumiProgram(choices({}))
  const head = (p: typeof engine) => Math.max(...p.parts.find((x) => x.name === 'head')!.rounds)
  assert.ok(head(stored) > head(one), `head ${head(stored)} vs ${head(one)}`)
  // Its gauge pieces are not on the gauge-1 list, but are on the designer's.
  assert.ok(stored.parts.some((p: { rounds: number[] }) => !isAuditedProfile(p.rounds)))
  for (const p of stored.parts as Array<{ name: string; rounds: number[] }>) assert.ok(isDesignerAuditedProfile(p.rounds), p.name)
})

test('the cow switches reach the cow builder through the designer', () => {
  const r = parse(choices({ base: 'cow', gauge: 1.4, cuppedEars: true, seatBackLegs: true }))
  assert.ok(r.success)
  const built = buildDesignerProgram(normaliseDesignerChoices(r.data), 'Calf')
  assert.ok('program' in built)
  const cow = buildCowProgram({ size: 'M', mainHex: TOY.mainHex, contrastHex: TOY.contrastHex, eyeMm: 9, gauge: 1.4, cuppedEars: true, seatBackLegs: true })
  same(built.program, { ...cow, name: 'Calf', finishedSizeMm: presetSettledSizeMm('cow', 'M') })
  const plain = buildCowProgram({ size: 'M', mainHex: TOY.mainHex, contrastHex: TOY.contrastHex, eyeMm: 9, gauge: 1.4 })
  assert.notEqual(JSON.stringify(built.program.parts), JSON.stringify(plain.parts), 'the switches did something')
  // The curved horns and tapered legs (cowBentHorn.test.ts) the same way.
  const r2 = parse(choices({ base: 'cow', size: 'L', gauge: 1.3, curvedHorns: true, taperedLegs: true }))
  assert.ok(r2.success)
  const b2 = buildDesignerProgram(normaliseDesignerChoices(r2.data), 'Calf')
  assert.ok('program' in b2, 'problems' in b2 ? b2.problems.join('; ') : '')
  const cow2 = buildCowProgram({ size: 'L', mainHex: TOY.mainHex, contrastHex: TOY.contrastHex, eyeMm: 9, gauge: 1.3, curvedHorns: true, taperedLegs: true })
  same(b2.program, { ...cow2, name: 'Calf', finishedSizeMm: presetSettledSizeMm('cow', 'L') })
  assert.ok(b2.program.parts.some((p) => p.bentTube), 'the bent horn reaches the program')
  // Stored as JSON and read back, the horn's stitch plan survives.
  same(JSON.parse(JSON.stringify(b2.program)), b2.program)
})

test('every accepted combination builds on audited pieces; an unaudited gauge build is refused', () => {
  const all = designerAuditedChoices()
  assert.ok(all.length > 10)
  for (const c of all) {
    assert.ok(parse(c).success, JSON.stringify(c))
    const built = buildDesignerProgram(c, 'x')
    assert.ok('program' in built, `${JSON.stringify(c)}: ${'problems' in built ? built.problems : ''}`)
  }
  // Past the choice gate (were it bypassed), the piece check still refuses
  // a gauge build no test audited.
  for (const c of [choices({ base: 'cat', gauge: 1.4 }), choices({ base: 'cat', size: 'L', gauge: 1.6 }), choices({ base: 'bear', size: 'L', gauge: 2 })]) {
    const built = buildDesignerProgram(c, 'x')
    assert.ok('problems' in built, `${c.base}/${c.size} @ ${c.gauge} built on the trusted path`)
  }
})
