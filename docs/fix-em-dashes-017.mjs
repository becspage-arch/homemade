// Fix em-dash pairs in bulk-batch-017 brief JSONs
// Rule: max 1 em dash per paragraph. Em-dash pairs " — phrase — " → " (phrase) "
// Remaining single em dash: "word — rest" → OK (exactly 1)
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const dir = 'C:/Users/Rebecca/Projects/code/homemade/docs/bulk-batch-017-briefs'
const files = readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_'))

function fixText(text) {
  if (typeof text !== 'string') return text
  // First pass: convert " — phrase — " pairs to " (phrase) "
  // Use a non-greedy match to handle shortest pair
  let result = text.replace(/ — ([^—\n]+?) — /g, ' ($1) ')
  // If still 2+ em dashes in a line, replace every second em dash with a comma
  // Count em dashes
  const count = (result.match(/ — /g) || []).length
  if (count >= 2) {
    // Replace from the second occurrence onwards with ','
    let nth = 0
    result = result.replace(/ — /g, (match) => {
      nth++
      return nth === 1 ? match : ', '
    })
  }
  return result
}

function walkNode(node) {
  if (!node || typeof node !== 'object') return node
  if (Array.isArray(node)) return node.map(walkNode)
  const out = {}
  for (const [k, v] of Object.entries(node)) {
    if (k === 'text' && typeof v === 'string') {
      out[k] = fixText(v)
    } else if (k === 'sourceNotes' && typeof v === 'string') {
      out[k] = fixText(v)
    } else if (k === 'symptom' || k === 'cause' || k === 'fix') {
      out[k] = fixText(v)
    } else if (k === 'excerpt' && typeof v === 'string') {
      out[k] = fixText(v)
    } else if (k === 'subtitle' && typeof v === 'string') {
      out[k] = fixText(v)
    } else {
      out[k] = walkNode(v)
    }
  }
  return out
}

let fixed = 0
for (const file of files) {
  const path = join(dir, file)
  const raw = readFileSync(path, 'utf8')
  const json = JSON.parse(raw)
  const patched = walkNode(json)
  const out = JSON.stringify(patched, null, 2)
  if (out !== raw) {
    writeFileSync(path, out + '\n')
    console.log(`fixed: ${file}`)
    fixed++
  }
}
console.log(`\nDone. Fixed ${fixed} files.`)
