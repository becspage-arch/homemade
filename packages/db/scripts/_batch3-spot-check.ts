/**
 * Spot-check a single retrofitted slug.
 * Usage: tsx scripts/_batch3-spot-check.ts <slug>
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

const slug = process.argv[2]
if (!slug) { console.error('Usage: tsx scripts/_batch3-spot-check.ts <slug>'); process.exit(1) }

async function main() {
  const { prisma } = await import('../src/index.js')
  const t: any = await prisma.tutorial.findUnique({
    where: { slug },
    select: { slug: true, revisedFrom: true },
  })
  if (!t) { console.log('not found'); process.exit(1) }
  const has = t.revisedFrom !== null
  console.log(`slug: ${t.slug}`)
  console.log(`revisedFrom IS NOT NULL: ${has}`)
  if (has) {
    const j = JSON.stringify(t.revisedFrom)
    console.log(`First 200 chars of revisedFrom:\n${j.slice(0, 200)}`)
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
