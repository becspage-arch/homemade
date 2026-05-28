import { config as loadEnv } from 'dotenv'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
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

const BATCH_ID = process.env.BATCH_ID || '2026-05-28-batch11'

async function main() {
  const { prisma } = await import('../src/index.js')
  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, `docs/voice-retrofit-${BATCH_ID}`)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const slugFile = resolve(outDir, '_slugs.json')
  const slugs = JSON.parse(readFileSync(slugFile, 'utf8')) as string[]
  console.log(`Exporting ${slugs.length} tutorials to ${outDir}`)

  let ok = 0
  let miss = 0
  for (const slug of slugs) {
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
    const outPath = resolve(outDir, `${slug}.json`)
    writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8')
    ok++
  }
  console.log(`Done: ${ok} ok, ${miss} miss`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
