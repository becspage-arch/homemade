/**
 * Print the text of every flagged paragraph across a batch directory, with the
 * path so the worker can locate it. Also pulls the surrounding context (the
 * preceding heading if any) for orientation.
 *
 * Usage:
 *   tsx scripts/_voice-batch-show-violators.ts docs/voice-retrofit-<batch-id>
 */
import { readdirSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function findText(body: any, path: string): string | null {
  if (!body || !Array.isArray(body.content)) return null
  // Parse a path like 'body > paragraph[11] > text' or
  // 'body > orderedList[5] > listItem[1] > paragraph[0] > text' or
  // 'body > troubleshooter[9] > item[3] > fix' or
  // 'body > heading[0]'
  const parts = path.split(' > ').slice(1) // drop 'body'
  let current: any = body
  let idx = 0
  while (idx < parts.length) {
    const part = parts[idx]
    if (part === 'text') {
      const text = (current.content ?? []).map((c: any) => c.text ?? '').join('')
      return text
    }
    const m = /^(\w+)\[(\d+)\]$/.exec(part)
    if (m) {
      const [, t, n] = m
      const i = Number.parseInt(n, 10)
      if (current.content) {
        current = current.content[i]
      } else if (current.attrs?.items) {
        current = current.attrs.items[i]
      }
      idx++
      continue
    }
    // It's a literal field like 'fix', 'cause', 'symptom', 'description', etc.
    if (current && typeof current === 'object') {
      const v = current[part]
      if (typeof v === 'string') return v
      if (v && typeof v === 'object' && Array.isArray(v.content)) {
        const text = v.content.map((c: any) => c.text ?? '').join('')
        return text
      }
    }
    idx++
  }
  return null
}

function precedingHeading(body: any, paragraphIdx: number): string | null {
  if (!body || !Array.isArray(body.content)) return null
  for (let i = paragraphIdx - 1; i >= 0; i--) {
    const node = body.content[i]
    if (node && node.type === 'heading') {
      const txt = (node.content ?? []).map((c: any) => c.text ?? '').join('')
      return txt
    }
  }
  return null
}

function main() {
  const argDir = process.argv[2]
  if (!argDir) {
    console.error('Usage: tsx _voice-batch-show-violators.ts <batch-dir>')
    process.exit(2)
  }
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, argDir)
  const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

  for (const file of files) {
    const full = resolve(batchDir, file)
    const raw = readFileSync(full, 'utf8')
    const data = JSON.parse(raw)
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) continue
    console.log(`\n=== ${data.slug ?? file} ===`)
    for (const err of report.errors) {
      const text = findText(data.body, err.path)
      const m = /paragraph\[(\d+)\]/.exec(err.path)
      const idx = m ? Number.parseInt(m[1], 10) : -1
      const heading = idx >= 0 ? precedingHeading(data.body, idx) : null
      console.log(`  [${err.kind}] ${err.path}`)
      if (heading) console.log(`    under heading: ${heading}`)
      console.log(`    msg: ${err.message}`)
      if (text) console.log(`    text: ${text}`)
    }
  }
}

main()
