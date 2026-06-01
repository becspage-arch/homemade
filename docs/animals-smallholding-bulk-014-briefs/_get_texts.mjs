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
  { file: '04-queen-cage-introduction-method.json', path: 'body.content[3]', issue: 'glossary pheromone-acceptance unused' },
  { file: '10-egg-production-records-and-laying-tallies.json', path: 'body.content[7].content[2].content[0]', issue: 'grade' },
  { file: '12-cold-hardy-breeds-for-a-uk-winter.json', path: 'body.content[3].content[1].content[0]', issue: 'institutional-in-body' },
  { file: '20-sheep-transport-and-loading-for-the-small-flock.json', path: 'body.content[12]', issue: 'grade' },
  { file: '23-managing-rabbit-aggression-in-a-colony.json', path: 'body.content[4]', issue: 'grade' },
  { file: '25-rabbit-vaccination-schedule-uk.json', path: 'body.content[2]', issue: 'grade' },
  { file: '27-deep-cleaning-a-rabbit-colony-pen.json', path: 'body.content[4].content[3].content[0]', issue: 'grade' },
  { file: '28-understanding-pig-notifiable-diseases-uk.json', path: 'body.content[2].content[3].content[0]', issue: 'grade' },
  { file: '29-pig-stress-recognition-and-welfare-checks.json', path: 'body.content[4]', issue: 'grade' },
  { file: '34-working-with-your-vet-flock-health-planning.json', path: 'body.content[2]', issue: 'grade' },
  { file: '35-livestock-insurance-basics-for-smallholders.json', path: 'body.content[4].content[1].content[0]', issue: 'grade' },
  { file: '36-legal-predator-control-on-a-smallholding.json', path: 'body.content[6]', issue: 'grade' },
  { file: '37-fallen-stock-and-disposal-options-uk.json', path: 'body.content[7]', issue: 'grade' },
  { file: '38-getting-a-soil-test-for-pasture.json', path: 'body.content[7]', issue: 'grade' },
]

for (const e of errors) {
  const data = JSON.parse(readFileSync(join(__dirname, e.file), 'utf-8'))
  const node = getByPath(data, e.path)
  const text = getText(node)
  console.log(`\n${e.file} [${e.issue}]:\n${text.substring(0, 280)}`)
}
