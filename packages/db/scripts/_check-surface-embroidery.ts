import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let d = 0; d < 8; d++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

import { prisma } from '../src'

async function main() {
  const t = await prisma.tutorial.findMany({
    where: { subCategory: { slug: 'surface-embroidery' } },
    select: { slug: true, status: true },
    orderBy: { slug: 'asc' }
  })
  console.log(JSON.stringify(t))
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
