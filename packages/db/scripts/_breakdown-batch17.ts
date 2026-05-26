import { config as loadEnv } from 'dotenv'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let i = 0; i < 8; i++) {
    const c = resolve(dir, '.env.credentials')
    if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
    const p = dirname(dir); if (p === dir) break; dir = p
  }
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const dir = resolve(__dirname, '../../../docs/voice-retrofit-2026-05-26-batch17')
  const slugs: string[] = JSON.parse(readFileSync(resolve(dir, '_slugs.json'), 'utf8'))
  const tutorials = await prisma.tutorial.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, type: true, category: { select: { slug: true } } },
  })
  const catCounts = new Map<string, number>()
  const typeCounts = new Map<string, number>()
  for (const t of tutorials) {
    const c = t.category?.slug ?? 'unknown'
    catCounts.set(c, (catCounts.get(c) ?? 0) + 1)
    typeCounts.set(t.type, (typeCounts.get(t.type) ?? 0) + 1)
  }
  console.log('CATEGORY:')
  for (const [k, v] of [...catCounts.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`)
  console.log('TYPE:')
  for (const [k, v] of [...typeCounts.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
