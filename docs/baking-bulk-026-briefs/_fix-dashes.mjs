// Bulk-fix en-dashes and em-dashes in baking-bulk-026-briefs
// En-dashes between digits -> " to "
// Em-dashes -> context-appropriate replacements (semicolon, comma, or period)

import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const dir = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')

const files = readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_'))

let totalFiles = 0
let totalFixes = 0

for (const file of files) {
  const filePath = join(dir, file)
  let content = readFileSync(filePath, 'utf-8')
  const original = content

  // 1. Replace en-dashes between digits with " to "
  // Pattern: digit(s) – digit(s) (with optional spaces around the dash)
  content = content.replace(/(\d)\s*–\s*(\d)/g, '$1 to $2')

  // 2. Replace remaining en-dashes (non-numeric context) with comma + space
  // These should be rare after step 1
  content = content.replace(/\s*–\s*/g, ', ')

  // 3. Replace single em-dashes (—) used as clause connectors with semicolons
  // But NOT if they're in appositive pairs — those are handled separately
  // Pattern: word — word (single em-dash used as a dash in prose)
  // We'll replace em-dashes not part of a pair first

  // Check for paired em-dashes: — text —
  // Replace paired em-dashes with parentheses
  content = content.replace(/\s*—\s*([^—]+?)\s*—\s*/g, ' ($1) ')

  // Replace remaining single em-dashes with semicolons or commas
  // In most cases a semicolon makes sense
  content = content.replace(/\s*—\s*/g, '; ')

  // Clean up any double spaces
  content = content.replace(/ {2,}/g, ' ')

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8')
    totalFiles++
    // Count replacements roughly
    const origDashes = (original.match(/[–—]/g) || []).length
    const newDashes = (content.match(/[–—]/g) || []).length
    totalFixes += origDashes - newDashes
    console.log(`Fixed ${file}: ${origDashes - newDashes} dashes replaced`)
  } else {
    console.log(`No changes: ${file}`)
  }
}

console.log(`\nTotal: ${totalFixes} dashes fixed across ${totalFiles} files`)
