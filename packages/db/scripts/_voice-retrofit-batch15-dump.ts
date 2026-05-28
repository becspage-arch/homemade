/**
 * Dump all violating paragraph texts for batch15 so we can rewrite.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { runVoiceCheck, fleschKincaidGrade } from './voice-check-lib.js'

const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch15')
const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

function flatten(node: any): string {
  if (typeof node?.text === 'string') return node.text
  if (Array.isArray(node?.content)) return node.content.map(flatten).join('')
  return ''
}

/** Navigate a TipTap doc by "body > orderedList[5] > listItem[6] > paragraph[0] > text" style path. */
function resolvePath(body: any, path: string): { container: any; key: any; text: string } | null {
  // Strip leading "body > " and trailing " > text" / " > fix" / " > cause"
  const segments = path.split(' > ').slice(1) // drop 'body'
  let cur: any = body
  let lastIsText = false
  let containerForLeaf: any = null
  let leafKey: any = null
  for (const seg of segments) {
    if (seg === 'text') {
      lastIsText = true
      continue
    }
    const m = seg.match(/^(\w+)\[(\d+)\]$/)
    if (m) {
      const type = m[1]
      const idx = parseInt(m[2]!, 10)
      if (!cur || !Array.isArray(cur.content)) {
        // Some seg traverse not into content array — handled below
      }
      if (cur && Array.isArray(cur.content)) {
        cur = cur.content[idx]
      } else {
        return null
      }
    } else if (seg === 'symptom' || seg === 'cause' || seg === 'fix' || seg === 'intro') {
      // Troubleshooter field
      return { container: cur, key: seg, text: cur?.[seg] ?? '' }
    } else if (seg.startsWith('item[')) {
      const idx = parseInt(seg.match(/\[(\d+)\]/)![1]!, 10)
      cur = cur?.attrs?.items?.[idx]
    }
  }
  if (lastIsText) {
    return { container: cur, key: 'content', text: flatten(cur) }
  }
  return null
}

const out: any[] = []

for (const file of files) {
  const raw = readFileSync(resolve(batchDir, file), 'utf8')
  const data = JSON.parse(raw)
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  for (const err of report.errors) {
    const resolved = resolvePath(data.body, err.path)
    out.push({
      file,
      kind: err.kind,
      message: err.message,
      path: err.path,
      snippet: err.snippet,
      text: resolved?.text ?? '(could not resolve)',
      grade: resolved?.text ? fleschKincaidGrade(resolved.text) : null,
    })
  }
}

writeFileSync(resolve(batchDir, '_violations-dump.json'), JSON.stringify(out, null, 2) + '\n', 'utf8')
console.log(`Dumped ${out.length} violations to _violations-dump.json`)
for (const v of out) {
  console.log(`\n=== ${v.file} (${v.kind}, grade ${v.grade?.toFixed?.(1) ?? 'n/a'}) ===`)
  console.log(`path: ${v.path}`)
  console.log(`text: ${v.text}`)
}
