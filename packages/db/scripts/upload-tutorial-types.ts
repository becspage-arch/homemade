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

export type TutorialType = 'RECIPE' | 'TECHNIQUE' | 'PRACTICE' | 'READING'

/**
 * Mindset practice metadata. Required when `type === 'PRACTICE'` or
 * `type === 'READING'`. Mirrors the `Tutorial.practice*` columns added
 * by the Phase 8 Step 13 schema migration. Practices don't carry
 * recipe metadata — `recipe` should be null / omitted on PRACTICE and
 * READING rows.
 */
export type PracticeType =
  | 'TAPPING'
  | 'ENERGY_STATEMENT'
  | 'AFFIRMATION'
  | 'SPELL'
  | 'RITUAL'
  | 'ACTIVITY'
  | 'JOURNAL_PROMPT'
  | 'VISUALISATION'
  | 'MEDITATION'
  | 'EMBODIMENT'
  | 'READING'

export type PracticeTarget =
  | 'MONEY'
  | 'BODY'
  | 'RELATIONSHIPS'
  | 'SLEEP'
  | 'ANXIETY'
  | 'CONFIDENCE'
  | 'ABUNDANCE'
  | 'STUCK'
  | 'GRIEF'
  | 'FEAR'
  | 'MOTHERHOOD'
  | 'PURPOSE'
  | 'TIME'
  | 'ENERGY'
  | 'JOY'
  | 'SPIRITUALITY'
  | 'HEALTH'
  | 'SELF_WORTH'
  | 'FORGIVENESS'
  | 'AGEING'

export type TimeBand =
  | 'THREE_MIN'
  | 'FIVE_MIN'
  | 'TEN_MIN'
  | 'TWENTY_MIN'
  | 'THIRTY_PLUS'

export type BestTime = 'MORNING' | 'EVENING' | 'ANYTIME' | 'AS_NEEDED'

export interface PracticeMetadata {
  /** One of the 11 PracticeType enum values. */
  practiceType: PracticeType
  /** One or more PracticeTarget values — drives the "I'm feeling..." matcher. */
  practiceTargets: PracticeTarget[]
  timeBand: TimeBand
  bestTime: BestTime
  /** Reuses the Difficulty enum (BEGINNER | INTERMEDIATE | ADVANCED). */
  practiceDepth?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null
  /** One-sentence matcher string ("Use when you wake up already gripped by money panic."). */
  whenToUse?: string | null
  /** Optional contra-indication ("Skip if you're actively dissociating; use a body practice instead."). */
  whenNotToUse?: string | null
  /** Slugs of sibling practices to surface as "when this isn't working" alternatives. */
  alternativePracticeIds?: string[]
}

export type PreFermentType =
  | 'NONE'
  | 'POOLISH'
  | 'BIGA'
  | 'LEVAIN'
  | 'SPONGE'
  | 'OTHER'

/**
 * Baking-specific recipe metadata. All fields nullable. Set on rows where
 * `type === 'RECIPE'` and the recipe is in the Baking category. Cooking
 * recipes leave the whole `baking` block null. Mirrors the columns added
 * by the `phase_8_baking_pipeline_scaffold` migration.
 */
export interface BakingMetadata {
  // Hydration metadata — baker's percentages, anchored on flour weight.
  flourWeightGrams?: number | null
  hydrationPercent?: number | null
  saltPercent?: number | null
  yeastPercent?: number | null
  levainPercent?: number | null

  // Proofing metadata. Minutes per stage.
  bulkFermentMinutes?: number | null
  proofMinutes?: number | null
  retardingMinutes?: number | null
  levainBuildMinutes?: number | null

  // Lamination metadata. For puff / croissant / Danish.
  laminationFolds?: number | null
  laminationRests?: number | null

  // Oven + steam.
  bakeTemperatureCelsius?: number | null
  bakeTemperatureNote?: string | null
  steamMethod?: string | null

  // Decorating.
  decoratingTechnique?: string | null

  // Pre-ferment type. NONE for straight doughs.
  preFermentType?: PreFermentType | null
}

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
  /**
   * Baking-specific metadata. Null for cooking recipes; populated for
   * Baking-category recipes. The columns are nullable, so within a baking
   * recipe set only the fields that apply to the sub-category (bread sets
   * hydration; pastry sets lamination; cake decorating sets
   * decoratingTechnique; etc.).
   */
  baking?: BakingMetadata | null
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

/**
 * Where a ProjectSchedule step surfaces on the homepage when its day arrives.
 *
 *   HERO              — Takes over the homepage hero zone for the day. Reserve
 *                       for big-moment days ("your starter is ready").
 *   RAIL_CARD         — Shows in the "Today's scheduled project actions" rail.
 *                       The default for periodic check-ins.
 *   NOTIFICATION_ONLY — Fires an in-app notification but doesn't change the
 *                       homepage. Use for don't-forget reminders that aren't
 *                       worth a hero takeover.
 */
export type ScheduleSurface = 'HERO' | 'RAIL_CARD' | 'NOTIFICATION_ONLY'

/**
 * One ProjectSchedule step. Authors register these on long-arc tutorials so
 * the homepage can resurface the project on the right day after the user
 * clicks "I'm making this".
 *
 * Only register a schedule on tutorials with a real-world arc longer than a
 * day. TECHNIQUE and READING rows must NOT carry a schedule.
 */
export interface ProjectScheduleStep {
  /** 1-indexed, monotonically increasing, no duplicates. */
  stepNumber: number
  /** Days after `UserProject.startedAt` the step fires. >= 0, monotonic. */
  offsetDays: number
  /** Short imperative title — "Pinch out the bubbles", "Feed your starter". */
  title: string
  /** One-paragraph body explaining what to do that day. */
  body: string
  /** Defaults to RAIL_CARD when omitted. */
  surfaceAs?: ScheduleSurface
  /** Defaults to true. Set false for FYI-only steps the user doesn't tick. */
  requiresUserAction?: boolean
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
   * Mindset practice metadata. Required when `type === 'PRACTICE'`
   * (or `type === 'READING'` for long-form Mindset reading entries).
   * Maps directly onto the `Tutorial.practice*` columns added by the
   * Phase 8 Step 13 migration. Null / omitted on RECIPE + TECHNIQUE rows.
   */
  practice?: PracticeMetadata | null

  /**
   * Tools the recipe uses. The structured `equipmentList` TipTap block is
   * deferred; until then we accept tool references as a top-level array.
   * Each entry's `slug` must exist in the master `Tool` table.
   */
  recipeTools?: RecipeToolRef[]

  /**
   * Multi-day arc steps. Only set on tutorials whose real-world process
   * spans more than a day (sourdough starter, fermentation, growing,
   * fed Christmas cake, herbal tinctures, etc.). The homepage uses these
   * to resurface the project on the right day after the user starts it.
   *
   * Hard rule: NEVER set on `type === 'TECHNIQUE'` or `type === 'READING'`.
   * Validation rejects those combinations. Most RECIPE rows leave this empty
   * — only long-arc bakes / preserves / cures use it.
   */
  projectSchedule?: ProjectScheduleStep[]

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
  projectScheduleRows: number
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
  const allowedTypes = ['RECIPE', 'TECHNIQUE', 'PRACTICE', 'READING'] as const
  if (input.type && !allowedTypes.includes(input.type)) {
    throw new Error(
      `input.type "${input.type}" must be one of ${allowedTypes.join(' | ')}.`,
    )
  }
  if (!input.body || input.body.type !== 'doc' || !Array.isArray(input.body.content)) {
    throw new Error('input.body must be a TipTap document: { type: "doc", content: [...] }.')
  }
  if (input.practice) {
    const validPracticeTypes: PracticeType[] = [
      'TAPPING', 'ENERGY_STATEMENT', 'AFFIRMATION', 'SPELL', 'RITUAL',
      'ACTIVITY', 'JOURNAL_PROMPT', 'VISUALISATION', 'MEDITATION',
      'EMBODIMENT', 'READING',
    ]
    if (!validPracticeTypes.includes(input.practice.practiceType)) {
      throw new Error(
        `practice.practiceType "${input.practice.practiceType}" must be one of ${validPracticeTypes.join(' | ')}.`,
      )
    }
    if (!Array.isArray(input.practice.practiceTargets) || input.practice.practiceTargets.length === 0) {
      throw new Error('practice.practiceTargets must be a non-empty array.')
    }
    const validTimeBands: TimeBand[] = ['THREE_MIN', 'FIVE_MIN', 'TEN_MIN', 'TWENTY_MIN', 'THIRTY_PLUS']
    if (!validTimeBands.includes(input.practice.timeBand)) {
      throw new Error(
        `practice.timeBand "${input.practice.timeBand}" must be one of ${validTimeBands.join(' | ')}.`,
      )
    }
    const validBestTimes: BestTime[] = ['MORNING', 'EVENING', 'ANYTIME', 'AS_NEEDED']
    if (!validBestTimes.includes(input.practice.bestTime)) {
      throw new Error(
        `practice.bestTime "${input.practice.bestTime}" must be one of ${validBestTimes.join(' | ')}.`,
      )
    }
  }
  if ((input.type === 'PRACTICE' || input.type === 'READING') && !input.practice) {
    throw new Error(
      `input.practice is required when type is "${input.type}".`,
    )
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

  // ProjectSchedule validation. Hard rule: schedules only make sense on
  // long-arc RECIPE rows (and the rare long-arc PRACTICE). TECHNIQUE rows are
  // reference how-tos and never carry a schedule; READING rows are static
  // articles that don't have a real-world arc either. Reject those.
  if (input.projectSchedule && input.projectSchedule.length > 0) {
    const tutorialType = input.type ?? 'RECIPE'
    if (tutorialType === 'TECHNIQUE' || tutorialType === 'READING') {
      throw new Error(
        `projectSchedule is not allowed on type "${tutorialType}". Schedules are only valid on long-arc RECIPE (or PRACTICE) tutorials.`,
      )
    }
    const validSurfaces: ScheduleSurface[] = ['HERO', 'RAIL_CARD', 'NOTIFICATION_ONLY']
    const seenStepNumbers = new Set<number>()
    let previousStepNumber = 0
    let previousOffsetDays = -1
    for (const step of input.projectSchedule) {
      if (!Number.isInteger(step.stepNumber) || step.stepNumber < 1) {
        throw new Error(
          `projectSchedule.stepNumber must be an integer >= 1 (got ${step.stepNumber}).`,
        )
      }
      if (seenStepNumbers.has(step.stepNumber)) {
        throw new Error(
          `projectSchedule.stepNumber ${step.stepNumber} is duplicated. Step numbers must be unique.`,
        )
      }
      if (step.stepNumber <= previousStepNumber) {
        throw new Error(
          `projectSchedule.stepNumber must increase monotonically (saw ${step.stepNumber} after ${previousStepNumber}).`,
        )
      }
      if (!Number.isInteger(step.offsetDays) || step.offsetDays < 0) {
        throw new Error(
          `projectSchedule[step ${step.stepNumber}].offsetDays must be an integer >= 0 (got ${step.offsetDays}).`,
        )
      }
      if (step.offsetDays < previousOffsetDays) {
        throw new Error(
          `projectSchedule[step ${step.stepNumber}].offsetDays must be >= the previous step's offsetDays (${previousOffsetDays}).`,
        )
      }
      if (!step.title || typeof step.title !== 'string' || step.title.trim().length === 0) {
        throw new Error(
          `projectSchedule[step ${step.stepNumber}].title is required.`,
        )
      }
      if (!step.body || typeof step.body !== 'string' || step.body.trim().length === 0) {
        throw new Error(
          `projectSchedule[step ${step.stepNumber}].body is required.`,
        )
      }
      if (step.surfaceAs && !validSurfaces.includes(step.surfaceAs)) {
        throw new Error(
          `projectSchedule[step ${step.stepNumber}].surfaceAs "${step.surfaceAs}" must be one of ${validSurfaces.join(' | ')}.`,
        )
      }
      seenStepNumbers.add(step.stepNumber)
      previousStepNumber = step.stepNumber
      previousOffsetDays = step.offsetDays
    }
  }
}
