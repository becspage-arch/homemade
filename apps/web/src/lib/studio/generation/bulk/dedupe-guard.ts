import 'server-only'
import { prisma, Visibility, type PatternData } from '@homemade/db'
import {
  imageHash,
  sha256Hex,
  chartFingerprint,
  nearDuplicateVerdict,
  type ChartFingerprint,
  type PatternFingerprint,
} from './similarity'
import { subjectKey, findSubjectKeyMatch, SUBJECT_JACCARD_MATCH } from './subject-key'
import { CROSS_STITCH_SHELVES } from '../categories'
import type { ShelfTarget } from '../categories'

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

/** Everything the guard computes about a candidate before it publishes. */
export interface CandidateFingerprints extends PatternFingerprint {
  /** Normalised subject phrase — the text half of the check. */
  subjectKey: string
  /** sha256 of the Flux PNG the chart was converted from. */
  sourceSha256?: string
}

/** One stored PUBLIC pattern, in the shape the verdict needs. */
export interface CatalogueEntry {
  id: string
  slug: string | null
  name: string
  subjectKey: string | null
  /** Null when the row has not been backfilled — text still compares. */
  image: PatternFingerprint | null
}

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
 * Every PUBLIC house cross-stitch pattern's stored fingerprints. ~1,200 rows of
 * a few KB each — loaded once per attempt, which is cheap next to the Flux
 * generation and the vision-gate call that precede it. Deliberately NOT cached
 * across invocations: each idea runs as its own short Inngest request, and a
 * stale cache is exactly how a duplicate slips through.
 */
export async function loadPublicCrossStitchFingerprints(): Promise<CatalogueEntry[]> {
  const rows = await prisma.pattern.findMany({
    where: { type: 'CROSS_STITCH', ownerUserId: null, visibility: Visibility.PUBLIC },
    select: {
      id: true,
      slug: true,
      name: true,
      subjectKey: true,
      thumbnailSha256: true,
      imageHash64: true,
      imageHash256: true,
      chartFingerprint: true,
    },
  })
  return rows.map((r) => ({
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
}

export interface DuplicateHit {
  /** Slug (or id, for the rare slugless row) of what it duplicates. */
  slug: string
  name: string
  /** Which rule fired, with its measurement. */
  reason: string
}

/**
 * Compare one candidate against the loaded catalogue. Text first — it is free,
 * and it is the signal the old pipeline was missing — then the image + chart
 * fingerprints. First hit wins and names itself.
 */
export function findDuplicate(candidate: CandidateFingerprints, catalogue: CatalogueEntry[]): DuplicateHit | null {
  // ── text: the same idea, however it was drawn ──────────────────────────────
  if (candidate.subjectKey) {
    const byKey = new Map<string, CatalogueEntry>()
    for (const e of catalogue) if (e.subjectKey) byKey.set(e.subjectKey, e)
    const match = findSubjectKeyMatch(candidate.subjectKey, byKey.keys())
    if (match) {
      const e = byKey.get(match.key)!
      return {
        slug: e.slug ?? e.id,
        name: e.name,
        reason:
          match.overlap >= 1
            ? `same subject as “${e.name}” (subject key “${match.key}”)`
            : `same subject as “${e.name}” (subject overlap ${match.overlap.toFixed(2)} ≥ ${SUBJECT_JACCARD_MATCH})`,
      }
    }
  }

  // ── image + chart: the same picture ────────────────────────────────────────
  for (const e of catalogue) {
    if (!e.image) continue
    let verdict
    try {
      verdict = nearDuplicateVerdict(candidate, e.image)
    } catch {
      continue // a malformed stored fingerprint must never block a publish
    }
    if (verdict.duplicate) return { slug: e.slug ?? e.id, name: e.name, reason: `${verdict.reason} as “${e.name}”` }
  }
  return null
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
 * The avoid list the planner is given: the normalised subject key of every
 * PUBLIC cross-stitch pattern, most recent first, capped. Rows with no stored
 * key fall back to a key derived from the name, so the list is complete from the
 * first run even before the backfill has touched everything.
 */
export async function publicSubjectKeys(limit = 800, shelfSlugs?: string[]): Promise<string[]> {
  const rows = await prisma.pattern.findMany({
    where: {
      type: 'CROSS_STITCH',
      ownerUserId: null,
      visibility: Visibility.PUBLIC,
      ...(shelfSlugs?.length ? { subCategory: { slug: { in: shelfSlugs } } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { subjectKey: true, name: true },
  })
  const seen = new Set<string>()
  for (const r of rows) {
    const key = r.subjectKey || subjectKey(r.name)
    if (key) seen.add(key)
  }
  return [...seen]
}

/** The shelf config the planner + admin read (one place, one list). */
export function crossStitchShelves(): ShelfTarget[] {
  return CROSS_STITCH_SHELVES
}
