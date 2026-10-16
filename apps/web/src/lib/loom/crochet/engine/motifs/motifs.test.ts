import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getMotif, listMotifs } from './index'
import type { MotifId } from './types'

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
