/**
 * THE CUTE RULES, tested (cute-engine plan step 1, 26 Oct 2026). Pure data:
 * nothing is built, so this is fast and moves no geometry hash.
 *  - the rules table is well formed (unique ids, known quantities, ranges in
 *    order, sources and a measure on every rule);
 *  - every value measured on Bec's bar toys falls inside its family's range;
 *  - our cow-fable-1025 r1 cow fails exactly the rules the side-by-side and
 *    Bec's 26 Oct notes say it fails, and passes the rest;
 *  - (engine-rules 1107) rules by family and feature type: a cat's prick
 *    ear and cord tail are not judged by the cow's ear and horn rules, eye
 *    rules work for one, two or many and for sleeping eyes, the provisional
 *    families (blob, long body) are provisional everywhere, and the lamb-1027
 *    numbers fail the four things Bec saw the rules miss.
 *
 *   cd apps/web && pnpm exec tsx --test src/lib/loom/crochet/engine/cuteRules.test.ts
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  BAR_MEASUREMENTS,
  CUTE_QUANTITIES,
  CUTE_RULES,
  OURS_COW_1025R1,
  OURS_LAMB_1027,
  PROVISIONAL_FAMILIES,
  TOY_FAMILIES,
  checkCuteRules,
  ruleNotApplicable,
  type CuteFeatures,
} from './cuteRules'

test('the rules table is well formed', () => {
  const ids = new Set<string>()
  for (const rule of CUTE_RULES) {
    assert.ok(!ids.has(rule.id), `duplicate rule id ${rule.id}`)
    ids.add(rule.id)
    assert.ok(rule.quantity in CUTE_QUANTITIES, `${rule.id}: unknown quantity ${rule.quantity}`)
    assert.ok(rule.what.length > 10 && rule.why.length > 10, `${rule.id}: what/why missing`)
    assert.ok(rule.from.length > 0, `${rule.id}: no bar photo`)
    const fams = Object.keys(rule.ranges)
    assert.ok(fams.length > 0, `${rule.id}: no family range`)
    for (const f of fams) assert.ok((TOY_FAMILIES as readonly string[]).includes(f), `${rule.id}: unknown family ${f}`)
    for (const [f, range] of Object.entries(rule.ranges)) {
      assert.ok(range && Number.isFinite(range.min) && Number.isFinite(range.max), `${rule.id}/${f}: range not finite`)
      assert.ok(range!.min < range!.max, `${rule.id}/${f}: min ${range!.min} >= max ${range!.max}`)
    }
    if (rule.measure.kind === 'engine-now') assert.ok(rule.measure.from.length > 0)
    else assert.ok(rule.measure.what.length > 0)
  }
  // Every quantity the table defines is used by a rule.
  for (const q of Object.keys(CUTE_QUANTITIES)) assert.ok(CUTE_RULES.some((r) => r.quantity === q), `quantity ${q} has no rule`)
})

test('every bar measurement falls inside its family range', () => {
  for (const toy of BAR_MEASUREMENTS) {
    const verdicts = checkCuteRules(toy.family, toy.values, toy.features)
    assert.ok(verdicts.length >= 10, `${toy.label}: only ${verdicts.length} rules checked`)
    const fails = verdicts.filter((v) => !v.pass).map((v) => `${v.rule.id}=${v.value} not in [${v.range.min}, ${v.range.max}]`)
    assert.deepEqual(fails, [], `${toy.label} fails its own bar`)
  }
})

test('every hard rule is checked on at least one bar toy', () => {
  for (const rule of CUTE_RULES.filter((r) => r.strictness === 'hard')) {
    assert.ok(
      BAR_MEASUREMENTS.some((t) => rule.ranges[t.family] && t.values[rule.quantity] != null && !ruleNotApplicable(rule, t.family, t.features)),
      `${rule.id}: no bar toy measures it`,
    )
  }
})

/** What our 1025 r1 cow gets wrong (bar-vs-ours-1025r1.png + Bec 26 Oct). */
const OURS_SHOULD_FAIL = [
  'head-as-wide-as-body', 'head-is-the-widest',
  'eyes-wide-apart', 'eyes-small', 'eyes-on-the-muzzle', 'eyes-over-muzzle-corners',
  'muzzle-is-the-chin', 'muzzle-tone', 'muzzle-warm',
  'ears-stand-out', 'ears-high', 'ear-shape', 'ears-folded',
  'appendage-curved', 'appendage-bend', 'appendage-rises', 'appendage-tapers', 'appendage-short',
  'limb-ends-rounded', 'no-sharp-corners', 'no-straight-edges',
  'one-asymmetry', 'curls-mixed',
  // rule-calib 1027: horn tips under the crown, a one-yarn ear rim, a white muzzle (the base is slender: 39 passes).
  'appendage-clears-crown', 'ear-rim-thick', 'muzzle-light', 'curls-packed', 'fringe-low',
].sort()

test('our cow-fable-1025 r1 cow fails where it should, and only there', () => {
  const verdicts = checkCuteRules(OURS_COW_1025R1.family, OURS_COW_1025R1.values, OURS_COW_1025R1.features)
  const fails = verdicts.filter((v) => !v.pass).map((v) => v.rule.id).sort()
  assert.deepEqual(fails, OURS_SHOULD_FAIL)
  // The hard rules Bec named on 26 Oct are among them.
  for (const id of ['ears-folded', 'appendage-curved', 'eyes-wide-apart', 'muzzle-is-the-chin']) assert.ok(fails.includes(id), id)
  // And what it already gets right stays right.
  for (const id of ['big-head', 'eyes-low', 'muzzle-wide', 'limbs-chunky']) assert.ok(!fails.includes(id), id)
})

test('engine-rules 1107: every range no bar photo has measured is marked provisional', () => {
  for (const rule of CUTE_RULES) {
    for (const f of PROVISIONAL_FAMILIES) {
      const range = rule.ranges[f]
      if (range) assert.equal(range.provisional, true, `${rule.id}/${f} must be provisional (no bar photo)`)
    }
    // A rule no bar toy measures (for its family and features) is provisional
    // in every family, unless it is a lamb-1027 lesson set on the bar cow.
    const measured = BAR_MEASUREMENTS.some((t) => rule.ranges[t.family] && t.values[rule.quantity] != null && !ruleNotApplicable(rule, t.family, t.features))
    if (!measured) {
      for (const [f, range] of Object.entries(rule.ranges)) assert.equal(range!.provisional, true, `${rule.id}/${f}: no bar toy measures it, so it is provisional`)
    }
  }
})

test('engine-rules 1107: feature types pick the rules (a cat is not judged by the cow\'s ear and horn)', () => {
  const ids = (f: CuteFeatures): string[] => CUTE_RULES.filter((r) => !ruleNotApplicable(r, 'quadruped-seated', f)).map((r) => r.id)
  const cow = ids({ ears: 'cupped', eyes: 'safety', eyeCount: 2, horns: 'curved', coat: ['curly-fringe'], muzzle: 'contrast' })
  const cat = ids({ ears: 'upright-pointed', eyes: 'safety', eyeCount: 2, horns: 'none', tail: 'straight', muzzle: 'contrast' })
  for (const id of ['ears-stand-out', 'ears-high', 'ear-shape', 'ears-folded', 'ear-rim-thick', 'appendage-curved', 'appendage-rises', 'appendage-clears-crown', 'curls-packed']) {
    assert.ok(cow.includes(id), `cow: ${id}`)
    assert.ok(!cat.includes(id), `cat: ${id} is for another feature type`)
  }
  for (const id of ['pointed-ears-on-top', 'pointed-ears-shape']) { assert.ok(cat.includes(id), id); assert.ok(!cow.includes(id), id) }
  // A curved tail brings the curve rules back, but not the horn rules.
  const curledTail = ids({ ears: 'upright-pointed', eyes: 'safety', eyeCount: 2, horns: 'none', tail: 'curved' })
  assert.ok(curledTail.includes('appendage-curved') && curledTail.includes('appendage-tapers'))
  assert.ok(!curledTail.includes('appendage-rises') && !curledTail.includes('appendage-slender'))
  // Eyes: one, two, many; open or sleeping.
  const eyes = (f: CuteFeatures): string[] => ids(f).filter((id) => /eye/.test(id))
  assert.ok(eyes({ eyes: 'safety', eyeCount: 2 }).includes('eyes-wide-apart'))
  assert.ok(!eyes({ eyes: 'safety', eyeCount: 1 }).includes('eyes-wide-apart') && eyes({ eyes: 'safety', eyeCount: 1 }).includes('one-eye-centred'))
  assert.ok(eyes({ eyes: 'embroidered', eyeCount: 8 }).includes('many-eyes-spread'))
  assert.ok(!eyes({ eyes: 'embroidered', eyeCount: 8 }).includes('eyes-set-in'), 'no safety eye to sink')
  const sleeping = eyes({ eyes: 'sleeping', eyeCount: 2 })
  assert.ok(sleeping.includes('sleeping-eyes-arc') && !sleeping.includes('eyes-small') && sleeping.includes('eyes-face-the-lens'))
  // Fleece reads the fleece rules, not the curl rules.
  const lamb = ids(OURS_LAMB_1027.features)
  assert.ok(lamb.includes('fleece-loops-small') && lamb.includes('fleece-packed') && lamb.includes('face-band-short'))
  assert.ok(!lamb.includes('curls-packed') && !lamb.includes('fringe-low'))
  // The new families: a blob gets the face, softness and character rules.
  const blob = CUTE_RULES.filter((r) => !ruleNotApplicable(r, 'blob', { eyes: 'safety', eyeCount: 2 })).map((r) => r.id)
  for (const id of ['eyes-wide-apart', 'eyes-face-the-lens', 'no-sharp-corners', 'one-asymmetry']) assert.ok(blob.includes(id), `blob: ${id}`)
  assert.ok(!blob.includes('big-head') && !blob.includes('limbs-chunky'))
  const long = CUTE_RULES.filter((r) => !ruleNotApplicable(r, 'long-body', { eyes: 'safety', eyeCount: 2, tail: 'curved' })).map((r) => r.id)
  for (const id of ['long-body-length', 'appendage-curved', 'appendage-bend']) assert.ok(long.includes(id), `long body: ${id}`)
})

test('engine-rules 1107: the lamb-1027 numbers fail what Bec saw (eyes at the sides, a muzzle block, an empty band, short ball legs)', () => {
  const verdicts = checkCuteRules(OURS_LAMB_1027.family, OURS_LAMB_1027.values, OURS_LAMB_1027.features)
  const fails = verdicts.filter((v) => !v.pass).map((v) => v.rule.id)
  for (const id of ['eyes-face-the-lens', 'muzzle-in-rounds', 'face-band-short', 'limbs-long', 'limbs-not-balls', 'legs-reach-the-table']) assert.ok(fails.includes(id), id)
  // Its earlier misses are still caught; what it does well still passes.
  for (const id of ['no-sharp-corners', 'no-straight-edges', 'ear-rim-thick']) assert.ok(fails.includes(id), id)
  for (const id of ['eyes-wide-apart', 'eyes-low', 'big-head', 'muzzle-is-the-chin', 'limbs-slim-at-join', 'fleece-loops-small', 'fleece-packed']) assert.ok(!fails.includes(id), id)
})
