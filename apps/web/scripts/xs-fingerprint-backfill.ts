/**
 * xs-fingerprint-backfill — give every existing cross-stitch pattern the
 * duplicate-guard fingerprints the publish path now writes for new ones.
 *
 * The guard in `src/lib/studio/generation/bulk/dedupe-guard.ts` compares a
 * candidate against the STORED fingerprints of the live catalogue. Rows made
 * before that existed have none, so without this backfill the guard would start
 * life comparing each new gem against an empty catalogue and the 1,153 patterns
 * already published would be invisible to it.
 *
 * For each CROSS_STITCH Pattern (PUBLIC and private, house and user-owned) it
 * computes and stores:
 *   imageHash64 / imageHash256  dHash of the beauty thumbnail
 *   thumbnailSha256             exact bytes of that thumbnail
 *   chartFingerprint            { grid, palette } from similarity.ts
 *   subjectKey                  the normalised subject, derived from the name
 *
 * The September 2026 dedupe scan already downloaded and hashed every public
 * thumbnail, so this reuses that cache (`--cache <dir>`: fingerprints.json for
 * the hashes + chart fingerprints, thumbs/<id>.png for anything missing) and
 * only touches R2 for rows the cache never saw. `sourceImageSha256` is NOT
 * backfilled — the Flux source images were never kept, and inventing one would
 * be worse than a null.
 *
 *   cd apps/web && pnpm exec tsx scripts/xs-fingerprint-backfill.ts \
 *     [--cache <dir>] [--limit N] [--dry-run]
 */

import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Prisma, prisma, type PatternData } from '@homemade/db'
import { chartFingerprint, imageHash, sha256Hex, type ChartFingerprint } from '@/lib/studio/generation/bulk/similarity'
import { subjectKey } from '@/lib/studio/generation/bulk/subject-key'

interface CachedFingerprint {
  id: string
  sha256?: string
  dhash64?: string
  dhash256?: string
  chart?: ChartFingerprint
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const CACHE_DIR = arg('cache')
const LIMIT = Number(arg('limit')) || 0
const DRY = process.argv.includes('--dry-run')

/** The scan's cached fingerprints, keyed by pattern id. */
function loadCache(): Map<string, CachedFingerprint> {
  const out = new Map<string, CachedFingerprint>()
  if (!CACHE_DIR) return out
  const file = resolve(CACHE_DIR, 'fingerprints.json')
  if (!existsSync(file)) {
    console.warn(`cache: no fingerprints.json at ${file} — every row will be recomputed`)
    return out
  }
  const rows = JSON.parse(readFileSync(file, 'utf8')) as CachedFingerprint[]
  for (const r of rows) if (r?.id) out.set(r.id, r)
  console.log(`cache: ${out.size} fingerprints from ${file}`)
  return out
}

/** A cached thumbnail PNG for a pattern, if the scan downloaded one. */
function cachedThumb(id: string): Buffer | null {
  if (!CACHE_DIR) return null
  const file = resolve(CACHE_DIR, 'thumbs', `${id}.png`)
  return existsSync(file) ? readFileSync(file) : null
}

/** Download a published thumbnail from R2 (the public base + the media key). */
async function fetchThumb(r2Key: string): Promise<Buffer | null> {
  const base = process.env.R2_PUBLIC_BASE_URL
  if (!base) return null
  const res = await fetch(`${base.replace(/\/$/, '')}/${r2Key}`)
  if (!res.ok) return null
  return Buffer.from(await res.arrayBuffer())
}

async function main(): Promise<void> {
  const cache = loadCache()

  const rows = await prisma.pattern.findMany({
    where: { type: 'CROSS_STITCH' },
    orderBy: { createdAt: 'asc' },
    ...(LIMIT ? { take: LIMIT } : {}),
    select: { id: true, slug: true, name: true, data: true, thumbnail: { select: { r2Key: true } } },
  })
  console.log(`${rows.length} CROSS_STITCH patterns to backfill${DRY ? ' (dry run)' : ''}`)

  let written = 0
  let fromCache = 0
  let downloaded = 0
  let noThumb = 0
  let failed = 0

  for (const row of rows) {
    try {
      const hit = cache.get(row.id)
      let sha = hit?.sha256
      let d64 = hit?.dhash64
      let d256 = hit?.dhash256

      if (!sha || !d64 || !d256) {
        const png = cachedThumb(row.id) ?? (row.thumbnail?.r2Key ? await fetchThumb(row.thumbnail.r2Key) : null)
        if (png) {
          const hashes = await imageHash(png)
          sha = sha256Hex(png)
          d64 = hashes.dhash64
          d256 = hashes.dhash256
          downloaded++
        } else {
          noThumb++
        }
      } else {
        fromCache++
      }

      // The chart fingerprint always comes from the stored PatternData — it is
      // the artwork itself, and re-deriving it is cheap and exact.
      let chart: ChartFingerprint | null = hit?.chart ?? null
      if (!chart) {
        try {
          chart = chartFingerprint(row.data as unknown as PatternData)
        } catch {
          chart = null
        }
      }

      const key = subjectKey(row.name)
      if (DRY) {
        written++
        continue
      }
      await prisma.pattern.update({
        where: { id: row.id },
        data: {
          ...(sha ? { thumbnailSha256: sha } : {}),
          ...(d64 ? { imageHash64: d64 } : {}),
          ...(d256 ? { imageHash256: d256 } : {}),
          ...(chart ? { chartFingerprint: chart as unknown as object } : {}),
          ...(key ? { subjectKey: key } : {}),
        },
      })
      written++
      if (written % 100 === 0) console.log(`  … ${written}/${rows.length}`)
    } catch (err) {
      failed++
      console.error(`  FAILED ${row.slug ?? row.id}:`, err instanceof Error ? err.message : String(err))
    }
  }

  const complete = await prisma.pattern.count({
    where: {
      type: 'CROSS_STITCH',
      imageHash64: { not: null },
      imageHash256: { not: null },
      thumbnailSha256: { not: null },
      subjectKey: { not: null },
      chartFingerprint: { not: Prisma.JsonNull },
    },
  })
  const withKey = await prisma.pattern.count({ where: { type: 'CROSS_STITCH', subjectKey: { not: null } } })

  console.log(
    `${DRY ? 'DRY RUN' : 'BACKFILL'} · rows ${rows.length} · updated ${written} · hashes from cache ${fromCache} · hashed here ${downloaded} · no thumbnail ${noThumb} · failed ${failed}`,
  )
  console.log(`cross-stitch rows now carrying a full fingerprint set: ${complete} · carrying a subject key: ${withKey}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e))
  process.exit(1)
})
