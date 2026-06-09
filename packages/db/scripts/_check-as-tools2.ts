import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

async function main() {
  const { prisma } = await import('../src/index.js')
  const slugs = [
    'clearer-board','national-frame','crown-board','rubber-ring-castrator',
    'elastrator','post-rammer','strainer-post','chicken-feeder',
    'chicken-grit-feeder','iodine-spray-navel','brooder-heat-plate',
    'heat-mat-poultry','incubator','egg-incubator','vaccination-syringe',
    'lamb-castrator','scissors','wire-cutters','hurdle','ring-feeder-bale',
    'lambing-lubricant','killing-cone','rabbit-cage','muck-fork',
    'pop-hole-auto-opener','candy-board',
  ]
  const found = await prisma.tool.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, name: true },
  })
  const foundSet = new Set(found.map((t: any) => t.slug))
  console.log('FOUND:')
  for (const f of found) console.log(`  ${f.slug} | ${(f as any).name}`)
  console.log('\nMISSING:')
  for (const s of slugs) if (!foundSet.has(s)) console.log(`  ${s}`)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
