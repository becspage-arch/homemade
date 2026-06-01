import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fname = '35-livestock-insurance-basics-for-smallholders.json'
const d = JSON.parse(readFileSync(join(__dirname, fname), 'utf-8'))

function getText(node) {
  if (!node) return ''
  if (node.type === 'text') return node.text || ''
  if (node.content) return node.content.map(getText).join('')
  return ''
}

console.log('listItem[3]:', getText(d.body.content[4].content[3].content[0]).substring(0, 200))
console.log('paragraph[9]:', getText(d.body.content[9]).substring(0, 200))
