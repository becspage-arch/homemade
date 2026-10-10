import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getMotif, listMotifs } from './index'
import type { MotifId } from './types'

const ALL: MotifId[] = ['star', 'heart', 'leaf', 'butterfly', 'daisy', 'rolled-rose', 'layered-rose', 'berry', 'leaf-vine']

test('every round 8 and 9 motif is registered', () => {
  assert.deepEqual(listMotifs().map((d) => d.id).sort(), [...ALL].sort())
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
