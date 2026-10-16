import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildRelaxedSwatch } from './buildSwatch'
import { auditProblems } from './auditChecks'
import { SWATCH_RECIPES } from './dictionary'
import { buildHairPatch, hairPatchProblems, hairPatchesFor, stitchAtOf, writeHairInstructions } from './hairPatch'

const YR = 2.1

for (const arg of ['loopst', 'loopcurl'] as const) {
  test(`${arg} swatch is genuinely stitched (audit clean, both loop roots hooked)`, () => {
    const sw = buildRelaxedSwatch(arg, SWATCH_RECIPES[arg].auditW, YR)
    assert.deepEqual(auditProblems(sw, arg, SWATCH_RECIPES[arg].auditW, YR), [])
    const loose = sw.built.model.loose
    assert.ok(loose && loose.some(Boolean), 'the loops are loose yarn')
    // 8 loops on each of the 3 wrong-side rows, each adding a second hook.
    assert.equal(sw.built.links.length, 6 * 10 + 3 * 8)
    // The loops stand out on the RIGHT side (+z, the camera), not through the work.
    const n = sw.built.model.nodes
    let fz = 0, fc = 0
    n.forEach((p, i) => { if (!loose![i]) { fz += p.z; fc++ } })
    const mid = fz / fc
    const behind = n.filter((p, i) => loose![i] && p.z < mid).length
    assert.ok(behind <= 3, `${behind} loop nodes ended up behind the fabric`)
  })
}

for (const style of ['fringe', 'curly-fringe'] as const) {
  test(`${style} patch audits clean and every loop stays outside the head`, () => {
    const [h] = hairPatchesFor(style, 'head', '#74472f', { x: 0, y: 0.8, z: 1 })
    const built = buildHairPatch(h!, YR)
    assert.deepEqual(hairPatchProblems(h!, built, YR), [])
    const m = built.model
    let face = -Infinity
    m.nodes.forEach((p, i) => { if (!m.loose?.[i] && p.z > face) face = p.z })
    // The head is +z of the worked face; no loose loop may pass into it.
    assert.ok(m.nodes.every((p, i) => !m.loose?.[i] || p.z <= face + 1e-6))
  })
}

test('the fringe words match the patch counts and name the loop stitch', () => {
  const [h] = hairPatchesFor('curly-fringe', 'head', '#74472f', { x: 0, y: 0.8, z: 1 })
  const words = writeHairInstructions(h!, 'head').join('\n')
  assert.match(words, /Round 1: 6 lp st into a magic ring\. \(6\)/)
  assert.match(words, /Round 3: \*1 lp st, 2 lp st in next st\* 6 times\. \(18\)/)
  assert.equal(hairPatchesFor('none', 'head', '#000', { x: 0, y: 0, z: 1 }).length, 0)
  assert.equal(hairPatchesFor(undefined, 'head', '#000', { x: 0, y: 0, z: 1 }).length, 0)
})

// ── The Highland cow (crochet-bar hair job, Fable rounds 5-8) ───────────────
import { buildCowProgram, cowFringe, COW_DEFAULTS, COW_HORN_ROUNDS } from './cowPreset'

test('the cow fringe (alternate loop rounds, outward-leaning rings) audits clean and stays off the head', () => {
  const h = cowFringe('#7a4a35', 'M')
  const built = buildHairPatch(h, YR)
  assert.deepEqual(hairPatchProblems(h, built, YR), [])
  const m = built.model
  let face = -Infinity
  m.nodes.forEach((p, i) => { if (!m.loose?.[i] && p.z > face) face = p.z })
  assert.ok(m.nodes.every((p, i) => !m.loose?.[i] || p.z <= face + 1e-6), 'no loop passes into the head')
  // Loops on rounds 1, 3, 5 only: the words say dc on rounds 2 and 4. Cow
  // round 9: a plain dc every third stitch and a twist on every fourth loop,
  // said once before the rounds, from the same rule the build reads.
  const lines = writeHairInstructions(h)
  assert.match(lines[1]!, /every third lp st.*every fourth loop half a twist/)
  assert.match(lines[2]!, /^Round 1: 6 lp st into a magic ring \(wrap the yarn round two fingers\)/)
  assert.match(lines[3]!, /^Round 2: 2 dc in each st\./)
  assert.match(lines[4]!, /^Round 3: \*1 lp st, 2 lp st in next st\* 6 times/)
  assert.match(lines[5]!, /^Round 4: \*2 dc, 2 dc in next st\* 6 times/)
  assert.match(lines[6]!, /^Round 5: .*lp st.*one finger only/)
  // The per-stitch rule: round 3 (index 2) has 18 stitches — loops in 12 of
  // them, every third plain, and the 4th, 8th and 12th loops twisted.
  const sts = Array.from({ length: 18 }, (_, c) => stitchAtOf(h, 2, c))
  assert.equal(sts.filter((x) => x === 'sc').length, 6)
  assert.equal(sts.filter((x) => x === 'loopcurl').length, 3)
  assert.equal(stitchAtOf(h, 1, 0), 'sc', 'round 2 is a plain round')
})

test('the cow program carries every signature piece and the stitched nostrils', () => {
  const p = buildCowProgram(COW_DEFAULTS)
  const names = p.parts.map((x) => x.name)
  for (const n of ['body', 'neck', 'head', 'muzzle', 'horn-l', 'horn-r', 'ear-l', 'ear-r', 'front-leg-l', 'front-leg-r', 'back-leg-l', 'back-leg-r', 'tail']) {
    assert.ok(names.includes(n), `missing ${n}`)
  }
  const horn = p.parts.find((x) => x.name === 'horn-l')!
  assert.deepEqual(horn.rounds, COW_HORN_ROUNDS)
  assert.equal(horn.colourHex, COW_DEFAULTS.contrastHex)
  assert.ok(horn.sewNote && /tips pointing up and out/.test(horn.sewNote))
  const muzzle = p.parts.find((x) => x.name === 'muzzle')!
  assert.equal((muzzle.place as { centred?: boolean }).centred, true, 'the capsule muzzle is sewn on by its side, lying across the face')
  const head = p.parts.find((x) => x.name === 'head')!
  assert.ok((head.place as { axis?: unknown }).axis, 'the head is worked side to side')
  const ear = p.parts.find((x) => x.name === 'ear-l')!
  assert.ok(ear.press && ear.press >= 14, 'the ear is a flat pressed leaf')
  assert.equal(p.fibreTune?.pile_dark_only, true)
  assert.equal(p.props?.filter((x) => /eye/.test(x.name)).length, 2)
  const nose = p.embroidery?.find((e) => e.name === 'nose')
  assert.ok(nose && nose.on === 'muzzle' && nose.stitches.length === 2, 'two nostril stitches on the muzzle')
  assert.ok(nose!.stitches.every((s) => s.taut))
  assert.equal(p.hair?.length, 1)
  assert.equal(p.yarnFibre, 'chenille')
  assert.equal(p.yarnWeight, 'worsted')
})
