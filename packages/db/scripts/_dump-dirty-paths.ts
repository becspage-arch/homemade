/**
 * Dump the text at each voice-check error path for batch44.
 * Usage: tsx scripts/_dump-dirty-paths.ts 2026-05-28-batch1
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const batchId = process.argv[2]
if (!batchId) {
  console.error('Usage: tsx scripts/_dump-dirty-paths.ts <batch-id>')
  process.exit(1)
}

const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

// Parse path like "body > paragraph[15] > text" or "body > bulletList[4] > listItem[1] > paragraph[0] > text" or "body > troubleshooter[13] > item[2] > fix" or "body > heading[0]"
function navigate(doc: any, pathStr: string): any {
  if (!doc?.body?.content) return null
  const segments = pathStr.split(' > ')
  let node: any = { content: doc.body.content }
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i]
    const m = seg.match(/^(\w+)(?:\[(\d+)\])?$/)
    if (!m) return null
    const [, type, idxStr] = m
    if (type === 'text') {
      const c = node.content?.find((x: any) => x.type === 'text')
      return c?.text ?? null
    }
    if (type === 'fix' || type === 'cause' || type === 'symptom') {
      return node[type] ?? null
    }
    if (idxStr === undefined) {
      // find by type
      const c = node.content?.find?.((x: any) => x.type === type)
      node = c
      if (!node) return null
      continue
    }
    const idx = parseInt(idxStr, 10)
    if (type === 'item') {
      node = node.items?.[idx]
      if (!node) return null
      continue
    }
    if (type === 'listItem') {
      node = node.content?.[idx]
      if (!node) return null
      continue
    }
    // generic: find idx-th node of given type within node.content
    let count = 0
    let found: any = null
    for (const c of node.content ?? []) {
      if (c.type === type) {
        if (count === idx) {
          found = c
          break
        }
        count++
      }
    }
    if (!found) return null
    node = found
  }
  return node
}

// We pre-parsed errors; quickest path: re-run voice-check ourselves.
import { runVoiceCheck } from './voice-check-lib.js'

for (const file of files) {
  const raw = readFileSync(resolve(batchDir, file), 'utf8')
  const data: any = JSON.parse(raw)
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  console.log(`\n=== ${file} (${report.errors.length} errors) ===`)
  for (const err of report.errors) {
    console.log(`[${err.kind}] ${err.path}`)
    const val = navigate(data, err.path)
    if (typeof val === 'string') {
      console.log(`  TEXT: ${val}`)
    } else if (val) {
      console.log(`  NODE: ${JSON.stringify(val).slice(0, 400)}`)
    } else {
      console.log(`  (could not resolve path)`)
    }
  }
}
