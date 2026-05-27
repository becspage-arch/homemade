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

import { prisma } from '../src'

async function main() {
  const batchId = process.argv[2]
  if (!batchId) throw new Error('batch id required')

  const worktreeRoot = resolve(__dirname, '../../..')
  const batchDir = resolve(worktreeRoot, `docs/voice-retrofit-${batchId}`)
  if (!existsSync(batchDir)) throw new Error(`batch dir not found: ${batchDir}`)
  const slugList = JSON.parse(readFileSync(resolve(batchDir, '_slugs.json'), 'utf8')) as Array<{
    slug: string
  }>

  let ok = 0
  let miss = 0
  for (const { slug } of slugList) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      include: { category: true, subCategory: true },
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
    const outPath = resolve(batchDir, `${slug}.json`)
    writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8')
    ok++
  }
  console.log(`[done] exported ${ok} ok, ${miss} missing into ${batchDir}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
