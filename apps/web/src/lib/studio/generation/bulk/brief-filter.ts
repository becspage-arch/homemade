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

/**
 * The LIGHT backstop: the two prop shapes that are worth catching even when the
 * subject came from the curated pool. Constrained mode's head-noun match already
 * holds the brief to a pool subject, so this only has to catch the model bolting
 * something extra on.
 */
const LIGHT_PROP_PATTERNS: { label: string; re: RegExp }[] = [
  { label: 'diminutive ("tiny/little/small/miniature")', re: /\b(tiny|little|small|miniature|minuscule|petite)\b/i },
  { label: 'trailing "with a …" prop clause', re: /\bwith\s+(?:an?|its|his|her|their)\s+\w/i },
]

/** The parts of a brief the prop filter reads. */
export interface PropBrief {
  subject: string
  lane: string
}

/**
 * How hard the prop filter bites.
 *
 * `strict` is the free-planner rule: the whole pattern list, plus the one-noun-
 * phrase ceiling in the small lanes. `light` is constrained mode's backstop —
 * diminutives and a trailing "with a …" only, and no word limit, because the
 * pool subject now defines the shape and several curated examples are legitimately
 * written with both ("a fox in a tiny raincoat with a paper boat" has been one of
 * the better-yielding briefs in the catalogue).
 */
export type PropMode = 'strict' | 'light' | 'off'

/**
 * What the brief is ALLOWED to already contain, in light mode: the pool example
 * it was built from. A prop that is in the example is the subject; a prop the
 * model added is a prop. Without a baseline, light mode simply tests the two
 * patterns outright.
 */
export function lightPropReject(subject: string, baseline?: string): string | null {
  for (const p of LIGHT_PROP_PATTERNS) {
    if (!p.re.test(subject)) continue
    if (baseline && p.re.test(baseline)) continue // the pool subject's own, not an addition
    return `prop added to the pool subject: ${p.label}`
  }
  return null
}

/**
 * Binary: why this brief is unbuildable, or null if it is fine.
 *
 * Returns the FIRST reason only — the point is the reject, not a full audit.
 */
export function propReject(b: PropBrief, mode: PropMode = 'strict', baseline?: string): string | null {
  const subject = b.subject ?? ''
  if (mode === 'off') return null
  if (mode === 'light') return lightPropReject(subject, baseline)
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
  'in', 'on', 'at', 'with', 'without', 'among', 'amongst', 'between', 'beside', 'behind',
  'beneath', 'below', 'under', 'over', 'above', 'across', 'through', 'by', 'near', 'against',
  'inside', 'outside', 'atop', 'from', 'to', 'into', 'onto', 'around', 'along', 'past',
  'toward', 'towards', 'upon', 'and', 'or', 'but', 'while', 'as',
])

/** Determiners and the in-phrase "of" — skipped over, never a head, never a boundary. */
const PHRASE_SKIP = new Set(['a', 'an', 'the', 'of', 'this', 'that', 'these', 'those', 'its', 'his', 'her', 'their'])

/**
 * Participles that ADJECTIVALLY dress a noun rather than acting on it.
 *
 * The distinction matters because the phrase reader cuts at a verb: "a crab
 * WEARING a shell" must stop at the crab, but "a tall FROSTED pina colada" must
 * not stop at "tall". These are skipped over entirely — they are decoration, not
 * the head and not the end of it. A short explicit list beats any suffix rule;
 * these are the ones the planner and the pool actually reach for.
 */
const ADJECTIVAL_PARTICIPLES = new Set([
  'flaming', 'frosted', 'glowing', 'gleaming', 'shimmering', 'sparkling', 'glittering', 'striped',
  'spotted', 'speckled', 'dappled', 'gilded', 'beaded', 'fringed', 'ruffled', 'feathered',
  'crooked', 'horned', 'cheeked', 'faded', 'muted', 'painted', 'carved', 'braided', 'twisted',
  'curved', 'arched', 'pointed', 'rounded', 'weathered', 'polished', 'winged', 'tufted', 'hooded',
  'toasted', 'iced', 'candied', 'stuffed', 'knitted', 'woven', 'embroidered', 'patterned',
  'antlered', 'whiskered', 'freckled', 'plaited', 'scalloped', 'ribbed', 'quilted', 'terraced',
  'trailing', 'climbing', 'hanging', 'sleeping', 'steaming', 'snowy', 'sunlit',
])

/**
 * Nouns that merely END in -ing or -ed and are not verbs at all.
 *
 * Without this the reader loses the subject completely: "a DUCKLING on a green
 * bank" read as a verb and returned `bank`, "a STOCKING hung on a mantel"
 * returned `hung`, "a fluffy SPRING lamb" returned `fluffy`. Every one of those
 * is a pool subject whose identity is the word being thrown away.
 */
const NOUN_EXCEPTIONS = new Set([
  'duckling', 'dumpling', 'sapling', 'seedling', 'earring', 'evening', 'morning', 'lightning',
  'pudding', 'string', 'spring', 'ceiling', 'building', 'wedding', 'herring', 'gosling',
  'nestling', 'fledgling', 'starling', 'bunting', 'awning', 'icing', 'stocking', 'viking',
  'pumpkin', 'cottage', 'thing', 'king', 'wing', 'ring', 'swing', 'sting', 'bunting',
  'thread', 'bread', 'seaweed', 'hundred', 'moped', 'tweed', 'weed', 'reed', 'breed', 'steed',
  'shed', 'sled', 'sledge', 'bed', 'hedge', 'wed', 'red',
])

/**
 * Irregular past participles, which carry no -ed to spot them by. "A crescent
 * moon SPLIT between two faces" has to stop at the moon exactly as "a crab
 * WEARING a shell" stops at the crab.
 */
const IRREGULAR_VERBS = new Set([
  'split', 'set', 'cut', 'put', 'spun', 'sat', 'held', 'hung', 'wound', 'bound', 'worn', 'torn',
  'drawn', 'flown', 'blown', 'grown', 'strewn', 'swung', 'clung', 'slept', 'crept', 'kept',
  'leapt', 'wept', 'sprung', 'risen', 'fallen', 'sunk', 'sung', 'flung', 'stuck', 'struck',
])

/** A participle or verb — "…crab WEARING a…", "…corgi NAPPING in a…" — ends the phrase. */
function isVerbish(word: string): boolean {
  if (NOUN_EXCEPTIONS.has(word)) return false
  if (IRREGULAR_VERBS.has(word)) return true
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
    if (PHRASE_SKIP.has(w) || ADJECTIVAL_PARTICIPLES.has(w)) continue
    // A preposition, conjunction or verb ends the phrase as soon as there is a
    // phrase to end: "a badger IN a woodland hollow" is a badger, "a corgi
    // NAPPING in a teacup" is a corgi. Before that point it is skipped, so an
    // opener like "ROUND-CHEEKED baby fox cub" keeps its head.
    if (PHRASE_BOUNDARY.has(w) || isVerbish(w)) {
      if (phrase.length >= 1) break
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

// ─────────────────── constrained mode: match a pool example ───────────────────

/**
 * The pool example a constrained brief is a dressing of, or null if it is not a
 * dressing of any of them.
 *
 * Constrained mode lets the model change setting, palette, season, time of day,
 * pose and expression — everything EXCEPT what the thing is. The head noun is
 * precisely what survives all six of those edits, so it is the identity test:
 * "a red squirrel among autumn leaves" and "a red squirrel on a frosty branch at
 * dawn" both read as `squirrel`.
 *
 * Matched on INTERSECTION rather than equality, deliberately. The reader returns
 * up to two words and a legitimate re-dressing can drop one of them ("a crescent
 * moon cradling stars" → `crescent moon`; "a crescent moon over a winter sea" →
 * `crescent moon`, but "a moon split between two faces" → `moon split`). One
 * shared head word is the subject surviving; zero is a different subject.
 */
export function matchExampleByHead(subject: string, examples: readonly string[]): string | null {
  const heads = new Set(headNouns(subject))
  if (heads.size === 0) return null
  for (const ex of examples) {
    if (headNouns(ex).some((h) => heads.has(h))) return ex
  }
  return null
}

// ──────────────────────────── the one entry point ────────────────────────────

/** Why a brief did not survive the post-filter. */
export interface BriefReject<T> {
  brief: T
  kind: 'prop' | 'collision' | 'off-pool' | 'over-quota' | 'wrong-lane'
  reason: string
}

export interface PostFilterResult<T> {
  kept: T[]
  rejects: BriefReject<T>[]
}

export interface PostFilterOptions {
  /**
   * How hard the prop filter bites — see `PropMode`. `true`/`false` are still
   * accepted and mean `strict`/`off`, because the sampler path only ever needed
   * the binary: its curated examples are written in exactly the "a fox in a
   * mustard raincoat" register the strict filter rejects, and filtering the
   * fallback to nothing would turn a slow Anthropic response into an empty batch.
   */
  props?: PropMode | boolean
  /**
   * Constrained mode: the pool examples each brief must be a dressing of, keyed
   * by theme id. A brief whose head noun matches none of its theme's examples is
   * rejected — that is the whole mechanism, and it is why the model can no longer
   * invent a subject. Omit for free-planner mode.
   */
  examplesByTheme?: Record<string, readonly string[]>
  /**
   * How many briefs each shelf may have in this batch — normally the slot count
   * the deficit allocation gave it, which is itself capped at a fifth of the
   * batch.
   *
   * The allocation alone does NOT hold: batch 6 was allocated one slot per shelf
   * across ten shelves and still came back with three `celestial` briefs, because
   * the planner is free to pick any theme on the quota and simply picked that one
   * three times. Two of the three were the same composition — an animal in flight
   * across a moon — which no token or head-noun test can see. So the quota is
   * enforced here rather than merely requested in the prompt.
   */
  shelfQuota?: Record<string, number>
  /**
   * The size lanes each theme's subjects survive, with per-subject exceptions.
   *
   * Batch 7 put a shopfront in the mini lane at nine colours ("shapes read as
   * mush not shop") and a margarita in mini at ten ("glass shape malformed").
   * Neither was a bad subject or a bad brief; each was a subject in a canvas that
   * cannot hold it. The planner promotes a brief into its smallest allowed lane
   * before it ever gets here — this is the backstop for anything that slips past,
   * including a lane the range rule pushed it back down into.
   */
  laneTags?: Record<string, ThemeLaneTags>
}

/** One theme's lane rules: the subjects, the default lanes, and the exceptions. */
export interface ThemeLaneTags {
  examples: readonly string[]
  lanes: readonly string[]
  overrides?: Record<string, readonly string[]>
}

/**
 * The lanes a subject may be built in: its own override if it has one, else its
 * theme's default. Returns null when the theme is unknown — no rule, no reject.
 */
export function lanesForSubject(subject: string, tags: ThemeLaneTags | undefined): readonly string[] | null {
  if (!tags) return null
  const example = matchExampleByHead(subject, tags.examples)
  if (example && tags.overrides?.[example]) return tags.overrides[example]
  return tags.lanes
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
export function postFilterBriefs<T extends PropBrief & CollisionBrief & { themeId?: string }>(
  candidates: T[],
  prior: T[] = [],
  opts: PostFilterOptions = {},
): PostFilterResult<T> {
  const mode: PropMode = opts.props === true ? 'strict' : opts.props === false ? 'off' : (opts.props ?? 'strict')
  const kept: T[] = []
  const rejects: BriefReject<T>[] = []
  for (const brief of candidates) {
    // Constrained mode first: a brief that is not a dressing of a pool subject
    // is not worth prop-checking, and its matched example is the baseline the
    // light prop filter measures additions against.
    let baseline: string | undefined
    if (opts.examplesByTheme) {
      const examples = opts.examplesByTheme[brief.themeId ?? ''] ?? []
      const match = matchExampleByHead(brief.subject, examples)
      if (!match) {
        rejects.push({
          brief,
          kind: 'off-pool',
          reason: `head noun "${headNouns(brief.subject).join(' ') || '—'}" matches no example in theme "${brief.themeId ?? '?'}"`,
        })
        continue
      }
      baseline = match
    }
    if (mode !== 'off') {
      const prop = propReject(brief, mode, baseline)
      if (prop) {
        rejects.push({ brief, kind: 'prop', reason: prop })
        continue
      }
    }
    if (opts.laneTags) {
      const allowed = lanesForSubject(brief.subject, opts.laneTags[brief.themeId ?? ''])
      if (allowed && !allowed.includes(brief.lane)) {
        rejects.push({
          brief,
          kind: 'wrong-lane',
          reason: `"${brief.subject}" cannot be built in the ${brief.lane} lane (needs ${allowed.join('/')})`,
        })
        continue
      }
    }
    if (opts.shelfQuota) {
      const allowed = opts.shelfQuota[brief.shelf] ?? 0
      const already = [...prior, ...kept].filter((b) => b.shelf === brief.shelf).length
      if (already >= allowed) {
        rejects.push({
          brief,
          kind: 'over-quota',
          reason: `shelf "${brief.shelf}" already has its ${allowed} brief${allowed === 1 ? '' : 's'} for this batch`,
        })
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

/**
 * How many of a reject list were each kind — the counters a run records.
 *
 * Off-pool and wrong-lane fold into PROPS ("the model asked for something
 * un-buildable") and over-quota folds into COLLISIONS ("too much of the same
 * thing in one batch").
 * Those are the two numbers worth watching; extra columns for distinctions only
 * this module cares about are not worth a migration.
 */
export function countRejects<T>(rejects: BriefReject<T>[]): { props: number; collisions: number } {
  return {
    props: rejects.filter((r) => r.kind === 'prop' || r.kind === 'off-pool' || r.kind === 'wrong-lane').length,
    collisions: rejects.filter((r) => r.kind === 'collision' || r.kind === 'over-quota').length,
  }
}
