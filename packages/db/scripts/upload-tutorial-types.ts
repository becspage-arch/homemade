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

export type TutorialType =
  | 'RECIPE'
  | 'TECHNIQUE'
  | 'PRACTICE'
  | 'READING'
  | 'GROWING_GUIDE'
  | 'REMEDY'
  | 'HERB_PROFILE'
  | 'STITCH'
  | 'PATTERN'

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

/**
 * Regions a growing-guide schedule applies to. The author writes a UK-default
 * schedule; this flag expands readership where the same schedule applies
 * (frost dates / day-length / soil temperatures translate well to similar
 * latitudes). Free-form additions are fine — the upload script validates
 * the values are non-empty strings, not against a fixed set, so authors can
 * refine the geography without a migration.
 */
export type GardenRegion =
  | 'UK'
  | 'EU'
  | 'US_NORTH'
  | 'US_SOUTH'
  | 'AU_NZ'
  | 'ZA'

/**
 * Garden-specific growing-guide metadata. Required when `type === 'GROWING_GUIDE'`.
 * Mirrors the Garden-specific columns added by the
 * `phase_garden_pipeline_001` migration. Garden tutorials don't carry the
 * full recipe block — `recipe` should be null / omitted on GROWING_GUIDE rows.
 */
export interface GardenMetadata {
  /**
   * Slug of the canonical PlantVariety this guide covers. Must exist in
   * the master `PlantVariety` table. Required.
   */
  plantSlug: string

  /**
   * Sub-topic within the growing guide. The author docs describe what each
   * sub-topic emphasises in body shape (sowing covers when / depth / spacing;
   * harvesting covers when / how / signs of readiness; etc.).
   * One of:
   *   sowing | growing | harvesting | saving-seed | pruning |
   *   pest-management | season-extension | variety-selection
   */
  subTopic:
    | 'sowing'
    | 'growing'
    | 'harvesting'
    | 'saving-seed'
    | 'pruning'
    | 'pest-management'
    | 'season-extension'
    | 'variety-selection'

  /** Months when the plant is sown / planted ('march', 'april', ...). */
  plantingMonths?: string[]
  /** Months when the plant is harvested / picked. */
  harvestMonths?: string[]

  /** True if the plant grows happily in a container / pot. */
  containerFriendly?: boolean | null
  /** True if the plant grows happily indoors / on a windowsill. */
  indoorFriendly?: boolean | null

  /**
   * Regions the schedule applies to. Defaults to ['UK'] at upload time when
   * omitted. Add EU / US_NORTH / US_SOUTH / AU_NZ / ZA when the schedule
   * translates cleanly.
   */
  regionsApplicable?: GardenRegion[] | string[]
}

/**
 * Herbal preparation taxonomy. Set on REMEDY rows. The `Herb`-keyed
 * relations in `HerbConditionUse` carry the same string set.
 */
export type HerbalPreparationType =
  | 'tincture'
  | 'decoction'
  | 'infusion'
  | 'oil'
  | 'salve'
  | 'balm'
  | 'syrup'
  | 'compress'
  | 'poultice'
  | 'bath'
  | 'steam'
  | 'inhalation'
  | 'gargle'
  | 'capsule'

/**
 * Herbal-medicine-specific tutorial metadata. Required when
 * `type === 'REMEDY'` or `type === 'HERB_PROFILE'`. Null / omitted on
 * every other type. Maps directly onto the `Tutorial.primaryHerbId` etc.
 * columns added by `phase_herbal_pipeline_scaffold`.
 *
 * REMEDY tutorials always set `preparationType` AND `primaryHerbSlug`;
 * `relatedConditionSlugs` is optional but typical (a peppermint
 * infusion is "for indigestion + nausea"). HERB_PROFILE tutorials set
 * only `primaryHerbSlug` — no preparation, no related conditions
 * (the herb's own `HerbConditionUse` rows surface that data).
 *
 * `safetyFlags` extends the primary herb's master flags with any
 * tutorial-specific cautions (e.g. "pregnancy-caution-third-trimester"
 * when the master flag is the broader "pregnancy-caution"). The upload
 * script accepts either the inherited flags as-is or an explicit
 * extension list — it does not auto-merge.
 *
 * `requiresMedicalDisclaimer` defaults true. Leave it true unless the
 * tutorial is a pure-historical materia-medica reading where the
 * disclaimer is handled inline in the body.
 */
export interface HerbalMetadata {
  /** Slug of a row in the master `Herb` table. Required for REMEDY + HERB_PROFILE. */
  primaryHerbSlug: string
  /** Slugs in the master `Condition` table. Optional; typical for REMEDY. */
  relatedConditionSlugs?: string[]
  /** Required for REMEDY; null / omitted for HERB_PROFILE. */
  preparationType?: HerbalPreparationType | null
  /** Master herb flags + any tutorial-specific extensions. */
  safetyFlags?: string[]
  /** Defaults true. Editor override only. */
  requiresMedicalDisclaimer?: boolean
}

/**
 * Sewing-specific tutorial metadata. Required when `type === 'PATTERN'` and
 * for `type === 'TECHNIQUE'` rows that sit under the Sewing category.
 * Null / omitted on every other type.
 *
 * Maps onto the `Tutorial.craftType / projectShape / requiredFabricTypes /
 * requiredNotions / sewingMethod / fabricYardageMetres / finishedDimensionsCm /
 * bodyMeasurementsRequired` columns added by `phase_sewing_pipeline_001`.
 *
 * `craftType` is the shared discriminator across craft pipelines — set to
 * 'sewing' for every entry under this prompt. Future craft pipelines
 * (knitting / crochet / fibre-arts / wood / pottery / paper) will reuse
 * the same column with their own value.
 *
 * `projectShape` is required on PATTERN rows and gates the scope rule:
 * fitted-garment patterns are out of launch scope. Valid values are
 * `rectangle | gathered-rectangle | panel-construction | circle |
 * from-measurements | unconstructed` — explicitly no `fitted-pattern`
 * value at launch.
 *
 * `requiredFabricTypes` are slugs from the master `Fabric` table; the
 * upload script validates them. `requiredNotions` are slugs from the
 * master `SewingNotion` table; same validation.
 *
 * `sewingMethod` drives the "machine required?" filter — a chunk of the
 * audience has no machine, and the public browse surfaces a hand-sewn-only
 * filter.
 */
export type ProjectShape =
  | 'rectangle'
  | 'gathered-rectangle'
  | 'panel-construction'
  | 'circle'
  | 'from-measurements'
  | 'unconstructed'

export type SewingMethod = 'hand-sewn' | 'machine' | 'mixed'

export type BodyMeasurement =
  | 'bust'
  | 'waist'
  | 'hip'
  | 'inseam'
  | 'desired-length'
  | 'desired-width'
  | 'shoulder-to-waist'
  | 'shoulder-to-hem'
  | 'head-circumference'
  | 'wrist-circumference'
  | 'thigh'
  | 'upper-arm'

export interface SewingMetadata {
  /** 'sewing' for every entry under the Sewing pipeline. */
  craftType: 'sewing'
  /** Required on PATTERN rows; omit on TECHNIQUE rows. */
  projectShape?: ProjectShape | null
  /** Master Fabric slugs. Validated on upload. */
  requiredFabricSlugs?: string[]
  /** Master SewingNotion slugs. Validated on upload. */
  requiredNotionSlugs?: string[]
  sewingMethod?: SewingMethod | null
  /** Rough yardage at the base size, metres, standard 112 cm fabric width. */
  fabricYardageMetres?: number | null
  /** Free-form JSON. Typical shape {widthCm, heightCm} or {widthCm, heightCm, depthCm}. */
  finishedDimensionsCm?: Record<string, unknown> | null
  /** Body measurements the pattern depends on. Empty on bag / cushion / curtain / etc. */
  bodyMeasurementsRequired?: BodyMeasurement[] | string[]
}

/**
 * Crochet (and the knitting pipeline that follows) terminology convention.
 * Drives the abbreviation set the renderer shows in the stitch legend and
 * the chart-symbol key. UK-first publication policy: default 'uk'.
 */
export type CraftTerminologyConvention = 'uk' | 'us'

/**
 * Crochet-specific tutorial metadata. Required when `type === 'PATTERN'`
 * and the tutorial sits under the `crochet` Category. Recommended (though
 * not required) when `type === 'STITCH'`. Null / omitted on every other
 * type and on sewing PATTERN rows (which set `sewing` instead). Maps onto
 * the `Tutorial.primaryYarnWeightId` / `primaryHookId` / `gaugeText` /
 * `finishedSizeText` / `terminologyConvention` / `chartDefinition` /
 * `craftStitchSlugs` / `craftTechniqueTags` columns added by
 * `phase_crochet_pipeline_scaffold`.
 *
 * PATTERN tutorials set every field except optionally `chartDefinition`
 * (simple-dishcloth has no chart). STITCH tutorials carry `craftStitchSlugs`
 * (the one slug for the stitch being taught) and may add `chartDefinition`
 * if a one-symbol chart helps; they typically omit yarn / hook / gauge /
 * finished-size because the tutorial demonstrates the stitch, not a piece.
 *
 * `chartDefinition` is the inline JSON the SVG chart renderer reads. Shape
 * documented in `apps/web/src/lib/craft-charts/types.ts`.
 */
export interface CrochetMetadata {
  /** Slug in the master `YarnWeight` table. Required for PATTERN. */
  primaryYarnWeightSlug?: string | null
  /** Slug in the master `CrochetHook` table. Required for PATTERN. */
  primaryHookSlug?: string | null
  /** Author-written gauge text — '18 dc × 10 rows = 10 × 10 cm in 4 mm hook'. */
  gaugeText?: string | null
  /** Author-written finished size — '30 × 30 cm', 'Adult medium: 92 cm chest'. */
  finishedSizeText?: string | null
  /** UK-first default; 'us' only when the source pattern is American. */
  terminologyConvention?: CraftTerminologyConvention
  /**
   * Generic chart definition consumed by the shared SVG renderer. Shape
   * matches `apps/web/src/lib/craft-charts/types.ts`. Optional — patterns
   * without a chart leave it null.
   */
  chartDefinition?: Record<string, unknown> | null
  /**
   * Slugs of stitches featured in this tutorial. Every slug must exist in
   * the master `Stitch` table; the upload script validates. STITCH rows
   * carry one slug (the stitch being taught); PATTERN rows carry every
   * stitch the pattern uses.
   */
  craftStitchSlugs?: string[]
  /**
   * Free-form technique tags surfaced in the info bar and on the public
   * browse — e.g. 'magic-ring', 'joining-as-you-go', 'tapestry-crochet',
   * 'blocking', 'invisible-finish', 'chainless-foundation'.
   */
  craftTechniqueTags?: string[]
}

/**
 * Knitting-specific tutorial metadata. Required when `type === 'PATTERN'`
 * and the tutorial sits under the `knitting` Category. Recommended (though
 * not required) when `type === 'STITCH'`. Null / omitted on every other
 * type.
 *
 * Knitting harmonises with the Crochet pipeline scaffold — it writes
 * through to the same `Tutorial.primaryYarnWeightId / gaugeText /
 * finishedSizeText / terminologyConvention / chartDefinition /
 * craftStitchSlugs / craftTechniqueTags` columns. The one knitting-
 * specific field is `primaryNeedleSlug`, which resolves against the
 * master `KnittingNeedle` table and writes through to
 * `Tutorial.primaryNeedleId`.
 *
 * Conventions for the knitting pipeline:
 *
 *   - `craftStitchSlugs` carry `knitting-*` prefixed slugs
 *     (`knitting-knit`, `knitting-c4f`, ...).
 *   - `craftTechniqueTags` includes the knitting-specific filter values
 *     `cabling` / `lacework` / `colorwork` / `in-the-round` /
 *     `flat-construction` alongside the generic ones.
 *   - `chartDefinition` follows the shared `ChartDefinition` shape with
 *     `craft: 'knitting'` and `layout: 'flat'` (knitting in-the-round is
 *     charted as a flat repeat per knitting publishing convention).
 *     Multi-chart pattern bodies inline `craftChart` TipTap nodes for
 *     additional charts; the Tutorial-level `chartDefinition` is the
 *     canonical chart for the pattern.
 */
export interface KnittingMetadata {
  /** Slug in the master `YarnWeight` table. Required for PATTERN. */
  primaryYarnWeightSlug?: string | null
  /** Slug in the master `KnittingNeedle` table. Required for PATTERN. */
  primaryNeedleSlug?: string | null
  /** Author-written gauge — '18 sts × 28 rows = 10 × 10 cm in 5 mm needles, blocked'. */
  gaugeText?: string | null
  /** Author-written finished size — '180 × 22 cm', 'Adult head 56 cm'. */
  finishedSizeText?: string | null
  /** UK-first default; 'us' only when the source pattern is American. */
  terminologyConvention?: CraftTerminologyConvention
  /**
   * Generic chart definition consumed by the shared SVG renderer. Knitting
   * uses `craft: 'knitting'` + `layout: 'flat'`. Optional — patterns
   * without a chart leave it null.
   */
  chartDefinition?: Record<string, unknown> | null
  /**
   * Slugs of stitches featured in this tutorial. Every slug must exist in
   * the master `Stitch` table with `craft = 'knitting'`. STITCH rows carry
   * one slug; PATTERN rows carry every stitch the pattern uses.
   */
  craftStitchSlugs?: string[]
  /**
   * Free-form technique tags. Knitting-specific values:
   * `cabling` / `lacework` / `colorwork` / `in-the-round` /
   * `flat-construction` / `magic-loop` / `kitchener` / `short-rows`.
   */
  craftTechniqueTags?: string[]
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

  /**
   * Finished-product shelf life in days. Set on natural-home recipes
   * (anhydrous balm ~365, water-containing lotion without preservative
   * ~90, cured cold-process soap ~730) and on herbal REMEDY rows where
   * a structured integer adds value alongside `makeAheadNotes`. Leave
   * null on every cooking + baking recipe — food shelf life lives in
   * `freezeNotes` / `makeAheadNotes`. Maps onto `Tutorial.shelfLifeDays`.
   */
  shelfLifeDays?: number | null

  /**
   * Human-readable shelf-life caveat. The integer can't carry the
   * storage condition or the spoilage cue, so this string does. Example:
   * "Store in a cool dark cupboard; discard if the surface develops
   * white spots or the salve smells rancid." Maps onto
   * `Tutorial.shelfLifeNotes`.
   */
  shelfLifeNotes?: string | null
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
   * Garden growing-guide metadata. Required when `type === 'GROWING_GUIDE'`.
   * Maps onto the `Tutorial.plantingMonths / harvestMonths / containerFriendly /
   * indoorFriendly / regionsApplicable` columns added by the
   * `phase_garden_pipeline_001` migration. The `plantSlug` must exist in the
   * master `PlantVariety` table — the upload script validates this.
   * Null / omitted on every other tutorial type.
   */
  garden?: GardenMetadata | null

  /**
   * Herbal-medicine metadata. Required when `type === 'REMEDY'` or
   * `type === 'HERB_PROFILE'`. Null / omitted on every other type.
   * Maps directly onto the `Tutorial.primaryHerbId` / `preparationType`
   * / `safetyFlags` / `requiresMedicalDisclaimer` columns added by
   * `phase_herbal_pipeline_scaffold`.
   */
  herbal?: HerbalMetadata | null

  /**
   * Sewing metadata. Required when `type === 'PATTERN'` under the Sewing
   * Category, and for sewing-discipline TECHNIQUE rows. Null / omitted on
   * every non-sewing tutorial (crochet PATTERN rows set `crochet` instead).
   * Maps onto the `Tutorial.craftType / projectShape / requiredFabricTypes
   * / requiredNotions / sewingMethod / fabricYardageMetres /
   * finishedDimensionsCm / bodyMeasurementsRequired` columns added by
   * `phase_sewing_pipeline_001`. Fabric and notion slugs are validated
   * against the master `Fabric` / `SewingNotion` tables at upload time.
   */
  sewing?: SewingMetadata | null

  /**
   * Crochet metadata. Required when `type === 'PATTERN'` under the Crochet
   * Category; recommended on `type === 'STITCH'`. Null / omitted on every
   * non-crochet tutorial (sewing PATTERN rows set `sewing` instead). Maps
   * onto the `Tutorial.primaryYarnWeightId` / `primaryHookId` / `gaugeText`
   * / `finishedSizeText` / `terminologyConvention` / `chartDefinition` /
   * `craftStitchSlugs` / `craftTechniqueTags` columns added by
   * `phase_crochet_pipeline_scaffold`. The knitting + needlework pipelines
   * will reuse this block; only the hook-vs-needle FK differs.
   */
  crochet?: CrochetMetadata | null

  /**
   * Knitting metadata. Required when `type === 'PATTERN'` under the Knitting
   * Category; recommended on `type === 'STITCH'`. Null / omitted on every
   * non-knitting tutorial. Writes through to the same
   * `Tutorial.primaryYarnWeightId / gaugeText / finishedSizeText /
   * terminologyConvention / chartDefinition / craftStitchSlugs /
   * craftTechniqueTags` columns the crochet block writes to. The one
   * knitting-specific column is `Tutorial.primaryNeedleId`, resolved from
   * `knitting.primaryNeedleSlug` against the master `KnittingNeedle` table
   * added by `phase_knitting_pipeline_001`.
   */
  knitting?: KnittingMetadata | null

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
    /** Filesystem path — local upload pathway. */
    localPath?: string | null
    /** Remote URL — orchestrator pathway. The script fetches, then pushes to R2. */
    remoteUrl?: string | null
    alt?: string | null
    caption?: string | null
    /** Legacy free-text credit. Prefer the structured fields below. */
    attribution?: string | null

    // ──────────────────────────────────────────────────────────────────────
    // Structured sourcing + attribution metadata (phase_8_content_integration_001).
    // Set by the image-sourcing orchestrator. The script copies these onto the
    // Media row so the public renderer can decide whether to show the discreet
    // attribution tooltip.
    // ──────────────────────────────────────────────────────────────────────
    source?: string | null
    sourceUrl?: string | null
    creatorName?: string | null
    licenceCode?: string | null
    licenceUrl?: string | null
    requiresAttribution?: boolean | null
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
   * Technique tutorial slugs this row references inline. Every slug here
   * should correspond to a `techniqueLink` mark somewhere in the body. The
   * script persists the deduplicated list onto `Tutorial.techniqueSlugs`
   * for the future "Recipes using this technique" rail (see
   * `phase_technique_linking_001`). Slugs are NOT validated against the
   * `Tutorial` table at upload — the rail tolerates dangling slugs (the
   * link falls back to plain text), and rejecting on a missing technique
   * row would block authors from wrapping technique words before the
   * matching technique tutorial is published.
   *
   * Empty / omitted is fine — most rows will be empty at first; the
   * Mindset pipeline never sets this (mindset techniques are sub-
   * categories, not tutorials).
   */
  techniqueSlugs?: string[]

  /**
   * Subset of `techniqueSlugs` whose techniques the recipe genuinely
   * depends on — without which the recipe doesn't work. Used by the rail
   * to rank "recipes that depend on this technique" above "recipes that
   * mention it in passing". Every slug here MUST also appear in
   * `techniqueSlugs`; the validator checks that.
   */
  criticalTechniques?: string[]

  /**
   * Common phrasings the reverse-sweep should match when this is a
   * TECHNIQUE row (e.g. `blind-baking` aliases ["blind baking",
   * "pre-bake the pastry"]). Ignored on every other tutorial type. The
   * sweep adds these to its search-term set alongside the canonical
   * title and the slug-with-spaces. Empty / omitted is fine — most
   * techniques have a title phrasing that's already what authors write
   * inline, so the alias list only covers the cases where authors
   * habitually use a different phrasing. See
   * `apps/web/src/lib/technique-sweep.ts` for the matching contract.
   */
  aliases?: string[]

  /**
   * Approximate setup cost in whole £ GBP (sustainability + likely Home &
   * repair). Order-of-magnitude budgeting — £40 for a draught-proofing kit,
   * £8000 for a heat pump. NULL on tutorials where cost is not the deciding
   * variable (composting, foraging, lifestyle adjustments).
   */
  approximateCostGbp?: number | null

  /**
   * Years for the saving to recoup `approximateCostGbp`. 0 = pays back
   * inside the first year. NULL = no financial payback to compute (e.g.
   * composting saves council fees indirectly, not as a quantified return),
   * or unknown / depends on usage.
   */
  paybackYears?: number | null

  /**
   * TipTap document. The top-level node is always `{ type: 'doc', content: [...] }`.
   *
   * Node types supported (StarterKit + custom blocks):
   *   StarterKit: paragraph, heading (attrs.level 1-6), bulletList, orderedList,
   *               listItem, blockquote, codeBlock, horizontalRule, hardBreak, image
   *   Marks:      bold, italic, underline, strike, code, link (attrs.href),
   *               glossaryTooltip (attrs.termSlug — swapped for termId on upload),
   *               techniqueLink (attrs.techniqueSlug, attrs.label — see
   *                 `phase_technique_linking_001`. Wraps a span of text with
   *                 a pointer to a technique tutorial by slug; renderer falls
   *                 back to plain text if the slug doesn't resolve to a
   *                 published TECHNIQUE row yet.)
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
  const allowedTypes = [
    'RECIPE', 'TECHNIQUE', 'PRACTICE', 'READING', 'GROWING_GUIDE',
    'REMEDY', 'HERB_PROFILE',
    'STITCH', 'PATTERN',
  ] as const
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
  if (input.type === 'PRACTICE' && !input.practice) {
    throw new Error(
      `input.practice is required when type is "PRACTICE".`,
    )
  }

  // Herbal-medicine validation.
  if (input.herbal) {
    if (!input.herbal.primaryHerbSlug || !SLUG_PATTERN.test(input.herbal.primaryHerbSlug)) {
      throw new Error(
        `herbal.primaryHerbSlug "${input.herbal.primaryHerbSlug}" must match the slug pattern.`,
      )
    }
    for (const condSlug of input.herbal.relatedConditionSlugs ?? []) {
      if (!SLUG_PATTERN.test(condSlug)) {
        throw new Error(
          `herbal.relatedConditionSlugs entry "${condSlug}" must match the slug pattern.`,
        )
      }
    }
    const validPrepTypes: HerbalPreparationType[] = [
      'tincture', 'decoction', 'infusion', 'oil', 'salve', 'balm', 'syrup',
      'compress', 'poultice', 'bath', 'steam', 'inhalation', 'gargle', 'capsule',
    ]
    if (input.herbal.preparationType && !validPrepTypes.includes(input.herbal.preparationType)) {
      throw new Error(
        `herbal.preparationType "${input.herbal.preparationType}" must be one of ${validPrepTypes.join(' | ')}.`,
      )
    }
  }
  if ((input.type === 'REMEDY' || input.type === 'HERB_PROFILE') && !input.herbal) {
    throw new Error(
      `input.herbal is required when type is "${input.type}".`,
    )
  }
  if (input.type === 'REMEDY' && !input.herbal?.preparationType) {
    throw new Error(
      `herbal.preparationType is required when type is "REMEDY".`,
    )
  }

  if (input.garden) {
    if (!input.garden.plantSlug || !SLUG_PATTERN.test(input.garden.plantSlug)) {
      throw new Error(
        `garden.plantSlug "${input.garden.plantSlug}" must match the slug pattern (looked up against the PlantVariety master table).`,
      )
    }
    const validSubTopics = [
      'sowing', 'growing', 'harvesting', 'saving-seed', 'pruning',
      'pest-management', 'season-extension', 'variety-selection',
    ]
    if (!validSubTopics.includes(input.garden.subTopic)) {
      throw new Error(
        `garden.subTopic "${input.garden.subTopic}" must be one of ${validSubTopics.join(' | ')}.`,
      )
    }
    const validMonths = new Set([
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december',
    ])
    for (const m of input.garden.plantingMonths ?? []) {
      if (!validMonths.has(m)) {
        throw new Error(
          `garden.plantingMonths "${m}" must be a lower-case month name.`,
        )
      }
    }
    for (const m of input.garden.harvestMonths ?? []) {
      if (!validMonths.has(m)) {
        throw new Error(
          `garden.harvestMonths "${m}" must be a lower-case month name.`,
        )
      }
    }
    for (const r of input.garden.regionsApplicable ?? []) {
      if (typeof r !== 'string' || r.length === 0) {
        throw new Error(
          `garden.regionsApplicable entries must be non-empty strings (got "${r}").`,
        )
      }
    }
  }
  if (input.type === 'GROWING_GUIDE' && !input.garden) {
    throw new Error('input.garden is required when type is "GROWING_GUIDE".')
  }

  // Crochet validation.
  if (input.crochet) {
    const c = input.crochet
    if (c.primaryYarnWeightSlug && !SLUG_PATTERN.test(c.primaryYarnWeightSlug)) {
      throw new Error(
        `crochet.primaryYarnWeightSlug "${c.primaryYarnWeightSlug}" must match the slug pattern (looked up against the YarnWeight master table).`,
      )
    }
    if (c.primaryHookSlug && !SLUG_PATTERN.test(c.primaryHookSlug)) {
      throw new Error(
        `crochet.primaryHookSlug "${c.primaryHookSlug}" must match the slug pattern (looked up against the CrochetHook master table).`,
      )
    }
    for (const stitch of c.craftStitchSlugs ?? []) {
      if (!SLUG_PATTERN.test(stitch)) {
        throw new Error(
          `crochet.craftStitchSlugs entry "${stitch}" must match the slug pattern.`,
        )
      }
    }
    for (const tag of c.craftTechniqueTags ?? []) {
      if (typeof tag !== 'string' || tag.length === 0) {
        throw new Error(
          `crochet.craftTechniqueTags entries must be non-empty strings (got "${tag}").`,
        )
      }
    }
    if (c.terminologyConvention && c.terminologyConvention !== 'uk' && c.terminologyConvention !== 'us') {
      throw new Error(
        `crochet.terminologyConvention "${c.terminologyConvention}" must be 'uk' or 'us'.`,
      )
    }
    if (c.chartDefinition !== undefined && c.chartDefinition !== null && typeof c.chartDefinition !== 'object') {
      throw new Error(
        'crochet.chartDefinition must be an object matching the ChartDefinition shape (or null when no chart).',
      )
    }
  }
  // Knitting block validation. Mirrors the crochet block — the two share
  // the same shape almost field-for-field; only the hook/needle slug
  // differs. Knitting `craftStitchSlugs` are validated lightly here
  // (slug pattern only); the upload script resolves them against the
  // master Stitch table.
  if (input.knitting) {
    const k = input.knitting
    if (k.primaryYarnWeightSlug && !SLUG_PATTERN.test(k.primaryYarnWeightSlug)) {
      throw new Error(
        `knitting.primaryYarnWeightSlug "${k.primaryYarnWeightSlug}" must match the slug pattern (looked up against the YarnWeight master table).`,
      )
    }
    if (k.primaryNeedleSlug && !SLUG_PATTERN.test(k.primaryNeedleSlug)) {
      throw new Error(
        `knitting.primaryNeedleSlug "${k.primaryNeedleSlug}" must match the slug pattern (looked up against the KnittingNeedle master table).`,
      )
    }
    for (const stitch of k.craftStitchSlugs ?? []) {
      if (!SLUG_PATTERN.test(stitch)) {
        throw new Error(
          `knitting.craftStitchSlugs entry "${stitch}" must match the slug pattern.`,
        )
      }
    }
    for (const tag of k.craftTechniqueTags ?? []) {
      if (typeof tag !== 'string' || tag.length === 0) {
        throw new Error(
          `knitting.craftTechniqueTags entries must be non-empty strings (got "${tag}").`,
        )
      }
    }
    if (k.terminologyConvention && k.terminologyConvention !== 'uk' && k.terminologyConvention !== 'us') {
      throw new Error(
        `knitting.terminologyConvention "${k.terminologyConvention}" must be 'uk' or 'us'.`,
      )
    }
    if (k.chartDefinition !== undefined && k.chartDefinition !== null && typeof k.chartDefinition !== 'object') {
      throw new Error(
        'knitting.chartDefinition must be an object matching the ChartDefinition shape (or null when no chart).',
      )
    }
  }
  // PATTERN dispatch: crochet PATTERN rows require a `crochet` block;
  // knitting PATTERN rows require a `knitting` block; sewing PATTERN rows
  // require a `sewing` block. Wood-natural-craft, pottery-ceramics, and
  // other craft-category PATTERN rows carry only `recipeTools` and no
  // additional metadata block.
  if (input.type === 'PATTERN') {
    const isCrochetPattern = input.categorySlug === 'crochet'
    const isKnittingPattern = input.categorySlug === 'knitting'
    const isSewingPattern = input.categorySlug === 'sewing'
    if (isCrochetPattern && !input.crochet) {
      throw new Error('input.crochet is required when type is "PATTERN" under the crochet category.')
    }
    if (isKnittingPattern && !input.knitting) {
      throw new Error('input.knitting is required when type is "PATTERN" under the knitting category.')
    }
    if (isSewingPattern && !input.sewing) {
      throw new Error('input.sewing is required when type is "PATTERN" under the sewing category.')
    }
    if (input.crochet) {
      if (!input.crochet.primaryYarnWeightSlug) {
        throw new Error('crochet.primaryYarnWeightSlug is required on a crochet PATTERN.')
      }
      if (!input.crochet.primaryHookSlug) {
        throw new Error('crochet.primaryHookSlug is required on a crochet PATTERN.')
      }
      if (!input.crochet.gaugeText) {
        throw new Error('crochet.gaugeText is required on a crochet PATTERN.')
      }
      if (!input.crochet.finishedSizeText) {
        throw new Error('crochet.finishedSizeText is required on a crochet PATTERN.')
      }
    }
    if (input.knitting) {
      if (!input.knitting.primaryYarnWeightSlug) {
        throw new Error('knitting.primaryYarnWeightSlug is required on a knitting PATTERN.')
      }
      if (!input.knitting.primaryNeedleSlug) {
        throw new Error('knitting.primaryNeedleSlug is required on a knitting PATTERN.')
      }
      if (!input.knitting.gaugeText) {
        throw new Error('knitting.gaugeText is required on a knitting PATTERN.')
      }
      if (!input.knitting.finishedSizeText) {
        throw new Error('knitting.finishedSizeText is required on a knitting PATTERN.')
      }
    }
  }
  if (input.type === 'STITCH' && !input.crochet && !input.knitting) {
    throw new Error(
      'input.crochet or input.knitting is required when type is "STITCH" (carries the stitch slug + optional chart definition).',
    )
  }
  for (const g of input.glossaryTerms ?? []) {
    if (!g.slug || !SLUG_PATTERN.test(g.slug)) {
      throw new Error(`glossaryTerms[].slug "${g.slug}" must match the slug pattern.`)
    }
    if (!g.term) throw new Error(`glossaryTerms entry "${g.slug}" missing term.`)
    if (!g.definition) throw new Error(`glossaryTerms entry "${g.slug}" missing definition.`)
  }
  // Technique-linking validation (phase_technique_linking_001). Slugs are
  // not cross-checked against the Tutorial table — see the type comment for
  // the reason — but each must match the slug pattern, and every entry in
  // `criticalTechniques` must also appear in `techniqueSlugs` so the
  // "critical-subset" semantic stays intact.
  const techniqueSlugSet = new Set<string>()
  for (const slug of input.techniqueSlugs ?? []) {
    if (!SLUG_PATTERN.test(slug)) {
      throw new Error(
        `techniqueSlugs entry "${slug}" must match the slug pattern (lowercase letters, numbers, hyphens).`,
      )
    }
    techniqueSlugSet.add(slug)
  }
  for (const slug of input.criticalTechniques ?? []) {
    if (!SLUG_PATTERN.test(slug)) {
      throw new Error(
        `criticalTechniques entry "${slug}" must match the slug pattern.`,
      )
    }
    if (!techniqueSlugSet.has(slug)) {
      throw new Error(
        `criticalTechniques entry "${slug}" must also appear in techniqueSlugs. ` +
          `Every critical technique must be in the full set.`,
      )
    }
  }
  for (const alias of input.aliases ?? []) {
    if (typeof alias !== 'string' || alias.trim().length === 0) {
      throw new Error(
        `aliases entries must be non-empty strings (got "${alias}").`,
      )
    }
  }
  if (input.approximateCostGbp != null) {
    if (!Number.isFinite(input.approximateCostGbp) || input.approximateCostGbp < 0) {
      throw new Error(
        `approximateCostGbp must be a non-negative number in whole £ (got ${input.approximateCostGbp}).`,
      )
    }
  }
  if (input.paybackYears != null) {
    if (!Number.isFinite(input.paybackYears) || input.paybackYears < 0) {
      throw new Error(
        `paybackYears must be a non-negative number (got ${input.paybackYears}).`,
      )
    }
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
    if (
      tutorialType === 'TECHNIQUE' ||
      tutorialType === 'READING' ||
      tutorialType === 'HERB_PROFILE' ||
      tutorialType === 'STITCH'
    ) {
      throw new Error(
        `projectSchedule is not allowed on type "${tutorialType}". Schedules are only valid on long-arc RECIPE / REMEDY / PRACTICE / PATTERN tutorials.`,
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
