/**
 * Fix em/en-dash issues in sustainability-bulk-014-briefs (files 01-24).
 * - Replaces en-dashes (–) between numbers with " to "
 * - Replaces all en-dashes (–) in body text with " to "
 * - Replaces em-dashes (—) with ": " in headings, ". " in prose
 * - Fixes sourceNotes em-dashes too
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/sustainability-bulk-014-briefs')

// Only process the pre-existing non-foraging files (01-24)
const files = readdirSync(batchDir)
  .filter(f => f.endsWith('.json') && !f.startsWith('_'))
  .filter(f => {
    const n = parseInt(f.split('-')[0], 10)
    return n >= 1 && n <= 24
  })
  .sort()

function fixStr(s: string, inHeading: boolean): string {
  // Fix en-dash used in ranges: "3–6 mm" → "3 to 6 mm"
  // Pattern: digit/word–digit/word
  s = s.replace(/(\d)–(\d)/g, '$1 to $2')
  // Fix remaining en-dashes (catch-all)
  s = s.replace(/–/g, ' to ')
  // Fix em-dashes: in headings → ":", in prose → ","
  if (inHeading) {
    s = s.replace(/\s*—\s*/g, ': ')
  } else {
    // In prose, " — " → ", "  but at sentence boundary " — The/A/An/This" use ". "
    s = s.replace(/\s*—\s*/g, ', ')
  }
  return s
}

function fixNode(node: any, inHeading = false): any {
  if (typeof node === 'string') {
    return fixStr(node, inHeading)
  }
  if (Array.isArray(node)) {
    return node.map(n => fixNode(n, inHeading))
  }
  if (node && typeof node === 'object') {
    const result: any = {}
    for (const [k, v] of Object.entries(node)) {
      if (k === 'type' && v === 'heading') {
        // Process children with inHeading=true
        result[k] = v
        for (const [k2, v2] of Object.entries(node)) {
          if (k2 !== 'type') {
            result[k2] = fixNode(v2, true)
          }
        }
        return result
      }
      result[k] = fixNode(v, inHeading)
    }
    return result
  }
  return node
}

let fixed = 0
let skipped = 0

for (const file of files) {
  const path = resolve(batchDir, file)
  const raw = readFileSync(path, 'utf8')
  let data: any
  try {
    data = JSON.parse(raw)
  } catch {
    console.error(`PARSE ERROR: ${file}`)
    skipped++
    continue
  }

  const fixedData = fixNode(data)
  const newJson = JSON.stringify(fixedData, null, 2)

  if (newJson !== JSON.stringify(data, null, 2)) {
    writeFileSync(path, newJson + '\n', 'utf8')
    console.log(`FIXED: ${file}`)
    fixed++
  } else {
    console.log(`UNCHANGED: ${file}`)
  }
}

console.log(`\nDone: ${fixed} fixed, ${skipped} skipped`)
