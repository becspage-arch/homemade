/**
 * verify-technique-sweep — assertion script for the reverse-sweep
 * helpers shipped in `phase_technique_linking_002`.
 *
 * No formal test runner lives in this repo, so this script follows the
 * same tsx-driven assertion pattern used by `verify-technique-link.ts`
 * and `verify-tutorial-bodies.ts`. Exits 0 on pass, 1 on fail.
 *
 * Four surfaces under test:
 *
 *   1. `buildSearchTerms` — title / slug-with-spaces / alias merging,
 *      trimming, dedup, case-folding.
 *   2. `extractTextForSweep` — TipTap walk pulls out text nodes,
 *      common attrs on custom blocks, and items[] strings; ignores
 *      empties; returns a lower-cased blob.
 *   3. `bodyMentionsAnyTerm` — case-insensitive whole-word match,
 *      multi-word phrases, defensive against empty inputs.
 *   4. `sweepForTechnique` against an in-memory fake of `prisma` — the
 *      end-to-end contract: filters by category + status + type,
 *      excludes the technique itself, skips rows that already carry
 *      the slug (idempotency), appends only on text matches, and
 *      returns the expected summary shape.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/verify-technique-sweep.ts
 */

import {
  buildSearchTerms,
  extractTextForSweep,
  bodyMentionsAnyTerm,
  sweepForTechnique,
} from '../src/technique-sweep.js'

let passed = 0
let failed = 0

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++
    console.log(`  ✓ ${label}`)
  } else {
    failed++
    console.error(`  ✗ ${label}`)
  }
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (ok) {
    passed++
    console.log(`  ✓ ${label}`)
  } else {
    failed++
    console.error(`  ✗ ${label}`)
    console.error(`      expected: ${JSON.stringify(expected)}`)
    console.error(`      actual:   ${JSON.stringify(actual)}`)
  }
}

// ─────────────────────────────────────────────────────────────────────
// [1] buildSearchTerms
// ─────────────────────────────────────────────────────────────────────

console.log('\n[1] buildSearchTerms')

assertEqual(
  buildSearchTerms({
    title: 'Blind baking',
    slug: 'blind-baking',
    aliases: ['Pre-bake the pastry', 'BLIND BAKE'],
  }),
  ['blind baking', 'pre-bake the pastry', 'blind bake'],
  'title + slug-with-spaces + aliases merged, lower-cased, deduped',
)

assertEqual(
  buildSearchTerms({
    title: 'Creaming method',
    slug: 'creaming-method',
    aliases: [],
  }),
  ['creaming method'],
  'title and slug-with-spaces collapse when they normalise to the same string',
)

assertEqual(
  buildSearchTerms({
    title: '  Sweating  ',
    slug: 'sweating',
    aliases: ['  ', '', 'sweat the onions'],
  }),
  ['sweating', 'sweat the onions'],
  'whitespace trimmed; empty / whitespace-only aliases dropped',
)

assertEqual(
  buildSearchTerms({ title: '', slug: '', aliases: [] }),
  [],
  'empty technique → empty search-term set (sweep will no-op)',
)

// ─────────────────────────────────────────────────────────────────────
// [2] extractTextForSweep
// ─────────────────────────────────────────────────────────────────────

console.log('\n[2] extractTextForSweep')

assertEqual(extractTextForSweep(null), '', 'null body → empty string')
assertEqual(extractTextForSweep(undefined), '', 'undefined body → empty string')
assertEqual(extractTextForSweep('not an object'), '', 'non-object body → empty string')

const simpleBody = {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Blind baking the pastry.' }] },
  ],
}
assertEqual(
  extractTextForSweep(simpleBody),
  'blind baking the pastry.',
  'flat paragraph → lower-cased text',
)

const richBody = {
  type: 'doc',
  content: [
    {
      type: 'infoPanel',
      attrs: { tone: 'tip', title: 'Sweating onions', body: 'Cook low and slow.' },
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'See also our ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'creaming method' },
        { type: 'text', text: ' walkthrough.' },
      ],
    },
    {
      type: 'ingredientsList',
      attrs: {
        items: [
          { name: 'butter', amount: 200, prepNote: 'softened' },
          { name: 'caster sugar', amount: 200 },
        ],
      },
    },
  ],
}
const richBlob = extractTextForSweep(richBody)
assert(richBlob.includes('sweating onions'), 'infoPanel title pulled in')
assert(richBlob.includes('cook low and slow'), 'infoPanel body pulled in')
assert(richBlob.includes('creaming method'), 'mark-wrapped text retained')
assert(richBlob.includes('softened'), 'ingredientsList item string values pulled in')

// ─────────────────────────────────────────────────────────────────────
// [3] bodyMentionsAnyTerm
// ─────────────────────────────────────────────────────────────────────

console.log('\n[3] bodyMentionsAnyTerm')

const blob = 'first you blind bake the pastry, then sweat the onions gently.'

assert(
  bodyMentionsAnyTerm(blob, ['blind bake']) === true,
  'multi-word term matches as whole phrase',
)
assert(
  bodyMentionsAnyTerm('first you BLIND BAKE the pastry.', ['blind bake']) === true,
  'case-insensitive regex (term lowercase, text mixed case)',
)
assert(
  bodyMentionsAnyTerm(blob, ['SWEAT']) === true,
  'case-insensitive regex (term uppercase, text lowercase)',
)
assert(
  bodyMentionsAnyTerm(blob, ['sweat']) === true,
  'whole-word match — "sweat" matches "sweat the onions"',
)
assert(
  bodyMentionsAnyTerm(blob, ['baking']) === false,
  'no false positive — "baking" not in body (only "bake")',
)
assert(
  bodyMentionsAnyTerm(blob, ['blind bakingly']) === false,
  'partial-suffix term does not match',
)
assert(
  bodyMentionsAnyTerm(blob, ['unrelated', 'creaming']) === false,
  'multi-term miss returns false',
)
assert(
  bodyMentionsAnyTerm(blob, ['unrelated', 'sweat']) === true,
  'multi-term hit on later term still returns true',
)
assert(
  bodyMentionsAnyTerm('', ['anything']) === false,
  'empty body never matches',
)
assert(
  bodyMentionsAnyTerm(blob, ['']) === false,
  'empty term never matches',
)

// Regex-escape guard — a term that contains regex metacharacters must
// be treated as a literal. The boundary anchors only require letters on
// either end of the term, so mid-term metacharacters are the cases worth
// asserting (parens-leading/trailing aliases don't make sense in practice).
assert(
  bodyMentionsAnyTerm('roll out and proof.', ['roll.out']) === false,
  'period in term escaped — does not act as wildcard',
)
assert(
  bodyMentionsAnyTerm('test the a+b combo here', ['a+b']) === true,
  'plus sign in term escaped — matched literally',
)

// ─────────────────────────────────────────────────────────────────────
// [4] sweepForTechnique against an in-memory fake of Prisma
// ─────────────────────────────────────────────────────────────────────
//
// We can't reach a real database from a tsx unit script, so we stub
// just the two PrismaClient methods `sweepForTechnique` calls
// (`tutorial.findMany`, `tutorial.update`). The fake honours the same
// where-clause semantics so we exercise:
//   - category scope-fence
//   - PUBLISHED-only
//   - sweepable-type allow-list (RECIPE / PRACTICE / GROWING_GUIDE /
//     REMEDY / HERB_PROFILE / STITCH / PATTERN)
//   - "slug not already present" (idempotency)
//   - "exclude the technique itself"
//   - body-text matching
//   - audit-log shape (sampleTitles + counts)
// ─────────────────────────────────────────────────────────────────────

console.log('\n[4] sweepForTechnique end-to-end (fake Prisma)')

interface FakeRow {
  id: string
  slug: string
  title: string
  body: unknown
  techniqueSlugs: string[]
  categoryId: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED' | 'IN_REVIEW' | 'PENDING_MODERATION'
  type:
    | 'RECIPE'
    | 'TECHNIQUE'
    | 'PRACTICE'
    | 'READING'
    | 'GROWING_GUIDE'
    | 'REMEDY'
    | 'HERB_PROFILE'
    | 'STITCH'
    | 'PATTERN'
}

function makeFakePrisma(rows: FakeRow[]): {
  prisma: Parameters<typeof sweepForTechnique>[0]
  rows: FakeRow[]
} {
  const tutorial = {
    findMany: async (args: {
      where?: Record<string, unknown>
      select?: Record<string, boolean>
    }) => {
      const where = (args.where ?? {}) as Record<string, unknown>
      return rows
        .filter((r) => {
          if (where.categoryId && r.categoryId !== where.categoryId) return false
          if (where.status && r.status !== where.status) return false
          const typeFilter = where.type as { in?: string[] } | undefined
          if (typeFilter?.in && !typeFilter.in.includes(r.type)) return false
          const not = where.NOT as { techniqueSlugs?: { has?: string } } | undefined
          if (not?.techniqueSlugs?.has && r.techniqueSlugs.includes(not.techniqueSlugs.has)) {
            return false
          }
          const idFilter = where.id as { not?: string } | undefined
          if (idFilter?.not && r.id === idFilter.not) return false
          return true
        })
        .map((r) => ({ ...r }))
    },
    update: async (args: {
      where: { id: string }
      data: { techniqueSlugs?: { push?: string } }
    }) => {
      const row = rows.find((r) => r.id === args.where.id)
      if (!row) throw new Error(`fake update target not found: ${args.where.id}`)
      const push = args.data.techniqueSlugs?.push
      if (push && !row.techniqueSlugs.includes(push)) {
        row.techniqueSlugs.push(push)
      }
      return { ...row }
    },
  }
  // The sweep helper only touches `.tutorial`. Cast aside the rest of
  // the PrismaClient surface.
  return { prisma: { tutorial } as unknown as Parameters<typeof sweepForTechnique>[0], rows }
}

async function runSweepSurface(): Promise<void> {

const cookingCat = 'cat-cooking'
const mindsetCat = 'cat-mindset'

const technique: FakeRow = {
  id: 'tech-blind-baking',
  slug: 'blind-baking',
  title: 'Blind baking',
  body: { type: 'doc', content: [] },
  techniqueSlugs: [],
  categoryId: cookingCat,
  status: 'PUBLISHED',
  type: 'TECHNIQUE',
}

const recipeWithMatch: FakeRow = {
  id: 'recipe-1',
  slug: 'lemon-tart',
  title: 'Lemon tart',
  body: {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Blind bake the shell at 180°C.' }] },
    ],
  },
  techniqueSlugs: [],
  categoryId: cookingCat,
  status: 'PUBLISHED',
  type: 'RECIPE',
}

const recipeWithoutMatch: FakeRow = {
  id: 'recipe-2',
  slug: 'tomato-soup',
  title: 'Tomato soup',
  body: {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Simmer until thickened.' }] },
    ],
  },
  techniqueSlugs: [],
  categoryId: cookingCat,
  status: 'PUBLISHED',
  type: 'RECIPE',
}

const recipeAlreadyAnnotated: FakeRow = {
  id: 'recipe-3',
  slug: 'apple-pie',
  title: 'Apple pie',
  body: {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Blind bake the crust first.' }] },
    ],
  },
  techniqueSlugs: ['blind-baking'],
  categoryId: cookingCat,
  status: 'PUBLISHED',
  type: 'RECIPE',
}

const recipeInOtherCategory: FakeRow = {
  id: 'recipe-4',
  slug: 'mindset-blind-bake-metaphor',
  title: 'Blind-bake metaphor practice',
  body: {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Blind bake the pastry of trust.' }] },
    ],
  },
  techniqueSlugs: [],
  categoryId: mindsetCat,
  status: 'PUBLISHED',
  type: 'PRACTICE',
}

const draftRecipeWithMatch: FakeRow = {
  id: 'recipe-5',
  slug: 'shepherds-pie',
  title: "Shepherd's pie",
  body: {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Blind baking is unnecessary here.' }] },
    ],
  },
  techniqueSlugs: [],
  categoryId: cookingCat,
  status: 'DRAFT',
  type: 'RECIPE',
}

const techniqueRowMentioningSelf: FakeRow = {
  // A second TECHNIQUE row that happens to mention the canonical
  // technique. Technique rows should NEVER be swept — they aren't in
  // the SWEEPABLE_TYPES allow-list.
  id: 'tech-other',
  slug: 'pastry-handling',
  title: 'Pastry handling',
  body: {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Then blind baking is the obvious next step.' }] },
    ],
  },
  techniqueSlugs: [],
  categoryId: cookingCat,
  status: 'PUBLISHED',
  type: 'TECHNIQUE',
}

const { prisma: fakePrisma, rows } = makeFakePrisma([
  technique,
  recipeWithMatch,
  recipeWithoutMatch,
  recipeAlreadyAnnotated,
  recipeInOtherCategory,
  draftRecipeWithMatch,
  techniqueRowMentioningSelf,
])

const result = await sweepForTechnique(fakePrisma, {
  id: technique.id,
  slug: technique.slug,
  title: technique.title,
  aliases: ['blind bake'],
  categoryId: cookingCat,
})

assert(result.recipesAnnotated === 1, 'sweep annotates exactly one row (lemon-tart)')
assert(
  rows.find((r) => r.id === recipeWithMatch.id)?.techniqueSlugs.includes('blind-baking') === true,
  'recipeWithMatch.techniqueSlugs now contains the slug',
)
assert(
  rows.find((r) => r.id === recipeWithoutMatch.id)?.techniqueSlugs.length === 0,
  'recipeWithoutMatch left untouched',
)
assert(
  rows.find((r) => r.id === recipeAlreadyAnnotated.id)?.techniqueSlugs.length === 1,
  'recipeAlreadyAnnotated still carries exactly one entry (idempotency)',
)
assert(
  rows.find((r) => r.id === recipeInOtherCategory.id)?.techniqueSlugs.length === 0,
  'cross-category row left untouched (mindset scope-fence)',
)
assert(
  rows.find((r) => r.id === draftRecipeWithMatch.id)?.techniqueSlugs.length === 0,
  'DRAFT row left untouched',
)
assert(
  rows.find((r) => r.id === techniqueRowMentioningSelf.id)?.techniqueSlugs.length === 0,
  'other TECHNIQUE row left untouched (sweepable-type allow-list)',
)
assertEqual(result.sampleTitles, ['Lemon tart'], 'sampleTitles surfaces the annotated row')
assert(
  result.techniqueSlug === 'blind-baking' && result.techniqueTitle === 'Blind baking',
  'result echoes slug + title for audit-log visibility',
)

// Idempotency — running the sweep a second time must annotate zero new rows.
const second = await sweepForTechnique(fakePrisma, {
  id: technique.id,
  slug: technique.slug,
  title: technique.title,
  aliases: ['blind bake'],
  categoryId: cookingCat,
})
assert(second.recipesAnnotated === 0, 'second sweep is a no-op (idempotency)')
assert(
  rows.find((r) => r.id === recipeWithMatch.id)?.techniqueSlugs.length === 1,
  'no duplicate slug appended on second sweep',
)

}

runSweepSurface()
  .then(() => {
    // ─────────────────────────────────────────────────────────────────────
    // Summary
    // ─────────────────────────────────────────────────────────────────────
    console.log(`\n${passed} passed, ${failed} failed.`)
    process.exit(failed === 0 ? 0 : 1)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
