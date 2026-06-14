/**
 * _fix-voice-blankets.ts
 * Mechanical voice-check fixups for knitting-bulk-003-blanket-briefs.
 * Fixes:
 *   1. em-dash / en-dash in text nodes → comma or full stop as appropriate
 *   2. "a tapestry" (banned phrase) → "the tapestry"
 *
 * Run: pnpm --filter @homemade/db exec tsx scripts/_fix-voice-blankets.ts
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(process.cwd(), '..', '..', 'docs', 'knitting-bulk-003-blanket-briefs')

function fixText(s: string): string {
  // Replace em-dash and en-dash with a comma+space or period depending on context.
  // Rule: if the char is surrounded by alphanumeric / space, replace with comma.
  // Handles:  "something — something else"  →  "something, something else"
  s = s.replace(/ [—–] /g, ', ')
  // Handles:  "something—something"  →  "something, something"
  s = s.replace(/[—–]/g, ', ')
  // Banned phrase
  s = s.replace(/\ba tapestry\b/g, 'the tapestry')
  return s
}

function walkNode(node: unknown): unknown {
  if (node === null || typeof node !== 'object') return node

  if (Array.isArray(node)) {
    return node.map(walkNode)
  }

  const obj = node as Record<string, unknown>

  // Fix text leaf
  if (obj['type'] === 'text' && typeof obj['text'] === 'string') {
    return { ...obj, text: fixText(obj['text'] as string) }
  }

  // Fix suppliesCard item fields
  if (obj['type'] === 'suppliesCard' && obj['attrs']) {
    const attrs = obj['attrs'] as Record<string, unknown>
    if (Array.isArray(attrs['items'])) {
      const fixed = attrs['items'].map((item: unknown) => {
        if (item && typeof item === 'object') {
          const it = item as Record<string, unknown>
          return {
            ...it,
            name: typeof it['name'] === 'string' ? fixText(it['name']) : it['name'],
            qty: typeof it['qty'] === 'string' ? fixText(it['qty']) : it['qty'],
          }
        }
        return item
      })
      return { ...obj, attrs: { ...attrs, items: fixed } }
    }
  }

  // Recurse into all properties
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    result[k] = walkNode(v)
  }
  return result
}

function fixTopLevel(doc: Record<string, unknown>): Record<string, unknown> {
  // Fix subtitle, excerpt, sourceNotes at the top level
  const out = { ...doc }
  for (const field of ['subtitle', 'excerpt', 'sourceNotes'] as const) {
    if (typeof out[field] === 'string') {
      out[field] = fixText(out[field] as string)
    }
  }
  // Fix body
  if (out['body']) {
    out['body'] = walkNode(out['body'])
  }
  return out
}

const files = readdirSync(DIR).filter(f => f.endsWith('.json'))
let count = 0
for (const f of files) {
  const path = join(DIR, f)
  const raw = readFileSync(path, 'utf8')
  const doc = JSON.parse(raw) as Record<string, unknown>
  const fixed = fixTopLevel(doc)
  const out = JSON.stringify(fixed, null, 2) + '\n'
  if (out !== raw) {
    writeFileSync(path, out, 'utf8')
    console.log(`fixed: ${f}`)
    count++
  } else {
    console.log(`clean: ${f}`)
  }
}
console.log(`\n${count} files updated.`)
