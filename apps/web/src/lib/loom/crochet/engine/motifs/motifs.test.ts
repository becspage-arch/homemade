import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getMotif, listMotifs } from './index'
import type { MotifId } from './types'
import { shellStrip } from './rolled-rose'
import { YARN_WEIGHT_RADIUS_MM } from '../program'

const ALL: MotifId[] = ['star', 'heart', 'leaf', 'butterfly', 'daisy', 'rolled-rose', 'layered-rose', 'berry', 'leaf-vine', 'garland']

test('every round 8 and 9 motif is registered', () => {
  assert.deepEqual(listMotifs().map((d) => d.id).sort(), [...ALL].sort())
})

test('star: the spiral trees\' topper size is audit clean and about 42 mm at lace', () => {
  const b = getMotif('star').build({ size: 'topper', yarnWeight: 'lace' })
  assert.deepEqual(b.problems, [])
  assert.equal(b.pieces.length, 1)
  assert.ok(b.sizeMm.width > 34 && b.sizeMm.width < 50, `topper width ${b.sizeMm.width.toFixed(1)} mm`)
  assert.ok(b.words.some((w) => /ch 4, sl st in 2nd ch from hook, dc in next ch, htr in next ch/.test(w)))
})

test('star: puffed = two identical stars, front and back, with sewing words', () => {
  const b = getMotif('star').build({ size: 'topper', puffed: true })
  assert.deepEqual(b.problems, [])
  assert.deepEqual(b.pieces.map((p) => p.name), ['front', 'back'])
  assert.equal(b.pieces[0]!.built.model.nodes.length, b.pieces[1]!.built.model.nodes.length)
  assert.ok(b.words.some((w) => /second star/.test(w)) && b.words.some((w) => /wrong sides together/.test(w)))
})

test('puff rose: five domed petals round a centre; bud = four closed lobes, no centre', () => {
  const b = getMotif('layered-rose').build()
  assert.deepEqual(b.problems, [])
  assert.deepEqual(b.pieces.map((p) => p.name), ['backing', 'petal 1', 'petal 2', 'petal 3', 'petal 4', 'petal 5', 'centre'])
  assert.ok(b.words.some((w) => /Petals \(make 5\)/.test(w)))
  const bud = getMotif('layered-rose').build({ bud: true })
  assert.deepEqual(bud.problems, [])
  assert.deepEqual(bud.pieces.map((p) => p.name), ['backing', 'petal 1', 'petal 2', 'petal 3', 'petal 4'])
  assert.ok(bud.sizeMm.width < b.sizeMm.width)
})

for (const id of ALL) {
  test(`${id}: genuinely stitched (audit clean), with words and a size`, () => {
    const b = getMotif(id).build()
    assert.deepEqual(b.problems, [])
    assert.ok(b.pieces.length >= 1)
    for (const p of b.pieces) {
      assert.ok(p.built.links.length > 0, `${p.name} records its interlocks`)
      assert.equal(new Set(p.built.model.strand ?? [0]).size, 1, `${p.name} is one strand`)
    }
    assert.ok(b.words.length >= 3)
    // UK terms only: no US "sc"/"hdc" in the words.
    for (const w of b.words) assert.ok(!/\b(sc|hdc)\b/.test(w), `US term in: ${w}`)
    assert.ok(b.sizeMm.width > 10 && b.sizeMm.height > 10)
    assert.equal(b.yarnWeight, 'fine')
    assert.equal(b.yarnFibre, 'fine-cotton')
  })
}

// THE CHAIN-SPACE HOOK (r15, kit.ts chainSpace / MotifStrand.intoSpace): a
// stitch worked "in the ch-sp" goes under the whole chain, not into one
// chain's loop. n tall sts fanned into ONE chain failed the audit with 1 to 43
// interlocks (r13); worked into the space they hold.
const YR = YARN_WEIGHT_RADIUS_MM.fine

test('chain space: a shell (sl st, 5 tr in a ch-3 sp, sl st) audits clean, each st under the whole chain', () => {
  const p = shellStrip(YR, '#9c6c78', ['dc'], 'shell', { meshCh: 3, skip: 2, flat: true })
  assert.deepEqual(p.problems, [])
  assert.equal(p.shellCrowns.length, 1)
  assert.equal(p.shellCrowns[0]!.length, 5)
  // every shell stitch records a hook link against BOTH legs of the chain (the
  // far, hole-side leg and the near one), each free to sit anywhere along the space
  const spaceLinks = p.built.links.filter((l) => l.role === 'hook' && l.belowAny)
  assert.equal(spaceLinks.length, 10)
  assert.equal(new Set(spaceLinks.map((l) => l.hook)).size, 5)
})

test('chain space: a strip of five shells (tr, UK) on a ch-4 mesh relaxes with no interlock failing', () => {
  const p = shellStrip(YR, '#9c6c78', ['dc', 'dc', 'dc', 'dc', 'dc'], 'strip', { flat: true })
  assert.deepEqual(p.problems, [])
  assert.equal(p.shellCrowns.length, 5)
  assert.ok(p.shellCrowns.every((s) => s.length === 5))
})

test('rolled rose: petals "shell" is opt-in (shells in ch-4 spaces); the default stays the scallop strip', () => {
  const s = getMotif('rolled-rose').build({ petals: 'shell' })
  assert.deepEqual(s.problems, [])
  assert.ok(s.words.some((w) => /5 tr in next ch-4 sp/.test(w)), s.words.join('\n'))
  const d = getMotif('rolled-rose').build()
  assert.ok(d.words.some((w) => /^Row 1 \(petals\)/.test(w)))
  assert.ok(!d.words.some((w) => /ch-4 sp/.test(w)))
})
