/**
 * Dump the text at each voice-check error path for a batch.
 * Path indices are POSITIONAL within parent.content (not type-counted).
 */
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const batchId = process.argv[2]
if (!batchId) {
  console.error('Usage: tsx scripts/_dump-dirty-paths-v2.ts <batch-id>')
  process.exit(1)
}

const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

function navigate(doc: any, pathStr: string): any {
  if (!doc?.body?.content) return null
  const segments = pathStr.split(' > ')
  let node: any = { content: doc.body.content }
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i]
    if (seg === 'text') {
      const t = node.content?.find((x: any) => x.type === 'text')
      return t?.text ?? null
    }
    const m = seg.match(/^(\w+)(?:\[(\d+)\])?$/)
    if (!m) return null
    const [, type, idxStr] = m
    if (type === 'fix' || type === 'cause' || type === 'symptom' || type === 'name') {
      return node[type] ?? null
    }
    if (idxStr === undefined) return null
    const idx = parseInt(idxStr, 10)
    if (type === 'item') {
      node = node.items?.[idx]
    } else if (type === 'listItem') {
      node = node.content?.[idx]
    } else {
      // POSITIONAL within parent.content
      node = node.content?.[idx]
    }
    if (!node) return null
  }
  return node
}

import { runVoiceCheck } from './voice-check-lib.js'

for (const file of files) {
  const raw = readFileSync(resolve(batchDir, file), 'utf8')
  const data: any = JSON.parse(raw)
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  console.log(`\n=== ${file} ===`)
  for (const err of report.errors) {
    console.log(`[${err.kind}] ${err.path}`)
    const val = navigate(data, err.path)
    if (typeof val === 'string') {
      console.log(`  TEXT: ${val}`)
    } else if (val) {
      console.log(`  NODE: ${JSON.stringify(val).slice(0, 600)}`)
    } else {
      console.log(`  (could not resolve)`)
    }
  }
}
