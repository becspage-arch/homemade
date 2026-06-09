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

  // Cottage pie hero state
  console.log('=== Cottage Pie hero ===')
  const rows = await (prisma as any).$queryRaw<any[]>`
    SELECT t.slug, t.title, t."heroMediaId", t."heroImageStrategy",
           m."r2Key", m."cloudflareId", m."sourceUrl", m.source, m."verificationStatus", m.status
    FROM "Tutorial" t
    LEFT JOIN "Media" m ON t."heroMediaId" = m.id
    WHERE t.title ILIKE '%cottage pie%' AND t.status = 'PUBLISHED'
    LIMIT 5
  `
  rows.forEach((r: any) => {
    console.log(`  ${r.slug}`)
    console.log(`    heroMediaId: ${r.heroMediaId || '(null)'}`)
    console.log(`    heroImageStrategy: ${r.heroImageStrategy}`)
    console.log(`    Media.r2Key: ${r.r2Key || '(null)'}`)
    console.log(`    Media.cloudflareId: ${r.cloudflareId || '(null)'}`)
    console.log(`    Media.sourceUrl: ${(r.sourceUrl || '(null)').slice(0, 80)}`)
    console.log(`    source/verif/status: ${r.source}/${r.verificationStatus}/${r.status}`)
  })

  // EditorialPick join model
  console.log('\n=== Recent editorial picks + their hero state ===')
  const picks = await (prisma as any).$queryRaw<any[]>`
    SELECT ep.id, t.slug, t.title,
           t."heroMediaId" IS NOT NULL AS "hasHeroId",
           m."r2Key" IS NOT NULL AS "hasR2"
    FROM "EditorialPick" ep
    JOIN "Tutorial" t ON ep."tutorialId" = t.id
    LEFT JOIN "Media" m ON t."heroMediaId" = m.id
    ORDER BY ep."weekStart" DESC NULLS LAST
    LIMIT 15
  `
  picks.forEach((p: any) => {
    console.log(`  hero=${p.hasHeroId ? 'Y' : 'N'} r2=${p.hasR2 ? 'Y' : 'N'} | ${p.title} (${p.slug})`)
  })
}
main().catch((e) => { console.error(e); process.exit(1) })
