import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = join(process.cwd(), '..', '..', 'docs', 'knitting-bulk-003-blanket-briefs')
const FILES = [
  'cabled-aran-single-bed-throw.json',
  'cable-rib-lap-throw.json',
  'cable-stripe-baby-blanket.json',
  'centre-out-heirloom-blanket.json',
  'chevron-stripe-lap-throw.json',
  'eyelet-border-baby-blanket.json',
  'fair-isle-baby-blanket.json',
  'heirloom-christening-blanket.json',
  'nordic-stripe-lap-throw.json',
  'north-sea-aran-blanket.json',
]

for (const f of FILES) {
  const doc = JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Record<string, unknown>
  const terms = (doc['glossaryTerms'] as { slug: string; term: string }[]) ?? []
  console.log(`${f}: ${terms.map(t => `${t.slug}="${t.term}"`).join(', ')}`)
}
