/**
 * Show the offending paragraphs for each voice-check violator in batch17.
 * Reads the same files, runs voice-check, and for every error prints the
 * actual text at the indicated path so we can rewrite efficiently.
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

function flatten(node: any): string {
  if (typeof node?.text === 'string') return node.text
  if (Array.isArray(node?.content)) return node.content.map(flatten).join('')
  return ''
}

function resolvePath(body: any, path: string): { text: string; node: any } | null {
  // path like "body > paragraph[11] > text" or "body > troubleshooter[10] > item[2] > fix"
  const parts = path.replace(/^body\s*>\s*/, '').split(/\s*>\s*/)
  let node: any = body
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const m = /^([a-zA-Z]+)\[(\d+)\]$/.exec(part)
    if (m && node && Array.isArray(node.content)) {
      const type = m[1]
      const idx = parseInt(m[2], 10)
      if (i === 0) {
        node = node.content[idx]
      } else {
        node = node.content[idx]
      }
      if (!node) return null
      continue
    }
    if (part === 'text') {
      return { text: flatten(node), node }
    }
    if (part.startsWith('item[')) {
      const m2 = /^item\[(\d+)\]$/.exec(part)
      if (m2 && node?.attrs?.items) {
        node = node.attrs.items[parseInt(m2[1], 10)]
      }
      continue
    }
    if (part === 'fix' || part === 'cause' || part === 'symptom') {
      return { text: String(node?.[part] ?? ''), node }
    }
    if (part === 'heading' || part === 'intro') {
      return { text: String(node?.attrs?.[part] ?? ''), node }
    }
    if (part === 'body' || part === 'title') {
      return { text: String(node?.attrs?.[part] ?? ''), node }
    }
  }
  return { text: flatten(node), node }
}

const batchId = process.argv[2] ?? '2026-05-28-batch17'
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
const files = readdirSync(batchDir).filter(f => f.endsWith('.json') && !f.startsWith('_'))

for (const file of files) {
  const raw = readFileSync(resolve(batchDir, file), 'utf8')
  const data: any = JSON.parse(raw)
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  console.log(`\n=== ${file} ===`)
  for (const e of report.errors) {
    const r = resolvePath(data.body, e.path)
    const snippet = r?.text ?? '(could not resolve)'
    console.log(`[${e.kind}] ${e.path}`)
    console.log(`  ${snippet.slice(0, 600).replace(/\n/g, ' ')}`)
  }
}
