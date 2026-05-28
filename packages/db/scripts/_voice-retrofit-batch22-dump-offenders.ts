import { runVoiceCheck } from './voice-check-lib.js'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch22')
const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

function getNodeAtPath(root: any, path: string): any {
  // path like "body > paragraph[4] > text" - walk the doc looking up the
  // path segments. Each segment is "<nodeType>" or "<nodeType>[N]". We only
  // descend along content arrays.
  const parts = path.split(' > ').slice(1) // drop "body"
  let node = root
  for (const part of parts) {
    if (!node?.content) return undefined
    const m = part.match(/^([a-zA-Z]+)(?:\[(\d+)\])?$/)
    if (!m) return undefined
    const type = m[1]
    const idx = m[2] ? Number(m[2]) : 0
    const matching = node.content.filter((c: any) => c.type === type)
    node = matching[idx]
    if (!node) return undefined
  }
  return node
}

function textOf(node: any): string {
  if (!node) return ''
  if (node.type === 'text') return node.text ?? ''
  if (Array.isArray(node.content)) {
    return node.content.map(textOf).join('')
  }
  return ''
}

for (const f of files) {
  const raw = readFileSync(resolve(dir, f), 'utf8')
  const data = JSON.parse(raw)
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  console.log('\n=== ' + f.replace('.json', '') + ' ===')
  for (const err of report.errors) {
    console.log(`  ${err.kind} @ ${err.path}`)
    console.log(`    ${err.message}`)
    if (err.snippet) console.log(`    snippet: "${err.snippet}"`)
    const node = getNodeAtPath(data.body, err.path)
    if (node) {
      const t = textOf(node).replace(/\s+/g, ' ').trim()
      if (t) console.log(`    text: ${t.slice(0, 600)}`)
    }
  }
}
