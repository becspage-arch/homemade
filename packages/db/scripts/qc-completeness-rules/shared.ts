/**
 * Shared helpers + generic checks for the per-category content-completeness
 * gates. The dispatcher (`index.ts`) runs the generic checks on every
 * tutorial regardless of category, then the per-category rule on top.
 *
 * A "completeness" failure means the row is NOT a real, makeable / readable
 * piece of content: leaked `NaN`/`undefined`, an unfilled placeholder, an
 * empty / stub body, or a category-specific structural gap (a crochet PATTERN
 * with no row/round instructions, a recipe with no ingredients, etc.).
 *
 * These rules are BINARY (block or skip) per the locked no-warning-tiers
 * rule — there is no human to triage a warning tier. A row either passes and
 * may publish, or fails and stays DRAFT with the reasons recorded in
 * `Tutorial.qcBlockReason`.
 *
 * Every function here is PURE (no Prisma, no fs) so the gate can run inside
 * the publish path (`uploadTutorial`) and the batch DRAFT->PUBLISHED flippers
 * without dragging in IO.
 */

// ─── Types ────────────────────────────────────────────────────────────────

export interface CompletenessContext {
  /** Slug, for reporting only. */
  slug: string
  /** Owning category slug — selects the per-category rule. */
  categorySlug: string
  /** Sub-category slug (exempts counted-needlework charts, etc.). */
  subCategorySlug: string | null
  /** TutorialType string (RECIPE | TECHNIQUE | PATTERN | ...). */
  type: string
  /** TipTap document. */
  body: unknown
  // Optional metadata the recipe rules read. Absent => treated as null.
  servings?: number | null
  yieldDescription?: string | null
  totalMinutes?: number | null
  timeMinutes?: number | null
  prepMinutes?: number | null
  cookMinutes?: number | null
  /** Whether a chart is attached (chartDefinition / linked craft pattern). */
  hasChart?: boolean
}

export interface CompletenessResult {
  ok: boolean
  /** Human-readable failure reasons. Empty when ok. */
  reasons: string[]
  /** Rule ids that fired (generic:* + category:*). Empty when ok. */
  rules: string[]
}

/** A per-category rule returns the failure reasons it found (empty = pass). */
export type CategoryRule = {
  slug: string
  check: (ctx: CompletenessContext, text: string) => string[]
}

// ─── Body walking ───────────────────────────────────────────────────────────

interface TipTapNode {
  type?: string
  attrs?: Record<string, unknown>
  content?: unknown[]
  text?: string
}

/** Flatten every text leaf in a TipTap body to one string. Also pulls the
 *  `body` string off infoPanel attrs so prose buried in panels still counts. */
export function bodyText(body: unknown): string {
  const out: string[] = []
  const walk = (n: unknown): void => {
    if (!n || typeof n !== 'object') return
    const node = n as TipTapNode
    if (typeof node.text === 'string') out.push(node.text)
    if (node.attrs && typeof node.attrs.body === 'string') out.push(node.attrs.body)
    if (Array.isArray(node.content)) for (const c of node.content) walk(c)
  }
  walk(body)
  return out.join(' ')
}

/** Count whitespace-separated words in the flattened body text. */
export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

/** Deep-search the body for any node of the given type. */
export function hasNodeType(body: unknown, type: string): boolean {
  let found = false
  const walk = (n: unknown): void => {
    if (found || !n || typeof n !== 'object') return
    const node = n as TipTapNode
    if (node.type === type) { found = true; return }
    if (Array.isArray(node.content)) for (const c of node.content) walk(c)
  }
  walk(body)
  return found
}

/** A numbered / bulleted list anywhere in the body. */
export function hasList(body: unknown): boolean {
  return hasNodeType(body, 'orderedList') || hasNodeType(body, 'bulletList')
}

/** A heading that reads like a method / steps / how-to / construction section. */
export function hasMethodHeading(body: unknown): boolean {
  let found = false
  const re =
    /method|how to|how it works|steps|instructions|directions|preparing|preparation|making|assembly|construction|sewing|stitch|technique|build|process|what to do/i
  const walk = (n: unknown): void => {
    if (found || !n || typeof n !== 'object') return
    const node = n as TipTapNode
    if (node.type === 'heading' && re.test(bodyText(node))) { found = true; return }
    if (Array.isArray(node.content)) for (const c of node.content) walk(c)
  }
  walk(body)
  return found
}

/** Has an actionable step structure: a list, a method heading, or a run of
 *  imperative step sentences. The broadest "this explains how to do it" gate. */
export function hasSteps(body: unknown, text: string): boolean {
  return hasList(body) || hasMethodHeading(body) || hasImperativeStepRun(text)
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
  'pour', 'line', 'grease', 'preheat', 'whip', 'sift', 'thread', 'knot',
])

function firstWordLower(s: string): string {
  const m = s.match(/^[A-Za-z][A-Za-z'-]*/)
  return m ? m[0].toLowerCase() : ''
}

/** Detect three or more consecutive short imperative sentences ("Steep.
 *  Strain. Apply.") — prose-style steps that aren't in a list node. */
export function hasImperativeStepRun(text: string): boolean {
  const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean)
  let run = 0
  for (const s of sentences) {
    const wc = s.split(/\s+/).filter(Boolean).length
    if (STEP_IMPERATIVES.has(firstWordLower(s)) && wc <= 12) {
      run++
      if (run >= 3) return true
    } else {
      run = 0
    }
  }
  return false
}

/** Crochet / knitting row-or-round instruction marker ("Row 1", "Round 3"). */
export function hasRowRound(text: string): boolean {
  return /\b(Row|Round|Rnd|Rows|Rounds)\s*\d+/i.test(text)
}

/** Counted-needlework disciplines express stitches on a chart grid, not as
 *  written rows — exempt from the row/round check. */
export const COUNTED_NEEDLEWORK = new Set([
  'blackwork', 'needlepoint', 'hardanger', 'sashiko', 'cross-stitch',
  'counted-cross-stitch',
])

// ─── Generic checks (every category) ──────────────────────────────────────────

// High-precision skeleton / placeholder detection. Anchored on the qc-fix
// `ensureMinimalMethod` scaffold ("Step-by-step instructions for X go here.")
// that leaked into ~1,900 published rows, plus dev markers. Deliberately does
// NOT match the bare word "placeholder" (legit in a tapping script:
// "[their name] is a placeholder"), bare "go here" / "goes here" (legit:
// "the screw goes here"), or "insert ... here" (legit craft instruction) —
// those over-matched real content. Any other skeleton shape is still caught
// by the structural checks (no row/round, no ingredients, no steps, < 100
// chars), so the placeholder rule can afford to be tight.
const PLACEHOLDER_RE = new RegExp(
  [
    // "(Step-by-step) instructions (for X) go / goes / will go here"
    'instructions?\\s+(?:for\\s+[^.]{0,90}?\\s+)?(?:go|goes|will\\s+go)\\s+here',
    'instructions?\\s+will\\s+be\\s+(?:added|written|provided)',
    // "<content-noun> goes / will go here"
    '\\b(?:content|details|description|text|full\\s+method|step[- ]by[- ]step\\s+instructions?)\\s+(?:goes?|will\\s+go)\\s+here',
    // dev markers
    'lorem ipsum',
    '\\bTODO\\b', '\\bTBD\\b', '\\bFIXME\\b',
  ].join('|'),
  'i',
)

const MIN_BODY_CHARS = 100

/**
 * Generic completeness checks that fire on every category in addition to the
 * per-category rule. These catch the leaked-JS-value + unfilled-skeleton
 * failure modes that the autopilot shipped across crochet + knitting.
 */
export function genericChecks(text: string): { reasons: string[]; rules: string[] } {
  const reasons: string[] = []
  const rules: string[] = []
  const push = (rule: string, reason: string) => { rules.push(rule); reasons.push(reason) }

  const trimmed = text.trim()
  if (trimmed.length === 0) {
    push('generic:empty-body', 'body is empty')
    return { reasons, rules } // nothing else to test
  }
  if (trimmed.length < MIN_BODY_CHARS) {
    push('generic:body-too-short', `body has only ${trimmed.length} characters of text (< ${MIN_BODY_CHARS})`)
  }
  if (/\bNaN\b/.test(text)) {
    push('generic:nan', 'contains "NaN" (a number failed to compute)')
  }
  if (/(?<![A-Za-z])undefined(?![A-Za-z])/.test(text)) {
    push('generic:undefined', 'contains "undefined" (a value failed to resolve)')
  }
  if (PLACEHOLDER_RE.test(text)) {
    push('generic:placeholder', 'contains an unfilled placeholder phrase')
  }
  return { reasons, rules }
}

// ─── Shared rule builders (composed by the per-category files) ────────────────

/** Recipe-style rule: RECIPE / REMEDY need ingredients + method; cooking /
 *  baking RECIPE additionally need a realistic yield or timing signal. */
export function recipeRule(opts: { requireYieldTiming: boolean }): CategoryRule['check'] {
  return (ctx, text) => {
    const reasons: string[] = []
    if (ctx.type === 'RECIPE' || ctx.type === 'REMEDY') {
      const hasIngredients = hasNodeType(ctx.body, 'ingredientsList') &&
        ingredientsListHasItems(ctx.body)
      if (!hasIngredients) reasons.push('recipe/remedy has no ingredientsList items')
      if (!hasSteps(ctx.body, text)) reasons.push('recipe/remedy has no method or steps')
      if (opts.requireYieldTiming && ctx.type === 'RECIPE' && !hasYieldOrTiming(ctx)) {
        reasons.push('recipe has no yield (servings / yieldDescription) and no timing')
      }
    } else if (ctx.type === 'TECHNIQUE') {
      if (!hasSteps(ctx.body, text) && wordCount(text) < 120) {
        reasons.push('technique has no steps and only thin prose')
      }
    }
    // HERB_PROFILE / READING / other reference types: generic checks only.
    return reasons
  }
}

/** Pattern-style rule for crochet / knitting / needlework: PATTERN needs
 *  row/round instructions (counted disciplines + charts exempt) and a
 *  non-broken foundation count. */
export function textilePatternRule(): CategoryRule['check'] {
  return (ctx, text) => {
    const reasons: string[] = []
    if (ctx.type === 'PATTERN') {
      const counted = COUNTED_NEEDLEWORK.has(ctx.subCategorySlug ?? '')
      if (!counted && !ctx.hasChart && !hasRowRound(text)) {
        reasons.push('pattern has no row/round instructions')
      }
      if (/\bch(?:ain)?\s*(?:NaN|undefined|0)\b/i.test(text)) {
        reasons.push('foundation chain count is broken (NaN / undefined / 0)')
      }
    }
    // STITCH / TECHNIQUE: generic checks (empty / placeholder / short) carry it.
    return reasons
  }
}

/** Craft / maker rule: PATTERN + TECHNIQUE need an actionable step structure;
 *  GUIDE / READING / prose types lean on the generic checks. */
export function craftRule(): CategoryRule['check'] {
  return (ctx, text) => {
    const reasons: string[] = []
    if (ctx.type === 'PATTERN' || ctx.type === 'TECHNIQUE') {
      if (!hasSteps(ctx.body, text)) {
        reasons.push(`${ctx.type.toLowerCase()} has no steps (no list, method heading, or step run)`)
      }
    }
    return reasons
  }
}

/** Prose / reference rule: generic checks only, plus a thin-prose guard. */
export function proseRule(opts: { minWords: number }): CategoryRule['check'] {
  return (ctx, text) => {
    const reasons: string[] = []
    if (wordCount(text) < opts.minWords) {
      reasons.push(`reference body is thin (${wordCount(text)} words < ${opts.minWords})`)
    }
    return reasons
  }
}

// ─── Small predicates ─────────────────────────────────────────────────────────

export function ingredientsListHasItems(body: unknown): boolean {
  let count = 0
  const walk = (n: unknown): void => {
    if (!n || typeof n !== 'object') return
    const node = n as TipTapNode
    if (node.type === 'ingredientsList') {
      const items = Array.isArray(node.attrs?.items) ? (node.attrs!.items as unknown[]) : []
      count += items.length
    }
    if (Array.isArray(node.content)) for (const c of node.content) walk(c)
  }
  walk(body)
  return count > 0
}

export function hasYieldOrTiming(ctx: CompletenessContext): boolean {
  if (ctx.servings != null && ctx.servings > 0) return true
  if (ctx.yieldDescription && ctx.yieldDescription.trim().length > 0) return true
  if (ctx.totalMinutes != null && ctx.totalMinutes > 0) return true
  if (ctx.timeMinutes != null && ctx.timeMinutes > 0) return true
  if (ctx.prepMinutes != null && ctx.prepMinutes > 0) return true
  if (ctx.cookMinutes != null && ctx.cookMinutes > 0) return true
  return false
}
