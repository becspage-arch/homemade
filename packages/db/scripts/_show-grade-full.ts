import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(process.cwd(), '..', '..', 'docs', 'knitting-bulk-003-blanket-briefs')

const TARGETS: Record<string, number[]> = {
  'brioche-rib-baby-blanket.json': [30],
  'brioche-two-colour-throw.json': [32],
  'cabled-aran-single-bed-throw.json': [28],
  'cable-rib-lap-throw.json': [29],
  'cable-stripe-baby-blanket.json': [29],
  'centre-out-heirloom-blanket.json': [30],
  'chevron-stripe-lap-throw.json': [28],
  'fair-isle-lap-throw.json': [29],
  'feather-fan-lap-throw.json': [30],
  'fishermans-rib-lap-throw.json': [29],
  'garter-stitch-lap-throw.json': [21],
  'heirloom-christening-blanket.json': [24, 33],
  'lace-panel-baby-blanket.json': [31],
  'log-cabin-colourwork-throw.json': [24],
  'north-sea-aran-blanket.json': [28],
  'patchwork-garter-squares.json': [24],
  'seed-cable-panel-blanket.json': [29],
  'slip-stitch-mosaic-lap-throw.json': [30],
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

for (const [file, indices] of Object.entries(TARGETS)) {
  const path = join(DIR, file)
  const raw = readFileSync(path, 'utf8')
  const doc = JSON.parse(raw) as Record<string, unknown>
  const body = doc['body'] as Record<string, unknown>
  const nodes = body['content'] as unknown[]
  console.log(`\n=== ${file} ===`)
  for (const idx of indices) {
    const node = nodes[idx] as Record<string, unknown> | undefined
    if (!node) {
      console.log(`  [node ${idx}]: NOT FOUND`)
    } else {
      const text = getText(node)
      console.log(`  [node ${idx}]: "${text}"`)
    }
  }
}
