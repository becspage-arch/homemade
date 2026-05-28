/**
 * Throwaway: emit the per-recipe log for the 2026-05-28 repair pass.
 * Reads the original broken-slug list (recipes that had no
 * RecipeIngredient rows at the start of the pass) from the dump file
 * and looks up current counts in the database.
 * Delete when done.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
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

async function main(): Promise<void> {
  const dumpPath = process.argv[2]
  if (!dumpPath) {
    console.error('Usage: tsx scripts/repair-final-log-tmp.ts <recipes-dump.jsonl>')
    process.exit(1)
  }

  const { prisma } = await import('@homemade/db')
  const lines = readFileSync(dumpPath, 'utf-8').split('\n').filter((l) => l.trim().length > 0)
  const ordered: Array<{ category: string; slug: string }> = lines.map((line) => {
    const e = JSON.parse(line) as { category: string; slug: string }
    return { category: e.category, slug: e.slug }
  })

  const tutorialIds = new Map<string, string>()
  const allSlugs = ordered.map((o) => o.slug)
  const tutorials = await prisma.tutorial.findMany({
    where: { slug: { in: allSlugs } },
    select: { id: true, slug: true, category: { select: { slug: true } } },
  })
  for (const t of tutorials) {
    tutorialIds.set(`${t.category.slug}/${t.slug}`, t.id)
  }

  const counts = await prisma.recipeIngredient.groupBy({
    by: ['tutorialId'],
    _count: { _all: true },
    where: { tutorialId: { in: Array.from(tutorialIds.values()) } },
  })
  const countById = new Map<string, number>(counts.map((c) => [c.tutorialId, c._count._all]))

  let okCount = 0
  let zeroCount = 0
  for (const o of ordered) {
    const key = `${o.category}/${o.slug}`
    const id = tutorialIds.get(key)
    const count = id ? countById.get(id) ?? 0 : 0
    if (count > 0) {
      okCount++
      console.log(`- ${key} — OK (${count} items)`)
    } else {
      zeroCount++
      console.log(`- ${key} — SKIPPED (zero items still — investigate)`)
    }
  }
  console.error(`\n--- SUMMARY ---`)
  console.error(`ok: ${okCount} / ${ordered.length}`)
  console.error(`zero: ${zeroCount}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
