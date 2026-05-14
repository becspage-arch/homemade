import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main(): Promise<void> {
  let dir = __dirname
  for (let depth = 0; depth < 10; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }

  const { prisma } = await import('../../packages/db/src/index.js')

  const totalDrafts = await prisma.tutorial.count({ where: { status: 'DRAFT', type: 'RECIPE' } })
  const totalPublished = await prisma.tutorial.count({ where: { status: 'PUBLISHED', type: 'RECIPE' } })
  const cookingDrafts = await prisma.tutorial.count({
    where: { status: 'DRAFT', type: 'RECIPE', category: { slug: 'cooking' } },
  })

  console.log(`DRAFT recipes (all):       ${totalDrafts}`)
  console.log(`DRAFT recipes (cooking):   ${cookingDrafts}`)
  console.log(`PUBLISHED recipes:         ${totalPublished}`)

  // CREATOR source — Rebecca's personal recipes
  const creatorDrafts = await prisma.tutorial.count({
    where: { sourceType: 'CREATOR', status: 'DRAFT' },
  })
  console.log(`CREATOR-source drafts:     ${creatorDrafts}`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
