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

  // Specific tutorials Rebecca mentioned
  const slugs = ['chamomile', 'marshmallow-root-gargle-for-sore-throat']
  console.log('=== Specific tutorials Rebecca flagged ===')
  for (const slug of slugs) {
    const ts = await (prisma as any).$queryRaw<any[]>`
      SELECT t.slug, t.title, t."publishedAt", t."voiceRetrofittedAt",
             t."heroMediaId", t."heroImageStrategy",
             m."r2Key" IS NOT NULL AS "hasR2"
      FROM "Tutorial" t
      LEFT JOIN "Media" m ON t."heroMediaId" = m.id
      WHERE t.slug ILIKE ${'%' + slug + '%'}
      ORDER BY t."publishedAt" DESC NULLS LAST
      LIMIT 3
    `
    for (const t of ts) {
      console.log(`  ${t.slug}`)
      console.log(`    publishedAt:        ${t.publishedAt}`)
      console.log(`    voiceRetrofittedAt: ${t.voiceRetrofittedAt || '(null) ← never voice-checked'}`)
      console.log(`    heroMediaId:        ${t.heroMediaId ? 'set' : '(null)'}`)
      console.log(`    hero r2Key:         ${t.hasR2 ? 'set' : '(null) ← image broken'}`)
    }
  }

  // Overall herbal-medicine QC coverage
  console.log('\n=== Herbal-medicine PUBLISHED voice coverage ===')
  const stats = await (prisma as any).$queryRaw<any[]>`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE t."voiceRetrofittedAt" IS NOT NULL) AS "voiceDone",
      COUNT(*) FILTER (WHERE t."voiceRetrofittedAt" IS NULL) AS "voiceNever"
    FROM "Tutorial" t
    JOIN "Category" c ON t."categoryId" = c.id
    WHERE c.slug = 'herbal-medicine' AND t.status = 'PUBLISHED'
  `
  const s = stats[0]
  console.log(`  total PUBLISHED:              ${Number(s.total)}`)
  console.log(`  voice-retrofitted / QC'd:     ${Number(s.voiceDone)}`)
  console.log(`  NEVER voice-retrofitted:      ${Number(s.voiceNever)}`)

  // When were they published?
  const byDate = await (prisma as any).$queryRaw<any[]>`
    SELECT DATE(t."publishedAt") AS d, COUNT(*) AS n,
      COUNT(*) FILTER (WHERE t."voiceRetrofittedAt" IS NOT NULL) AS "voiceDone"
    FROM "Tutorial" t
    JOIN "Category" c ON t."categoryId" = c.id
    WHERE c.slug = 'herbal-medicine' AND t.status = 'PUBLISHED'
    GROUP BY d ORDER BY d DESC LIMIT 10
  `
  console.log('\n=== Herbal-medicine PUBLISHED by date ===')
  byDate.forEach((r: any) => {
    const dStr = new Date(r.d).toISOString().slice(0, 10)
    console.log(`  ${dStr} | ${Number(r.n)} published / ${Number(r.voiceDone)} voice-checked`)
  })
}
main().catch((e) => { console.error(e); process.exit(1) })
