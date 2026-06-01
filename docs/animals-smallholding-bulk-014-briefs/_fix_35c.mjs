import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fname = '35-livestock-insurance-basics-for-smallholders.json'
const d = JSON.parse(readFileSync(join(__dirname, fname), 'utf-8'))

// Fix listItem[3]: grade 14.3
d.body.content[4].content[3].content[0] = {
  type: 'paragraph',
  content: [{ type: 'text', text: 'Normal losses: deaths from difficult births or standard illness are usually excluded.' }]
}

// Fix paragraph[9]: grade 13.8
d.body.content[9] = {
  type: 'paragraph',
  content: [{ type: 'text', text: 'Most farm policies include public liability cover for escaped livestock on a road. For most small holdings, this matters more than the mortality cover. A single road accident caused by a strayed animal can cost far more than replacing the animal.' }]
}

writeFileSync(join(__dirname, fname), JSON.stringify(d, null, 2), 'utf-8')
console.log('Saved')
