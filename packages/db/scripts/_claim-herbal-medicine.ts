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

// herbal-medicine category ID
const HERBAL_ID = 'cmp8mecsf0001d4v47qrv3zbh'
// pottery-ceramics category ID — revert the accidental claim back to 2026-05-30
const POTTERY_ID = 'cmp8mecuz0009d4v4pbifz6ki'

async function main() {
  const { prisma } = await import('../src/index.js')

  // Claim herbal-medicine
  await prisma.category.update({
    where: { id: HERBAL_ID },
    data: { lastAutopilotRunAt: new Date() },
  })
  console.log('CLAIMED:herbal-medicine lastAutopilotRunAt=' + new Date().toISOString())

  // Revert the accidental pottery-ceramics claim to its last legitimate run date (bulk-007, 2026-05-30)
  await prisma.category.update({
    where: { id: POTTERY_ID },
    data: { lastAutopilotRunAt: new Date('2026-05-30T12:00:00.000Z') },
  })
  console.log('REVERTED:pottery-ceramics lastAutopilotRunAt=2026-05-30T12:00:00.000Z')

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
