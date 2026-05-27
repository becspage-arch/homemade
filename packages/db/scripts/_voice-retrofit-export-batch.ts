/**
 * Export the picked-batch tutorial bodies from the live DB as editable JSON
 * files at docs/voice-retrofit-<batch-id>/<slug>.json.
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

const BATCH_ID = process.env.BATCH_ID ?? '2026-05-27-batch31'

async function main() {
  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  if (!existsSync(batchDir)) mkdirSync(batchDir, { recursive: true })
  const slugsPath = resolve(batchDir, '_slugs.json')
  const slugList: { slug: string }[] = JSON.parse(readFileSync(slugsPath, 'utf8'))

  let ok = 0
  let miss = 0
  for (const entry of slugList) {
    const slug = entry.slug
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      include: { category: true, subCategory: true },
    })
    if (!t) {
      console.warn(`[MISS] ${slug}`)
      miss++
      continue
    }
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

    const outPath = resolve(batchDir, `${slug}.json`)
    writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8')
    ok++
  }
  console.log(`[export] ${ok} ok, ${miss} miss`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
