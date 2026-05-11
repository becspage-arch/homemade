import 'server-only'
import { prisma } from '@homemade/db'
import { mediaUrl } from '@/lib/media'
import type {
  GlossaryRef,
  TutorialRef,
} from '@/components/admin/editor/types'
import type { MediaOption } from '@/components/admin/tutorials/hero-media-picker'
import type {
  CategoryOption,
  SubCategoryOption,
} from '@/components/admin/tutorials/category-sub-category-fields'
import type { TagOption } from '@/components/admin/tutorials/tag-picker'

export interface TutorialFormSourceData {
  categories: CategoryOption[]
  subCategories: SubCategoryOption[]
  tags: TagOption[]
  glossary: GlossaryRef[]
  tutorials: TutorialRef[]
  media: MediaOption[]
}

/**
 * Server-side fetch for everything the create/edit tutorial form needs.
 * Excludes the tutorial being edited from the sub-tutorial picker list.
 */
export async function loadTutorialFormData(
  excludeTutorialId?: string,
): Promise<TutorialFormSourceData> {
  const [categoryRows, subCategoryRows, tagRows, glossaryRows, tutorialRows, mediaRows] =
    await Promise.all([
      prisma.category.findMany({
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true },
      }),
      prisma.subCategory.findMany({
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, categoryId: true },
      }),
      prisma.tag.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
      }),
      prisma.glossaryTerm.findMany({
        orderBy: { term: 'asc' },
        select: {
          id: true,
          term: true,
          slug: true,
          definition: true,
          categoryId: true,
        },
      }),
      prisma.tutorial.findMany({
        where: {
          status: 'PUBLISHED',
          ...(excludeTutorialId ? { NOT: { id: excludeTutorialId } } : {}),
        },
        orderBy: { title: 'asc' },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          category: { select: { name: true, slug: true } },
        },
      }),
      prisma.media.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          alt: true,
          caption: true,
          type: true,
          cloudflareId: true,
          r2Key: true,
        },
      }),
    ])

  const glossary: GlossaryRef[] = glossaryRows.map((g) => ({
    id: g.id,
    term: g.term,
    slug: g.slug,
    definition: g.definition,
  }))

  const tutorials: TutorialRef[] = tutorialRows.map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    excerpt: t.excerpt,
    categoryName: t.category.name,
    categorySlug: t.category.slug,
  }))

  const media: MediaOption[] = mediaRows.map((m) => ({
    id: m.id,
    alt: m.alt,
    caption: m.caption,
    type: m.type,
    cloudflareId: m.cloudflareId,
    thumbnailUrl: mediaUrl(m, 'thumbnail'),
  }))

  return {
    categories: categoryRows,
    subCategories: subCategoryRows,
    tags: tagRows,
    glossary,
    tutorials,
    media,
  }
}
