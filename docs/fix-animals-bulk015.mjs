// Fix script for animals-smallholding-bulk-015 briefs
// Run from repo root: node docs/fix-animals-bulk015.mjs

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const briefsDir = resolve(__dirname, 'animals-smallholding-bulk-015-briefs')

function fixEmDashes(str) {
  if (!str) return str
  // Replace em-dash surrounded by spaces with comma+space
  let s = str.replace(/ — /g, ', ')
  // Replace any remaining em-dash (not surrounded by spaces) with comma
  s = s.replace(/—/g, ',')
  // Same for en-dashes
  s = s.replace(/ – /g, ', ')
  s = s.replace(/–/g, ',')
  return s
}

function walkAndFix(obj) {
  if (typeof obj === 'string') return fixEmDashes(obj)
  if (Array.isArray(obj)) return obj.map(walkAndFix)
  if (obj && typeof obj === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
      out[k] = walkAndFix(v)
    }
    return out
  }
  return obj
}

const files = readdirSync(briefsDir).filter(f => f.endsWith('.json')).sort()
let fixed = 0

for (const file of files) {
  const path = resolve(briefsDir, file)
  const raw = readFileSync(path, 'utf-8')
  const json = JSON.parse(raw)
  const fixedJson = walkAndFix(json)
  const newRaw = JSON.stringify(fixedJson, null, 2) + '\n'
  if (newRaw !== raw) {
    writeFileSync(path, newRaw, 'utf-8')
    fixed++
    console.log(`Fixed: ${file}`)
  }
}

console.log(`\nDone: ${fixed} files updated.`)
