/**
 * xs-cull — reversible cull of published cross-stitch patterns.
 *
 * REVERSIBLE BY DESIGN: nothing is deleted. A culled pattern is set to PRIVATE,
 * dropped from the search index, and given a `qcBlockReason` recording WHY and
 * WHEN — on the row itself, so the record survives any scratchpad, any machine
 * and any session. Flipping one back is a visibility change and a re-sync.
 *
 *   cd apps/web && pnpm exec tsx scripts/xs-cull.ts <cull.json> [--apply]
 *
 * Input JSON: an array of { slug, reason }. Without --apply it is a dry run and
 * reports exactly what it would change.
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })

import { readFileSync } from 'node:fs'
import { prisma, Visibility } from '@homemade/db'

interface CullRec {
  slug: string
  reason: string
}

async function main(): Promise<void> {
  const file = process.argv[2]
  const apply = process.argv.includes('--apply')
  if (!file) throw new Error('usage: xs-cull.ts <cull.json> [--apply]')

  const recs: CullRec[] = JSON.parse(readFileSync(file, 'utf8'))
  if (!Array.isArray(recs) || recs.some((r) => !r?.slug || !r?.reason)) {
    throw new Error('cull.json must be an array of { slug, reason }')
  }
  const { removePatternFromSearch } = await import('@homemade/search')

  let flipped = 0
  let alreadyPrivate = 0
  let notFound = 0
  let searchAttempted = 0
  const checkedAt = new Date().toISOString()

  for (const r of recs) {
    const p = await prisma.pattern.findUnique({ where: { slug: r.slug }, select: { id: true, visibility: true } })
    if (!p) {
      notFound++
      continue
    }
    if (p.visibility === Visibility.PRIVATE) {
      alreadyPrivate++
      continue
    }
    if (apply) {
      await prisma.pattern.update({
        where: { id: p.id },
        // `select` keeps the RETURNING clause to one column — the row is large,
        // and asking for every column ties the script to the deployed schema.
        select: { id: true },
        data: {
          visibility: Visibility.PRIVATE,
          // The durable record of the cull — mirrors the QC pass's shape, so the
          // admin block-reason surfaces read it without a special case.
          qcBlockReason: { blocked: true, reasons: [r.reason], source: 'xs-cull', checkedAt },
        },
      })
      // NON-FATAL. The DB flip is the cull; the search index is a derived copy.
      // From a cloud sandbox the Typesense SDK cannot tunnel HTTPS through the
      // egress proxy, so this throws there — log it, keep going, and rebuild the
      // index afterwards with the server-side `tutorials/reindex.requested` job,
      // which drops and rebuilds the collections from the DB so PRIVATE rows
      // fall out anyway.
      searchAttempted++
      try {
        await removePatternFromSearch(p.id)
      } catch (err) {
        console.warn(`  search removal threw for ${r.slug}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    flipped++
  }

  const publicCount = await prisma.pattern.count({
    where: { type: 'CROSS_STITCH', ownerUserId: null, visibility: Visibility.PUBLIC },
  })

  console.log(
    `${apply ? 'APPLIED' : 'DRY RUN'} · input ${recs.length} · ${apply ? 'flipped' : 'would-flip'} ${flipped} · already-private ${alreadyPrivate} · not-found ${notFound}${apply ? ` · search removals attempted ${searchAttempted}` : ''}`,
  )
  if (searchAttempted > 0) {
    console.log(
      'Search removal is best-effort — @homemade/search logs its own failures rather than throwing, and the Typesense SDK cannot reach Typesense from a cloud sandbox. Run the server-side reindex (Inngest `tutorials/reindex.requested`) to be certain the index matches the database.',
    )
  }
  console.log(`PUBLIC house cross-stitch patterns now: ${publicCount}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e))
  process.exit(1)
})
