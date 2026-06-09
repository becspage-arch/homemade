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
  const tools = await prisma.tool.findMany({
    where: {
      OR: [
        { slug: { contains: 'bee' } }, { slug: { contains: 'hive' } }, { slug: { contains: 'frame' } },
        { slug: { contains: 'chicken' } }, { slug: { contains: 'poultry' } }, { slug: { contains: 'coop' } }, { slug: { contains: 'egg' } },
        { slug: { contains: 'sheep' } }, { slug: { contains: 'goat' } }, { slug: { contains: 'lamb' } }, { slug: { contains: 'crook' } }, { slug: { contains: 'drench' } }, { slug: { contains: 'hoof' } },
        { slug: { contains: 'pig' } }, { slug: { contains: 'sow' } }, { slug: { contains: 'farrow' } },
        { slug: { contains: 'rabbit' } }, { slug: { contains: 'hutch' } },
        { slug: { contains: 'fence' } }, { slug: { contains: 'feed' } }, { slug: { contains: 'water' } }, { slug: { contains: 'hay' } }, { slug: { contains: 'electric' } },
        { slug: { contains: 'syringe' } }, { slug: { contains: 'iodine' } }, { slug: { contains: 'thermometer' } }, { slug: { contains: 'shears' } }, { slug: { contains: 'wormer' } },
      ],
    },
    select: { slug: true, name: true },
    orderBy: { slug: 'asc' },
  })
  for (const t of tools) console.log(`${t.slug} | ${t.name}`)
  console.log('\nTOTAL: ' + tools.length)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
