import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: true })
    break
  }
  const parent = dirname(dir)
  if (parent === dir) break
  dir = parent
}
async function main() {
  const { prisma } = await import('../src/index.js')

  const counts = await (prisma as any).$queryRaw<{ withRevised: bigint; withoutRevised: bigint; total: bigint }[]>`
    SELECT
      COUNT(*) FILTER (WHERE "revisedFrom" IS NOT NULL) AS "withRevised",
      COUNT(*) FILTER (WHERE "revisedFrom" IS NULL) AS "withoutRevised",
      COUNT(*) AS total
    FROM "Tutorial"
    WHERE status = 'PUBLISHED'
  `
  const withRevisedFrom = Number(counts[0].withRevised)
  const withoutRevisedFrom = Number(counts[0].withoutRevised)
  const total = Number(counts[0].total)

  console.log(`PUBLISHED total: ${total}`)
  console.log(`  revisedFrom set:  ${withRevisedFrom}`)
  console.log(`  revisedFrom null: ${withoutRevisedFrom}`)

  // Group by category
  console.log('\nBreakdown of revisedFrom-set per category:')
  const perCat = await (prisma as any).$queryRaw<{ slug: string; has: bigint; total: bigint }[]>`
    SELECT c.slug,
      COUNT(*) FILTER (WHERE t."revisedFrom" IS NOT NULL) AS has,
      COUNT(*) AS total
    FROM "Tutorial" t JOIN "Category" c ON t."categoryId" = c.id
    WHERE t.status = 'PUBLISHED'
    GROUP BY c.slug
    ORDER BY total DESC
  `
  for (const r of perCat) {
    console.log(`  ${r.slug.padEnd(28)} | ${String(Number(r.has)).padStart(5)} of ${String(Number(r.total)).padStart(5)} have revisedFrom set`)
  }

  // Sample a few revisedFrom values to see what they contain — is it the voice-retrofit snapshot pattern (old body JSON) or something else?
  console.log('\nSample 5 tutorials with revisedFrom set — what does the field actually contain?')
  const samples = await (prisma as any).$queryRaw<any[]>`
    SELECT t.slug, c.slug AS "categorySlug", t."revisedFrom", t."updatedAt"
    FROM "Tutorial" t JOIN "Category" c ON t."categoryId" = c.id
    WHERE t.status = 'PUBLISHED' AND t."revisedFrom" IS NOT NULL
    ORDER BY t."updatedAt" DESC
    LIMIT 5
  `
  for (const t of samples) {
    const r: any = t.revisedFrom
    const keys = r && typeof r === 'object' ? Object.keys(r).slice(0, 8).join(',') : 'not-an-object'
    const preview = JSON.stringify(r).slice(0, 200)
    console.log(`\n  ${t.categorySlug}/${t.slug} (updatedAt=${new Date(t.updatedAt).toISOString()})`)
    console.log(`    keys: ${keys}`)
    console.log(`    preview: ${preview}`)
  }

  // How does the count map to the voice-retrofit batches?
  // Pilot: docs/voice-pilot-2026-05-25/* — 10 slugs
  // Batches: docs/voice-retrofit-* — N slugs each
  const fs = await import('node:fs/promises')
  const docsDir = resolve(__dirname, '../../../docs')
  const entries = await fs.readdir(docsDir).catch(() => [] as string[])
  const voiceBatchDirs = entries.filter((e) => e.startsWith('voice-retrofit-') || e.startsWith('voice-pilot-'))
  let voiceBatchTotalSlugs = 0
  for (const d of voiceBatchDirs) {
    const slugsPath = resolve(docsDir, d, '_slugs.json')
    if (existsSync(slugsPath)) {
      const slugs = JSON.parse(await fs.readFile(slugsPath, 'utf-8'))
      const n = Array.isArray(slugs) ? slugs.length : (typeof slugs === 'object' ? Object.keys(slugs).length : 0)
      voiceBatchTotalSlugs += n
      console.log(`  voice batch dir ${d}: ${n} slugs`)
    } else {
      // Fall back: count .json files (excluding _handoff.md, _slugs.json)
      const files = await fs.readdir(resolve(docsDir, d)).catch(() => [] as string[])
      const tutorialJsonFiles = files.filter((f) => f.endsWith('.json') && !f.startsWith('_'))
      voiceBatchTotalSlugs += tutorialJsonFiles.length
      console.log(`  voice batch dir ${d}: ${tutorialJsonFiles.length} tutorial JSONs (no _slugs.json found)`)
    }
  }
  console.log(`\nTotal voice-batch slugs across all batch directories: ${voiceBatchTotalSlugs}`)
  console.log(`But revisedFrom shows: ${withRevisedFrom}`)
  console.log(`Difference (= revisedFrom set by SOMETHING OTHER than voice retrofit): ${withRevisedFrom - voiceBatchTotalSlugs}`)
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
