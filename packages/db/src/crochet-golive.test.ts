/**
 * The crochet go-live gates, tested: a catalogue that clears every coded gate,
 * and the same catalogue broken once per gate. Also the image pick the search
 * document and the check share.
 *
 *   cd packages/db && npx tsx src/crochet-golive.test.ts
 */

import assert from 'node:assert/strict'
import { crochetHeroMedia } from './crochet-media'
import {
  CROCHET_PLACEHOLDER_DESCRIPTION,
  copyFaults,
  evaluateCrochetGoLive,
  type GoLiveInput,
  type GoLiveRow,
} from './crochet-golive'

const results: { name: string; passed: boolean; detail?: string }[] = []
function check(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
  } catch (err) {
    results.push({ name, passed: false, detail: err instanceof Error ? err.message : String(err) })
  }
}

function coasterRows() {
  const rows = [{ section: 'Body', rowNumber: 1, rowLabel: 'Foundation', instruction: 'Foundation: ch 19. (18 sts)', stitchCount: 18 }]
  for (let i = 1; i <= 20; i++) {
    rows.push({ section: 'Body', rowNumber: i + 1, rowLabel: `Row ${i}`, instruction: `Row ${i}: ch 1, turn, dc in next 18 sts. (18 sts)`, stitchCount: 18 })
  }
  rows.push({ section: 'Body', rowNumber: 22, rowLabel: 'Fasten off and weave in the end.', instruction: 'Fasten off and weave in the end.', stitchCount: 0 })
  return rows
}

function row(slug: string, name: string, over: Partial<GoLiveRow> = {}): GoLiveRow {
  return {
    id: `id_${slug}`,
    slug,
    name,
    description: `A plain one-colour coaster worked flat in rows of double crochet. Worked in one shade, sage. It comes out about 10.0 by 10.0 cm.`,
    designerId: 'designer_house',
    difficulty: 'BEGINNER',
    estimatedHours: 1,
    terminologyConvention: 'uk',
    primaryYarnWeightId: 'yarn_aran',
    primaryHookId: 'hook_5mm',
    gaugeText: '18 sts x 20 rows = 10 cm (UK terms) in worsted',
    finishedSizeText: 'About 10.0 by 10.0 cm.',
    rowsStructured: coasterRows(),
    chartData: { title: name, layout: 'flat', craft: 'crochet', rows: [] },
    notions: ['Tapestry needle for weaving in the ends', 'Stitch markers'],
    abbreviationsUsed: ['ch', 'dc'],
    craftStitchSlugs: ['crochet-chain', 'crochet-double-uk'],
    pieceCount: 1,
    subCategorySlug: 'coaster',
    hasImage: true,
    tagCount: 2,
    styleTagCount: 1,
    ...over,
  }
}

function good(): GoLiveInput {
  return {
    rows: [row('sage-coaster', 'Sage solid coaster'), row('oat-coaster', 'Oat solid coaster')],
    category: { description: 'Toys, blankets, hats, bags, dishcloths, coasters and motifs.' },
    shelves: [
      { slug: 'coaster', name: 'Coasters & Placemats', description: 'Coasters, mug rugs and placemats.' },
      { slug: 'dishcloth', name: 'Dishcloths & Washcloths', description: 'Dishcloths, washcloths and face flannels.' },
    ],
    searchIndexCount: 2,
    searchDocsWithImage: 2,
    patternPageRoute: true,
    visionSweepSignedOff: true,
    premiumChecked: true,
  }
}

const status = (input: GoLiveInput, id: string) => evaluateCrochetGoLive(input).gates.find((g) => g.id === id)?.status

check('a catalogue that clears every gate is ready, and the switch is still left to Rebecca', () => {
  const r = evaluateCrochetGoLive(good())
  const notPass = r.gates.filter((g) => g.status !== 'pass' && g.id !== 'switch')
  assert.deepEqual(notPass.map((g) => `${g.id}:${g.summary}`), [])
  assert.equal(r.ready, true)
  assert.equal(r.gates.find((g) => g.id === 'switch')?.status, 'manual')
})

check('an empty catalogue fails the seed gate', () => {
  assert.equal(status({ ...good(), rows: [], searchIndexCount: 0, searchDocsWithImage: 0 }, 'seed'), 'fail')
})

check('an incomplete pattern fails completeness and names the slug', () => {
  const input = good()
  input.rows[0] = row('sage-coaster', 'Sage solid coaster', { gaugeText: null })
  const g = evaluateCrochetGoLive(input).gates.find((x) => x.id === 'completeness')!
  assert.equal(g.status, 'fail')
  assert.ok(g.items[0]!.startsWith('sage-coaster:'))
})

check('a pattern on no shelf or a legacy shelf fails the shelf gate', () => {
  const input = good()
  input.rows[0] = row('sage-coaster', 'Sage solid coaster', { subCategorySlug: null })
  input.rows[1] = row('oat-coaster', 'Oat solid coaster', { subCategorySlug: 'homewares' })
  const g = evaluateCrochetGoLive(input).gates.find((x) => x.id === 'shelves')!
  assert.equal(g.status, 'fail')
  assert.equal(g.items.length, 2)
})

check('a pattern with no image fails the image gate', () => {
  const input = good()
  input.rows[1] = row('oat-coaster', 'Oat solid coaster', { hasImage: false })
  assert.equal(status(input, 'images'), 'fail')
})

check('two patterns with one name fail the name gate, whatever the case', () => {
  const input = good()
  input.rows[1] = row('oat-coaster', 'SAGE SOLID COASTER')
  assert.equal(status(input, 'names'), 'fail')
})

check('an untagged pattern fails the tag gate', () => {
  const input = good()
  input.rows[0] = row('sage-coaster', 'Sage solid coaster', { tagCount: 0, styleTagCount: 0 })
  assert.equal(status(input, 'tags'), 'fail')
})

check('tagged patterns with no style tag are listed for a look, not passed', () => {
  const input = good()
  input.rows[0] = row('sage-coaster', 'Sage solid coaster', { styleTagCount: 0 })
  const r = evaluateCrochetGoLive(input)
  assert.equal(r.gates.find((g) => g.id === 'style-tags')?.status, 'manual')
  assert.equal(r.ready, false)
})

check('the seeded placeholder category description fails', () => {
  assert.equal(status({ ...good(), category: { description: CROCHET_PLACEHOLDER_DESCRIPTION } }, 'category-copy'), 'fail')
  assert.equal(status({ ...good(), category: { description: null } }, 'category-copy'), 'fail')
})

check('a shelf description with a long dash fails, and names the shelf', () => {
  const input = good()
  input.shelves[1] = { slug: 'blanket', name: 'Blankets & Afghans', description: 'Blankets, afghans and throws — full size and baby.' }
  const g = evaluateCrochetGoLive(input).gates.find((x) => x.id === 'shelf-copy')!
  assert.equal(g.status, 'fail')
  assert.ok(g.items[0]!.startsWith('blanket:'))
})

check('a shelf outside the item-type list is raised for a decision', () => {
  const input = good()
  input.shelves.push({ slug: 'homewares', name: 'Homewares', description: 'Dishcloths, pot holders and cushions.' })
  const g = evaluateCrochetGoLive(input).gates.find((x) => x.id === 'legacy-shelves')!
  assert.equal(g.status, 'manual')
  assert.deepEqual(g.items, ['homewares'])
})

check('search out of step fails; unreachable search is manual', () => {
  assert.equal(status({ ...good(), searchIndexCount: 1 }, 'search'), 'fail')
  assert.equal(status({ ...good(), searchDocsWithImage: 0 }, 'search'), 'fail')
  assert.equal(status({ ...good(), searchIndexCount: null }, 'search'), 'manual')
})

check('no public pattern page fails the sitemap gate', () => {
  assert.equal(status({ ...good(), patternPageRoute: false }, 'sitemap'), 'fail')
})

check('without the sweep and the premium check the catalogue is not ready', () => {
  const r = evaluateCrochetGoLive({ ...good(), visionSweepSignedOff: false, premiumChecked: false })
  assert.equal(r.ready, false)
  assert.equal(r.gates.find((g) => g.id === 'vision')?.status, 'manual')
  assert.equal(r.gates.find((g) => g.id === 'premium')?.status, 'manual')
})

check('copyFaults passes clean copy and catches a missing one', () => {
  assert.deepEqual(copyFaults('Coasters, mug rugs and placemats.'), [])
  assert.deepEqual(copyFaults('  '), ['missing'])
})

check('the image pick is loom hero, then hero, then thumbnail, skipping empty ones', () => {
  const a = { cloudflareId: null, r2Key: 'a.png' }
  const b = { cloudflareId: 'b', r2Key: null }
  const c = { cloudflareId: null, r2Key: 'c.png' }
  assert.equal(crochetHeroMedia({ loomHero: a, hero: b, thumbnail: c }), a)
  assert.equal(crochetHeroMedia({ loomHero: null, hero: b, thumbnail: c }), b)
  assert.equal(crochetHeroMedia({ loomHero: { cloudflareId: null, r2Key: null }, hero: null, thumbnail: c }), c)
  assert.equal(crochetHeroMedia({}), null)
})

const failed = results.filter((r) => !r.passed)
for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `\n      ${r.detail}` : ''}`)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length) process.exit(1)
