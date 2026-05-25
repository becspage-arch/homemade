/**
 * Export the 10 voice-pilot tutorials from the live DB as editable JSON
 * files at docs/voice-pilot-2026-05-25/<slug>.json. The shape is the subset
 * the voice-check CLI expects (root with body + glossaryTerms + recipe +
 * subtitle + excerpt + sourceNotes), plus a small `_meta` block for the
 * apply step.
 *
 * Run once. Then I rewrite each file's prose. Then _pilot-voice-apply.ts
 * pushes the rewrites back to DB.
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

const SLUGS = [
  'calendula-salve-for-skin',
  'a-bank-balance-that-climbs-while-you-sleep',
  'ackee-and-saltfish',
  'almond-croissants-leftover',
  'alternating-square-knot-macrame',
  'ash-serving-tray',
  'applying-a-limewash-finish',
  'arnica-balm',
  'airtightness-survey-smoke-pencil',
  'assisting-a-stuck-lamb-at-lambing',
]

async function main() {
  const { prisma } = await import('../src/index.js')

  // The worktree root is the repo root for git purposes; docs path is at the
  // worktree root.
  const worktreeRoot = resolve(__dirname, '../../..')
  const outDir = resolve(worktreeRoot, 'docs/voice-pilot-2026-05-25')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  for (const slug of SLUGS) {
    const t: any = await prisma.tutorial.findUnique({
      where: { slug },
      include: {
        category: true,
        subCategory: true,
      },
    })
    if (!t) {
      console.warn(`[MISS] ${slug} — not found`)
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
    console.log(`[OK]   ${slug} → ${outPath}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
