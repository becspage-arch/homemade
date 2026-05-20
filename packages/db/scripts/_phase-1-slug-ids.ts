import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}
const SLUGS = [
  'cross-stitch-alphabet-sampler-border',
  'how-to-cross-stitch',
  'start-and-end-a-thread-cleanly',
  'crochet-magic-ring',
  'granny-square-basic-three-round',
  'how-to-hold-a-crochet-hook',
  'how-to-work-a-treble',
  'how-to-work-a-knit-stitch',
  'long-tail-cast-on',
]
async function main() {
  const { prisma } = await import('../src/index.js')
  for (const s of SLUGS) {
    const t = await prisma.tutorial.findUnique({
      where: { slug: s },
      select: { id: true, slug: true, status: true, type: true, title: true, category: { select: { slug: true } } },
    })
    if (!t) { console.log(`${s}: NOT FOUND`); continue }
    console.log(`${t.status.padEnd(9)} [${t.type.padEnd(9)}] ${t.category.slug.padEnd(11)} ${t.slug}`)
    console.log(`  id: ${t.id}`)
    console.log(`  admin: https://homemade.education/admin/tutorials/${t.id}`)
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
