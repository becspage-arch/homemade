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

  // Counts: hero image situation per category
  const perCat = await (prisma as any).$queryRaw<any[]>`
    SELECT
      c.slug,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE t."heroMediaId" IS NOT NULL) AS "withHero",
      COUNT(m.id) FILTER (WHERE m."r2Key" IS NOT NULL) AS "uploaded",
      COUNT(m.id) FILTER (WHERE m."verificationStatus" = 'VERIFIED') AS "verified",
      COUNT(m.id) FILTER (WHERE m."verificationStatus" = 'REJECTED_USED_PROCEDURAL') AS "procedural"
    FROM "Tutorial" t
    JOIN "Category" c ON t."categoryId" = c.id
    LEFT JOIN "Media" m ON t."heroMediaId" = m.id
    WHERE t.status = 'PUBLISHED'
    GROUP BY c.slug
    ORDER BY total DESC
  `
  console.log('Image state per category (PUBLISHED tutorials):')
  console.log('category                      | total | hero  | uploaded | VERIFIED | procedural')
  console.log('-'.repeat(95))
  for (const r of perCat) {
    const slug = r.slug.padEnd(28)
    const total = String(Number(r.total)).padStart(5)
    const hero = String(Number(r.withHero)).padStart(5)
    const uploaded = String(Number(r.uploaded)).padStart(8)
    const verified = String(Number(r.verified)).padStart(8)
    const proc = String(Number(r.procedural)).padStart(10)
    console.log(`${slug} | ${total} | ${hero} | ${uploaded} | ${verified} | ${proc}`)
  }

  // Overall
  const overall = await (prisma as any).$queryRaw<any[]>`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE t."heroMediaId" IS NOT NULL) AS "withHero",
      COUNT(m.id) FILTER (WHERE m."r2Key" IS NOT NULL) AS "uploaded",
      COUNT(m.id) FILTER (WHERE m."verificationStatus" = 'VERIFIED') AS "verified",
      COUNT(m.id) FILTER (WHERE m."verificationStatus" = 'UNVERIFIED') AS "unverified",
      COUNT(m.id) FILTER (WHERE m."verificationStatus" = 'REJECTED') AS "rejected",
      COUNT(m.id) FILTER (WHERE m."verificationStatus" = 'REJECTED_USED_PROCEDURAL') AS "procedural"
    FROM "Tutorial" t
    LEFT JOIN "Media" m ON t."heroMediaId" = m.id
    WHERE t.status = 'PUBLISHED'
  `
  const o = overall[0]
  console.log('\nOverall PUBLISHED state:')
  console.log(`  total:                          ${o.total}`)
  console.log(`  with heroMediaId set:           ${o.withHero}`)
  console.log(`  uploaded (r2Key set):           ${o.uploaded}`)
  console.log(`  VERIFIED:                       ${o.verified}`)
  console.log(`  UNVERIFIED (not yet scored):    ${o.unverified}`)
  console.log(`  REJECTED:                       ${o.rejected}`)
  console.log(`  REJECTED_USED_PROCEDURAL:       ${o.procedural}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
