/**
 * Fill `Pattern.flossSummary` for the public cross-stitch catalogue.
 *
 * The publish path writes the summary beside `data` from migration
 * 20261018000000 on, and the pattern page fills a missing one on its first
 * view, so nothing breaks without this. It exists so the first customer to
 * open a showpiece after the deploy does not pay the five-second count.
 *
 * Every summary is checked before it is written: the full crosses it counts
 * plus the chart's fractionals must equal the row's stored `totalStitches`,
 * the same guard the page's Postgres path uses. A row that fails is reported
 * and left NULL (the page then works it out the old way).
 *
 * Writes go through raw SQL so `updatedAt` is not bumped (the summary is
 * derived, not an edit), and only onto a row whose summary is still NULL.
 * Needs the column, so it refuses to --apply before the migration is live.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/xs-floss-summary-backfill.ts            dry run
 *   pnpm --filter "@homemade/db" exec tsx scripts/xs-floss-summary-backfill.ts --apply
 *   ... [--sample=<slug>,...]   print those rows' summaries
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true, quiet: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

const APPLY = process.argv.includes('--apply')
const SAMPLE = new Set(
  (process.argv.find((a) => a.startsWith('--sample='))?.slice('--sample='.length) ?? '').split(',').filter(Boolean),
)

async function main(): Promise<void> {
  const { prisma, parsePatternData, computeFlossSummary } = await import('../src/index.js')

  const col = await prisma.$queryRaw<{ n: bigint }[]>`
    select count(*) as n from information_schema.columns
    where table_name = 'Pattern' and column_name = 'flossSummary'`
  const columnLive = Number(col[0]?.n ?? 0) > 0
  if (APPLY && !columnLive) throw new Error('Pattern.flossSummary is not live yet: run after the migration deploys')

  const rows = columnLive
    ? await prisma.$queryRaw<{ id: string; slug: string | null; totalStitches: number; has: boolean }[]>`
        select id, slug, "totalStitches", ("flossSummary" is not null) as has from "Pattern"
        where type = 'CROSS_STITCH' and "ownerUserId" is null and visibility = 'PUBLIC' order by slug`
    : await prisma.$queryRaw<{ id: string; slug: string | null; totalStitches: number; has: boolean }[]>`
        select id, slug, "totalStitches", false as has from "Pattern"
        where type = 'CROSS_STITCH' and "ownerUserId" is null and visibility = 'PUBLIC' order by slug`

  const tally = { rows: rows.length, alreadyStored: 0, computed: 0, written: 0, mismatch: 0, unparseable: 0, bytes: 0, maxBytes: 0 }
  console.log(`[floss] ${rows.length} public cross-stitch rows; column ${columnLive ? 'live' : 'NOT live yet'}${APPLY ? '' : ' (dry run)'}`)

  for (const r of rows) {
    if (r.has) { tally.alreadyStored++; continue }
    const full = await prisma.pattern.findUnique({ where: { id: r.id }, select: { data: true } })
    let data
    try {
      data = parsePatternData(full!.data)
    } catch {
      tally.unparseable++
      console.log(`[floss] UNPARSEABLE ${r.slug}`)
      continue
    }
    const summary = computeFlossSummary(data)
    const counted = summary.lines.reduce((n, l) => n + l.stitches, 0) + data.grid.fractional.length
    if (counted !== r.totalStitches) {
      tally.mismatch++
      console.log(`[floss] MISMATCH ${r.slug}: counted ${counted}, row says ${r.totalStitches}; left NULL`)
      continue
    }
    tally.computed++
    const json = JSON.stringify(summary)
    tally.bytes += json.length
    tally.maxBytes = Math.max(tally.maxBytes, json.length)
    if (r.slug && SAMPLE.has(r.slug)) console.log(`[floss] SAMPLE ${r.slug}: ${json.slice(0, 600)}${json.length > 600 ? '…' : ''}`)
    if (!APPLY) continue
    const n = await prisma.$executeRaw`
      update "Pattern" set "flossSummary" = ${json}::jsonb where id = ${r.id} and "flossSummary" is null`
    tally.written += n
  }
  console.log(`[floss] ${JSON.stringify(tally)}`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[floss] failed:', err)
  process.exit(1)
})
