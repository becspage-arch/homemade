import 'server-only'
// The comparison itself is pure and lives in `duplicate-match`; re-exported here
// so callers keep importing one module.
import { Prisma, prisma, Visibility, type PatternData } from '@homemade/db'
import { imageHash, sha256Hex, chartFingerprint, type ChartFingerprint } from './similarity'
import { subjectKey } from './subject-key'
import { withoutSlugs } from './duplicate-match'
import type { CandidateFingerprints, CatalogueEntry } from './duplicate-match'
import { CROSS_STITCH_SHELVES } from '../categories'

/**
 * THE PUBLISH-PATH DUPLICATE GUARD.
 *
 * The gate in `vision-gate.ts` judges quality and is shown only the subjects kept
 * in the SAME batch, so it has never been able to see that a candidate repeats
 * something published three months ago. That blind spot is what put 85 duplicate
 * clusters (192 of 1,153 patterns) into the catalogue. This module closes it:
 * after the gate says keep and BEFORE anything is written, the candidate is
 * fingerprinted and compared against every PUBLIC cross-stitch pattern.
 *
 * BINARY, like every other automated check here: a hit is a terminal `duplicate`
 * outcome. Nothing is written, and the idea is NOT re-rolled — a duplicate means
 * the IDEA was already made, and a fresh roll of the same idea is another one.
 *
 * Two independent signals:
 *   · the image/chart fingerprints (`similarity.ts`) — the same PICTURE;
 *   · the subject key (`subject-key.ts`)             — the same IDEA, redrawn.
 * Either one fires. The second is the one that matters most for the autopilot:
 * five "big japanese garden" charts look different enough to pass every image
 * threshold, and are still five of the same thing.
 */

/** Fingerprint a candidate: thumbnail bytes, both dHashes, chart, subject. */
export async function fingerprintCandidate(
  renderPng: Buffer,
  data: PatternData,
  subject: string,
  sourcePng?: Buffer,
): Promise<CandidateFingerprints> {
  const [hashes] = await Promise.all([imageHash(renderPng)])
  return {
    sha256: sha256Hex(renderPng),
    dhash64: hashes.dhash64,
    dhash256: hashes.dhash256,
    chart: chartFingerprint(data),
    subjectKey: subjectKey(subject),
    ...(sourcePng ? { sourceSha256: sha256Hex(sourcePng) } : {}),
  }
}

/**
 * The rows a CULLED pattern is matched against by subject. A cull sets the row
 * PRIVATE and records why in `qcBlockReason`; this is how those are found again.
 */
export const CULLED_WHERE = {
  type: 'CROSS_STITCH',
  ownerUserId: null,
  visibility: Visibility.PRIVATE,
  NOT: { qcBlockReason: { equals: Prisma.DbNull } },
} as const

/**
 * The PARKING BAY: candidates generated in the 'candidates' gate mode that no
 * session has judged yet. UNLISTED, never published, invisible everywhere
 * public — but every bit as spent, as far as the next batch is concerned. A
 * candidate waiting three days for a session must not be generated a second
 * time, so it joins both populations the guard and the planner read.
 */
export const PENDING_CANDIDATE_WHERE = {
  type: 'CROSS_STITCH',
  ownerUserId: null,
  visibility: Visibility.UNLISTED,
  candidateStatus: 'PENDING',
} as const

/**
 * The catalogue a candidate is compared against.
 *
 * Two populations, deliberately different:
 *
 *  · PUBLIC rows contribute BOTH their subject key and their image/chart
 *    fingerprints. They are the live catalogue — a candidate must not repeat
 *    them by idea or by picture.
 *  · CULLED rows (PRIVATE with a `qcBlockReason`) contribute their SUBJECT KEY
 *    ONLY. A cull means the idea is spent, not that the shelf is short of it:
 *    without this, culling a weak render quietly released its subject back into
 *    the pool and the very next batch commissioned it again — which is exactly
 *    what happened to the cupcake. Their images are deliberately NOT compared,
 *    because the whole point of a cull is that that particular render was bad;
 *    matching pictures against known-bad output would tell us nothing useful.
 *
 * ~1,200 rows of a few KB — loaded once per attempt, cheap next to the Flux
 * generation and the gate call before it. Deliberately NOT cached across
 * invocations: each idea is its own short Inngest request, and a stale cache is
 * exactly how a duplicate slips through.
 */
export async function loadPublicCrossStitchFingerprints(
  opts: { includePending?: boolean; excludeSlugs?: readonly string[] } = {},
): Promise<CatalogueEntry[]> {
  const IMAGE_SELECT = {
    id: true,
    slug: true,
    name: true,
    subjectKey: true,
    thumbnailSha256: true,
    imageHash64: true,
    imageHash256: true,
    chartFingerprint: true,
  } as const
  const [live, culled, pending] = await Promise.all([
    prisma.pattern.findMany({
      where: { type: 'CROSS_STITCH', ownerUserId: null, visibility: Visibility.PUBLIC },
      select: IMAGE_SELECT,
    }),
    prisma.pattern.findMany({
      where: CULLED_WHERE,
      select: { id: true, slug: true, name: true, subjectKey: true },
    }),
    // Pending candidates contribute BOTH signals: an un-judged candidate is a
    // picture that already exists and an idea already spent, so a second one is
    // a duplicate whichever way you look at it.
    opts.includePending
      ? prisma.pattern.findMany({ where: PENDING_CANDIDATE_WHERE, select: IMAGE_SELECT })
      : Promise.resolve([] as Array<Record<string, never>> as never[]),
  ])

  const entries: CatalogueEntry[] = [...live, ...pending].map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    subjectKey: r.subjectKey,
    image:
      r.thumbnailSha256 && r.imageHash64 && r.imageHash256 && r.chartFingerprint
        ? {
            sha256: r.thumbnailSha256,
            dhash64: r.imageHash64,
            dhash256: r.imageHash256,
            chart: r.chartFingerprint as unknown as ChartFingerprint,
          }
        : null,
  }))
  // Subject only — `image: null` keeps these out of the picture comparison.
  for (const r of culled) {
    entries.push({ id: r.id, slug: r.slug, name: r.name, subjectKey: r.subjectKey, image: null })
  }
  return opts.excludeSlugs?.length ? withoutSlugs(entries, opts.excludeSlugs) : entries
}

// ─────────────────────────── catalogue readers ───────────────────────────

/** Live PUBLIC house pattern count per cross-stitch shelf slug. */
export async function liveShelfCounts(): Promise<Record<string, number>> {
  const cat = await prisma.category.findUnique({ where: { slug: 'cross-stitch' }, select: { id: true } })
  if (!cat) return {}
  const [subs, counts] = await Promise.all([
    prisma.subCategory.findMany({ where: { categoryId: cat.id }, select: { id: true, slug: true } }),
    prisma.pattern.groupBy({
      by: ['subCategoryId'],
      where: { type: 'CROSS_STITCH', ownerUserId: null, visibility: Visibility.PUBLIC },
      _count: { _all: true },
    }),
  ])
  const bySubId = new Map(counts.map((c) => [c.subCategoryId, c._count._all]))
  const out: Record<string, number> = {}
  for (const s of subs) out[s.slug] = bySubId.get(s.id) ?? 0
  for (const s of CROSS_STITCH_SHELVES) out[s.slug] ??= 0
  return out
}

/**
 * How many rows of each population the avoid list may hold.
 *
 * It was 800, and the catalogue passed 1,100 — so the OLDEST three hundred
 * published subjects fell off the planner's avoid list while the publish guard
 * went on comparing against all of them. The planner then re-commissioned them
 * and the guard killed each one as a duplicate, which is where "duplicate of
 * sun-and-moon" and "duplicate of cosy-reading-cat" came from, twice each,
 * across three firings of the September cron. The number now sits above the
 * catalogue's own target (1,784) with room to spare: a few thousand short
 * strings cost nothing next to one Flux generation wasted.
 */
export const PUBLIC_SUBJECT_KEY_LIMIT = 4000

/**
 * The subject keys of ideas recent runs killed as duplicates.
 *
 * The avoid list above is drawn from ROWS — what is published, culled or
 * parked. A duplicate kill leaves no row at all: the candidate is discarded
 * before it is written, so the only trace is a counter and a kill reason. That
 * means the planner could pick the same doomed subject on the next firing and
 * the one after, paying for a Flux generation each time to be told the same
 * thing. Each run therefore records the subject keys it killed, and the planner
 * reads the recent ones back.
 */
export async function recentDuplicateSubjectKeys(runs = DUPLICATE_KILL_RUNS): Promise<string[]> {
  const rows = await prisma.bulkRun.findMany({
    where: { craft: 'cross-stitch' },
    orderBy: { startedAt: 'desc' },
    take: runs,
    select: { duplicateSubjectKeys: true },
  })
  return [...new Set(rows.flatMap((r) => r.duplicateSubjectKeys).filter(Boolean))]
}

/** How many recent runs' duplicate kills the planner is shown. Twelve firings
 *  is a day of the two-hourly cron. */
export const DUPLICATE_KILL_RUNS = 12

/**
 * The avoid list the planner is given: the normalised subject key of every
 * PUBLIC cross-stitch pattern, most recent first, capped. Rows with no stored
 * key fall back to a key derived from the name, so the list is complete from the
 * first run even before the backfill has touched everything.
 */
export async function publicSubjectKeys(limit = PUBLIC_SUBJECT_KEY_LIMIT, shelfSlugs?: string[]): Promise<string[]> {
  // The same populations the publish guard compares against: what is live, what
  // has been culled, and — in the candidates gate mode — what is parked waiting
  // to be judged. A culled idea is spent and a parked one is taken; the planner
  // must not commission either again any more than the guard should let it
  // through. Parked rows are read unconditionally: they are simply absent in
  // 'api' mode, so there is no mode to thread through here.
  const [live, culled, pending] = await Promise.all([
    prisma.pattern.findMany({
      where: {
        type: 'CROSS_STITCH',
        ownerUserId: null,
        visibility: Visibility.PUBLIC,
        ...(shelfSlugs?.length ? { subCategory: { slug: { in: shelfSlugs } } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { subjectKey: true, name: true },
    }),
    prisma.pattern.findMany({
      where: CULLED_WHERE,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { subjectKey: true, name: true },
    }),
    prisma.pattern.findMany({
      where: PENDING_CANDIDATE_WHERE,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { subjectKey: true, name: true },
    }),
  ])
  const seen = new Set<string>()
  // Live first, so the prompt's most-recent slice is what is actually on sale.
  for (const r of [...live, ...culled, ...pending]) {
    const key = r.subjectKey || subjectKey(r.name)
    if (key) seen.add(key)
  }
  return [...seen]
}

export { findDuplicate, rerollAncestorSlugs, avoidListWithDuplicateKills } from './duplicate-match'
export type { CandidateFingerprints, CatalogueEntry, DuplicateHit } from './duplicate-match'
