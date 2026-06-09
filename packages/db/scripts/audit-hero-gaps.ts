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

  // The specific example
  console.log('=== Turkish ebru marbling ===')
  const ex = await (prisma as any).$queryRaw<any[]>`
    SELECT t.slug, t.title, t."heroMediaId", t."heroImageStrategy",
           t."publishedAt",
           m."r2Key", m."cloudflareId", m."sourceUrl", m.source, m."verificationStatus", m.status
    FROM "Tutorial" t
    LEFT JOIN "Media" m ON t."heroMediaId" = m.id
    WHERE t.slug = 'turkish-ebru-marbling'
    LIMIT 1
  `
  if (ex.length === 0) console.log('  not found')
  ex.forEach((r: any) => {
    console.log(`  slug: ${r.slug}`)
    console.log(`  publishedAt: ${r.publishedAt}`)
    console.log(`  heroMediaId: ${r.heroMediaId || '(null)'}`)
    console.log(`  heroImageStrategy: ${r.heroImageStrategy}`)
    console.log(`  Media.r2Key: ${r.r2Key || '(null)'}`)
    console.log(`  Media.sourceUrl: ${r.sourceUrl ? r.sourceUrl.slice(0, 100) : '(null)'}`)
    console.log(`  Media source/verif/status: ${r.source}/${r.verificationStatus}/${r.status}`)
  })

  // Overall: PUBLISHED tutorials by hero render-readiness
  const stats = await (prisma as any).$queryRaw<any[]>`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE t."heroMediaId" IS NULL) AS "noHeroId",
      COUNT(*) FILTER (WHERE t."heroMediaId" IS NOT NULL AND m."r2Key" IS NULL AND m."cloudflareId" IS NULL) AS "heroIdNoUpload",
      COUNT(*) FILTER (WHERE t."heroMediaId" IS NOT NULL AND (m."r2Key" IS NOT NULL OR m."cloudflareId" IS NOT NULL)) AS "renderable"
    FROM "Tutorial" t
    LEFT JOIN "Media" m ON t."heroMediaId" = m.id
    WHERE t.status = 'PUBLISHED'
  `
  const s = stats[0]
  console.log('\n=== Overall PUBLISHED hero state ===')
  console.log(`  total PUBLISHED:         ${Number(s.total)}`)
  console.log(`  renderable (r2/CF set):  ${Number(s.renderable)}`)
  console.log(`  heroMediaId null:        ${Number(s.noHeroId)}  ← blank tile`)
  console.log(`  heroMediaId set, upload missing: ${Number(s.heroIdNoUpload)}  ← blank tile too`)

  // Per category breakdown of broken heroes
  const perCat = await (prisma as any).$queryRaw<any[]>`
    SELECT c.slug,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE t."heroMediaId" IS NULL OR (m."r2Key" IS NULL AND m."cloudflareId" IS NULL)) AS broken
    FROM "Tutorial" t
    JOIN "Category" c ON t."categoryId" = c.id
    LEFT JOIN "Media" m ON t."heroMediaId" = m.id
    WHERE t.status = 'PUBLISHED'
    GROUP BY c.slug
    HAVING COUNT(*) FILTER (WHERE t."heroMediaId" IS NULL OR (m."r2Key" IS NULL AND m."cloudflareId" IS NULL)) > 0
    ORDER BY broken DESC
  `
  console.log('\n=== Categories with broken heroes ===')
  perCat.forEach((r: any) => {
    console.log(`  ${r.slug.padEnd(28)} | ${String(Number(r.broken)).padStart(4)} broken of ${Number(r.total)} total`)
  })

  // When did the broken-hero tutorials publish?
  const recent = await (prisma as any).$queryRaw<any[]>`
    SELECT DATE(t."publishedAt") AS d, COUNT(*) AS n
    FROM "Tutorial" t
    LEFT JOIN "Media" m ON t."heroMediaId" = m.id
    WHERE t.status = 'PUBLISHED' AND (t."heroMediaId" IS NULL OR (m."r2Key" IS NULL AND m."cloudflareId" IS NULL))
    GROUP BY d
    ORDER BY d DESC
    LIMIT 10
  `
  console.log('\n=== Broken-hero tutorials by publish date ===')
  recent.forEach((r: any) => {
    console.log(`  ${new Date(r.d).toISOString().slice(0, 10)} | ${Number(r.n)} broken-hero tutorials`)
  })
}
main().catch((e) => { console.error(e); process.exit(1) })
