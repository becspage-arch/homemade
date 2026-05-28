/**
 * Dump the offending paragraph text for each violation in batch9, so the
 * human worker can read the offender and write a rewrite. Includes both
 * the path locator and the raw text.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

import { runVoiceCheck } from './voice-check-lib.js'

const BATCH_ID = '2026-05-28-batch9'

function getByPath(body: any, pathStr: string): string | null {
  // path looks like: body > paragraph[13] > text
  // or              body > orderedList[6] > listItem[8] > paragraph[0] > text
  // or              body > troubleshooter[11] > item[2] > fix
  const parts = pathStr.split(' > ')
  if (parts[0] !== 'body') return null
  let node: any = body
  for (let i = 1; i < parts.length; i++) {
    const p = parts[i]
    if (!p) continue
    const m = /^(\w+)\[(\d+)\]$/.exec(p)
    if (m) {
      const [, type, idxStr] = m
      const idx = Number(idxStr)
      // find the idx-th child (index across the parent's content)
      if (!Array.isArray(node.content)) {
        if (type === 'item' && Array.isArray(node.attrs?.items)) {
          node = node.attrs.items[idx]
          continue
        }
        return null
      }
      node = node.content[idx]
      if (!node) return null
    } else if (p === 'text') {
      // flatten inline text
      if (typeof node.text === 'string') return node.text
      const flatten = (n: any): string => {
        if (!n) return ''
        if (typeof n.text === 'string') return n.text
        if (!Array.isArray(n.content)) return ''
        return n.content.map(flatten).join('')
      }
      return flatten(node)
    } else if (['fix', 'cause', 'symptom', 'intro', 'body', 'title', 'heading'].includes(p)) {
      // field on attrs
      return typeof node?.[p] === 'string' ? node[p] : null
    } else {
      return null
    }
  }
  if (typeof node?.text === 'string') return node.text
  // fall through: try to flatten
  const flatten = (n: any): string => {
    if (!n) return ''
    if (typeof n.text === 'string') return n.text
    if (!Array.isArray(n.content)) return ''
    return n.content.map(flatten).join('')
  }
  return flatten(node)
}

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  const files = readdirSync(batchDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .sort()

  for (const f of files) {
    const data = JSON.parse(readFileSync(resolve(batchDir, f), 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) continue
    console.log(`\n=== ${f} ===`)
    for (const e of report.errors) {
      const text = getByPath(data.body, e.path)
      console.log(`  [${e.kind}] ${e.path}`)
      console.log(`  msg: ${e.message}`)
      if (text) {
        console.log(`  TEXT: ${text.replace(/\n/g, ' ')}`)
      } else {
        console.log(`  TEXT: <unresolved>`)
      }
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
