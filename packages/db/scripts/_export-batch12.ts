/**
 * Export batch12 tutorial bodies from DB to docs/voice-retrofit-2026-05-28-batch12/<slug>.json.
 * Reads slugs from _slugs.json in that dir.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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

const BATCH_ID = '2026-05-28-batch12'

async function main() {
  const { prisma } = await import('../src/index.js')

  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const slugsList: { slug: string }[] = JSON.parse(
    readFileSync(resolve(outDir, '_slugs.json'), 'utf8'),
  )

  let ok = 0
  let miss = 0
  for (const { slug } of slugsList) {
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

    writeFileSync(
      resolve(outDir, `${slug}.json`),
      JSON.stringify(out, null, 2) + '\n',
      'utf8',
    )
    ok++
  }

  console.log(`[done] ${ok} exported, ${miss} missing`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
