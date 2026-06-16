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

  // ── Cross-stitch / counted standalone-pattern facts ──────────────────────
  // Populated from the linked / standalone Pattern.data palette + grid for the
  // counted-discipline checklist sections (cross-stitch + counted needlework).
  // false on rows that carry no such data (e.g. a prose recipe).
  /** Every palette entry resolves a stitch key: symbol + brand + code + colour. */
  stitchKeyValid: boolean
  /** Fabric is specified on the chart (type + count). */
  fabricSpecified: boolean
  /** Grid carries real cell dimensions (so finished size / centre marks / needle
   *  / hoop all derive — these are render-time derivations of count + grid). */
  gridDimensions: boolean
  /** Backstitch is used on this pattern (flag column or backstitch segments). */
  backstitchUsed: boolean
  /** Backstitch segment data is present (the on-chart backstitch instructions). */
  backstitchData: boolean
  /** French knots are used on this pattern. */
  frenchKnotsUsed: boolean
  /** French knot placement data is present. */
  frenchKnotsData: boolean
}

/** A ChartFacts with every flag false. Spread + override the few that apply so
 *  callers never have to enumerate the whole shape. */
export const EMPTY_CHART_FACTS: ChartFacts = {
  tutorialChartDefinition: false,
  crochetChartData: false,
  knittingChartData: false,
  needleworkChartData: false,
  crossStitchChart: false,
  insetChartWithSymbols: false,
  hasChartNode: false,
  stitchKeyValid: false,
  fabricSpecified: false,
  gridDimensions: false,
  backstitchUsed: false,
  backstitchData: false,
  frenchKnotsUsed: false,
  frenchKnotsData: false,
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
  // Cross-craft difficulty (Difficulty enum or null)
  difficulty: string | null
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

// ─── Inline materials / tools detection (techniques + project patterns) ──────
// The locked don't-over-prune rule: techniques + project patterns routinely name
// their materials + tools INLINE in the steps ("dissolve shellac flakes in
// methylated spirit", "score with the bone folder against a metal ruler") rather
// than in a discrete heading. Such a page is fully makeable. So these detectors
// accept inline naming: a materials/tools heading OR a structured card OR the
// materials / tools named in the prose. They fire only when the body names
// NOTHING you need — the signature of a non-procedural page mis-typed as a how-to.

const QUANTITY_TOKEN_RE =
  /\b\d+(?:\.\d+)?\s*(?:mm|cm|m\b|metres?|g\b|grams?|kg|ml|l\b|litres?|tsp|tbsp|gsm|grit|count|ply|oz|inch(?:es)?|in\b|"|sheets?|lengths?|pieces?|parts?|coats?|°)/gi
const TOOL_NOUN_RE =
  /\b(tin|tins|bowl|pan|saucepan|skillet|tray|sheet|dish|whisk|spatula|spoon|sieve|colander|grater|peeler|knife|board|rolling pin|processor|blender|mixer|oven|hob|grill|thermometer|tongs|ladle|scales|cutter|drill|saw|hammer|screwdriver|chisel|plane|sander|file|clamp|spanner|wrench|pliers|scissors|brush|roller|trowel|level|tape measure|square|mallet|gouge|lathe|kiln|wheel|needle|awl|punch|glue gun|machine|iron|pins?|stylus|bone folder|ruler|pencil|cloth|rag|rubber|hook|dibber|fork|spade|secateurs|pruners?|hands?)\b/i
const MATERIAL_NOUN_RE =
  /\b(shellac|wax|beeswax|varnish|oil|paint|primer|glue|pva|adhesive|tape|thread|yarn|wool|floss|fabric|calico|linen|cotton|felt|clay|earthenware|stoneware|porcelain|wire|screws?|nails?|timber|wood|board|paper|card|cartridge|glaze|slip|resin|epoxy|filler|sealant|solder|flux|mortar|grout|cement|sand|compost|seed|flour|sugar|butter|stock|spirit|methylated|turpentine|vinegar|bicarb|borax|soda|vinegar|essential oil)\b/i

export function hasQuantityTokens(text: string, n = 2): boolean {
  return (text.match(QUANTITY_TOKEN_RE)?.length ?? 0) >= n
}

/** Materials are present in any usable form: a structured card / heading, OR
 *  named inline (material nouns), OR quantified (>= 2 measurement tokens). */
export function namesMaterials(ctx: MakeabilityContext, text: string): boolean {
  if (hasMaterials(ctx.body)) return true
  if (hasQuantityTokens(text, 2)) return true
  return MATERIAL_NOUN_RE.test(text)
}

/** Tools are present: a tools heading, OR a tool noun named anywhere. */
export function namesTools(ctx: MakeabilityContext, text: string): boolean {
  if (headings(ctx.body).some((h) => /tools|equipment|what you(?:'ll| will)? need|you will need|kit|supplies/i.test(h))) return true
  return TOOL_NOUN_RE.test(text)
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

// ─── Recipe / method hard predicates ─────────────────────────────────────────

/** A clear, ordered METHOD SEQUENCE exists (the "numbered method steps" item).
 *  An orderedList, "Step N" / "Round N" / "Row N" numbered headings, OR an
 *  action-verb-led sequence under a method heading — the locked prose-method
 *  interpretation (Mary Berry voice writes ordered prose, not an <ol>). This is
 *  stricter than scattered verbs: it requires a heading-anchored or list-anchored
 *  sequence, not just N imperative sentences anywhere on the page. */
export function hasOrderedMethod(ctx: MakeabilityContext): boolean {
  if (hasNumberedStructure(ctx.body)) return true
  if (hasMethodHeading(ctx.body) && actionVerbSentenceCount(ctx.body) >= 2) return true
  if (hasImperativeStepRun(ctx.body)) return true
  return false
}

/** Every ingredient row carries a usable amount. The autopilot bug shipped rows
 *  with a null amount AND a MEASURED unit ("null tbsp soy sauce") — a genuine
 *  gap. A null amount with a SELF-QUANTIFYING unit ("a pinch", "a sprig", "a
 *  splash") or a qualitative name ("salt, to taste") is a valid culinary amount,
 *  not a gap. So the rule fails a missing amount only when the unit is a
 *  measured one (g / ml / tbsp / tsp / cup / each / clove …) that NEEDS a count. */
const QUALITATIVE_AMOUNT_RE =
  /to taste|to serve|to garnish|to finish|for (?:greasing|dusting|brushing|frying|drizzling|sprinkling|the tin)|as needed|a pinch|optional|to decorate/i
// Units that are themselves an amount — a "pinch" / "splash" needs no number.
const QUALITATIVE_UNIT_RE =
  /^(?:pinch|sprig|sprigs|handful|splash|drizzle|knob|dash|grind|grinds|glug|squeeze|to taste|few|some|sprinkle)$/i
// Units that REQUIRE a number — "tbsp" / "g" / "each" are meaningless without one.
const MEASURED_UNIT_RE =
  /^(?:g|kg|gram|grams|ml|l|litre|litres|millilitre|millilitres|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|cup|cups|oz|lb|each|clove|cloves|slice|slices|can|cans|tin|tins|sheet|sheets|stick|sticks|stalk|stalks|rasher|rashers|fillet|fillets|bunch|bunches|head|heads)$/i

export function ingredientNames(body: unknown): string[] {
  return ingredientItems(body)
    .map((i) => (typeof i.name === 'string' ? i.name.trim() : ''))
    .filter(Boolean)
}

export function hasMissingIngredientAmount(body: unknown): boolean {
  for (const it of ingredientItems(body)) {
    const name = typeof it.name === 'string' ? it.name : ''
    const unit = typeof it.unit === 'string' ? it.unit.trim() : ''
    const amountOk =
      (typeof it.amount === 'number' && Number.isFinite(it.amount) && it.amount > 0) ||
      (typeof it.amount === 'string' && /\d/.test(it.amount))
    if (amountOk) continue
    // No numeric amount. Allowed when the name OR the unit expresses a
    // qualitative quantity ("a pinch of salt"). A missing amount on a MEASURED
    // unit (null tbsp / null each) is the genuine autopilot gap -> fail.
    if (QUALITATIVE_AMOUNT_RE.test(name)) continue
    if (QUALITATIVE_UNIT_RE.test(unit)) continue
    if (MEASURED_UNIT_RE.test(unit)) return true
    // Unknown / empty unit with no amount and no qualitative name -> gap.
    return true
  }
  return false
}

/** The method names equipment / tools the cook needs. A structured supplies /
 *  equipment block, an Equipment / You will need heading, OR equipment nouns
 *  named inline in the prose (every real method names its tin / bowl / pan). */
const EQUIPMENT_NOUN_RE =
  /\b(tin|tins|bowl|bowls|pan|pans|saucepan|frying pan|skillet|tray|baking (?:tray|sheet)|sheet|dish|tray|whisk|spatula|wooden spoon|spoon|sieve|colander|grater|peeler|knife|board|rolling pin|food processor|blender|mixer|stand mixer|hand mixer|oven|hob|grill|thermometer|jar|jars|bottle|tongs|ladle|measuring (?:jug|cup|spoons?)|scales|piping bag|cutter|ramekin|loaf tin|cake tin|muffin tin|wok|casserole|roasting tin|griddle|mandoline|mortar|pestle|steamer|pressure cooker|slow cooker|wire rack|cooling rack|parchment|greaseproof)\b/i

export function hasEquipment(ctx: MakeabilityContext, text: string): boolean {
  if (hasNodeType(ctx.body, 'suppliesCard')) return true
  if (headings(ctx.body).some((h) => /equipment|you(?:'ll| will)? need|tools|kit|what you need/i.test(h))) return true
  return EQUIPMENT_NOUN_RE.test(text)
}

/** The method references the ingredients (a method that never names an
 *  ingredient is a skeleton). True when at least one ingredient name appears in
 *  the method prose, or there are no structured ingredients to reference. */
export function methodReferencesIngredients(ctx: MakeabilityContext, text: string): boolean {
  const names = ingredientNames(ctx.body)
  if (names.length === 0) return false
  const hay = text.toLowerCase()
  let hits = 0
  for (const n of names) {
    // match the head noun of the ingredient (last word usually carries it)
    const tokens = n.toLowerCase().split(/[^a-z]+/).filter((t) => t.length >= 3)
    if (tokens.some((t) => hay.includes(t))) hits++
    if (hits >= 1) return true
  }
  return false
}

// ─── Crochet / knitting written-instruction hard predicates ──────────────────

/** Row/round lines that end with an explicit stitch count, e.g. "(40 sts)",
 *  "— 40 sts", "40 dc". The checklist requires EVERY row to carry one; we count
 *  the row markers vs the stitch-count annotations and fail when most rows lack
 *  a count. */
export function rowsWithoutStitchCounts(text: string): { rows: number; counted: number } {
  const rowMarkers = text.match(/\b(?:Row|Round|Rnd)\s*\d+/gi) ?? []
  const counts = text.match(/\(\s*\d+\s*(?:sts?|stitches|dc|sc|hdc|tr|dtr|st)\b[^)]*\)|\b\d+\s*(?:sts|stitches)\b/gi) ?? []
  return { rows: rowMarkers.length, counted: counts.length }
}

/** An un-enumerated repeat: "to end", "as established", "as set", "rep from *
 *  to end", "repeat as before", "continue in pattern". The checklist requires
 *  every repeat group to be fully spelled out. */
export function hasUnenumeratedRepeat(text: string): boolean {
  return /\b(to end|as established|as set|as before|continue (?:in|as) (?:pattern|established|set)|rep(?:eat)? (?:from )?\*[^.]{0,40}(?:to end|across|around)|work as (?:given|for)|same as)\b/i.test(text)
}

/** A cross-reference to another pattern ("as given for X", "see the X pattern",
 *  "work the X as for the Y"). The pattern must be standalone. */
export function hasPatternCrossReference(text: string): boolean {
  return /\b(as (?:given|written|for) (?:the |in )?[a-z]|see the .{0,30} pattern|refer to the .{0,30} pattern|using the .{0,30} pattern instructions|follow the .{0,30} pattern)\b/i.test(text)
}

/** A stitch glossary / abbreviations key (dc = double crochet, k = knit, …) or a
 *  clearly-labelled abbreviations section. */
export function hasStitchGlossary(ctx: MakeabilityContext, text: string): boolean {
  if (headings(ctx.body).some((h) => /abbreviat|stitch (?:key|glossary|guide)|stitches used|key\b|glossary/i.test(h))) return true
  // inline "dc = double crochet" / "k2tog = knit two together" definitions
  if (/\b[a-z]{1,5}\s*=\s*[a-z]/i.test(text)) return true
  return false
}

/** Finishing instructions: weaving in ends, blocking, seaming, fastening off. */
export function hasFinishing(ctx: MakeabilityContext, text: string): boolean {
  if (headings(ctx.body).some((h) => /finish|making up|making-up|assembly|blocking|to finish|joining/i.test(h))) return true
  return /\b(weave in (?:the )?ends|sew in (?:the )?ends|fasten off|cast off|bind off|block (?:the|your|to)|darn in|seam the|mattress stitch|whipstitch the)\b/i.test(text)
}

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
 * Cross-cutting mechanical checks that run on ANY text (a body, an instructions
 * doc, or a chart's name + description). Every one is a hard BLOCK per the
 * locked completeness checklist's "Cross-cutting rules" section — there is no
 * warning / flag tier. em / en dashes and banned phrasing are MANDATORY-absent
 * and block, exactly like a leaked NaN.
 *
 * This is the shared pre-check the brief asks for: it runs before the per-type
 * structural rules and contributes its reasons to the same blocking list.
 */
export function mechanicalChecks(text: string): { reasons: string[]; rules: string[] } {
  const reasons: string[] = []
  const rules: string[] = []
  const push = (rule: string, reason: string) => { rules.push(rule); reasons.push(reason) }

  if (/\bNaN\b/.test(text)) push('generic:nan', 'contains "NaN" (a number failed to compute)')
  if (/(?<![A-Za-z])undefined(?![A-Za-z])/.test(text)) push('generic:undefined', 'contains "undefined"')
  if (/(?<![\w$])\[\]|(?<![\w$])\{\}/.test(text)) push('generic:empty-literal', 'contains a leaked "[]" or "{}" literal')
  if (PLACEHOLDER_RE.test(text)) push('generic:placeholder', 'contains an unfilled placeholder phrase')
  if (/[—]/.test(text)) push('generic:em-dash', 'contains an em dash (mandatory: none)')
  if (/[–]/.test(text)) push('generic:en-dash', 'contains an en dash (mandatory: none)')
  for (const b of BANNED_PHRASES) {
    if (b.re.test(text)) push('generic:banned-phrase', `contains banned phrasing: "${b.label}"`)
  }
  return { reasons, rules }
}

/**
 * Generic checks that fire on every TUTORIAL type. The cross-cutting mechanical
 * checks plus the body-presence / length / untyped-text-node checks. All
 * blocking — binary, no warning tier.
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
  const mech = mechanicalChecks(text)
  reasons.push(...mech.reasons)
  rules.push(...mech.rules)
  if (hasUntypedTextNode(ctx.body)) push('generic:untyped-text-node', 'has a text leaf missing type:"text" (renderer drops it)')
  // NOTE: glossaryTooltip coverage is intentionally NOT re-checked here.
  // Production marks reference the term by `termId` (verified against live
  // data), not `termSlug` (the checklist's wording predates that finding), so
  // re-adjudicating coverage here produces only false positives. Glossary
  // coverage stays owned by the upload-time voice gate. Flagged in the
  // hand-off as the one checklist line not enforced in this gate.

  return { reasons, rules }
}

/**
 * Compose a per-type result from the generic cross-cutting checks + the
 * type-specific reasons. Every reason is BLOCKING — there is no flag / voice
 * tier any more (locked: binary block, no warning tier). A row passes only when
 * it satisfies every cross-cutting rule AND every MANDATORY type-specific item.
 */
export function compose(
  ctx: MakeabilityContext,
  typeRule: string,
  typeReasons: string[],
): MakeabilityResult {
  const generic = genericChecks(ctx)
  const reasons = [...generic.reasons, ...typeReasons]
  const rules = [...generic.rules, ...typeReasons.map(() => typeRule)]
  return { ok: reasons.length === 0, reasons, rules }
}
