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
  // Loops on rounds 1, 3 and 5 only (five rounds at M since cow round 23,
  // bulky chenille): the words say dc on rounds 2 and 4. Cow round 27: a plain
  // dc every third stitch (loops in two of three) and every second loop a
  // full twist, said once before the rounds, from the same rule the build reads.
  const lines = writeHairInstructions(h)
  assert.match(lines[1]!, /every third lp st \(so two of every three stitches carry a loop\).*every second loop one full twist/)
  // Cow round 17/23: the crown loops are the tallest of the mound, worked
  // over one more finger than the rest; the words follow the loop length.
  assert.match(lines[2]!, /^Round 1: 6 lp st into a magic ring \(wrap the yarn round two fingers/)
  assert.match(lines[3]!, /^Round 2: 2 dc in each st\./)
  assert.match(lines[4]!, /^Round 3: \*1 lp st, 2 lp st in next st\* 6 times/)
  assert.match(lines[5]!, /^Round 4: \*2 dc, 2 dc in next st\* 6 times/)
  assert.match(lines[6]!, /^Round 5: \*3 lp st, 2 lp st in next st\* 6 times\. \(30\)$/)
  assert.match(lines[7]!, /^Fasten off/)
  // The per-stitch rule (cow round 27): round 3 (index 2) has 18 stitches —
  // every third plain (6), loops in the other 12, every second loop twisted (6).
  const sts = Array.from({ length: 18 }, (_, c) => stitchAtOf(h, 2, c))
  assert.equal(sts.filter((x) => x === 'sc').length, 6)
  assert.equal(sts.filter((x) => x === 'loopcurl').length, 6)
  assert.equal(stitchAtOf(h, 1, 0), 'sc', 'round 2 is a plain round')
})

test('the cow program carries every signature piece and the stitched nostrils', () => {
  const p = buildCowProgram(COW_DEFAULTS)
  const names = p.parts.map((x) => x.name)
  for (const n of ['body', 'head', 'muzzle', 'horn-l', 'horn-r', 'ear-l', 'ear-r', 'front-leg-l', 'front-leg-r', 'back-leg-l', 'back-leg-r', 'tail']) {
    assert.ok(names.includes(n), `missing ${n}`)
  }
  const horn = p.parts.find((x) => x.name === 'horn-l')!
  // Tip first: the four-stitch ring is the point, one more a round, closed flat (M is the first six rounds at bulky).
  assert.deepEqual(horn.rounds, [...COW_HORN_ROUNDS.slice(0, horn.rounds.length - 1), 6])
  assert.equal(horn.colourHex, COW_DEFAULTS.contrastHex)
  assert.ok(horn.sewNote && /tips pointing up and out/.test(horn.sewNote))
  // Cow round 27: the ear is an OPEN half-ball (a tube from the ring) pressed into a cup, sewn by the ring.
  const ear = p.parts.find((x) => x.name === 'ear-l')!
  assert.equal(ear.tube?.anchor, 'ring')
  assert.ok(ear.press && ear.press > 0, 'the open ear is pressed into a cup')
  assert.equal((ear.place as { poleIn?: boolean }).poleIn, true)
  const muzzle = p.parts.find((x) => x.name === 'muzzle')!
  assert.equal((muzzle.place as { centred?: boolean }).centred, true, 'the capsule muzzle is sewn on by its side, lying across the face')
  const head = p.parts.find((x) => x.name === 'head')!
  assert.ok((head.place as { axis?: unknown }).axis, 'the head is worked side to side')
  assert.equal(p.fibreTune?.pile_dark_only, true)
  assert.equal(p.props?.filter((x) => /eye/.test(x.name)).length, 2)
  const nose = p.embroidery?.find((e) => e.name === 'nose')
  assert.ok(nose && nose.on === 'muzzle' && nose.stitches.length === 2, 'two nostril stitches on the muzzle')
  assert.ok(nose!.stitches.every((s) => s.taut))
  assert.equal(p.hair?.length, 1)
  assert.equal(p.yarnFibre, 'chenille')
  assert.equal(p.yarnWeight, 'bulky') // cow round 23: blanket-weight chenille, the bar's fat stitch read
})
