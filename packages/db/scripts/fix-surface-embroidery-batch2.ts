import * as fs from 'fs'
import * as path from 'path'

const DIR = path.join(__dirname, '../../../../docs/needlework-surface-embroidery-bulk-002')

// For each file, specify the fixes needed:
// - glossaryInserts: array of { termSlug, findText, wrapText }
//   where findText is the text node containing wrapText, and wrapText is the substring to wrap in a tooltip
// - emDashFixes: array of { location, oldText, newText }
// - gradeSimplify: array of { location, oldText, newText }

interface TextNode {
  type: 'text'
  text: string
  marks?: any[]
}

interface TooltipNode {
  type: 'glossaryTooltip'
  attrs: { termSlug: string }
  content: TextNode[]
}

// Deep-walk a TipTap doc and fix text nodes
function fixTextNode(node: any, termSlug: string, wrapText: string): boolean {
  if (!node) return false
  if (node.type === 'text' && typeof node.text === 'string' && node.text.includes(wrapText)) {
    // Can't modify in-place here — caller must handle array replacement
    return true
  }
  if (node.content && Array.isArray(node.content)) {
    for (let i = 0; i < node.content.length; i++) {
      const child = node.content[i]
      if (child.type === 'text' && typeof child.text === 'string' && child.text.includes(wrapText)) {
        const before = child.text.substring(0, child.text.indexOf(wrapText))
        const after = child.text.substring(child.text.indexOf(wrapText) + wrapText.length)
        const replacement: any[] = []
        if (before) replacement.push({ type: 'text', text: before })
        replacement.push({
          type: 'glossaryTooltip',
          attrs: { termSlug },
          content: [{ type: 'text', text: wrapText }]
        })
        if (after) replacement.push({ type: 'text', text: after })
        node.content.splice(i, 1, ...replacement)
        return true
      }
      if (fixTextNode(child, termSlug, wrapText)) return true
    }
  }
  return false
}

// Replace all em/en dashes in text nodes
function replaceEmDashes(node: any): void {
  if (!node) return
  if (node.type === 'text' && typeof node.text === 'string') {
    node.text = node.text.replace(/—/g, ',').replace(/–/g, ',')
    // More context-aware: "X — Y" → "X, Y" and "X — Y — Z" done by simple replace
    return
  }
  // Also fix string values inside attrs (troubleshooter items etc)
  if (node.attrs && typeof node.attrs === 'object') {
    for (const k of Object.keys(node.attrs)) {
      if (typeof node.attrs[k] === 'string') {
        node.attrs[k] = node.attrs[k].replace(/—/g, ',').replace(/–/g, ',')
      }
      if (Array.isArray(node.attrs[k])) {
        for (const item of node.attrs[k]) {
          if (typeof item === 'object' && item !== null) {
            for (const ik of Object.keys(item)) {
              if (typeof item[ik] === 'string') {
                item[ik] = item[ik].replace(/—/g, ',').replace(/–/g, ',')
              }
            }
          }
        }
      }
    }
  }
  // Fix excerpt (string property, not in body)
  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      replaceEmDashes(child)
    }
  }
}

// Fix em dashes in all string fields of a plain object (for top-level fields like excerpt)
function fixStringFields(obj: any): void {
  if (typeof obj !== 'object' || obj === null) return
  for (const k of Object.keys(obj)) {
    if (typeof obj[k] === 'string') {
      obj[k] = obj[k].replace(/—/g, ',').replace(/–/g, ',')
    } else if (typeof obj[k] === 'object') {
      fixStringFields(obj[k])
    }
  }
}

// Per-file fixes: glossary terms and which text to wrap
const glossaryFixes: Record<string, Array<{ termSlug: string; wrapText: string }>> = {
  '26-satin-shading.json': [], // already fixed manually above
  '27-single-loop-bullion.json': [
    { termSlug: 'bullion-barrel', wrapText: 'barrel' }
  ],
  '28-beaded-knot.json': [
    { termSlug: 'seed-bead', wrapText: 'seed bead' }
  ],
  '29-detached-chain.json': [
    { termSlug: 'tacking-stitch', wrapText: 'tacking stitch' }
  ],
  '30-chain-stitch.json': [
    { termSlug: 'chain-loop', wrapText: 'chain loop' }
  ],
  '31-fly-stitch.json': [
    { termSlug: 'anchor-tail', wrapText: 'anchor tail' }
  ],
  '32-herringbone-stitch.json': [
    { termSlug: 'herringbone-crossing', wrapText: 'herringbone crossing' }
  ],
  '33-feather-stitch.json': [
    { termSlug: 'feather-spine', wrapText: 'feather spine' }
  ],
  '34-blanket-stitch.json': [
    { termSlug: 'blanket-bar', wrapText: 'blanket bar' }
  ],
  '35-cretan-stitch.json': [
    { termSlug: 'cretan-spine', wrapText: 'cretan spine' }
  ],
  '36-twisted-chain.json': [
    { termSlug: 'chain-twist', wrapText: 'chain twist' }
  ],
  '37-heavy-chain.json': [
    { termSlug: 'double-link', wrapText: 'double link' }
  ],
  '38-double-feather-stitch.json': [
    { termSlug: 'double-branch', wrapText: 'double branch' }
  ],
  '39-basic-couching.json': [
    { termSlug: 'laid-thread', wrapText: 'laid thread' },
    { termSlug: 'binding-stitch', wrapText: 'binding stitch' }
  ],
  '40-bricked-couching.json': [
    { termSlug: 'brick-offset', wrapText: 'brick offset' }
  ],
  '41-trellis-couching.json': [
    { termSlug: 'trellis-grid', wrapText: 'trellis grid' }
  ],
  '42-pattern-couching.json': [
    { termSlug: 'tying-motif', wrapText: 'tying motif' }
  ],
  '43-laid-work-background.json': [
    { termSlug: 'first-layer', wrapText: 'first layer' }
  ],
  '44-spiders-web-variation.json': [
    { termSlug: 'whipped-spoke', wrapText: 'whipped spoke' }
  ],
  '45-raised-stem-stitch-wheel.json': [
    { termSlug: 'spoke-foundation', wrapText: 'spoke' }
  ],
}

// Grade simplifications: file → { location description, find text → replace text }
const gradeSimplify: Record<string, Array<{ find: string; replace: string }>> = {
  '39-basic-couching.json': [
    // grade-level at body > paragraph[8] > text — we'll just replace in body via em-dash fix + manual
  ],
  '41-trellis-couching.json': [],
  '42-pattern-couching.json': [],
}

function processFile(filename: string): void {
  const filepath = path.join(DIR, filename)
  if (!fs.existsSync(filepath)) {
    console.log(`SKIP (not found): ${filename}`)
    return
  }

  const raw = fs.readFileSync(filepath, 'utf8')
  const doc = JSON.parse(raw)

  // 1. Fix em dashes everywhere (all string fields)
  fixStringFields(doc)

  // 2. Apply glossary tooltip fixes
  const fixes = glossaryFixes[filename] || []
  for (const fix of fixes) {
    const found = fixTextNode(doc.body, fix.termSlug, fix.wrapText)
    if (!found) {
      console.log(`  WARNING: could not find "${fix.wrapText}" in body of ${filename} for term ${fix.termSlug}`)
    } else {
      console.log(`  + glossaryTooltip(${fix.termSlug}) added in ${filename}`)
    }
  }

  fs.writeFileSync(filepath, JSON.stringify(doc, null, 2) + '\n', 'utf8')
  console.log(`FIXED: ${filename}`)
}

async function main() {
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort()

  for (const file of files) {
    processFile(file)
  }

  console.log('\nAll done.')
}

main()
