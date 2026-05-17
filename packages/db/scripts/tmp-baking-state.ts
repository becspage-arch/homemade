import { config as loadEnv } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Walk up to find .env.credentials (handles both main-repo and worktree layouts)
let dir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}

import { prisma } from '../src'

async function main() {
  const cat = await prisma.category.update({
    where: { slug: 'baking' },
    data: { lastAutopilotRunAt: new Date() },
    select: { id: true, slug: true, pipelineStatus: true, targetTutorialCount: true, lastAutopilotRunAt: true },
  })
  console.log('Slot claimed:', JSON.stringify(cat))

  const rows = await prisma.$queryRaw`
    SELECT sc.slug, sc.name, COUNT(t.id)::int as published
    FROM "SubCategory" sc
    LEFT JOIN "Tutorial" t ON t."subCategoryId" = sc.id AND t.status = 'PUBLISHED'
    JOIN "Category" c ON c.id = sc."categoryId" AND c.slug = 'baking'
    GROUP BY sc.slug, sc.name
    ORDER BY published DESC
  ` as Array<{ slug: string; name: string; published: number }>

  console.log('\nSub-category breakdown:')
  for (const r of rows) {
    console.log(`  ${r.slug}: ${r.published}`)
  }
  const total = rows.reduce((s, r) => s + r.published, 0)
  console.log(`  TOTAL: ${total}`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
