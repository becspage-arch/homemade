/**
 * verify-technique-link — assertion script for the technique-linking
 * infrastructure shipped in `phase_technique_linking_001`.
 *
 * No formal test runner lives in this repo, so this is a tsx-driven
 * assertion script — the same pattern used by `voice-check.ts` and
 * `verify-tutorial-bodies.ts`. Exits 0 on pass, 1 on fail.
 *
 * Two surfaces under test:
 *
 *  1. The renderer's `techniqueLink` mark contract — given a slug Map,
 *     a slug that resolves should produce an anchor element with the
 *     resolved title, and a slug that doesn't resolve should fall back
 *     to plain text. The actual renderer lives in
 *     `apps/web/src/components/public/tutorial-content/tutorial-content.tsx`;
 *     this script replicates the contract logic and exercises both
 *     branches.
 *
 *  2. Author-prompt JSON parsing — `validateInput` from
 *     `upload-tutorial-types.ts` should accept a valid
 *     techniqueSlugs / criticalTechniques pairing, reject a malformed
 *     slug, and reject a critical entry that isn't in the full set.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/verify-technique-link.ts
 */

import { validateInput, type TutorialUploadInput } from './upload-tutorial-types.js'

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

function assertThrows(fn: () => void, expectedSubstring: string, label: string): void {
  let threw = false
  let message = ''
  try {
    fn()
  } catch (e: unknown) {
    threw = true
    message = e instanceof Error ? e.message : String(e)
  }
  if (threw && message.includes(expectedSubstring)) {
    passed++
    console.log(`  ✓ ${label}`)
  } else if (threw) {
    failed++
    console.error(
      `  ✗ ${label} — threw, but message "${message}" did not contain "${expectedSubstring}"`,
    )
  } else {
    failed++
    console.error(`  ✗ ${label} — expected to throw, did not`)
  }
}

// ─────────────────────────────────────────────────────────────────────
// Surface 1 — renderer mark contract.
//
// Replicates the rule from `tutorial-content.tsx` line ~473:
//   case 'techniqueLink': {
//     const techniqueSlug = stringOrUndef(attrs.techniqueSlug)
//     if (!techniqueSlug) return <>{children}</>
//     return <TechniqueLink ... />
//   }
// and from `blocks/technique-link.tsx`:
//   const technique = techniques.find((t) => t.slug === techniqueSlug)
//   if (!technique) return <>{children}</>
//   return <Link href={`/${technique.categorySlug}/${technique.slug}`}>...
//
// We model the contract as a single function and assert both branches.
// ─────────────────────────────────────────────────────────────────────

interface TechniqueRef {
  slug: string
  title: string
  categorySlug: string
}

interface RenderResult {
  kind: 'anchor' | 'plain'
  href?: string
  title?: string
  text: string
}

function renderTechniqueLinkContract(
  attrs: { techniqueSlug?: string; label?: string },
  childText: string,
  techniques: TechniqueRef[],
): RenderResult {
  const slug = attrs.techniqueSlug
  if (!slug) return { kind: 'plain', text: childText }
  const technique = techniques.find((t) => t.slug === slug)
  if (!technique) return { kind: 'plain', text: childText }
  return {
    kind: 'anchor',
    href: `/${technique.categorySlug}/${technique.slug}`,
    title: technique.title || (attrs.label ?? ''),
    text: childText,
  }
}

console.log('\n[1] Renderer mark contract')

const techniqueMap: TechniqueRef[] = [
  { slug: 'blind-baking', title: 'Blind baking', categorySlug: 'baking' },
]

// Branch A — slug resolves: anchor + popover.
const resolved = renderTechniqueLinkContract(
  { techniqueSlug: 'blind-baking', label: 'blind bake' },
  'blind bake',
  techniqueMap,
)
assert(resolved.kind === 'anchor', 'resolved slug → anchor element')
assert(resolved.href === '/baking/blind-baking', 'resolved slug → href is /<categorySlug>/<slug>')
assert(resolved.title === 'Blind baking', 'resolved slug → title comes from queried technique, not cached label')
assert(resolved.text === 'blind bake', 'resolved slug → wrapped text is preserved as anchor body')

// Branch B — slug doesn't resolve: plain text fallback.
const unresolved = renderTechniqueLinkContract(
  { techniqueSlug: 'never-authored-yet', label: 'sweat' },
  'sweat',
  techniqueMap,
)
assert(unresolved.kind === 'plain', 'unresolved slug → plain text fallback (link not rendered)')
assert(unresolved.text === 'sweat', 'unresolved slug → wrapped text preserved verbatim')
assert(unresolved.href === undefined, 'unresolved slug → no href set')

// Branch C — empty slug (defensive): plain text fallback.
const empty = renderTechniqueLinkContract(
  { techniqueSlug: '', label: 'thing' },
  'thing',
  techniqueMap,
)
assert(empty.kind === 'plain', 'empty slug attribute → plain text fallback')

// ─────────────────────────────────────────────────────────────────────
// Surface 2 — author-prompt JSON parsing via validateInput.
// ─────────────────────────────────────────────────────────────────────

console.log('\n[2] Author-prompt JSON parsing')

const baseInput: TutorialUploadInput = {
  slug: 'sample-recipe',
  title: 'Sample recipe',
  type: 'RECIPE',
  categorySlug: 'cooking',
  body: { type: 'doc', content: [{ type: 'paragraph' }] },
}

// Valid pair — accepted with no error.
let validAccepted = true
try {
  validateInput({
    ...baseInput,
    techniqueSlugs: ['blind-baking', 'creaming-method-fat-and-sugar'],
    criticalTechniques: ['blind-baking'],
  })
} catch {
  validAccepted = false
}
assert(validAccepted, 'valid techniqueSlugs + criticalTechniques pair accepted')

// Empty arrays — accepted (common for tutorials that don't lean on techniques).
let emptyAccepted = true
try {
  validateInput({
    ...baseInput,
    techniqueSlugs: [],
    criticalTechniques: [],
  })
} catch {
  emptyAccepted = false
}
assert(emptyAccepted, 'empty technique arrays accepted')

// Omitted entirely — accepted (the fields default to []).
let omittedAccepted = true
try {
  validateInput(baseInput)
} catch {
  omittedAccepted = false
}
assert(omittedAccepted, 'omitted technique fields accepted')

// Malformed slug — rejected.
assertThrows(
  () =>
    validateInput({
      ...baseInput,
      techniqueSlugs: ['Blind Baking'],
    }),
  'techniqueSlugs entry',
  'uppercase slug rejected by validateInput',
)
assertThrows(
  () =>
    validateInput({
      ...baseInput,
      techniqueSlugs: ['blind_baking'],
    }),
  'techniqueSlugs entry',
  'underscore-in-slug rejected by validateInput',
)

// criticalTechniques entry not in techniqueSlugs — rejected.
assertThrows(
  () =>
    validateInput({
      ...baseInput,
      techniqueSlugs: ['blind-baking'],
      criticalTechniques: ['creaming-method-fat-and-sugar'],
    }),
  'must also appear in techniqueSlugs',
  'criticalTechniques entry missing from techniqueSlugs rejected',
)

// criticalTechniques entry with bad slug shape — rejected.
assertThrows(
  () =>
    validateInput({
      ...baseInput,
      criticalTechniques: ['Bad Slug'],
    }),
  'criticalTechniques entry',
  'malformed criticalTechniques slug rejected',
)

// ─────────────────────────────────────────────────────────────────────
// Summary.
// ─────────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed.`)
process.exit(failed === 0 ? 0 : 1)
