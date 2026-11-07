/**
 * The seated four-legged figure base (seated-base-1107): the counts it derives
 * from any head follow the quadruped-seated rules, and every piece is real,
 * worded crochet. The full compile (rules 2/30/45/46/52-54 measured on the
 * settled toy, audits, hashes) is covered by amigurumi-presets.test.ts and the
 * cute report; this file is the fast shape check, no compile.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sphereRounds } from './sphereProfile'
import { pearRounds, seatedCounts, seatedQuadrupedBase, seatedTargets } from './seatedQuadruped'

const HEADS = [18, 24, 30].map((eq) => sphereRounds(eq, 1))

test('a pear body: hips wider than shoulders, a magic-ring start and a closed end', () => {
  const b = pearRounds(22, 18, 12)
  assert.equal(b[0], 6)
  assert.equal(b.at(-1), 6)
  const hipAt = b.indexOf(Math.max(...b))
  assert.ok(hipAt < b.length / 2, 'the widest round (the hips) is in the lower half')
  for (let k = 1; k < b.length; k++) assert.ok(Math.abs(b[k]! - b[k - 1]!) <= Math.max(6, b[k - 1]!), 'legal increases/decreases')
})

test('counts follow the rules from any head: body under the head, slim tapered legs', () => {
  const t = seatedTargets()
  for (const head of HEADS) {
    const eq = Math.max(...head)
    const c = seatedCounts(head)
    assert.ok(Math.max(...c.body) <= eq, 'the head is at least as wide as the body (rule 2)')
    const paw = Math.max(...c.frontLeg)
    const top = c.frontLeg.at(-1)!
    assert.ok(top < paw, 'the front leg tapers from paw to top (rule 45)')
    assert.ok(paw / eq < 0.5, 'a slim leg against the head (rule 29)')
    assert.ok(c.frontLegX > 0 && Number.isFinite(c.frontLegX), 'the front legs are spread to either side of the chest')
    assert.ok(c.backLeg.rounds.length >= 4 && c.backLeg.rounds[0] === 6, 'the back leg starts at a round sole')
    assert.ok(t.headToBody > 0)
  }
})

test('every piece carries words, colours and placements; the legs rest on the table', () => {
  for (const [k, size] of (['S', 'M', 'L'] as const).entries()) {
    const base = seatedQuadrupedBase({ size, head: HEADS[k]!, yarnRadiusMm: 2.1, mainHex: '#c98a4b', soleHex: '#f2e6d0' })
    const names = base.parts.map((p) => p.name)
    for (const n of ['body', 'head', 'front-leg-l', 'front-leg-r', 'back-leg-l', 'back-leg-r']) assert.ok(names.includes(n), n)
    for (const p of base.parts) {
      if (p.name === 'head') continue
      assert.ok((p.words ?? []).some((w) => /^Round 1: 6 /.test(w)), `${p.name} starts in a magic ring`)
      if (/leg/.test(p.name)) {
        assert.ok((p.words ?? []).some((w) => /contrast/.test(w)), `${p.name} has its sole colour line`)
        assert.equal((p.place as { rest?: number }).rest, 0, `${p.name} rests on the table`)
      }
    }
  }
})
