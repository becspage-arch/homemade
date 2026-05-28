/**
 * Voice-retrofit batch picker + exporter.
 *
 * Picks the next 75 PUBLISHED tutorials with voiceRetrofittedAt IS NULL
 * (slug-ascending) and exports each one's editable state to JSON files in
 * docs/voice-retrofit-<batch-id>/<slug>.json. Also writes _slugs.json with
 * the list.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/_voice-retrofit-batch.ts <batch-id>
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
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
  const batchId = process.argv[2]
  if (!batchId) {
    console.error('Usage: _voice-retrofit-batch.ts <batch-id>')
    process.exit(1)
  }

  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const candidates = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', voiceRetrofittedAt: null },
    select: { slug: true, title: true, type: true, category: { select: { slug: true } } },
    orderBy: { slug: 'asc' },
    take: 75,
  })

  console.log(`[pick] found ${candidates.length} candidates`)

  if (candidates.length === 0) {
    console.log('[done] no candidates remain. retrofit complete.')
    writeFileSync(resolve(outDir, '_slugs.json'), JSON.stringify([], null, 2) + '\n', 'utf8')
    await prisma.$disconnect()
    return
  }

  const slugs = candidates.map((c) => c.slug)
  writeFileSync(resolve(outDir, '_slugs.json'), JSON.stringify(slugs, null, 2) + '\n', 'utf8')
  console.log(`[pick] wrote _slugs.json (${slugs.length} slugs)`)

  let exported = 0
  for (const slug of slugs) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      include: { category: true, subCategory: true },
    })
    if (!t) {
      console.warn(`[MISS] ${slug}`)
      continue
    }
    const out: Record<string, unknown> = {
      _meta: {
        tutorialId: t.id,
        categorySlug: t.category?.slug,
        subCategorySlug: t.subCategory?.slug ?? null,
        publicUrl: `https://homemade.education/${t.category?.slug}/${t.slug}`,
        type: t.type,
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
    writeFileSync(resolve(outDir, `${slug}.json`), JSON.stringify(out, null, 2) + '\n', 'utf8')
    exported++
  }

  console.log(`[done] exported ${exported}/${slugs.length} bodies to ${outDir}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
