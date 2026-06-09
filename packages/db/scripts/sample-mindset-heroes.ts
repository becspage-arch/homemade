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

  // Mindset heroes — when were they generated? are they all identical template?
  const rows = await (prisma as any).$queryRaw<any[]>`
    SELECT t.slug, t.title, sc.slug AS "subSlug", m.source, m."r2Key", m."verificationStatus", m."createdAt"
    FROM "Tutorial" t
    JOIN "Category" c ON t."categoryId" = c.id
    JOIN "Media" m ON t."heroMediaId" = m.id
    LEFT JOIN "SubCategory" sc ON t."subCategoryId" = sc.id
    WHERE c.slug = 'mindset' AND t.status = 'PUBLISHED'
    ORDER BY m."createdAt" DESC
  `
  console.log(`Total PUBLISHED mindset with heroes: ${rows.length}`)

  // Group by source
  const bySource: Record<string, number> = {}
  for (const r of rows) bySource[r.source || '(null)'] = (bySource[r.source || '(null)'] || 0) + 1
  console.log('\nBy source:')
  Object.entries(bySource).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => console.log(`  ${String(c).padStart(5)} | ${s}`))

  // Group by verification status
  const byStatus: Record<string, number> = {}
  for (const r of rows) byStatus[r.verificationStatus || '(null)'] = (byStatus[r.verificationStatus || '(null)'] || 0) + 1
  console.log('\nBy verification status:')
  Object.entries(byStatus).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => console.log(`  ${String(c).padStart(5)} | ${s}`))

  // Group by sub-category
  const bySubcat: Record<string, number> = {}
  for (const r of rows) bySubcat[r.subSlug || '(null)'] = (bySubcat[r.subSlug || '(null)'] || 0) + 1
  console.log('\nBy sub-category:')
  Object.entries(bySubcat).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => console.log(`  ${String(c).padStart(5)} | ${s}`))

  // Sample by sub-category: 1 tutorial per sub, paste hero URL
  console.log('\nSample one tutorial per sub-category (most recent hero):')
  const samples = await (prisma as any).$queryRaw<any[]>`
    SELECT DISTINCT ON (sc.slug) t.slug, t.title, sc.slug AS "subSlug", m.source, m."r2Key", m."createdAt"
    FROM "Tutorial" t
    JOIN "Category" c ON t."categoryId" = c.id
    JOIN "Media" m ON t."heroMediaId" = m.id
    LEFT JOIN "SubCategory" sc ON t."subCategoryId" = sc.id
    WHERE c.slug = 'mindset' AND t.status = 'PUBLISHED' AND sc.slug IS NOT NULL
    ORDER BY sc.slug, m."createdAt" DESC
  `
  samples.forEach((s: any) => {
    const url = `https://media.homemade.education/${s.r2Key}`
    const tutorialUrl = `https://homemade.education/mindset/${s.slug}`
    console.log(`  [${s.subSlug.padEnd(20)}] ${s.title}`)
    console.log(`    image: ${url}`)
    console.log(`    page:  ${tutorialUrl}`)
    console.log(`    created: ${new Date(s.createdAt).toISOString()}`)
  })

  // Date distribution of Media row creation — when were mindset heroes generated?
  console.log('\nMindset hero generation dates (by day):')
  const byDay = await (prisma as any).$queryRaw<any[]>`
    SELECT DATE(m."createdAt") AS d, COUNT(*) AS n
    FROM "Tutorial" t
    JOIN "Category" c ON t."categoryId" = c.id
    JOIN "Media" m ON t."heroMediaId" = m.id
    WHERE c.slug = 'mindset' AND t.status = 'PUBLISHED'
    GROUP BY d
    ORDER BY d DESC
    LIMIT 15
  `
  byDay.forEach((r: any) => {
    console.log(`  ${new Date(r.d).toISOString().slice(0, 10)} | ${r.n} heroes`)
  })
}
main().catch((e) => { console.error(e); process.exit(1) })
