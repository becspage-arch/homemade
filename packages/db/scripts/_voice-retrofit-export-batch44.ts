/**
 * Export PUBLISHED tutorial bodies for voice-retrofit batch 2026-05-28-batch1.
 * Reads docs/voice-retrofit-2026-05-28-batch1/_slugs.json and writes
 * per-slug body JSON in the shape _pilot-voice-apply.ts expects.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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

import { prisma } from '../src'

const BATCH_ID = '2026-05-28-batch1'

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const slugsPath = resolve(outDir, '_slugs.json')
  const slugsBlob = JSON.parse(readFileSync(slugsPath, 'utf8'))
  const slugs: string[] = Array.isArray(slugsBlob?.slugs) ? slugsBlob.slugs : []
  if (slugs.length === 0) {
    console.log('[no slugs]')
    await prisma.$disconnect()
    return
  }

  let ok = 0
  let miss = 0
  for (const slug of slugs) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      include: {
        category: true,
        subCategory: true,
      },
    })
    if (!t) {
      console.warn(`[MISS] ${slug}`)
      miss++
      continue
    }

    const out: Record<string, unknown> = {
      _meta: {
        tutorialId: t.id,
        categorySlug: t.category?.slug,
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

    const outPath = resolve(outDir, `${slug}.json`)
    writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8')
    ok++
  }

  console.log(`[done] ${ok} exported, ${miss} miss`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
