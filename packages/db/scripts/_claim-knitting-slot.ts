/**
 * Claim knitting autopilot slot — sets lastAutopilotRunAt = now()
 */
import { config as loadEnv } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const p = new PrismaClient({ adapter })
  const updated = await p.category.update({
    where: { slug: 'knitting' },
    data: { lastAutopilotRunAt: new Date() },
    select: { slug: true, lastAutopilotRunAt: true },
  })
  console.log('Slot claimed:', JSON.stringify(updated))
  await p.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
