/**
 * Floss ownership tests — the maths behind "You already own 22 of the 28
 * colours", the ticks in the floss list, and the library card badge.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx src/lib/floss/stash-ownership.test.ts
 *
 * The cases that matter are the ones a stitcher would notice being wrong:
 * an exact code match, a stash kept in Anchor against a chart written in DMC,
 * a near colour that is NOT the same skein, and the half-skein rounding on
 * what is left to buy.
 */

import assert from 'node:assert/strict'
import {
  buildStashIndex,
  computeFlossOwnership,
  matchStashColour,
  normaliseBrand,
  ownedCountsForPatterns,
  roundSkeinsToBuy,
  type PaletteColour,
  type StashFlossItem,
} from './stash-ownership'

let failures = 0
function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  ok   ${name}`)
  } catch (err) {
    failures++
    console.log(`  FAIL ${name}`)
    console.log(`       ${(err as Error).message}`)
  }
}

function colour(
  brand: string,
  code: string,
  skeinsNeeded = 1,
  symbol = code,
): PaletteColour {
  return { symbol, brand, code, name: `${brand} ${code}`, rgb: '#000000', skeinsNeeded }
}

function stashItem(brand: string, code: string, quantityOwned = 1): StashFlossItem {
  return { brand, code, quantityOwned }
}

console.log('\nnormalise + index')

test('brand names normalise case and whitespace', () => {
  assert.equal(normaliseBrand(' dmc '), 'DMC')
  assert.equal(normaliseBrand('Anchor'), 'ANCHOR')
  assert.equal(normaliseBrand('Sullivans'), null)
  assert.equal(normaliseBrand(null), null)
})

test('two stash rows of the same colour add up', () => {
  const index = buildStashIndex([stashItem('DMC', '310', 1.5), stashItem('dmc', ' 310 ', 2)])
  assert.equal(index.size, 1)
  assert.equal(index.get('DMC:310'), 3.5)
})

test('a stash row with neither brand nor code is skipped', () => {
  const index = buildStashIndex([{ brand: null, code: null, quantityOwned: 4 }])
  assert.equal(index.size, 0)
})

console.log('\nexact code match')

test('same brand and code is owned', () => {
  const owned = computeFlossOwnership([colour('DMC', '310')], [stashItem('DMC', '310')])
  assert.equal(owned.ownedColours, 1)
  assert.equal(owned.totalColours, 1)
  assert.equal(owned.lines[0]!.converted, false)
  assert.equal(owned.toBuy.length, 0)
})

test('a different code in the same brand is not owned', () => {
  const owned = computeFlossOwnership([colour('DMC', '310')], [stashItem('DMC', '321')])
  assert.equal(owned.ownedColours, 0)
  assert.equal(owned.toBuy.length, 1)
  assert.equal(owned.toBuy[0]!.code, '310')
})

test('an empty stash owns nothing', () => {
  const owned = computeFlossOwnership([colour('DMC', '310'), colour('DMC', '321')], [])
  assert.equal(owned.ownedColours, 0)
  assert.equal(owned.toBuy.length, 2)
})

console.log('\nbrand conversion')

test('an Anchor stash covers a DMC chart through the published table', () => {
  // DMC 310 (black) is Anchor 403 on both companies' conversion cards.
  const owned = computeFlossOwnership([colour('DMC', '310')], [stashItem('ANCHOR', '403')])
  assert.equal(owned.ownedColours, 1)
  const line = owned.lines[0]!
  assert.equal(line.converted, true)
  assert.equal(line.matchedBrand, 'ANCHOR')
  assert.equal(line.matchedCode, '403')
  assert.deepEqual(owned.convertedFromBrands, ['ANCHOR'])
})

test('a Madeira stash covers a DMC chart too', () => {
  const owned = computeFlossOwnership([colour('DMC', '310')], [stashItem('MADEIRA', '2400')])
  assert.equal(owned.ownedColours, 1)
  assert.equal(owned.lines[0]!.matchedBrand, 'MADEIRA')
  assert.deepEqual(owned.convertedFromBrands, ['MADEIRA'])
})

test('Anchor to Madeira resolves through the DMC pivot', () => {
  const owned = computeFlossOwnership([colour('ANCHOR', '403')], [stashItem('MADEIRA', '2400')])
  assert.equal(owned.ownedColours, 1)
  assert.equal(owned.lines[0]!.matchedBrand, 'MADEIRA')
})

test('the exact brand wins over a conversion', () => {
  const owned = computeFlossOwnership(
    [colour('DMC', '310')],
    [stashItem('ANCHOR', '403', 5), stashItem('DMC', '310', 2)],
  )
  const line = owned.lines[0]!
  assert.equal(line.converted, false)
  assert.equal(line.quantityOwned, 2)
})

test('a near colour is not the same skein', () => {
  // Anchor 47 is DMC 321, not DMC 310. Perceptual nearest-match must never
  // tick a row: it is a substitute, not floss the maker owns.
  const owned = computeFlossOwnership([colour('DMC', '310')], [stashItem('ANCHOR', '47')])
  assert.equal(owned.ownedColours, 0)
  assert.deepEqual(owned.convertedFromBrands, [])
})

test('a code outside the cross-reference tables stays unowned', () => {
  const owned = computeFlossOwnership([colour('DMC', 'ZZ-999')], [stashItem('ANCHOR', '403')])
  assert.equal(owned.ownedColours, 0)
})

test('an unknown stash brand only ever matches exactly', () => {
  const exact = computeFlossOwnership(
    [colour('SULLIVANS', '45001')],
    [stashItem('SULLIVANS', '45001')],
  )
  assert.equal(exact.ownedColours, 1)
  const crossed = computeFlossOwnership([colour('SULLIVANS', '310')], [stashItem('ANCHOR', '403')])
  assert.equal(crossed.ownedColours, 0)
})

test('a match returns nothing when the stash is empty', () => {
  const match = matchStashColour('DMC', '310', buildStashIndex([]))
  assert.equal(match.quantityOwned, 0)
  assert.equal(match.matchedBrand, null)
})

console.log('\nskein rounding')

test('a shortfall rounds up to the next half skein', () => {
  assert.equal(roundSkeinsToBuy(0), 0)
  assert.equal(roundSkeinsToBuy(-2), 0)
  assert.equal(roundSkeinsToBuy(0.1), 0.5)
  assert.equal(roundSkeinsToBuy(0.5), 0.5)
  assert.equal(roundSkeinsToBuy(1.2), 1.5)
  assert.equal(roundSkeinsToBuy(3), 3)
})

test('owning some of a colour leaves the shortfall to buy', () => {
  const owned = computeFlossOwnership([colour('DMC', '310', 3.5)], [stashItem('DMC', '310', 1)])
  const line = owned.lines[0]!
  assert.equal(line.owned, true)
  assert.equal(line.skeinsToBuy, 2.5)
  // A part-owned colour still counts as one of the colours you have.
  assert.equal(owned.ownedColours, 1)
  assert.equal(owned.toBuy.length, 1)
})

test('owning more than the chart needs leaves nothing to buy', () => {
  const owned = computeFlossOwnership([colour('DMC', '310', 2)], [stashItem('DMC', '310', 6)])
  assert.equal(owned.lines[0]!.skeinsToBuy, 0)
  assert.equal(owned.toBuy.length, 0)
  assert.equal(owned.skeinsToBuy, 0)
})

test('the total to buy sums the rounded lines', () => {
  const owned = computeFlossOwnership(
    [colour('DMC', '310', 1.2), colour('DMC', '321', 2.6), colour('DMC', '666', 1)],
    [stashItem('DMC', '666')],
  )
  // 1.5 + 3 + 0
  assert.equal(owned.skeinsToBuy, 4.5)
  assert.equal(owned.ownedColours, 1)
})

test('the headline counts colours, not skeins', () => {
  const palette = Array.from({ length: 28 }, (_, i) => colour('DMC', `code-${i}`, 2))
  const stash = palette.slice(0, 22).map((c) => stashItem('DMC', c.code, 4))
  const owned = computeFlossOwnership(palette, stash)
  assert.equal(owned.totalColours, 28)
  assert.equal(owned.ownedColours, 22)
  assert.equal(owned.toBuy.length, 6)
})

console.log('\ngrid query mapping')

test('each pattern gets its own owned count', () => {
  const rows = [
    {
      id: 'a',
      palette: [
        { symbol: 'x', brand: 'DMC', code: '310' },
        { symbol: 'y', brand: 'DMC', code: '321' },
        { symbol: 'z', brand: 'DMC', code: '666' },
      ],
    },
    { id: 'b', palette: [{ symbol: 'x', brand: 'DMC', code: '666' }] },
  ]
  const counts = ownedCountsForPatterns(rows, [stashItem('DMC', '310'), stashItem('ANCHOR', '47')])
  // Anchor 47 is DMC 321, so pattern a owns two of its three.
  assert.deepEqual(counts.get('a'), { owned: 2, total: 3 })
  assert.deepEqual(counts.get('b'), { owned: 0, total: 1 })
})

test('an empty stash returns no counts at all', () => {
  const counts = ownedCountsForPatterns(
    [{ id: 'a', palette: [{ brand: 'DMC', code: '310' }] }],
    [],
  )
  assert.equal(counts.size, 0)
})

test('a repeated colour in one palette counts once', () => {
  const counts = ownedCountsForPatterns(
    [
      {
        id: 'a',
        palette: [
          { brand: 'DMC', code: '310' },
          { brand: 'dmc', code: ' 310 ' },
          { brand: 'DMC', code: '321' },
        ],
      },
    ],
    [stashItem('DMC', '310')],
  )
  assert.deepEqual(counts.get('a'), { owned: 1, total: 2 })
})

test('an unparseable palette is left out rather than shown as zero', () => {
  const counts = ownedCountsForPatterns(
    [
      { id: 'a', palette: null },
      { id: 'b', palette: 'not an array' },
      { id: 'c', palette: [{ nonsense: true }] },
      { id: 'd', palette: [{ brand: 'DMC', code: '310' }] },
    ],
    [stashItem('DMC', '310')],
  )
  assert.equal(counts.has('a'), false)
  assert.equal(counts.has('b'), false)
  assert.equal(counts.has('c'), false)
  assert.deepEqual(counts.get('d'), { owned: 1, total: 1 })
})

console.log('')
if (failures > 0) {
  console.error(`${failures} test(s) failed`)
  process.exit(1)
}
console.log('all floss ownership tests passed')
