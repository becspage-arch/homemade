/**
 * Extract the exact prose for paragraphs flagged by voice-check for batch20.
 * Reads docs/voice-retrofit-2026-05-28-batch20/, runs voice-check,
 * and for each error prints the paragraph index, current grade, and the
 * exact text.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck, fleschKincaidGrade } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch20')
const files = readdirSync(batchDir).filter(f => f.endsWith('.json') && !f.startsWith('_'))

for (const file of files) {
  const raw = readFileSync(resolve(batchDir, file), 'utf8')
  const data: any = JSON.parse(raw)
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue

  console.log(`\n=== ${file} ===`)
  // Map path -> text from the body
  const body = data.body
  function walk(node: any, prefix: string, idx: number): void {
    if (!node) return
    if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'blockquote') {
      // pull the flat text
      let text = ''
      function inner(n: any): void {
        if (!n) return
        if (typeof n.text === 'string') text += n.text
        if (Array.isArray(n.content)) n.content.forEach(inner)
      }
      inner(node)
      const path = `body > ${node.type}[${idx}] > text`
      const hit = report.errors.find((e) => e.path === path)
      if (hit) {
        const grade = fleschKincaidGrade(text)
        console.log(`-- ${path} [grade=${grade?.toFixed(1) ?? 'n/a'}] kind=${hit.kind}`)
        console.log(JSON.stringify(text))
      }
    }
    if (Array.isArray(node.content)) {
      node.content.forEach((c: any, i: number) => walk(c, '', i))
    }
  }
  walk(body, '', 0)
}
