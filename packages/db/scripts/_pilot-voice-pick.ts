import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'

async function main() {
  // Find one PUBLISHED tutorial in each content-type category for the
  // voice-spec 2026-05-21 pilot. Returns a compact JSON list of
  // { categorySlug, slug, title, type, bodyParagraphCount }.
  const targetCategories = [
    'herbal-medicine',
    'mindset',
    'cooking',
    'baking',
    'fibre-arts',
    'sewing',
    'knitting',
    'crochet',
    'pottery-ceramics',
    'needlework',
    'paper-word-craft',
    'wood-natural-craft',
    'garden',
    'gardening',
    'home-repair',
    'natural-home',
    'sustainability',
    'animals-smallholding',
  ]

  for (const catSlug of targetCategories) {
    const cat = await prisma.category.findUnique({ where: { slug: catSlug } })
    if (!cat) {
      console.log(`[no category] ${catSlug}`)
      continue
    }
    const sample = await prisma.tutorial.findMany({
      where: { categoryId: cat.id, status: 'PUBLISHED' },
      select: { slug: true, title: true, type: true },
      orderBy: { slug: 'asc' },
      take: 5,
    })
    if (sample.length === 0) {
      console.log(`[empty]    ${catSlug}`)
    } else {
      console.log(`[${sample.length}]      ${catSlug}: ${sample.map((s) => s.slug).join(', ')}`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
