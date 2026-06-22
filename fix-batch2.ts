/**
 * Fix batch-2 voice-check errors:
 * 1. Em-dashes (— –) -> replaced with appropriate punctuation
 * 2. Glossary tooltip slugs referenced in body but not declared in glossaryTerms -> remove tooltip mark
 * 3. Banned phrase "genuinely" -> removed
 * 4. Americanism "fall" -> "autumn"
 */

import fs from 'fs'
import path from 'path'

const DIR = path.join(__dirname, 'docs', 'cooking-sprint-worker-0', 'batch2')

type Mark = { type: string; attrs?: Record<string, unknown> }
type DocNode = { type: string; text?: string; marks?: Mark[]; attrs?: Record<string, unknown>; content?: DocNode[] }

function fixText(t: string): string {
  return t
    .replace(/—/g, ',') // em-dash -> comma
    .replace(/–/g, ',') // en-dash -> comma
    .replace(/\bfall\b/g, 'autumn')
    .replace(/\bgenuinely\b/gi, '')
    .replace(/  +/g, ' ')
    .trim()
}

function collectTooltipSlugs(node: DocNode, slugs: Set<string>): void {
  if (node.marks) {
    for (const m of node.marks) {
      if (m.type === 'glossaryTooltip' && m.attrs?.termSlug) {
        slugs.add(m.attrs.termSlug as string)
      }
    }
  }
  if (node.content) node.content.forEach(c => collectTooltipSlugs(c, slugs))
}

function fixNode(node: DocNode, declaredSlugs: Set<string>): DocNode {
  // Fix text content and remove undeclared tooltips
  if (node.type === 'text') {
    const newText = node.text ? fixText(node.text) : node.text
    const newMarks = (node.marks ?? []).filter(m => {
      if (m.type === 'glossaryTooltip') {
        return declaredSlugs.has(m.attrs?.termSlug as string)
      }
      return true
    })
    return { ...node, text: newText, marks: newMarks.length ? newMarks : undefined }
  }
  if (node.content) {
    return { ...node, content: node.content.map(c => fixNode(c, declaredSlugs)) }
  }
  return node
}

function fixString(s: string): string {
  return s.replace(/—/g, ' ').replace(/–/g, ' ').replace(/\bfall\b/g, 'autumn')
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort()

for (const file of files) {
  const filepath = path.join(DIR, file)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = JSON.parse(fs.readFileSync(filepath, 'utf-8'))

  // Fix sourceNotes em-dashes
  if (data.sourceNotes) data.sourceNotes = fixString(data.sourceNotes)
  if (data.excerpt) data.excerpt = fixString(data.excerpt)

  // Get declared glossary slugs
  const declaredSlugs = new Set<string>((data.glossaryTerms ?? []).map((g: { slug: string }) => g.slug))

  // Fix body
  data.body = fixNode(data.body as DocNode, declaredSlugs)

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n')
  console.log(`Fixed: ${file}`)
}

console.log('Done.')
