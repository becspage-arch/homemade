/**
 * Show the exact text of every voice-check error in a batch.
 * Usage: tsx scripts/_show-voice-issues.ts <batch-id>
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

const batchId = process.argv[2]
if (!batchId) { console.error('Usage: tsx scripts/_show-voice-issues.ts <batch-id>'); process.exit(1) }

const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
const files = readdirSync(batchDir).filter(f => f.endsWith('.json') && !f.startsWith('_'))

function plainText(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(plainText).join('')
  if (typeof node.text === 'string') return node.text
  if (node.content) return plainText(node.content)
  return ''
}

// Resolve a path string like `body > paragraph[14] > text` or
// `body > troubleshooter[13] > item[0] > fix` or
// `body > bulletList[2] > listItem[1] > paragraph[0] > text` or
// `body > infoPanel[1] > body` to its containing node + flavour.
function resolvePath(doc: any, path: string): { text: string; node: any } | null {
  const body = doc.body
  if (!body || !Array.isArray(body.content)) return null
  const parts = path.split(' > ').slice(1) // drop leading "body"

  let cursor: any = body
  for (const part of parts) {
    if (!cursor) return null
    // Form: <type>[<idx>] (drilling into content array)
    const m = part.match(/^([a-zA-Z]+)\[(\d+)\]$/)
    if (m) {
      const [, type, idxStr] = m
      const idx = parseInt(idxStr, 10)
      // For top-level body.content, index is into the content array.
      if (Array.isArray(cursor.content)) {
        cursor = cursor.content[idx]
        continue
      }
      // For troubleshooter / varietiesPanel item[idx] — items live under attrs.items.
      if (cursor?.attrs?.items && Array.isArray(cursor.attrs.items)) {
        cursor = cursor.attrs.items[idx]
        continue
      }
      return null
    }
    // Form: plain word — text / body / fix / cause / etc.
    if (part === 'text') {
      cursor = plainText(cursor.content)
      continue
    }
    if (part === 'body') {
      cursor = cursor.attrs?.body ?? cursor.body ?? null
      continue
    }
    if (part === 'fix' || part === 'cause' || part === 'symptom') {
      cursor = cursor?.[part] ?? null
      continue
    }
    if (part === 'intro' || part === 'description' || part === 'heading' || part === 'title') {
      cursor = cursor?.attrs?.[part] ?? null
      continue
    }
    return null
  }
  if (typeof cursor === 'string') return { text: cursor, node: cursor }
  return { text: plainText(cursor), node: cursor }
}

for (const file of files) {
  const raw = readFileSync(resolve(batchDir, file), 'utf8')
  let data: any
  try { data = JSON.parse(raw) } catch { continue }
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  console.log(`\n=== ${file} (${report.errors.length} errors) ===`)
  for (const err of report.errors) {
    console.log(`  [${err.kind}] ${err.message}`)
    console.log(`    path: ${err.path}`)
    const r = resolvePath(data, err.path)
    if (r) console.log(`    text: ${r.text}`)
    else console.log(`    text: (could not resolve)`)
    if (err.snippet) console.log(`    snippet: ${err.snippet}`)
  }
}
