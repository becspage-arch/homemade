/**
 * Embroidered faces (faceEmbroidery.ts): the face is sewn ON the settled
 * fabric, it never moves a crocheted stitch, it is symmetrical, and the
 * written pattern places it by round and stitch.
 *
 *   cd apps/web && pnpm exec tsx --test src/lib/loom/crochet/engine/faceEmbroidery.test.ts
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compileComposition, compositionScene } from './composition'
import { buildAmigurumiProgram, type AmigurumiChoices } from './amigurumiPresets'
import { writeAssembly, compositionNotions } from './compositionPattern'
import { PRESET_GEOMETRY_HASH_GENERATED } from './amigurumiSizes.generated'
import { buildFaceEmbroidery, roundAtElevation, roundWords, FACE_STYLE_IDS } from './faceEmbroidery'

const choice = (base: AmigurumiChoices['base'], face?: AmigurumiChoices['face']): AmigurumiChoices => ({
  base, size: 'M', mainHex: '#efe4d2', contrastHex: '#fbf7ef', eyeMm: 9, nose: true, paws: true, face,
})

test('the default face is the original safety face: no embroidery, same props', () => {
  for (const base of ['bear', 'bunny'] as const) {
    const a = buildAmigurumiProgram(choice(base))
    const b = buildAmigurumiProgram(choice(base, 'safety'))
    assert.equal(a.embroidery, undefined)
    assert.deepEqual(a, b)
    assert.ok(a.props?.some((p) => p.name === 'eye-l'))
  }
})

test('embroidered styles drop the safety eyes and nose they replace', () => {
  const sleepy = buildAmigurumiProgram(choice('bunny', 'sleepy'))
  assert.ok(!sleepy.props?.some((p) => /eye|nose/.test(p.name)))
  const mixed = buildAmigurumiProgram(choice('bear', 'safety-stitched'))
  assert.ok(mixed.props?.some((p) => p.name === 'eye-l'))
  assert.ok(!mixed.props?.some((p) => p.name === 'nose'))
  assert.ok(mixed.embroidery?.some((e) => e.name === 'nose'))
  for (const s of FACE_STYLE_IDS) buildAmigurumiProgram(choice('chick', s)) // no muzzle: must not throw
})

test('features are mirror-symmetric about centre front', () => {
  for (const style of ['sleepy', 'stitched'] as const) {
    const p = buildAmigurumiProgram(choice('bear', style))
    const f = p.embroidery!
    for (const [l, r] of [['eye-l', 'eye-r'], ['blush-l', 'blush-r']]) {
      const L = f.find((x) => x.name === l)!
      const R = f.find((x) => x.name === r)!
      assert.equal(L.stitches.length, R.stitches.length)
      L.stitches.forEach((s, i) => {
        const t = R.stitches[i]!
        assert.equal(s.from.round, t.from.round)
        assert.ok(Math.abs(s.from.st + t.from.st) < 1e-9, `${l} stitch ${i} not mirrored`)
      })
    }
  }
})

test('eyes are set low and wide: below the crown third, well apart', () => {
  const p = buildAmigurumiProgram(choice('bunny', 'sleepy'))
  const head = p.parts.find((x) => x.name === 'head')!
  const eye = p.embroidery!.find((x) => x.name === 'eye-l')!
  const r = eye.stitches[0]!.from.round
  assert.ok(r >= head.rounds.length * 0.45, `eye round ${r} is not low on a ${head.rounds.length}-round head`)
  assert.ok(roundAtElevation(head.rounds, 0) > r - 1.5)
})

test('pattern words place every feature by round and stitch, in the notions too', () => {
  const p = buildAmigurumiProgram(choice('bunny', 'sleepy'))
  const words = writeAssembly(p).join('\n')
  assert.match(words, /Sleeping eyes \(dark brown embroidery thread\): bring the needle up (in round|between rounds) \d+/)
  assert.match(words, /stitches from centre front/)
  assert.match(words, /Nose \(pink embroidery thread\)/)
  assert.match(words, /Mouth/)
  assert.match(words, /Blush \(soft pink wool\)/)
  assert.ok(compositionNotions(p).some((n) => /Dark brown embroidery thread/.test(n)))
  assert.equal(roundWords(6.5), 'between rounds 6 and 7')
  assert.equal(roundWords(7), 'in round 7')
})

test('safety style has no embroidery at the layout level', () => {
  assert.deepEqual(
    buildFaceEmbroidery('safety', {
      head: { name: 'head', rounds: [6, 12] }, forward: { x: 0, y: 1, z: 0 }, right: { x: 1, y: 0, z: 0 },
      eyeElevDeg: 0, eyeAzDeg: 30, blushElevDeg: 0, blushAzDeg: 40,
    }),
    [],
  )
})

test('the embroidery is real strands ON the fabric and moves no stitch (sleepy bunny, compiled)', () => {
  const p = buildAmigurumiProgram(choice('bunny', 'sleepy'))
  const c = compileComposition(p)
  assert.deepEqual(c.problems, [])
  // The embroidery moves no crocheted stitch: the same program without it
  // compiles to the same geometry hash. (The embroidered bunny shows its
  // muzzle's magic ring rather than its closing hole, so it is not the
  // safety-eye bunny's hash; the default face keeps that one, guarded by
  // amigurumi-presets.test.ts.)
  assert.equal(c.geometryHash, compileComposition({ ...p, embroidery: undefined }).geometryHash)
  assert.notEqual(PRESET_GEOMETRY_HASH_GENERATED['bunny-M'], undefined)
  assert.ok(c.embroidery.length >= 6)
  const head = c.placed.find((x) => x.part.name === 'head')!
  const muzzle = c.placed.find((x) => x.part.name === 'muzzle')!
  const near = (q: { x: number; y: number; z: number }, cloud: { x: number; y: number; z: number }[]): number => {
    let best = Infinity
    for (const v of cloud) best = Math.min(best, Math.hypot(v.x - q.x, v.y - q.y, v.z - q.z))
    return best
  }
  for (const e of c.embroidery) {
    const cloud = e.name === 'nose' || e.name === 'mouth' ? muzzle.ctrl : head.ctrl
    for (const line of e.strands) {
      // The visible run rests on the yarn: within a yarn's thickness or so of
      // the fabric centre-line, never floating off it or buried in it.
      for (const q of line.slice(1, -1)) {
        const d = near(q, cloud)
        assert.ok(d < c.yr * 2.6, `${e.name} strand floats ${d.toFixed(2)} mm off the fabric`)
      }
    }
  }
  // The scene carries them as extra plied strokes in their thread colours.
  const scene = compositionScene(p, c)
  assert.ok(scene.strokes.length > c.placed.length)
  assert.ok(scene.strokes.some((s) => s.hex === '#3a2a22'))
})
