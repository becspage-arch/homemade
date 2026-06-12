/**
 * One-off: dump description + recommendedFabrics for the 8 S-8b test-batch
 * picks so prompts can be built from real metadata. Throwaway.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let dir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}

import { prisma } from '@homemade/db'

const PICKS = [
  'sewing-hair-scrunchie',
  'sewing-mens-tie-standard',
  'sewing-tote-bag-interfaced-handles',
  'sewing-pencil-case-zip',
  'sewing-simple-backpack-drawstring',
  'sewing-cushion-cover-envelope-back',
  'sewing-tea-towel-mitred-corners',
  'sewing-drum-lampshade-cover',
]

async function main(): Promise<void> {
  const rows = await prisma.sewingPattern.findMany({
    where: { slug: { in: PICKS } },
    select: {
      slug: true,
      name: true,
      description: true,
      garmentCategory: true,
      garmentType: true,
      recommendedFabrics: true,
    },
  })
  for (const p of PICKS) {
    const r = rows.find((x) => x.slug === p)
    if (!r) {
      console.log(`MISSING: ${p}`)
      continue
    }
    console.log(`\n=== ${r.slug} [${r.garmentCategory}] ===`)
    console.log(`name: ${r.name}`)
    console.log(`type: ${r.garmentType ?? ''}`)
    console.log(`desc: ${r.description ?? ''}`)
    console.log(`fabrics:`, JSON.stringify(r.recommendedFabrics))
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
