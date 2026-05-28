/**
 * Dump the offending text for each voice-check error in batch7.
 * Path segments use literal node indices in the parent's content array.
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

const BATCH_ID = '2026-05-28-batch7'
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
const files = readdirSync(batchDir).filter(f => f.endsWith('.json') && !f.startsWith('_'))

function getTextFromNode(node: any): string {
  if (!node) return ''
  if (Array.isArray(node.content)) {
    return node.content.map((c: any) => c.text ?? getTextFromNode(c)).join('')
  }
  return node.text ?? ''
}

function navigate(body: any, pathStr: string): any {
  // path like "body > paragraph[12] > text"
  // or "body > orderedList[5] > listItem[0] > paragraph[0] > text"
  // or "body > troubleshooter[11] > item[3] > fix"
  const segs = pathStr.split(' > ').slice(1) // drop "body"
  let node: any = body
  for (const seg of segs) {
    const m = seg.match(/^([a-zA-Z]+)(?:\[(.+)\])?$/)
    if (!m) return null
    const kind = m[1]
    const idxRaw = m[2]

    if (kind === 'text') {
      return getTextFromNode(node)
    }

    if (kind === 'item') {
      // troubleshooter items live at node.attrs.items[idx]
      const idx = parseInt(idxRaw!, 10)
      node = node?.attrs?.items?.[idx]
      if (!node) return null
      continue
    }

    if (kind === 'fix' || kind === 'cause' || kind === 'symptom') {
      return node?.[kind] ?? ''
    }

    // Direct index into content array
    const idx = idxRaw != null ? parseInt(idxRaw, 10) : 0
    if (Array.isArray(node?.content) && node.content[idx]) {
      node = node.content[idx]
      continue
    }
    return null
  }
  return node
}

for (const file of files) {
  const raw = readFileSync(resolve(batchDir, file), 'utf8')
  const data = JSON.parse(raw)
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue

  console.log(`\n=== ${file} ===`)
  for (const e of report.errors) {
    const text = navigate(data.body, e.path)
    console.log(`[${e.kind}] ${e.path}`)
    console.log(`  msg: ${e.message}`)
    if (e.snippet) console.log(`  snippet: "${e.snippet}"`)
    if (typeof text === 'string') {
      console.log(`  TEXT: ${text}`)
    } else {
      console.log(`  NODE: ${JSON.stringify(text).slice(0, 800)}`)
    }
    console.log()
  }
}
