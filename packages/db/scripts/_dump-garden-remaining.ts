import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'
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
  const outDir = resolve(__dirname, '_dump-review')
  mkdirSync(outDir, { recursive: true })
  for (const slug of ['growing-calendula', 'growing-rosemary-from-cuttings']) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: {
        id: true, slug: true, title: true, subtitle: true, excerpt: true,
        type: true, difficulty: true, season: true, sourceType: true, sourceNotes: true,
        body: true, heroMediaId: true,
        category: { select: { slug: true } },
        subCategory: { select: { slug: true } },
        plantingMonths: true, harvestMonths: true, containerFriendly: true,
        indoorFriendly: true, regionsApplicable: true,
        techniqueSlugs: true, criticalTechniques: true, aliases: true,
        recipeTools: { select: { tool: { select: { slug: true } } } },
      },
    })
    if (!t) { console.log(`${slug}: NOT FOUND`); continue }
    writeFileSync(resolve(outDir, `${slug}.json`), JSON.stringify(t, null, 2))
    console.log(`${slug}: cat=${t.category.slug} sub=${t.subCategory?.slug} type=${t.type}`)
    console.log(`  plantingMonths=${JSON.stringify(t.plantingMonths)}`)
    console.log(`  harvestMonths=${JSON.stringify(t.harvestMonths)}`)
    console.log(`  containerFriendly=${t.containerFriendly} indoor=${t.indoorFriendly} regions=${JSON.stringify(t.regionsApplicable)}`)
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
