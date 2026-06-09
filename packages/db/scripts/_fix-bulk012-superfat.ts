/**
 * Pass 3: Add 'superfat' glossaryTooltip inline in any soap brief that registered it
 * but doesn't yet use it. Inserts " at 5% superfat" before "Makes" in the opening
 * paragraph, or appends a sentence if that pattern isn't found.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BRIEFS_DIR = path.resolve(__dirname, '../../../docs/natural-home-bulk-012-briefs')

function hasTooltip(body: any, slug: string): boolean {
  const str = JSON.stringify(body)
  return str.includes(`"termSlug":"${slug}"`) || str.includes(`"termSlug": "${slug}"`)
}

function addSuperfatToParagraph(para: any): void {
  if (!para?.content) return
  // Walk through content nodes looking for one that contains "Makes"
  for (let i = 0; i < para.content.length; i++) {
    const node = para.content[i]
    if (node.type === 'text' && typeof node.text === 'string' && node.text.includes('Makes')) {
      const text = node.text
      const makeIdx = text.indexOf(' Makes ')
      if (makeIdx === -1) continue
      const before = text.slice(0, makeIdx)
      const after = text.slice(makeIdx) // " Makes seven bars..."
      node.text = before
      // Insert superfat reference before "Makes"
      para.content.splice(i + 1, 0,
        { type: 'text', text: ' at 5% ' },
        {
          type: 'text',
          text: 'superfat',
          marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'superfat' } }]
        },
        { type: 'text', text: '.' + after }
      )
      return
    }
  }
  // Fallback: append a sentence at the end
  const lastNode = para.content[para.content.length - 1]
  if (lastNode?.type === 'text') {
    if (!lastNode.text.endsWith('.')) lastNode.text += '.'
  }
  para.content.push({ type: 'text', text: ' Run at 5% ' })
  para.content.push({
    type: 'text',
    text: 'superfat',
    marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'superfat' } }]
  })
  para.content.push({ type: 'text', text: '.' })
}

const files = fs.readdirSync(BRIEFS_DIR).filter((f: string) => f.endsWith('.json'))
let fixed = 0

for (const file of files) {
  const fullPath = path.join(BRIEFS_DIR, file)
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
  const registeredTerms: string[] = (data.glossaryTerms ?? []).map((t: any) => t.slug)

  if (registeredTerms.includes('superfat') && !hasTooltip(data.body, 'superfat')) {
    const para = data.body?.content?.[0]
    if (para?.type === 'paragraph') {
      addSuperfatToParagraph(para)
      fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n')
      console.log(`Fixed superfat: ${file}`)
      fixed++
    }
  }
}

console.log(`Superfat fix applied to ${fixed} briefs`)
