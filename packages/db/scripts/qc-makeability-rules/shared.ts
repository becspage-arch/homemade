/**
 * Makeability rules — shared helpers + generic checks.
 *
 * This is the STRICT per-type gate layered on top of the older
 * `qc-completeness-rules`. Where completeness asked "is this a real, non-broken
 * body?", makeability asks the harder question: "could a competent person
 * actually MAKE this from what is on the page?" A cross-stitch pattern with no
 * chart is a real body and a fake pattern — completeness passed it, makeability
 * fails it.
 *
 * Every check is BINARY (block or skip) per the locked no-warning-tiers rule.
 * A row either passes every applicable rule and may publish, or it fails and is
 * un-published to DRAFT with the reasons recorded in `Tutorial.qcBlockReason`.
 *
 * Every function here is PURE (no Prisma, no fs). The audit/un-publish/publish
 * call sites load the row + its linked craft-pattern rows, fold the chart
 * facts into `MakeabilityContext.chart`, and hand the pure context in.
 *
 * INTERPRETATION NOTE — "numbered steps". The brief asks recipes/techniques to
 * have "numbered steps". The locked voice spec (Mary Berry / Erin Boyle /
 * Barbara O'Neill) writes method as action-verb-led PROSE under a Method
 * heading, not as a literal numbered list. A clear action sequence is makeable
 * whether rendered as an orderedList, "Step N" headings, or imperative prose.
 * So `hasActionableSteps` accepts all three. Demanding a literal <ol> would
 * contradict the voice spec and un-publish thousands of makeable recipes; that
 * is not the intent of the brief, whose intent is makeability.
 */

// ─── Types ────────────────────────────────────────────────────────────────

export interface ChartFacts {
  /** Tutorial.chartDefinition is non-null. */
  tutorialChartDefinition: boolean
  /** Linked CrochetPattern.chartData is non-null. */
  crochetChartData: boolean
  /** Linked KnittingPattern.chartData is non-null. */
  knittingChartData: boolean
  /** Linked NeedleworkPattern.chartData is non-null. */
  needleworkChartData: boolean
  /** Linked cross-stitch Pattern.data present AND has at least one stitch. */
  crossStitchChart: boolean
  /** A chart-rendering body node (patternInset/craftChart/...) resolves to a
   *  Pattern row whose data has at least one symbol/cell. */
  insetChartWithSymbols: boolean
  /** Any chart-rendering body node is present at all (even if data thin). */
  hasChartNode: boolean
}

export interface MakeabilityContext {
  slug: string
  title: string
  categorySlug: string
  subCategorySlug: string | null
  type: string
  body: unknown
  // Recipe / timing metadata
  servings: number | null
  yieldDescription: string | null
  totalMinutes: number | null
  timeMinutes: number | null
  prepMinutes: number | null
  cookMinutes: number | null
  // Pattern metadata
  gaugeText: string | null
  finishedSizeText: string | null
  // Mindset
  practiceType: string | null
  // Reference / safety
  requiresMedicalDisclaimer: boolean
  sourceNotes: string | null
  // Designer attribution for cross-stitch (linked Pattern.designerId present).
  hasDesigner: boolean
  // Folded chart facts (computed by the caller from linked pattern rows).
  chart: ChartFacts
}

export interface MakeabilityResult {
  ok: boolean
  reasons: string[]
  /** Rule ids that fired, parallel to reasons. */
  rules: string[]
}

export type AuditFn = (ctx: MakeabilityContext) => MakeabilityResult

// ─── Body walking ───────────────────────────────────────────────────────────

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  content?: unknown[]
  text?: string
}

/** Flatten every text leaf + structured-card text in a body to one string.
 *  Pulls suppliesCard / ingredientsList item labels + values, infoPanel body,
 *  and troubleshooter rows so prose buried in cards still counts. */
export function bodyText(body: unknown): string {
  const out: string[] = []
  const pushAttrStrings = (attrs: Record<string, unknown>): void => {
    for (const key of ['body', 'heading', 'label', 'value', 'name', 'qty', 'note', 'question', 'answer', 'prepNote', 'title']) {
      if (typeof attrs[key] === 'string') out.push(attrs[key] as string)
    }
    for (const key of ['items', 'rows', 'supplies']) {
      if (Array.isArray(attrs[key])) {
        for (const it of attrs[key] as unknown[]) {
          if (it && typeof it === 'object') pushAttrStrings(it as Record<string, unknown>)
        }
      }
    }
  }
  const walk = (n: unknown): void => {
    if (!n || typeof n !== 'object') return
    const node = n as TipTapNode
    if (typeof node.text === 'string') out.push(node.text)
    if (node.attrs) pushAttrStrings(node.attrs)
    if (Array.isArray(node.content)) for (const c of node.content) walk(c)
  }
  walk(body)
  return out.join(' ')
}

/** Text from text leaves ONLY (excludes structured-card attrs). Used for the
 *  < 200 chars body-length rule so a body that is all empty cards reads short. */
export function proseText(body: unknown): string {
  const out: string[] = []
  const walk = (n: unknown): void => {
    if (!n || typeof n !== 'object') return
    const node = n as TipTapNode
    if (typeof node.text === 'string') out.push(node.text)
    if (node.attrs && typeof node.attrs.body === 'string') out.push(node.attrs.body as string)
    if (Array.isArray(node.content)) for (const c of node.content) walk(c)
  }
  walk(body)
  return out.join(' ')
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

export function hasNodeType(body: unknown, type: string): boolean {
  return countNodeType(body, type) > 0
}

export function countNodeType(body: unknown, type: string): number {
  let n = 0
  const walk = (x: unknown): void => {
    if (!x || typeof x !== 'object') return
    const node = x as TipTapNode
    if (node.type === type) n++
    if (Array.isArray(node.content)) for (const c of node.content) walk(c)
  }
  walk(body)
  return n
}

/** Rendered text of every heading node. */
export function headings(body: unknown): string[] {
  const out: string[] = []
  const txt = (n: TipTapNode): string =>
    typeof n.text === 'string' ? n.text : (n.content ?? []).map((c) => txt(c as TipTapNode)).join('')
  const walk = (x: unknown): void => {
    if (!x || typeof x !== 'object') return
    const node = x as TipTapNode
    if (node.type === 'heading') out.push(txt(node))
    if (Array.isArray(node.content)) for (const c of node.content) walk(c)
  }
  walk(body)
  return out
}

/** Text of each block-level prose unit (paragraph + listItem), each kept
 *  SEPARATE. Crucial for step detection: heading text must not bleed into the
 *  next paragraph's first sentence, or an action verb that opens a paragraph
 *  ("Enter the coop...", "Hold the egg...") stops looking sentence-initial. */
export function segmentTexts(body: unknown): string[] {
  const out: string[] = []
  const txt = (n: TipTapNode): string =>
    typeof n.text === 'string' ? n.text : (n.content ?? []).map((c) => txt(c as TipTapNode)).join(' ')
  const walk = (x: unknown): void => {
    if (!x || typeof x !== 'object') return
    const node = x as TipTapNode
    if (node.type === 'paragraph' || node.type === 'listItem') {
      const t = txt(node).trim()
      if (t) out.push(t)
      return // don't double-count nested paragraphs inside a listItem
    }
    if (Array.isArray(node.content)) for (const c of node.content) walk(c)
  }
  walk(body)
  return out
}

/** Text of every listItem (ordered or bullet). */
export function listItemTexts(body: unknown): string[] {
  const out: string[] = []
  const txt = (n: TipTapNode): string =>
    typeof n.text === 'string' ? n.text : (n.content ?? []).map((c) => txt(c as TipTapNode)).join(' ')
  const walk = (x: unknown): void => {
    if (!x || typeof x !== 'object') return
    const node = x as TipTapNode
    if (node.type === 'listItem') out.push(txt(node).trim())
    if (Array.isArray(node.content)) for (const c of node.content) walk(c)
  }
  walk(body)
  return out
}

// ─── Step / method detection ──────────────────────────────────────────────

const METHOD_HEADING_RE =
  /method|how to|how it works|steps?|instructions|directions|preparing|preparation|making|making the|assembly|assembl|construction|sewing|stitch|technique|build|process|what to do|working\b|the work|cast on|the practice|dosing|using|the move|stroke order|letter group|forming|shaping|carving|rooting|sowing|blend|blanch|the oval|the ring|the lighting|the moves/i

export function hasMethodHeading(body: unknown): boolean {
  return headings(body).some((h) => METHOD_HEADING_RE.test(h))
}

/** A numbered-step structure: an orderedList with >= 2 items, or >= 2 headings
 *  that begin with "1." / "Step 1" / "Round 1" / "Row 1". */
export function hasNumberedStructure(body: unknown): boolean {
  const ol = countNodeType(body, 'orderedList')
  if (ol >= 1) {
    // an orderedList with at least 2 items
    const items = listItemTexts(body).filter(Boolean).length
    if (items >= 2) return true
  }
  const numberedHeads = headings(body).filter((h) =>
    /^\s*(step\s*)?\d+\b|^\s*(round|rnd|row)\s*\d+/i.test(h),
  ).length
  return numberedHeads >= 2
}

const STEP_IMPERATIVES = new Set<string>([
  'steep', 'strain', 'apply', 'mix', 'pour', 'heat', 'cool', 'stir', 'bring',
  'cover', 'boil', 'simmer', 'bake', 'place', 'set', 'leave', 'transfer',
  'fold', 'knead', 'roll', 'cut', 'brush', 'season', 'sprinkle', 'top',
  'drain', 'blend', 'whisk', 'beat', 'add', 'remove', 'press', 'rub', 'sew',
  'spread', 'chill', 'rest', 'warm', 'reduce', 'taste', 'soak', 'wash',
  'rinse', 'pat', 'discard', 'spoon', 'ladle', 'serve', 'garnish', 'shape',
  'divide', 'arrange', 'attach', 'fasten', 'work', 'turn', 'repeat', 'cast',
  'pin', 'tack', 'glue', 'sand', 'paint', 'drill', 'screw', 'measure', 'mark',
  'plant', 'sow', 'water', 'prune', 'harvest', 'feed', 'dig', 'wrap', 'tie',
  'line', 'grease', 'preheat', 'whip', 'sift', 'thread', 'knot', 'hold',
  'open', 'pinch', 'smooth', 'fill', 'find', 'mount', 'begin', 'start',
  'select', 'rough', 'refine', 'chamfer', 'dry', 'weigh', 'melt', 'test',
  'draw', 'score', 'slip', 'join', 'fasten', 'block', 'steam', 'count',
  'lift', 'tap', 'flip', 'wind', 'loop', 'hook', 'insert', 'pull', 'push',
  'snip', 'trim', 'dampen', 'wedge', 'centre', 'center', 'carve', 'split',
  'crack', 'note', 'check', 'use', 'take', 'make', 'put', 'lay', 'tip',
  // cooking / craft / calligraphy / fibre verbs that real method prose uses
  'combine', 'blitz', 'process', 'pulse', 'whizz', 'whisk', 'practise',
  'practice', 'rule', 'enter', 'curve', 'branch', 'release', 'ease', 'build',
  'form', 'trace', 'sketch', 'outline', 'load', 'advance', 'peel', 'doff',
  'assemble', 'position', 'align', 'secure', 'clamp', 'embroider', 'felt',
  'card', 'spin', 'ply', 'warp', 'weave', 'crochet', 'knit', 'purl', 'chain',
  'baste', 'grill', 'roast', 'fry', 'saute', 'sauté', 'deglaze', 'caramelise',
  'caramelize', 'glaze', 'dust', 'coat', 'dip', 'dollop', 'scatter', 'layer',
  'dissolve', 'whip', 'temper', 'prove', 'knock', 'shape', 'score',
  'sow', 'transplant', 'pot', 'repot', 'mulch', 'fertilise', 'thin', 'stake',
  'apply', 'massage', 'smear', 'paint', 'seal', 'prime', 'gather', 'pierce',
  'fold', 'crease', 'burnish', 'emboss', 'punch', 'bind', 'glue', 'clip',
  // DIY / install / repair / husbandry / general procedural verbs
  'drive', 'connect', 'pick', 'test', 'choose', 'stand', 'run', 'give',
  'fit', 'install', 'wire', 'level', 'plumb', 'tighten', 'loosen', 'undo',
  'unscrew', 'lower', 'raise', 'slide', 'fasten', 'unfasten', 'lock', 'unlock',
  'look', 'listen', 'watch', 'observe', 'record', 'log', 'monitor', 'inspect',
  'examine', 'handle', 'grip', 'grasp', 'carry', 'herd', 'approach', 'exit',
  'close', 'shut', 'feed', 'worm', 'dose', 'inject', 'treat', 'candle',
  'incubate', 'wait', 'empty', 'scrub', 'wipe', 'hang', 'space', 'switch',
  'flip', 'fill', 'plug', 'unplug', 'replace', 'fix', 'repair', 'collect',
  'separate', 'clean', 'clear', 'avoid', 'ensure', 'aim', 'select', 'identify',
  'calculate', 'weigh', 'count', 'mark', 'label', 'store', 'cool', 'reheat',
  'cut', 'trim', 'snip', 'sand', 'file', 'smooth', 'oil', 'wax', 'buff',
  'strip', 'fill', 'prep', 'mask', 'wrap', 'tape', 'clip', 'tuck', 'pour',
])

function firstWordLower(s: string): string {
  const m = s.trim().match(/^[A-Za-z][A-Za-z'-]*/)
  return m ? m[0].toLowerCase() : ''
}

/** Count action-verb-led units across the body. A "unit" is a sentence inside a
 *  block segment (paragraph / list item) — so an action verb that OPENS a
 *  paragraph counts even when the previous block was a heading. */
export function actionVerbSentenceCount(body: unknown): number {
  let n = 0
  for (const seg of segmentTexts(body)) {
    for (const s of seg.split(/(?<=[.!?])\s+/)) {
      if (STEP_IMPERATIVES.has(firstWordLower(s))) n++
    }
  }
  return n
}

/** A run of >= 3 short imperative sentences (prose-style steps), evaluated
 *  per block segment so heading text never breaks or fakes a run. */
export function hasImperativeStepRun(body: unknown): boolean {
  for (const seg of segmentTexts(body)) {
    let run = 0
    for (const s of seg.split(/(?<=[.!?])\s+/)) {
      const wc = s.split(/\s+/).filter(Boolean).length
      if (STEP_IMPERATIVES.has(firstWordLower(s)) && wc <= 16) {
        run++
        if (run >= 3) return true
      } else {
        run = 0
      }
    }
  }
  return false
}

/**
 * The makeability bar for "this explains how to do it": a numbered structure,
 * OR a method/steps heading WITH action verbs, OR several action-verb-led
 * segments anywhere (procedures written under descriptive headings —
 * "Catching at night", "Day 7 candling" — rather than a single Method block).
 * Prose method counts (see interpretation note).
 */
export function hasActionableSteps(ctx: MakeabilityContext): boolean {
  if (hasNumberedStructure(ctx.body)) return true
  const verbs = actionVerbSentenceCount(ctx.body)
  if (hasMethodHeading(ctx.body) && verbs >= 2) return true
  if (hasImperativeStepRun(ctx.body)) return true
  // Procedures under descriptive section headings: several action-verb-led
  // segments are themselves the steps even with no "Method" heading.
  if (verbs >= 4) return true
  return false
}

// ─── Materials detection ──────────────────────────────────────────────────

const MATERIALS_HEADING_RE =
  /what you(?:'ll| will)? need|you will need|ingredients|materials|tools|supplies|stitches used|what fuels|what you need/i

/** A materials / tools / ingredients list is present, as a structured card or
 *  a materials-style heading. */
export function hasMaterials(body: unknown): boolean {
  if (hasNodeType(body, 'suppliesCard')) return true
  if (hasNodeType(body, 'ingredientsList')) return true
  if (headings(body).some((h) => MATERIALS_HEADING_RE.test(h))) return true
  return false
}

// ─── Recipe predicates ──────────────────────────────────────────────────────

interface IngredientRow { amount?: unknown; unit?: unknown; name?: unknown }

export function ingredientItems(body: unknown): IngredientRow[] {
  const out: IngredientRow[] = []
  const walk = (n: unknown): void => {
    if (!n || typeof n !== 'object') return
    const node = n as TipTapNode
    if (node.type === 'ingredientsList' && Array.isArray(node.attrs?.items)) {
      for (const it of node.attrs!.items as unknown[]) {
        if (it && typeof it === 'object') out.push(it as IngredientRow)
      }
    }
    if (Array.isArray(node.content)) for (const c of node.content) walk(c)
  }
  walk(body)
  return out
}

/** Ingredients present AND at least one carries a quantity. The amount field is
 *  a number on cooking/baking rows but a STRING on many remedy/natural-home
 *  rows ("1-2", "200") — both count, as does a unit-only row with a numeric
 *  string. Unit-less rows ("2 eggs", "salt to taste") are legitimate, so we do
 *  not require a unit on every row, only that quantities actually appear. */
export function hasQuantifiedIngredients(body: unknown): boolean {
  const items = ingredientItems(body)
  if (items.length === 0) return false
  const quantified = (i: IngredientRow): boolean => {
    if (typeof i.amount === 'number') return i.amount > 0
    if (typeof i.amount === 'string') return /\d/.test(i.amount)
    return false
  }
  return items.some(quantified)
}

/** Materials present in any usable form: a structured card, a materials-style
 *  heading, OR (for prose-led pages) at least two quantity / measurement tokens
 *  in the body, which every real materials spec carries. Deliberately generous:
 *  a makeable page that names its materials inline is not "missing" them. */
export function hasMaterialsGenerous(ctx: MakeabilityContext): boolean {
  if (hasMaterials(ctx.body)) return true
  if (ctx.gaugeText && ctx.gaugeText.trim().length > 0) return true
  const text = bodyText(ctx.body)
  const tokens = text.match(/\b\d+(?:\.\d+)?\s*(?:mm|cm|m\b|metres?|g\b|grams?|kg|ml|l\b|litres?|tsp|tbsp|gsm|count|ply|oz|inch(?:es)?|in\b|")/gi)
  return (tokens?.length ?? 0) >= 2
}

export function hasYield(ctx: MakeabilityContext, text: string): boolean {
  if (ctx.servings != null && ctx.servings > 0) return true
  if (ctx.yieldDescription && ctx.yieldDescription.trim().length > 0) return true
  return /\b(makes|serves|yields?|enough for)\s+(about\s+|approx\.?\s+|around\s+)?\d+/i.test(text) ||
    /\b\d+\s+(servings?|portions?|jars?|loaves|loaf|scones?|biscuits?|cookies|muffins?|slices?|pieces?|cups?|ml|litres?|g\b)/i.test(text)
}

export function hasTiming(ctx: MakeabilityContext, text: string): boolean {
  if ((ctx.totalMinutes ?? 0) > 0 || (ctx.timeMinutes ?? 0) > 0) return true
  if ((ctx.prepMinutes ?? 0) > 0 || (ctx.cookMinutes ?? 0) > 0) return true
  return /\b\d+\s*(?:to\s*\d+\s*)?(?:min(?:ute)?s?|hours?|hrs?|hr\b)/i.test(text) ||
    /\b(?:overnight|\d+\s*(?:days?|weeks?))\b/i.test(text)
}

// ─── Textile / pattern predicates ───────────────────────────────────────────

export function hasRowRound(text: string): boolean {
  return /\b(Row|Round|Rnd|Rows|Rounds)\s*\d+/i.test(text)
}

/** A positive integer cast-on / foundation / stitch count appears. Broad on
 *  purpose: covers chain starts ("ch 24"), cast-on counts, "(40 sts)" round
 *  notation, amigurumi stitch counts ("6 sc", "12 dc"), and magic-ring starts
 *  (which have no foundation chain by design). Catches broken NaN/0 starts via
 *  the separate hasBrokenFoundation check. */
export function hasFoundationCount(text: string): boolean {
  if (/\b(cast[- ]?on|chain|ch|foundation)\b[^.]{0,40}?\b\d+\b/i.test(text)) return true
  if (/\b\d+\s*(?:stitches|sts?|chains?|ch|sc|dc|hdc|tr|dtr|dc|tch|loops?|trebles?|rows?|rounds?)\b/i.test(text)) return true
  if (/\(\s*\d+\s*(?:sts?|stitches|sc|dc|hdc|tr)\s*\)/i.test(text)) return true
  if (/\bmagic (?:ring|loop|circle)|adjustable (?:ring|loop)\b/i.test(text)) return true
  return false
}

export function hasBrokenFoundation(text: string): boolean {
  return /\b(?:cast[- ]?on|ch(?:ain)?|co)\s*(?:NaN|undefined|0)\b/i.test(text)
}

/** The 2026-06-15 truncation signature: "... sp work." with no stitch group. */
export function hasTruncatedStitchInstruction(text: string): boolean {
  return /\bsp,?\s+work\s*(?:[.*;)\]]|$)/im.test(text)
}

export function hasGauge(ctx: MakeabilityContext): boolean {
  if (ctx.gaugeText && ctx.gaugeText.trim().length > 0) return true
  return headings(ctx.body).some((h) => /gauge|tension/i.test(h)) ||
    /\bgauge\b|\btension\b/i.test(bodyText(ctx.body))
}

export const COUNTED_NEEDLEWORK = new Set([
  'blackwork', 'needlepoint', 'hardanger', 'sashiko', 'cross-stitch', 'counted-cross-stitch',
])

// ─── Generic mechanical checks (run on every type) ──────────────────────────

const PLACEHOLDER_RE = new RegExp(
  [
    'instructions?\\s+(?:for\\s+[^.]{0,90}?\\s+)?(?:go|goes|will\\s+go)\\s+here',
    'instructions?\\s+will\\s+be\\s+(?:added|written|provided)',
    '\\b(?:content|details|description|text|full\\s+method|step[- ]by[- ]step\\s+instructions?)\\s+(?:goes?|will\\s+go)\\s+here',
    'lorem ipsum',
    'to be (?:filled|written|added|completed|determined)',
    '\\bTODO\\b', '\\bTBD\\b', '\\bFIXME\\b',
  ].join('|'),
  'i',
)

const BANNED_PHRASES: { re: RegExp; label: string }[] = [
  { re: /\bperfect for\b/i, label: 'perfect for' },
  { re: /\bideal for\b/i, label: 'ideal for' },
  { re: /\bfine for almost everyone\b/i, label: 'fine for almost everyone' },
  { re: /\bhonest(ly)?\b/i, label: 'honest/honestly' },
  { re: /\bfrankly\b/i, label: 'frankly' },
  { re: /\bgenuinely\b/i, label: 'genuinely' },
]

const MIN_PROSE_CHARS = 200

/** Has any text leaf that is missing `type: "text"` (silently dropped by the
 *  public renderer — see feedback_tiptap_text_node_type). */
export function hasUntypedTextNode(body: unknown): boolean {
  let bad = false
  const walk = (n: unknown): void => {
    if (bad || !n || typeof n !== 'object') return
    const node = n as TipTapNode
    if (typeof node.text === 'string' && node.type !== 'text') { bad = true; return }
    if (Array.isArray(node.content)) for (const c of node.content) walk(c)
  }
  walk(body)
  return bad
}

/** glossaryTooltip marks must carry `termSlug` (not `slug`) or the public
 *  renderer + voice-check treat the term as uncovered. */
export function hasBadGlossaryMark(body: unknown): boolean {
  let bad = false
  const walk = (n: unknown): void => {
    if (bad || !n || typeof n !== 'object') return
    const node = n as TipTapNode & { marks?: unknown[] }
    if (Array.isArray(node.marks)) {
      for (const m of node.marks) {
        const mark = m as { type?: string; attrs?: Record<string, unknown> }
        if (mark?.type === 'glossaryTooltip') {
          const a = mark.attrs ?? {}
          if (typeof a.termSlug !== 'string' || !(a.termSlug as string).trim()) { bad = true; return }
        }
      }
    }
    if (Array.isArray(node.content)) for (const c of node.content) walk(c)
  }
  walk(body)
  return bad
}

/**
 * Generic checks that fire on every type. Returns parallel reasons + rules.
 * These are the hard, mechanical "this content is broken or off-voice" signals;
 * the per-type rules add the structural makeability bar on top.
 */
export function genericChecks(ctx: MakeabilityContext): { reasons: string[]; rules: string[] } {
  const reasons: string[] = []
  const rules: string[] = []
  const push = (rule: string, reason: string) => { rules.push(rule); reasons.push(reason) }

  const text = bodyText(ctx.body)
  const prose = proseText(ctx.body).trim()

  if (prose.length === 0) {
    push('generic:empty-body', 'body is empty')
    return { reasons, rules }
  }
  if (prose.length < MIN_PROSE_CHARS) {
    push('generic:body-too-short', `body has only ${prose.length} characters of prose (< ${MIN_PROSE_CHARS})`)
  }
  if (/\bNaN\b/.test(text)) push('generic:nan', 'contains "NaN" (a number failed to compute)')
  if (/(?<![A-Za-z])undefined(?![A-Za-z])/.test(text)) push('generic:undefined', 'contains "undefined"')
  if (/(?<![\w$])\[\]|(?<![\w$])\{\}/.test(text)) push('generic:empty-literal', 'contains a leaked "[]" or "{}" literal')
  if (PLACEHOLDER_RE.test(text)) push('generic:placeholder', 'contains an unfilled placeholder phrase')
  // Voice nits (em/en dash, banned phrasing) are tagged `voice:` so the
  // un-publish pass can FLAG them for an in-place fix without removing an
  // otherwise-makeable page from the site (locked: don't over-prune).
  if (/[—]/.test(text)) push('voice:em-dash', 'contains an em dash (—)')
  if (/[–]/.test(text)) push('voice:en-dash', 'contains an en dash (–)')
  for (const b of BANNED_PHRASES) {
    if (b.re.test(text)) push('voice:banned-phrase', `contains banned phrasing: "${b.label}"`)
  }
  if (hasUntypedTextNode(ctx.body)) push('generic:untyped-text-node', 'has a text leaf missing type:"text" (renderer drops it)')
  // NOTE: glossaryTooltip coverage is intentionally NOT re-checked here.
  // Production marks reference the term by `termId` (verified against live
  // data), not `termSlug`; glossary coverage is already enforced by the
  // upload-time voice gate. Re-adjudicating it here is out of scope for the
  // makeability gate and produced only false positives.

  return { reasons, rules }
}

/**
 * Compose a per-type result from generic checks + the type-specific reasons.
 *
 * `typeReasons` are BLOCKING (a genuine makeability gap -> un-publish).
 * `flagReasons` are tagged `flag:<rule>` and do NOT un-publish — they mark a
 * makeable page worth improving (e.g. a journal practice with no stated
 * duration). The audit reports them separately, like the `voice:` nits.
 */
export function compose(
  ctx: MakeabilityContext,
  typeRule: string,
  typeReasons: string[],
  flagReasons: string[] = [],
): MakeabilityResult {
  const generic = genericChecks(ctx)
  const reasons = [...generic.reasons, ...typeReasons, ...flagReasons]
  const rules = [
    ...generic.rules,
    ...typeReasons.map(() => typeRule),
    ...flagReasons.map(() => `flag:${typeRule}`),
  ]
  return { ok: reasons.length === 0, reasons, rules }
}
