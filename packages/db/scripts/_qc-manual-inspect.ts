/**
 * Inspect a batch of slugs for manual QC rewrite.
 * Outputs: slug, failing path, grade, snippet for each BLOCK finding.
 * Usage: tsx scripts/_qc-manual-inspect.ts slug1 slug2 ...
 */
import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '../src'
import { auditTutorial } from './qc-audit.js'

async function main() {
  const slugs = process.argv.slice(2)
  if (slugs.length === 0) { console.log('usage: tsx _qc-manual-inspect.ts slug1 slug2 ...'); process.exit(0) }

  for (const slug of slugs) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: {
        id: true, slug: true, title: true, body: true, excerpt: true,
        subtitle: true, sourceNotes: true, difficulty: true,
        servings: true, yieldDescription: true, type: true,
        status: true, voiceRetrofittedAt: true, publishedAt: true,
        heroMediaId: true, revisedFrom: true,
        hero: { select: { id: true, r2Key: true, cloudflareId: true } },
        recipeIngredients: { select: { id: true, amount: true, unit: true, ingredientId: true } },
        recipeTools: { select: { id: true, toolId: true } },
        category: { select: { slug: true } },
      }
    })
    if (!t) { console.log(slug + ': NOT FOUND'); continue }

    const v = auditTutorial(t as any)
    const blockFinds = v.findings.filter(f => f.severity === 'BLOCK')

    console.log('=== ' + slug + ' (' + t.type + ' / ' + t.category.slug + ') ===')
    console.log('Title: ' + t.title)
    if (blockFinds.length === 0) {
      console.log('  (PASS)')
    } else {
      for (const f of blockFinds) {
        console.log('  BLOCK ' + f.kind + ' @ ' + f.path)
        console.log('  MSG: ' + f.message)
        console.log('  SNIPPET: ' + f.snippet)
      }
    }
    console.log('')
  }

  await prisma.$disconnect()
}

main()
