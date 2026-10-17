/**
 * THE EAR PIECE, tested (cupped-ear pass, 2026-10-17): every size and variant
 * the presets use, and the edges of each option, built, relaxed and AUDITED
 * exactly as the composition builds them (composition.ts buildPart /
 * auditPart), then measured in the settled frame:
 *  - a cup holds a real hollow (its open rim stands well clear of the inside
 *    of the bowl) and a pinch narrows the base of its rim;
 *  - a lop's front face is hollow (edges forward of the middle) and its tip
 *    ends ROUNDED (narrowing smoothly, neither a plank end nor a point);
 *  - the lining sits on the front face, and the words print the counts.
 * The opt-in preset switches leave the default programs untouched.
 *
 *   cd apps/web && pnpm exec tsx --test src/lib/loom/crochet/engine/earPiece.test.ts
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildEar, earLining, earMetrics, earRounds, earWords, type EarPieceOptions } from './earPiece'
import { YARN_WEIGHT_RADIUS_MM } from './program'
import { COW_CUP_EAR, COW_DEFAULTS, buildCowProgram } from './cowPreset'
import { BUNNY_LOP_EAR, allPresetChoices, buildAmigurumiProgram } from './amigurumiPresets'

const BULKY = YARN_WEIGHT_RADIUS_MM.bulky
const FINE = YARN_WEIGHT_RADIUS_MM.fine
const SIZES = ['S', 'M', 'L'] as const

test('the rounds: a cup grows +6 to its width, works even for its depth and rim; a lop grows +3, tapers and stays open', () => {
  assert.deepEqual(earRounds({ kind: 'cup', width: 18, depth: 2, rimRoll: 1 }), [6, 12, 18, 18, 18, 18])
  assert.deepEqual(earRounds({ kind: 'cup', width: 15, depth: 0 }), [6, 12, 15])
  const lop = earRounds({ kind: 'lop', width: 21, length: 40, depth: 1 })
  assert.equal(lop.length, 40)
  assert.deepEqual(lop.slice(0, 6), [6, 9, 12, 15, 18, 21])
  assert.equal(Math.max(...lop), 21)
  assert.ok(lop[lop.length - 1]! < 21, 'the lop narrows toward its base')
  for (let k = 1; k < lop.length; k++) assert.ok(Math.abs(lop[k]! - lop[k - 1]!) <= 3, `round ${k + 1} steps by at most 3`)
  assert.throws(() => earRounds({ kind: 'cup', width: 18, depth: 1.5 }))
  assert.throws(() => earRounds({ kind: 'cup', width: 18, depth: 1, rimRoll: 3 }))
  assert.throws(() => earRounds({ kind: 'lop', width: 21, depth: 2 }))
})

test('the words: every round, the lining runs, the open fasten-off and the fold or pinch', () => {
  const cup: EarPieceOptions = { kind: 'cup', width: 12, depth: 2, rimRoll: 1, pinch: 0.6, liningHex: '#eeddcc' }
  const cw = earWords(cup)
  const rounds = earRounds(cup)
  for (let k = 0; k < rounds.length; k++) assert.ok(cw.some((l) => l.startsWith(`Round ${k + 1}:`) && l.endsWith(`(${rounds[k]} sts)`)), `cup round ${k + 1}`)
  assert.ok(cw.some((l) => /Start with the lining yarn/.test(l)) && cw.some((l) => /Change to the main yarn/.test(l)))
  assert.ok(cw.some((l) => /Do not stuff and do not close/.test(l)))
  assert.ok(cw.some((l) => /Fold the last round back over the outside/.test(l)))
  assert.ok(cw.some((l) => /Pinch the rim together at the base/.test(l)))
  for (const l of cw) assert.ok(!/[–—]/.test(l), `no dashes: ${l}`)
  const lop: EarPieceOptions = { ...BUNNY_LOP_EAR.M, liningHex: '#e8b4b0' }
  const lw = earWords(lop)
  const runs = earLining(lop)
  assert.ok(Object.keys(runs).length > 10, 'the lining runs the length of the ear')
  for (const k of Object.keys(runs).map(Number)) {
    const [a, n] = runs[k]!
    assert.ok(lw.some((l) => l.startsWith(`Round ${k + 1}:`) && l.includes(`in next ${n} sts`) && (a === 0 || l.includes(`in next ${a} sts`))), `lining round ${k + 1}`)
  }
  assert.ok(lw.some((l) => /softly hollow down to the rounded tip/.test(l)))
})

for (const size of SIZES) {
  test(`cow cup ear ${size}: audits clean and holds a real hollow`, () => {
    const o = COW_CUP_EAR[size]
    const { built, problems } = buildEar(o, BULKY)
    assert.deepEqual(problems, [])
    const m = earMetrics(o, built)
    assert.ok(m.hollowMm >= 2.5 * BULKY, `hollow ${m.hollowMm.toFixed(1)} mm (needs ${2.5 * BULKY} mm)`)
  })
}

test('cup variants: a shallow half-ball, a deep bowl, an oval and a lined cup all audit clean', () => {
  const cases: EarPieceOptions[] = [
    { kind: 'cup', width: 18, depth: 0 },
    { kind: 'cup', width: 18, depth: 3, rimRoll: 1, pinch: 1 },
    { kind: 'cup', width: 24, depth: 2, rimRoll: 1, pinch: 0.6 },
    { kind: 'cup', width: 15, depth: 2, rimRoll: 1, pinch: 0.6, squash: 0.15 },
    { kind: 'cup', width: 12, depth: 2, rimRoll: 1, pinch: 0.6, liningHex: '#eeddcc' },
  ]
  let prev = -Infinity
  for (const o of cases) {
    const { built, problems } = buildEar(o, BULKY)
    assert.deepEqual(problems, [], JSON.stringify(o))
    const m = earMetrics(o, built)
    assert.ok(m.hollowMm > 0, `${JSON.stringify(o)} hollow ${m.hollowMm.toFixed(1)}`)
    if (o.width === 18) {
      // Depth is depth: three even rounds hold a far deeper bowl than none.
      assert.ok(m.hollowMm > prev + 3 * BULKY, `depth ${o.depth}: ${m.hollowMm.toFixed(1)} mm`)
      prev = m.hollowMm
    }
    if (o.squash) assert.ok(m.rimMm!.x < m.rimMm!.y * 0.8, `squashed oval rim ${m.rimMm!.x.toFixed(0)} x ${m.rimMm!.y.toFixed(0)}`)
  }
})

test('a pinch narrows the base of the cup rim', () => {
  const base: EarPieceOptions = { kind: 'cup', width: 18, depth: 2 }
  const open = earMetrics(base, buildEar(base, BULKY).built).rimMm!.pinch
  const pinched = { ...base, pinch: 1 }
  const r = buildEar(pinched, BULKY)
  assert.deepEqual(r.problems, [])
  const p = earMetrics(pinched, r.built).rimMm!.pinch
  assert.ok(p >= open + 0.08, `pinch ${p.toFixed(2)} vs open ${open.toFixed(2)}`)
})

for (const size of SIZES) {
  test(`bunny lop ear ${size}: audits clean, a hollow lined face, a rounded tip`, () => {
    const o: EarPieceOptions = { ...BUNNY_LOP_EAR[size], liningHex: '#e8b4b0' }
    const { built, problems, panelMask } = buildEar(o, FINE)
    assert.deepEqual(problems, [])
    const m = earMetrics(o, built)
    assert.ok(m.hollowMm >= 0.75 * FINE, `hollow ${m.hollowMm.toFixed(2)} mm (needs ${(0.75 * FINE).toFixed(2)})`)
    // Rounded: narrower than full width near the end (a plank end is ~1),
    // full width by half a width back (a point is still narrow there).
    assert.ok(m.tipWidth15! > 0.55 && m.tipWidth15! < 0.9, `tip at 15%: ${m.tipWidth15!.toFixed(2)}`)
    assert.ok(m.tipWidth50! >= 0.9, `tip at 50%: ${m.tipWidth50!.toFixed(2)}`)
    // The lining is on the front face (local +x), where the hollow is.
    const nodes = built.model.nodes
    let lx = 0, ln = 0, ax = 0
    nodes.forEach((n, i) => { ax += n.x; if (panelMask?.[i]) { lx += n.x; ln++ } })
    assert.ok(ln > 0 && lx / ln > ax / nodes.length + FINE, 'the lining faces front')
  })
}

/** Programs carry closures (custom pieces); compare what they say. */
const same = (a: unknown, b: unknown, msg?: string): void => assert.equal(JSON.stringify(a), JSON.stringify(b), msg)

test('the presets: the switches are opt-in and change only the ears', () => {
  const cowOff = buildCowProgram(COW_DEFAULTS)
  same(buildCowProgram({ ...COW_DEFAULTS, cuppedEars: false }), cowOff)
  const cowOn = buildCowProgram({ ...COW_DEFAULTS, cuppedEars: true })
  assert.deepEqual(cowOn.parts.map((p) => p.name), cowOff.parts.map((p) => p.name))
  cowOn.parts.forEach((p, i) => {
    if (/^ear-/.test(p.name)) assert.ok(p.tube && p.rimFold === 1 && p.pinch && p.words?.length)
    else same(p, cowOff.parts[i], p.name)
  })
  const bunny = allPresetChoices().find((c) => c.base === 'bunny' && c.size === 'M')!
  const bOff = buildAmigurumiProgram(bunny)
  same(buildAmigurumiProgram({ ...bunny, cuppedEars: false }), bOff)
  const bOn = buildAmigurumiProgram({ ...bunny, cuppedEars: true })
  bOn.parts.forEach((p, i) => {
    if (/^ear-/.test(p.name)) assert.ok(p.tube && p.pressShape && p.panel && p.bend)
    else same(p, bOff.parts[i], p.name)
  })
  // Another base ignores the switch.
  const bear = allPresetChoices().find((c) => c.base === 'bear' && c.size === 'M')!
  same(buildAmigurumiProgram({ ...bear, cuppedEars: true }), buildAmigurumiProgram(bear))
})
