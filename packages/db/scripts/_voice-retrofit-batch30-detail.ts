/**
 * Print each batch 30 error with the offending paragraph text so we know
 * exactly what to rewrite.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

import { runVoiceCheck, fleschKincaidGrade } from './voice-check-lib.js'

const BATCH_ID = '2026-05-27-batch30'

function flattenText(node: any): string {
  if (typeof node?.text === 'string') return node.text
  if (Array.isArray(node?.content)) return node.content.map(flattenText).join('')
  return ''
}

function getNodeAtPath(body: any, path: string): any {
  const m = path.match(/^body > ([a-zA-Z]+)\[(\d+)\](?: > (.+))?$/)
  if (!m) return null
  const type = m[1]
  const idx = parseInt(m[2]!, 10)
  if (!Array.isArray(body?.content)) return null
  const node = body.content[idx]
  if (!node || node.type !== type) return null
  return node
}

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

  for (const file of files) {
    const raw = readFileSync(resolve(batchDir, file), 'utf8')
    const data = JSON.parse(raw)
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) continue
    console.log(`\n=== ${data.slug} (${data._meta?.categorySlug}) ===`)
    for (const err of report.errors) {
      console.log(`  [${err.kind}] ${err.path}`)
      console.log(`     ${err.message}`)
      const node = getNodeAtPath(data.body, err.path.replace(/ > text$/, ''))
      if (node) {
        const t = flattenText(node)
        const grade = fleschKincaidGrade(t)
        console.log(`     text: ${t.slice(0, 300)}${t.length > 300 ? '…' : ''}`)
        if (grade !== null) console.log(`     grade: ${grade.toFixed(2)}`)
      }
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
