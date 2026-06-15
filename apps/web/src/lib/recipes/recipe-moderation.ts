// No `server-only` marker: this module is imported both by the Inngest runtime
// (Next server bundle) and by the tsx CLI runner, and it is server-bound in
// practice through its `@homemade/db` (prisma) import.
import { prisma, type Prisma, UserRecipeStatus, MealType } from '@homemade/db'

/**
 * Deterministic moderation pass for user-submitted recipes.
 *
 * All moderation on Homemade is automated per the locked AI-only rule: there is
 * no manual editorial queue. This module is the deterministic half of that
 * pass, the half that can run unattended on a five-minute cron without any
 * paid AI provider (no API spend). It applies binary gates (no warning tier,
 * nothing left for a human to triage):
 *
 *   - field presence (title, method, at least one linked ingredient)
 *   - voice register (em / en dashes and banned phrases are a hard reject,
 *     matching the published-content voice rules)
 *   - originality-declaration consistency
 *   - duplicate detection (title match + ingredient-set cosine similarity)
 *   - spam / off-topic heuristics (link flooding, too-thin method)
 *
 * It also enriches the recipe while it passes: allergens pulled from the linked
 * ingredients, and dietary / cuisine / meal-type auto-detected when the Maker
 * left them blank (each marked auto-detected so the Maker can override).
 *
 * A passing recipe is APPROVED, published at the Maker's chosen visibility. A
 * failing recipe is REJECTED with structured findings and a notification so the
 * Maker can fix it and resubmit. The semantic judgements that genuinely need a
 * model (nuanced copyright provenance, subtle off-topic) are handled by a
 * Claude Code worker session reading the same queue, never by a runtime API
 * call and never by a human reviewer.
 */

export interface ModerationFinding {
  check: string
  passed: boolean
  detail: string
}

export type ModerationVerdict =
  | 'approved'
  | 'flagged-fields'
  | 'flagged-voice'
  | 'flagged-duplicate'
  | 'flagged-copyright'
  | 'flagged-spam'
  | 'flagged-off-topic'

export interface ModerationOutcome {
  verdict: ModerationVerdict
  findings: ModerationFinding[]
  derived: {
    dietaryTags: string[]
    cuisineTags: string[]
    mealType: string | null
    allergens: string[]
    autoDetected: string[]
  }
}

interface ModerationRecipe {
  id: string
  title: string
  summary: string | null
  body: unknown
  cuisineTags: string[]
  dietaryTags: string[]
  mealType: string | null
  categorySlug: string
  originalityType: string | null
  attribution: string | null
  ingredients: Array<{
    ingredientId: string
    dietaryFlags: string[]
    isAllergen: boolean
    allergenType: string | null
  }>
}

interface CorpusRecipe {
  id: string
  title: string
  ingredientIds: Set<string>
}

// ── Text helpers ────────────────────────────────────────────────────────────

export function extractBodyText(body: unknown): string {
  const parts: string[] = []
  function walk(node: unknown): void {
    if (!node || typeof node !== 'object') return
    const obj = node as Record<string, unknown>
    if (obj.type === 'text' && typeof obj.text === 'string') parts.push(obj.text)
    if (Array.isArray(obj.content)) for (const child of obj.content) walk(child)
  }
  walk(body)
  return parts.join(' ')
}

function countLinks(body: unknown): number {
  let n = 0
  function walk(node: unknown): void {
    if (!node || typeof node !== 'object') return
    const obj = node as Record<string, unknown>
    if (Array.isArray(obj.marks)) {
      for (const mark of obj.marks) {
        if (mark && typeof mark === 'object' && (mark as Record<string, unknown>).type === 'link') n += 1
      }
    }
    if (Array.isArray(obj.content)) for (const child of obj.content) walk(child)
  }
  walk(body)
  return n
}

// ── Voice gate (deterministic, mirrors the published-content rules) ──────────

const VOICE_BANNED: string[] = [
  'delve into',
  'at its core',
  'in the realm of',
  "in today's fast-paced world",
  'tapestry of',
  'a testament to',
  'a beacon of',
  'navigate the complexities',
  'unlock the secrets',
  'treasure trove',
  'game-changer',
  'speaks volumes',
  'resonates with',
  'perfect for',
  'ideal for',
  'honestly',
  'when it comes to',
  'look no further',
  'elevate your',
]

function checkVoice(title: string, bodyText: string): ModerationFinding {
  const haystack = `${title}\n${bodyText}`
  if (/[—–]/.test(haystack)) {
    return {
      check: 'voice',
      passed: false,
      detail:
        'The recipe uses a long dash (em or en dash). Swap it for a comma, full stop, or brackets and resubmit.',
    }
  }
  const lower = haystack.toLowerCase()
  const hit = VOICE_BANNED.find((p) => lower.includes(p))
  if (hit) {
    return {
      check: 'voice',
      passed: false,
      detail: `The phrase "${hit}" reads like ad copy. Rewrite it in plain, everyday words and resubmit.`,
    }
  }
  return { check: 'voice', passed: true, detail: 'Reads in plain English.' }
}

// ── Enrichment ───────────────────────────────────────────────────────────────

function deriveDietary(ingredients: ModerationRecipe['ingredients']): string[] {
  if (ingredients.length === 0) return []
  // A recipe carries a dietary flag only when every ingredient carries it.
  let intersection: string[] | null = null
  for (const ing of ingredients) {
    const flags = ing.dietaryFlags
    if (intersection === null) {
      intersection = [...flags]
    } else {
      intersection = intersection.filter((f) => flags.includes(f))
    }
  }
  return (intersection ?? []).slice().sort()
}

function extractAllergens(ingredients: ModerationRecipe['ingredients']): string[] {
  const out = new Set<string>()
  for (const ing of ingredients) {
    if (ing.isAllergen && ing.allergenType) out.add(ing.allergenType)
  }
  return [...out].sort()
}

const CUISINE_KEYWORDS: Record<string, string[]> = {
  italian: ['pasta', 'risotto', 'parmesan', 'mozzarella', 'pesto', 'gnocchi', 'polenta'],
  french: ['baguette', 'béchamel', 'bechamel', 'confit', 'ratatouille', 'tarte', 'crème'],
  spanish: ['paella', 'chorizo', 'tapas', 'manchego', 'romesco'],
  greek: ['feta', 'tzatziki', 'filo', 'phyllo', 'halloumi'],
  mexican: ['taco', 'tortilla', 'salsa', 'guacamole', 'enchilada', 'chipotle'],
  indian: ['curry', 'masala', 'paneer', 'dal', 'naan', 'tikka', 'garam'],
  thai: ['lemongrass', 'fish sauce', 'galangal', 'pad thai', 'coconut milk'],
  chinese: ['soy sauce', 'wok', 'hoisin', 'bok choy', 'stir-fry', 'stir fry'],
  japanese: ['miso', 'soy', 'dashi', 'sushi', 'teriyaki', 'ramen', 'panko'],
  'middle-eastern': ['tahini', 'za’atar', 'zaatar', 'harissa', 'hummus', 'falafel', 'pomegranate molasses'],
  'north-african': ['harissa', 'preserved lemon', 'ras el hanout', 'tagine', 'couscous'],
  british: ['scone', 'crumpet', 'shortbread', 'pudding', 'roast', 'pasty', 'trifle'],
  caribbean: ['jerk', 'plantain', 'allspice', 'scotch bonnet'],
}

function detectCuisine(text: string): string[] {
  const lower = text.toLowerCase()
  const out: string[] = []
  for (const [cuisine, words] of Object.entries(CUISINE_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) out.push(cuisine)
  }
  return out.slice(0, 3)
}

const MEAL_KEYWORDS: Array<{ type: string; words: string[] }> = [
  { type: 'BREAKFAST', words: ['breakfast', 'porridge', 'pancake', 'granola', 'omelette', 'brunch'] },
  { type: 'DESSERT', words: ['dessert', 'cake', 'pudding', 'tart', 'biscuit', 'cookie', 'ice cream', 'brownie'] },
  { type: 'DRINK', words: ['cocktail', 'smoothie', 'latte', 'mocktail', 'cordial', 'infusion', 'tea'] },
  { type: 'SNACK', words: ['snack', 'dip', 'crisps', 'popcorn', 'energy ball'] },
  { type: 'SIDE', words: ['side dish', 'side salad', 'slaw', 'dressing'] },
  { type: 'LUNCH', words: ['sandwich', 'wrap', 'salad', 'soup'] },
  { type: 'DINNER', words: ['dinner', 'roast', 'casserole', 'curry', 'stew', 'traybake', 'pasta'] },
]

function detectMealType(text: string): string | null {
  const lower = text.toLowerCase()
  for (const { type, words } of MEAL_KEYWORDS) {
    if (words.some((w) => lower.includes(w))) return type
  }
  return null
}

// ── Duplicate detection ──────────────────────────────────────────────────────

function normaliseTitle(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)
}

function titleJaccard(a: string, b: string): number {
  const setA = new Set(normaliseTitle(a))
  const setB = new Set(normaliseTitle(b))
  if (setA.size === 0 || setB.size === 0) return 0
  const inter = [...setA].filter((w) => setB.has(w)).length
  const union = new Set([...setA, ...setB]).size
  return inter / union
}

function ingredientCosine(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const id of a) if (b.has(id)) inter += 1
  return inter / Math.sqrt(a.size * b.size)
}

function checkDuplicate(
  recipe: ModerationRecipe,
  ingredientIds: Set<string>,
  corpus: CorpusRecipe[],
): ModerationFinding {
  for (const other of corpus) {
    if (other.id === recipe.id) continue
    const tj = titleJaccard(recipe.title, other.title)
    const cos = ingredientCosine(ingredientIds, other.ingredientIds)
    const exactTitle = recipe.title.trim().toLowerCase() === other.title.trim().toLowerCase()
    if (exactTitle || (tj >= 0.6 && cos >= 0.85)) {
      return {
        check: 'duplicate',
        passed: false,
        detail: exactTitle
          ? `A recipe titled "${other.title}" already exists. Give yours a distinct title, or add what makes it your own.`
          : `This looks very close to an existing recipe ("${other.title}"). Make it clearly your own and resubmit.`,
      }
    }
  }
  return { check: 'duplicate', passed: true, detail: 'No close match with existing recipes.' }
}

// ── The per-recipe pass ──────────────────────────────────────────────────────

export function moderateRecipe(recipe: ModerationRecipe, corpus: CorpusRecipe[]): ModerationOutcome {
  const findings: ModerationFinding[] = []
  const ingredientIds = new Set(recipe.ingredients.map((i) => i.ingredientId))
  const bodyText = extractBodyText(recipe.body)

  // Fields present.
  const hasTitle = recipe.title.trim().length >= 3
  const hasMethod = bodyText.trim().length >= 40
  const hasIngredients = recipe.ingredients.length >= 1
  const fieldsOk = hasTitle && hasMethod && hasIngredients
  findings.push({
    check: 'fields',
    passed: fieldsOk,
    detail: fieldsOk
      ? 'Title, method, and ingredients are all present.'
      : `Still needs: ${[
          !hasTitle && 'a title',
          !hasMethod && 'a fuller method',
          !hasIngredients && 'at least one ingredient',
        ]
          .filter(Boolean)
          .join(', ')}.`,
  })

  // Voice.
  findings.push(checkVoice(recipe.title, bodyText))

  // Originality consistency.
  const needsAttribution =
    recipe.originalityType === 'adapted-from' || recipe.originalityType === 'inspired-by'
  const attributionOk = !needsAttribution || Boolean(recipe.attribution?.trim())
  findings.push({
    check: 'originality',
    passed: attributionOk,
    detail: attributionOk
      ? 'Originality declaration is consistent.'
      : 'Marked as adapted from or inspired by another source, but no source was named.',
  })

  // Spam / off-topic.
  const links = countLinks(recipe.body)
  const spamOk = links <= 3 && bodyText.length <= 20000
  findings.push({
    check: 'spam',
    passed: spamOk,
    detail: spamOk ? 'No sign of link flooding.' : 'Too many links for a recipe method.',
  })

  // Duplicate.
  findings.push(checkDuplicate(recipe, ingredientIds, corpus))

  // Enrichment (runs regardless; written only when the recipe is approved).
  const allergens = extractAllergens(recipe.ingredients)
  const autoDetected: string[] = []

  let dietaryTags = recipe.dietaryTags
  if (dietaryTags.length === 0) {
    const derived = deriveDietary(recipe.ingredients)
    if (derived.length > 0) {
      dietaryTags = derived
      autoDetected.push('dietaryTags')
    }
  }

  let cuisineTags = recipe.cuisineTags
  if (cuisineTags.length === 0) {
    const detected = detectCuisine(`${recipe.title} ${bodyText}`)
    if (detected.length > 0) {
      cuisineTags = detected
      autoDetected.push('cuisineTags')
    }
  }

  let mealType = recipe.mealType
  if (!mealType) {
    const detected = detectMealType(`${recipe.title} ${bodyText}`)
    if (detected) {
      mealType = detected
      autoDetected.push('mealType')
    }
  }

  // Verdict: first failing gate names the verdict, in priority order.
  const order: Array<[string, ModerationVerdict]> = [
    ['fields', 'flagged-fields'],
    ['voice', 'flagged-voice'],
    ['originality', 'flagged-copyright'],
    ['spam', 'flagged-spam'],
    ['duplicate', 'flagged-duplicate'],
  ]
  let verdict: ModerationVerdict = 'approved'
  for (const [check, v] of order) {
    const f = findings.find((x) => x.check === check)
    if (f && !f.passed) {
      verdict = v
      break
    }
  }

  return {
    verdict,
    findings,
    derived: { dietaryTags, cuisineTags, mealType, allergens, autoDetected },
  }
}

// ── Batch runner (shared by the cron + the CLI) ──────────────────────────────

export interface BatchResultRow {
  id: string
  slug: string
  title: string
  verdict: ModerationVerdict
  approved: boolean
  failedChecks: string[]
  autoDetected: string[]
  allergens: string[]
}

export interface BatchSummary {
  pending: number
  approved: number
  rejected: number
  rows: BatchResultRow[]
}

export async function runModerationBatch(opts: {
  limit?: number
  dryRun?: boolean
} = {}): Promise<BatchSummary> {
  const limit = opts.limit ?? 50
  const dryRun = opts.dryRun ?? false

  const pending = await prisma.userRecipe.findMany({
    where: { status: UserRecipeStatus.PENDING_AI_MODERATION },
    take: limit,
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      body: true,
      cuisineTags: true,
      dietaryTags: true,
      mealType: true,
      categorySlug: true,
      originalityType: true,
      attribution: true,
      ownerUserId: true,
      visibility: true,
      ingredients: {
        select: {
          ingredientId: true,
          ingredient: { select: { dietaryFlags: true, isAllergen: true, allergenType: true } },
        },
      },
    },
  })

  if (pending.length === 0) {
    return { pending: 0, approved: 0, rejected: 0, rows: [] }
  }

  // Corpus for duplicate detection: existing approved user recipes (with their
  // ingredient sets) plus the titles of published library recipes.
  const approvedUserRecipes = await prisma.userRecipe.findMany({
    where: { status: UserRecipeStatus.APPROVED },
    select: { id: true, title: true, ingredients: { select: { ingredientId: true } } },
  })
  const libraryTitles = await prisma.tutorial.findMany({
    where: { status: 'PUBLISHED', type: 'RECIPE' },
    select: { id: true, title: true },
  })
  const corpus: CorpusRecipe[] = [
    ...approvedUserRecipes.map((r) => ({
      id: r.id,
      title: r.title,
      ingredientIds: new Set(r.ingredients.map((i) => i.ingredientId)),
    })),
    ...libraryTitles.map((t) => ({ id: `tut:${t.id}`, title: t.title, ingredientIds: new Set<string>() })),
  ]

  const rows: BatchResultRow[] = []
  let approved = 0
  let rejected = 0

  for (const r of pending) {
    const outcome = moderateRecipe(
      {
        id: r.id,
        title: r.title,
        summary: r.summary,
        body: r.body,
        cuisineTags: r.cuisineTags,
        dietaryTags: r.dietaryTags,
        mealType: r.mealType,
        categorySlug: r.categorySlug,
        originalityType: r.originalityType,
        attribution: r.attribution,
        ingredients: r.ingredients.map((i) => ({
          ingredientId: i.ingredientId,
          dietaryFlags: i.ingredient.dietaryFlags,
          isAllergen: i.ingredient.isAllergen,
          allergenType: i.ingredient.allergenType,
        })),
      },
      corpus,
    )

    const isApproved = outcome.verdict === 'approved'
    const failedChecks = outcome.findings.filter((f) => !f.passed).map((f) => f.check)

    rows.push({
      id: r.id,
      slug: r.slug,
      title: r.title,
      verdict: outcome.verdict,
      approved: isApproved,
      failedChecks,
      autoDetected: outcome.derived.autoDetected,
      allergens: outcome.derived.allergens,
    })

    if (isApproved) approved += 1
    else rejected += 1

    if (dryRun) continue

    const notes = {
      findings: outcome.findings,
      allergens: outcome.derived.allergens,
      autoDetected: outcome.derived.autoDetected,
    } as unknown as Prisma.InputJsonValue

    if (isApproved) {
      await prisma.userRecipe.update({
        where: { id: r.id },
        data: {
          status: UserRecipeStatus.APPROVED,
          aiModerationVerdict: outcome.verdict,
          aiModerationNotes: notes,
          moderatedAt: new Date(),
          publishedAt: new Date(),
          // Enrichment: only fill blanks the Maker left, never overwrite choices.
          dietaryTags: outcome.derived.dietaryTags,
          cuisineTags: outcome.derived.cuisineTags,
          mealType: outcome.derived.mealType
            ? (outcome.derived.mealType as MealType)
            : undefined,
          // Visibility stays the Maker's choice; approval is what makes it live.
        },
      })
      // Pull the corpus forward so a batch of near-identical submissions doesn't
      // all approve against an empty corpus.
      corpus.push({
        id: r.id,
        title: r.title,
        ingredientIds: new Set(r.ingredients.map((i) => i.ingredientId)),
      })
    } else {
      await prisma.userRecipe.update({
        where: { id: r.id },
        data: {
          status: UserRecipeStatus.REJECTED,
          aiModerationVerdict: outcome.verdict,
          aiModerationNotes: notes,
          moderatedAt: new Date(),
        },
      })
      const reasons = outcome.findings
        .filter((f) => !f.passed)
        .map((f) => f.detail)
        .join(' ')
      await prisma.notification
        .create({
          data: {
            userId: r.ownerUserId,
            type: 'SYSTEM',
            body: `"${r.title}" needs a change before it can go live. ${reasons}`,
          },
        })
        .catch(() => {
          /* never let a notify failure strand a written verdict */
        })
    }
  }

  return { pending: pending.length, approved, rejected, rows }
}
