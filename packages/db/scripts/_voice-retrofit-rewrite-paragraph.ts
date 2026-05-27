/**
 * Tool for rewriting a single paragraph in a batch JSON file.
 *
 * Usage:
 *   FILE=path.json PATH_SPEC="body > paragraph[11]" NEW_TEXT="..." tsx _voice-retrofit-rewrite-paragraph.ts
 *
 * Replaces the content[] of the matched paragraph with split text nodes,
 * each marked {"type":"text", "text": "..."}, preserving the parent node's
 * other attrs. NEW_TEXT may contain literal "\n\n" to indicate a paragraph
 * break; in that case the original paragraph is replaced with multiple
 * paragraphs.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const FILE = process.env.FILE
const PATH_SPEC = process.env.PATH_SPEC
const NEW_TEXT = process.env.NEW_TEXT
if (!FILE || !PATH_SPEC || !NEW_TEXT) {
  console.error('FILE, PATH_SPEC, NEW_TEXT env vars required')
  process.exit(1)
}

const data = JSON.parse(readFileSync(FILE, 'utf8'))

function navigate(body: any, pathSpec: string): { parent: any[]; index: number } | null {
  const segments = pathSpec.split(' > ').slice(1)
  let cur: any = body
  let parent: any[] | null = null
  let index = -1
  for (const seg of segments) {
    const m = seg.match(/^(\w+)\[(\d+)\]$/)
    if (!m) return null
    const idx = parseInt(m[2]!, 10)
    if (!cur || !Array.isArray(cur.content)) return null
    parent = cur.content
    index = idx
    cur = cur.content[idx]
  }
  if (!parent || index < 0) return null
  return { parent, index }
}

const loc = navigate(data.body, PATH_SPEC)
if (!loc) {
  console.error(`could not navigate to ${PATH_SPEC}`)
  process.exit(1)
}

const original = loc.parent[loc.index]
const targetType = original?.type ?? 'paragraph'

// Split NEW_TEXT on literal "\n\n" or actual newlines into paragraphs.
const paragraphs = NEW_TEXT.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)

const newNodes = paragraphs.map((paraText) => ({
  type: targetType,
  content: [{ type: 'text', text: paraText }],
}))

loc.parent.splice(loc.index, 1, ...newNodes)

writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8')
console.log(`[rewrite] ${FILE} :: ${PATH_SPEC} :: replaced ${paragraphs.length === 1 ? '1 paragraph' : `1→${paragraphs.length} paragraphs`}`)
