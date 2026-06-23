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
  const db = prisma as any

  const cats = ['cooking', 'baking']

  for (const slug of cats) {
    console.log(`\n========== ${slug.toUpperCase()} (Tutorial) ==========`)

    const totals = await db.$queryRaw<any[]>`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE t."heroMediaId" IS NULL) AS "noHero",
        COUNT(*) FILTER (WHERE t."heroMediaId" IS NOT NULL AND m."r2Key" IS NULL AND m."cloudflareId" IS NULL) AS "heroNoUpload",
        COUNT(*) FILTER (WHERE t."heroMediaId" IS NOT NULL AND (m."r2Key" IS NOT NULL OR m."cloudflareId" IS NOT NULL)) AS "hasRenderable"
      FROM "Tutorial" t
      JOIN "Category" c ON t."categoryId" = c.id
      LEFT JOIN "Media" m ON t."heroMediaId" = m.id
      WHERE t.status = 'PUBLISHED' AND c.slug = ${slug}
    `
    const s = totals[0]
    console.log(`  PUBLISHED total:       ${Number(s.total)}`)
    console.log(`  has renderable hero:   ${Number(s.hasRenderable)}`)
    console.log(`  heroMediaId NULL:      ${Number(s.noHero)}`)
    console.log(`  hero set, no upload:   ${Number(s.heroNoUpload)}`)

    const bySource = await db.$queryRaw<any[]>`
      SELECT COALESCE(m.source, '(null)') AS source, COUNT(*) AS n
      FROM "Tutorial" t
      JOIN "Category" c ON t."categoryId" = c.id
      JOIN "Media" m ON t."heroMediaId" = m.id
      WHERE t.status = 'PUBLISHED' AND c.slug = ${slug}
      GROUP BY m.source ORDER BY n DESC
    `
    console.log('  --- hero by Media.source ---')
    bySource.forEach((r: any) => console.log(`    ${String(r.source).padEnd(20)} ${Number(r.n)}`))

    const byStrategy = await db.$queryRaw<any[]>`
      SELECT COALESCE(t."heroImageStrategy"::text, '(null)') AS strat, COUNT(*) AS n
      FROM "Tutorial" t
      JOIN "Category" c ON t."categoryId" = c.id
      WHERE t.status = 'PUBLISHED' AND c.slug = ${slug}
      GROUP BY t."heroImageStrategy" ORDER BY n DESC
    `
    console.log('  --- heroImageStrategy ---')
    byStrategy.forEach((r: any) => console.log(`    ${String(r.strat).padEnd(22)} ${Number(r.n)}`))

    const byVerif = await db.$queryRaw<any[]>`
      SELECT COALESCE(m."verificationStatus"::text, '(null)') AS v, COUNT(*) AS n
      FROM "Tutorial" t
      JOIN "Category" c ON t."categoryId" = c.id
      JOIN "Media" m ON t."heroMediaId" = m.id
      WHERE t.status = 'PUBLISHED' AND c.slug = ${slug}
      GROUP BY m."verificationStatus" ORDER BY n DESC
    `
    console.log('  --- Media.verificationStatus (heroes) ---')
    byVerif.forEach((r: any) => console.log(`    ${String(r.v).padEnd(26)} ${Number(r.n)}`))

    const byQuality = await db.$queryRaw<any[]>`
      SELECT COALESCE(t."heroQuality"::text, '(null)') AS q, COUNT(*) AS n
      FROM "Tutorial" t
      JOIN "Category" c ON t."categoryId" = c.id
      WHERE t.status = 'PUBLISHED' AND c.slug = ${slug}
      GROUP BY t."heroQuality" ORDER BY n DESC
    `
    console.log('  --- heroQuality ---')
    byQuality.forEach((r: any) => console.log(`    ${String(r.q).padEnd(14)} ${Number(r.n)}`))
  }

  // Cross-stitch patterns
  console.log(`\n========== CROSS-STITCH (Pattern) ==========`)
  const pTot = await db.$queryRaw<any[]>`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE p."thumbnailMediaId" IS NULL AND p."heroMediaId" IS NULL) AS "noImage",
      COUNT(*) FILTER (WHERE p."thumbnailMediaId" IS NOT NULL) AS "hasThumb",
      COUNT(*) FILTER (WHERE p."heroMediaId" IS NOT NULL) AS "hasHero"
    FROM "Pattern" p
    JOIN "SubCategory" sc ON p."subCategoryId" = sc.id
    JOIN "Category" c ON sc."categoryId" = c.id
    WHERE p.visibility = 'PUBLIC' AND c.slug = 'cross-stitch'
  `
  const p = pTot[0]
  console.log(`  PUBLIC total:          ${Number(p.total)}`)
  console.log(`  has thumbnail:         ${Number(p.hasThumb)}`)
  console.log(`  has hero:              ${Number(p.hasHero)}`)
  console.log(`  no image at all:       ${Number(p.noImage)}`)

  const pThumbSrc = await db.$queryRaw<any[]>`
    SELECT COALESCE(m.source, '(null)') AS source, COUNT(*) AS n
    FROM "Pattern" p
    JOIN "SubCategory" sc ON p."subCategoryId" = sc.id
    JOIN "Category" c ON sc."categoryId" = c.id
    JOIN "Media" m ON p."thumbnailMediaId" = m.id
    WHERE p.visibility = 'PUBLIC' AND c.slug = 'cross-stitch'
    GROUP BY m.source ORDER BY n DESC
  `
  console.log('  --- thumbnail by Media.source ---')
  pThumbSrc.forEach((r: any) => console.log(`    ${String(r.source).padEnd(20)} ${Number(r.n)}`))

  // Category landing page heroes (Category + SubCategory image fields, if any)
  console.log(`\n========== CATEGORY / SUBCATEGORY descriptions+images ==========`)
  const catRows = await db.$queryRaw<any[]>`
    SELECT c.slug, c.name, c.description
    FROM "Category" c
    WHERE c.slug IN ('cooking','baking','cross-stitch')
    ORDER BY c.slug
  `
  catRows.forEach((r: any) => {
    console.log(`  [${r.slug}]`)
    console.log(`     desc: ${r.description || '(null)'}`)
  })

  const subRows = await db.$queryRaw<any[]>`
    SELECT c.slug AS cat, sc.slug, sc.name, sc.description
    FROM "SubCategory" sc
    JOIN "Category" c ON sc."categoryId" = c.id
    WHERE c.slug IN ('cooking','baking','cross-stitch')
    ORDER BY c.slug, sc.slug
  `
  console.log('  --- sub-categories ---')
  subRows.forEach((r: any) => {
    console.log(`  [${r.cat}/${r.slug}] ${r.name}`)
    console.log(`     desc: ${r.description || '(null)'}`)
  })
}
main().catch((e) => { console.error(e); process.exit(1) })
