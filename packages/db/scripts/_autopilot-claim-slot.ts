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

const CATEGORY_ID = 'cmp8mecuz0009d4v4pbifz6ki'

async function main() {
  const { prisma } = await import('../src/index.js')
  await prisma.category.update({
    where: { id: CATEGORY_ID },
    data: { lastAutopilotRunAt: new Date() },
  })
  console.log('CLAIMED:pottery-ceramics lastAutopilotRunAt=' + new Date().toISOString())
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
