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
  { file: '10-egg-production-records-and-laying-tallies.json', path: 'body.content[9]' },
  { file: '25-rabbit-vaccination-schedule-uk.json', path: 'body.content[3]' },
  { file: '27-deep-cleaning-a-rabbit-colony-pen.json', path: 'body.content[4].content[4].content[0]' },
  { file: '28-understanding-pig-notifiable-diseases-uk.json', path: 'body.content[4]' },
  { file: '29-pig-stress-recognition-and-welfare-checks.json', path: 'body.content[7]' },
  { file: '35-livestock-insurance-basics-for-smallholders.json', path: 'body.content[4].content[2].content[0]' },
  { file: '38-getting-a-soil-test-for-pasture.json', path: 'body.content[9]' },
]

for (const e of errors) {
  const data = JSON.parse(readFileSync(join(__dirname, e.file), 'utf-8'))
  const node = getByPath(data, e.path)
  const text = getText(node)
  console.log(`\n${e.file}:\n${text.substring(0, 300)}`)
}
