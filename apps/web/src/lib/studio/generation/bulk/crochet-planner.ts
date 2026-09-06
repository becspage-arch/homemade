import 'server-only'
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
import {
  CROCHET_BUILDABLE_SHELF_SLUGS,
  envelopesForShelf,
  treatmentsForShelf,
  BULK_CROCHET_MAX_CELLS,
  type CrochetTreatment,
} from './crochet-forms'
import { nextBuildableIdeas, ideasForShelf, type CrochetIdea } from './crochet-idea-backlog'
import { findSubjectKeyMatch, subjectKey } from './subject-key'

/**
 * THE CROCHET BATCH PLAN — the deterministic half of it.
 *
 * This module used to make a model call: one cheap Anthropic request per batch
 * that composed the briefs. It does not any more. Under Rebecca's standing rule
 * every planning, authoring and judging decision belongs to a Claude session on
 * her Max plan, so the SESSION writes the briefs and this module's whole job is
 * to hand it the facts it needs to write them well:
 *
 *   · the shelf quota — every buildable shelf weighted by its gap to target, so
 *     the catalogue fills evenly instead of piling into one shelf;
 *   · what the loom can actually build for each of those shelves, with the
 *     stitch envelopes, because a brief for a form the engine cannot build is
 *     not a hard brief, it is an impossible one;
 *   · the whole catalogue as normalised subject keys, because anything older
 *     than a couple of batches was otherwise invisible and got re-commissioned;
 *   · THE IDEA BACKLOG — the hand-picked, market-weighted work queue in
 *     `crochet-idea-backlog.ts`, filtered to the entries whose subject is not
 *     already taken. A session plans FROM this queue and only invents when the
 *     queue for a shelf is dry, because invention is good at variety and bad at
 *     coverage: nothing about a freely invented brief makes the catalogue end
 *     up carrying the subjects a customer actually searches for;
 *   · the shared design-direction axes and the starter briefs to dress from.
 *
 * `crochetPlanContextPayload` renders all of that as the JSON the `context`
 * stage writes. Nothing here reaches a network except the catalogue reads its
 * caller does.
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
  /** Who wrote it. 'session' is the only live source; the rest are historical. */
  source: 'session' | 'model' | 'sampler'
  /** Which planner wrote it. */
  plannerMode: string
  /** Did the author re-dress its pool subject, or copy it out? */
  dressed: boolean
}

/** The buildable shelves, with their targets — the only lanes crochet plans into. */
export const CROCHET_LANE_SHELVES: ShelfTarget[] = CROCHET_BUILDABLE_SHELF_SLUGS.map(
  (slug) => CROCHET_SHELF_BY_SLUG[slug],
).filter((s): s is ShelfTarget => Boolean(s))

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

/** Everything the `context` stage writes out for the session to plan against. */
export interface CrochetPlanContextPayload {
  batchSize: number
  /** One shelf slug per brief this batch owes, in order. */
  shelfSlots: string[]
  /** The shelf quota, with each shelf's live count, target and gap. */
  shelfQuota: {
    slug: string
    name: string
    briefs: number
    deficit: number
    published: number
    target: number
  }[]
  /** What the loom can build for each shelf in the quota. */
  buildableShelves: {
    slug: string
    name: string
    treatments: {
      treatment: CrochetTreatment
      note: string
      cols?: [number, number]
      rows?: [number, number]
      rounds?: [number, number]
      yarnWeight: string
      staging: string
    }[]
  }[]
  /** Every subject key already in the public catalogue. Nothing may repeat one. */
  avoidSubjectKeys: string[]
  /** The shared design-direction axes a brief is dressed from. */
  axes: {
    looks: { slug: string; name: string; vibe: string }[]
    territories: { slug: string; name: string }[]
    palettes: { slug: string; name: string; hexes: string[]; mood: string; suitsLooks: string[] }[]
    sizes: string[]
    difficulties: string[]
    buildOrder: string
  }
  /**
   * The idea backlog, filtered. `next` is the head of the whole queue in `seq`
   * order; `byShelf` is the head of each quota shelf's own queue, so the shelf
   * quota can be served from the backlog rather than around it. A shelf marked
   * `dry` has nothing left and is the only place invention belongs.
   */
  backlog: {
    next: BacklogOffer[]
    byShelf: { shelf: string; dry: boolean; ideas: BacklogOffer[] }[]
    /** Every id handed over this run, for the manifest. */
    offeredIds: string[]
    /** How many buildable entries the queue still holds, after filtering. */
    remaining: number
  }
  /** Starter briefs to dress from and vary — never to copy word for word. */
  starterBriefs: { itemType: string; concept: string }[]
  /** The compile budget one piece has to stay inside. */
  maxCells: number
}

/** One backlog entry as the session receives it. */
export interface BacklogOffer {
  id: string
  seq: number
  shelf: string
  title: string
  motif: string
  colourway: string
  treatment: CrochetTreatment | null
  sizeClass: string
  difficulty: string
  searchPhrase: string
  brief: string
}

function offer(idea: CrochetIdea): BacklogOffer {
  return {
    id: idea.id,
    seq: idea.seq,
    shelf: idea.shelf,
    title: idea.title,
    motif: idea.motif,
    colourway: idea.colourway,
    treatment: idea.treatment,
    sizeClass: idea.sizeClass,
    difficulty: idea.difficulty,
    searchPhrase: idea.searchPhrase,
    brief: idea.brief,
  }
}

/** How many of a shelf's own queue to show: its quota plus a couple of spares,
 *  so a session that rejects one entry has somewhere to go without inventing. */
const SHELF_QUEUE_SPARE = 2

/**
 * Assemble the plan context. Takes the catalogue reads as arguments so the
 * caller owns the database access and this stays a pure composition.
 *
 * `takenSubjectKeys` is the avoid list plus anything in flight in this run — a
 * candidate that has been expanded but not yet published is as taken as a
 * published row, because two sessions working the same queue would otherwise
 * commission it twice.
 */
export function crochetPlanContextPayload(input: {
  batchSize: number
  counts: Record<string, number>
  avoidSubjectKeys: string[]
  /** Subject keys of candidates already in flight this run. */
  inFlightSubjectKeys?: string[]
}): CrochetPlanContextPayload {
  const plan = crochetShelfPlan(input.counts, input.batchSize)
  const quotaSlugs = plan.quota.map((q) => q.slug)
  const taken = [...input.avoidSubjectKeys, ...(input.inFlightSubjectKeys ?? [])].filter(Boolean)
  const isTaken = (idea: CrochetIdea): boolean =>
    findSubjectKeyMatch(subjectKey(idea.motif), taken) !== null

  const next = nextBuildableIdeas(input.batchSize, taken)
  const byShelf = plan.quota.map((q) => {
    const queue = ideasForShelf(q.slug).filter((i) => i.buildable && !isTaken(i))
    return {
      shelf: q.slug,
      dry: queue.length === 0,
      ideas: queue.slice(0, q.briefs + SHELF_QUEUE_SPARE).map(offer),
    }
  })
  const offeredIds = [...new Set([...next.map((i) => i.id), ...byShelf.flatMap((s) => s.ideas.map((i) => i.id))])]

  return {
    batchSize: input.batchSize,
    shelfSlots: plan.slots,
    shelfQuota: plan.quota.map((q) => ({
      ...q,
      published: input.counts[q.slug] ?? 0,
      target: CROCHET_SHELF_BY_SLUG[q.slug]?.target ?? 0,
    })),
    buildableShelves: (quotaSlugs.length ? quotaSlugs : CROCHET_BUILDABLE_SHELF_SLUGS).map((slug) => ({
      slug,
      name: CROCHET_SHELF_BY_SLUG[slug]?.name ?? slug,
      treatments: envelopesForShelf(slug).map((e) => ({
        treatment: e.treatment,
        note: e.note,
        ...(e.cols ? { cols: e.cols } : {}),
        ...(e.rows ? { rows: e.rows } : {}),
        ...(e.rounds ? { rounds: e.rounds } : {}),
        yarnWeight: e.yarnWeight,
        staging: e.staging,
      })),
    })),
    avoidSubjectKeys: input.avoidSubjectKeys,
    axes: {
      looks: LOOKS.map((l) => ({ slug: l.slug, name: l.name, vibe: l.vibe })),
      territories: territoriesFor('crochet', 'core').map((t) => ({ slug: t.slug, name: t.name })),
      palettes: PALETTES.map((p) => ({
        slug: p.slug,
        name: p.name,
        hexes: p.hexes,
        mood: p.mood,
        suitsLooks: p.suitsLooks,
      })),
      sizes: ['small', 'medium', 'large', 'showpiece'],
      difficulties: ['beginner', 'intermediate', 'advanced', 'showpiece'],
      buildOrder: BUILD_ORDER,
    },
    backlog: {
      next: next.map(offer),
      byShelf,
      offeredIds,
      remaining: nextBuildableIdeas(Number.MAX_SAFE_INTEGER, taken).length,
    },
    starterBriefs: CROCHET_STARTER_BRIEFS.filter((b) =>
      CROCHET_BUILDABLE_SHELF_SLUGS.includes(b.itemType),
    ).map((b) => ({ itemType: b.itemType, concept: b.concept })),
    maxCells: BULK_CROCHET_MAX_CELLS,
  }
}

/** The treatments a shelf allows — re-exported so the CLI validates against one list. */
export { treatmentsForShelf }

/**
 * THE RULE, as an error.
 *
 * Crochet briefs are written by a Claude session on Rebecca's Max plan, in a
 * cloud routine. No code path may buy them from the Anthropic API a token at a
 * time, so the old entry point stays here as a refusal rather than disappearing
 * quietly — anything still reaching for it fails saying why.
 */
export function planCrochetBriefs(): never {
  throw new Error(
    'planCrochetBriefs: crochet briefs are planned by a Claude session on the Max plan (docs/autopilot-prompts/crochet.md), never by a per-token Anthropic API call. Run `scripts/crochet-autopilot.ts context` and write briefs.json.',
  )
}
