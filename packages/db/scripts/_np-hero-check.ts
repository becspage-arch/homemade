import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}
async function main() {
  const { prisma } = await import('../src/index.js')
  const pass = await (prisma as any).tutorial.count({
    where: { subCategory: { slug: 'needlepoint' }, status: 'PUBLISHED', qcStatus: 'QC_PASS' }
  })
  const blocked = await (prisma as any).tutorial.count({
    where: { subCategory: { slug: 'needlepoint' }, status: 'PUBLISHED', qcStatus: { not: 'QC_PASS' } }
  })
  const blockedItems = await (prisma as any).tutorial.findMany({
    where: { subCategory: { slug: 'needlepoint' }, status: 'PUBLISHED', qcStatus: { not: 'QC_PASS' } },
    select: { slug: true, qcStatus: true }
  })
  console.log('needlepoint QC_PASS:', pass, '  not-pass:', blocked)
  console.log('blocked slugs:', blockedItems.map((t: any) => t.slug).join(', '))
  await (prisma as any).$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
