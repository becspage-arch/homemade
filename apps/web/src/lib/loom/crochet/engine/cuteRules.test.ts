/**
 * THE CUTE RULES, tested (cute-engine plan step 1, 26 Oct 2026). Pure data:
 * nothing is built, so this is fast and moves no geometry hash.
 *  - the rules table is well formed (unique ids, known quantities, ranges in
 *    order, sources and a measure on every rule);
 *  - every value measured on Bec's bar toys falls inside its family's range;
 *  - our cow-fable-1025 r1 cow fails exactly the rules the side-by-side and
 *    Bec's 26 Oct notes say it fails, and passes the rest.
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
  TOY_FAMILIES,
  checkCuteRules,
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
    const verdicts = checkCuteRules(toy.family, toy.values)
    assert.ok(verdicts.length >= 10, `${toy.label}: only ${verdicts.length} rules checked`)
    const fails = verdicts.filter((v) => !v.pass).map((v) => `${v.rule.id}=${v.value} not in [${v.range.min}, ${v.range.max}]`)
    assert.deepEqual(fails, [], `${toy.label} fails its own bar`)
  }
})

test('every hard rule is checked on at least one bar toy', () => {
  for (const rule of CUTE_RULES.filter((r) => r.strictness === 'hard')) {
    assert.ok(
      BAR_MEASUREMENTS.some((t) => rule.ranges[t.family] && t.values[rule.quantity] != null),
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
].sort()

test('our cow-fable-1025 r1 cow fails where it should, and only there', () => {
  const verdicts = checkCuteRules(OURS_COW_1025R1.family, OURS_COW_1025R1.values)
  const fails = verdicts.filter((v) => !v.pass).map((v) => v.rule.id).sort()
  assert.deepEqual(fails, OURS_SHOULD_FAIL)
  // The hard rules Bec named on 26 Oct are among them.
  for (const id of ['ears-folded', 'appendage-curved', 'eyes-wide-apart', 'muzzle-is-the-chin']) assert.ok(fails.includes(id), id)
  // And what it already gets right stays right.
  for (const id of ['big-head', 'eyes-low', 'muzzle-wide', 'limbs-chunky']) assert.ok(!fails.includes(id), id)
})
