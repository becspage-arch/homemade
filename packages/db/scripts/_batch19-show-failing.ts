/**
 * Print the offending paragraph text + a few surrounding paragraphs from
 * each failing voice-check file so we can rewrite them.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runVoiceCheck, fleschKincaidGrade } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch19')

const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

function flattenInline(node: any): string {
  if (typeof node?.text === 'string') return node.text
  if (Array.isArray(node?.content)) return node.content.map(flattenInline).join('')
  return ''
}

for (const file of files) {
  const data = JSON.parse(readFileSync(resolve(batchDir, file), 'utf8'))
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue

  console.log(`\n\n===== ${file} =====`)
  const body = data.body
  if (!body?.content) continue

  for (const err of report.errors) {
    const m = /^body > paragraph\[(\d+)\] > text$/.exec(err.path)
    if (!m) {
      console.log(`SKIPPED (non-paragraph): ${err.path}  -- ${err.message}`)
      continue
    }
    const idx = Number(m[1])
    const node = body.content[idx]
    const text = flattenInline(node)
    const grade = fleschKincaidGrade(text)
    console.log(`\n--- paragraph[${idx}] (grade ${grade?.toFixed(1)}) ---`)
    console.log(text)
  }
}
