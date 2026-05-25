/**
 * Inspect each pilot file: print a tree of body block types + counts +
 * truncated text. Quick way to verify nothing critical was deleted.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const pilotDir = resolve(worktreeRoot, 'docs/voice-pilot-2026-05-25')

function walk(node: any, depth: number, lines: string[]): void {
  if (!node) return
  const pad = '  '.repeat(depth)
  if (node.type === 'paragraph' || node.type === 'heading') {
    const t = (node.content || []).map((c: any) => c.text || '').join('')
    const lvl = node.type === 'heading' ? `H${node.attrs?.level || 2}` : 'p'
    lines.push(`${pad}${lvl}: ${t.slice(0, 100)}${t.length > 100 ? '...' : ''}`)
  } else if (node.type === 'orderedList') {
    lines.push(`${pad}orderedList [${(node.content || []).length} items]`)
    ;(node.content || []).forEach((li: any) => walk(li, depth + 1, lines))
  } else if (node.type === 'listItem') {
    ;(node.content || []).forEach((c: any) => walk(c, depth, lines))
  } else if (node.type === 'bulletList') {
    lines.push(`${pad}bulletList [${(node.content || []).length} items]`)
    ;(node.content || []).forEach((li: any) => walk(li, depth + 1, lines))
  } else if (node.type === 'ingredientsList') {
    lines.push(`${pad}ingredientsList [${(node.attrs?.items || []).length} items]`)
  } else if (node.type === 'infoPanel') {
    lines.push(`${pad}infoPanel "${node.attrs?.title || '(no title)'}" tone=${node.attrs?.tone || ''}`)
  } else if (node.type === 'troubleshooter') {
    const items = node.attrs?.items?.length || node.attrs?.entries?.length || 0
    lines.push(`${pad}troubleshooter [${items} items]`)
  } else if (node.type === 'suppliesCard') {
    lines.push(`${pad}suppliesCard [${(node.attrs?.items || []).length} items]`)
  } else if (node.content) {
    lines.push(`${pad}${node.type || 'unknown'}`)
    ;(node.content || []).forEach((c: any) => walk(c, depth + 1, lines))
  }
}

function countWords(node: any): number {
  if (!node) return 0
  let n = 0
  if (node.text) n += node.text.split(/\s+/).filter(Boolean).length
  if (node.content) for (const c of node.content) n += countWords(c)
  // include attribute bodies
  if (node.attrs) {
    for (const key of ['body', 'intro', 'heading', 'title']) {
      const v = node.attrs[key]
      if (typeof v === 'string') n += v.split(/\s+/).filter(Boolean).length
    }
    if (Array.isArray(node.attrs.items)) {
      for (const it of node.attrs.items) {
        for (const key of ['name', 'symptom', 'cause', 'fix', 'description']) {
          const v = it?.[key]
          if (typeof v === 'string') n += v.split(/\s+/).filter(Boolean).length
        }
      }
    }
  }
  return n
}

const files = readdirSync(pilotDir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort()
for (const file of files) {
  const data = JSON.parse(readFileSync(resolve(pilotDir, file), 'utf8'))
  const lines: string[] = []
  walk(data.body, 0, lines)
  const wc = countWords(data.body)
  console.log(`\n=== ${basename(file)} (${wc} body words) ===`)
  for (const l of lines) console.log(l)
}
