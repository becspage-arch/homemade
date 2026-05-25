/**
 * Throw-away diagnostic: count the audit scope for the relevance pass.
 *
 * Outputs:
 *  - total PUBLISHED tutorials
 *  - PUBLISHED with heroMediaId set
 *  - PUBLISHED whose hero Media.source is real-photo (unsplash / pexels / wikimedia / pixabay)
 *  - PUBLISHED whose hero Media.source is flux-schnell (AI generated)
 *  - PUBLISHED whose hero Media.source is procedural-card / null / other (skip from audit)
 *  - existing Media.verificationStatus distribution for the in-scope set
 *  - per-category breakdown of the in-scope (real-photo) set
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
let dir = __dirname
for (let depth = 0; depth < 8; depth++) {
  const c = resolve(dir, '.env.credentials')
  if (existsSync(c)) { loadEnv({ path: c, override: true }); break }
  const p = dirname(dir); if (p === dir) break; dir = p
}
import { prisma } from '../src'

async function main() {
  const totalPub = await prisma.tutorial.count({ where: { status: 'PUBLISHED' } })
  const withHero = await prisma.tutorial.count({
    where: { status: 'PUBLISHED', heroMediaId: { not: null } },
  })

  const sourceCounts = await prisma.$queryRaw<{ source: string | null; n: bigint }[]>`
    SELECT m.source, COUNT(*) AS n
    FROM "Tutorial" t
    JOIN "Media" m ON m.id = t."heroMediaId"
    WHERE t.status = 'PUBLISHED'
    GROUP BY m.source
    ORDER BY n DESC
  `

  const statusCounts = await prisma.$queryRaw<{ verificationStatus: string; n: bigint }[]>`
    SELECT m."verificationStatus", COUNT(*) AS n
    FROM "Tutorial" t
    JOIN "Media" m ON m.id = t."heroMediaId"
    WHERE t.status = 'PUBLISHED'
      AND m.source IN ('unsplash', 'pexels', 'wikimedia', 'pixabay', 'flux-schnell')
    GROUP BY m."verificationStatus"
    ORDER BY n DESC
  `

  const perCategory = await prisma.$queryRaw<{
    slug: string
    published: bigint
    real_photo: bigint
    ai: bigint
    procedural: bigint
    no_hero: bigint
  }[]>`
    SELECT c.slug,
      COUNT(*) FILTER (WHERE t.status = 'PUBLISHED') AS published,
      COUNT(*) FILTER (WHERE t.status = 'PUBLISHED' AND m.source IN ('unsplash','pexels','wikimedia','pixabay')) AS real_photo,
      COUNT(*) FILTER (WHERE t.status = 'PUBLISHED' AND m.source = 'flux-schnell') AS ai,
      COUNT(*) FILTER (WHERE t.status = 'PUBLISHED' AND (m.source = 'procedural-card' OR t."heroImageStrategy" = 'PROCEDURAL_CARD')) AS procedural,
      COUNT(*) FILTER (WHERE t.status = 'PUBLISHED' AND t."heroMediaId" IS NULL) AS no_hero
    FROM "Tutorial" t
    LEFT JOIN "Media" m ON m.id = t."heroMediaId"
    JOIN "Category" c ON c.id = t."categoryId"
    GROUP BY c.slug
    ORDER BY real_photo DESC
  `

  console.log(`\nPUBLISHED total:              ${totalPub}`)
  console.log(`PUBLISHED with heroMediaId:   ${withHero}`)

  console.log('\nhero Media.source distribution (PUBLISHED only):')
  for (const r of sourceCounts) {
    console.log(`  ${String(r.source ?? 'NULL').padEnd(20)} ${String(r.n).padStart(6)}`)
  }

  console.log('\nMedia.verificationStatus for real-photo + AI heroes:')
  for (const r of statusCounts) {
    console.log(`  ${r.verificationStatus.padEnd(28)} ${String(r.n).padStart(6)}`)
  }

  console.log('\nper-category (PUBLISHED):')
  console.log('category                     | pub    | real | ai   | proc | none')
  console.log('-----------------------------+--------+------+------+------+-----')
  let totReal = 0n, totAi = 0n, totProc = 0n, totNone = 0n
  for (const r of perCategory) {
    console.log(
      `${r.slug.padEnd(28)} | ${String(r.published).padStart(6)} | ${String(r.real_photo).padStart(4)} | ${String(r.ai).padStart(4)} | ${String(r.procedural).padStart(4)} | ${String(r.no_hero).padStart(4)}`,
    )
    totReal += r.real_photo
    totAi += r.ai
    totProc += r.procedural
    totNone += r.no_hero
  }
  console.log('-----------------------------+--------+------+------+------+-----')
  console.log(
    `${'TOTAL'.padEnd(28)} | ${String(totalPub).padStart(6)} | ${String(totReal).padStart(4)} | ${String(totAi).padStart(4)} | ${String(totProc).padStart(4)} | ${String(totNone).padStart(4)}`,
  )
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
