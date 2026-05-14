/**
 * Input shape for `upload-tutorial.ts`.
 *
 * One JSON file per tutorial. The script resolves category + sub-category by
 * slug (never creates), creates missing glossary terms by slug, resolves
 * ingredient + tool slugs against the master tables, uploads the hero image
 * to Cloudflare R2, and inserts (or updates, idempotently) the Tutorial row
 * as DRAFT with a TutorialVersion snapshot. RecipeIngredient + RecipeTool
 * join rows are rebuilt from the body's `ingredientsList` blocks and the
 * top-level `recipeTools` array on every save.
 *
 * The TipTap body uses node + mark shapes that match what the admin TipTap
 * editor saves. Glossary terms are referenced by `termSlug` inside the mark —
 * the script swaps `termSlug` for `termId` before inserting. Structured
 * ingredients reference master rows by `ingredientSlug`; the script swaps
 * those for `ingredientId` (and copies the canonical name + defaultUnit)
 * before inserting.
 */

export type TutorialType = 'RECIPE' | 'TECHNIQUE'

export interface RecipeMetadata {
  /** Default yield. Drives the "Serves N" line and the scale selector. */
  servings?: number | null
  /** Override "Serves N" when the recipe yields units (e.g. "1 loaf", "12 muffins"). */
  yieldDescription?: string | null
  prepMinutes?: number | null
  cookMinutes?: number | null
  /** Dough rising, marinating — distinct from `chillingMinutes` for filter facets. */
  restingMinutes?: number | null
  /** Fridge / freezer rests. */
  chillingMinutes?: number | null
  /**
   * Total time. If omitted, the script computes
   * `prep + cook + resting + chilling` and uses that.
   */
  totalMinutes?: number | null
  /** Default true. Bakery recipes where the ratios won't scale should set false. */
  scalable?: boolean
  freezable?: boolean
  freezeNotes?: string | null
  batchable?: boolean
  batchNotes?: string | null
  makeAheadNotes?: string | null
  /**
   * Dietary flags. See `apps/web/src/app/admin/tutorials/ingredient-constants.ts`
   * for the canonical list. Recipes inherit flags from their ingredients at
   * index time, so this field carries author-level overrides only (e.g.
   * halal / kosher, which depend on slaughter not ingredients).
   */
  dietaryFlags?: string[]
  /** Single value from the CUISINES allow-list (british, italian, french, …). */
  cuisine?: string | null
  /** Single value from MEAL_TYPES (breakfast, lunch, dinner, dessert, drink, side, …). */
  mealType?: string | null
  /** Multi-valued. From MOOD_FLAGS (weeknight, comfortFood, kidFriendly, …). */
  mood?: string[]
  temperatureCelsius?: number | null
  temperatureNote?: string | null
  /** Flexible JSON — kcal / protein / carbs / fat / fibre / salt per serving. */
  nutritionalInfoPerServing?: Record<string, unknown> | null
  /** Foundational technique badge. Should only be true on TECHNIQUE rows. */
  foundational?: boolean
  /** Slug of the recipe to suggest as "what to do with the leftovers". */
  leftoverTutorialSlug?: string | null
}

export interface RecipeToolRef {
  /** Slug of a row in the master `Tool` table. Must exist. */
  slug: string
  isOptional?: boolean
  /** "or any oven-safe non-stick pan". */
  notes?: string | null
  /** Display position. If omitted, the script uses array order. */
  position?: number
}

export interface TutorialUploadInput {
  /** URL slug, lowercase letters / numbers / hyphens only. Unique across all tutorials. */
  slug: string

  /** Public title. */
  title: string

  /** Optional sub-title (rendered above the hero). */
  subtitle?: string | null

  /** Short summary used on cards and meta description. */
  excerpt?: string | null

  /**
   * RECIPE | TECHNIQUE discriminator. Defaults to RECIPE (the primary content
   * shape from Phase 8 onwards). Existing TECHNIQUE drafts (béchamel etc.) set
   * this explicitly.
   */
  type?: TutorialType

  /** Category slug — must already exist in `/admin/categories`. */
  categorySlug: string

  /** Optional sub-category slug — must already exist under the chosen category. */
  subCategorySlug?: string | null

  /** Default BEGINNER. */
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

  /** Optional season. */
  season?: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER' | 'YEAR_ROUND' | null

  /**
   * Total time the tutorial takes in minutes (denormalised wall-clock).
   *
   * For RECIPE rows, this is also derivable from `recipe.totalMinutes`
   * (or `prep + cook + resting + chilling`). Either field is fine; when both
   * are set, the explicit `timeMinutes` wins.
   */
  timeMinutes?: number | null

  /** Default PUBLIC_DOMAIN. */
  sourceType?: 'TESTED' | 'CLASSIC' | 'SYNTHESISED' | 'PUBLIC_DOMAIN' | 'CREATOR'

  /** Reference list / attribution notes (rendered in the sources aside). */
  sourceNotes?: string | null

  /** Recipe metadata. Required when `type === 'RECIPE'`. */
  recipe?: RecipeMetadata | null

  /**
   * Tools the recipe uses. The structured `equipmentList` TipTap block is
   * deferred; until then we accept tool references as a top-level array.
   * Each entry's `slug` must exist in the master `Tool` table.
   */
  recipeTools?: RecipeToolRef[]

  /**
   * Hero illustration. Either `mediaId` (reuse an existing Media row) OR
   * `localPath` (relative to the input JSON file, or absolute — the script
   * uploads it to Cloudflare Images and creates a Media row). If both are
   * given `mediaId` wins.
   */
  hero?: {
    mediaId?: string | null
    localPath?: string | null
    alt?: string | null
    caption?: string | null
    attribution?: string | null
  } | null

  /**
   * Glossary terms referenced by the body. Any slug that doesn't already exist
   * in the `GlossaryTerm` table is created (with the supplied definition,
   * scoped to the same Category as the tutorial). Slugs that already exist
   * are left as-is — the script never overwrites a definition.
   */
  glossaryTerms?: Array<{
    slug: string
    term: string
    definition: string
  }>

  /**
   * TipTap document. The top-level node is always `{ type: 'doc', content: [...] }`.
   *
   * Node types supported (StarterKit + custom blocks):
   *   StarterKit: paragraph, heading (attrs.level 1-6), bulletList, orderedList,
   *               listItem, blockquote, codeBlock, horizontalRule, hardBreak, image
   *   Marks:      bold, italic, underline, strike, code, link (attrs.href),
   *               glossaryTooltip (attrs.termSlug — swapped for termId on upload)
   *   Custom blocks (suppliesCard kept for legacy technique tutorials; new
   *   recipes use ingredientsList instead):
   *                  infoPanel (attrs: tone, title, body),
   *                  ingredientsList (attrs: defaultServings, items[]{
   *                    ingredientSlug (resolves to ingredientId + name + unit),
   *                    amount, unit, prepNote, isOptional, groupLabel
   *                  }),
   *                  suppliesCard (attrs: heading, items[]{name,qty,link,substitutions}),
   *                  pullQuote (attrs: quote, attribution),
   *                  subTutorialCard (attrs: tutorialId),
   *                  productCard (attrs: imageUrl, title, description, label),
   *                  varietiesPanel (attrs: label, heading, intro, items[]{name,type,description}),
   *                  troubleshooter (attrs: heading, intro, items[]{symptom,cause,fix})
   *
   * The author writes `ingredientSlug` in each `ingredientsList` item; the
   * script resolves it to `ingredientId` (cuid) before inserting, and copies
   * the canonical name + defaultUnit onto the row so the public renderer has
   * the strings it needs without an extra join.
   */
  body: TutorialDoc
}

export interface TutorialDoc {
  type: 'doc'
  content: TutorialNode[]
}

export interface TutorialNode {
  type: string
  attrs?: Record<string, unknown>
  marks?: TutorialMark[]
  content?: TutorialNode[]
  text?: string
}

export interface TutorialMark {
  type: string
  attrs?: Record<string, unknown>
}

export interface UploadResult {
  mode: 'created' | 'updated'
  tutorialId: string
  slug: string
  type: TutorialType
  status: 'DRAFT' | 'IN_REVIEW' | 'PENDING_MODERATION' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: string | null
  categorySlug: string
  subCategorySlug: string | null
  heroMediaId: string | null
  heroR2Key: string | null
  createdGlossary: { slug: string; term: string; id: string }[]
  recipeIngredientRows: number
  recipeToolRows: number
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function validateInput(input: TutorialUploadInput): void {
  if (!input.slug) throw new Error('input.slug is required.')
  if (!SLUG_PATTERN.test(input.slug)) {
    throw new Error(`input.slug "${input.slug}" must be lowercase letters, numbers, and hyphens only.`)
  }
  if (!input.title) throw new Error('input.title is required.')
  if (!input.categorySlug) throw new Error('input.categorySlug is required.')
  if (input.subCategorySlug && !SLUG_PATTERN.test(input.subCategorySlug)) {
    throw new Error(`input.subCategorySlug "${input.subCategorySlug}" must match the slug pattern.`)
  }
  if (input.type && input.type !== 'RECIPE' && input.type !== 'TECHNIQUE') {
    throw new Error(`input.type "${input.type}" must be RECIPE or TECHNIQUE.`)
  }
  if (!input.body || input.body.type !== 'doc' || !Array.isArray(input.body.content)) {
    throw new Error('input.body must be a TipTap document: { type: "doc", content: [...] }.')
  }
  for (const g of input.glossaryTerms ?? []) {
    if (!g.slug || !SLUG_PATTERN.test(g.slug)) {
      throw new Error(`glossaryTerms[].slug "${g.slug}" must match the slug pattern.`)
    }
    if (!g.term) throw new Error(`glossaryTerms entry "${g.slug}" missing term.`)
    if (!g.definition) throw new Error(`glossaryTerms entry "${g.slug}" missing definition.`)
  }
  for (const t of input.recipeTools ?? []) {
    if (!t.slug || !SLUG_PATTERN.test(t.slug)) {
      throw new Error(`recipeTools[].slug "${t.slug}" must match the slug pattern.`)
    }
  }
  if (input.recipe?.leftoverTutorialSlug && !SLUG_PATTERN.test(input.recipe.leftoverTutorialSlug)) {
    throw new Error(
      `recipe.leftoverTutorialSlug "${input.recipe.leftoverTutorialSlug}" must match the slug pattern.`,
    )
  }
}
