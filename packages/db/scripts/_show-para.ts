import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function getText(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.content)) return node.content.map(getText).join('')
  return ''
}

function walk(node: any, pathStr: string, target: string, results: { p: string; text: string }[]) {
  if (pathStr === target) {
    results.push({ p: pathStr, text: getText(node) })
  }
  if (Array.isArray(node?.content)) {
    node.content.forEach((child: any, idx: number) => {
      const t = child?.type ?? 'unknown'
      const childPath = `${pathStr} > ${t}[${idx}]`
      walk(child, childPath, target, results)
    })
  }
}

async function main() {
  const file = process.argv[2]
  const target = process.argv.slice(3).join(' ')
  if (!file || !target) throw new Error('usage: file target-path')
  const worktreeRoot = resolve(__dirname, '../../..')
  const full = resolve(worktreeRoot, file)
  const data = JSON.parse(readFileSync(full, 'utf8'))
  const results: { p: string; text: string }[] = []
  walk(data.body, 'body', target, results)
  if (results.length === 0) {
    console.log('no match for "' + target + '"')
    return
  }
  for (const r of results) {
    console.log(`\n${r.p}:\n${r.text}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
