/**
 * Print the offending paragraph text for each error in a batch dir.
 * Usage: tsx scripts/_voice-retrofit-show-offending.ts <batch-id>
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { runVoiceCheck } from './voice-check-lib.js'

const batchId = process.argv[2]
if (!batchId) { console.error('Usage: tsx scripts/_voice-retrofit-show-offending.ts <batch-id>'); process.exit(1) }

const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
const files = readdirSync(batchDir).filter(f => f.endsWith('.json') && !f.startsWith('_'))

function flattenText(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(flattenText).join('')
  if (node.text) return node.text
  if (node.content) return flattenText(node.content)
  return ''
}

function walk(node: any, path: string, out: Map<string, string>): void {
  if (!node) return
  if (Array.isArray(node)) {
    node.forEach((n, i) => walk(n, `${path}[${i}]`, out))
    return
  }
  if (node.type === 'paragraph' || node.type === 'heading') {
    out.set(path, flattenText(node))
  }
  if (node.type === 'infoPanel') {
    out.set(path, flattenText(node))
  }
  if (node.content) walk(node.content, `${path} > ${node.type}` , out)
}

for (const file of files) {
  const raw = readFileSync(resolve(batchDir, file), 'utf8')
  let data: any
  try { data = JSON.parse(raw) } catch { continue }
  const report = runVoiceCheck(data)
  if (report.errors.length === 0) continue

  // Walk to collect path -> text map.
  const map = new Map<string, string>()
  // The voice-check paths look like: body > paragraph[0] > text
  // Walk body.content collecting paragraph and heading and infoPanel text.
  const body = data.body
  if (body?.content && Array.isArray(body.content)) {
    body.content.forEach((node: any, i: number) => {
      const basePath = `body > ${node.type}[${i}]`
      if (node.type === 'paragraph' || node.type === 'heading') {
        map.set(basePath + ' > text', flattenText(node))
      } else if (node.type === 'infoPanel') {
        map.set(basePath + ' > body', flattenText(node))
      } else if (node.type === 'bulletList' || node.type === 'orderedList') {
        ;(node.content ?? []).forEach((li: any, j: number) => {
          const liPath = `${basePath} > listItem[${j}]`
          ;(li.content ?? []).forEach((p: any, k: number) => {
            if (p.type === 'paragraph') {
              map.set(`${liPath} > paragraph[${k}] > text`, flattenText(p))
            }
          })
        })
      }
    })
  }

  console.log(`\n=== ${file} (${report.errors.length} errors) ===`)
  for (const e of report.errors) {
    console.log(`\n[${e.kind}] ${e.message}`)
    console.log(`  path: ${e.path}`)
    const text = map.get(e.path)
    if (text) {
      console.log(`  TEXT: ${text}`)
    }
  }
}
