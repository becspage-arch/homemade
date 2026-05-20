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
  const tools = await prisma.tool.findMany({
    where: { OR: [
      { slug: { contains: 'knit' } },
      { slug: { contains: 'crochet' } },
      { slug: { contains: 'needle' } },
      { slug: { contains: 'pin' } },
      { slug: { contains: 'scissor' } },
      { slug: { contains: 'measuring' } },
      { slug: { contains: 'tape' } },
      { slug: { contains: 'aida' } },
      { slug: { contains: 'hoop' } },
      { slug: { contains: 'thread' } },
      { slug: { contains: 'cotton' } },
      { slug: { contains: 'yarn' } },
    ] },
    select: { slug: true },
    orderBy: { slug: 'asc' },
  })
  for (const t of tools) console.log(t.slug)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
