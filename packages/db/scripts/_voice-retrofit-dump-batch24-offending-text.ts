import { runVoiceCheck } from './voice-check-lib.js'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch24')
const files = readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_'))

function getTextFromPath(body: any, path: string): string {
  // Parse path like "body > paragraph[13] > text" or
  // "body > troubleshooter[11] > item[3] > fix" or
  // "body > bulletList[4] > listItem[1] > paragraph[0] > text" or
  // "body > infoPanel[3] > body"
  const parts = path.split(' > ').slice(1) // drop "body"
  let node: any = body
  for (const part of parts) {
    const m = part.match(/^(\w+)(?:\[(\d+)\])?$/)
    if (!m) return '[parse-fail]'
    const name = m[1]
    const idx = m[2] !== undefined ? Number(m[2]) : -1
    if (name === 'text') {
      // text leaf — flatten content
      function flat(n: any): string {
        if (typeof n?.text === 'string') return n.text
        if (Array.isArray(n?.content)) return n.content.map(flat).join('')
        return ''
      }
      return flat(node)
    }
    if (name === 'fix' || name === 'cause' || name === 'symptom' || name === 'body' || name === 'intro' || name === 'heading' || name === 'title' || name === 'description') {
      return node?.attrs?.[name] ?? '[missing attr]'
    }
    if (name === 'item') {
      node = node?.attrs?.items?.[idx]
      if (!node) return '[no item]'
      continue
    }
    if (name === 'paragraph' || name === 'heading' || name === 'blockquote') {
      // find idx-th child of node.content
      if (idx >= 0 && Array.isArray(node?.content)) {
        node = node.content[idx]
      }
      continue
    }
    if (name === 'bulletList' || name === 'orderedList' || name === 'troubleshooter' || name === 'infoPanel' || name === 'listItem') {
      if (idx >= 0 && Array.isArray(node?.content)) {
        node = node.content[idx]
      }
      continue
    }
    // Unknown — try child by index
    if (idx >= 0 && Array.isArray(node?.content)) {
      node = node.content[idx]
    }
  }
  // If we exited the loop without hitting 'text', dump
  function flat(n: any): string {
    if (typeof n?.text === 'string') return n.text
    if (Array.isArray(n?.content)) return n.content.map(flat).join('')
    return ''
  }
  return flat(node)
}

for (const f of files) {
  const raw = readFileSync(resolve(dir, f), 'utf8')
  const data = JSON.parse(raw)
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  console.log('============', f.replace('.json',''), '============')
  for (const err of report.errors) {
    console.log(`---\nPATH: ${err.path}\nKIND: ${err.kind}`)
    const text = getTextFromPath(data.body, err.path)
    console.log(`TEXT: ${text}`)
  }
  console.log()
}
