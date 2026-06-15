/**
 * _show-grade-paragraphs.ts
 * Print the text of paragraphs at specific indices so we can rewrite them.
 * Usage: pnpm --filter @homemade/db exec tsx scripts/_show-grade-paragraphs.ts
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(process.cwd(), '..', '..', 'docs', 'knitting-bulk-003-blanket-briefs')

// Map of filename → paragraph indices that are failing
const TARGETS: Record<string, number[]> = {
  '2x2-rib-baby-blanket.json': [15],
  'brioche-rib-baby-blanket.json': [30],
  'brioche-two-colour-throw.json': [32],
  'cabled-aran-single-bed-throw.json': [0, 28],
  'cabled-panel-baby-blanket.json': [6],
  'cable-rib-lap-throw.json': [0, 29],
  'cable-stripe-baby-blanket.json': [0, 29],
  'centre-out-heirloom-blanket.json': [0, 30],
  'chevron-stripe-lap-throw.json': [0, 28],
  'chunky-garter-lap-throw.json': [14],
  'eyelet-border-baby-blanket.json': [0],
  'fair-isle-baby-blanket.json': [0],
  'fair-isle-lap-throw.json': [29],
  'feather-fan-lap-throw.json': [30],
  'fishermans-rib-lap-throw.json': [29],
  'garter-stitch-baby-blanket.json': [15],
  'garter-stitch-lap-throw.json': [21],
  'heirloom-christening-blanket.json': [0, 24, 33],
  'lace-panel-baby-blanket.json': [31],
  'log-cabin-colourwork-throw.json': [24],
  'nordic-stripe-lap-throw.json': [0],
  'north-sea-aran-blanket.json': [0, 28],
  'patchwork-garter-squares.json': [24],
  'seed-cable-panel-blanket.json': [29],
  'slip-stitch-mosaic-lap-throw.json': [30],
  'striped-garter-baby-blanket.json': [16],
  'strip-seam-sampler-throw.json': [23],
  'super-chunky-lap-throw.json': [27],
}

function getText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const obj = node as Record<string, unknown>
  if (obj['type'] === 'text' && typeof obj['text'] === 'string') return obj['text'] as string
  if (Array.isArray(obj['content'])) return (obj['content'] as unknown[]).map(getText).join('')
  return ''
}

function getBodyContent(body: unknown): unknown[] {
  if (!body || typeof body !== 'object') return []
  const b = body as Record<string, unknown>
  if (!Array.isArray(b['content'])) return []
  return b['content'] as unknown[]
}

for (const [file, indices] of Object.entries(TARGETS)) {
  const path = join(DIR, file)
  const raw = readFileSync(path, 'utf8')
  const doc = JSON.parse(raw) as Record<string, unknown>
  const nodes = getBodyContent(doc['body'])
  console.log(`\n=== ${file} (${nodes.length} body nodes) ===`)
  for (const idx of indices) {
    const node = nodes[idx] as Record<string, unknown> | undefined
    if (!node) {
      console.log(`  [node ${idx}]: NOT FOUND`)
    } else {
      const text = getText(node)
      console.log(`  [node ${idx}, type=${node['type']}]: "${text.slice(0, 250)}${text.length > 250 ? '...' : ''}"`)
    }
  }
}
