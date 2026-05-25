/**
 * Fixer: walk every JSON file in docs/voice-pilot-2026-05-25/ and add
 * "type": "text" to any leaf object that has a `text` string but no `type`.
 * The original rewrites missed this on every text node the worker authored
 * inside orderedList → listItem → paragraph chains, which caused the public
 * renderer to silently drop the steps (default-case dispatch on missing type).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const pilotDir = resolve(worktreeRoot, 'docs/voice-pilot-2026-05-25')

let fixed = 0

function walk(node: any): void {
  if (!node || typeof node !== 'object') return
  // Leaf with text but no type → add it.
  if ('text' in node && typeof node.text === 'string' && !node.type) {
    node.type = 'text'
    fixed++
  }
  if (Array.isArray(node.content)) for (const c of node.content) walk(c)
}

const files = readdirSync(pilotDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
for (const file of files) {
  const fullPath = resolve(pilotDir, file)
  const before = fixed
  const data = JSON.parse(readFileSync(fullPath, 'utf8'))
  walk(data.body)
  const delta = fixed - before
  if (delta > 0) {
    writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n', 'utf8')
    console.log(`[FIX]  ${basename(file)} — added type:text on ${delta} nodes`)
  } else {
    console.log(`[OK]   ${basename(file)}`)
  }
}

console.log(`\nTotal fixed: ${fixed} text nodes across ${files.length} files`)
