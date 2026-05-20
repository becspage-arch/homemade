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
async function main() {
  const { prisma } = await import('../src/index.js')
  const want = ['garden-fork','trowel-garden','seedling-pots-9cm','fabric-scissors','iron','tape-measure','sewing-machine-domestic','tapestry-needle','craft-scissors','measuring-tape-soft','stitch-marker']
  for (const w of want) {
    const t = await prisma.tool.findUnique({ where: { slug: w }, select: { slug: true } })
    console.log(w + ': ' + (t ? 'OK' : 'MISSING'))
  }
  console.log('--- similar slugs ---')
  const sim = await prisma.tool.findMany({
    where: { OR: [
      { slug: { contains: 'fork' } }, { slug: { contains: 'trowel' } },
      { slug: { contains: 'pot' } }, { slug: { contains: 'fabric' } },
      { slug: { contains: 'iron' } }, { slug: { contains: 'machine' } },
      { slug: { contains: 'marker' } }, { slug: { contains: 'cane' } },
      { slug: { contains: 'seedling' } }, { slug: { contains: 'watering' } },
      { slug: { contains: 'garden' } }, { slug: { contains: 'pruning' } },
      { slug: { contains: 'secateur' } }, { slug: { contains: 'net' } },
      { slug: { contains: 'compost' } }, { slug: { contains: 'tray' } },
      { slug: { contains: 'propagator' } }, { slug: { contains: 'pin' } },
      { slug: { contains: 'iron' } }, { slug: { contains: 'thread' } },
      { slug: { contains: 'sew' } }, { slug: { contains: 'tape' } },
    ] },
    select: { slug: true },
    orderBy: { slug: 'asc' },
  })
  for (const s of sim) console.log('  ' + s.slug)
  console.log('--- ALL non-cooking tools ---')
  const all = await prisma.tool.findMany({ select: { slug: true }, orderBy: { slug: 'asc' } })
  for (const a of all) console.log('  ' + a.slug)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
