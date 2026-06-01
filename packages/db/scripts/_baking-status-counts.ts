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
  const rows: any[] = await prisma.$queryRaw`
    SELECT t.status, COUNT(*)::int as cnt
    FROM "Tutorial" t
    JOIN "Category" c ON c.id = t."categoryId"
    WHERE c.slug = 'baking'
    GROUP BY t.status
    ORDER BY cnt DESC
  `
  rows.forEach(r => console.log(`${r.status}: ${r.cnt}`))
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
