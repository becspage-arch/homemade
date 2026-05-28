/**
 * Extract offending paragraphs from each batch5 violator so the rewriter
 * sees them all at once.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
import { runVoiceCheck } from './voice-check-lib.js'

const BATCH_ID = '2026-05-28-batch5'

function textFromNode(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(textFromNode).join('')
  return ''
}

function nodeAtPath(body: any, path: string): any {
  // Path uses content-array indices (not same-type-sibling indices).
  // e.g. "body > paragraph[13]" means body.content[13] which must be a paragraph.
  // "body > bulletList[4] > listItem[2] > paragraph[0] > text" means
  // body.content[4] (bulletList) > content[2] (listItem) > content[0] (paragraph) > text leaf.
  let raw = path
  if (raw.endsWith(' > text')) raw = raw.slice(0, -' > text'.length)
  const parts = raw.split(' > ').slice(1) // drop the leading "body"
  let cur: any = body
  for (const seg of parts) {
    const m = seg.match(/^([a-zA-Z]+)\[(\d+)\]$/)
    if (!m) return null
    const [, , indexStr] = m
    const idx = parseInt(indexStr, 10)
    if (!cur || !Array.isArray(cur.content)) return null
    cur = cur.content[idx]
  }
  return cur
}

function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const dirPath = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)
  const files = readdirSync(dirPath).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

  const extractions: any[] = []

  for (const f of files) {
    const data = JSON.parse(readFileSync(resolve(dirPath, f), 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) continue

    const entries: any[] = []
    for (const err of report.errors) {
      const node = nodeAtPath(data.body, err.path)
      const text = node ? textFromNode(node) : '(node not resolved)'
      entries.push({ kind: err.kind, message: err.message, path: err.path, text })
    }
    extractions.push({ slug: data.slug, type: data.type, errors: entries })
  }

  writeFileSync(
    resolve(dirPath, '_violators.json'),
    JSON.stringify(extractions, null, 2) + '\n',
    'utf8',
  )
  console.log(`wrote _violators.json (${extractions.length} files)`)
}

main()
