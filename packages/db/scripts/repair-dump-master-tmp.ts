/**
 * Throwaway: dump the master ingredient catalogue to JSON so the worker
 * can match ingredient names to slugs locally without DB calls.
 * Delete when the 2026-05-28 repair pass is done.
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync } from 'node:fs'
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
  const outPath = process.argv[2]
  if (!outPath) {
    console.error('Usage: tsx scripts/repair-dump-master-tmp.ts <out.json>')
    process.exit(1)
  }
  const { prisma } = await import('@homemade/db')
  const rows = await prisma.ingredient.findMany({
    select: {
      slug: true,
      name: true,
      pluralName: true,
      category: true,
      defaultUnit: true,
      aliases: true,
    },
    orderBy: [{ category: 'asc' }, { slug: 'asc' }],
  })
  writeFileSync(outPath, JSON.stringify(rows, null, 2), 'utf-8')
  console.error(`Wrote ${rows.length} ingredient rows to ${outPath}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
