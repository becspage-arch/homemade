/**
 * Audit Media rows where the R2 upload never completed:
 *   r2Key IS NULL AND sourceUrl IS NOT NULL
 *
 * These rows exist but can't render — the bytes were never pushed to R2.
 * Reports the media id, tutorial slug, category, status, and source URL.
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
  const rows = await prisma.media.findMany({
    where: { r2Key: null, sourceUrl: { not: null } },
    select: {
      id: true,
      status: true,
      source: true,
      sourceUrl: true,
      licenceCode: true,
      width: true,
      height: true,
      tutorialsHero: {
        select: {
          id: true,
          slug: true,
          status: true,
          category: { select: { slug: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`\nBroken Media rows (r2Key IS NULL, sourceUrl IS NOT NULL): ${rows.length}`)
  if (rows.length === 0) { console.log('None.'); return }

  for (const m of rows) {
    const t = m.tutorialsHero[0]
    const tutInfo = t ? `${t.slug} [${t.category.slug}] status=${t.status}` : '(no tutorial attached)'
    console.log(`\n  Media ${m.id}`)
    console.log(`    Tutorial: ${tutInfo}`)
    console.log(`    Media status: ${m.status}  source: ${m.source ?? '(null)'}`)
    console.log(`    Licence: ${m.licenceCode ?? '(null)'}  ${m.width}x${m.height}`)
    console.log(`    sourceUrl: ${m.sourceUrl?.slice(0, 100)}`)
  }

  // Also check if any PUBLISHED tutorials have broken media attached
  const pubBroken = rows.filter(m => m.tutorialsHero.some(t => t.status === 'PUBLISHED'))
  console.log(`\nOf these, ${pubBroken.length} are attached to PUBLISHED tutorials.`)
  const draftBroken = rows.filter(m => m.tutorialsHero.some(t => t.status === 'DRAFT'))
  console.log(`And ${draftBroken.length} are attached to DRAFT tutorials.`)
}
main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect().then(() => process.exit(1)) })
