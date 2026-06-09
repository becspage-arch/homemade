/**
 * List crochet Stitches sub-category tutorials with their current diagram
 * sourcing state. Used as input for Pipeline A wiring.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/list-crochet-stitches.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

async function main() {
  const { prisma } = await import('../src/index.js')

  const crochetCategory = await prisma.category.findFirst({
    where: { slug: 'crochet' },
    select: { id: true, name: true },
  })
  if (!crochetCategory) {
    console.error('No crochet category found.')
    await prisma.$disconnect()
    return
  }

  const subCats = await prisma.subCategory.findMany({
    where: { categoryId: crochetCategory.id },
    select: { id: true, slug: true, name: true },
    orderBy: { slug: 'asc' },
  })

  console.log('Crochet sub-categories:')
  for (const s of subCats) {
    const count = await prisma.tutorial.count({
      where: { categoryId: crochetCategory.id, subCategoryId: s.id, status: 'PUBLISHED' },
    })
    console.log(`  ${s.slug}  (${s.name})  ${count} published`)
  }

  // Likely candidate sub-category names: stitches, crochet-stitches, basic-stitches
  const stitchesSub = subCats.find((s) =>
    s.slug.includes('stitch') || s.name.toLowerCase().includes('stitch'),
  )

  console.log('\nCrochet tutorials whose slug or title mentions "stitch":')
  const stitchTutorials = await prisma.tutorial.findMany({
    where: {
      categoryId: crochetCategory.id,
      status: 'PUBLISHED',
      OR: [
        { slug: { contains: 'stitch' } },
        { title: { contains: 'stitch', mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      subCategoryId: true,
      diagramGenerationStatus: true,
      body: true,
    },
    orderBy: { slug: 'asc' },
  })
  for (const t of stitchTutorials) {
    const subSlug = subCats.find((s) => s.id === t.subCategoryId)?.slug ?? '<none>'
    const body = t.body as { content?: Array<{ type: string; attrs?: { src?: string } }> } | null
    const imageCount = body?.content?.filter((n) => n.type === 'image').length ?? 0
    const dillmontWired = body?.content?.some(
      (n) =>
        n.type === 'image' &&
        typeof n.attrs?.src === 'string' &&
        n.attrs.src.includes('/dillmont-1886/'),
    )
    console.log(
      `  ${t.slug.padEnd(50)} [${subSlug}] images=${imageCount} dillmont=${dillmontWired ? 'Y' : 'N'} status=${t.diagramGenerationStatus}`,
    )
  }

  if (stitchesSub) {
    console.log(`\nAll published tutorials in sub-category "${stitchesSub.slug}":`)
    const all = await prisma.tutorial.findMany({
      where: { categoryId: crochetCategory.id, subCategoryId: stitchesSub.id, status: 'PUBLISHED' },
      select: { slug: true, title: true, diagramGenerationStatus: true },
      orderBy: { slug: 'asc' },
    })
    for (const t of all) {
      console.log(`  ${t.slug.padEnd(50)} ${t.title}  (status=${t.diagramGenerationStatus})`)
    }
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
