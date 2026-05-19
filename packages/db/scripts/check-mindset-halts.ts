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
  const r = await prisma.autopilotHaltSignal.findMany({
    where: { OR: [{ stream: 'mindset' }, { detail: { contains: 'mindset' } }], createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: { createdAt: true, stream: true, reason: true, detail: true },
  })
  console.log(`Mindset-related halts last 24h: ${r.length}`)
  for (const x of r) console.log(`  ${x.createdAt.toISOString()}  ${x.stream}  ${x.reason}  ${(x.detail||'').slice(0,100)}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
