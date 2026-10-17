/**
 * Crochet cross-craft tags, tested: what the brief, the shelf and the name each
 * give, that STYLE never comes from text, that item-type words do not read as
 * themes, and that every slug returned exists in the controlled vocabulary.
 *
 *   cd packages/db && npx tsx src/crochet-tagging.test.ts
 */

import assert from 'node:assert/strict'
import { COLLECTION_VOCABULARY } from '../prisma/collection-vocabulary'
import { LOOKS, TERRITORIES } from '../prisma/design-direction'
import { itemTypesForCraft } from '../prisma/item-type-vocabulary'
import { CROCHET_SHELF_TAGS, crochetNameTagSlugs, crochetTagSlugs } from './crochet-tagging'

const results: { name: string; passed: boolean; detail?: string }[] = []
function check(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: err instanceof Error ? err.message : String(err) })
  }
}

const VOCAB = new Map(COLLECTION_VOCABULARY.map((t) => [t.slug, t]))

check('a name gives occasions with their parent and season', () => {
  assert.deepEqual(crochetNameTagSlugs('Santa gnome'), ['santa', 'christmas', 'winter'])
  assert.deepEqual(crochetNameTagSlugs('Halloween pumpkin'), ['halloween', 'autumn'])
  assert.deepEqual(crochetNameTagSlugs('Cranberry bauble'), ['christmas-ornaments', 'christmas', 'winter'])
})

check('plural and singular both match', () => {
  assert.ok(crochetNameTagSlugs('Christmas stocking').includes('christmas-stockings'))
  assert.ok(crochetNameTagSlugs('Moon and stars mobile').includes('celestial'))
  assert.ok(crochetNameTagSlugs('Star garland').includes('celestial'))
})

check('words inside other words do not match', () => {
  assert.deepEqual(crochetNameTagSlugs('Sunflower bouquet'), [])
  assert.deepEqual(crochetNameTagSlugs('Seaside striped bag'), [])
  assert.deepEqual(crochetNameTagSlugs('Beehive pincushion').filter((s) => s === 'birds'), [])
})

check('STYLE is never read from a name', () => {
  for (const n of ['Soft pastel bunny', 'Bright bold blanket', 'Vintage granny square', 'Gothic bat', 'Boho wall hanging']) {
    for (const s of crochetNameTagSlugs(n)) assert.notEqual(VOCAB.get(s)?.axis, 'STYLE', `${n} -> ${s}`)
  }
})

check('item-type words do not read as themes', () => {
  assert.deepEqual(crochetNameTagSlugs('Strawberry tea cosy'), [])
  assert.deepEqual(crochetNameTagSlugs('Coffee cup cosy'), [])
  assert.deepEqual(crochetNameTagSlugs('Striped mug rug'), [])
  assert.deepEqual(crochetNameTagSlugs('Easter egg cosy'), ['easter', 'spring'])
})

check('generic craft words in a name tag nothing', () => {
  assert.deepEqual(crochetNameTagSlugs('Traditional granny square'), [])
  assert.deepEqual(crochetNameTagSlugs('Home sweet home cushion'), [])
  assert.deepEqual(crochetNameTagSlugs('Mustard teddy'), [])
})

check('the brief gives the Look\'s styles and the Territory\'s subjects', () => {
  const r = crochetTagSlugs({ name: 'Mustard teddy', shelfSlug: 'amigurumi', brief: { look: 'storybook-whimsical', territory: 'kawaii-animals-pets', treatment: 'amigurumi' } })
  assert.deepEqual(r.authored, ['whimsical', 'cute', 'animals'])
  assert.deepEqual(r.derived, [])
  assert.deepEqual(r.keyword, [])
})

check('a piece that depicts nothing takes the Look but not the Territory\'s subject', () => {
  // The live case: a plain sage coaster briefed under modern botanicals.
  const coaster = crochetTagSlugs({ name: 'Sage solid coaster', shelfSlug: 'coaster', brief: { look: 'soft-modern', territory: 'modern-botanicals', treatment: 'grid-plain' } })
  assert.deepEqual(coaster.all, ['modern', 'scandi'])
  const ball = crochetTagSlugs({ name: 'Cloud soft ball', shelfSlug: 'baby-toy-lovey', brief: { look: 'soft-modern', territory: 'kawaii-animals-pets', treatment: 'sphere' } })
  assert.ok(!ball.all.includes('animals'))
  assert.ok(ball.all.includes('baby'))
  const noTreatment = crochetTagSlugs({ name: 'Plain square', shelfSlug: 'coaster', brief: { look: 'soft-modern', territory: 'modern-botanicals' } })
  assert.ok(!noTreatment.all.includes('florals'))
})

check('a territory\'s occasions are kept only when the name names one', () => {
  const plain = crochetTagSlugs({ name: 'Red hanging ball', shelfSlug: 'ornament', brief: { look: 'heritage-vintage', territory: 'modern-seasonal' } })
  assert.ok(!plain.all.includes('halloween') && !plain.all.includes('easter') && !plain.all.includes('christmas'))
  const xmas = crochetTagSlugs({ name: 'Christmas pudding bauble', shelfSlug: 'ornament', brief: { look: 'heritage-vintage', territory: 'modern-seasonal' } })
  assert.ok(xmas.authored.includes('christmas'))
  assert.ok(!xmas.all.includes('halloween'))
})

check('the shelf derives only the tags its meaning carries', () => {
  assert.deepEqual(crochetTagSlugs({ name: 'Dog jumper', shelfSlug: 'pet-clothing' }).derived, ['pets'])
  assert.deepEqual(crochetTagSlugs({ name: 'Tulip stems', shelfSlug: 'flower-bouquet' }).derived, ['florals'])
  assert.deepEqual(crochetTagSlugs({ name: 'Plain hanging heart', shelfSlug: 'ornament' }).all, [])
  assert.deepEqual(crochetTagSlugs({ name: 'Plain square', shelfSlug: null }).all, [])
})

check('the three sources do not repeat a slug, and all is their union', () => {
  const r = crochetTagSlugs({ name: 'Giant nursery bunny', shelfSlug: 'animal-toy', brief: { look: 'soft-modern', territory: 'kawaii-animals-pets', treatment: 'amigurumi' } })
  const parts = [...r.authored, ...r.derived, ...r.keyword]
  assert.equal(new Set(parts).size, parts.length)
  assert.deepEqual([...r.all].sort(), [...parts].sort())
  assert.ok(r.all.includes('animals') && r.all.includes('new-baby'))
})

check('an unknown look or territory gives nothing rather than throwing', () => {
  assert.deepEqual(crochetTagSlugs({ name: 'Plain square', shelfSlug: 'coaster', brief: { look: 'no-such-look', territory: 'nowhere' } }).all, [])
})

check('every slug any source can return exists in the vocabulary', () => {
  for (const tags of Object.values(CROCHET_SHELF_TAGS)) for (const s of tags) assert.ok(VOCAB.has(s), `shelf tag ${s}`)
  for (const l of LOOKS) for (const s of l.styleTags) assert.ok(VOCAB.has(s), `look ${l.slug} -> ${s}`)
  for (const t of TERRITORIES) for (const s of [...t.subjectTags, ...(t.occasionTags ?? [])]) assert.ok(VOCAB.has(s), `territory ${t.slug} -> ${s}`)
})

check('every shelf named in the shelf map is a real crochet shelf', () => {
  const shelves = new Set(itemTypesForCraft('crochet').map((t) => t.slug))
  for (const s of Object.keys(CROCHET_SHELF_TAGS)) assert.ok(shelves.has(s), `${s} is not a crochet item type`)
})

const failed = results.filter((r) => !r.passed)
for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `\n      ${r.detail}` : ''}`)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length) process.exit(1)
