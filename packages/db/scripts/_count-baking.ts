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
  const counts: any[] = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS published_count
    FROM "Tutorial" t
    JOIN "Category" c ON c.id = t."categoryId"
    WHERE c.slug = 'baking'
      AND t.status = 'PUBLISHED'
  `
  console.log('Baking PUBLISHED count:', counts[0].published_count)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
