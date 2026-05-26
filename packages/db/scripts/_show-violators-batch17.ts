/**
 * One-off: print full text of every voice-check violator paragraph in batch 17,
 * with stable JSON Pointer paths, so the worker can rewrite in place.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { runVoiceCheck } from './voice-check-lib.js'

const batchId = '2026-05-26-batch17'
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
const files = readdirSync(batchDir).filter(f => f.endsWith('.json') && !f.startsWith('_'))

function flattenInline(node: any): string {
  if (typeof node?.text === 'string') return node.text
  if (!Array.isArray(node?.content)) return ''
  return node.content.map(flattenInline).join('')
}

// Walk the body matching the voice-check-lib path format and return the node + path mapping.
// Path like "body > paragraph[15] > text" means body.content[15] if all blocks are paragraphs.
// We need to map by index of nodeLabel in walkBlock.
function collectPaths(doc: any): Map<string, { text: string; node: any }> {
  const out = new Map<string, { text: string; node: any }>()
  if (!doc?.content) return out
  doc.content.forEach((node: any, idx: number) => {
    walkBlock(node, `body > ${node.type ?? 'unknown'}[${idx}]`, out)
  })
  return out
}

function walkBlock(node: any, path: string, out: Map<string, { text: string; node: any }>) {
  const type = node.type ?? ''
  switch (type) {
    case 'paragraph':
    case 'heading':
    case 'blockquote': {
      const text = flattenInline(node)
      if (text) out.set(`${path} > text`, { text, node })
      return
    }
    case 'bulletList':
    case 'orderedList': {
      const items = node.content ?? []
      items.forEach((li: any, idx: number) => {
        const liPath = `${path} > listItem[${idx}]`
        if (Array.isArray(li.content)) {
          li.content.forEach((child: any, j: number) => {
            walkBlock(child, `${liPath} > ${child.type ?? 'unknown'}[${j}]`, out)
          })
        }
      })
      return
    }
    case 'troubleshooter': {
      const a = node.attrs ?? {}
      const items = Array.isArray(a.items) ? a.items : []
      items.forEach((it: any, idx: number) => {
        if (it.symptom) out.set(`${path} > item[${idx}] > symptom`, { text: it.symptom, node: { kind: 'troubleshooter-symptom', idx } })
        if (it.cause) out.set(`${path} > item[${idx}] > cause`, { text: it.cause, node: { kind: 'troubleshooter-cause', idx } })
        if (it.fix) out.set(`${path} > item[${idx}] > fix`, { text: it.fix, node: { kind: 'troubleshooter-fix', idx } })
      })
      return
    }
    default: {
      if (Array.isArray(node.content)) {
        node.content.forEach((child: any, j: number) => {
          walkBlock(child, `${path} > ${child.type ?? 'unknown'}[${j}]`, out)
        })
      }
      return
    }
  }
}

for (const file of files) {
  const raw = readFileSync(resolve(batchDir, file), 'utf8')
  const data = JSON.parse(raw)
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue

  console.log(`\n=== ${file} ===`)
  const lookup = collectPaths(data.body)
  for (const err of report.errors) {
    const entry = lookup.get(err.path)
    console.log(`  [${err.kind}] ${err.message}`)
    console.log(`  path: ${err.path}`)
    if (entry) {
      console.log(`  text: ${entry.text}`)
    } else {
      console.log(`  text: <not located>`)
    }
    console.log('')
  }
}
