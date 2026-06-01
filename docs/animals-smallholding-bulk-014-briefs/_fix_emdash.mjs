import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function fixEmDash(text) {
  return text.replace(/ — /g, ', ')
}

function fixNode(node) {
  if (!node || typeof node !== 'object') return node
  if (node.type === 'text' && typeof node.text === 'string') {
    node.text = fixEmDash(node.text)
  }
  if (Array.isArray(node.content)) {
    node.content = node.content.map(fixNode)
  }
  if (node.attrs && typeof node.attrs === 'object') {
    for (const k of Object.keys(node.attrs)) {
      if (typeof node.attrs[k] === 'string') {
        node.attrs[k] = fixEmDash(node.attrs[k])
      }
    }
  }
  return node
}

let fixedCount = 0
const files = readdirSync(__dirname).filter(f => f.endsWith('.json') && !f.startsWith('_'))

for (const fname of files.sort()) {
  const path = join(__dirname, fname)
  const data = JSON.parse(readFileSync(path, 'utf-8'))
  let changed = false

  if (typeof data.excerpt === 'string') {
    const fixed = fixEmDash(data.excerpt)
    if (fixed !== data.excerpt) { data.excerpt = fixed; changed = true }
  }
  if (typeof data.subtitle === 'string') {
    const fixed = fixEmDash(data.subtitle)
    if (fixed !== data.subtitle) { data.subtitle = fixed; changed = true }
  }
  if (data.body) {
    const before = JSON.stringify(data.body)
    data.body = fixNode(data.body)
    if (JSON.stringify(data.body) !== before) changed = true
  }

  if (changed) {
    writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8')
    console.log(`Fixed: ${fname}`)
    fixedCount++
  }
}

console.log(`\nTotal files fixed: ${fixedCount}`)
