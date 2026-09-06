import 'server-only'
import { createHash } from 'node:crypto'
import { prisma, Visibility } from '@homemade/db'
import type { CrochetProgram } from '@/lib/loom/crochet/engine/program'
import type { CompositionProgram } from '@/lib/loom/crochet/engine/composition'
import { subjectKey, findSubjectKeyMatch } from './subject-key'

/**
 * THE CROCHET PUBLISH-PATH DUPLICATE GUARD.
 *
 * The vision gate judges one render against the subjects kept in the same
 * batch, so it cannot see that a candidate repeats something published in July.
 * The cross-stitch catalogue learned that the expensive way (85 duplicate
 * clusters), and crochet gets the same guard from the start, on the two signals
 * that suit a stitch program:
 *
 *   · the SUBJECT KEY — the same idea, redrawn. "A sage leaf-stitch cloth" and
 *     "a leaf-stitch cloth in sage" normalise to the same key.
 *   · the PROGRAM FINGERPRINT — the same construction in another colourway. A
 *     35 × 30 grid of the same stitch bands is the same dishcloth whether it is
 *     coral or teal, and a catalogue full of recoloured repeats is exactly what
 *     an unattended planner produces if nothing stops it.
 *
 * Either signal is terminal: nothing is written, and the idea is NOT re-rolled,
 * because a fresh roll of the same idea collides all over again.
 */

/** The keys stripped before a program is fingerprinted — everything that is
 *  colour and nothing that is construction. */
const COLOUR_KEYS = new Set([
  'colourHex',
  'palette',
  'rowColours',
  'colourKey',
  'cellColours',
  'mainHex',
  'contrastHex',
  'bgHex',
  'hex',
  'name',
  'notes',
  'gaugeText',
  'staging',
  'minFieldMm',
  'light',
  'exposure',
  'lightRig',
  'marginFactor',
  'groundScale',
  'distScale',
  'tiltDeg',
  'yawDeg',
  'aimHeightFrac',
])

/** Sort object keys so two programs that differ only in key order hash alike. */
function stripColour(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripColour)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      if (COLOUR_KEYS.has(key)) continue
      out[key] = stripColour((value as Record<string, unknown>)[key])
    }
    return out
  }
  return value
}

/**
 * A stable hash of the CONSTRUCTION of a program: the stitches, the counts, the
 * shaping, the placements — with every colour, name and staging knob removed.
 * Two patterns with the same fingerprint are the same object in different
 * yarn.
 */
export function programFingerprint(program: CrochetProgram | CompositionProgram): string {
  return createHash('sha256').update(JSON.stringify(stripColour(program))).digest('hex').slice(0, 32)
}

export interface CrochetCatalogueEntry {
  slug: string
  name: string
  subjectKey: string | null
  programFingerprint: string | null
}

/**
 * Every PUBLIC house crochet pattern, as the two signals. Small rows, loaded
 * once per attempt — deliberately NOT cached across invocations, because each
 * idea is its own short request and a stale cache is exactly how a duplicate
 * slips through.
 */
export async function loadCrochetCatalogue(): Promise<CrochetCatalogueEntry[]> {
  const rows = await prisma.crochetPattern.findMany({
    where: { ownerUserId: null, visibility: Visibility.PUBLIC },
    select: { slug: true, name: true, subjectKey: true, programFingerprint: true },
  })
  return rows.map((r) => ({
    slug: r.slug ?? r.name,
    name: r.name,
    // Rows published before the guard existed carry no key; derive one from the
    // name so the whole catalogue is still compared, not just the new part.
    subjectKey: r.subjectKey ?? subjectKey(r.name),
    programFingerprint: r.programFingerprint,
  }))
}

export interface CrochetDuplicateHit {
  slug: string
  reason: string
}

/** Is this candidate something the catalogue already has? */
export function findCrochetDuplicate(
  candidate: { subjectKey: string; programFingerprint: string },
  catalogue: CrochetCatalogueEntry[],
): CrochetDuplicateHit | null {
  for (const entry of catalogue) {
    if (entry.programFingerprint && entry.programFingerprint === candidate.programFingerprint) {
      return { slug: entry.slug, reason: 'the same stitch program in another colourway' }
    }
  }
  const keys = new Set(catalogue.map((e) => e.subjectKey).filter((k): k is string => Boolean(k)))
  const match = findSubjectKeyMatch(candidate.subjectKey, keys)
  if (match) {
    const hit = catalogue.find((e) => e.subjectKey === match.key)
    return { slug: hit?.slug ?? match.key, reason: `the same subject as ${hit?.name ?? match.key}` }
  }
  return null
}

/** Published house patterns per crochet shelf slug — the deficit weighting's input. */
export async function liveCrochetShelfCounts(): Promise<Record<string, number>> {
  const rows = await prisma.crochetPattern.groupBy({
    by: ['subCategoryId'],
    where: {
      ownerUserId: null,
      visibility: Visibility.PUBLIC,
      subCategory: { category: { slug: 'crochet' } },
    },
    _count: { _all: true },
  })
  const ids = rows.map((r) => r.subCategoryId).filter((id): id is string => Boolean(id))
  if (ids.length === 0) return {}
  const subs = await prisma.subCategory.findMany({ where: { id: { in: ids } }, select: { id: true, slug: true } })
  const slugById = new Map(subs.map((s) => [s.id, s.slug]))
  const out: Record<string, number> = {}
  for (const row of rows) {
    const slug = row.subCategoryId ? slugById.get(row.subCategoryId) : undefined
    if (slug) out[slug] = (out[slug] ?? 0) + row._count._all
  }
  return out
}

/** The whole public catalogue as subject keys — the planner's avoid list. */
export async function publicCrochetSubjectKeys(limit = 800): Promise<string[]> {
  const rows = await prisma.crochetPattern.findMany({
    where: { ownerUserId: null, visibility: Visibility.PUBLIC },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { name: true, subjectKey: true },
  })
  return rows.map((r) => r.subjectKey ?? subjectKey(r.name)).filter(Boolean)
}

/** Most-recent published crochet names — what the planner is shown verbatim. */
export async function recentCrochetNames(limit = 60): Promise<string[]> {
  const rows = await prisma.crochetPattern.findMany({
    where: { ownerUserId: null, visibility: Visibility.PUBLIC },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { name: true },
  })
  return rows.map((r) => r.name)
}

export { subjectKey }
