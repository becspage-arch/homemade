/**
 * Pick + export the next voice-retrofit batch.
 *
 * Selects the first N PUBLISHED tutorials where voiceRetrofittedAt IS NULL,
 * ordered by slug ascending, and writes each as a JSON file inside the
 * batch directory under docs/voice-retrofit-<batch-id>/.
 *
 * Usage:
 *   tsx scripts/_voice-batch-pick-export.ts <batch-id> [count]
 *
 * <batch-id> example: 2026-05-28-batch18
 * count defaults to 75.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
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

async function main() {
  const batchId = process.argv[2]
  if (!batchId) {
    console.error('Usage: tsx _voice-batch-pick-export.ts <batch-id> [count]')
    process.exit(1)
  }
  const count = Number.parseInt(process.argv[3] ?? '75', 10)

  const { prisma } = await import('../src/index.js')

  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const candidates = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      excerpt: true,
      type: true,
      sourceNotes: true,
      body: true,
      servings: true,
      yieldDescription: true,
      temperatureCelsius: true,
      category: { select: { slug: true } },
      subCategory: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
    take: count,
  })

  console.log(`[pick] selected ${candidates.length} tutorials for batch ${batchId}`)

  const slugList: { slug: string; title: string; type: string; categorySlug: string | null }[] = []

  for (const t of candidates) {
    const out: Record<string, unknown> = {
      _meta: {
        tutorialId: t.id,
        categorySlug: t.category?.slug ?? null,
        subCategorySlug: t.subCategory?.slug ?? null,
        publicUrl: `https://homemade.education/${t.category?.slug}/${t.slug}`,
      },
      slug: t.slug,
      title: t.title,
      subtitle: t.subtitle,
      excerpt: t.excerpt,
      type: t.type,
      sourceNotes: t.sourceNotes,
      body: t.body,
      glossaryTerms: [],
      recipe: {
        servings: t.servings,
        yieldDescription: t.yieldDescription,
        temperatureCelsius: t.temperatureCelsius,
      },
    }
    const outPath = resolve(outDir, `${t.slug}.json`)
    writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8')
    slugList.push({
      slug: t.slug,
      title: t.title,
      type: t.type as string,
      categorySlug: t.category?.slug ?? null,
    })
  }

  const slugsPath = resolve(outDir, '_slugs.json')
  writeFileSync(slugsPath, JSON.stringify(slugList, null, 2) + '\n', 'utf8')
  console.log(`[pick] wrote ${slugList.length} files + _slugs.json to ${outDir}`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
