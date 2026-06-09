/**
 * fix-herbal-bulk002.mjs
 * Applies systematic voice-check fixes across all herbal-bulk-002-briefs/*.json files.
 *
 * Run from repo root:
 *   node docs/fix-herbal-bulk002.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const BRIEFS_DIR = 'docs/herbal-bulk-002-briefs'
const files = readdirSync(BRIEFS_DIR).filter(f => f.endsWith('.json'))

let totalFilesChanged = 0
let totalTextChanges = 0

// --- text-level replacements applied to every plain text node ---
const TEXT_REPLACEMENTS = [
  // em-dash (must go first)
  { from: / — /g, to: '; ' },
  { from: /—/g, to: '-' },
  { from: / – /g, to: '; ' },

  // year-in-body patterns
  { from: /\(1652\)/g, to: '' },
  { from: /\(1898\)/g, to: '' },
  { from: /\(1931\)/g, to: '' },
  { from: /\(1983\/1996\)/g, to: '' },
  { from: /\(1989\)/g, to: '' },
  { from: /\(1989-2001\)/g, to: '' },
  { from: /\(1999\)/g, to: '' },
  { from: /\(2002\)/g, to: '' },
  { from: /\(2007\)/g, to: '' },
  { from: /\(2008\)/g, to: '' },
  { from: /\(2010\)/g, to: '' },
  { from: /\(2011\)/g, to: '' },
  { from: /\(2012\)/g, to: '' },
  { from: /\(2013\)/g, to: '' },
  { from: /\(2014\)/g, to: '' },
  { from: /\(2016\)/g, to: '' },
  { from: /\(2018\)/g, to: '' },

  // institutional names in body — replace whole institutional clauses
  // Remove standalone EMA ref phrases
  { from: /The EMA monograph supports this: /g, to: '' },
  { from: /The EMA monograph supports the traditional use for/g, to: 'Traditional western herbal use covers' },
  { from: /The EMA monograph notes a well-established use for/g, to: 'Traditional western herbal use covers' },
  { from: /The EMA monograph supports the traditional external use for/g, to: 'Traditional western herbal use covers' },
  { from: /The EMA's 2014 monograph established a well-established use for/g, to: 'Traditional western herbal use covers' },
  { from: /The EMA reference dose[^.]*\./g, to: '' },
  { from: /per the EMA monograph/g, to: 'at standard doses' },
  { from: /the EMA monograph/g, to: 'the traditional herbal reference' },
  { from: /EMA HMPC monograph/g, to: 'the herbal reference' },
  { from: /EMA HMPC/g, to: 'the European herbal regulator' },
  { from: /EMA monograph/g, to: 'the herbal reference' },
  { from: /\bEMA\b/g, to: 'the European herbal regulator' },
  { from: /British Herbal Pharmacopoeia \([^)]+\)/g, to: 'the British Herbal Pharmacopoeia' },
  { from: /\bBHP\b/g, to: 'the British Herbal Pharmacopoeia' },
  { from: /\bWHO\b/g, to: 'the World Health Organisation' },
  { from: /\bMHRA\b/g, to: 'the UK medicines regulator' },

  // historical-figure gloss fixes
  { from: /Maud Grieve records/g, to: 'Maud Grieve, the early 20th-century botanical writer, records' },
  { from: /Maud Grieve \(1931\) records/g, to: 'Maud Grieve, the early 20th-century botanical writer, records' },
  { from: /Maud Grieve \(1931\) devotes/g, to: 'Maud Grieve, the early 20th-century botanical writer, devotes' },
  { from: /Maud Grieve \(1931\) documents/g, to: 'Maud Grieve, the early 20th-century botanical writer, documents' },
  { from: /Maud Grieve \(1931\) describes/g, to: 'Maud Grieve, the early 20th-century botanical writer, describes' },
  { from: /Maud Grieve records/g, to: 'Maud Grieve, the early 20th-century botanical writer, records' },
  // After prior replacements, bare "Grieve" still needs a gloss if it appears
  { from: /(?<!\w)Grieve(?!\w)/g, to: 'Grieve (the early 20th-century botanical writer)' },
  // Culpeper gloss
  { from: /Nicholas Culpeper records/g, to: 'Nicholas Culpeper, the 17th-century herbalist, records' },
  { from: /Nicholas Culpeper \(1652\)/g, to: 'Nicholas Culpeper, the 17th-century herbalist,' },
  { from: /Nicholas Culpeper calls/g, to: 'Nicholas Culpeper, the 17th-century herbalist, calls' },
  { from: /Nicholas Culpeper recommends/g, to: 'Nicholas Culpeper, the 17th-century herbalist, recommends' },
  { from: /Culpeper recommends/g, to: 'Culpeper, the 17th-century herbalist, recommends' },
  { from: /Culpeper calls/g, to: 'Culpeper, the 17th-century herbalist, calls' },
  { from: /Culpeper \(1652\)/g, to: 'Culpeper, the 17th-century herbalist,' },
  { from: /(?<!\w)Culpeper(?!\w)/g, to: 'Culpeper (the 17th-century herbalist)' },

  // Medical claim: "treats"
  { from: /\btreats\b/g, to: 'traditionally used for' },

  // Banned phrase
  { from: /\bessentially\b/g, to: 'in practice' },

  // Medical referral with prescriptive verb - the "prescriptive verb" errors are usually
  // sentences like "Consult X" appearing in a dosing section without the right framing.
  // These are context-dependent; leave for manual fix if needed.

  // Clinical vocabulary replacements (body prose only, outside tooltips)
  { from: /\bconstituents\b/g, to: 'active compounds' },
  { from: /\bmonograph\b/g, to: 'reference entry' },
  { from: /\banti-inflammatory\b/g, to: 'inflammation-calming' },
  { from: /\banti-inflammatory\b/g, to: 'inflammation-calming' },
  { from: /\bpharmacopoeia\b/g, to: 'herbal pharmacopoeia' },
  { from: /\bpharmacology\b/g, to: 'chemistry' },
  { from: /\bphytotherapy\b/g, to: 'herbal medicine' },
  { from: /\bclinical-trial\b/g, to: 'study' },

  // These only apply outside glossaryTooltip marks (plain text nodes)
  // volatile oils - only replace if not in a tooltip context
  { from: /\bvolatile oils\b/g, to: 'aromatic oils' },
  { from: /\bvolatile oil\b/g, to: 'aromatic oil' },

  // "maceration" - replace if not wrapped in tooltip
  // Keep "maceration" in the context of tincture making but use "soaking" elsewhere
  // Actually let the tooltip check handle this: for plain text, use "soaking process"
  // But be careful not to break the glossary tooltip for tinctures
]

// Replacements that should ONLY happen in plain paragraph text (not in tooltip marks)
function applyTextReplacements(text) {
  let result = text
  for (const { from, to } of TEXT_REPLACEMENTS) {
    result = result.replace(from, to)
  }
  // Clean up doubled spaces
  result = result.replace(/  +/g, ' ')
  // Clean up trailing/leading spaces from year removal
  result = result.replace(/ ,/g, ',')
  result = result.replace(/  /g, ' ')
  return result
}

// Walk a TipTap doc JSON and apply text replacements to plain text nodes
// (skip nodes that are inside glossaryTooltip marks, which already have canonical text)
function fixDoc(node, changes) {
  if (!node || typeof node !== 'object') return node
  if (Array.isArray(node)) return node.map(n => fixDoc(n, changes))

  // Don't touch text inside a glossaryTooltip mark
  const isTooltipText = node.marks && node.marks.some(m => m.type === 'glossaryTooltip')
  if (isTooltipText) return node

  if (node.type === 'text' && typeof node.text === 'string') {
    const original = node.text
    const fixed = applyTextReplacements(original)
    if (fixed !== original) {
      changes.push({ from: original.substring(0, 60), to: fixed.substring(0, 60) })
    }
    return { ...node, text: fixed }
  }

  // Apply to infoPanel body (which is a string, not a TipTap tree)
  if (node.type === 'infoPanel' && node.attrs && typeof node.attrs.body === 'string') {
    const original = node.attrs.body
    const fixed = applyTextReplacements(original)
    if (fixed !== original) {
      changes.push({ from: original.substring(0, 60), to: fixed.substring(0, 60) })
      return { ...node, attrs: { ...node.attrs, body: fixed } }
    }
    return node
  }

  if (node.content && Array.isArray(node.content)) {
    return { ...node, content: node.content.map(n => fixDoc(n, changes)) }
  }

  return node
}

// Also apply replacements to string fields at the top level (excerpt, subtitle, sourceNotes)
function fixTopLevel(obj) {
  const STRING_FIELDS = ['excerpt', 'subtitle', 'sourceNotes', 'makeAheadNotes', 'batchNotes', 'freezeNotes']
  const result = { ...obj }
  const changes = []
  for (const field of STRING_FIELDS) {
    if (typeof result[field] === 'string') {
      const original = result[field]
      const fixed = applyTextReplacements(original)
      if (fixed !== original) {
        result[field] = fixed
        changes.push({ field, from: original.substring(0, 40), to: fixed.substring(0, 40) })
      }
    }
  }
  // Fix recipe nested strings
  if (result.recipe && typeof result.recipe === 'object') {
    for (const field of ['makeAheadNotes', 'batchNotes', 'freezeNotes', 'temperatureNote']) {
      if (typeof result.recipe[field] === 'string') {
        const original = result.recipe[field]
        const fixed = applyTextReplacements(original)
        if (fixed !== original) {
          result.recipe = { ...result.recipe, [field]: fixed }
          changes.push({ field: `recipe.${field}`, from: original.substring(0, 40), to: fixed.substring(0, 40) })
        }
      }
    }
  }
  return { result, changes }
}

for (const filename of files) {
  const filepath = join(BRIEFS_DIR, filename)
  const raw = readFileSync(filepath, 'utf8')
  const doc = JSON.parse(raw)

  // Fix top-level string fields
  const { result: docFixed1, changes: topChanges } = fixTopLevel(doc)

  // Fix body
  const bodyChanges = []
  const newBody = docFixed1.body ? fixDoc(docFixed1.body, bodyChanges) : docFixed1.body

  // Fix projectSchedule title/body strings
  let projectScheduleFixed = docFixed1.projectSchedule
  const schedChanges = []
  if (Array.isArray(docFixed1.projectSchedule)) {
    projectScheduleFixed = docFixed1.projectSchedule.map(step => {
      const origTitle = step.title || ''
      const origBody = step.body || ''
      const fixedTitle = applyTextReplacements(origTitle)
      const fixedBody = applyTextReplacements(origBody)
      if (fixedTitle !== origTitle || fixedBody !== origBody) {
        schedChanges.push({ step: step.stepNumber, title: fixedTitle !== origTitle, body: fixedBody !== origBody })
      }
      return { ...step, title: fixedTitle, body: fixedBody }
    })
  }

  const allChanges = [...topChanges, ...bodyChanges, ...schedChanges]
  if (allChanges.length > 0) {
    const finalDoc = { ...docFixed1, body: newBody, projectSchedule: projectScheduleFixed }
    writeFileSync(filepath, JSON.stringify(finalDoc, null, 2))
    console.log(`[fixed] ${filename}: ${allChanges.length} changes`)
    totalFilesChanged++
    totalTextChanges += allChanges.length
  }
}

console.log(`\nDone. Files changed: ${totalFilesChanged}, total changes: ${totalTextChanges}`)
