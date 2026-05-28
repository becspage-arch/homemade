/**
 * Export current bodies for voice-retrofit batch 2026-05-28-batch8.
 * Reads slug list from docs/voice-retrofit-<batch>/_slugs.json and writes
 * one JSON per slug in the same shape voice-check + apply expect.
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

const BATCH_ID = '2026-05-28-batch8'

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const slugsFile = resolve(outDir, '_slugs.json')
  const slugsRaw = JSON.parse(readFileSync(slugsFile, 'utf8'))
  const slugs: string[] = slugsRaw.slugs

  console.log(`[export] ${slugs.length} slugs from ${slugsFile}`)

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

    writeFileSync(resolve(outDir, `${slug}.json`), JSON.stringify(out, null, 2) + '\n', 'utf8')
    ok++
  }

  console.log(`[done] ${ok} exported, ${miss} missing`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
