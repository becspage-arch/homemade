/**
 * Detailed voice-check report for files with errors in batch27.
 * Prints the offending paragraph text alongside the rule that fired.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch27')
const files = readdirSync(batchDir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort()

function findNodeAtPath(body: any, path: string): string {
  if (!body) return ''
  const match = path.match(/body > (\w+)\[(\d+)\](?:.*)?/)
  if (!match) return ''
  const [_, type, idxStr] = match
  const content = body.content || []
  for (let i = 0; i < content.length; i++) {
    const node = content[i]
    if (node?.type === type) {
      if (i === Number(idxStr)) {
        const text = (node.content || []).map((c: any) => c.text || '').join('')
        return text
      }
    }
  }
  return ''
}

function flatten(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(flatten).join('')
  return ''
}

function findAllParas(body: any, target: string): { path: string; text: string } | null {
  if (!body?.content) return null
  for (let i = 0; i < body.content.length; i++) {
    const node = body.content[i]
    if (node?.type === 'paragraph' || node?.type === 'heading') {
      const t = flatten(node)
      if (t === target) {
        return { path: `body > ${node.type}[${i}]`, text: t }
      }
    }
  }
  return null
}

for (const file of files) {
  const data = JSON.parse(readFileSync(resolve(batchDir, file), 'utf8'))
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue
  console.log(`\n=========================================`)
  console.log(`FILE: ${file}`)
  console.log(`=========================================`)
  for (const e of report.errors) {
    console.log(`\n[${e.kind}] ${e.message}`)
    console.log(`  path: ${e.path}`)
    if (e.snippet) console.log(`  snippet: "${e.snippet}"`)
  }

  // Dump every body paragraph for cross-reference
  console.log(`\n--- All body paragraphs (with index) ---`)
  if (data.body?.content) {
    data.body.content.forEach((node: any, idx: number) => {
      if (node?.type === 'paragraph') {
        const t = flatten(node)
        console.log(`  p[${idx}]: ${t.slice(0, 220)}${t.length > 220 ? '...' : ''}`)
      } else if (node?.type === 'heading') {
        const t = flatten(node)
        console.log(`  H${node.attrs?.level || 2}[${idx}]: ${t}`)
      }
    })
  }
}
