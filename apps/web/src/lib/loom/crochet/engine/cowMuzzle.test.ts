/**
 * THE OVAL MUZZLE (`CowChoices.muzzleOval`, cow-build-1025; job log
 * `crochet-bar/jobs/cow-fable-1023.md`, "Job cow-build-1025").
 *
 * The bar's muzzle is a soft wide oval, round all round. The capsule
 * (`muzzleSize`: sphereRounds with straight rounds) reads as a flat top edge
 * with squarish corners; the oval ball (`ovalRounds`) tapers to its middle.
 * This test holds it to:
 *   - `ovalRounds`: a palindrome from a magic ring, +-6 a round at most, every
 *     step an even-spread integer, aspect 1 = the sphere's own walk, longer
 *     with the aspect, and it never holds the widest count for more than
 *     the sphere does (no straight cylinder);
 *   - OFF MEANS OFF: absent, or at gauge 1, the program is the capsule's;
 *   - on (cow M at 1.3): the muzzle piece builds and audits clean on its own
 *     and its written rounds are the counts, round by round.
 *
 *   cd apps/web && pnpm exec tsx --conditions react-server --test src/lib/loom/crochet/engine/cowMuzzle.test.ts
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ovalRounds, sphereRounds } from './sphereProfile'
import { buildCowProgram, COW_DEFAULTS } from './cowPreset'
import { buildPart, auditPart } from './composition'
import { writeInstructions } from './program'
import { gaugeYarnRadiusMm, gSphere } from './gauge'

test('ovalRounds: a palindrome from a magic ring, at most +-6 a round, aspect 1 = the sphere, longer and tapered with the aspect', () => {
  for (const eq of [18, 24, 27, 30, 36]) {
    assert.deepEqual(ovalRounds(eq, 1), sphereRounds(eq), `eq ${eq}: aspect 1 is the sphere's walk`)
    let prevLen = ovalRounds(eq, 1).length
    for (const aspect of [1.2, 1.3, 1.4, 1.5]) {
      const r = ovalRounds(eq, aspect)
      assert.equal(r[0], 6)
      assert.deepEqual([...r].reverse(), r, `eq ${eq} x ${aspect} is a palindrome`)
      for (let k = 1; k < r.length; k++) {
        const d = r[k]! - r[k - 1]!
        assert.ok(Math.abs(d) <= 6, `eq ${eq} x ${aspect} round ${k + 1}: ${r[k - 1]} -> ${r[k]}`)
        assert.ok(r[k]! <= 2 * r[k - 1]! && r[k]! * 2 >= r[k - 1]!)
      }
      assert.equal(Math.max(...r), eq, `eq ${eq} x ${aspect} reaches its equator`)
      assert.ok(r.length >= prevLen, `eq ${eq}: longer at aspect ${aspect}`)
      prevLen = r.length
      // Tapered, not a capsule: the widest count held for at most three rounds.
      assert.ok(r.filter((c) => c === eq).length <= 3, `eq ${eq} x ${aspect}: ${r.join(',')}`)
    }
  }
  // Long enough for the bar's ~1.3: round count over the sphere's ~ the aspect.
  const s = sphereRounds(27).length
  const o = ovalRounds(27, 1.4).length
  assert.ok(o / s > 1.2 && o / s < 1.6, `${o} / ${s}`)
})

test('muzzleOval: absent or at gauge 1 the muzzle is the capsule; on at 1.3 the oval rounds, which build and audit clean and are written round by round', () => {
  const base = { ...COW_DEFAULTS, mainHex: '#5c382c', eyeMm: 19, muzzleSize: { equator: 1.15, across: 1 } }
  const capsule = buildCowProgram({ ...base, gauge: 1.3 })
  const oval = buildCowProgram({ ...base, gauge: 1.3, muzzleOval: { equator: 1.1, aspect: 1.4 } })
  const muz = (p: ReturnType<typeof buildCowProgram>) => p.parts.find((q) => q.name === 'muzzle')!
  // Off means off.
  const js = (v: unknown) => JSON.stringify(v)
  assert.equal(js(buildCowProgram(COW_DEFAULTS)), js(buildCowProgram({ ...COW_DEFAULTS, muzzleOval: { equator: 1.1, aspect: 1.4 } })))
  assert.equal(js(oval.parts.filter((q) => q.name !== 'muzzle')), js(capsule.parts.filter((q) => q.name !== 'muzzle')))
  // The oval's counts.
  const rounds = ovalRounds(gSphere(Math.round(18 * 1.1), 1.3), 1.4)
  assert.deepEqual(muz(oval).rounds, rounds)
  assert.notDeepEqual(muz(capsule).rounds, rounds)
  // The capsule holds its widest count over straight rounds; the oval tapers.
  const widest = (r: number[]) => r.filter((c) => c === Math.max(...r)).length
  assert.ok(widest(muz(capsule).rounds) >= 4 && widest(rounds) <= 3)
  // Builds and audits clean on its own, in the fine yarn.
  const yr = gaugeYarnRadiusMm('bulky', 1.3)
  const { built } = buildPart(muz(oval), yr)
  assert.deepEqual(auditPart(built, muz(oval), yr), [])
  // The words: every round's count, in order, from the magic ring to the close.
  const words = writeInstructions({ name: 'muzzle', stitch: 'sc', form: 'sphere', rounds }).join('\n')
  rounds.forEach((n, k) => assert.match(words, new RegExp(`Round ${k + 1}\\b[^\\n]*\\(${n} sts?\\)`), `round ${k + 1} (${n})`))
  // The nostrils move with the muzzle (same fraction of it), still on it.
  assert.ok(oval.embroidery?.some((e) => e.on === 'muzzle'))
})
