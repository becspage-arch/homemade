#!/usr/bin/env node
/**
 * Fixes em-dashes in baking-bulk-024-briefs/*.json
 * - Replaces em-dash pairs (— X —) with parentheses in excerpt/sourceNotes/body text
 * - Replaces remaining single em-dashes with semicolons
 * - Fixes lowercase season enum values
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const BRIEF_DIR = process.argv[2] || 'docs/baking-bulk-024-briefs'

// Fix em-dashes in a string
function fixDashes(str) {
  if (!str || typeof str !== 'string') return str
  // First: fix em-dash pairs — X — → (X)
  // Only match pairs where the interior has no em-dash, no period, no exclamation/question mark
  // i.e. the pair encloses a short appositive phrase, not multiple sentences
  let result = str.replace(/ — ([^—.!?]+?) — /g, ' ($1) ')
  // Second: fix remaining single em-dashes
  // " — " → "; "  (connecting clauses)
  result = result.replace(/ — /g, '; ')
  return result
}

function fixNode(node) {
  if (!node || typeof node !== 'object') return node
  if (node.type === 'text' && typeof node.text === 'string') {
    node.text = fixDashes(node.text)
  }
  if (Array.isArray(node.content)) {
    node.content = node.content.map(fixNode)
  }
  return node
}

function fixSeason(val) {
  if (!val) return val
  const map = { winter: 'WINTER', summer: 'SUMMER', spring: 'SPRING', autumn: 'AUTUMN', year_round: 'YEAR_ROUND' }
  return map[val.toLowerCase()] ?? val
}

const files = readdirSync(BRIEF_DIR).filter(f => f.endsWith('.json')).sort()
let changed = 0

for (const fname of files) {
  const path = join(BRIEF_DIR, fname)
  const raw = readFileSync(path, 'utf8')
  const data = JSON.parse(raw)
  let dirty = false

  // Fix season
  if (data.season && data.season !== fixSeason(data.season)) {
    data.season = fixSeason(data.season)
    dirty = true
  }

  // Fix excerpt
  if (data.excerpt) {
    const fixed = fixDashes(data.excerpt)
    if (fixed !== data.excerpt) { data.excerpt = fixed; dirty = true }
  }

  // Fix sourceNotes
  if (data.sourceNotes) {
    const fixed = fixDashes(data.sourceNotes)
    if (fixed !== data.sourceNotes) { data.sourceNotes = fixed; dirty = true }
  }

  // Fix body paragraph/heading nodes
  if (data.body?.content) {
    const before = JSON.stringify(data.body)
    data.body.content = data.body.content.map(fixNode)
    if (JSON.stringify(data.body) !== before) dirty = true
  }

  if (dirty) {
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
    changed++
    console.log(`Fixed: ${fname}`)
  }
}

console.log(`\nDone. ${changed} files updated.`)
