import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma, type CategoryArchetype } from '@homemade/db'
import { JsonLd } from '@/components/seo/json-ld'
import { getCurrentDbUser } from '@/lib/get-current-user'
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
} from '@/lib/seo/schema-builders'
import {
  buildPublicMetadata,
  notFoundMetadata,
} from '@/lib/seo/metadata-helpers'

import { RecipeLayout } from '@/components/public/category-layouts/recipe-layout'
import { PatternLayout } from '@/components/public/category-layouts/pattern-layout'
import { SkillLayout } from '@/components/public/category-layouts/skill-layout'
import { PracticeLayout } from '@/components/public/category-layouts/practice-layout'
import { PlantLayout } from '@/components/public/category-layouts/plant-layout'
import { FixLayout } from '@/components/public/category-layouts/fix-layout'

import './category-page.css'
import '@/components/public/category/category-shared.css'
import '@/components/public/category-layouts/pattern-layout.css'
import '@/components/public/category-layouts/skill-layout.css'
import '@/components/public/category-layouts/practice-layout.css'
import '@/components/public/category-layouts/plant-layout.css'
import '@/components/public/category-layouts/fix-layout.css'
import '@/app/(public)/cross-stitch/patterns/patterns.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ categorySlug: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

const loadCategory = cache(async (slug: string) => {
  return prisma.category.findFirst({
    where: { slug, isPublicVisible: true },
    include: {
      subCategories: { orderBy: [{ order: 'asc' }, { name: 'asc' }] },
    },
  })
})

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { categorySlug } = await params
  const sp = await searchParams
  const category = await loadCategory(categorySlug)
  if (!category) return notFoundMetadata()
  const filtered = Object.keys(sp).length > 0
  const title = metadataTitleFor(category.archetype, category.name)
  const description =
    category.description ??
    `Browse every ${category.name.toLowerCase()} entry on Homemade.`
  return buildPublicMetadata({
    title,
    description,
    path: `/${categorySlug}`,
    ogType: 'website',
    index: !filtered,
  })
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { categorySlug } = await params
  const sp = await searchParams
  const category = await loadCategory(categorySlug)
  if (!category) notFound()

  const currentUser = await getCurrentDbUser()
  const currentUserId = currentUser?.id ?? null

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: category.name, href: `/${category.slug}` },
  ]
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs)
  const collectionSchema = buildCollectionPageSchema({
    url: `/${category.slug}`,
    name: category.name,
    description: category.description,
    items: [],
  })

  const archetype = category.archetype

  return (
    <>
      <JsonLd data={[collectionSchema, breadcrumbSchema]} />
      {renderLayout({ category, archetype, searchParams: sp, currentUserId })}
    </>
  )
}

function renderLayout({
  category,
  archetype,
  searchParams,
  currentUserId,
}: {
  category: Awaited<ReturnType<typeof loadCategory>> & object
  archetype: CategoryArchetype
  searchParams: Record<string, string | undefined>
  currentUserId: string | null
}) {
  switch (archetype) {
    case 'PATTERN':
      return (
        <PatternLayout
          category={category}
          searchParams={searchParams as never}
          currentUserId={currentUserId}
        />
      )
    case 'SKILL':
      return (
        <SkillLayout
          category={category}
          searchParams={searchParams}
          currentUserId={currentUserId}
        />
      )
    case 'PRACTICE':
      return (
        <PracticeLayout
          category={category}
          searchParams={searchParams}
          currentUserId={currentUserId}
        />
      )
    case 'PLANT':
      return (
        <PlantLayout
          category={category}
          searchParams={searchParams}
          currentUserId={currentUserId}
        />
      )
    case 'FIX':
      return (
        <FixLayout
          category={category}
          searchParams={searchParams}
          currentUserId={currentUserId}
        />
      )
    case 'RECIPE':
    default:
      return (
        <RecipeLayout
          category={category}
          searchParams={searchParams}
          currentUserId={currentUserId}
        />
      )
  }
}

function metadataTitleFor(archetype: CategoryArchetype, name: string): string {
  switch (archetype) {
    case 'PATTERN':
      return `${name} patterns, designers and Studio`
    case 'SKILL':
      return `${name} techniques and projects`
    case 'PRACTICE':
      return `${name} practices and rituals`
    case 'PLANT':
      return `What to grow now in your ${name.toLowerCase()}`
    case 'FIX':
      return `${name} — fix anything at home`
    case 'RECIPE':
    default:
      return `${name} recipes, techniques and tutorials`
  }
}
