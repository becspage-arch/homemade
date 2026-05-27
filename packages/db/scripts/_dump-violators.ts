import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { runVoiceCheck } from './voice-check-lib.js'

function getText(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(getText).join('')
  return ''
}

function walk(node: any, pathStr: string, results: Map<string, string>) {
  results.set(pathStr, getText(node))
  if (Array.isArray(node?.content)) {
    node.content.forEach((child: any, idx: number) => {
      const t = child?.type ?? 'unknown'
      walk(child, `${pathStr} > ${t}[${idx}]`, results)
    })
  }
}

async function main() {
  const batchId = process.argv[2]
  if (!batchId) throw new Error('batch id required')
  const worktreeRoot = resolve(__dirname, '../../..')
  const dir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  for (const file of files) {
    const data = JSON.parse(readFileSync(resolve(dir, file), 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) continue
    const cache = new Map<string, string>()
    walk(data.body, 'body', cache)
    console.log(`\n=== ${file} ===`)
    for (const e of report.errors) {
      const parentPath = e.path.replace(/ > text$/, '')
      const text = cache.get(parentPath) ?? '(not found)'
      console.log(`\n  [${e.kind}] ${e.path}`)
      console.log(`  ${e.message}`)
      console.log(`  TEXT: ${text}`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
