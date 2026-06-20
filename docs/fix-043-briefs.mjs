/**
 * Batch fix for bulk-043 briefs:
 * 1. Remove recipe.servings when recipe.yieldDescription is set (can't have both)
 * 2. Remove em/en dashes from TipTap paragraph+heading text nodes
 * 3. Insert glossaryTooltip marks for registered glossary terms
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const dir = process.argv[2]
if (!dir) { console.error('Usage: node fix-043-briefs.mjs <briefDir>'); process.exit(1) }

const files = readdirSync(dir).filter(f => f.endsWith('.json')).sort()

/**
 * Fix em/en dashes in a text string.
 */
function fixDashes(text) {
  // En-dashes in numeric ranges: 10–15 → 10 to 15
  text = text.replace(/(\d+(?:\.\d+)?)–(\d+(?:\.\d+)?)/g, '$1 to $2')
  // Em-dash followed by capital letter → new sentence (period + space + capital)
  text = text.replace(/ — ([A-Z])/g, '. $1')
  // Em-dash in other positions → comma
  text = text.replace(/ —([^—])/g, ', $1')
  text = text.replace(/—/g, ', ')
  // Remaining en-dashes (not in numeric ranges) → comma or hyphen
  // en-dash between words (not numbers) → ' to ' or comma
  text = text.replace(/(\w)–(\w)/g, '$1 to $2')
  text = text.replace(/–/g, ', ')
  // Clean up double commas or comma-period combos
  text = text.replace(/, ,/g, ',')
  text = text.replace(/,\./g, '.')
  return text
}

/**
 * Walk TipTap doc content, fixing dashes in text nodes.
 */
function walkAndFixDashes(content) {
  if (!Array.isArray(content)) return content
  return content.map(node => {
    if (node.type === 'text' && typeof node.text === 'string') {
      return { ...node, text: fixDashes(node.text) }
    }
    if (Array.isArray(node.content)) {
      return { ...node, content: walkAndFixDashes(node.content) }
    }
    return node
  })
}

/**
 * For a given glossary term slug+text, wrap the FIRST occurrence in a
 * paragraph text node with a glossaryTooltip mark.
 * Mutates the content array in place and returns whether it found+marked.
 */
function insertGlossaryMark(content, termSlug, termText) {
  if (!Array.isArray(content)) return false
  for (const node of content) {
    if (node.type === 'paragraph' && Array.isArray(node.content)) {
      for (let i = 0; i < node.content.length; i++) {
        const child = node.content[i]
        if (child.type === 'text' && typeof child.text === 'string') {
          // Case-insensitive search
          const lc = child.text.toLowerCase()
          const termLc = termText.toLowerCase()
          const idx = lc.indexOf(termLc)
          if (idx !== -1) {
            // Split the text node into [before, marked, after]
            const before = child.text.slice(0, idx)
            const matched = child.text.slice(idx, idx + termText.length)
            const after = child.text.slice(idx + termText.length)
            const mark = { type: 'glossaryTooltip', attrs: { termSlug } }
            const markedNode = { type: 'text', text: matched, marks: [mark] }
            const replacements = []
            if (before) replacements.push({ type: 'text', text: before })
            replacements.push(markedNode)
            if (after) replacements.push({ type: 'text', text: after })
            node.content.splice(i, 1, ...replacements)
            return true
          }
        }
      }
    }
    // Recurse into headings and other nodes with content
    if (Array.isArray(node.content)) {
      if (insertGlossaryMark(node.content, termSlug, termText)) return true
    }
  }
  return false
}

let fixedCount = 0

for (const file of files) {
  const path = join(dir, file)
  let data
  try {
    data = JSON.parse(readFileSync(path, 'utf8'))
  } catch (e) {
    console.error(`PARSE ERROR ${file}: ${e.message}`)
    continue
  }

  let changed = false

  // 1. Remove recipe.servings when yieldDescription is set
  if (data.recipe && data.recipe.yieldDescription != null && data.recipe.servings != null) {
    delete data.recipe.servings
    changed = true
  }

  // 2. Fix em/en dashes in body content
  if (data.body && Array.isArray(data.body.content)) {
    const fixed = walkAndFixDashes(data.body.content)
    data.body = { ...data.body, content: fixed }
    changed = true
  }

  // 3. Insert glossaryTooltip marks for registered terms
  const terms = data.glossaryTerms || []
  for (const t of terms) {
    if (!t.slug || !t.term) continue
    const termText = t.term.toLowerCase()
    // Try to find a suitable text form in the body
    if (data.body && Array.isArray(data.body.content)) {
      const found = insertGlossaryMark(data.body.content, t.slug, t.term)
      if (!found) {
        // Try lowercase version
        const foundLc = insertGlossaryMark(data.body.content, t.slug, termText)
        if (!foundLc) {
          // Try the term slug as words (e.g., "setting-point" → "setting point")
          const slugAsWords = t.slug.replace(/-/g, ' ')
          const foundSlug = insertGlossaryMark(data.body.content, t.slug, slugAsWords)
          if (!foundSlug) {
            console.warn(`  WARN: could not find inline "${t.slug}" in ${file}`)
          } else {
            changed = true
          }
        } else {
          changed = true
        }
      } else {
        changed = true
      }
    }
  }

  if (changed) {
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
    fixedCount++
    console.log(`Fixed: ${file}`)
  }
}

console.log(`\nDone: fixed ${fixedCount} of ${files.length} files`)
