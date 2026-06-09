import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BRIEFS_DIR = path.resolve(__dirname, '../../../docs/natural-home-bulk-012-briefs')

function fixEmDashes(text: string): string {
  return text
    .replace(/ — ([A-Z])/g, (_: string, c: string) => `. ${c}`)
    .replace(/ — ([a-z])/g, (_: string, c: string) => `, ${c}`)
    .replace(/ — /g, '. ')
}

function fixNode(node: any): any {
  if (!node || typeof node !== 'object') return node
  if (Array.isArray(node)) return node.map(fixNode)
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(node)) {
    if (key === 'text' && typeof value === 'string') {
      result[key] = fixEmDashes(value as string)
    } else {
      result[key] = fixNode(value)
    }
  }
  return result
}

const files = fs.readdirSync(BRIEFS_DIR).filter((f: string) => f.endsWith('.json'))
let count = 0
for (const file of files) {
  const fullPath = path.join(BRIEFS_DIR, file)
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'))

  if (data.sourceNotes) {
    data.sourceNotes = fixEmDashes(data.sourceNotes)
  }

  if (data.body) {
    data.body = fixNode(data.body)
  }

  if (data.recipe) {
    for (const field of ['batchNotes', 'makeAheadNotes', 'freezeNotes', 'shelfLifeNotes', 'temperatureNote']) {
      if (data.recipe[field]) {
        data.recipe[field] = fixEmDashes(data.recipe[field] as string)
      }
    }
  }

  for (const tool of (data.recipeTools ?? [])) {
    if (tool.note) tool.note = fixEmDashes(tool.note)
  }

  const json = JSON.stringify(data, null, 2)
  fs.writeFileSync(fullPath, json + '\n')
  count++
  console.log(`Fixed: ${file}`)
}
console.log(`Total: ${count} files fixed`)
