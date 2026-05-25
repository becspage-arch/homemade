/**
 * One-shot diagnostic: find the calibration cases Rebecca named and emit
 * their current hero image URLs so the worker can read them and confirm
 * the strict relevance scorer assigns the expected verdicts.
 *
 * Expected verdicts:
 *   - fish-and-chips             → EXACT  (Rebecca confirmed correct)
 *   - yorkshire-pudding(s)       → WRONG  (showed pasta)
 *   - bubble-and-squeak (food)   → WRONG  (showed a Christmas-tree bauble)
 *   - angel-food-cake            → WRONG  (cake with cherub figurine)
 *   - beef-wellington            → WRONG  (cut without pastry casing)
 *   - thyme-cough-syrup          → WRONG  (showed a honey bee)
 *
 * Also emits a generous fuzzy match so we surface near-name slugs.
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
import { prisma } from '../src'

const TARGETS = [
  'fish-and-chips',
  'yorkshire-pudding',
  'yorkshire-puddings',
  'bubble-and-squeak',
  'angel-food-cake',
  'beef-wellington',
  'thyme-cough-syrup',
]

async function main() {
  for (const target of TARGETS) {
    const matches = await prisma.tutorial.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { slug: target },
          { slug: { contains: target } },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        category: { select: { slug: true } },
        subCategory: { select: { slug: true } },
        hero: {
          select: {
            id: true,
            r2Key: true,
            source: true,
            verificationStatus: true,
          },
        },
      },
      take: 5,
    })
    if (matches.length === 0) {
      console.log(`\n${target}: (no match)`)
      continue
    }
    console.log(`\n${target}:`)
    for (const m of matches) {
      const url = m.hero?.r2Key ? `https://media.homemade.education/${m.hero.r2Key}` : '(no hero)'
      console.log(`  - ${m.slug}  [${m.category.slug}${m.subCategory ? '/' + m.subCategory.slug : ''}]`)
      console.log(`    media=${m.hero?.id ?? 'none'} source=${m.hero?.source ?? 'none'} status=${m.hero?.verificationStatus ?? 'none'}`)
      console.log(`    url=${url}`)
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
