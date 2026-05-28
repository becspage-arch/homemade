/**
 * Dump the full text of each failing paragraph in batch46 (2026-05-28-batch3)
 * so we can see what needs rewriting.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

import { runVoiceCheck } from './voice-check-lib.js'

const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch3')
const files = readdirSync(batchDir).filter(f => f.endsWith('.json') && !f.startsWith('_'))

function getNode(body: any, pathStr: string): any {
  // path like: body > paragraph[11] > text
  const parts = pathStr.replace(/^body\s*>\s*/, '').split(/\s*>\s*/)
  let cur: any = body
  for (const part of parts) {
    const m = part.match(/^(\w+)\[(\d+)\]$/)
    if (m) {
      const idx = parseInt(m[2], 10)
      if (Array.isArray(cur?.content)) cur = cur.content[idx]
    } else if (part === 'text') {
      // text leaves are inside content[]
      if (Array.isArray(cur?.content)) {
        return cur.content.map((c: any) => c.text ?? '').join('')
      }
    }
    if (!cur) return null
  }
  return cur
}

for (const file of files) {
  const raw = readFileSync(resolve(batchDir, file), 'utf8')
  const data = JSON.parse(raw)
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  console.log(`\n=== ${file} ===`)
  for (const e of report.errors) {
    console.log(`[${e.kind}] ${e.message}`)
    console.log(`  path: ${e.path}`)
    const node = getNode(data.body, e.path)
    if (typeof node === 'string') {
      console.log(`  TEXT: ${node}`)
    } else if (node && typeof node === 'object') {
      const flat = (function flatten(n: any): string {
        if (typeof n?.text === 'string') return n.text
        if (Array.isArray(n?.content)) return n.content.map(flatten).join('')
        return ''
      })(node)
      if (flat) console.log(`  TEXT: ${flat}`)
      else console.log(`  NODE: ${JSON.stringify(node).slice(0, 300)}`)
    }
  }
}
