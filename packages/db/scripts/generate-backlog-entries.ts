/**
 * One-off: turn the crochet-draft-triage keepers into literal Row / Theme
 * array entries ready to paste into crochet-idea-backlog.ts.
 *
 *   cd packages/db && pnpm exec tsx scripts/generate-backlog-entries.ts
 *
 * Reads the triage classification (re-derived here rather than from the
 * scratch JSON, so it is reproducible), pulls each keeper's real title /
 * excerpt / body / difficulty from the DB, and prints TWO blocks of TS
 * source: one Row[] literal per buildable shelf, one Theme[] literal per
 * theme shelf. Output only — never writes to crochet-idea-backlog.ts itself.
 */
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })

import { prisma } from '@homemade/db'
import { checkCompleteness } from './qc-completeness-rules/index.js'
import { bodyText } from './qc-completeness-rules/shared.js'

// ── re-run the triage classifier inline (kept identical in spirit to
//    crochet-draft-triage.ts; this script only needs shelf + verdict) ──────
import {
  findSubjectKeyMatch,
  subjectKey,
  SUBJECT_JACCARD_MATCH,
} from '../../../apps/web/src/lib/studio/generation/bulk/subject-key.js'
import { shelfIsBuildable } from '../../../apps/web/src/lib/studio/generation/bulk/crochet-forms.js'
import { CROCHET_IDEA_BACKLOG } from '../../../apps/web/src/lib/studio/generation/bulk/crochet-idea-backlog.js'

// (shelf mapping / generic-word logic copy-pasted from crochet-draft-triage.ts
// — kept in lock-step by hand since this is a one-shot generator, not a
// long-lived script.)
import {
  SHELF_RULES,
  GENERIC_WORDS,
  MANUAL_JUNK,
  IP_GUARDRAIL_RE,
} from './crochet-draft-triage-rules.js'

function mapShelf(title: string): string | null {
  for (const [shelf, re] of SHELF_RULES) {
    if (re.test(title)) return shelf === '__no_shelf__' ? null : shelf
  }
  return null
}
function bareTokens(title: string): string[] {
  return subjectKey(title)
    .split(' ')
    .filter((w) => w && !GENERIC_WORDS.has(w))
}
function bareKey(title: string): string {
  return bareTokens(title).join(' ')
}
function isGenericConstructionOnly(title: string, shelf: string): boolean {
  const shelfWords = new Set(shelf.split('-'))
  return bareTokens(title).filter((w) => !shelfWords.has(w)).length === 0
}

const VALID_SHELF_SET = new Set(
  ['amigurumi','animal-toy','doll','baby-toy-lovey','blanket','cushion','basket','ornament','wall-hanging','rug','plant-hanger','bunting','pet-bed','pouffe','hat','scarf','headband','cowl','shawl','beret','wrap','poncho','slippers','fingerless-mitts','socks','booties','mittens','gloves','legwarmers','bag','purse','hair-accessory','jewellery','backpack','belt','dishcloth','potholder','tea-cosy','towel','cardigan','jumper-pullover','tee-top','vest','dress','tunic','skirt','jacket-coat','trousers','shorts','jumpsuit-romper','motif-granny-square','coaster','doily','edging','applique-flower','bookmark','pincushion'],
)

interface Keeper {
  slug: string
  title: string
  excerpt: string | null
  body: unknown
  finishedSizeText: string | null
  difficulty: string
  shelf: string
  buildable: boolean
}

async function classify(): Promise<Keeper[]> {
  const category = await prisma.category.findFirst({ where: { slug: 'crochet' } })
  const rows = await prisma.tutorial.findMany({
    where: { categoryId: category!.id, type: 'PATTERN', status: 'DRAFT' },
    select: {
      id: true, slug: true, title: true, excerpt: true, body: true, chartDefinition: true,
      finishedSizeText: true, difficulty: true,
      subCategory: { select: { slug: true } },
    },
    orderBy: { slug: 'asc' },
  })

  const pubTutorials = await prisma.tutorial.findMany({
    where: { categoryId: category!.id, type: 'PATTERN', status: 'PUBLISHED' },
    select: { title: true },
  })
  const pubPatterns = await prisma.crochetPattern.findMany({ where: { visibility: 'PUBLIC' }, select: { name: true } })
  const publishedKeys = [
    ...pubTutorials.map((t) => bareKey(t.title)),
    ...pubPatterns.map((p) => bareKey(p.name)),
  ].filter(Boolean)

  const seenDraftKeys = new Map<string, string>()
  const keepers: Keeper[] = []

  for (const row of rows) {
    const completeness = checkCompleteness({
      slug: row.slug, categorySlug: 'crochet', subCategorySlug: row.subCategory?.slug ?? null,
      type: 'PATTERN', body: row.body, hasChart: !!row.chartDefinition,
    })
    if (!completeness.ok) continue
    if (IP_GUARDRAIL_RE.test(row.title)) continue
    const shelf = mapShelf(row.title)
    if (!shelf || !VALID_SHELF_SET.has(shelf)) continue
    const buildable = shelfIsBuildable(shelf)
    const key = bareKey(row.title)

    const pubMatch = findSubjectKeyMatch(key, publishedKeys, SUBJECT_JACCARD_MATCH)
    if (pubMatch) continue
    const backlogKeysForShelf = CROCHET_IDEA_BACKLOG.filter((i) => i.shelf === shelf).map((i) => bareKey(i.motif))
    if (findSubjectKeyMatch(key, backlogKeysForShelf, SUBJECT_JACCARD_MATCH)) continue

    const seenKey = `${shelf}|${key}`
    if (key && seenDraftKeys.has(seenKey)) continue
    let nearDup = false
    for (const [otherKey] of seenDraftKeys) {
      if (!otherKey.startsWith(`${shelf}|`)) continue
      const otherSubjectKey = otherKey.slice(shelf.length + 1)
      if (key && otherSubjectKey && findSubjectKeyMatch(key, [otherSubjectKey], SUBJECT_JACCARD_MATCH)) {
        nearDup = true
        break
      }
    }
    if (nearDup) continue
    if (isGenericConstructionOnly(row.title, shelf)) continue
    if (MANUAL_JUNK[row.slug]) continue

    seenDraftKeys.set(seenKey, row.slug)
    keepers.push({
      slug: row.slug, title: row.title, excerpt: row.excerpt, body: row.body,
      finishedSizeText: row.finishedSizeText, difficulty: row.difficulty,
      shelf, buildable,
    })
  }
  return keepers
}

// ── house-voice title / motif cleanup ──────────────────────────────────────

function cleanTitle(raw: string): string {
  let t = sanitizeHouseVoice(
    raw
      .replace(/\bamigurumi\b/gi, '')
      .replace(/\bcrochet\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim(),
  )
  if (!t) t = raw.trim()
  // sentence case: first letter up, rest as written (preserves proper nouns
  // like T-Rex, UFO already in the source titles)
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function toMotif(cleanedTitle: string): string {
  return cleanedTitle.toLowerCase()
}

const DIFF_LETTER: Record<string, string> = { BEGINNER: 'b', INTERMEDIATE: 'i', ADVANCED: 'a' }

function sizeLetter(title: string, finishedSizeText: string | null): string {
  const t = title.toLowerCase()
  if (/\bmini\b|\bkeychain\b|\bsmall\b/.test(t)) return 's'
  if (/\bgiant\b|\blarge\b|\bbig\b/.test(t)) return 'l'
  const mm = finishedSizeText?.match(/(\d+)\s*cm/i)
  if (mm) {
    const cm = Number(mm[1])
    if (cm <= 8) return 's'
    if (cm >= 25) return 'l'
  }
  return 'm'
}

/** A short, honest one-line hook pulled from the draft's own "About this
 *  pattern" intro sentence (never the full body — see BUILD_ORDER / the
 *  brief-not-prose rule). Falls back to the excerpt, then to the title. */
function deriveHook(title: string, excerpt: string | null, body: unknown): string {
  const text = bodyText(body)
  const aboutMatch = text.match(/About this pattern\s+(.+?[.!?])\s/)
  let sentence = aboutMatch?.[1] ?? text.match(/^(.+?[.!?])\s/)?.[1] ?? excerpt ?? ''
  sentence = sentence.trim()
  if (!sentence || sentence.length > 140) {
    sentence = excerpt?.trim() || `a ${title.toLowerCase()} in worsted weight`
  }
  // Strip a leading "A/An <size> <colour>" article repeat of the title noun
  // to keep it terse; not required for correctness, just tidier. Collapse
  // the double spaces the TipTap body leaves where an italic term
  // (stitch/technique names) was stripped out.
  return sanitizeHouseVoice(
    sentence
      .replace(/\.$/, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim(),
  )
}

/** The backlog test bans long dashes and a few phrases in title/motif/brief.
 *  Draft body prose sometimes has an em/en dash or "perfect for" — clean it
 *  rather than let a generated brief fail the house-voice test. */
function sanitizeHouseVoice(s: string): string {
  return s
    .replace(/[—–]/g, ',')
    .replace(/\bperfect for\b/gi, 'good for')
    .replace(/\bideal for\b/gi, 'good for')
    .replace(/\bhonest\b/gi, 'true')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/\s+/g, ' ')
    .trim()
}

const PALETTE_SLUGS = [
  'wildflower-meadow', 'foxglove-autumn', 'mushroom-woodland', 'nursery-pastel',
  'celestial-night', 'bright-pop', 'candy-kawaii', 'scandi-calm', 'elegant-mono',
  'boho-earth', 'vintage-tea', 'gothic-dusk', 'coastal-breeze', 'winter-frost',
]
function paletteFor(shelf: string, index: number): string {
  return PALETTE_SLUGS[(hashStr(shelf) + index) % PALETTE_SLUGS.length]!
}
function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Treatment choice for a buildable shelf with more than one envelope
 *  option — picked from title keywords, defaulting to the shelf's plainest
 *  option. amigurumi/ornament/pincushion/wall-hanging have exactly one
 *  treatment so this is moot for them. */
function treatmentFor(shelf: string, title: string): string {
  const t = title.toLowerCase()
  switch (shelf) {
    case 'amigurumi':
    case 'animal-toy':
    case 'doll':
      return 'amigurumi'
    case 'ornament':
    case 'pincushion':
      return 'sphere'
    case 'wall-hanging':
      return 'grid-tapestry'
    case 'motif-granny-square':
      return /round|circle|mandala|wheel/.test(t) ? 'disc' : 'grid-texture'
    case 'coaster':
    case 'bookmark':
      return /stripe|colour|two.tone/.test(t) ? 'grid-stripe' : 'grid-plain'
    case 'dishcloth':
    case 'potholder':
      return /stripe|colour|two.tone/.test(t) ? 'grid-stripe' : 'grid-texture'
    default:
      return 'grid-plain'
  }
}

function tsString(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

async function main(): Promise<void> {
  const keepers = await classify()
  console.log(`-- ${keepers.length} keepers (should be 388: 256 buildable + 132 theme) --`)

  const byShelfBuildable = new Map<string, Keeper[]>()
  const byShelfTheme = new Map<string, Keeper[]>()
  for (const k of keepers) {
    const map = k.buildable ? byShelfBuildable : byShelfTheme
    if (!map.has(k.shelf)) map.set(k.shelf, [])
    map.get(k.shelf)!.push(k)
  }

  console.log('\n// ============ BUILDABLE (Row[]) ============')
  for (const [shelf, list] of byShelfBuildable) {
    console.log(`\n// --- ${shelf} (${list.length}) ---`)
    list.forEach((k, i) => {
      const title = cleanTitle(k.title)
      const motif = toMotif(title)
      const hook = deriveHook(k.title, k.excerpt, k.body)
      const colourway = paletteFor(shelf, i)
      const treatment = treatmentFor(shelf, k.title)
      const code = `${sizeLetter(k.title, k.finishedSizeText)}${DIFF_LETTER[k.difficulty] ?? 'i'}`
      console.log(
        `  [${tsString(title)}, ${tsString(motif)}, ${tsString(hook)}, ${tsString(colourway)}, ${tsString(treatment)}, ${tsString(code)}, ${tsString(k.slug)}],`,
      )
    })
  }

  console.log('\n\n// ============ THEMES (Theme[]) ============')
  for (const [shelf, list] of byShelfTheme) {
    console.log(`\n// --- ${shelf} (${list.length}) ---`)
    list.forEach((k, i) => {
      const title = cleanTitle(k.title)
      const hook = deriveHook(k.title, k.excerpt, k.body)
      const colourway = paletteFor(shelf, i)
      console.log(`  [${tsString(title)}, ${tsString(hook)}, ${tsString(colourway)}, ${tsString(k.slug)}],`)
    })
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
