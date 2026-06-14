/**
 * _fix-glossary-coverage.ts
 * Re-adds glossaryTooltip marks that were stripped when grade-level fixes
 * replaced the opening paragraph (node[0]) with plain text.
 *
 * Strategy:
 * 1. Replace the plain-text node[0] with a properly marked-up version.
 * 2. For cable-stripe-baby-blanket (where the term is C6F, not in node[0]),
 *    find the first occurrence of "C6F" in the body and wrap it.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(process.cwd(), '..', '..', 'docs', 'knitting-bulk-003-blanket-briefs')

function tip(slug: string, displayText: string): unknown {
  return { type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: slug } }], text: displayText }
}
function txt(s: string): unknown {
  return { type: 'text', text: s }
}
function para(...content: unknown[]): unknown {
  return { type: 'paragraph', content }
}

/** Map of filename → node[0] replacement (with tooltips). */
const NODE0_FIXES: Record<string, unknown> = {
  'cabled-aran-single-bed-throw.json': para(
    txt('A single-panel rectangle worked flat on 5 mm needles. The pattern uses four Aran panels: '),
    tip('honeycomb-cable', 'honeycomb cable'),
    txt(', '),
    tip('rope-cable', 'rope cable'),
    txt(', double-moss filler, and seed-stitch borders. Finished size: 140 cm by 200 cm.'),
  ),
  'cable-rib-lap-throw.json': para(
    txt('A single-panel rectangle worked flat on 5 mm needles. The pattern is a regular '),
    tip('cable-rib-repeat', 'cable-rib repeat'),
    txt(': six-stitch cables with two-purl separators. Finished size: 100 cm wide by 120 cm long.'),
  ),
  'centre-out-heirloom-blanket.json': para(
    txt('A 90 cm square blanket knitted by '),
    tip('centre-out-construction', 'centre-out construction'),
    txt(' on 4 mm needles. Four quadrants grow from an eight-stitch centre. Each RS row adds two stitches per quadrant. A simple vine lace repeat fills each quadrant.'),
  ),
  'chevron-stripe-lap-throw.json': para(
    txt('A single-panel rectangle worked flat on 4 mm needles. The pattern uses a two-colour chevron: '),
    tip('yarn-over', 'yarn over'),
    txt(' increases and '),
    tip('k2tog-decrease', 'k2tog'),
    txt(' decreases. Finished size: 100 cm wide by 120 cm long.'),
  ),
  'eyelet-border-baby-blanket.json': para(
    txt('A single-panel rectangle worked flat on 4 mm needles. A five-stitch '),
    tip('eyelet-border-knitting', 'eyelet border'),
    txt(' runs on all four sides. The centre is stocking stitch. Finished size: 75 cm wide by 90 cm long.'),
  ),
  'fair-isle-baby-blanket.json': para(
    txt('A single-panel rectangle worked flat on 4 mm needles. A ten-row two-colour '),
    tip('fair-isle-stranding', 'Fair Isle'),
    txt(' border sits at cast-on and cast-off. The centre is stocking stitch. Finished size: 75 cm wide by 90 cm long.'),
  ),
  'heirloom-christening-blanket.json': para(
    txt('A single-panel rectangle worked flat on 3 mm needles. The centre is '),
    tip('diamond-lace-mesh', 'diamond lace mesh'),
    txt('. A sixteen-row leaf-vine border frames all four sides. Finished size: 75 cm wide by 90 cm long when blocked.'),
  ),
  'nordic-stripe-lap-throw.json': para(
    txt('A single-panel rectangle worked flat on 5 mm needles. Five colours stripe in bold garter sections. All colours are '),
    tip('colour-carry-side', 'carried up the side'),
    txt(' throughout. Finished size: 100 cm wide by 120 cm long.'),
  ),
  'north-sea-aran-blanket.json': para(
    txt('A single-panel rectangle worked flat on 4.5 mm needles. The layout combines '),
    tip('horseshoe-cable', 'horseshoe cables'),
    txt(', '),
    tip('marriage-lines', 'marriage lines'),
    txt(', purl-ground moss diamonds, and seed-stitch anchor columns. Finished size: 90 cm wide by 110 cm long.'),
  ),
}

// Apply node[0] replacements
for (const [file, newNode] of Object.entries(NODE0_FIXES)) {
  const path = join(DIR, file)
  const raw = readFileSync(path, 'utf8')
  const doc = JSON.parse(raw) as Record<string, unknown>
  const body = doc['body'] as Record<string, unknown>
  const nodes = [...(body['content'] as unknown[])]
  nodes[0] = newNode
  const fixed = { ...doc, body: { ...body, content: nodes } }
  writeFileSync(path, JSON.stringify(fixed, null, 2) + '\n', 'utf8')
  console.log(`fixed node[0]: ${file}`)
}

// Special case: cable-stripe-baby-blanket — find C6F in the body and wrap it
{
  const file = 'cable-stripe-baby-blanket.json'
  const path = join(DIR, file)
  const raw = readFileSync(path, 'utf8')
  const doc = JSON.parse(raw) as Record<string, unknown>
  const body = doc['body'] as Record<string, unknown>
  const nodes = (body['content'] as unknown[])

  function wrapFirstC6F(nodes: unknown[]): { found: boolean; nodes: unknown[] } {
    let found = false
    const out = nodes.map(node => {
      if (found) return node
      const n = node as Record<string, unknown>
      if (n['type'] === 'paragraph' && Array.isArray(n['content'])) {
        let paraFixed = false
        const newContent = (n['content'] as unknown[]).flatMap(child => {
          if (found || paraFixed) return [child]
          const c = child as Record<string, unknown>
          if (c['type'] === 'text' && typeof c['text'] === 'string' && (c['text'] as string).includes('C6F')) {
            const t = c['text'] as string
            const idx = t.indexOf('C6F')
            const before = t.slice(0, idx)
            const after = t.slice(idx + 3)
            found = true
            paraFixed = true
            const parts: unknown[] = []
            if (before) parts.push({ type: 'text', text: before })
            parts.push({ type: 'text', marks: [{ type: 'glossaryTooltip', attrs: { termSlug: 'cable-6-front' } }], text: 'C6F' })
            if (after) parts.push({ type: 'text', text: after })
            return parts
          }
          return [child]
        })
        if (paraFixed) return { ...n, content: newContent }
      }
      return node
    })
    return { found, nodes: out }
  }

  const { found, nodes: fixedNodes } = wrapFirstC6F(nodes)
  if (found) {
    const fixed = { ...doc, body: { ...body, content: fixedNodes } }
    writeFileSync(path, JSON.stringify(fixed, null, 2) + '\n', 'utf8')
    console.log(`fixed C6F tooltip: ${file}`)
  } else {
    console.error(`WARNING: C6F not found in body of ${file} — manual fix needed`)
  }
}

console.log('\nDone.')
