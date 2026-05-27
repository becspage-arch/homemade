/**
 * Programmatic sweep over batch28 files. Fixes:
 *   - em/en dashes in body text → commas / periods
 *   - safety-tone infoPanels → removed (their substance, if any, moves inline at apply time)
 *
 * Grade-level paragraphs need manual rewriting elsewhere.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const dir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-27-batch28')
const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))

/**
 * Replace em (—) and en (–) dashes with commas in most contexts.
 * Common patterns:
 *   "X — Y"   →  "X, Y"           (parenthetical / clausal)
 *   "X—Y"     →  "X, Y"
 *   "X – Y"   →  "X, Y"
 *   "10–20"   →  "10 to 20"       (numeric range)
 *   "Step 1 — Verb …" → "Step 1. Verb …" (step prefix)
 */
function replaceDashes(text: string): string {
  let s = text
  // Numeric range e.g. "10–20", "15-20" (en-dash only; ascii hyphen left alone)
  s = s.replace(/(\d)\s*–\s*(\d)/g, '$1 to $2')
  s = s.replace(/(\d)\s*—\s*(\d)/g, '$1 to $2')
  // Step prefix: "Step 1 —" → "Step 1." (capitalise next letter remains)
  s = s.replace(/\b(Step\s+\d+)\s*[—–]\s*/g, '$1. ')
  // Spaced em/en dash → ", "
  s = s.replace(/\s+[—–]\s+/g, ', ')
  // Non-spaced em/en dash → ", "
  s = s.replace(/[—–]/g, ', ')
  // Collapse accidental double-comma + double-spacing.
  s = s.replace(/,\s*,/g, ',')
  s = s.replace(/\s{2,}/g, ' ')
  // Fix ". ," / ", ." artefacts.
  s = s.replace(/\.\s*,/g, '.')
  s = s.replace(/,\s*\./g, '.')
  return s
}

function walk(node: any): void {
  if (!node || typeof node !== 'object') return
  if (typeof node.text === 'string') {
    node.text = replaceDashes(node.text)
  }
  if (Array.isArray(node.content)) {
    for (const c of node.content) walk(c)
  }
  if (node.attrs && typeof node.attrs === 'object') {
    // suppliesCard, infoPanel, troubleshooter etc. carry prose in attrs.
    for (const k of Object.keys(node.attrs)) {
      const v = (node.attrs as Record<string, unknown>)[k]
      if (typeof v === 'string') {
        ;(node.attrs as Record<string, unknown>)[k] = replaceDashes(v)
      } else if (Array.isArray(v)) {
        for (const item of v) {
          if (item && typeof item === 'object') {
            for (const ik of Object.keys(item)) {
              const iv = (item as Record<string, unknown>)[ik]
              if (typeof iv === 'string') {
                ;(item as Record<string, unknown>)[ik] = replaceDashes(iv)
              }
            }
          }
        }
      }
    }
  }
}

function removeSafetyInfoPanels(doc: any): number {
  if (!doc || !Array.isArray(doc.content)) return 0
  const SAFETY_KEYWORDS = [
    'before you start',
    'safety warnings',
    'safety notes',
    'important safety',
    'eye protection',
    'personal protective equipment',
    ' ppe',
    'first aid',
  ]
  const filtered: any[] = []
  let removed = 0
  for (const node of doc.content) {
    if (node?.type === 'infoPanel') {
      const a = node.attrs ?? {}
      const tone = typeof a.tone === 'string' ? a.tone : ''
      const title = typeof a.title === 'string' ? a.title : ''
      const body = typeof a.body === 'string' ? a.body : ''
      const titleLower = title.toLowerCase()
      const hasSafetyTitle = SAFETY_KEYWORDS.some((kw) => titleLower.includes(kw))
      const wordCount = body.trim().split(/\s+/).filter(Boolean).length
      if (tone === 'warning' && (hasSafetyTitle || wordCount > 25)) {
        removed++
        continue
      }
    }
    if (node?.type === 'heading') {
      const text = (node.content ?? []).map((c: any) => c?.text ?? '').join('').toLowerCase()
      const hasSafetyTitle = SAFETY_KEYWORDS.some((kw) => text.includes(kw))
      if (hasSafetyTitle) {
        removed++
        continue
      }
    }
    filtered.push(node)
  }
  doc.content = filtered
  return removed
}

let totalChanged = 0
let totalDashesNumChanged = 0
const safetyRemoved: Record<string, number> = {}

for (const file of files) {
  const fp = resolve(dir, file)
  const original = readFileSync(fp, 'utf8')
  const data: any = JSON.parse(original)
  // Count dashes before
  const beforeDashes = (original.match(/[—–]/g) ?? []).length
  walk(data.body)
  if (typeof data.subtitle === 'string') data.subtitle = replaceDashes(data.subtitle)
  if (typeof data.excerpt === 'string') data.excerpt = replaceDashes(data.excerpt)
  // sourceNotes stays untouched (allowed there).
  const removed = removeSafetyInfoPanels(data.body)
  if (removed > 0) safetyRemoved[file] = removed
  const after = JSON.stringify(data, null, 2) + '\n'
  if (after !== original) {
    writeFileSync(fp, after, 'utf8')
    totalChanged++
    totalDashesNumChanged += beforeDashes
    console.log(`[FIX] ${file} (${beforeDashes} dashes, ${removed} safety blocks)`)
  }
}

console.log(`\n${totalChanged} files changed (${totalDashesNumChanged} dashes total)`)
console.log(`safety blocks removed:`, safetyRemoved)
