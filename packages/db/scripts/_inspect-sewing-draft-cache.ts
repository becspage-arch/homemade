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
async function main() {
  const { prisma } = await import('../src/index.js')
  const count = await prisma.sewingPatternDraftCache.count()
  console.log(`SewingPatternDraftCache row count: ${count}`)
  const sample = await prisma.sewingPatternDraftCache.findFirst()
  if (sample) console.log('sample row:', { id: sample.id, designSlug: sample.designSlug, calibrationMode: sample.calibrationMode, freesewingVersion: sample.freesewingVersion })
  // Confirm the SewingPattern.engineCacheKey column is still in place
  const sp = await prisma.$queryRawUnsafe<Array<{ engineCacheKey: string | null }>>(
    `SELECT "engineCacheKey" FROM "SewingPattern" LIMIT 1`,
  )
  console.log(`SewingPattern.engineCacheKey column accessible: ${Array.isArray(sp)}`)
  // Sewing category state
  const sewingCat = await prisma.category.findUnique({ where: { slug: 'sewing' }, select: { pipelineStatus: true, isPublicVisible: true } })
  console.log('Category.sewing:', sewingCat)
  // Freesewing-backed SewingPattern rows seeded by deploy.
  const fsRows = await prisma.sewingPattern.findMany({
    where: { isFreesewingDesign: true },
    select: { slug: true, name: true, freesewingDesignSlug: true, freesewingVersion: true, sourceLicence: true, visibility: true, availableFormats: true },
  })
  console.log(`Freesewing-backed SewingPattern rows: ${fsRows.length}`)
  for (const r of fsRows) console.log('  ', r)
  await prisma.$disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
