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
  console.log('Plants matching strawberr/tomato:')
  const ps = await prisma.plantVariety.findMany({
    where: { OR: [{ slug: { contains: 'strawberr' } }, { slug: { contains: 'tomato' } }] },
    select: { slug: true, commonName: true },
  })
  for (const p of ps) console.log('  ' + p.slug + ' :: ' + p.commonName)
  console.log('\nFabric slugs:')
  const fs2 = await prisma.fabric.findMany({ select: { slug: true, name: true } })
  for (const f of fs2) console.log('  ' + f.slug + ' :: ' + f.name)
  console.log('\nSewing notion slugs:')
  const ns = await prisma.sewingNotion.findMany({ select: { slug: true, name: true } })
  for (const n of ns) console.log('  ' + n.slug + ' :: ' + n.name)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
