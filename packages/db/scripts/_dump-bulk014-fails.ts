/**
 * Dump the text of failing paragraphs from bulk-014 files.
 * Shows the actual content so we can rewrite it.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/sustainability-bulk-014-briefs')

// Only failing pre-existing files (01-24) and 40
const targetFiles = process.argv[2] ? [process.argv[2]] : readdirSync(batchDir)
  .filter(f => f.endsWith('.json') && !f.startsWith('_'))
  .filter(f => {
    const n = parseInt(f.split('-')[0], 10)
    return (n >= 1 && n <= 24) || n === 40
  })
  .sort()

function extractTextFromNode(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) {
    return node.content.map((c: any) => extractTextFromNode(c)).join('')
  }
  return ''
}

function getNodeByPath(body: any, path: string): any {
  // path like "paragraph[1]" or "bulletList[3] > listItem[2] > paragraph[0]"
  const parts = path.replace(/^body > /, '').split(' > ')
  let current = body
  for (const part of parts) {
    const m = part.match(/^(\w+)\[(\d+)\]$/)
    if (!m) return null
    const [, , idxStr] = m
    const idx = parseInt(idxStr, 10)
    if (Array.isArray(current?.content)) {
      current = current.content[idx]
    } else {
      return null
    }
  }
  return current
}

for (const file of targetFiles) {
  const path = resolve(batchDir, file)
  const raw = readFileSync(path, 'utf8')
  let data: any
  try { data = JSON.parse(raw) } catch { continue }

  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue

  const gradeErrors = report.errors.filter((e: any) => e.kind === 'grade-level' || e.kind === 'medical-claim' || e.kind === 'banned-phrase' || e.kind === 'price-mention' || e.kind === 'raw-hours' || e.kind === 'institutional-in-body')
  if (gradeErrors.length === 0) continue

  console.log(`\n=== ${file} ===`)
  for (const e of gradeErrors) {
    console.log(`[${e.kind}] ${e.path}`)
    if (e.path.includes('>')) {
      const node = getNodeByPath(data.body, e.path)
      if (node) {
        const text = extractTextFromNode(node)
        console.log(`  TEXT: "${text.slice(0, 200)}"`)
      }
    } else if (e.path === 'excerpt') {
      console.log(`  TEXT: "${data.excerpt?.slice(0, 200)}"`)
    }
  }
}
