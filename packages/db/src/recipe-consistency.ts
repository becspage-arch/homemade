/**
 * Recipe ingredient ↔ method consistency — pure, dependency-free helpers.
 *
 * Lives in `@homemade/db` (no Prisma, no IO) so the same logic backs every
 * consumer: the admin publish gate (apps/web), the script completeness gate
 * (qc-completeness-rules), and the catalogue scan. A recipe's ingredientsList
 * block and its method are authored separately with nothing forcing them to
 * agree; this module finds the high-precision disagreement — a measured
 * ingredient named in a STEP that the list omits, so a reader can't shop for it.
 *
 * The signal is deliberately narrow for a BINARY gate (no warning tier): a
 * numeric food quantity in a step ("Place 120g raisins…", "stir in 2 tbsp
 * honey") naming something absent from every listed line. That pattern almost
 * never fires on serving asides ("serve with bread"), texture notes ("resembles
 * coarse breadcrumbs"), or blind-baking kit ("fill with baking beans"), which is
 * what makes it safe to block a publish on.
 */

// ─── Text normalisation ───────────────────────────────────────────────────────
export function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics: gruyère → gruyere, crème → creme
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** Singularise a trailing plural for word-level comparison (cheap heuristic). */
export function normWord(w: string): string {
  const x = norm(w)
  if (x.endsWith('ies') && x.length > 4) return `${x.slice(0, -3)}y`
  if (x.endsWith('es') && x.length > 4) return x.slice(0, -2)
  if (x.endsWith('s') && x.length > 3) return x.slice(0, -1)
  return x
}

const WORD_STOP = new Set<string>([
  'the', 'and', 'for', 'with', 'of', 'or', 'plus', 'fresh', 'dried', 'whole',
  'free', 'range', 'large', 'small', 'medium', 'good', 'quality', 'extra',
  'a', 'an', 'to', 'in', 'into', 'your',
])

/** Significant (>=3 char, non-stopword), singularised words of some phrases.
 *  3 letters is deliberate so short ingredient names — jam, egg, oil, rum, tea,
 *  soy, ham, pea — still provide coverage ("Raspberry jam" covers "jam"). */
export function significantWords(phrases: string[]): string[] {
  const out = new Set<string>()
  for (const p of phrases) {
    for (const raw of norm(p).split(/[^a-z]+/)) {
      if (raw.length >= 3 && !WORD_STOP.has(raw)) out.add(normWord(raw))
    }
  }
  return [...out]
}

// ─── TipTap body walking ──────────────────────────────────────────────────────
interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  content?: unknown[]
  text?: string
}

export function nodeText(node: unknown): string {
  const out: string[] = []
  const walk = (n: unknown): void => {
    if (!n || typeof n !== 'object') return
    const x = n as TipTapNode
    if (typeof x.text === 'string') out.push(x.text)
    if (x.attrs && typeof x.attrs.body === 'string') out.push(x.attrs.body as string)
    if (Array.isArray(x.content)) for (const c of x.content) walk(c)
  }
  walk(node)
  return out.join(' ')
}

// Mirrors recipeYieldsSteps' section model in qc-completeness-rules/shared.ts.
const METHOD_HEADING_RE =
  /\b(method|instructions?|directions?|steps|how to (make|do)|to make|preparation|prepare|assembly|what to do|the practice)\b/i

/**
 * Text of the actual cooking STEPS only: paragraphs/lists under a Method-type
 * h2 heading, plus any ordered list. Intro prose, "Variations", "To serve",
 * "Where this comes from", "Storage", "Notes" are excluded — an ingredient named
 * only in a serving aside or a variation is not a required shoppable line.
 */
export function stepText(body: unknown): string {
  const top =
    body && typeof body === 'object' && Array.isArray((body as TipTapNode).content)
      ? ((body as TipTapNode).content as TipTapNode[])
      : []
  const parts: string[] = []
  let inMethod = false
  for (const node of top) {
    if (!node || typeof node !== 'object') continue
    if (node.type === 'heading' && node.attrs?.level === 2) {
      inMethod = METHOD_HEADING_RE.test(nodeText(node))
      continue
    }
    if (node.type === 'heading') continue
    if (node.type === 'ingredientsList') continue
    if (inMethod) parts.push(nodeText(node))
    else if (node.type === 'orderedList') parts.push(nodeText(node))
  }
  return norm(parts.join(' '))
}

/** All prose outside the ingredientsList block (lenient — for the unused check). */
export function fullProseText(body: unknown): string {
  const out: string[] = []
  const walk = (n: unknown, inIng: boolean): void => {
    if (!n || typeof n !== 'object') return
    const node = n as TipTapNode
    const here = inIng || node.type === 'ingredientsList'
    if (!here) {
      if (typeof node.text === 'string') out.push(node.text)
      if (node.attrs && typeof node.attrs.body === 'string') out.push(node.attrs.body as string)
    }
    if (Array.isArray(node.content)) for (const c of node.content) walk(c, here)
  }
  walk(body, false)
  return norm(out.join(' '))
}

export interface ListedItem {
  ingredientId: string
  name: string
  prepNote: string | null
  groupLabel: string | null
}

/** Every ingredientsList item (linked + free-text rows). */
export function listedItems(body: unknown): ListedItem[] {
  const out: ListedItem[] = []
  const walk = (n: unknown): void => {
    if (!n || typeof n !== 'object') return
    const node = n as TipTapNode
    if (node.type === 'ingredientsList' && node.attrs) {
      const items = Array.isArray(node.attrs.items) ? node.attrs.items : []
      for (const raw of items) {
        if (!raw || typeof raw !== 'object') continue
        const r = raw as Record<string, unknown>
        out.push({
          ingredientId: typeof r.ingredientId === 'string' ? r.ingredientId : '',
          name: typeof r.name === 'string' ? r.name : '',
          prepNote: typeof r.prepNote === 'string' ? r.prepNote : null,
          groupLabel: typeof r.groupLabel === 'string' ? r.groupLabel : null,
        })
      }
    }
    if (Array.isArray(node.content)) for (const c of node.content) walk(c)
  }
  walk(body)
  return out
}

// ─── Quantity-prefixed candidate extraction ───────────────────────────────────
// Mass / volume / count units that reliably precede a FOOD noun. Time, length,
// and temperature units ("minutes", "cm", "°c") are deliberately excluded so
// "bake for 20 minutes" / "roll to 30cm" never look like an ingredient.
const FOOD_UNITS = [
  'g', 'kg', 'ml', 'l', 'litre', 'litres', 'tbsp', 'tbsps', 'tablespoon',
  'tablespoons', 'tsp', 'tsps', 'teaspoon', 'teaspoons', 'cup', 'cups', 'oz',
  'lb', 'lbs', 'pinch', 'pinches', 'handful', 'handfuls', 'knob', 'knobs',
  'sprig', 'sprigs', 'can', 'cans', 'tin', 'tins', 'slice', 'slices', 'sheet',
  'sheets', 'rasher', 'rashers', 'fillet', 'fillets', 'punnet', 'punnets',
  'bunch', 'bunches', 'splash', 'splashes', 'dash', 'dashes', 'drizzle',
]
const UNIT_CANON: Record<string, string> = {
  tablespoon: 'tbsp', tablespoons: 'tbsp', tbsps: 'tbsp',
  teaspoon: 'tsp', teaspoons: 'tsp', tsps: 'tsp',
  litre: 'l', litres: 'l', litres_: 'l', cups: 'cup',
}
const FRACTIONS: Record<string, number> = {
  '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3,
  '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
}
// Words that end a captured ingredient phrase: connectors, plus the imperative
// step verbs that typically follow the ingredient ("100ml water season…",
// "600g beef heart by removing…"). Stopping here keeps the phrase to the noun.
const PHRASE_STOP = new Set<string>([
  // connectors / determiners
  'in', 'into', 'a', 'an', 'the', 'and', 'to', 'for', 'over', 'under', 'until',
  'with', 'on', 'at', 'then', 'or', 'from', 'through', 'onto', 'off', 'plus',
  'but', 'if', 'so', 'about', 'around', 'per', 'each', 'of', 'your', 'its',
  'it', 'them', 'this', 'that', 'these', 'those', 'well', 'out', 'up', 'down',
  'evenly', 'together', 'gently', 'slowly', 'carefully', 'thoroughly', 'than',
  'while', 'when', 'once', 'before', 'after', 'by', 'total',
  // imperative step verbs
  'season', 'bring', 'add', 'stir', 'mix', 'pour', 'heat', 'cook', 'simmer',
  'boil', 'drain', 'remove', 'place', 'leave', 'blend', 'whisk', 'beat', 'fold',
  'knead', 'roll', 'chop', 'mash', 'combine', 'transfer', 'return', 'reduce',
  'sprinkle', 'spoon', 'divide', 'shape', 'press', 'brush', 'spread', 'cover',
  'soak', 'rinse', 'wash', 'discard', 'scatter', 'arrange', 'layer', 'drizzle',
  'dust', 'grease', 'line', 'preheat', 'melt', 'warm', 'chill', 'freeze',
  'refrigerate', 'bake', 'fry', 'grill', 'roast', 'steam', 'toss', 'taste',
  'serve', 'garnish', 'stand', 'prove', 'tip', 'scrape', 'fill', 'seal', 'wrap',
  'set', 'cut', 'cool', 'rest', 'push', 'dip', 'coat', 'score', 'prick',
  'pierce', 'dollop', 'swirl', 'whip', 'sieve', 'sift', 'grate', 'squeeze',
  'crack', 'crumble', 'dice', 'mince', 'trim', 'halve', 'quarter', 'separate',
  'dissolve', 'ladle', 'pipe', 'stuff', 'smear', 'glaze', 'rub', 'tuck', 'dot',
])

export interface QtyCandidate {
  amount: number | null
  unit: string | null
  /** Trimmed ingredient phrase that followed the quantity. */
  phrase: string
  index: number
  matchLen: number
}

function parseAmount(raw: string): number | null {
  const s = raw.trim()
  let m: RegExpMatchArray | null
  if ((m = s.match(/^(\d+)\s*([½¼¾⅓⅔⅛⅜⅝⅞])$/))) {
    const frac = FRACTIONS[m[2] ?? ''] ?? 0
    return parseInt(m[1] ?? '0', 10) + frac
  }
  if (FRACTIONS[s] != null) return FRACTIONS[s] as number
  if ((m = s.match(/^(\d+)\s*\/\s*(\d+)$/))) return parseInt(m[1] ?? '0', 10) / parseInt(m[2] ?? '1', 10)
  if ((m = s.match(/^(\d+(?:[.,]\d+)?)\s*(?:to|[-–])\s*\d+(?:[.,]\d+)?$/)))
    return parseFloat((m[1] ?? '0').replace(',', '.'))
  if (/^\d+(?:[.,]\d+)?$/.test(s)) return parseFloat(s.replace(',', '.'))
  return null
}

function trimPhrase(rawAfter: string): string {
  const cleaned = norm(rawAfter).replace(/^of\s+/, '')
  const words: string[] = []
  for (const w of cleaned.split(' ')) {
    const word = w.replace(/[^a-z'-]/g, '')
    if (!word) break
    if (PHRASE_STOP.has(word)) break
    words.push(word)
    if (words.length >= 4) break
  }
  return words.join(' ').trim()
}

const NUM = String.raw`(?:\d+(?:[.,]\d+)?|\d+\s*\/\s*\d+|\d*\s*[½¼¾⅓⅔⅛⅜⅝⅞])`
const UNIT_ALT = FOOD_UNITS.slice().sort((a, b) => b.length - a.length).join('|')
const QTY_RE = new RegExp(
  String.raw`(?<![a-z0-9])((?:${NUM})(?:\s*(?:to|[-–])\s*${NUM})?)\s*(${UNIT_ALT})(?![a-z])`,
  'gi',
)
// "a pinch of", "a knob of butter", "a handful of …"
const WORDED_RE = new RegExp(
  String.raw`(?<![a-z])(a|an)\s+(pinch|handful|knob|sprig|splash|dash|drizzle)\b`,
  'gi',
)

/**
 * Find quantity-prefixed ingredient candidates in step text. Each result is a
 * food quantity + the (trimmed) phrase that followed it.
 */
export function findQuantityCandidates(stepTextValue: string): QtyCandidate[] {
  const text = stepTextValue
  const out: QtyCandidate[] = []
  const push = (amount: number | null, unitRaw: string | null, matchEnd: number, start: number, len: number): void => {
    const after = text.slice(matchEnd, matchEnd + 60)
    const phrase = trimPhrase(after)
    if (!phrase) return
    const unit = unitRaw ? UNIT_CANON[unitRaw] ?? unitRaw : null
    out.push({ amount, unit, phrase, index: start, matchLen: len })
  }
  let m: RegExpExecArray | null
  QTY_RE.lastIndex = 0
  while ((m = QTY_RE.exec(text)) !== null) {
    push(parseAmount(m[1] ?? ''), m[2] ?? null, m.index + m[0].length, m.index, m[0].length)
  }
  WORDED_RE.lastIndex = 0
  while ((m = WORDED_RE.exec(text)) !== null) {
    push(null, m[2] ?? null, m.index + m[0].length, m.index, m[0].length)
  }
  return out
}

// ─── The binary gate (vocab-free) ─────────────────────────────────────────────
// True "to taste" staples + non-food heads we never treat as a shopping gap.
export const STAPLE_IGNORE = new Set<string>([
  'salt', 'pepper', 'water', 'black pepper', 'white pepper', 'ground black pepper',
  'table salt', 'sea salt', 'flaky sea salt', 'salt and pepper', 'cold water',
  'boiling water', 'warm water', 'iced water', 'hot water', 'ice', 'ice cubes',
])
// Heads that can follow a food-ish unit but are kit / texture / vague, not
// ingredients. Includes bakeware so "900g loaf tin" / "2 lb loaf" (a tin size)
// is never read as 900g of bread.
export const NON_INGREDIENT_HEAD = new Set<string>([
  'baking', 'parchment', 'paper', 'foil', 'film', 'clingfilm', 'string',
  'water', 'ice', 'mixture', 'batter', 'dough', 'mix', 'liquid', 'extra',
  'more', 'remaining', 'reserved', 'each', 'them', 'it',
  // bakeware / equipment
  'tin', 'tins', 'pan', 'pans', 'tray', 'trays', 'mould', 'moulds', 'mold',
  'molds', 'dish', 'dishes', 'sheet', 'sheets', 'ramekin', 'ramekins', 'case',
  'cases', 'board', 'boards', 'tube', 'tubes', 'springform', 'loaf', 'loaves',
  'log', 'logs', 'batch', 'batches', 'portion', 'portions', 'ball', 'balls',
  'bottle', 'bottles', 'jar', 'jars', 'container', 'containers', 'bar', 'bars',
  'spray', 'total', 'depth', 'thickness', 'square', 'circle', 'round', 'rounds',
])

export interface ConsistencyFinding {
  /** Quantity + phrase exactly as it appeared (for the failure message). */
  text: string
  phrase: string
  amount: number | null
  unit: string | null
  /** Index of the quantity match in the step text (for accurate snippets). */
  index: number
  matchLen: number
}

export interface GapOptions {
  /**
   * Vocab resolver: given a captured phrase, return the master Ingredient id it
   * names, or null if it isn't a known ingredient. STRONGLY recommended for the
   * gate: coverage is then checked by ingredient id against the listed lines'
   * ids, so a method that says "levain" / "ditalini" / "aniseed" is recognised
   * as covered by a listed "Sourdough starter" / "Small pasta shapes" / "Anise
   * seeds" line (synonyms the word-overlap check alone would miss). Phrases that
   * resolve to null are skipped, filtering non-food noise ("spray bottle").
   */
  resolveIngredientId?: (phrase: string) => string | null
  /**
   * Cheaper alternative to resolveIngredientId: just whether a phrase names a
   * real ingredient. Used by callers without an id map. Ignored when
   * resolveIngredientId is supplied.
   */
  isKnownIngredient?: (phrase: string) => boolean
}

/**
 * Returns the measured ingredients a recipe's steps use that no listed line
 * covers. Empty array = consistent (passes the gate). Pure + deterministic.
 *
 * Coverage is by significant-word overlap with the listed item NAMES (so
 * "300ml double cream" is covered by a "Double cream" line, and "lemon juice"
 * by a "Lemon" line), never by prep notes or group labels. The first word of
 * the phrase is the candidate ingredient; trailing words are trimmed at step
 * verbs, so the staple/equipment checks look at the phrase, not a stray verb.
 */
export function findMethodIngredientGaps(body: unknown, opts: GapOptions = {}): ConsistencyFinding[] {
  const listed = listedItems(body)
  const listedWords = new Set<string>()
  for (const l of listed) for (const w of significantWords([l.name])) listedWords.add(w)
  const listedIds = new Set(listed.map((l) => l.ingredientId).filter(Boolean))

  const steps = stepText(body)
  const findings: ConsistencyFinding[] = []
  const seen = new Set<string>()
  for (const c of findQuantityCandidates(steps)) {
    const phrase = c.phrase
    if (STAPLE_IGNORE.has(phrase)) continue
    const words = phrase.split(' ').filter(Boolean)
    const sig = significantWords([phrase])
    if (sig.length === 0) continue // no contentful word (e.g. "more", "each")
    // Any equipment / vague-noun word disqualifies the phrase — "250ml jam jar"
    // (a container) must not read as 250ml of jam.
    if (words.some((w) => NON_INGREDIENT_HEAD.has(normWord(w)))) continue
    // Covered when any significant word of the phrase appears in a listed name.
    if (sig.some((w) => listedWords.has(w))) continue
    // Vocab coverage: resolve the phrase to a master id and treat it as covered
    // when a listed line already links that id (alias-proof — "levain" ↔ a
    // listed "Sourdough starter"). A phrase that resolves to nothing is skipped.
    if (opts.resolveIngredientId) {
      const id = opts.resolveIngredientId(phrase)
      if (!id) continue
      if (listedIds.has(id)) continue
    } else if (opts.isKnownIngredient && !opts.isKnownIngredient(phrase)) {
      continue
    }
    if (seen.has(phrase)) continue
    seen.add(phrase)
    const qty = c.amount != null ? `${c.amount}${c.unit ?? ''} ` : ''
    findings.push({
      text: `${qty}${phrase}`.trim(), phrase, amount: c.amount, unit: c.unit,
      index: c.index, matchLen: c.matchLen,
    })
  }
  return findings
}

// ─── Master-vocab resolver (for the gate's id-coverage) ───────────────────────
// Ingredient names / aliases that are common English words or culinary false
// friends — excluded from the resolver so "garlic cloves" never resolves to the
// spice Cloves, "ribbon stage" to a ribbon pasta, etc. Most are also true
// staples we ignore anyway.
export const AMBIGUOUS = new Set<string>([
  'ribbon', 'ribbons', 'clove', 'cloves', 'chip', 'chips', 'crisp', 'crisps',
  'dough', 'ball', 'balls', 'preserve', 'preserves', 'preserved', 'conserve',
  'stock', 'round', 'rounds', 'spring', 'leaf', 'leaves', 'stick', 'sticks',
  'head', 'heads', 'ear', 'ears', 'heart', 'hearts', 'skin', 'core', 'ground',
  'fat', 'shell', 'shells', 'ice', 'kernel', 'kernels', 'water', 'salt',
  'pepper', 'oil', 'sugar', 'flour', 'butter', 'egg', 'eggs', 'milk', 'cream',
  'juice', 'zest', 'rind', 'peel', 'seed', 'seeds', 'wing', 'wings', 'breast',
  'thigh', 'thighs', 'leg', 'legs', 'baking beans', 'bread', 'loaf',
])

export interface MasterIngredientLite {
  id: string
  name: string
  pluralName?: string | null
  aliases: string[]
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Build a phrase → master-ingredient-id resolver from the Ingredient table.
 * Longest phrases match first ("dark chocolate" beats "chocolate"); ambiguous
 * single words are skipped. Returns null when a phrase names no known
 * ingredient. Shared by the gate and the catalogue scan so both agree.
 */
export function buildIngredientResolver(
  ingredients: MasterIngredientLite[],
): (phrase: string) => string | null {
  const index: Array<{ p: string; id: string; re: RegExp }> = []
  for (const ing of ingredients) {
    for (const raw of [ing.name, ing.pluralName ?? '', ...ing.aliases]) {
      const p = norm(raw)
      if (p.length < 3 || AMBIGUOUS.has(p)) continue
      index.push({ p, id: ing.id, re: new RegExp(`(?<![a-z])${escapeRe(p)}(?:e?s)?(?![a-z])`, 'i') })
    }
  }
  index.sort((a, b) => b.p.length - a.p.length)
  return (phrase: string): string | null => {
    const n = norm(phrase)
    for (const e of index) if (e.re.test(n)) return e.id
    return null
  }
}
