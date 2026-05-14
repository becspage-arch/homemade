// Throwaway helper: delete the 5 orphan brand-named master Ingredient rows
// after their slugs were renamed to brand-free equivalents. Delete after
// the session ships.
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

const OLD_SLUGS = [
  'baileys',
  'tabasco',
  'biscoff-biscuit',
  'biscoff-spread',
  'oreo-biscuit',
]

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')
  const rows = await prisma.ingredient.findMany({
    where: { slug: { in: OLD_SLUGS } },
    select: { id: true, slug: true, name: true },
  })
  console.log(`Found ${rows.length} orphan master rows:`)
  for (const r of rows) console.log(`  ${r.slug}: ${r.name}`)
  if (rows.length === 0) {
    await prisma.$disconnect()
    return
  }
  // Recipe-ingredient join rows referencing these will block deletion.
  // Detach them — the briefs were already patched to point at the new slugs.
  const ids = rows.map((r) => r.id)
  const joinDeletes = await prisma.recipeIngredient.deleteMany({ where: { ingredientId: { in: ids } } })
  console.log(`Detached ${joinDeletes.count} RecipeIngredient rows.`)
  await prisma.ingredient.deleteMany({ where: { id: { in: ids } } })
  console.log('Deleted master rows.')
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
