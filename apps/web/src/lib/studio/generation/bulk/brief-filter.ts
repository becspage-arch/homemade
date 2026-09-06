/**
 * THE BRIEF POST-FILTER — the mechanical gate a planned brief passes before it
 * is ever generated.
 *
 * Batch 5 (September 2026) is why this exists. Ten model-authored briefs, two
 * gems. Five of the eight kills were the same failure: the brief hung a small
 * prop off the subject ("a tiny sailor's spyglass shell", "a single dragonfly",
 * "a paper umbrella", "a ring of tiny orbiting stars") and Flux rendered the
 * big shape fine and turned the prop into a blob, which the vision gate then
 * correctly killed. And three PAIRS in that one batch were the same idea twice
 * over — two gladiolus spires, two hermit crabs in shells, two tiki-pineapple
 * cocktails — which the catalogue duplicate guard cannot see, because it
 * compares each brief against what is already PUBLISHED, never against its own
 * batch, and the 0.6 subject-key threshold is far too loose for a pair written
 * minutes apart by the same model.
 *
 * Both rules are BINARY, like every other quality rule in this pipeline: a
 * brief is rejected or it is not, there is no warning tier.
 *
 * Pure and dependency-free (no `server-only`, no Prisma) so the planner applies
 * it, the tests check it, and — deliberately — so that switching the planner to
 * constrained mode later is ONE function call: whatever picks the subjects,
 * `postFilterBriefs` is what decides which of them survive.
 */

import { singulariseWord, keyJaccard } from './subject-key'

// ───────────────────────────── the prop filter ─────────────────────────────

/**
 * Props Flux will not render at our cell counts.
 *
 * Every one of these is a phrase that attaches a SECOND, SMALLER thing to the
 * subject. At 68–215 cells the small thing gets a dozen stitches and reads as a
 * smudge, and a smudge next to a clean subject is worse than no second thing at
 * all — the gate kills the whole chart for it.
 *
 * The labels are user-facing: they end up in the planner's warning log and in
 * the "do not write these" line the retry call shows the model.
 */
const PROP_PATTERNS: { label: string; re: RegExp }[] = [
  { label: 'diminutive ("tiny/little/small/miniature")', re: /\b(tiny|little|small|miniature|minuscule|petite)\b/i },
  { label: '"a single …"', re: /\bsingle\b/i },
  { label: '"peeking …"', re: /\bpeek(?:s|ing|ed)?\b/i },
  { label: '"perched on …"', re: /\bperch(?:es|ed|ing)?\s+(?:on|upon|atop|in)\b/i },
  { label: '"resting on/along/near …"', re: /\brest(?:s|ing|ed)?\s+(?:on|along|near|against|beside|upon)\b/i },
  { label: '"topped with …"', re: /\btopped\s+with\b/i },
  { label: '"wearing a …"', re: /\bwear(?:s|ing)\s+(?:an?|its|his|her|their)\b/i },
  { label: '"holding a …"', re: /\bhold(?:s|ing)\s+(?:an?|its|his|her|their)\b/i },
  { label: '"carrying a …"', re: /\bcarry(?:ing|ies)\s+(?:an?|its|his|her|their)\b/i },
  { label: '"ringed by …"', re: /\bring(?:ed|s)\s+(?:by|with|around)\b/i },
  { label: '"dotted with …"', re: /\bdotted\s+with\b/i },
  { label: '"beside a …"', re: /\bbeside\s+an?\b/i },
  { label: 'trailing "with a …" prop clause', re: /\bwith\s+(?:an?|its|his|her|their)\s+\w/i },
]

/**
 * "inside a …" is the one conditional rule. A fox inside a basket is a fine
 * brief when the fox is the big shape on the canvas; at mini or small it is a
 * fox-shaped smudge inside a basket-shaped smudge. So it is allowed only in the
 * lanes with the cells to carry two shapes.
 */
const INSIDE_A = /\binside\s+(?:an?|its|his|her|their)\b/i
const ROOMY_LANES = new Set(['large', 'dense'])

/** The two small lanes, where the rule is stricter still. */
const SMALL_LANES = new Set(['mini', 'small'])

/**
 * At mini and small there is room for ONE noun phrase and nothing else. Twelve
 * words is the observed ceiling for a subject that survives ten colours; past
 * that the model is always describing a second thing.
 */
export const SMALL_LANE_WORD_LIMIT = 12

/** The parts of a brief the prop filter reads. */
export interface PropBrief {
  subject: string
  lane: string
}

/**
 * Binary: why this brief is unbuildable, or null if it is fine.
 *
 * Returns the FIRST reason only — the point is the reject, not a full audit.
 */
export function propReject(b: PropBrief): string | null {
  const subject = b.subject ?? ''
  if (SMALL_LANES.has(b.lane)) {
    const words = subject.trim().split(/\s+/).filter(Boolean)
    if (words.length > SMALL_LANE_WORD_LIMIT) {
      return `${b.lane} lane: ${words.length} words, over the ${SMALL_LANE_WORD_LIMIT}-word limit`
    }
    if (/\b(with|and|beside)\b/i.test(subject)) {
      return `${b.lane} lane: more than one noun phrase ("with"/"and"/"beside")`
    }
  }
  if (INSIDE_A.test(subject) && !ROOMY_LANES.has(b.lane)) {
    return `prop: "inside a …" outside the large/dense lanes`
  }
  for (const p of PROP_PATTERNS) {
    if (p.re.test(subject)) return `prop: ${p.label}`
  }
  return null
}

// ─────────────────────── the within-batch collision rule ───────────────────

/**
 * How much two briefs in the SAME batch may overlap.
 *
 * Far tighter than `SUBJECT_JACCARD_MATCH` (0.6), which is calibrated for "is
 * this the same idea as something already published". Two briefs written in the
 * same model call are much more alike in wording than a brief and a two-year-old
 * catalogue row, so the same threshold is useless here: batch 5's two gladiolus
 * spires scored about 0.43 and sailed straight through.
 */
export const BATCH_JACCARD_COLLISION = 0.4

/**
 * Words that lead a noun phrase without being its head: articles, quantities,
 * sizes and colours. Stripped only when something is left afterwards, so a
 * subject that is nothing BUT colour still yields a head.
 */
const NON_HEAD = new Set([
  // quantity / size
  'single', 'one', 'two', 'three', 'pair', 'tall', 'short', 'large', 'big', 'giant', 'huge',
  'long', 'wide', 'round', 'thin', 'thick', 'great', 'grand', 'whole', 'entire', 'half',
  // colour and tone — "a golden sun" and "a copper sun" are the same head
  'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'purple', 'pink', 'magenta',
  'scarlet', 'crimson', 'coral', 'gold', 'golden', 'silver', 'bronze', 'copper', 'white', 'black',
  'grey', 'gray', 'brown', 'cream', 'ivory', 'teal', 'turquoise', 'amber', 'jade', 'emerald',
  'ruby', 'sapphire', 'lavender', 'mint', 'peach', 'blush', 'russet', 'ochre', 'sepia', 'pastel',
  'bright', 'dark', 'pale', 'deep', 'rich', 'warm', 'cool', 'vivid', 'muted', 'neon',
])

/**
 * Where the leading noun phrase ends. Prepositions and conjunctions — but NOT
 * "of", which lives INSIDE a noun phrase ("a spike of magenta gladiolus blooms"
 * is one thing, and cutting at "of" would lose the word that matters).
 */
const PHRASE_BOUNDARY = new Set([
  'in', 'on', 'at', 'with', 'without', 'among', 'amongst', 'beside', 'behind', 'beneath', 'below',
  'under', 'over', 'above', 'across', 'through', 'by', 'near', 'against', 'inside', 'outside',
  'atop', 'from', 'to', 'into', 'onto', 'around', 'along', 'and', 'or', 'but', 'while', 'as',
])

/** Determiners and the in-phrase "of" — skipped over, never a head, never a boundary. */
const PHRASE_SKIP = new Set(['a', 'an', 'the', 'of', 'this', 'that', 'these', 'those', 'its', 'his', 'her', 'their'])

/** A participle or verb — "…crab WEARING a…", "…mug TOPPED with…" — also ends the phrase. */
function isVerbish(word: string): boolean {
  return /(?:ing|ed)$/.test(word) && word.length > 4
}

/**
 * Raw word tokens: lowercased, de-punctuated, plural-folded. Deliberately NOT
 * `subjectTokens`, which strips prepositions and conjunctions — the very words
 * that mark where the leading noun phrase stops.
 */
function phraseWords(subject: string): string[] {
  return subject
    .normalize('NFKD')
    .replace(/[\u2018\u2019\u02bc]/g, "'")
    .toLowerCase()
    .replace(/'s\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(singulariseWord)
}

/**
 * The head of a brief's leading noun phrase: its last one or two content words.
 *
 * Taken from the END of the phrase, not the start, because English puts the head
 * noun last — "a single tall GLADIOLUS SPIRE", "a scarlet HERMIT CRAB", "a tall
 * frosted PINA COLADA". Reading from the front needs an exhaustive adjective
 * list and still lands on "single" or "frosted"; reading from the back needs
 * almost nothing and finds the noun every time.
 *
 * The phrase is cut at the first preposition, conjunction or participle — but
 * only once two content words are in hand, so an opener like "round-cheeked baby
 * fox cub" is not truncated to nothing by its own "-ed".
 */
export function headNouns(subject: string): string[] {
  const phrase: string[] = []
  for (const w of phraseWords(subject)) {
    if (PHRASE_SKIP.has(w)) continue
    // A preposition or conjunction ends the phrase as soon as there is a phrase
    // to end ("a badger IN a woodland hollow" → badger). A participle needs two
    // words first, because plenty of them are adjectives that OPEN one instead
    // ("a tall FROSTED pina colada", "a ROUND-CHEEKED baby fox cub") and cutting
    // there would leave the head behind.
    if (PHRASE_BOUNDARY.has(w)) {
      if (phrase.length >= 1) break
      continue
    }
    if (isVerbish(w)) {
      if (phrase.length >= 2) break
      continue
    }
    phrase.push(w)
  }
  const content = phrase.filter((w) => !NON_HEAD.has(w))
  const head = content.length ? content : phrase
  return head.slice(-2)
}

/** The parts of a brief the collision rule reads. */
export interface CollisionBrief {
  subject: string
  subjectKey: string
  shelf: string
}

/**
 * Binary: are these two briefs the same idea, or null if they are not?
 *
 * Same shelf is required — two hermit crabs on `animals` is a repeat, a hermit
 * crab on `animals` and one on `coastal` is a range. Then either measure fires:
 * enough shared tokens, or a shared head noun.
 */
export function briefsCollide(a: CollisionBrief, b: CollisionBrief): string | null {
  if (!a.shelf || a.shelf !== b.shelf) return null
  const overlap = keyJaccard(a.subjectKey, b.subjectKey)
  if (overlap >= BATCH_JACCARD_COLLISION) {
    return `same shelf as "${b.subject}" and ${(overlap * 100).toFixed(0)}% token overlap`
  }
  const heads = new Set(headNouns(b.subject))
  const shared = headNouns(a.subject).filter((h) => heads.has(h))
  if (shared.length) {
    return `same shelf as "${b.subject}" and the same head noun ("${shared.join(' ')}")`
  }
  return null
}

// ──────────────────────────── the one entry point ────────────────────────────

/** Why a brief did not survive the post-filter. */
export interface BriefReject<T> {
  brief: T
  kind: 'prop' | 'collision'
  reason: string
}

export interface PostFilterResult<T> {
  kept: T[]
  rejects: BriefReject<T>[]
}

export interface PostFilterOptions {
  /**
   * Apply the prop filter. TRUE for model-authored briefs; FALSE for the pool
   * sampler, whose curated examples are written in exactly the "a fox in a
   * mustard raincoat" register the prop filter rejects. The sampler is the
   * safety net for a failed model call — filtering it to nothing would turn a
   * slow Anthropic response into an empty batch.
   */
  props?: boolean
}

/**
 * THE post-filter. Everything that decides whether a planned brief is allowed to
 * be generated goes through here, in order: props first (cheap, per-brief), then
 * within-batch collisions against the briefs already kept.
 *
 * `prior` is the batch so far — briefs kept by an earlier planner chunk. New
 * briefs are checked against it but it is never re-filtered or returned.
 *
 * On a collision the LATER brief is dropped, so a batch's earlier chunks are
 * stable: re-running the filter with more candidates never changes what it
 * already kept.
 */
export function postFilterBriefs<T extends PropBrief & CollisionBrief>(
  candidates: T[],
  prior: T[] = [],
  opts: PostFilterOptions = {},
): PostFilterResult<T> {
  const props = opts.props !== false
  const kept: T[] = []
  const rejects: BriefReject<T>[] = []
  for (const brief of candidates) {
    if (props) {
      const prop = propReject(brief)
      if (prop) {
        rejects.push({ brief, kind: 'prop', reason: prop })
        continue
      }
    }
    let clash: string | null = null
    for (const other of [...prior, ...kept]) {
      clash = briefsCollide(brief, other)
      if (clash) break
    }
    if (clash) {
      rejects.push({ brief, kind: 'collision', reason: clash })
      continue
    }
    kept.push(brief)
  }
  return { kept, rejects }
}

/** How many of a reject list were each kind — the two counters a run records. */
export function countRejects<T>(rejects: BriefReject<T>[]): { props: number; collisions: number } {
  return {
    props: rejects.filter((r) => r.kind === 'prop').length,
    collisions: rejects.filter((r) => r.kind === 'collision').length,
  }
}
