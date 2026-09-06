import 'server-only'
import { anthropicConfigured, anthropicJson, PLANNER_MODEL } from '@/lib/anthropic'
import {
  BUILD_ORDER,
  LOOKS,
  PALETTES,
  territoriesFor,
  type CreativeBrief,
} from '@homemade/db/design-direction'
import { CROCHET_STARTER_BRIEFS } from '@homemade/db/crochet-starter-briefs'
import { CROCHET_SHELF_BY_SLUG, type ShelfTarget } from '../categories'
import { shelfDeficits, allocateShelves, capShelfBriefs, shelfSlots } from './shelf-plan'
import { subjectKey as normaliseSubject, findSubjectKeyMatch } from './subject-key'
import {
  CROCHET_BUILDABLE_SHELF_SLUGS,
  envelopesForShelf,
  treatmentsForShelf,
  type CrochetTreatment,
} from './crochet-forms'
import { PLANNER_MODE, type PlannerMode } from './planner'

/**
 * THE CROCHET BATCH PLANNER.
 *
 * One cheap call per batch composes the briefs; the expensive judgement is the
 * per-candidate vision gate later. It is built on the cross-stitch planner's
 * hard-won lessons rather than from scratch:
 *
 *   · the avoid list is the WHOLE catalogue as normalised subject keys, not the
 *     last forty names, because anything older than a couple of batches was
 *     otherwise invisible and got re-commissioned;
 *   · shelves are drawn in proportion to how far each is from its target, so
 *     the catalogue fills evenly instead of piling into one shelf;
 *   · the system prompt is SHORT. The cross-stitch planner's first version ran
 *     to several hundred words of encouragement, the calls timed out, and every
 *     batch silently fell through to the sampler. The bar survives; the pep
 *     talk does not;
 *   · CONSTRAINED mode is the default. The model chooses and dresses from the
 *     crochet starter briefs and the shared design-direction axes rather than
 *     inventing from nothing, because on the cross-stitch side dressed pool
 *     subjects out-yielded free inventions better than two to one.
 *
 * The crochet-specific part is the FORM. A brief here is not free to be any
 * object: it names a shelf, and a treatment the loom can actually build for
 * that shelf (`crochet-forms.ts`). A brief for a form the engine cannot build
 * is never emitted, because a pattern that cannot render can never carry a
 * truthful hero.
 */

export interface CrochetBrief {
  slug: string
  /** The pattern's display name. */
  name: string
  /** The concept phrase — what the thing is, in one line. */
  subject: string
  /** The normalised subject key, carried so the publish guard never re-derives it. */
  subjectKey: string
  shelf: string
  shelfName: string
  /** The engine form this brief will be built in. */
  treatment: CrochetTreatment
  /** The shared design-direction brief behind it. */
  brief: CreativeBrief
  /** Who wrote it: the planner model, or the pool sampler fallback. */
  source: 'model' | 'sampler'
  /** Which planner wrote it. */
  plannerMode: PlannerMode
  /** Did the model actually re-dress its pool subject, or copy it out? */
  dressed: boolean
}

export interface CrochetPlanContext {
  /** Every subject key in the public catalogue. */
  avoidSubjectKeys?: string[]
  /** One shelf slug per brief this batch owes. */
  shelfSlots?: string[]
  /** The shelf quota, for the log line. */
  shelfQuota?: { slug: string; name: string; briefs: number; deficit: number }[]
}

/** The buildable shelves, with their targets — the only lanes crochet plans into. */
export const CROCHET_LANE_SHELVES: ShelfTarget[] = CROCHET_BUILDABLE_SHELF_SLUGS.map(
  (slug) => CROCHET_SHELF_BY_SLUG[slug],
).filter((s): s is ShelfTarget => Boolean(s))

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 44)
}

function uniqueSuffix(): string {
  return Math.floor(Math.random() * 1e6).toString(36).padStart(4, '0').slice(-4)
}

/**
 * How many existing subjects the model is SHOWN. The whole avoid list is
 * enforced mechanically afterwards; the model only needs enough of it to steer
 * away from the obvious repeats, and rendering hundreds into the prompt is what
 * made the cross-stitch call slow enough for the gateway to kill it.
 */
const PROMPT_AVOID_LIMIT = 80

/** Reject rather than hang, so the caller can fall back to the sampler. */
const PLANNER_TIMEOUT_MS = Number(process.env.BULK_CROCHET_PLANNER_TIMEOUT_MS) || 75_000

function withTimeout<T>(work: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    work.then(
      (v) => {
        clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        clearTimeout(timer)
        reject(e instanceof Error ? e : new Error(String(e)))
      },
    )
  })
}

const SYSTEM = `You are the creative director for Homemade's crochet catalogue. A shared design system already exists; your job is to CHOOSE from it and DRESS what you choose, not to invent from nothing.

THE BAR: one specific delightful idea per brief, a considered palette from the library, and real character or stitch texture. Never "a granny square" or "a plain coaster" — say what makes THIS one worth making.

HARD RULES
- Serve the SHELF QUOTA exactly. Use only the shelves and the treatments listed for each.
- Never repeat a subject the catalogue already has, or a re-wording of one.
- Span the range across the batch: at least one beginner piece, at least one advanced or showpiece, and a spread of sizes. Never a batch of one difficulty.
- UK crochet terms. British spelling. No long dashes anywhere. No word "honest". No "perfect for" or "ideal for".
- Names are short and plain: what the thing is, with its hook. "Sage leaf-stitch cloth", not "The Perfect Sage Cloth".
- Original designs only. Never a named character, brand, celebrity or a specific shop's design.
- Reply with JSON only.`

interface RawBrief {
  shelf?: string
  treatment?: string
  name?: string
  concept?: string
  look?: string
  territory?: string
  palette?: string
  size?: string
  difficulty?: string
}

function promptText(count: number, ctx: CrochetPlanContext): string {
  const slots = ctx.shelfSlots ?? []
  const quota = ctx.shelfQuota ?? []
  const shelves = (quota.length ? quota.map((q) => q.slug) : CROCHET_BUILDABLE_SHELF_SLUGS)
    .map((slug) => {
      const shelf = CROCHET_SHELF_BY_SLUG[slug]
      const envelopes = envelopesForShelf(slug)
      const lines = envelopes.map((e) => `    · ${e.treatment}: ${e.note}`).join('\n')
      return `- ${slug} (${shelf?.name ?? slug})\n${lines}`
    })
    .join('\n')

  const quotaLine = quota.length
    ? quota.map((q) => `${q.slug} x${q.briefs}`).join(', ')
    : `any of the shelves above, ${count} briefs`

  const looks = LOOKS.map((l) => `${l.slug} (${l.vibe.split('.')[0]})`).join('; ')
  const territories = territoriesFor('crochet', 'core').map((t) => t.slug).join(', ')
  const palettes = PALETTES.map((p) => `${p.slug} [${p.hexes.slice(0, 4).join(' ')}]`).join('; ')

  const examples = CROCHET_STARTER_BRIEFS.filter((b) =>
    CROCHET_BUILDABLE_SHELF_SLUGS.includes(b.itemType),
  )
    .slice(0, 10)
    .map((b) => `- ${b.itemType}: ${b.concept}`)
    .join('\n')

  const avoid = (ctx.avoidSubjectKeys ?? []).slice(0, PROMPT_AVOID_LIMIT)

  return `Compose ${count} crochet briefs as a JSON array. Each brief:
{"shelf","treatment","name","concept","look","territory","palette","size","difficulty"}

SHELF QUOTA (serve exactly): ${quotaLine}
${slots.length ? `Slots in order: ${slots.join(', ')}` : ''}

SHELVES AND WHAT THE LOOM CAN BUILD FOR THEM:
${shelves}

LOOKS: ${looks}
TERRITORIES (use the evergreen core): ${territories}
PALETTES: ${palettes}
size: small | medium | large | showpiece
difficulty: beginner | intermediate | advanced | showpiece

EXISTING BRIEFS to dress from and vary (do not copy word for word):
${examples}

${avoid.length ? `ALREADY IN THE CATALOGUE, do not repeat or re-word:\n${avoid.join('; ')}\n` : ''}
${BUILD_ORDER}

- name: the pattern's title, four words or fewer where you can.
- concept: one sentence saying what the finished thing is and what makes it worth making, including its colours.
Return ONLY the JSON array of ${count} briefs.`
}

function coerce(
  raw: RawBrief,
  shelfSlot: string | undefined,
  taken: (key: string) => boolean,
  seenSlugs: Set<string>,
): CrochetBrief | null {
  const shelfSlug = typeof raw.shelf === 'string' && CROCHET_SHELF_BY_SLUG[raw.shelf] ? raw.shelf : shelfSlot
  if (!shelfSlug) return null
  const shelf = CROCHET_SHELF_BY_SLUG[shelfSlug]
  const allowed = treatmentsForShelf(shelfSlug)
  if (!shelf || allowed.length === 0) return null
  const treatment = (allowed as string[]).includes(raw.treatment ?? '')
    ? (raw.treatment as CrochetTreatment)
    : pick(allowed)

  const concept = typeof raw.concept === 'string' ? raw.concept.trim() : ''
  if (concept.length < 12) return null
  const key = normaliseSubject(concept)
  if (taken(key)) return null

  const name = typeof raw.name === 'string' && raw.name.trim().length >= 3 ? raw.name.trim() : titleFrom(concept)
  const look = LOOKS.some((l) => l.slug === raw.look) ? raw.look! : pick(LOOKS).slug
  const coreTerritories = territoriesFor('crochet', 'core')
  const territory = coreTerritories.some((t) => t.slug === raw.territory)
    ? raw.territory!
    : pick(coreTerritories).slug
  const palette = PALETTES.some((p) => p.slug === raw.palette) ? raw.palette! : pick(PALETTES).slug
  const size = (['small', 'medium', 'large', 'showpiece'] as const).includes(raw.size as never)
    ? (raw.size as CreativeBrief['size'])
    : 'medium'
  const difficulty = (['beginner', 'intermediate', 'advanced', 'showpiece'] as const).includes(
    raw.difficulty as never,
  )
    ? (raw.difficulty as CreativeBrief['difficulty'])
    : 'intermediate'

  let slug = `crochet-${slugify(name)}-${uniqueSuffix()}`
  while (seenSlugs.has(slug)) slug = `crochet-${slugify(name)}-${uniqueSuffix()}`
  seenSlugs.add(slug)

  return {
    slug,
    name,
    subject: concept,
    subjectKey: key,
    shelf: shelf.slug,
    shelfName: shelf.name,
    treatment,
    brief: {
      craft: 'crochet',
      territory,
      look,
      itemType: shelf.slug,
      palette,
      size,
      difficulty,
      concept,
    },
    source: 'model',
    plannerMode: PLANNER_MODE,
    dressed: true,
  }
}

function titleFrom(concept: string): string {
  const first = concept.split(/[.,;]/)[0]!.replace(/^an?\s+/i, '').trim()
  const words = first.split(/\s+/).slice(0, 5).join(' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * The fallback sampler. It never copies a starter brief out: it takes one whose
 * item type the loom can build, and re-dresses it with a different look and
 * palette, so a sampled brief is a variation rather than the same pattern again.
 */
function sampleBrief(
  shelfSlug: string,
  taken: (key: string) => boolean,
  seenSlugs: Set<string>,
): CrochetBrief | null {
  const shelf = CROCHET_SHELF_BY_SLUG[shelfSlug]
  const allowed = treatmentsForShelf(shelfSlug)
  if (!shelf || allowed.length === 0) return null
  const pool = CROCHET_STARTER_BRIEFS.filter((b) => b.itemType === shelfSlug)
  const seed = pool.length ? pick(pool) : pick(CROCHET_STARTER_BRIEFS)
  const look = pick(LOOKS.filter((l) => l.slug !== seed.look).length ? LOOKS.filter((l) => l.slug !== seed.look) : LOOKS)
  const palette = pick(PALETTES.filter((p) => p.suitsLooks.includes(look.slug)).length
    ? PALETTES.filter((p) => p.suitsLooks.includes(look.slug))
    : PALETTES)
  const treatment = pick(allowed)
  const concept = `${seed.concept.replace(/\.$/, '')}, worked in the ${palette.name.toLowerCase()} palette with a ${look.name.toLowerCase()} feel.`
  const key = normaliseSubject(concept)
  if (taken(key)) return null
  const name = titleFrom(seed.concept)
  let slug = `crochet-${slugify(name)}-${uniqueSuffix()}`
  while (seenSlugs.has(slug)) slug = `crochet-${slugify(name)}-${uniqueSuffix()}`
  seenSlugs.add(slug)
  return {
    slug,
    name,
    subject: concept,
    subjectKey: key,
    shelf: shelf.slug,
    shelfName: shelf.name,
    treatment,
    brief: {
      craft: 'crochet',
      territory: seed.territory,
      look: look.slug,
      itemType: shelf.slug,
      palette: palette.slug,
      size: seed.size,
      difficulty: seed.difficulty,
      concept,
    },
    source: 'sampler',
    plannerMode: PLANNER_MODE,
    dressed: true,
  }
}

/**
 * The shelf quota for one batch: every buildable shelf weighted by its gap to
 * target, then capped so one shelf cannot take the whole batch.
 */
export function crochetShelfPlan(
  counts: Record<string, number>,
  count: number,
): { slots: string[]; quota: { slug: string; name: string; briefs: number; deficit: number }[] } {
  const deficits = shelfDeficits(CROCHET_LANE_SHELVES, counts)
  const alloc = capShelfBriefs(allocateShelves(deficits, count), count)
  return {
    slots: shelfSlots(alloc),
    quota: alloc.map((a) => ({ slug: a.slug, name: a.name, briefs: a.briefs, deficit: a.deficit })),
  }
}

/** Plan `count` briefs. Always returns a full batch: the sampler tops up. */
export async function planCrochetBriefs(count: number, ctx: CrochetPlanContext = {}): Promise<CrochetBrief[]> {
  const avoid = new Set(ctx.avoidSubjectKeys ?? [])
  const batch = new Set<string>()
  const seenSlugs = new Set<string>()
  const taken = (key: string): boolean => {
    if (!key) return true
    if (avoid.has(key) || batch.has(key)) return true
    return findSubjectKeyMatch(key, avoid) !== null || findSubjectKeyMatch(key, batch) !== null
  }

  const slots = ctx.shelfSlots?.length ? [...ctx.shelfSlots] : []
  const out: CrochetBrief[] = []

  if (anthropicConfigured()) {
    try {
      const raw = await withTimeout(
        anthropicJson<RawBrief[]>({
          model: PLANNER_MODEL,
          system: SYSTEM,
          prompt: promptText(count, ctx),
          maxTokens: 2400,
          retries: 1,
        }),
        PLANNER_TIMEOUT_MS,
        'crochet planner',
      )
      for (const r of Array.isArray(raw) ? raw : []) {
        if (out.length >= count) break
        const slot = slots[out.length]
        const brief = coerce(r, slot, taken, seenSlugs)
        if (!brief) continue
        batch.add(brief.subjectKey)
        out.push(brief)
      }
    } catch (err) {
      console.warn('[bulk crochet] planner call failed, falling back to the sampler', err)
    }
  }

  // Top up from the pool, on the shelves the batch still owes.
  let guard = 0
  while (out.length < count && guard++ < count * 8) {
    const remaining = [...slots]
    for (const b of out) {
      const i = remaining.indexOf(b.shelf)
      if (i >= 0) remaining.splice(i, 1)
    }
    const shelfSlug = remaining[0] ?? pick(CROCHET_BUILDABLE_SHELF_SLUGS)
    const brief = sampleBrief(shelfSlug, taken, seenSlugs)
    if (!brief) continue
    batch.add(brief.subjectKey)
    out.push(brief)
  }

  return out.slice(0, count)
}

/** How many briefs the model wrote (the rest came from the pool sampler). */
export function modelAuthoredCount(briefs: CrochetBrief[]): number {
  return briefs.filter((b) => b.source === 'model').length
}
