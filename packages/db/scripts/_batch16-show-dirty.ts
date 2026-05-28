/**
 * Print the offending text snippet for each error in each dirty file.
 * Usage: tsx scripts/_batch16-show-dirty.ts <batch-id>
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

const batchId = process.argv[2] ?? '2026-05-28-batch16'
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
const files = readdirSync(batchDir).filter(f => f.endsWith('.json') && !f.startsWith('_'))

function flattenInline(node: any): string {
  if (typeof node?.text === 'string') return node.text
  if (!Array.isArray(node?.content)) return ''
  return node.content.map(flattenInline).join('')
}

function getNodeAtPath(body: any, path: string): { text: string; node: any } | null {
  // path looks like "body > paragraph[13] > text" or "body > troubleshooter[5] > item[0] > cause"
  // or "body > orderedList[5] > listItem[1] > paragraph[0] > text"
  const parts = path.split(' > ').slice(1) // drop initial "body"
  let node = body
  for (const part of parts) {
    if (!node) return null
    const m = /^(\w+)\[(\d+)\]$/.exec(part)
    if (m) {
      const type = m[1]
      const idx = parseInt(m[2]!, 10)
      if (type === 'item') {
        // troubleshooter item
        const items = node?.attrs?.items
        if (Array.isArray(items)) node = items[idx]
        else node = null
      } else if (type === 'listItem') {
        node = node?.content?.[idx]
      } else {
        // paragraph[n], heading[n], etc. - index into content
        node = node?.content?.[idx]
      }
    } else if (part === 'text') {
      return { text: flattenInline(node), node }
    } else if (part === 'fix' || part === 'symptom' || part === 'cause' || part === 'body' || part === 'title' || part === 'attribution' || part === 'quote') {
      return { text: (node?.[part] ?? node?.attrs?.[part] ?? '') as string, node }
    }
  }
  if (node) return { text: flattenInline(node), node }
  return null
}

for (const file of files) {
  const raw = readFileSync(resolve(batchDir, file), 'utf8')
  const data = JSON.parse(raw)
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  console.log(`\n=== ${file} ===`)
  for (const e of report.errors) {
    console.log(`  [${e.kind}] ${e.path}`)
    console.log(`  Message: ${e.message}`)
    const found = getNodeAtPath(data.body, e.path)
    if (found) {
      console.log(`  TEXT: ${found.text.slice(0, 600).replace(/\n/g, ' ')}`)
    } else {
      console.log(`  TEXT: (could not resolve path)`)
    }
  }
}
