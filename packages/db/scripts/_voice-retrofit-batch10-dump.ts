/**
 * For batch10: dump offending paragraph text alongside its slug/path/grade
 * so the worker can write targeted rewrites.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck, fleschKincaidGrade } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function getNodeText(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(getNodeText).join('')
  return ''
}

function getAtPath(body: any, pathStr: string): any {
  const parts = pathStr.split(' > ').slice(1)
  let cur: any = body
  for (const part of parts) {
    const m = part.match(/^(\w+)\[(\d+)\]$/)
    if (m) {
      const [, , idxStr] = m
      cur = cur?.content?.[Number(idxStr)]
    } else if (part === 'text') {
      return cur
    } else if (part === 'fix' || part === 'cause' || part === 'symptom' || part === 'body' || part === 'title' || part === 'heading' || part === 'intro') {
      return cur?.attrs?.[part]
    } else {
      const m2 = part.match(/^item\[(\d+)\]$/)
      if (m2) cur = cur?.attrs?.items?.[Number(m2[1])]
    }
  }
  return cur
}

function main() {
  const batchId = '2026-05-28-batch10'
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort()
  for (const file of files) {
    const data = JSON.parse(readFileSync(resolve(batchDir, file), 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) continue
    console.log(`\n========== ${file}`)
    for (const err of report.errors) {
      console.log(`-- ${err.kind} @ ${err.path}`)
      const node = getAtPath(data.body, err.path)
      const text = typeof node === 'string' ? node : getNodeText(node)
      const grade = fleschKincaidGrade(text)
      console.log(`   grade ${grade?.toFixed(2) ?? 'n/a'}, words ${text.split(/\s+/).length}`)
      console.log(`   "${text}"`)
    }
  }
}

main()
