/**
 * Print the offending paragraph text for each file in
 * docs/voice-retrofit-2026-05-27-batch33/ that voice-check flags. Path is
 * already in the voice-check output; this script resolves the path back to
 * the actual node and prints the .text. Used to scope the rewrite to only
 * the paragraphs that fail (don't over-prune).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function flattenInline(node: any): string {
  if (typeof node?.text === 'string') return node.text
  if (!Array.isArray(node?.content)) return ''
  return node.content.map(flattenInline).join('')
}

function resolvePath(body: any, path: string): string {
  // Path format: "body > paragraph[13] > text" or "body > bulletList[15] > listItem[1] > paragraph[0] > text"
  // OR ".. > orderedList[5] > listItem[0] > paragraph[0] > text"
  const parts = path.split(' > ').slice(1) // drop "body"
  let node: any = body
  for (const part of parts) {
    if (part === 'text') return flattenInline(node)
    const m = part.match(/^([a-zA-Z]+)\[(\d+)\]$/)
    if (!m) continue
    const [, type, idxStr] = m
    const idx = parseInt(idxStr!, 10)
    if (type === 'listItem') {
      node = node?.content?.[idx]
      continue
    }
    // Find the idx-th child of `type` (the path indices count siblings within the same parent by occurrence count? actually the path uses the index in parent.content)
    node = node?.content?.[idx]
  }
  return flattenInline(node)
}

function main() {
  const batchId = process.argv[2] ?? '2026-05-27-batch33'
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  const files = readdirSync(batchDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .sort()
  for (const file of files) {
    const data = JSON.parse(readFileSync(resolve(batchDir, file), 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) continue
    console.log(`\n=== ${file} ===`)
    for (const e of report.errors) {
      const text = resolvePath(data.body, e.path)
      console.log(`[${e.kind}] ${e.path}`)
      console.log(`  ${text}`)
    }
  }
}

main()
