import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function getText(node) {
  if (!node) return ''
  if (node.type === 'text') return node.text || ''
  if (node.content) return node.content.map(getText).join('')
  return ''
}

function getByPath(data, pathStr) {
  const parts = pathStr.split('.')
  let node = data
  for (const part of parts) {
    if (part.includes('[')) {
      const [key, idxStr] = part.split('[')
      node = node[key][parseInt(idxStr)]
    } else { node = node[part] }
  }
  return node
}

const errors = [
  { file: '25-rabbit-vaccination-schedule-uk.json', path: 'body.content[8]' },
  { file: '25-rabbit-vaccination-schedule-uk.json', path: 'body.content[9]' },
  { file: '28-understanding-pig-notifiable-diseases-uk.json', path: 'body.content[7]' },
  { file: '35-livestock-insurance-basics-for-smallholders.json', path: 'body.content[4].content[2].content[0]' },
  { file: '35-livestock-insurance-basics-for-smallholders.json', path: 'body.content[4].content[3].content[0]' },
]

for (const e of errors) {
  const data = JSON.parse(readFileSync(join(__dirname, e.file), 'utf-8'))
  const node = getByPath(data, e.path)
  const text = getText(node)
  console.log(`\n${e.file} [${e.path}]:\n${text.substring(0, 280)}`)
}
