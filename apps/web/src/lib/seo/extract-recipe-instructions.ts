import type { TipTapNode } from '@/components/public/tutorial-content/types'

/**
 * One recipe / how-to step pulled out of a TipTap body. `name` carries the
 * author's own step heading when there is one (an `h3` inside the method
 * section); the Recipe schema builder falls back to deriving a name from the
 * text when it's null. `text` is always the full step prose, never invented.
 */
export interface RecipeStep {
  name: string | null
  text: string
}

function plainText(node: TipTapNode): string {
  if (typeof node.text === 'string') return node.text
  if (!node.content) return ''
  return node.content.map(plainText).join('')
}

function isHeading(node: TipTapNode, level?: number): boolean {
  if (node.type !== 'heading') return false
  if (level == null) return true
  return (node.attrs?.level as number | undefined) === level
}

// Headings that introduce the actual ordered process. Matched on the h2 that
// opens the steps section.
const METHOD_HEADING_RE =
  /\b(method|instructions?|directions?|steps|how to (make|do)|to make|preparation|what to do|the practice)\b/i

// Headings whose content is NOT a step: ingredients, kit, storage, notes,
// troubleshooting, serving, sources. Used to keep the loose fallback (no
// labelled method heading) from sweeping up orientation or finishing prose.
const EXCLUDE_HEADING_RE =
  /\b(ingredient|what you need|you will need|equipment|tools?|storage|shelf life|keeps?|notes?|tips?|troubleshoot|variation|substitut|serve|serving|source|reference|nutrition|before you (start|begin)|safety|why|about|first burn)\b/i

/**
 * Split a single run-on method paragraph into sentence-sized steps. Only used
 * as a last resort when a method resolves to exactly one long block — the
 * sentences are the author's own, split on `.`/`!`/`?` boundaries, never
 * reworded. Decimals (180.5) survive because the splitter only breaks on
 * punctuation followed by whitespace; short abbreviations are parked behind a
 * sentinel and restored.
 */
function splitSentences(text: string): string[] {
  const sentinel = String.fromCharCode(0)
  const guarded = text
    .trim()
    .replace(/\b(approx|tbsp|tsp|min|hr|temp|etc|vs)\.(\s)/gi, `$1${sentinel}$2`)
  return guarded
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.split(sentinel).join('.').trim())
    .filter((s) => s.length > 0)
}

/**
 * Pull an ordered list of steps out of a recipe / how-to body.
 *
 * Order of preference, each only tried when the previous found nothing:
 *  1. A TipTap `orderedList` — the canonical, authored-numbered shape.
 *  2. The labelled method section — the paragraphs under an `h2` whose text
 *     reads as "Method" / "Instructions" / "Steps" / …, each paragraph a step,
 *     carrying the preceding `h3` as its name when there is one.
 *  3. A loose fallback — paragraphs that sit after the ingredients block and
 *     aren't under an excluded heading (storage, notes, serving, sources).
 *  4. A lone long method paragraph split on sentence boundaries.
 *
 * Nothing is ever invented: every step's text is prose the author wrote. The
 * point is that a method written as headings-and-paragraphs (the house style
 * for most recipes) still yields steps instead of an empty list.
 */
export function extractRecipeSteps(body: TipTapNode | null | undefined): RecipeStep[] {
  if (!body) return []

  // 1. Authored ordered list anywhere in the body.
  const ordered = collectOrderedList(body)
  if (ordered.length > 0) return ordered

  // The method lives as flat siblings in the document's top-level content.
  const top = Array.isArray(body.content) ? body.content : []

  // 2 + 3. Single linear pass collecting both the labelled-method steps and
  // the loose post-ingredients steps; prefer the labelled set when present.
  const methodSteps: RecipeStep[] = []
  const looseSteps: RecipeStep[] = []
  let currentH2: string | null = null
  let currentH3: string | null = null
  let seenIngredients = false

  // Which bucket does a block under the current section belong to? The
  // labelled method section wins; otherwise a post-ingredients section that
  // isn't one of the excluded kinds (storage, notes, serving, …).
  const bucketFor = (): RecipeStep[] | null => {
    if (currentH2 != null && METHOD_HEADING_RE.test(currentH2)) return methodSteps
    const excluded = currentH2 != null && EXCLUDE_HEADING_RE.test(currentH2)
    if (seenIngredients && currentH2 != null && !excluded) return looseSteps
    return null
  }

  for (const node of top) {
    if (node.type === 'ingredientsList') {
      seenIngredients = true
      continue
    }
    if (isHeading(node, 2)) {
      currentH2 = plainText(node).trim()
      currentH3 = null
      continue
    }
    if (isHeading(node)) {
      // h3 / h4 — a step heading inside the current section.
      currentH3 = plainText(node).trim() || null
      continue
    }

    // A numbered / bulleted list nested under a section heading (a method
    // written as a list rather than the house heading-per-step) — expand each
    // item to a step. (A top-level orderedList was already handled above.)
    if ((node.type === 'orderedList' || node.type === 'bulletList') && node.content) {
      const bucket = bucketFor()
      if (bucket) {
        for (const li of node.content) {
          const t = plainText(li).replace(/\s+/g, ' ').trim()
          if (t) {
            bucket.push({ name: currentH3, text: t })
            currentH3 = null
          }
        }
      }
      continue
    }

    if (node.type !== 'paragraph') continue

    const text = plainText(node).replace(/\s+/g, ' ').trim()
    if (!text) continue

    const bucket = bucketFor()
    if (bucket) {
      bucket.push({ name: currentH3, text })
      currentH3 = null // only the first block after an h3 takes its name
    }
  }

  let steps = methodSteps.length > 0 ? methodSteps : looseSteps

  // 4. A method that collapsed to one long block gets sentence-split so the
  // reader (and Google) sees discrete steps rather than a wall of text.
  if (steps.length === 1) {
    const only = steps[0]!
    const sentences = splitSentences(only.text)
    if (sentences.length >= 3 && only.text.length > 200) {
      steps = sentences.map((s, i) => ({ name: i === 0 ? only.name : null, text: s }))
    }
  }

  return steps
}

function collectOrderedList(body: TipTapNode): RecipeStep[] {
  const steps: RecipeStep[] = []
  function walk(node: TipTapNode): void {
    if (node.type === 'orderedList' && node.content) {
      for (const li of node.content) {
        const text = plainText(li).replace(/\s+/g, ' ').trim()
        if (text) steps.push({ name: null, text })
      }
      return
    }
    if (node.content) for (const child of node.content) walk(child)
  }
  walk(body)
  return steps
}

/**
 * Flat list of step texts. Kept for the HowTo (technique) schema path, whose
 * builder takes `string[]`. Recipes use {@link extractRecipeSteps} directly so
 * they can carry the authored step headings through to the schema.
 */
export function extractRecipeInstructions(
  body: TipTapNode | null | undefined,
): string[] {
  return extractRecipeSteps(body).map((s) => s.text)
}

export function extractPlainText(
  body: TipTapNode | null | undefined,
  maxLength = 300,
): string {
  if (!body) return ''
  function walkText(node: TipTapNode): string {
    if (typeof node.text === 'string') return node.text
    if (!node.content) return ''
    return node.content.map(walkText).join(' ')
  }
  const raw = walkText(body).replace(/\s+/g, ' ').trim()
  if (raw.length <= maxLength) return raw
  return raw.slice(0, maxLength - 1).trimEnd() + '…'
}
