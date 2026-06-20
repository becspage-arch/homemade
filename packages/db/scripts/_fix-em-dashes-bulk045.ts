/**
 * Fix em-dash and en-dash issues in cooking-bulk-045 briefs.
 * Also fixes: "fall" → "autumn", "genuinely" → removal.
 *
 * Em-dash replacement rules:
 *   " — " (surrounded by spaces) → ", "
 *   "— " (at start, e.g. after period) → ": "
 *   " —" (at end before period/comma) → ""
 *   "—" (glued to words) → ", "
 *   Same for en-dashes (–)
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const briefsDir = path.resolve(__dirname, '../../../docs/bulk-batch-045-briefs')

function fixText(text: string): string {
  // Fix "fall" → "autumn" (American English)
  text = text.replace(/\bfall\b/g, 'autumn')
  // Remove banned phrase "genuinely"
  text = text.replace(/\bgenuinely\b/gi, '')
  // Fix double spaces introduced by removal
  text = text.replace(/  +/g, ' ')
  // Fix " , " from "genuinely, " removal
  text = text.replace(/ , /g, ', ')
  // Fix em-dashes and en-dashes
  // Pattern: space-dash-space → comma-space
  text = text.replace(/ [—–] /g, ', ')
  // Pattern: dash at very start (after a period or start of string) → ": "
  text = text.replace(/^[—–] /g, '')
  text = text.replace(/\. [—–] /g, '. ')
  // Pattern: remaining dashes → comma
  text = text.replace(/[—–]/g, ', ')
  // Clean up ", ," artifacts
  text = text.replace(/, ,/g, ',')
  // Clean up ",." artifacts
  text = text.replace(/,\./g, '.')
  // Clean up "( ," artifacts
  text = text.replace(/\( ,/g, '(')
  // Clean up double spaces
  text = text.replace(/  +/g, ' ')
  return text
}

function walkAndFix(node: any): void {
  if (!node || typeof node !== 'object') return
  if (node.type === 'text' && typeof node.text === 'string') {
    node.text = fixText(node.text)
    return
  }
  // Fix troubleshooter attrs
  if (node.type === 'troubleshooter' && node.attrs && Array.isArray(node.attrs.items)) {
    for (const item of node.attrs.items) {
      if (typeof item.symptom === 'string') item.symptom = fixText(item.symptom)
      if (typeof item.cause === 'string') item.cause = fixText(item.cause)
      if (typeof item.fix === 'string') item.fix = fixText(item.fix)
    }
    return
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) walkAndFix(child)
  }
}

const files = fs.readdirSync(briefsDir).filter(f => f.endsWith('.json')).sort()
let fixed = 0

for (const fn of files) {
  const fp = path.join(briefsDir, fn)
  const j = JSON.parse(fs.readFileSync(fp, 'utf8'))

  // Fix sourceNotes (also checked by voice-check)
  if (typeof j.sourceNotes === 'string') {
    j.sourceNotes = fixText(j.sourceNotes)
  }
  // Fix excerpt
  if (typeof j.excerpt === 'string') {
    j.excerpt = fixText(j.excerpt)
  }
  // Fix subtitle
  if (typeof j.subtitle === 'string') {
    j.subtitle = fixText(j.subtitle)
  }

  // Fix body
  walkAndFix(j.body)

  fs.writeFileSync(fp, JSON.stringify(j, null, 2))
  fixed++
  process.stdout.write('.')
}

console.log(`\nFixed ${fixed} files`)
