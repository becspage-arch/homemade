/**
 * CROCHET CROSS-CRAFT TAGS, derived without a model and without a guess.
 *
 * Cross-stitch closed out with 2,333 public patterns carrying no theme tag,
 * because its bulk path never born-tagged (playbook learnings, 9 October 2026).
 * Crochet's bulk path was about to repeat that: `publishCrochetGem` wrote the
 * row and the search document and never a tag. This is the one rule both the
 * publisher (born-tagging) and the back-catalogue backfill use, so the two
 * cannot disagree.
 *
 * Three sources, each written with the source the tagging rules name
 * (playbook, "Cross-craft tagging — FULL operational block"):
 *
 *   · AUTHORED — the brief the generator aimed at. The Look's STYLE tags come
 *     straight from `design-direction.ts`, which is how designs are born-tagged.
 *     The Territory's SUBJECT tags are kept only when the piece DEPICTS
 *     something (an amigurumi figure, a tapestry picture): SUBJECT is "what it
 *     depicts", and a plain sage coaster briefed under modern botanicals depicts
 *     no flower. A territory's OCCASION tags are a menu, not a verdict ("the
 *     brief picks the specific occasion"), so one is kept only when the
 *     pattern's own name names it.
 *   · DERIVED — the home shelf. Only shelves whose meaning is a tag without
 *     argument: a flower bouquet is florals, play food is food-drink, a pet
 *     jumper is for pets, booties are for a baby. Ornaments, wreaths and gnomes
 *     are year-round as often as seasonal, so they derive nothing.
 *   · KEYWORD — the pattern's NAME matched against the vocabulary's slugs, names
 *     and aliases, on the OCCASION, SEASON and SUBJECT axes only. STYLE is a
 *     visual judgement and is never read from text. The description is not
 *     read: crochet descriptions are full of craft words ("traditional", "for
 *     the home", "tea") that would tag the wrong thing.
 *
 * Precision over recall: an empty result is a correct result. Every slug this
 * returns exists in `collection-vocabulary.ts`, so `setContentTags` must come
 * back with an empty `unknown`; if it does not, the database is missing a
 * seeded term and the caller refuses.
 *
 * Pure: no Prisma, no network.
 */

import { COLLECTION_VOCABULARY, type VocabTerm } from '../prisma/collection-vocabulary'
import { LOOKS, TERRITORIES } from '../prisma/design-direction'

export interface CrochetTagInput {
  /** The pattern's public name. */
  name: string
  /** Its home shelf (SubCategory slug). */
  shelfSlug: string | null | undefined
  /** `generationMeta.brief` as the bulk publisher stores it, when there is one. */
  brief?: { look?: string | null; territory?: string | null; treatment?: string | null } | null
}

/**
 * Treatments whose finished piece depicts its subject, so the brief's
 * Territory may give SUBJECT tags. Stripes, textures, plain grids, discs,
 * spheres, ribs and tubes depict nothing; a missing treatment counts as
 * depicting nothing (empty beats wrong).
 */
export const CROCHET_FIGURATIVE_TREATMENTS: ReadonlySet<string> = new Set(['amigurumi', 'grid-tapestry', 'motif'])

export interface CrochetTagResult {
  /** From the brief's Look and Territory (source AUTHORED). */
  authored: string[]
  /** From the home shelf (source DERIVED). */
  derived: string[]
  /** From words in the name (AUTHORED when born-tagged, BACKFILL afterwards). */
  keyword: string[]
  /** Everything, deduplicated, in that order. */
  all: string[]
}

/**
 * Home shelves whose meaning is a tag on its own. Kept short on purpose: a
 * shelf earns a line here only when every pattern on it would carry the tag.
 */
export const CROCHET_SHELF_TAGS: Readonly<Record<string, readonly string[]>> = {
  'animal-toy': ['animals'],
  'flower-bouquet': ['florals'],
  'applique-flower': ['florals'],
  'potted-plant': ['florals'],
  'play-food': ['food-drink'],
  stocking: ['christmas', 'winter'],
  booties: ['baby'],
  'baby-toy-lovey': ['baby'],
  'pet-bed': ['pets'],
  'pet-clothing': ['pets'],
}

/**
 * Words a crochet name uses as an item type, which the vocabulary would
 * otherwise read as a theme: a tea cosy is not food and drink, a tea light is
 * not a drink, an egg cosy is not "home and cosy".
 */
const ITEM_TYPE_PHRASES = [
  'coffee cup cosy',
  'coffee cup cosies',
  'tea cosy',
  'tea cosies',
  'egg cosy',
  'egg cosies',
  'tea towel',
  'tea towels',
  'tea light',
  'tea lights',
  'mug rug',
  'mug rugs',
  'mug cosy',
  'mug cosies',
  'cup cosy',
  'cup cosies',
  'coffee cosy',
  'coffee cosies',
  'cafetiere cosy',
]

/** Aliases too generic in a crochet name to mean the theme they point at. */
const GENERIC_ALIASES = new Set(['traditional', 'home', 'cosy', 'soft', 'simple', 'classic', 'words', 'domestic'])

/** Axes a name may tag. STYLE is visual and is never read from text. */
const TEXT_AXES = new Set<VocabTerm['axis']>(['OCCASION', 'SEASON', 'SUBJECT'])

/**
 * A season an occasion implies without argument (the playbook's own example:
 * a Christmas pudding is christmas + winter).
 */
const OCCASION_SEASON: Readonly<Record<string, string>> = {
  christmas: 'winter',
  halloween: 'autumn',
  easter: 'spring',
}

const BY_SLUG = new Map(COLLECTION_VOCABULARY.map((t) => [t.slug, t]))

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** A whole-word, case-blind pattern that also takes the plural / singular. */
function phraseRe(phrase: string): RegExp {
  const words = phrase.split(/[\s-]+/).filter(Boolean).map(escapeRe)
  const last = words.pop() ?? ''
  const stem = last.endsWith('s') && !last.endsWith('ss') ? last.slice(0, -1) : last
  const body = [...words, `${stem}s?`].join('[\\s-]+')
  return new RegExp(`(^|[^a-z0-9])${body}($|[^a-z0-9])`, 'i')
}

interface Matcher {
  slug: string
  res: RegExp[]
}

const TEXT_MATCHERS: Matcher[] = COLLECTION_VOCABULARY.filter((t) => TEXT_AXES.has(t.axis)).map((t) => {
  const phrases = [t.slug.replace(/-/g, ' '), t.name, ...(t.aliases ?? [])]
    .map((p) => p.toLowerCase().replace(/[&,]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 2 && !GENERIC_ALIASES.has(p))
  return { slug: t.slug, res: [...new Set(phrases)].map(phraseRe) }
})

/** The parent chain of a term (santa -> christmas), nearest first. */
function ancestors(slug: string): string[] {
  const out: string[] = []
  let cur = BY_SLUG.get(slug)?.parent
  while (cur && !out.includes(cur)) {
    out.push(cur)
    cur = BY_SLUG.get(cur)?.parent
  }
  return out
}

/** Add the parents and the implied season of every occasion in the list. */
function closeOver(slugs: string[]): string[] {
  const out: string[] = []
  const push = (s: string) => {
    if (BY_SLUG.has(s) && !out.includes(s)) out.push(s)
  }
  for (const s of slugs) {
    push(s)
    for (const a of ancestors(s)) push(a)
  }
  for (const s of [...out]) {
    const season = OCCASION_SEASON[s]
    if (season) push(season)
  }
  return out
}

/** Vocabulary slugs the name names, on the text axes only. */
export function crochetNameTagSlugs(name: string): string[] {
  let text = ` ${name.toLowerCase()} `
  for (const p of ITEM_TYPE_PHRASES) text = text.split(p).join(' ')
  const hits = TEXT_MATCHERS.filter((m) => m.res.some((re) => re.test(text))).map((m) => m.slug)
  return closeOver(hits)
}

/** The tags a crochet pattern carries, by source. */
export function crochetTagSlugs(input: CrochetTagInput): CrochetTagResult {
  const keyword = crochetNameTagSlugs(input.name)

  const authoredRaw: string[] = []
  const look = input.brief?.look ? LOOKS.find((l) => l.slug === input.brief!.look) : undefined
  if (look) authoredRaw.push(...look.styleTags)
  const territory = input.brief?.territory ? TERRITORIES.find((t) => t.slug === input.brief!.territory) : undefined
  if (territory) {
    if (CROCHET_FIGURATIVE_TREATMENTS.has(input.brief?.treatment ?? '')) authoredRaw.push(...territory.subjectTags)
    // The territory's occasions are a menu; keep the one the name names.
    for (const o of territory.occasionTags ?? []) if (keyword.includes(o)) authoredRaw.push(o)
  }
  const authored = closeOver(authoredRaw)

  const derived = closeOver([...(input.shelfSlug ? CROCHET_SHELF_TAGS[input.shelfSlug] ?? [] : [])])

  const all: string[] = []
  for (const s of [...authored, ...derived, ...keyword]) if (!all.includes(s)) all.push(s)
  return {
    authored,
    derived: derived.filter((s) => !authored.includes(s)),
    keyword: keyword.filter((s) => !authored.includes(s) && !derived.includes(s)),
    all,
  }
}
