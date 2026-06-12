/**
 * One-off: list SewingPattern rows in the bag / home / accessory garmentCategory
 * sets so the S-8b test batch knows which slugs are eligible. Throwaway.
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

async function main(): Promise<void> {
  const rows = await prisma.sewingPattern.findMany({
    where: {
      garmentCategory: { in: ['BAGS', 'HOME', 'ACCESSORIES'] },
    },
    select: {
      slug: true,
      name: true,
      garmentCategory: true,
      garmentType: true,
      description: true,
      recommendedFabrics: true,
      visibility: true,
    },
    orderBy: [{ garmentCategory: 'asc' }, { name: 'asc' }],
  })
  console.log(`Total bag/home/accessory patterns: ${rows.length}`)
  for (const r of rows) {
    console.log(`  [${r.garmentCategory}] ${r.slug} :: ${r.name} (visibility=${r.visibility}, type=${r.garmentType ?? ''})`)
  }
  const grouped: Record<string, number> = {}
  for (const r of rows) grouped[r.garmentCategory] = (grouped[r.garmentCategory] ?? 0) + 1
  console.log('By category:', grouped)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
