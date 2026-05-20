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
  'stocking-stitch-dishcloth',
  'running-and-backstitch-by-hand',
  'simple-drawstring-bag',
  'growing-strawberries',
  'growing-tomatoes-from-seed',
]
async function main() {
  const { prisma } = await import('../src/index.js')
  for (const slug of SLUGS) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: {
        slug: true,
        hero: { select: { id: true, source: true, sourceUrl: true, creatorName: true, licenceCode: true, licenceUrl: true, requiresAttribution: true, verificationStatus: true } },
      },
    })
    if (!t) continue
    const h = t.hero
    if (!h) { console.log(`${slug}: NO HERO`); continue }
    console.log(`${slug}`)
    console.log(`  media: ${h.id}`)
    console.log(`  source: ${h.source}  licence: ${h.licenceCode}`)
    console.log(`  creator: ${h.creatorName ?? 'n/a'}`)
    console.log(`  sourceUrl: ${h.sourceUrl ?? 'n/a'}`)
    console.log(`  licenceUrl: ${h.licenceUrl ?? 'n/a'}`)
    console.log(`  requiresAttribution: ${h.requiresAttribution}  verification: ${h.verificationStatus}`)
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
