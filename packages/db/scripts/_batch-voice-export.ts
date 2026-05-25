/**
 * Export tutorials for a voice-retrofit batch.
 * Usage: tsx scripts/_batch-voice-export.ts <batch-id>
 * Example: tsx scripts/_batch-voice-export.ts 2026-05-25-batch1
 *
 * Reads the slug list from docs/voice-retrofit-<batch-id>/_slugs.json
 * and exports each tutorial body to docs/voice-retrofit-<batch-id>/<slug>.json
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

const batchId = process.argv[2]
if (!batchId) {
  console.error('Usage: tsx scripts/_batch-voice-export.ts <batch-id>')
  process.exit(1)
}

async function main() {
  const { prisma } = await import('../src/index.js')

  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)

  if (!existsSync(batchDir)) {
    console.error(`Batch directory not found: ${batchDir}`)
    console.error('Create it and add _slugs.json first.')
    process.exit(1)
  }

  const slugsPath = resolve(batchDir, '_slugs.json')
  if (!existsSync(slugsPath)) {
    console.error(`_slugs.json not found at: ${slugsPath}`)
    process.exit(1)
  }

  const slugs: string[] = JSON.parse(readFileSync(slugsPath, 'utf8'))
  console.log(`Exporting ${slugs.length} tutorials for batch ${batchId}`)

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
      console.warn(`[MISS] ${slug} — not found`)
      miss++
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

    const outPath = resolve(batchDir, `${slug}.json`)
    writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8')
    console.log(`[OK]   ${slug} → ${outPath}`)
    ok++
  }

  console.log(`\nDone: ${ok} exported, ${miss} missing`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
