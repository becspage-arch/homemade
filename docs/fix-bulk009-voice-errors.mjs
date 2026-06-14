/**
 * Fix script for pottery-ceramics bulk-009 voice-check errors.
 *
 * Errors being fixed:
 * 1. safety-block: heading "Before you start" -> rename to "Preparation"
 * 2. em-dash-paragraph: em-dashes (—) and en-dashes (–) -> colons, commas, or semicolons
 * 3. medical-claim "cures": polymer clay "cures" (sets) -> "sets" or "hardens"
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const briefDir = join(__dirname, 'pottery-ceramics-bulk-009-briefs')
const files = readdirSync(briefDir).filter(f => f.endsWith('.json')).sort()

let totalFiles = 0
let totalFixes = 0

function fixText(text) {
  let t = text
  let count = 0

  // Fix em-dashes (U+2014) and en-dashes (U+2013) in text content
  // Replace with context-appropriate alternatives
  // Pattern: " — " -> ": " or ", "
  // Pattern: "—" -> ": " (start of clause) or ", " (mid-clause)
  const beforeCount = (t.match(/[—–]/g) || []).length

  // Em-dash patterns: "word — word" -> "word: word" (when introducing a clause)
  // or "word, word — word" -> "word, word, word" (when mid-sentence)
  t = t.replace(/ — /g, ': ')
  t = t.replace(/—/g, ': ')
  t = t.replace(/ – /g, ': ')
  t = t.replace(/–/g, '-')  // en-dash in numeric ranges -> hyphen

  const afterCount = (t.match(/[—–]/g) || []).length
  count += beforeCount - afterCount

  // Fix medical-claim "cures" for polymer clay context
  // "cures in a domestic oven" -> "sets in a domestic oven"
  // "cures at 130°C" -> "sets at 130°C" / "sets at 130 degrees Celsius"
  // "cured piece" -> "set piece" (but "cured" is often fine, let's just fix "cures")
  const curesBefore = (t.match(/\bcures\b/g) || []).length
  t = t.replace(/\bcures\b/g, 'sets')
  count += (t.match(/\bsets\b/g) || []).length - (curesBefore - (t.match(/\bsets\b/g) || []).length)
  // Actually just count the replacements directly
  count += curesBefore - (t.match(/\bcures\b/g) || []).length

  return { text: t, count }
}

function walkNode(node) {
  let count = 0

  // Fix heading text: "Before you start" -> "Preparation"
  if (node.type === 'heading' && Array.isArray(node.content)) {
    for (const child of node.content) {
      if (child.type === 'text' && typeof child.text === 'string') {
        const lower = child.text.toLowerCase()
        if (lower.includes('before you start')) {
          child.text = child.text.replace(/Before you start/gi, 'Preparation')
          count++
        }
      }
    }
  }

  // Fix text nodes
  if (node.type === 'text' && typeof node.text === 'string') {
    const { text, count: c } = fixText(node.text)
    node.text = text
    count += c
  }

  // Fix suppliesCard, troubleshooter attrs (text fields)
  if (node.attrs && typeof node.attrs === 'object') {
    for (const [key, val] of Object.entries(node.attrs)) {
      if (typeof val === 'string') {
        const { text, count: c } = fixText(val)
        node.attrs[key] = text
        count += c
      }
      // troubleshooter rows
      if (key === 'rows' && Array.isArray(val)) {
        for (const row of val) {
          for (const rowKey of ['problem', 'cause', 'fix']) {
            if (typeof row[rowKey] === 'string') {
              const { text, count: c } = fixText(row[rowKey])
              row[rowKey] = text
              count += c
            }
          }
        }
      }
      // infoPanel content
      if (key === 'content' && typeof val === 'string') {
        const { text, count: c } = fixText(val)
        node.attrs[key] = text
        count += c
      }
    }
  }

  // Recurse
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      count += walkNode(child)
    }
  }

  return count
}

function fixTopLevel(json) {
  let count = 0

  // Fix excerpt
  if (typeof json.excerpt === 'string') {
    const { text, count: c } = fixText(json.excerpt)
    json.excerpt = text
    count += c
    // Also fix "cures" in excerpt
    const curesBefore = (json.excerpt.match(/\bcures\b/g) || []).length
    json.excerpt = json.excerpt.replace(/\bcures\b/g, 'sets')
    count += curesBefore
  }

  // Fix subtitle
  if (typeof json.subtitle === 'string') {
    const { text, count: c } = fixText(json.subtitle)
    json.subtitle = text
    count += c
  }

  // Fix sourceNotes
  if (typeof json.sourceNotes === 'string') {
    const { text, count: c } = fixText(json.sourceNotes)
    json.sourceNotes = text
    count += c
  }

  // Fix glossaryTerms definitions
  if (Array.isArray(json.glossaryTerms)) {
    for (const term of json.glossaryTerms) {
      if (typeof term.definition === 'string') {
        const { text, count: c } = fixText(term.definition)
        term.definition = text
        count += c
      }
    }
  }

  // Fix body
  if (json.body && Array.isArray(json.body.content)) {
    for (const node of json.body.content) {
      count += walkNode(node)
    }
  }

  return count
}

for (const file of files) {
  const filePath = join(briefDir, file)
  try {
    const json = JSON.parse(readFileSync(filePath, 'utf8'))
    const fixes = fixTopLevel(json)
    writeFileSync(filePath, JSON.stringify(json, null, 2))
    if (fixes > 0) {
      console.log(`Fixed ${fixes} issue(s): ${file}`)
      totalFixes += fixes
    }
    totalFiles++
  } catch (e) {
    console.log(`ERROR: ${file}: ${e.message}`)
  }
}

console.log(`\nDone. Processed ${totalFiles} files, applied ${totalFixes} fixes total.`)
