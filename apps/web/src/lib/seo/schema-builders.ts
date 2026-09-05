/**
 * Schema.org JSON-LD builders. Each helper returns a plain JS object that
 * is JSON-stringified into a `<script type="application/ld+json">` tag by
 * the `JsonLd` component. Builders return `null` when the required inputs
 * aren't there so callers can spread without conditional branches.
 */

import { LEGAL_ENTITY } from '@/lib/legal-entity'
import type { RecipeStep } from './extract-recipe-instructions'
import { SITE_NAME, siteOrigin, siteUrl } from './site-url'

type JsonLd = Record<string, unknown>

// ────────────────────────────────────────────────────────────────────────────
// Root-layout schemas — Organization + WebSite
// ────────────────────────────────────────────────────────────────────────────

export function buildOrganizationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': siteUrl('/#organization'),
    name: SITE_NAME,
    url: siteUrl('/'),
    logo: siteUrl('/icon.png'),
    foundingDate: '2026',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: LEGAL_ENTITY.contactEmail,
    },
  }
}

export function buildWebSiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': siteUrl('/#website'),
    name: SITE_NAME,
    url: siteUrl('/'),
    publisher: { '@id': siteUrl('/#organization') },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteOrigin()}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Breadcrumb
// ────────────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string
  href: string
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: siteUrl(item.href),
    })),
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Tutorial schemas — Recipe / HowTo / Article (per Tutorial.type)
// ────────────────────────────────────────────────────────────────────────────

export interface TutorialAuthorRef {
  name: string
  handle: string | null
}

export interface RecipeIngredientRow {
  amount: number | null
  unit: string | null
  prepNote: string | null
  ingredient: { name: string }
}

export interface RecipeToolRow {
  notes: string | null
  tool: { name: string }
}

export interface RecipeRatingSummary {
  avg: number
  total: number
}

interface RecipeSchemaInput {
  tutorialSlug: string
  categorySlug: string
  title: string
  excerpt: string | null
  heroUrl: string | null
  author: TutorialAuthorRef
  publishedAt: Date | null
  updatedAt: Date
  prepMinutes: number | null
  cookMinutes: number | null
  totalMinutes: number | null
  servings: number | null
  yieldDescription: string | null
  cuisine: string | null
  mealType: string | null
  dietaryFlags: string[]
  ingredients: RecipeIngredientRow[]
  steps: RecipeStep[]
  keywords: string[]
  rating: RecipeRatingSummary | null
  /** Per-serving estimate; null when not every ingredient has the data. */
  nutrition: RecipeNutritionInput | null
}

/** Per-serving nutrition the builder formats into schema.org units. */
export interface RecipeNutritionInput {
  calories: number
  protein: number | null
  fat: number | null
  saturatedFat: number | null
  carbohydrate: number | null
  sugar: number | null
  fibre: number | null
  sodiumMg: number | null
}

export function buildRecipeSchema(input: RecipeSchemaInput): JsonLd {
  const url = siteUrl(`/${input.categorySlug}/${input.tutorialSlug}`)
  const recipeYield = input.yieldDescription ?? (input.servings ? `Serves ${input.servings}` : null)
  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    '@id': `${url}#recipe`,
    name: input.title,
    description: input.excerpt ?? undefined,
    // Google wants `image` as a repeated field of absolute URLs. Recipes with
    // no verified hero fall back to the procedural card, whose URL is relative
    // (/api/procedural-card/…) — invalid for schema.org — so absolutise it.
    image: absoluteImages(input.heroUrl),
    author: buildAuthorRef(input.author),
    datePublished: input.publishedAt?.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    prepTime: isoDuration(input.prepMinutes),
    cookTime: isoDuration(input.cookMinutes),
    totalTime: isoDuration(input.totalMinutes),
    recipeYield: recipeYield ?? undefined,
    recipeCuisine: input.cuisine ?? undefined,
    recipeCategory: input.mealType ?? undefined,
    suitableForDiet: mapDiets(input.dietaryFlags),
    recipeIngredient: input.ingredients.map(formatIngredient),
    recipeInstructions: input.steps.map((step, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: step.name?.trim() || deriveStepName(step.text),
      text: step.text,
    })),
    keywords: input.keywords.length ? input.keywords.join(', ') : undefined,
    nutrition: buildNutritionInformation(input.nutrition, input.servings),
  }
  if (input.rating && input.rating.total > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.rating.avg.toFixed(1),
      ratingCount: input.rating.total,
      bestRating: '5',
      worstRating: '1',
    }
  }
  return stripUndefined(schema)
}

interface HowToSchemaInput {
  tutorialSlug: string
  categorySlug: string
  title: string
  excerpt: string | null
  heroUrl: string | null
  author: TutorialAuthorRef
  publishedAt: Date | null
  updatedAt: Date
  totalMinutes: number | null
  supplies: string[]
  tools: string[]
  instructions: string[]
  keywords: string[]
}

export function buildHowToSchema(input: HowToSchemaInput): JsonLd {
  const url = siteUrl(`/${input.categorySlug}/${input.tutorialSlug}`)
  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${url}#howto`,
    name: input.title,
    description: input.excerpt ?? undefined,
    image: absoluteImages(input.heroUrl),
    author: buildAuthorRef(input.author),
    datePublished: input.publishedAt?.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    totalTime: isoDuration(input.totalMinutes),
    supply: input.supplies.map((s) => ({ '@type': 'HowToSupply', name: s })),
    tool: input.tools.map((s) => ({ '@type': 'HowToTool', name: s })),
    step: input.instructions.map((text, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      text,
    })),
    keywords: input.keywords.length ? input.keywords.join(', ') : undefined,
  }
  return stripUndefined(schema)
}

interface ArticleSchemaInput {
  url: string
  title: string
  excerpt: string | null
  heroUrl: string | null
  author: TutorialAuthorRef
  publishedAt: Date | null
  updatedAt: Date
  articleSection: string | null
  keywords: string[]
}

export function buildArticleSchema(input: ArticleSchemaInput): JsonLd {
  const url = siteUrl(input.url)
  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: input.title,
    description: input.excerpt ?? undefined,
    image: absoluteImages(input.heroUrl),
    author: buildAuthorRef(input.author),
    publisher: { '@id': siteUrl('/#organization') },
    datePublished: input.publishedAt?.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    articleSection: input.articleSection ?? undefined,
    keywords: input.keywords.length ? input.keywords.join(', ') : undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }
  return stripUndefined(schema)
}

// ────────────────────────────────────────────────────────────────────────────
// CollectionPage — category index
// ────────────────────────────────────────────────────────────────────────────

interface CollectionPageInput {
  url: string
  name: string
  description: string | null
  items: { name: string; url: string }[]
}

export function buildCollectionPageSchema(input: CollectionPageInput): JsonLd {
  const url = siteUrl(input.url)
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    name: input.name,
    description: input.description ?? undefined,
    url,
    isPartOf: { '@id': siteUrl('/#website') },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: input.items.length,
      itemListElement: input.items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        url: siteUrl(item.url),
      })),
    },
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Person — Maker profile
// ────────────────────────────────────────────────────────────────────────────

interface PersonSchemaInput {
  handle: string
  name: string
  bio: string | null
  imageUrl: string | null
  sameAs: string[]
}

export function buildPersonSchema(input: PersonSchemaInput): JsonLd {
  const url = siteUrl(`/m/${input.handle}`)
  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${url}#person`,
    name: input.name,
    url,
    description: input.bio ?? undefined,
    image: input.imageUrl ?? undefined,
    sameAs: input.sameAs.length ? input.sameAs : undefined,
  }
  return stripUndefined(schema)
}

// ────────────────────────────────────────────────────────────────────────────
// CreativeWork — public "Made by Maker" entry
// ────────────────────────────────────────────────────────────────────────────

interface CreativeWorkInput {
  handle: string
  projectId: string
  makerName: string
  publishedAt: Date | null
  description: string | null
  imageUrl: string | null
  tutorialTitle: string
  tutorialUrl: string
}

export function buildCreativeWorkSchema(input: CreativeWorkInput): JsonLd {
  const url = siteUrl(`/m/${input.handle}/made/${input.projectId}`)
  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${url}#work`,
    name: `${input.tutorialTitle} — made by ${input.makerName}`,
    url,
    description: input.description ?? undefined,
    image: input.imageUrl ?? undefined,
    author: {
      '@type': 'Person',
      name: input.makerName,
      url: siteUrl(`/m/${input.handle}`),
    },
    datePublished: input.publishedAt?.toISOString(),
    isBasedOn: {
      '@type': 'CreativeWork',
      name: input.tutorialTitle,
      url: siteUrl(input.tutorialUrl),
    },
  }
  return stripUndefined(schema)
}

// ────────────────────────────────────────────────────────────────────────────
// FAQPage (skipped — no FAQ block in the TipTap node set yet; emit when one
// lands by walking the body and pulling Q/A pairs out of a future `faq`
// block.)
// ────────────────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function buildAuthorRef(author: TutorialAuthorRef): JsonLd {
  if (author.handle) {
    return {
      '@type': 'Person',
      name: author.name,
      url: siteUrl(`/m/${author.handle}`),
    }
  }
  return {
    '@type': 'Organization',
    name: author.name,
    '@id': siteUrl('/#organization'),
  }
}

// Trailing connector / filler words that read as dangling at the end of a
// short step name ("Tip the dough out onto a" → "Tip the dough out").
const TRAILING_FILLER = new Set([
  'a',
  'an',
  'the',
  'to',
  'and',
  'or',
  'with',
  'until',
  'onto',
  'into',
  'of',
  'in',
  'on',
  'for',
  'at',
  'then',
  'your',
  'it',
  'over',
  'up',
])

/**
 * Derive a concise, customer-visible `name` for a recipe HowToStep from its
 * full step text. Steps arrive as plain prose with no authored heading, but
 * Google's Recipe rich result wants a `name` on every step. We take the first
 * sentence, trim to roughly the first clause / six words, drop dangling
 * connector words, cap at ~55 chars on a word boundary, strip trailing
 * punctuation, and sentence-case the first letter. The full `text` is left
 * untouched, so nothing is invented — the name is a faithful shortening of
 * what the author wrote.
 */
function deriveStepName(text: string): string {
  const firstSentence = text.trim().split(/(?<=[.!?])\s+/)[0] ?? text.trim()
  let words = firstSentence.split(/\s+/).filter(Boolean)
  if (words.length > 6) words = words.slice(0, 6)
  while (words.length > 2) {
    const last = words[words.length - 1]?.toLowerCase().replace(/[^a-z]/g, '') ?? ''
    if (!TRAILING_FILLER.has(last)) break
    words.pop()
  }
  let name = words.join(' ')
  if (name.length > 55) {
    name = name.slice(0, 55)
    const lastSpace = name.lastIndexOf(' ')
    if (lastSpace > 2) name = name.slice(0, lastSpace)
  }
  // Drop a dangling, never-closed opening parenthesis ("200°C (180°C" → "200°C").
  if ((name.match(/\(/g)?.length ?? 0) > (name.match(/\)/g)?.length ?? 0)) {
    name = name.slice(0, name.lastIndexOf('(')).trim()
  }
  name = name.replace(/[\s,;:.!?–—-]+$/, '').trim()
  if (name) name = name.charAt(0).toUpperCase() + name.slice(1)
  return name || text.slice(0, 55).trim()
}

/**
 * schema.org NutritionInformation from the per-serving estimate. Calories are
 * always present (the gate nutrient); the rest emit only when the calculation
 * had complete data for them. Values carry their units as schema.org expects
 * ("8 g", "300 mg"). Returns undefined when there's nothing to emit.
 */
function buildNutritionInformation(
  n: RecipeNutritionInput | null,
  servings: number | null,
): JsonLd | undefined {
  if (!n) return undefined
  const info: JsonLd = {
    '@type': 'NutritionInformation',
    calories: `${Math.round(n.calories)} calories`,
  }
  if (servings && servings > 0) info.servingSize = '1 serving'
  if (n.protein != null) info.proteinContent = `${n.protein} g`
  if (n.fat != null) info.fatContent = `${n.fat} g`
  if (n.saturatedFat != null) info.saturatedFatContent = `${n.saturatedFat} g`
  if (n.carbohydrate != null) info.carbohydrateContent = `${n.carbohydrate} g`
  if (n.sugar != null) info.sugarContent = `${n.sugar} g`
  if (n.fibre != null) info.fiberContent = `${n.fibre} g`
  if (n.sodiumMg != null) info.sodiumContent = `${Math.round(n.sodiumMg)} mg`
  return info
}

function isoDuration(minutes: number | null): string | undefined {
  if (minutes == null || minutes <= 0) return undefined
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `PT${mins}M`
  if (mins === 0) return `PT${hours}H`
  return `PT${hours}H${mins}M`
}

function formatIngredient(row: RecipeIngredientRow): string {
  const parts: string[] = []
  if (row.amount != null) {
    const amt = Number.isInteger(row.amount)
      ? row.amount.toString()
      : row.amount.toFixed(2).replace(/\.?0+$/, '')
    parts.push(amt)
  }
  if (row.unit) parts.push(row.unit)
  parts.push(row.ingredient.name)
  if (row.prepNote) parts.push(`, ${row.prepNote}`)
  return parts.join(' ').replace(' ,', ',').trim()
}

// Maps Homemade dietaryFlags to schema.org RestrictedDiet enum values. The
// dietaryFlags column is dirty — the same diet appears as `vegetarian`,
// `VEGETARIAN`, `v`; `glutenFree`, `GLUTEN_FREE`, `gf`; and so on — so we
// normalise (lower-case, strip separators) before lookup rather than emit a
// free-form value, which Google rejects as invalid. Only flags with a real
// RestrictedDiet equivalent are emitted: nutFree / pescatarian have no
// schema.org value, and `contains*` are allergen *warnings* (the opposite of a
// suitability claim) — both are dropped, never mislabelled.
const DIET_ALIASES: Record<string, string> = {
  vegetarian: 'https://schema.org/VegetarianDiet',
  v: 'https://schema.org/VegetarianDiet',
  vegan: 'https://schema.org/VeganDiet',
  vg: 'https://schema.org/VeganDiet',
  glutenfree: 'https://schema.org/GlutenFreeDiet',
  gf: 'https://schema.org/GlutenFreeDiet',
  dairyfree: 'https://schema.org/LowLactoseDiet',
  df: 'https://schema.org/LowLactoseDiet',
  halal: 'https://schema.org/HalalDiet',
  kosher: 'https://schema.org/KosherDiet',
}

/** Valid, de-duplicated schema.org RestrictedDiet URLs for the flags, or undefined. */
function mapDiets(flags: string[]): string[] | undefined {
  const out = new Set<string>()
  for (const raw of flags) {
    const key = raw
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '')
    const url = DIET_ALIASES[key]
    if (url) out.add(url)
  }
  return out.size ? [...out] : undefined
}

/**
 * Absolutise a possibly-relative image URL. Render-fallback routes
 * (/api/procedural-card/…, /api/studio/patterns/[id]/thumbnail) are relative;
 * Google needs absolute URLs for schema.org `image` and for og:image, so
 * prefix the origin when the value isn't already absolute.
 */
export function absoluteImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  return /^https?:\/\//i.test(url) ? url : siteUrl(url)
}

/**
 * schema.org `image` as a repeated field of absolute URLs. Procedural-card
 * hero fallbacks are relative (/api/procedural-card/…); Google needs absolute
 * URLs, so prefix the origin when the value isn't already absolute.
 */
function absoluteImages(heroUrl: string | null): string[] | undefined {
  const abs = absoluteImageUrl(heroUrl)
  return abs ? [abs] : undefined
}

function stripUndefined(obj: JsonLd): JsonLd {
  const out: JsonLd = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      if (value.length === 0) continue
      out[key] = value
      continue
    }
    out[key] = value
  }
  return out
}
