import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { prisma } from '../src/index.js'
import { auditTutorial } from './qc-audit.js'

const slugs = [
  'external-wall-insulation-etics-installation',
  'borehole-water-supply-feasibility',
]

async function main() {
  const allGlossarySlugs = new Set<string>(
    (await prisma.glossaryTerm.findMany({ select: { slug: true } })).map((g) => g.slug),
  )

  for (const slug of slugs) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: {
        id: true, slug: true, type: true, status: true, title: true,
        subtitle: true, excerpt: true, sourceNotes: true, body: true,
        heroMediaId: true, difficulty: true, servings: true, yieldDescription: true,
        voiceRetrofittedAt: true, publishedAt: true, revisedFrom: true,
        hero: { select: { id: true, r2Key: true, cloudflareId: true } },
        recipeIngredients: { select: { id: true, amount: true, unit: true, ingredientId: true } },
        recipeTools: { select: { id: true, toolId: true } },
        category: { select: { slug: true } },
      },
    })
    if (!t) { console.log(slug + ': NOT FOUND'); continue }

    const verdict = auditTutorial(t as any)
    const resolved = verdict.findings.map(f => {
      if (f.kind === 'glossary-tooltip-unregistered' && f.message.startsWith('__pending-resolution__:')) {
        const gs = f.message.split(':')[1]!
        if (!allGlossarySlugs.has(gs)) {
          return { ...f, severity: 'BLOCK' as const, message: `inline glossaryTooltip references "${gs}" but no GlossaryTerm row exists` }
        }
        return null
      }
      return f
    }).filter(Boolean)

    const blocks = resolved.filter(f => f!.severity === 'BLOCK')
    console.log(`\n=== ${slug} ===`)
    for (const f of blocks) {
      console.log('  kind:', f!.kind)
      console.log('  path:', (f as any).path)
      console.log('  msg:', (f as any).message)
      console.log('  snippet:', (f as any).snippet?.slice(0, 120))
    }
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
