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
    where: { createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true, stream: true, reason: true, detail: true },
  })
  console.log(`Halt signals in last hour: ${r.length}`)
  for (const x of r) console.log(`  ${x.createdAt.toISOString()}  ${x.stream}  ${x.reason}  ${(x.detail||'').slice(0,80)}`)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
