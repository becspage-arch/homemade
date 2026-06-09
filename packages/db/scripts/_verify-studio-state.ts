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
  const patterns = await (prisma as any).$queryRaw<any[]>`SELECT COUNT(*) AS n FROM "Pattern"`
  console.log('Patterns total:', Number(patterns[0].n))
  const linked = await (prisma as any).$queryRaw<any[]>`SELECT COUNT(*) AS n FROM "Tutorial" WHERE "patternId" IS NOT NULL`
  console.log('Tutorials with patternId:', Number(linked[0].n))
  const cats = await (prisma as any).$queryRaw<any[]>`SELECT slug, "pipelineStatus" FROM "Category" WHERE slug IN ('cross-stitch','crochet','needlework')`
  cats.forEach((c: any) => console.log(c.slug, '=', c.pipelineStatus))
  try {
    const ds = await (prisma as any).$queryRaw<any[]>`SELECT slug, "displayName" FROM "Designer"`
    console.log('Designers:', ds.length)
    ds.forEach((r: any) => console.log(' ', r.slug, r.displayName))
  } catch (e) {
    console.log('Designer table missing')
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
