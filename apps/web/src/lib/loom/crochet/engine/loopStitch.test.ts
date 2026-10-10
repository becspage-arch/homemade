import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildRelaxedSwatch } from './buildSwatch'
import { auditProblems } from './auditChecks'
import { SWATCH_RECIPES } from './dictionary'
import { buildHairPatch, hairPatchProblems, hairPatchesFor, writeHairInstructions } from './hairPatch'

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
  assert.match(words, /Round 1: 6 dc into a magic ring\. \(6\)/)
  assert.match(words, /Round 3: \*1 lp st, 2 lp st in next st\* 6 times\. \(18\)/)
  assert.equal(hairPatchesFor('none', 'head', '#000', { x: 0, y: 0, z: 1 }).length, 0)
  assert.equal(hairPatchesFor(undefined, 'head', '#000', { x: 0, y: 0, z: 1 }).length, 0)
})
