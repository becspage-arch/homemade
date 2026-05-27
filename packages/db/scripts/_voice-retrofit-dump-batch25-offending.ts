/**
 * Dump every offending paragraph across batch 25 dirty files, with full
 * locator and original text. One read pass, then the worker can rewrite each.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface Offender {
  slug: string
  errors: { kind: string; message: string; path: string }[]
  paragraphs: { path: string; text: string }[]
}

// Walk and locate a node by its path string like
//   "body > paragraph[14] > text" → paragraph[14] of body content
//   "body > bulletList[17] > listItem[1] > paragraph[0] > text"
//   "body > infoPanel[1] > body"
//   "body > troubleshooter[11] > item[0] > cause"
function flattenTextFromBlock(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(flattenTextFromBlock).join('')
  return ''
}

function locateText(body: any, path: string): string {
  // strip "body > "
  const segments = path.replace(/^body > /, '').split(' > ')
  let node: any = body
  for (const seg of segments) {
    if (!node) return ''
    const m = seg.match(/^(\w+)\[(\d+)\]$/)
    if (m) {
      const [, type, idxStr] = m
      const idx = Number(idxStr)
      // Attrs items list (troubleshooter / varieties / supplies / ingredientsList)
      if (type === 'item' && Array.isArray(node?.attrs?.items)) {
        node = node.attrs.items[idx]
        continue
      }
      // Otherwise: voice-check uses ABSOLUTE index in node.content
      if (Array.isArray(node?.content)) {
        node = node.content[idx]
        continue
      }
      return ''
    }
    // Non-indexed segment like "text", "body", "cause", "fix", "symptom", "intro", "heading"
    if (seg === 'text') {
      return flattenTextFromBlock(node)
    }
    if (seg === 'body' || seg === 'cause' || seg === 'fix' || seg === 'symptom' || seg === 'intro' || seg === 'heading' || seg === 'title' || seg === 'description' || seg === 'name' || seg === 'substitutions' || seg === 'prepNote') {
      // attrs string OR direct field for items[idx]
      if (node?.attrs && typeof node.attrs[seg] === 'string') return node.attrs[seg] as string
      if (typeof node?.[seg] === 'string') return node[seg] as string
      return ''
    }
  }
  return ''
}

function main() {
  const batchId = '2026-05-27-batch25'
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  if (!existsSync(batchDir)) {
    console.error('not found:', batchDir)
    process.exit(1)
  }
  const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort()
  const offenders: Offender[] = []
  for (const file of files) {
    const data = JSON.parse(readFileSync(resolve(batchDir, file), 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) continue
    const off: Offender = { slug: file.replace(/\.json$/, ''), errors: [], paragraphs: [] }
    for (const e of report.errors) {
      off.errors.push({ kind: e.kind, message: e.message, path: e.path })
      const text = locateText(data.body, e.path)
      off.paragraphs.push({ path: e.path, text })
    }
    offenders.push(off)
  }
  writeFileSync(
    resolve(batchDir, '_offending.json'),
    JSON.stringify(offenders, null, 2) + '\n',
    'utf8',
  )
  console.log(`Wrote _offending.json with ${offenders.length} offending files`)
  // Also print compact summary
  for (const o of offenders) {
    console.log(`\n=== ${o.slug} ===`)
    o.paragraphs.forEach((p, i) => {
      console.log(`-- ${o.errors[i].kind} @ ${p.path}`)
      console.log(p.text)
    })
  }
}

main()
