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
  const subs = await prisma.subCategory.findMany({
    where: { category: { slug: 'wood-natural-craft' } },
    select: { slug: true, name: true },
  })
  console.log(JSON.stringify(subs))
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e.message); process.exit(1) })
