/**
 * Export the batch42 PUBLISHED tutorial bodies to JSON files at
 * docs/voice-retrofit-2026-05-27-batch42/<slug>.json. The shape matches
 * what _pilot-voice-apply.ts expects.
 *
 * Run after _voice-retrofit-pick-batch42.ts has written _slugs.json.
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

const BATCH_ID = '2026-05-27-batch42'

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

    // Empty array; voice-check's glossary coverage rule no-ops when
    // registered.length === 0, matching the pilot export pattern.
    const glossaryTerms: any[] = []

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
      glossaryTerms,
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
