/**
 * THE LAMB (lambPreset.ts; crochet-bar job lamb-1027): an original seated
 * lamb designed from the cute rules alone, every piece real rounds.
 *
 *   - THE WORDS READ BACK: every written round of every piece is parsed back
 *     into the stitches it makes, and the count and the loop stitches must
 *     be exactly the ones the build works (fleece.ts `fleeceStitchAt`);
 *   - the cute finishes (cuteFinish.ts): the stuffing taper, the sunk eyes
 *     and the head tilt are opt-in and say so in the words;
 *   - the listing lamb (M, gauge 1.3) compiles with no audit problems, its
 *     feet on the table, every hard cute rule passing and the firm failures
 *     pinned to the three the engine has no shape for yet (33, 34, 40: see
 *     the job log); with `cuteGate` those three, and only those, block.
 *
 *   cd apps/web && pnpm exec tsx --conditions react-server --test src/lib/loom/crochet/engine/lambPreset.test.ts
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { LAMB_DEFAULTS, buildLambProgram } from './lambPreset'
import { compileComposition } from './composition'
import { fleeceStitchAt, sphereRoundOps, writeFleeceRounds, type FleeceSpec } from './fleece'
import { limbStuffing } from './cuteFinish'
import { writeCompositionInstructions } from './compositionPattern'

/** One written round -> the stitches it MAKES, in order ('dc' | 'lp'), or
 *  null for a line that is not a round. Understands the words fleece.ts and
 *  program.ts write: runs ("dc in next 3 sts"), increases ("2 dc in next st",
 *  "dc and lp st in next st"), "dc2tog", "[...] N times", "... in each st
 *  around" and the magic ring. */
function readRound(line: string, prev: number): { made: string[]; count: number } | null {
  const m = /^Round \d+(?: \(fleece\))?: (.*)\. \((\d+)(?: sts)?\)$/.exec(line)
  if (!m) return null
  const body = m[1]!, count = Number(m[2])
  const ring = /^(\d+) (dc|lp st) into a magic ring$/.exec(body)
  if (ring) return { made: Array(Number(ring[1])).fill(ring[2] === 'lp st' ? 'lp' : 'dc'), count }
  const st = (w: string): string => (w === 'lp st' ? 'lp' : 'dc')
  // One worked stitch: what it makes.
  const one = (t: string): string[] => {
    t = t.trim()
    if (t === 'dc2tog') return ['dc']
    let q = /^2 (dc|lp st) in next st$/.exec(t)
    if (q) return [st(q[1]!), st(q[1]!)]
    q = /^(dc|lp st) and (dc|lp st) in next st$/.exec(t)
    if (q) return [st(q[1]!), st(q[2]!)]
    q = /^(dc|lp st) in next st$/.exec(t)
    if (q) return [st(q[1]!)]
    q = /^(dc|lp st) in last st$/.exec(t)
    if (q) return [st(q[1]!)]
    q = /^(dc|lp st) in (?:next|last) (\d+) sts$/.exec(t)
    if (q) return Array(Number(q[2])).fill(st(q[1]!))
    throw new Error(`unread token "${t}" in "${line}"`)
  }
  // Split at top-level commas, expanding "[...] N times".
  const seq = (s: string): string[] => {
    const out: string[] = []
    let depth = 0, cur = ''
    const parts: string[] = []
    for (const ch of s) {
      if (ch === '[') depth++
      if (ch === ']') depth--
      if (ch === ',' && depth === 0) { parts.push(cur); cur = '' } else cur += ch
    }
    parts.push(cur)
    for (const p of parts.map((x) => x.trim())) {
      const r = /^\[(.*)\] (\d+) times$/.exec(p)
      if (r) { const unit = seq(r[1]!); for (let i = 0; i < Number(r[2]); i++) out.push(...unit); continue }
      out.push(...one(p))
    }
    return out
  }
  if (body === 'dc2tog around') return { made: Array(Math.floor(prev / 2)).fill('dc'), count }
  const each = /^(.*) in each st around$/.exec(body)
  if (each) {
    const w = each[1]!
    const per = w === '2 dc' ? ['dc', 'dc'] : /^(dc|lp st)$/.test(w) ? [st(w)] : one(`${w} in next st`)
    const made: string[] = []
    for (let i = 0; i < prev; i++) made.push(...per)
    return { made, count }
  }
  return { made: seq(body), count }
}

test('the words read back: every round of every piece makes the count and the loops the build works', () => {
  for (const size of ['S', 'M', 'L'] as const) {
    const p = buildLambProgram({ ...LAMB_DEFAULTS, size })
    for (const part of p.parts) {
      if (!part.words) continue
      const rows = part.words.filter((l) => l.startsWith('Row '))
      if (rows.length) {
        // A piece worked in rows (the folded ears): every row's stitches.
        assert.equal(rows.length, part.rounds.length, `${size} ${part.name}: one line per row`)
        rows.forEach((l, k) => {
          const r = readRound(l.replace(/^Row (\d+): ch 1, turn, /, 'Round $1: '), 0)
          assert.ok(r, `${size} ${part.name} row ${k + 1}`)
          assert.equal(r.count, part.rounds[k])
          assert.equal(r.made.length, part.rounds[k], `${size} ${part.name}: ${l}`)
        })
        continue
      }
      const lines = part.words.filter((l) => l.startsWith('Round '))
      assert.equal(lines.length, part.rounds.length, `${size} ${part.name}: one line per round`)
      lines.forEach((l, k) => {
        const r = readRound(l, k ? part.rounds[k - 1]! : 0)
        assert.ok(r, `${size} ${part.name} round ${k + 1} is a round line`)
        assert.equal(r.count, part.rounds[k], `${size} ${part.name} round ${k + 1}: the stated count`)
        assert.equal(r.made.length, part.rounds[k], `${size} ${part.name} round ${k + 1}: the stitches the words make (${l})`)
        if (part.fleece) {
          // The loops the words name are exactly the build's.
          const ops = sphereRoundOps(part.rounds, k)
          const want: string[] = []
          let i = 0
          for (const op of ops) {
            const n = op === 'inc' ? 2 : 1
            for (let t = 0; t < n; t++) want.push(fleeceStitchAt(part.fleece, k, i++, op) ? 'lp' : 'dc')
            if (op === 'dec') { want.pop(); want.push('dc') }
          }
          assert.deepEqual(r.made, want, `${size} ${part.name} round ${k + 1}: the loop stitches`)
        }
      })
    }
  }
})

test('fleece: loops on the listed rounds, staggered, never on a decrease', () => {
  const f: FleeceSpec = { rounds: [2, 4], every: 2, loop: {} }
  assert.equal(fleeceStitchAt(f, 1, 0), undefined)
  assert.equal(fleeceStitchAt(f, 2, 0), 'loopst')
  assert.equal(fleeceStitchAt(f, 2, 1), undefined)
  assert.equal(fleeceStitchAt(f, 4, 0), undefined, 'the second fleece round starts a stitch on')
  assert.equal(fleeceStitchAt(f, 4, 1), 'loopst')
  assert.equal(fleeceStitchAt(f, 2, 0, 'dec'), undefined)
  const words = writeFleeceRounds([6, 12, 12, 6], { rounds: [2], every: 1, loop: {} }, { closeWords: 'Close.' })
  assert.equal(words[1], 'Round 2: 2 dc in each st around. (12 sts)')
  assert.equal(words[2], 'Round 3 (fleece): lp st in each st around. (12 sts)')
  assert.equal(words[3], 'Round 4: [dc2tog] 6 times. (6 sts)')
})

test('the cute finishes: limb stuffing tapers, the eyes are sunk, the head tilts, and the words say so', () => {
  const s = limbStuffing([6, 12, 18, 18, 18, 16, 14, 12, 12, 6])
  assert.equal(s[0], 1)
  assert.deepEqual(s.slice(-2), [0, 0])
  for (let k = 1; k < s.length; k++) assert.ok(s[k]! <= s[k - 1]!, 'never firmer towards the top')
  const p = buildLambProgram(LAMB_DEFAULTS)
  const leg = p.parts.find((q) => q.name === 'front-leg-l')!
  assert.equal(leg.stuffByRound?.length, leg.rounds.length)
  assert.match(leg.words!.at(-1)!, /Stuff firmly at the foot, then lightly towards the top, and leave the last 2 rounds unstuffed/)
  for (const e of p.props!.filter((q) => /^eye-/.test(q.name))) assert.ok((e.sink ?? 0) > 0, `${e.name} sunk`)
  const words = writeCompositionInstructions(p).join('\n')
  assert.match(words, /pull the yarn tight through to the back of the head to sink the eyes/)
  assert.match(words, /tipped a few degrees towards one shoulder/)
  assert.doesNotMatch(words, /Sew the front legs? to the body[^\n]*stuffing firmly/)
  assert.doesNotMatch(words, /—/)
  // Upright and plain are opt-outs, and they change only what they say.
  const up = buildLambProgram({ ...LAMB_DEFAULTS, headTiltDeg: 0 })
  assert.deepEqual(up.parts.map((q) => q.rounds), p.parts.map((q) => q.rounds))
  assert.notDeepEqual(up.props![0]!.dir, p.props![0]!.dir)
  const plain = buildLambProgram({ ...LAMB_DEFAULTS, plainFleece: true })
  assert.ok(plain.parts.every((q) => !q.fleece))
})

test('the listing lamb: no audit problems, on the table, the hard rules pass, the firm misses pinned', () => {
  const p = buildLambProgram(LAMB_DEFAULTS)
  const c = compileComposition(p)
  assert.deepEqual(c.problems, [])
  const fails = c.cute!.results.filter((r) => !r.pass && r.strictness !== 'soft' && r.source !== 'proxy')
  // 33/34: the fleece's loops and the folded ears' tips read as corners on
  // the head's outline; 40: the folded ear has a one-yarn rim (the cow's
  // known gap). See the job log's lessons.
  assert.deepEqual(fails.map((r) => r.n), [33, 34, 40])
  const by = (id: string) => c.cute!.results.find((r) => r.id === id)!
  for (const id of ['eyes-set-in', 'limbs-slim-at-join', 'feet-forward', 'one-asymmetry', 'gentle-tilt']) assert.ok(by(id).pass, id)
  for (const n of ['front-leg-l', 'front-leg-r', 'back-leg-l', 'back-leg-r', 'body']) {
    assert.ok(Math.abs(c.placed.find((q) => q.part.name === n)!.bounds.minz) < 3.5, `${n} on the table`)
  }
  // The gate blocks on exactly those three.
  const gated = compileComposition(buildLambProgram({ ...LAMB_DEFAULTS, cuteGate: true }))
  assert.equal(gated.problems.length, 3)
  assert.ok(gated.problems.every((x) => /^cute: .*\(rule (33|34|40), firm\)$/.test(x)), gated.problems.join('\n'))
})

test('S and L: no audit problems, every hard rule passes, the same three firm misses', () => {
  for (const size of ['S', 'L'] as const) {
    const c = compileComposition(buildLambProgram({ ...LAMB_DEFAULTS, size }))
    assert.deepEqual(c.problems, [], size)
    const fails = c.cute!.results.filter((r) => !r.pass && r.strictness !== 'soft' && r.source !== 'proxy')
    assert.deepEqual(fails.map((r) => r.n), [33, 34, 40], size)
  }
})
