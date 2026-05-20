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
const TARGETS = [
  'growing-strawberries',
  'growing-tomatoes-from-seed',
  'start-and-end-a-thread-cleanly',
  'running-and-backstitch-by-hand',
  'simple-drawstring-bag',
  'long-tail-cast-on',
  'stocking-stitch-dishcloth',
]
async function main() {
  const { prisma } = await import('../src/index.js')
  const outDir = resolve(__dirname, '_dump-review')
  mkdirSync(outDir, { recursive: true })
  for (const slug of TARGETS) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: {
        id: true, slug: true, title: true, subtitle: true, excerpt: true,
        type: true, difficulty: true, season: true, sourceType: true, sourceNotes: true,
        body: true, heroMediaId: true,
        category: { select: { slug: true } },
        subCategory: { select: { slug: true } },
        // garden metadata
        plantingMonths: true, harvestMonths: true, containerFriendly: true,
        indoorFriendly: true, regionsApplicable: true,
        // knitting/crochet
        primaryYarnWeight: { select: { slug: true } },
        primaryNeedle: { select: { slug: true } },
        primaryHook: { select: { slug: true } },
        gaugeText: true, finishedSizeText: true, terminologyConvention: true,
        chartDefinition: true, craftStitchSlugs: true, craftTechniqueTags: true,
        // sewing
        craftType: true, projectShape: true, requiredFabricTypes: true,
        requiredNotions: true, sewingMethod: true, fabricYardageMetres: true,
        finishedDimensionsCm: true, bodyMeasurementsRequired: true,
        // technique linking
        techniqueSlugs: true, criticalTechniques: true, aliases: true,
        // tools + ingredients
        recipeTools: { select: { tool: { select: { slug: true } }, isOptional: true, notes: true, position: true } },
      },
    })
    if (!t) { console.log(`${slug}: NOT FOUND`); continue }
    writeFileSync(resolve(outDir, `${slug}.json`), JSON.stringify(t, null, 2))
    console.log(`${slug}: cat=${t.category.slug} sub=${t.subCategory?.slug} type=${t.type}`)
  }
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
