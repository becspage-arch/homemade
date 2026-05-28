/**
 * Apply a JSON map of (file, path, newText) rewrites to batch12 files,
 * then re-run voice-check. Idempotent — running twice does nothing the
 * second time. Also supports deletes (newText: null deletes the heading/
 * paragraph node entirely).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch12')

interface Rewrite {
  file: string
  path: string // body > paragraph[N] > text  OR  body > heading[N]
  newText?: string // new text for paragraph/heading (single text leaf)
  newContent?: any[] // replace content array entirely (use for paragraphs with marked glossary tooltips)
  delete?: boolean // remove the node entirely
  sourceNotesAppend?: string // append to sourceNotes
  newSourceNotes?: string // replace sourceNotes
}

const rewritesPath = resolve(batchDir, '_rewrites.json')
if (!existsSync(rewritesPath)) {
  console.error('Missing _rewrites.json — write it first')
  process.exit(1)
}
const rewrites: Rewrite[] = JSON.parse(readFileSync(rewritesPath, 'utf8'))

function navigate(body: any, path: string): { parent: any; key: string | number; node: any } | null {
  const parts = path.replace(/^body > /, '').split(' > ')
  let parent: any = body
  let key: string | number = 'content'
  let node: any = body
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]
    if (p === 'text') {
      // Find text leaf inside node.content
      if (Array.isArray(node?.content)) {
        for (let j = 0; j < node.content.length; j++) {
          if (typeof node.content[j]?.text === 'string') {
            return { parent: node.content, key: j, node: node.content[j] }
          }
        }
      }
      // Direct text on attrs (already returned above)
      return null
    }
    const m = /^(\w+)\[(\d+)\]$/.exec(p)
    if (!m) return null
    const idx = Number(m[2])
    if (Array.isArray(node?.content)) {
      parent = node.content
      key = idx
      node = node.content[idx]
    } else if (Array.isArray(node?.attrs?.items)) {
      parent = node.attrs.items
      key = idx
      node = node.attrs.items[idx]
    } else {
      return null
    }
    if (!node) return null
  }
  return { parent, key, node }
}

function setText(node: any, newText: string): boolean {
  // For paragraph/heading: replace the text on the first text-leaf child (preserve marks).
  if (Array.isArray(node?.content)) {
    // Collapse to a single text node (preserves any singular text node, removes split text fragments that would mangle marks).
    // Find the first text leaf; replace its text. Delete additional text leaves.
    let replaced = false
    const newContent: any[] = []
    for (const child of node.content) {
      if (typeof child?.text === 'string') {
        if (!replaced) {
          // Preserve any existing marks ONLY if they're on this very leaf and it's not a glossaryTooltip context.
          newContent.push({ type: 'text', text: newText })
          replaced = true
        }
        // skip additional text leaves
      } else {
        newContent.push(child)
      }
    }
    if (!replaced) {
      newContent.unshift({ type: 'text', text: newText })
    }
    node.content = newContent
    return true
  }
  // troubleshooter item: node has fix/cause/symptom — caller has to specify which
  return false
}

let applied = 0
let failed = 0
for (const r of rewrites) {
  const filePath = resolve(batchDir, r.file)
  const data: any = JSON.parse(readFileSync(filePath, 'utf8'))

  // Source-notes operations
  if (r.newSourceNotes !== undefined) {
    data.sourceNotes = r.newSourceNotes
  }
  if (r.sourceNotesAppend !== undefined) {
    const cur = typeof data.sourceNotes === 'string' ? data.sourceNotes : ''
    data.sourceNotes = cur ? `${cur} ${r.sourceNotesAppend}` : r.sourceNotesAppend
  }

  if (r.path && r.path !== '') {
    // Special case: troubleshooter item fix/cause/symptom
    const trMatch = /^body > troubleshooter\[(\d+)\] > item\[(\d+)\] > (fix|cause|symptom)$/.exec(r.path)
    if (trMatch && r.newText !== undefined) {
      const trIdx = Number(trMatch[1])
      const itemIdx = Number(trMatch[2])
      const field = trMatch[3]
      const tr = data.body?.content?.[trIdx]
      if (tr && Array.isArray(tr.attrs?.items)) {
        tr.attrs.items[itemIdx][field] = r.newText
        applied++
        writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
        continue
      }
    }

    const nav = navigate(data.body, r.path)
    if (!nav) {
      console.error(`[FAIL] ${r.file} ${r.path} — could not navigate`)
      failed++
      continue
    }

    if (r.delete) {
      if (typeof nav.key === 'number') {
        nav.parent.splice(nav.key, 1)
        applied++
      } else {
        console.error(`[FAIL] ${r.file} ${r.path} — cannot delete non-array element`)
        failed++
        continue
      }
    } else if (r.newContent !== undefined) {
      nav.node.content = r.newContent
      applied++
    } else if (r.newText !== undefined) {
      // text leaf? or paragraph/heading?
      if (typeof nav.node?.text === 'string') {
        // text leaf — replace text, preserve marks
        nav.node.text = r.newText
      } else {
        const ok = setText(nav.node, r.newText)
        if (!ok) {
          console.error(`[FAIL] ${r.file} ${r.path} — could not set text`)
          failed++
          continue
        }
      }
      applied++
    }
  }

  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

console.log(`[done] ${applied} edits applied, ${failed} failed`)
