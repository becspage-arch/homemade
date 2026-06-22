/**
 * Automated fix pass for batch-1 voice-check errors:
 * - glossary-coverage: wrap first occurrence of each glossary term with glossaryTooltip mark
 * - servings-yield: null out servings for discrete-item yields (bakes, confections)
 *
 * Run from cooking-sprint-0 root:
 *   npx tsx fix-voice-errors.ts
 */

import fs from 'fs'
import path from 'path'

type Mark = { type: string; attrs?: Record<string, unknown> }
type DocNode = {
  type: string
  text?: string
  marks?: Mark[]
  attrs?: Record<string, unknown>
  content?: DocNode[]
}

type GlossaryTerm = { slug: string; term: string; definition: string }

/** Return candidate search strings in priority order */
function searchCandidates(slug: string, term: string): string[] {
  const out: string[] = [term]
  const SKIP = new Set(['a', 'an', 'the', 'al', 'le', 'la', 'gli', 'wild', 'rough', 'soft'])
  const words = term.split(' ')
  const meaningful = words.filter(w => !SKIP.has(w.toLowerCase()))
  if (meaningful.length && meaningful[0].toLowerCase() !== term.toLowerCase()) {
    out.push(meaningful[0])
  }
  const slugWords = slug.replace(/-/g, ' ')
  if (!out.some(c => c.toLowerCase() === slugWords)) out.push(slugWords)
  // last resort: just the slug last word
  const parts = slug.split('-')
  if (parts.length > 1) out.push(parts[parts.length - 1])
  return out
}

/** Walk nodes and wrap first hit; mutates nothing, returns new array */
function wrapFirst(
  nodes: DocNode[],
  searchTerm: string,
  termSlug: string,
  found: { done: boolean }
): DocNode[] {
  if (found.done) return nodes
  const result: DocNode[] = []
  for (const node of nodes) {
    if (found.done) { result.push(node); continue }

    if (
      node.type === 'text' &&
      node.text &&
      !node.marks?.some(m => m.type === 'glossaryTooltip')
    ) {
      const idx = node.text.toLowerCase().indexOf(searchTerm.toLowerCase())
      if (idx !== -1) {
        found.done = true
        const before = node.text.slice(0, idx)
        const matched = node.text.slice(idx, idx + searchTerm.length)
        const after = node.text.slice(idx + searchTerm.length)
        const existingMarks: Mark[] = node.marks ?? []
        const tooltipMark: Mark = { type: 'glossaryTooltip', attrs: { termSlug } }
        if (before) result.push({ ...node, text: before })
        result.push({ ...node, text: matched, marks: [...existingMarks, tooltipMark] })
        if (after) result.push({ ...node, text: after })
        continue
      }
    }

    if (node.content) {
      const newContent = wrapFirst(node.content, searchTerm, termSlug, found)
      result.push({ ...node, content: newContent })
    } else {
      result.push(node)
    }
  }
  return result
}

function applyGlossaryWraps(body: DocNode, terms: GlossaryTerm[]): { body: DocNode; misses: string[] } {
  let current = body
  const misses: string[] = []
  for (const { slug, term } of terms) {
    const candidates = searchCandidates(slug, term)
    let wrapped = false
    for (const candidate of candidates) {
      const found = { done: false }
      const newContent = wrapFirst(current.content ?? [], candidate, slug, found)
      if (found.done) {
        current = { ...current, content: newContent }
        wrapped = true
        break
      }
    }
    if (!wrapped) misses.push(slug)
  }
  return { body: current, misses }
}

const DISCRETE_KEYWORDS = ['slice', 'piece', 'cake', 'bun', 'biscuit', 'rascal', 'loaf', 'tablet', 'fairing']

function fixServingsYield(recipe: Record<string, unknown>): { changed: boolean; msg: string } {
  if (recipe.servings == null || !recipe.yieldDescription) {
    return { changed: false, msg: '' }
  }
  const yd = (recipe.yieldDescription as string).toLowerCase()
  if (DISCRETE_KEYWORDS.some(k => yd.includes(k))) {
    recipe.servings = null
    return { changed: true, msg: `nulled servings (discrete yield: "${recipe.yieldDescription}")` }
  } else {
    recipe.yieldDescription = null
    return { changed: true, msg: 'nulled yieldDescription (portion-count yield)' }
  }
}

const DIR = path.join(__dirname, 'docs', 'cooking-sprint-worker-0')
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort()

for (const file of files) {
  const filepath = path.join(DIR, file)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = JSON.parse(fs.readFileSync(filepath, 'utf-8'))

  let modified = false

  // 1. glossary-coverage
  const terms: GlossaryTerm[] = data.glossaryTerms ?? []
  if (terms.length) {
    const { body, misses } = applyGlossaryWraps(data.body as DocNode, terms)
    data.body = body
    modified = true
    for (const slug of misses) {
      console.warn(`${file}: MISS - could not find term "${slug}" in body text`)
    }
  }

  // 2. servings-yield conflict
  if (data.recipe) {
    const { changed, msg } = fixServingsYield(data.recipe as Record<string, unknown>)
    if (changed) { modified = true; console.log(`${file}: ${msg}`) }
  }

  if (modified) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n')
    console.log(`${file}: saved`)
  }
}
console.log('Done.')
