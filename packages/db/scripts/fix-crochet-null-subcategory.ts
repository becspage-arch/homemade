/**
 * Part 7 — Fix null subCategoryId on crochet PUBLISHED tutorials.
 *
 * Uses title keywords to classify each tutorial into the correct crochet
 * SubCategory. Idempotent: only touches rows with subCategoryId = null.
 *
 * Run with:
 *   cd packages/db && npx tsx scripts/fix-crochet-null-subcategory.ts
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

// Title keywords -> subCategory slug mapping (priority order: first match wins)
const SLUG_RULES: { keywords: string[]; subCatSlug: string }[] = [
  { keywords: ['foundation', 'chain', 'slip stitch', 'magic ring', 'starting', 'cast on'], subCatSlug: 'foundations' },
  { keywords: ['stitch', 'treble', 'double crochet', 'half treble', 'dc', 'tr ', 'htr', 'spike', 'bobble', 'cluster', 'puff', 'popcorn', 'shell', 'v-stitch'], subCatSlug: 'stitches' },
  { keywords: ['motif', 'granny square', 'hexagon', 'circle', 'flower', 'mandala', 'medallion'], subCatSlug: 'motifs' },
  { keywords: ['cushion', 'blanket', 'throw', 'dishcloth', 'facecloth', 'bag', 'basket', 'pot holder', 'coaster', 'homeware', 'home'], subCatSlug: 'homewares' },
  { keywords: ['sweater', 'jumper', 'cardigan', 'hat', 'beanie', 'scarf', 'shawl', 'cowl', 'gloves', 'mittens', 'socks', 'top', 'vest', 'garment', 'wearable'], subCatSlug: 'garments' },
]

function pickSubCat(title: string): string | null {
  const lower = title.toLowerCase()
  for (const rule of SLUG_RULES) {
    if (rule.keywords.some((k) => lower.includes(k.toLowerCase()))) {
      return rule.subCatSlug
    }
  }
  // Default to stitches for unclassified crochet technique tutorials
  return 'stitches'
}

async function main() {
  const cat = await prisma.category.findUnique({
    where: { slug: 'crochet' },
    select: { id: true },
  })
  if (!cat) {
    console.log('No crochet category found. Exiting.')
    return
  }

  const subCats = await prisma.subCategory.findMany({
    where: { categoryId: cat.id },
    select: { id: true, slug: true },
  })
  const subCatBySlug = Object.fromEntries(subCats.map((s) => [s.slug, s.id]))

  const tutorials = await prisma.tutorial.findMany({
    where: {
      categoryId: cat.id,
      subCategoryId: null,
      status: 'PUBLISHED',
    },
    select: { id: true, slug: true, title: true },
  })

  if (tutorials.length === 0) {
    console.log('No null-subCategoryId PUBLISHED crochet tutorials found. Nothing to do.')
    return
  }

  console.log(`Found ${tutorials.length} null-subCategoryId PUBLISHED crochet tutorials.\n`)
  console.log('slug | title | assigned subCategory')
  console.log('-----|-------|---------------------')

  for (const t of tutorials) {
    const subCatSlug = pickSubCat(t.title)
    const subCatId = subCatSlug ? subCatBySlug[subCatSlug] : null

    if (!subCatId) {
      console.log(`${t.slug} | ${t.title} | SKIPPED (no subCat match)`)
      continue
    }

    await prisma.tutorial.update({
      where: { id: t.id },
      data: { subCategoryId: subCatId },
    })

    console.log(`${t.slug} | ${t.title} | ${subCatSlug}`)
  }

  console.log('\nDone.')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    return prisma.$disconnect().then(() => process.exit(1))
  })
