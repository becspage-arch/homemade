/**
 * Dump every paragraph from a batch file with its index path and grade-level
 * score, so I can target rewrites precisely.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { fleschKincaidGrade } from './voice-check-lib.js'

const slug = process.argv[2]
const batchId = process.argv[3] ?? '2026-05-28-batch14'
if (!slug) {
  console.error('Usage: _voice-retrofit-paragraphs.ts <slug> [batch-id]')
  process.exit(1)
}
const root = resolve(process.cwd(), `../..`)
const file = resolve(root, `docs/voice-retrofit-${batchId}/${slug}.json`)
const data: any = JSON.parse(readFileSync(file, 'utf8'))

function walk(n: any, idx: string): void {
  if (!n || typeof n !== 'object') return
  if (n.type === 'paragraph' && Array.isArray(n.content)) {
    const text = n.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('')
    if (text) {
      const grade = fleschKincaidGrade(text)
      const gradeStr = grade !== null ? grade.toFixed(1) : 'n/a'
      console.log(`[${idx} g=${gradeStr}] ${text}`)
      console.log()
    }
  }
  if (Array.isArray(n.content)) n.content.forEach((c: any, i: number) => walk(c, `${idx}.${i}`))
}
data.body.content.forEach((c: any, i: number) => walk(c, String(i)))
