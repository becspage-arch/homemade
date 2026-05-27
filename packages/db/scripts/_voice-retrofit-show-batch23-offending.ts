/**
 * For each batch23 file with voice-check errors, print the offending content.
 * Path format from voice-check-lib: `body > paragraph[N] > text`, `body >
 * orderedList[N] > listItem[M] > paragraph[0] > text`, etc. The bracketed
 * index is the index in the parent's content array — type name is decorative.
 */
import { runVoiceCheck } from './voice-check-lib.js'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch23')
const files = readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_'))

function flatten(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(flatten).join('')
  // Some custom blocks have .body / .fix / .cause as plain strings or arrays
  return ''
}

function resolveBlock(root: any, path: string): { node: any; subkey: string | null } {
  // path is like "body > paragraph[11] > text" or "body > troubleshooter[9] > item[0] > fix"
  // or "body > orderedList[5] > listItem[0] > paragraph[0] > text"
  // Strip leading "body > " — start in root.body
  const trimmed = path.replace(/^body\s*>\s*/, '')
  const parts = trimmed.split(/\s*>\s*/)
  let cur: any = root.body
  let subkey: string | null = null
  for (const part of parts) {
    const idxMatch = part.match(/^([a-zA-Z]+)\[(\d+)\]$/)
    if (idxMatch) {
      const expected = idxMatch[1]
      const idx = parseInt(idxMatch[2], 10)
      if (expected === 'item') {
        // troubleshooter / kitList / etc. — index into cur.items
        if (cur && Array.isArray(cur.items)) {
          cur = cur.items[idx]
          continue
        }
      }
      if (cur && Array.isArray(cur.content)) {
        cur = cur.content[idx]
      } else if (cur && Array.isArray(cur[expected])) {
        cur = cur[expected][idx]
      } else {
        return { node: null, subkey: null }
      }
    } else {
      // leaf accessor like "text", "fix", "body", "title"
      subkey = part
    }
  }
  return { node: cur, subkey }
}

for (const f of files) {
  const raw = readFileSync(resolve(dir, f), 'utf8')
  const data = JSON.parse(raw)
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue

  console.log(`\n=== ${f.replace('.json','')} (${report.errors.length} error(s)) ===`)
  for (const err of report.errors) {
    console.log(`  [${err.kind}] ${err.message}`)
    console.log(`  path: ${err.path}`)
    const { node, subkey } = resolveBlock(data, err.path)
    if (node) {
      let text = ''
      if (subkey && typeof node[subkey] === 'string') {
        text = node[subkey]
      } else if (subkey === 'text' || subkey === null) {
        text = flatten(node)
      } else if (subkey && node[subkey]) {
        text = JSON.stringify(node[subkey]).substring(0, 400)
      } else {
        text = flatten(node)
      }
      console.log(`  text: ${(text || '').substring(0, 700)}${(text || '').length > 700 ? '...' : ''}`)
    } else {
      console.log(`  (could not resolve node)`)
    }
    console.log('')
  }
}
