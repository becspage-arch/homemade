/**
 * Audit current image-pipeline state across the crochet category. Reports:
 *   - Per sub-category: tutorial count, how many have Dillmont images,
 *     how many have any image, current diagramGenerationStatus tally.
 *   - Crochet patterns: count, thumbnail / hero / heroGenerationStatus tally.
 *   - Crochet motifs (Motifs sub-cat or CrochetPattern rows): current state.
 *   - Stitch master table: count, previewMediaId coverage.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/audit-crochet-image-state.ts
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

interface TipTapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
}

function countImages(body: unknown): { total: number; dillmont: number } {
  const content = (body as { content?: TipTapNode[] } | null)?.content ?? []
  let total = 0
  let dillmont = 0
  for (const n of content) {
    if (n.type === 'image') {
      total++
      const src = n.attrs?.src
      if (typeof src === 'string' && src.includes('/dillmont-1886/')) dillmont++
    }
  }
  return { total, dillmont }
}

async function main() {
  const { prisma } = await import('../src/index.js')

  const crochetCategory = await prisma.category.findFirst({
    where: { slug: 'crochet' },
    select: { id: true, name: true },
  })
  if (!crochetCategory) {
    console.log('No crochet category — nothing to audit.')
    await prisma.$disconnect()
    return
  }

  const subCats = await prisma.subCategory.findMany({
    where: { categoryId: crochetCategory.id },
    select: { id: true, slug: true, name: true },
    orderBy: { slug: 'asc' },
  })

  console.log('=== Tutorial image state by crochet sub-category ===\n')

  for (const sub of subCats) {
    const tutorials = await prisma.tutorial.findMany({
      where: { categoryId: crochetCategory.id, subCategoryId: sub.id, status: 'PUBLISHED' },
      select: { slug: true, body: true, diagramGenerationStatus: true, heroMediaId: true },
    })
    if (tutorials.length === 0) {
      console.log(`${sub.slug.padEnd(15)}  0 published`)
      continue
    }
    let withDillmont = 0
    let withAnyImage = 0
    let withHero = 0
    const statusCounts: Record<string, number> = {}
    for (const t of tutorials) {
      const { total, dillmont } = countImages(t.body)
      if (total > 0) withAnyImage++
      if (dillmont > 0) withDillmont++
      if (t.heroMediaId) withHero++
      statusCounts[t.diagramGenerationStatus] = (statusCounts[t.diagramGenerationStatus] ?? 0) + 1
    }
    const statusStr = Object.entries(statusCounts)
      .map(([k, v]) => `${k}=${v}`)
      .join(' ')
    console.log(
      `${sub.slug.padEnd(15)}  ${tutorials.length} published  withDillmont=${withDillmont} withAnyImage=${withAnyImage} withHero=${withHero}  ${statusStr}`,
    )
  }

  console.log('\n=== CrochetPattern state ===\n')
  const cpCount = await prisma.crochetPattern.count()
  const cpWithThumb = await prisma.crochetPattern.count({ where: { thumbnailMediaId: { not: null } } })
  const cpWithHero = await prisma.crochetPattern.count({ where: { heroMediaId: { not: null } } })
  const cpPublished = await prisma.crochetPattern.count({ where: { visibility: 'PUBLIC' } })
  console.log(`CrochetPattern  total=${cpCount} published=${cpPublished} withThumb=${cpWithThumb} withHero=${cpWithHero}`)

  const cpStatusGroups = await prisma.crochetPattern.groupBy({
    by: ['heroGenerationStatus'],
    _count: { _all: true },
  })
  for (const g of cpStatusGroups) {
    console.log(`  heroGenerationStatus=${g.heroGenerationStatus}  ${g._count._all}`)
  }

  console.log('\n=== Stitch master table ===\n')
  const stitchTotal = await prisma.stitch.count()
  const stitchWithPreview = await prisma.stitch.count({ where: { previewMediaId: { not: null } } })
  const stitchByCraft = await prisma.stitch.groupBy({
    by: ['craft'],
    _count: { _all: true },
  })
  console.log(`Stitch  total=${stitchTotal} withPreview=${stitchWithPreview}`)
  for (const g of stitchByCraft) {
    const withPrev = await prisma.stitch.count({ where: { craft: g.craft, previewMediaId: { not: null } } })
    console.log(`  craft=${g.craft}  ${g._count._all}  withPreview=${withPrev}`)
  }

  console.log('\n=== Cross-stitch Pattern state (for retrofit) ===\n')
  const patternCount = await prisma.pattern.count()
  const patternWithHero = await prisma.pattern.count({ where: { heroMediaId: { not: null } } })
  const patternWithThumb = await prisma.pattern.count({ where: { thumbnailMediaId: { not: null } } })
  console.log(`Pattern  total=${patternCount} withHero=${patternWithHero} withThumb=${patternWithThumb}`)
  const pStatusGroups = await prisma.pattern.groupBy({
    by: ['heroGenerationStatus'],
    _count: { _all: true },
  })
  for (const g of pStatusGroups) {
    console.log(`  heroGenerationStatus=${g.heroGenerationStatus}  ${g._count._all}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
