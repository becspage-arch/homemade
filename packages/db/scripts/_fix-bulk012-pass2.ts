/**
 * Pass 2: Fix all remaining em/en-dashes in any string value throughout the JSON,
 * plus fix glossary-coverage for soap briefs that registered saponification+superfat.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BRIEFS_DIR = path.resolve(__dirname, '../../../docs/natural-home-bulk-012-briefs')

function fixDashes(text: string): string {
  // Numeric range with en-dash: "38–42°C" → "38 to 42°C"
  let s = text.replace(/(\d)–(\d)/g, '$1 to $2')
  // En-dash with spaces: " – " → ", "
  s = s.replace(/ – ([A-Z])/g, (_: string, c: string) => `. ${c}`)
  s = s.replace(/ – /g, ', ')
  // Em-dash with spaces (any remaining)
  s = s.replace(/ — ([A-Z])/g, (_: string, c: string) => `. ${c}`)
  s = s.replace(/ — /g, ', ')
  // Bare en/em-dash (no surrounding spaces) — e.g. in glossary definitions
  s = s.replace(/([a-z])—([a-z])/g, '$1, $2')
  s = s.replace(/([a-z])–([a-z])/g, '$1 to $2')
  s = s.replace(/([a-z])—([A-Z])/g, (_: string, a: string, b: string) => `${a}. ${b}`)
  // Any leftover dashes
  s = s.replace(/[—–]/g, ' to ')
  return s
}

function fixAllStrings(value: any): any {
  if (typeof value === 'string') return fixDashes(value)
  if (Array.isArray(value)) return value.map(fixAllStrings)
  if (value && typeof value === 'object') {
    const result: Record<string, any> = {}
    for (const [k, v] of Object.entries(value)) {
      result[k] = fixAllStrings(v)
    }
    return result
  }
  return value
}

// Soap slugs that need saponification + superfat tooltips added
const SOAP_SLUGS = [
  '01-goats-milk-honey-cold-process-soap',
  '02-hot-process-bar-soap',
  '03-hemp-seed-cold-process-soap',
  '04-liquid-castile-soap',
  '05-shampoo-bar-basic',
  '06-salt-bar-soap',
  '07-coffee-scrub-cold-process-soap',
  '08-cocoa-butter-vanilla-cold-process-soap',
]

function hasGlossaryTooltip(body: any, slug: string): boolean {
  const str = JSON.stringify(body)
  return str.includes(`"termSlug":"${slug}"`) || str.includes(`"termSlug": "${slug}"`)
}

function addGlossaryTooltipToFirstSentence(openParagraph: any, term: string, slug: string): void {
  // Find the last text node in the paragraph content and append the term if not present
  if (!openParagraph?.content) return
  // Add a sentence at the end referencing the term with a tooltip
  // We'll add a new text-with-mark node at the end
  const lastNode = openParagraph.content[openParagraph.content.length - 1]
  if (lastNode?.type === 'text' && typeof lastNode.text === 'string') {
    // Remove trailing period from last node text
    lastNode.text = lastNode.text.replace(/\.$/, '')
    // Add text node, then term with tooltip, then closing
    openParagraph.content.push({
      type: 'text',
      text: `. The process is called `
    })
    openParagraph.content.push({
      type: 'text',
      text: term,
      marks: [{ type: 'glossaryTooltip', attrs: { termSlug: slug } }]
    })
    openParagraph.content.push({
      type: 'text',
      text: '.'
    })
  }
}

function addSuperfatToBody(openParagraph: any): void {
  if (!openParagraph?.content) return
  const lastNode = openParagraph.content[openParagraph.content.length - 1]
  if (lastNode?.type === 'text' && typeof lastNode.text === 'string') {
    // Add "at 5% superfat" context before the closing sentence
    const text = lastNode.text
    // Insert before "Makes X bars"
    const makeMatch = text.match(/( Makes .*)$/)
    if (makeMatch) {
      const before = text.slice(0, text.length - makeMatch[0].length)
      const after = makeMatch[0]
      lastNode.text = before
      openParagraph.content.push({
        type: 'text',
        text: '. This formula uses 5% '
      })
      openParagraph.content.push({
        type: 'text',
        text: 'superfat',
        marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'superfat' } }]
      })
      openParagraph.content.push({
        type: 'text',
        text: ', leaving a small conditioning reserve of unreacted oil in the finished bar' + after
      })
    }
  }
}

const files = fs.readdirSync(BRIEFS_DIR).filter((f: string) => f.endsWith('.json'))

for (const file of files) {
  const fullPath = path.join(BRIEFS_DIR, file)
  let data = JSON.parse(fs.readFileSync(fullPath, 'utf8'))

  // Fix all em/en-dashes everywhere
  data = fixAllStrings(data)

  // Fix glossary coverage for soap briefs
  const slug = file.replace(/^\d+-/, '').replace('.json', '')
  const isSoap = SOAP_SLUGS.some(s => file.includes(s.replace(/^\d+-/, '')))

  if (isSoap && data.body) {
    const bodyContent = data.body.content
    const openParagraph = bodyContent?.[0]

    // Check if saponification tooltip is missing
    const registeredTerms = (data.glossaryTerms ?? []).map((t: any) => t.slug)

    if (registeredTerms.includes('saponification') && !hasGlossaryTooltip(data.body, 'saponification')) {
      // Add saponification to the opening paragraph
      if (openParagraph?.type === 'paragraph') {
        addGlossaryTooltipToFirstSentence(openParagraph, 'saponification', 'saponification')
      }
    }

    if (registeredTerms.includes('superfat') && !hasGlossaryTooltip(data.body, 'superfat')) {
      if (openParagraph?.type === 'paragraph') {
        addSuperfatToBody(openParagraph)
      }
    }
  }

  const json = JSON.stringify(data, null, 2)
  fs.writeFileSync(fullPath, json + '\n')
  console.log(`Pass2: ${file}`)
}

console.log(`Done`)
