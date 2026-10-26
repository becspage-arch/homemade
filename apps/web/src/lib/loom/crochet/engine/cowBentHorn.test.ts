/**
 * CURVED HORNS AND TAPERED LEGS on the cow (`CowChoices.curvedHorns`,
 * `CowChoices.taperedLegs`; bent-tube pass 2026-10-26, STITCH_ENGINE.md §8r,
 * job log `crochet-bar/jobs/bent-tube-1026.md` in the shared folder).
 *
 *   - OFF MEANS OFF: absent / false builds the same program as today (so no
 *     preset hash or size table can move), and on changes only the horns /
 *     the front legs;
 *   - the fine-gauge calf (1.3, the listing scene's choices) compiles with a
 *     clean audit; each horn's bend MEASURED off its settled, placed piece is
 *     the requested one, and the tip curls UP; the front legs are slimmer
 *     than today's and stand on the table; the words carry both pieces.
 *
 *   - THE DESIGNER'S COMBINATIONS (designerAudit.ts CURVED_HORNS_AUDITED /
 *     TAPERED_LEGS_AUDITED): every combination the Studio save path accepts
 *     with either switch on compiles clean and sits on the table (the tapered
 *     legs' measured lift, cowPreset TAPERED_LEG_LIFT). By default only the
 *     M at gauge 1 with both on (a few minutes); `MATRIX=1` runs all 48
 *     (S/M/L x gauge 1, 1.3 x horns/legs/both x cupped ears, seated legs at M;
 *     ~1 h on 4 cores, `SIZES=S GAUGES=1.3` narrows it). Run MATRIX=1 before
 *     widening the table or moving a lift.
 *
 *   cd apps/web && pnpm exec tsx --conditions react-server --test src/lib/loom/crochet/engine/cowBentHorn.test.ts
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildCowProgram, COW_CURVED_HORN, COW_DEFAULTS, type CowChoices } from './cowPreset'
import { compileComposition } from './composition'
import { writeCompositionInstructions } from './compositionPattern'
import { bentTubeMetrics } from './bentTube'
import { designerAuditedChoices } from './designerAudit'
import { buildAmigurumiProgram, type AmigurumiSize } from './amigurumiPresets'

const same = (a: unknown, b: unknown, msg?: string): void => assert.equal(JSON.stringify(a), JSON.stringify(b), msg)

test('off means off, and on moves only the horns / the front legs', () => {
  for (const extra of [{}, { gauge: 1.3 }, { gauge: 1.3, cuppedEars: true, seatBackLegs: true }] as Partial<CowChoices>[]) {
    const off = buildCowProgram({ ...COW_DEFAULTS, ...extra })
    same(buildCowProgram({ ...COW_DEFAULTS, ...extra, curvedHorns: false, taperedLegs: false }), off)
    for (const [knob, re] of [['curvedHorns', /^horn-/], ['taperedLegs', /^front-leg-/]] as const) {
      const on = buildCowProgram({ ...COW_DEFAULTS, ...extra, [knob]: true })
      assert.deepEqual(on.parts.map((p) => p.name), off.parts.map((p) => p.name))
      on.parts.forEach((p, i) => {
        if (!re.test(p.name)) return same(p, off.parts[i], `${knob}: ${p.name}`)
        assert.notEqual(JSON.stringify(p.rounds), JSON.stringify(off.parts[i]!.rounds), `${knob}: ${p.name} rounds`)
      })
      same({ ...on, parts: [] }, { ...off, parts: [] }, `${knob}: everything but the parts`)
    }
  }
})

test('the fine-gauge calf with curved horns and tapered legs: clean, curled up, slim, on the table', () => {
  const choices: CowChoices = { ...COW_DEFAULTS, gauge: 1.3, cuppedEars: true, seatBackLegs: true, curvedHorns: true, taperedLegs: true }
  const program = buildCowProgram(choices)
  const compiled = compileComposition(program)
  assert.deepEqual(compiled.problems, [])
  for (const name of ['horn-l', 'horn-r']) {
    const pp = compiled.placed.find((q) => q.part.name === name)!
    const spec = { rounds: pp.part.rounds, plan: pp.part.bentTube!.plan }
    const m = bentTubeMetrics(pp.built!, spec)
    assert.ok(Math.abs(m.bendDeg - COW_CURVED_HORN.angleDeg) <= Math.max(4, COW_CURVED_HORN.angleDeg * 0.1), `${name}: settled bend ${m.bendDeg.toFixed(1)}°`)
    assert.ok(m.minGapMm > 2 * compiled.yr, `${name}: rounds ≥3 apart ${m.minGapMm.toFixed(2)} mm close`)
    // World direction of the tip's end against the base's: the tip turns up.
    const row = pp.built!.nodeRow!
    const K = spec.rounds.length
    const cen = (k: number) => {
      let x = 0, y = 0, z = 0, n = 0
      pp.ctrl.forEach((p, i) => { if (row[i] === k) { x += p.x; y += p.y; z += p.z; n++ } })
      return { x: x / n, y: y / n, z: z / n }
    }
    const dir = (a: number, b: number) => {
      const p = cen(a), q = cen(b)
      const l = Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z)
      return { x: (p.x - q.x) / l, y: (p.y - q.y) / l, z: (p.z - q.z) / l }
    }
    const base = dir(K - 3, K - 1) // out of the head
    const tip = dir(1, 3) // the tip's last stretch
    assert.ok(tip.z > base.z + 0.4, `${name}: the tip curls up (tip dir z ${tip.z.toFixed(2)}, base ${base.z.toFixed(2)})`)
    assert.ok(Math.abs(base.x) > 0.6, `${name}: it leaves the head sideways (${base.x.toFixed(2)})`)
  }
  // Slimmer front legs than today's, still standing on the table.
  const today = compileComposition(buildCowProgram({ ...choices, taperedLegs: false }))
  const width = (c: typeof compiled, n: string) => { const b = c.placed.find((q) => q.part.name === n)!.bounds; return b.maxx - b.minx }
  for (const n of ['front-leg-l', 'front-leg-r']) {
    assert.ok(width(compiled, n) < width(today, n) * 0.9, `${n}: ${width(compiled, n).toFixed(1)} vs ${width(today, n).toFixed(1)} mm`)
    const minz = compiled.placed.find((q) => q.part.name === n)!.bounds.minz
    assert.ok(Math.abs(minz) <= 0.5, `${n}: foot ${minz.toFixed(2)} mm off the table`)
  }
  const words = writeCompositionInstructions(program).join('\n')
  assert.ok(/on the outside of the curve/.test(words), 'the horn rounds say which stitches are the outside')
  assert.ok(/the tip curls up/.test(words), 'the sewing line says which way the curve goes')
  assert.ok(/each round foot rests on the table/.test(words), 'the leg sewing line')
})

const MATRIX = process.env.MATRIX === '1'
const M_SIZES = (process.env.SIZES ?? (MATRIX ? 'S,M,L' : 'M')).split(',') as AmigurumiSize[]
const M_GAUGES = (process.env.GAUGES ?? (MATRIX ? '1,1.3' : '1')).split(',').map(Number)
const combos = designerAuditedChoices()
  .filter((c) => (c.curvedHorns || c.taperedLegs) && M_SIZES.includes(c.size) && M_GAUGES.includes(c.gauge ?? 1))
  .filter((c) => MATRIX || (c.curvedHorns && c.taperedLegs && !c.cuppedEars && !c.seatBackLegs))

test('the designer\'s curved-horn / tapered-leg combinations build clean and sit on the table', () => {
  assert.ok(combos.length > 0)
  if (MATRIX && !process.env.SIZES && !process.env.GAUGES) assert.equal(combos.length, 48)
  for (const c of combos) {
    const label = `${c.size} @ ${c.gauge ?? 1}${c.cuppedEars ? ' cupped' : ''}${c.seatBackLegs ? ' seated' : ''}${c.curvedHorns ? ' horns' : ''}${c.taperedLegs ? ' legs' : ''}`
    const compiled = compileComposition(buildAmigurumiProgram(c))
    assert.deepEqual(compiled.problems, [], `${label}: ${compiled.problems.join(' | ')}`)
    const minz = Math.min(...compiled.placed.map((q) => q.bounds.minz))
    assert.ok(Math.abs(minz) <= 0.5, `${label}: minz ${minz.toFixed(2)} mm, not sitting on the table`)
    if (c.taperedLegs) {
      for (const q of compiled.placed.filter((x) => /^front-leg-/.test(x.part.name))) {
        assert.ok(Math.abs(q.bounds.minz) <= 0.5, `${label}: ${q.part.name} foot ${q.bounds.minz.toFixed(2)} mm off the table`)
      }
    }
  }
})
