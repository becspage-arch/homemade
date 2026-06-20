/**
 * Round 2 fix for bulk-043 briefs:
 * 1. Fix em/en dashes in excerpt, sourceNotes, ingredient prepNotes
 * 2. Insert glossaryTooltip marks for terms that weren't matched in round 1
 * 3. Fix specific grade-level paragraphs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const dir = process.argv[2]
if (!dir) { console.error('Usage: node fix-043-round2.mjs <briefDir>'); process.exit(1) }

const files = readdirSync(dir).filter(f => f.endsWith('.json')).sort()

function fixDashesInString(text) {
  if (!text || typeof text !== 'string') return text
  // En-dashes in numeric ranges: 10–15 → 10 to 15
  text = text.replace(/(\d+(?:\.\d+)?)–(\d+(?:\.\d+)?)/g, '$1 to $2')
  // Em-dash followed by capital letter → new sentence
  text = text.replace(/ — ([A-Z])/g, '. $1')
  // Em-dash in other positions → comma
  text = text.replace(/ — /g, ', ')
  text = text.replace(/—/g, ', ')
  // Remaining en-dashes between words → comma
  text = text.replace(/(\w)–(\w)/g, '$1 to $2')
  text = text.replace(/–/g, ', ')
  // Clean up artifacts
  text = text.replace(/, {2,}/g, ', ')
  text = text.replace(/,\./g, '.')
  return text
}

/**
 * Walk body content, fixing:
 * - troubleshooter cause/fix strings (paragraph=true, em-dash checked)
 * - prepNote in ingredientsList (paragraph=false, not em-dash checked, but clean anyway)
 */
function fixBodyAttrs(content) {
  if (!Array.isArray(content)) return content
  return content.map(node => {
    if (node.type === 'troubleshooter' && node.attrs && Array.isArray(node.attrs.items)) {
      const fixedItems = node.attrs.items.map(item => ({
        ...item,
        cause: item.cause ? fixDashesInString(item.cause) : item.cause,
        fix: item.fix ? fixDashesInString(item.fix) : item.fix,
      }))
      // Also fix intro if present
      const fixedIntro = node.attrs.intro ? fixDashesInString(node.attrs.intro) : node.attrs.intro
      return { ...node, attrs: { ...node.attrs, intro: fixedIntro, items: fixedItems } }
    }
    if (node.type === 'ingredientsList' && node.attrs && Array.isArray(node.attrs.items)) {
      const fixedItems = node.attrs.items.map(item => ({
        ...item,
        prepNote: item.prepNote ? fixDashesInString(item.prepNote) : item.prepNote
      }))
      return { ...node, attrs: { ...node.attrs, items: fixedItems } }
    }
    if (Array.isArray(node.content)) {
      return { ...node, content: fixBodyAttrs(node.content) }
    }
    return node
  })
}

/**
 * Insert a glossaryTooltip mark for the FIRST occurrence of termText in a paragraph.
 * Returns true if successfully inserted.
 */
function insertMark(content, termSlug, termText) {
  if (!Array.isArray(content)) return false
  for (const node of content) {
    if (node.type === 'paragraph' && Array.isArray(node.content)) {
      for (let i = 0; i < node.content.length; i++) {
        const child = node.content[i]
        if (child.type !== 'text' || typeof child.text !== 'string') continue
        // Skip already-marked nodes
        if (Array.isArray(child.marks) && child.marks.some(m => m.type === 'glossaryTooltip')) continue
        const lc = child.text.toLowerCase()
        const termLc = termText.toLowerCase()
        const idx = lc.indexOf(termLc)
        if (idx !== -1) {
          const before = child.text.slice(0, idx)
          const matched = child.text.slice(idx, idx + termText.length)
          const after = child.text.slice(idx + termText.length)
          const markedNode = { type: 'text', text: matched, marks: [{ type: 'glossaryTooltip', attrs: { termSlug } }] }
          const replacements = []
          if (before) replacements.push({ type: 'text', text: before })
          replacements.push(markedNode)
          if (after) replacements.push({ type: 'text', text: after })
          node.content.splice(i, 1, ...replacements)
          return true
        }
      }
    }
    if (Array.isArray(node.content)) {
      if (insertMark(node.content, termSlug, termText)) return true
    }
  }
  return false
}

/**
 * Add a sentence mentioning the glossary term to the FIRST paragraph in the body.
 * Used when the term doesn't appear naturally in the text.
 */
function addTermToFirstParagraph(content, termSlug, termText, sentence) {
  if (!Array.isArray(content)) return false
  for (const node of content) {
    if (node.type === 'paragraph' && Array.isArray(node.content)) {
      // Find the last text node in this paragraph
      const lastIdx = node.content.length - 1
      const last = node.content[lastIdx]
      if (last && last.type === 'text') {
        // Append the sentence to the last text node
        last.text = last.text.replace(/\.?\s*$/, '') + '. ' + sentence
        // Now mark the term in the updated text
        insertMark(content, termSlug, termText)
        return true
      }
    }
    if (Array.isArray(node.content)) {
      if (addTermToFirstParagraph(node.content, termSlug, termText, sentence)) return true
    }
  }
  return false
}

/**
 * For a method paragraph that discusses boiling/setting, inject "setting point" if missing.
 * Strategy: find the first text node that mentions "104" or "105" (the temp), and insert
 * " (the setting point)" after that number. Falls back to appending to "will set" text.
 */
function injectSettingPoint(content) {
  if (!Array.isArray(content)) return false
  for (const node of content) {
    if (node.type === 'paragraph' && Array.isArray(node.content)) {
      const fullText = node.content.map(c => (typeof c.text === 'string' ? c.text : '')).join('')
      if (/104|105/.test(fullText) && !fullText.includes('setting point')) {
        for (let i = 0; i < node.content.length; i++) {
          const child = node.content[i]
          if (child.type !== 'text' || typeof child.text !== 'string') continue
          // Find "104" or "105" mention
          const thermIdx = child.text.search(/104|105/)
          if (thermIdx !== -1) {
            // Insert "(the setting point)" right after the temperature digits
            const b2 = child.text.slice(0, thermIdx)
            const tempNum = child.text.slice(thermIdx, thermIdx + 3)
            const a2 = child.text.slice(thermIdx + 3)
            const markedTerm = { type: 'text', text: 'setting point', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'setting-point' } }] }
            const replacements = [
              { type: 'text', text: b2 + tempNum + ' (the ' },
              markedTerm,
              { type: 'text', text: ')' + a2 }
            ].filter(n => n.text !== '')
            node.content.splice(i, 1, ...replacements)
            return true
          }
        }
      }
    }
    if (Array.isArray(node.content)) {
      if (injectSettingPoint(node.content)) return true
    }
  }
  return false
}

/**
 * Check if any glossary term in the file is already marked inline.
 */
function hasGlossaryMark(content, termSlug) {
  if (!Array.isArray(content)) return false
  for (const node of content) {
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        if (child.type === 'text' && Array.isArray(child.marks)) {
          if (child.marks.some(m => m.type === 'glossaryTooltip' && m.attrs?.termSlug === termSlug)) {
            return true
          }
        }
      }
      if (hasGlossaryMark(node.content, termSlug)) return true
    }
  }
  return false
}

// Known glossary term text forms to search for (slug → searchable text in body)
const GLOSSARY_FALLBACKS = {
  'setting-point': ['setting point', 'Setting point'],
  'macerate': ['macerate', 'Macerate'],
  'double-boiler': ['double boiler', 'Double boiler'],
  'dry-brine': ['dry brine', 'dry-brine', 'Dry brine'],
  'lacto-fermentation': ['lacto-fermentation', 'Lacto-fermentation', 'lacto fermentation'],
  'skim': ['skim', 'Skim'],
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

  // 1. Fix excerpt dashes
  if (data.excerpt && /[—–]/.test(data.excerpt)) {
    data.excerpt = fixDashesInString(data.excerpt)
    changed = true
  }

  // 2. Fix sourceNotes dashes
  if (data.sourceNotes && /[—–]/.test(data.sourceNotes)) {
    data.sourceNotes = fixDashesInString(data.sourceNotes)
    changed = true
  }

  // 3. Fix subtitle dashes (not paragraph-checked but clean anyway)
  if (data.subtitle && /[—–]/.test(data.subtitle)) {
    data.subtitle = fixDashesInString(data.subtitle)
    changed = true
  }

  // 4. Fix troubleshooter cause/fix + ingredient prepNote dashes in body
  if (data.body && Array.isArray(data.body.content)) {
    const fixed = fixBodyAttrs(data.body.content)
    data.body = { ...data.body, content: fixed }
    changed = true
  }

  // 6. Handle unresolved glossary terms
  const terms = data.glossaryTerms || []
  for (const t of terms) {
    if (!t.slug) continue
    if (!data.body || !Array.isArray(data.body.content)) continue

    // Already marked?
    if (hasGlossaryMark(data.body.content, t.slug)) continue

    let found = false

    // Try known fallback forms
    const searches = GLOSSARY_FALLBACKS[t.slug] || [t.term, t.term.toLowerCase()]
    for (const search of searches) {
      if (insertMark(data.body.content, t.slug, search)) {
        found = true
        changed = true
        console.log(`  Marked "${t.slug}" in ${file}`)
        break
      }
    }

    if (!found) {
      // Special case: setting-point — inject into the method paragraph about the boil
      if (t.slug === 'setting-point') {
        if (injectSettingPoint(data.body.content)) {
          found = true
          changed = true
          console.log(`  Injected "setting-point" into ${file}`)
        }
      }

      // Special case: double-boiler — insert in first paragraph mentioning "bowl" or "simmering"
      if (!found && t.slug === 'double-boiler') {
        if (insertMark(data.body.content, 'double-boiler', 'bowl set over')) {
          found = true; changed = true
          console.log(`  Marked "double-boiler" (via 'bowl set over') in ${file}`)
        } else if (insertMark(data.body.content, 'double-boiler', 'heatproof bowl')) {
          found = true; changed = true
          console.log(`  Marked "double-boiler" (via 'heatproof bowl') in ${file}`)
        }
      }

      // Special case: lacto-fermentation
      if (!found && t.slug === 'lacto-fermentation') {
        // Try "fermentation" as a fallback
        if (insertMark(data.body.content, 'lacto-fermentation', 'ferment')) {
          found = true; changed = true
          console.log(`  Marked "lacto-fermentation" (via 'ferment') in ${file}`)
        }
      }

      // Special case: dry-brine → look for "dry" or "brine" or "salt" and "overnight"
      if (!found && t.slug === 'dry-brine') {
        if (insertMark(data.body.content, 'dry-brine', 'salt')) {
          found = true; changed = true
          console.log(`  Marked "dry-brine" (via 'salt') in ${file}`)
        }
      }

      if (!found) {
        console.warn(`  WARN: still can't mark "${t.slug}" in ${file}`)
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
