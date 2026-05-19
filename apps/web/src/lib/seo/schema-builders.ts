/**
 * Schema.org JSON-LD builders. Each helper returns a plain JS object that
 * is JSON-stringified into a `<script type="application/ld+json">` tag by
 * the `JsonLd` component. Builders return `null` when the required inputs
 * aren't there so callers can spread without conditional branches.
 */

import { LEGAL_ENTITY } from '@/lib/legal-entity'
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
    founder: { '@type': 'Person', name: 'Rebecca Page' },
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
      // eslint-disable-next-line @typescript-eslint/naming-convention
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
  instructions: string[]
  keywords: string[]
  rating: RecipeRatingSummary | null
}

export function buildRecipeSchema(input: RecipeSchemaInput): JsonLd {
  const url = siteUrl(`/${input.categorySlug}/${input.tutorialSlug}`)
  const recipeYield = input.yieldDescription
    ?? (input.servings ? `Serves ${input.servings}` : null)
  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    '@id': `${url}#recipe`,
    name: input.title,
    description: input.excerpt ?? undefined,
    image: input.heroUrl ?? undefined,
    author: buildAuthorRef(input.author),
    datePublished: input.publishedAt?.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    prepTime: isoDuration(input.prepMinutes),
    cookTime: isoDuration(input.cookMinutes),
    totalTime: isoDuration(input.totalMinutes),
    recipeYield: recipeYield ?? undefined,
    recipeCuisine: input.cuisine ?? undefined,
    recipeCategory: input.mealType ?? undefined,
    suitableForDiet: input.dietaryFlags.length
      ? input.dietaryFlags.map(dietaryFlagToSchema)
      : undefined,
    recipeIngredient: input.ingredients.map(formatIngredient),
    recipeInstructions: input.instructions.map((text, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      text,
    })),
    keywords: input.keywords.length ? input.keywords.join(', ') : undefined,
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
    image: input.heroUrl ?? undefined,
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
    image: input.heroUrl ?? undefined,
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

// Maps Homemade dietaryFlags to schema.org RestrictedDiet enum values.
// Unknown flags drop out — schema.org rejects free-form values.
const DIETARY_TO_SCHEMA: Record<string, string> = {
  vegetarian: 'https://schema.org/VegetarianDiet',
  vegan: 'https://schema.org/VeganDiet',
  glutenFree: 'https://schema.org/GlutenFreeDiet',
  halal: 'https://schema.org/HalalDiet',
  kosher: 'https://schema.org/KosherDiet',
  lowFodmap: 'https://schema.org/LowLactoseDiet',
  lowCarb: 'https://schema.org/LowCalorieDiet',
}

function dietaryFlagToSchema(flag: string): string {
  return DIETARY_TO_SCHEMA[flag] ?? flag
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
