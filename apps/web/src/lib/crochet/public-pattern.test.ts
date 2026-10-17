/**
 * The public crochet pattern page: the rules that must not drift.
 *
 * Runnable as a tsx script, like the repo's other `*.test.ts` files:
 *   cd apps/web && pnpm exec tsx src/lib/crochet/public-pattern.test.ts
 *
 * 1. Hidden category: the page 404s to the public (editors may preview), is
 *    never indexed, and the sitemap lists no crochet pattern.
 * 2. Only library rows (no owner) that are PUBLIC or UNLISTED are viewable.
 * 3. The free / gated split: signed out gets a preview and the sign-in gate;
 *    signed in gets every round; premium content needs premium.
 * 4. The preview never gives a short pattern away whole.
 * 5. Cards link the public page, and the page and grid stay TipTap-free.
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canAccessPremiumContent } from '../entitlements'
import {
  abbreviationLegend,
  canViewCrochetPatternPage,
  crochetCardHref,
  crochetPageAccess,
  crochetPatternPath,
  crochetSitemapRows,
  groupBySection,
  isLibraryViewable,
  normalisePublicRows,
  previewRowCount,
  shouldIndex,
  visibleSections,
  yarnMetres,
} from './public-pattern'

let failures = 0
function check(name: string, fn: () => void): void {
  try {
    fn()
    console.log(`  ok  ${name}`)
  } catch (err) {
    failures++
    console.error(`  FAIL ${name}`)
    console.error(err)
  }
}

const here = dirname(fileURLToPath(import.meta.url))
const webSrc = resolve(here, '../..')

const rows = (n: number, section = 'Body') =>
  Array.from({ length: n }, (_, i) => ({
    section,
    rowNumber: i + 1,
    rowLabel: `Round ${i + 1}`,
    instruction: `Round ${i + 1}: dc around. (${6 * (i + 1)} sts)`,
    stitchCount: 6 * (i + 1),
  }))

console.log('visibility')
check('hidden category: 404 to the public, editors may preview', () => {
  assert.equal(canViewCrochetPatternPage({ categoryVisible: false, viewerIsAdmin: false }), false)
  assert.equal(canViewCrochetPatternPage({ categoryVisible: false, viewerIsAdmin: true }), true)
  assert.equal(canViewCrochetPatternPage({ categoryVisible: true, viewerIsAdmin: false }), true)
})
check('indexed only when the category is visible and the row PUBLIC', () => {
  assert.equal(shouldIndex({ categoryVisible: false, visibility: 'PUBLIC' }), false)
  assert.equal(shouldIndex({ categoryVisible: true, visibility: 'UNLISTED' }), false)
  assert.equal(shouldIndex({ categoryVisible: true, visibility: 'PUBLIC' }), true)
})
check('library rows only; members own rows and PRIVATE rows never show', () => {
  assert.equal(isLibraryViewable({ ownerUserId: null, visibility: 'PUBLIC' }), true)
  assert.equal(isLibraryViewable({ ownerUserId: null, visibility: 'UNLISTED' }), true)
  assert.equal(isLibraryViewable({ ownerUserId: null, visibility: 'PRIVATE' }), false)
  assert.equal(isLibraryViewable({ ownerUserId: 'user_1', visibility: 'PUBLIC' }), false)
})

console.log('sitemap')
check('no crochet patterns while crochet is hidden', () => {
  const r = [{ slug: 'crochet-mustard-teddy', updatedAt: new Date(0) }]
  assert.deepEqual(crochetSitemapRows(new Set(['cross-stitch', 'needlework']), r), [])
})
check('every slugged row once crochet is visible', () => {
  const r = [
    { slug: 'crochet-mustard-teddy', updatedAt: new Date(0) },
    { slug: null, updatedAt: new Date(0) },
  ]
  const out = crochetSitemapRows(new Set(['crochet']), r)
  assert.equal(out.length, 1)
  assert.equal(out[0]!.path, '/crochet/patterns/crochet-mustard-teddy')
  assert.equal(out[0]!.updatedAt, r[0]!.updatedAt)
})
check('the sitemap uses the helper, so the visibility gate cannot be skipped', () => {
  const src = readFileSync(resolve(webSrc, 'app/sitemap.ts'), 'utf8')
  assert.match(src, /crochetSitemapRows\(publicCategorySlugs, crochetPatterns\)/)
})

console.log('free and gated')
const house = { premium: false, designer: { isHouseDesigner: true } }
const indie = { premium: false, designer: { isHouseDesigner: false } }
const flagged = { premium: true, designer: { isHouseDesigner: true } }
const free = { premiumActive: false, premiumUntil: null, role: 'MEMBER' }
check('signed out: sign-in gate, whatever the content', () => {
  assert.equal(crochetPageAccess({ signedIn: false, canAccessPremium: true }), 'sign-in')
  assert.equal(crochetPageAccess({ signedIn: false, canAccessPremium: false }), 'sign-in')
})
check('signed in, house pattern: every round', () => {
  assert.equal(
    crochetPageAccess({ signedIn: true, canAccessPremium: canAccessPremiumContent(free, house) }),
    'full',
  )
})
check('signed in, premium content without premium: premium gate', () => {
  for (const c of [indie, flagged]) {
    assert.equal(
      crochetPageAccess({ signedIn: true, canAccessPremium: canAccessPremiumContent(free, c) }),
      'premium',
    )
  }
})
check('full access shows every row; a preview holds the rest back', () => {
  const r = normalisePublicRows(rows(20))
  const full = visibleSections(r, 'full')
  assert.equal(full.heldBack, 0)
  assert.equal(full.sections[0]!.rows.length, 20)
  for (const a of ['sign-in', 'premium'] as const) {
    const p = visibleSections(r, a)
    assert.equal(p.sections[0]!.rows.length, 3)
    assert.equal(p.heldBack, 17)
  }
})
check('the preview never gives a short pattern away whole', () => {
  assert.equal(previewRowCount(0), 0)
  assert.equal(previewRowCount(2), 1) // a two-row edging
  assert.equal(previewRowCount(3), 1) // a three-round granny square
  assert.equal(previewRowCount(6), 3)
  assert.equal(previewRowCount(80), 3)
  const p = visibleSections(normalisePublicRows(rows(2)), 'sign-in')
  assert.equal(p.heldBack, 1)
})

console.log('rows')
check('normalise drops rows with no instruction or number and defaults the section', () => {
  const out = normalisePublicRows([
    { rowNumber: 1, instruction: 'Ch 4.' },
    { rowNumber: 2, instruction: '' },
    { instruction: 'no number' },
    null,
    'junk',
    { section: 'Head', rowNumber: 1, rowLabel: 'Round 1', instruction: '6 dc in a ring.', stitchCount: 6 },
  ])
  assert.equal(out.length, 2)
  assert.equal(out[0]!.section, 'Pattern')
  assert.equal(out[1]!.stitchCount, 6)
  assert.deepEqual(normalisePublicRows(null), [])
})
check('sections keep the order they first appear in', () => {
  const r = normalisePublicRows([...rows(2, 'Body'), ...rows(1, 'Head'), ...rows(1, 'Assembly')])
  assert.deepEqual(groupBySection(r).map((s) => s.name), ['Body', 'Head', 'Assembly'])
})

console.log('materials')
check('yarn metres from yardageBySize.default', () => {
  assert.equal(yarnMetres({ default: 16 }), 16)
  assert.equal(yarnMetres({ default: 0 }), null)
  assert.equal(yarnMetres(null), null)
  assert.equal(yarnMetres({ M: 900 }), null)
})
check('UK abbreviations carry the US term; unknown ones still list', () => {
  const l = abbreviationLegend(['dc', 'ch', 'dc', 'MR', 'fpdc'], 'uk')
  assert.deepEqual(l.map((x) => x.abbr), ['dc', 'ch', 'MR', 'fpdc'])
  assert.equal(l[0]!.meaning, 'double crochet (US sc)')
  assert.equal(l[1]!.meaning, 'chain')
  assert.equal(l[2]!.meaning, 'magic ring')
  assert.equal(l[3]!.meaning, '')
  assert.equal(abbreviationLegend(['dc'], 'us')[0]!.meaning, 'double crochet')
})

console.log('links')
check('cards open the public page; a slugless row still opens the Studio', () => {
  assert.equal(crochetCardHref({ id: 'x', slug: 'crochet-cloud-soft-ball' }), '/crochet/patterns/crochet-cloud-soft-ball')
  assert.equal(crochetCardHref({ id: 'abc', slug: null }), '/studio/crochet?crochetPatternId=abc')
  assert.equal(crochetPatternPath('a b'), '/crochet/patterns/a%20b')
})
check('the grid and search cards use the helper', () => {
  for (const f of ['components/public/category-layouts/crochet-pattern-grid.tsx', 'app/(public)/search/page.tsx']) {
    const src = readFileSync(resolve(webSrc, f), 'utf8')
    assert.match(src, /crochetCardHref\(p\)/, f)
    assert.doesNotMatch(src, /crochetPatternSlug=/, f)
  }
})
check('the public page, the grid and this module stay TipTap-free', () => {
  for (const f of [
    'app/(public)/crochet/patterns/[slug]/page.tsx',
    'components/public/category-layouts/crochet-pattern-grid.tsx',
    'lib/crochet/public-pattern.ts',
  ]) {
    assert.doesNotMatch(readFileSync(resolve(webSrc, f), 'utf8'), /@tiptap\//, f)
  }
})
check('the page checks category visibility before rendering', () => {
  const src = readFileSync(resolve(webSrc, 'app/(public)/crochet/patterns/[slug]/page.tsx'), 'utf8')
  assert.match(src, /canViewCrochetPatternPage\(/)
  assert.match(src, /isPublicVisible/)
})

if (failures > 0) {
  console.error(`\n${failures} failing`)
  process.exit(1)
}
console.log('\nall passing')
