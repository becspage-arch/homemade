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
  // bulky chenille; six since round 31): the words say dc on rounds 2, 4 and 6.
  // Cow round 29: a plain dc every other stitch and every fourth loop a half
  // twist, said once before the rounds, from the same rule the build reads.
  const lines = writeHairInstructions(h)
  assert.match(lines[1]!, /every second lp st \(so every other stitch carries a loop\).*every fourth loop half a twist/)
  // Cow round 17/23: the crown loops are the tallest of the mound, worked
  // over one more finger than the rest; the words follow the loop length.
  assert.match(lines[2]!, /^Round 1: 6 lp st into a magic ring \(wrap the yarn round two fingers/)
  assert.match(lines[3]!, /^Round 2: 2 dc in each st\./)
  assert.match(lines[4]!, /^Round 3: \*1 lp st, 2 lp st in next st\* 6 times/)
  assert.match(lines[5]!, /^Round 4: \*2 dc, 2 dc in next st\* 6 times/)
  assert.match(lines[6]!, /^Round 5: \*3 lp st, 2 lp st in next st\* 6 times\. \(30\)$/)
  assert.match(lines[7]!, /^Round 6: \*4 dc, 2 dc in next st\* 6 times\. \(36\)$/)
  assert.match(lines[8]!, /^Fasten off/)
  // The per-stitch rule (cow round 29): round 3 (index 2) has 18 stitches —
  // every other plain (9), loops in the other 9, every fourth loop twisted (2).
  const sts = Array.from({ length: 18 }, (_, c) => stitchAtOf(h, 2, c))
  assert.equal(sts.filter((x) => x === 'sc').length, 9)
  assert.equal(sts.filter((x) => x === 'loopcurl').length, 2)
  assert.equal(stitchAtOf(h, 1, 0), 'sc', 'round 2 is a plain round')
})

// ── Rings that FACE a direction (cow-fable-1024e: HairPatch.faceDir) ─────────
/** The angle (deg) between each loose loop's plane normal (its area vector,
 *  after relax, in the patch's own frame) and a direction in that frame. */
function loopPlaneAngles(built: ReturnType<typeof buildHairPatch>, dirPatch: { x: number; y: number; z: number }): number[] {
  const m = built.model
  const loops: number[][] = []
  let cur: number[] = []
  for (const ni of built.strandPath) { if (m.loose?.[ni]) cur.push(ni); else if (cur.length) { loops.push(cur); cur = [] } }
  if (cur.length) loops.push(cur)
  const fl = Math.hypot(dirPatch.x, dirPatch.y, dirPatch.z)
  return loops.map((L) => {
    const pts = L.map((i) => m.nodes[i]!)
    const c = pts.reduce((a, p) => ({ x: a.x + p.x / pts.length, y: a.y + p.y / pts.length, z: a.z + p.z / pts.length }), { x: 0, y: 0, z: 0 })
    let n = { x: 0, y: 0, z: 0 }
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]!, b = pts[(i + 1) % pts.length]!
      const ra = { x: a.x - c.x, y: a.y - c.y, z: a.z - c.z }, rb = { x: b.x - c.x, y: b.y - c.y, z: b.z - c.z }
      n = { x: n.x + ra.y * rb.z - ra.z * rb.y, y: n.y + ra.z * rb.x - ra.x * rb.z, z: n.z + ra.x * rb.y - ra.y * rb.x }
    }
    const nl = Math.hypot(n.x, n.y, n.z) || 1
    return (Math.acos(Math.min(1, Math.abs((n.x * dirPatch.x + n.y * dirPatch.y + n.z * dirPatch.z) / (nl * fl)))) * 180) / Math.PI
  })
}

test('a fringe with faceDir turns every ring to face it (and without it, the rings lean as before)', () => {
  // The fine-gauge cow fringe faces the lens; the patch is sewn straight up
  // (dir +z) so the patch frame is the world's: e1 = +x, e2 = -y, w = -z.
  const g = 1.3
  const base = { ...cowFringe('#5c382c', 'M', g), dir: { x: 0, y: 0, z: 1 } }
  assert.ok(base.faceDir, 'the fine-gauge cow fringe faces a direction')
  const faced = { ...base, faceDir: { x: 0, y: 1, z: 0.3 }, faceJitterDeg: 15 }
  const plain = { ...base, faceDir: undefined }
  const yr = 3 / g
  const toPatch = (d: { x: number; y: number; z: number }) => ({ x: d.x, y: -d.y, z: -d.z })
  const bf = buildHairPatch(faced, yr)
  assert.deepEqual(hairPatchProblems(faced, bf, yr), [])
  const af = loopPlaneAngles(bf, toPatch(faced.faceDir))
  const ap = loopPlaneAngles(buildHairPatch(plain, yr), toPatch(faced.faceDir))
  assert.equal(af.length, 22)
  const within = (a: number[]) => a.filter((x) => x < 35).length
  assert.ok(within(af) >= 18, `${within(af)} of ${af.length} faced rings within 35 deg`)
  assert.ok(within(ap) <= 10, `${within(ap)} of ${ap.length} leaned rings within 35 deg`)
  // The gauge-1 fringe never faces: its hash is the table's.
  assert.equal(cowFringe('#5c382c', 'M').faceDir, undefined)
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
