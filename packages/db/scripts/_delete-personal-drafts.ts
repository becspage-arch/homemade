// Throwaway helper for the personal-recipes redo session. Deletes every
// CREATOR-source DRAFT recipe (the first-ingest personal recipes) so the redo
// can land cleanly. Delete this script after the session ships.
//
// Idempotent — safe to re-run.
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
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
}

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  const dryRun = process.argv.includes('--dry-run')

  const targets = await prisma.tutorial.findMany({
    where: {
      sourceType: 'CREATOR',
      status: 'DRAFT',
      type: 'RECIPE',
    },
    select: { id: true, slug: true, title: true, publishedAt: true },
  })

  console.log(`Found ${targets.length} CREATOR-source DRAFT recipes.`)
  if (targets.length === 0) return

  if (dryRun) {
    console.log('Dry-run — not deleting. Sample:')
    for (const t of targets.slice(0, 10)) console.log(`  ${t.slug}: ${t.title}`)
    return
  }

  // Delete dependent rows first (versions, ingredients, tools), then the tutorial.
  const ids = targets.map((t) => t.id)

  const versions = await prisma.tutorialVersion.deleteMany({ where: { tutorialId: { in: ids } } })
  console.log(`  TutorialVersion rows: ${versions.count}`)

  const ingredients = await prisma.recipeIngredient.deleteMany({ where: { tutorialId: { in: ids } } })
  console.log(`  RecipeIngredient rows: ${ingredients.count}`)

  const tools = await prisma.recipeTool.deleteMany({ where: { tutorialId: { in: ids } } })
  console.log(`  RecipeTool rows: ${tools.count}`)

  const deleted = await prisma.tutorial.deleteMany({ where: { id: { in: ids } } })
  console.log(`  Tutorial rows: ${deleted.count}`)

  console.log('Done.')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
