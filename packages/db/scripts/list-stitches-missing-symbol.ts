/**
 * List Stitch rows whose chartSymbol is missing or doesn't resolve in
 * the chart-symbols library. Drives the chart-symbols.ts extension work.
 *
 * Run:
 *   pnpm --filter "@homemade/db" exec tsx scripts/list-stitches-missing-symbol.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

import { getChartSymbol } from '../../../apps/web/src/lib/craft-charts/chart-symbols.js'
import type { Craft } from '../../../apps/web/src/lib/craft-charts/types.js'

async function main() {
  const { prisma } = await import('../src/index.js')

  const stitches = await prisma.stitch.findMany({
    select: {
      slug: true,
      craft: true,
      canonicalName: true,
      chartSymbol: true,
      previewMediaId: true,
    },
    orderBy: [{ craft: 'asc' }, { slug: 'asc' }],
  })

  let nullCount = 0
  let unresolvedCount = 0

  console.log('=== Stitch rows missing chartSymbol or whose key does not resolve ===\n')

  for (const s of stitches) {
    if (!s.chartSymbol) {
      console.log(`  NULL    ${s.craft.padEnd(10)} ${s.slug.padEnd(38)} ${s.canonicalName}`)
      nullCount++
      continue
    }
    const sym = getChartSymbol(s.craft as Craft, s.chartSymbol)
    if (!sym) {
      console.log(`  MISS    ${s.craft.padEnd(10)} ${s.slug.padEnd(38)} chartSymbol="${s.chartSymbol}"`)
      unresolvedCount++
    }
  }

  console.log(`\nTotal: ${stitches.length}  null=${nullCount}  unresolved=${unresolvedCount}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
