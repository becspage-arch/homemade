/**
 * S-8a spike v2. Renders 5 representative patterns through the
 * production renderer (apps/web/src/lib/sewing/hero-flat) and writes
 * the SVGs to apps/web/scripts/s8a-spike-output/ for visual review.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/s8a-spike.ts
 *
 * No DB writes. Same renderer path the full 48-pattern batch uses.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { renderFlatForSlug } from '../src/lib/sewing/hero-flat/render-flat'

const OUT_DIR = path.resolve(__dirname, 's8a-spike-output')
mkdirSync(OUT_DIR, { recursive: true })

const SLUGS = [
  'freesewing-bella-body-block',
  'freesewing-brian-body-block',
  'freesewing-aaron-knit-a-shirt',
  'sewing-tote-bag-interfaced-handles',
  'sewing-pillowcase-housewife-french-seam',
]

for (const slug of SLUGS) {
  const rendered = renderFlatForSlug(slug)
  if (!rendered) {
    console.log(`SKIP ${slug} — no archetype mapped`)
    continue
  }
  const file = path.join(OUT_DIR, `${slug}.svg`)
  writeFileSync(file, rendered.svg, 'utf8')
  console.log(`wrote ${path.relative(process.cwd(), file)} (cache=${rendered.cacheKey.slice(0, 12)})`)
}
