import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import { prisma } from '../src'

async function main() {
  const total = await prisma.tutorial.count({
    where: { categorySlug: 'sustainability', status: 'PUBLISHED' }
  })
  const foraging = await prisma.tutorial.count({
    where: { categorySlug: 'sustainability', subCategorySlug: 'foraging', status: 'PUBLISHED' }
  })
  console.log(`Sustainability PUBLISHED total: ${total}`)
  console.log(`Foraging sub-cat: ${foraging}`)
  await prisma.$disconnect()
}
main()
