/**
 * Input shape for `upload-tutorial.ts`.
 *
 * One JSON file per tutorial. The script resolves category + sub-category by
 * slug (never creates), creates missing glossary terms by slug, uploads the
 * hero image to Cloudflare Images, and inserts (or updates, idempotently) the
 * Tutorial row as DRAFT with a TutorialVersion snapshot.
 *
 * The TipTap body uses node + mark shapes that match what the admin TipTap
 * editor saves. Glossary terms are referenced by `termSlug` inside the mark —
 * the script swaps `termSlug` for `termId` before inserting.
 */

export interface TutorialUploadInput {
  /** URL slug, lowercase letters / numbers / hyphens only. Unique across all tutorials. */
  slug: string

  /** Public title. */
  title: string

  /** Optional sub-title (rendered above the hero). */
  subtitle?: string | null

  /** Short summary used on cards and meta description. */
  excerpt?: string | null

  /** Category slug — must already exist in `/admin/categories`. */
  categorySlug: string

  /** Optional sub-category slug — must already exist under the chosen category. */
  subCategorySlug?: string | null

  /** Default BEGINNER. */
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

  /** Optional season. */
  season?: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER' | 'YEAR_ROUND' | null

  /** Total time the tutorial takes in minutes. */
  timeMinutes?: number | null

  /** Default PUBLIC_DOMAIN. */
  sourceType?: 'TESTED' | 'CLASSIC' | 'SYNTHESISED' | 'PUBLIC_DOMAIN' | 'CREATOR'

  /** Reference list / attribution notes (rendered in the sources aside). */
  sourceNotes?: string | null

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
   * Node types supported (from StarterKit + the eight custom blocks):
   *   StarterKit: paragraph, heading (attrs.level 1-6), bulletList, orderedList,
   *               listItem, blockquote, codeBlock, horizontalRule, hardBreak, image
   *   Marks:      bold, italic, underline, strike, code, link (attrs.href),
   *               glossaryTooltip (attrs.termSlug — swapped for termId on upload)
   *   Custom blocks: infoPanel (attrs: tone, title, body),
   *                  suppliesCard (attrs: heading, items[]{name,qty,link,substitutions}),
   *                  pullQuote (attrs: quote, attribution),
   *                  subTutorialCard (attrs: tutorialId),
   *                  productCard (attrs: imageUrl, title, description, label, price,
   *                               currency, retailerName, productUrl),
   *                  varietiesPanel (attrs: label, heading, intro, items[]{name,type,description}),
   *                  troubleshooter (attrs: heading, intro, items[]{symptom,cause,fix})
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
  categorySlug: string
  subCategorySlug: string | null
  heroMediaId: string | null
  heroR2Key: string | null
  createdGlossary: { slug: string; term: string; id: string }[]
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
}
