import { runVoiceCheck } from './voice-check-lib.js'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch6')
const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

function extractText(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node.type === 'text' && node.text) return node.text
  if (node.text) return node.text
  if (node.content) return extractText(node.content)
  return ''
}

for (const f of files) {
  const data = JSON.parse(readFileSync(resolve(dir, f), 'utf8'))
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  console.log(`\n=== ${f}`)
  const body = data.body
  if (!body || !body.content) continue
  for (const e of report.errors) {
    console.log(`  [${e.kind}] ${e.message.slice(0, 100)}`)
    console.log(`    path: ${e.path}`)
    // Try to extract index
    const m = e.path.match(/^body > ([a-zA-Z]+)\[(\d+)\]/)
    if (m) {
      const blockType = m[1]
      const idx = Number(m[2])
      const node = body.content[idx]
      if (node) {
        const text = extractText(node).slice(0, 600)
        console.log(`    type: ${node.type}`)
        console.log(`    text: ${text}`)
      }
    }
  }
}
