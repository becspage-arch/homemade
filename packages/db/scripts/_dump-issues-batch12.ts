/**
 * Dump just the (file, kind, path) tuples for batch12 so I can target rewrites.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
import { runVoiceCheck } from './voice-check-lib.js'

const batchId = '2026-05-28-batch12'
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

interface Issue {
  file: string
  kind: string
  path: string
  message: string
  text?: string
}

const issues: Issue[] = []

function findTextByPath(body: any, path: string): string | undefined {
  if (!path.startsWith('body > ')) return undefined
  // body > paragraph[N] > text
  const parts = path.replace(/^body > /, '').split(' > ')
  let node: any = body
  for (const p of parts) {
    if (p === 'text') {
      if (typeof node?.text === 'string') return node.text
      if (Array.isArray(node?.content)) {
        const t = node.content.find((c: any) => typeof c?.text === 'string')
        return t?.text
      }
      return undefined
    }
    const m = /^(\w+)\[(\d+)\]$/.exec(p)
    if (!m) return undefined
    const idx = Number(m[2])
    if (Array.isArray(node?.content)) {
      node = node.content[idx]
    } else if (Array.isArray(node?.attrs?.items)) {
      // troubleshooter, varietiesPanel, etc.
      node = node.attrs.items[idx]
    } else {
      return undefined
    }
    if (!node) return undefined
  }
  // Try a final text extraction
  if (typeof node?.text === 'string') return node.text
  if (typeof node?.fix === 'string') return node.fix
  if (typeof node?.cause === 'string') return node.cause
  if (typeof node?.symptom === 'string') return node.symptom
  if (Array.isArray(node?.content)) {
    const t = node.content.find((c: any) => typeof c?.text === 'string')
    return t?.text
  }
  return undefined
}

for (const file of files) {
  const raw = readFileSync(resolve(batchDir, file), 'utf8')
  const data: any = JSON.parse(raw)
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  for (const e of report.errors) {
    issues.push({
      file,
      kind: e.kind,
      path: e.path,
      message: e.message,
      text: findTextByPath(data.body, e.path),
    })
  }
}

writeFileSync(
  resolve(batchDir, '_issues.json'),
  JSON.stringify(issues, null, 2) + '\n',
  'utf8',
)
console.log(`[done] ${issues.length} issues across ${new Set(issues.map((i) => i.file)).size} files`)
