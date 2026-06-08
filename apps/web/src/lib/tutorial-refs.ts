import 'server-only'
import { prisma } from '@homemade/db'
import type {
  GlossaryRef,
  PatternInsetRef,
  SubTutorialRef,
  TechniqueRef,
  TipTapNode,
} from '@/components/public/tutorial-content/types'
import { mediaUrl } from './media'

/**
 * Walks a TipTap document and collects the IDs of every glossary term and
 * sub-tutorial card referenced in it, plus the slugs of every technique
 * tutorial referenced by a `techniqueLink` mark. Used to load only the
 * refs we actually need per page rather than the whole glossary /
 * technique table.
 */
function collectReferencedIds(doc: TipTapNode | null | undefined): {
  glossaryIds: Set<string>
  tutorialIds: Set<string>
  techniqueSlugs: Set<string>
  patternIds: Set<string>
} {
  const glossaryIds = new Set<string>()
  const tutorialIds = new Set<string>()
  const techniqueSlugs = new Set<string>()
  const patternIds = new Set<string>()
  if (!doc) return { glossaryIds, tutorialIds, techniqueSlugs, patternIds }

  function walk(node: TipTapNode): void {
    if (!node) return
    if (node.type === 'subTutorialCard') {
      const id = node.attrs?.tutorialId
      if (typeof id === 'string' && id) tutorialIds.add(id)
    }
    if (node.type === 'patternInset') {
      const id = node.attrs?.patternId
      if (typeof id === 'string' && id) patternIds.add(id)
    }
    if (node.marks) {
      for (const m of node.marks) {
        if (m.type === 'glossaryTooltip') {
          const id = m.attrs?.termId
          if (typeof id === 'string' && id) glossaryIds.add(id)
        }
        if (m.type === 'techniqueLink') {
          const slug = m.attrs?.techniqueSlug
          if (typeof slug === 'string' && slug) techniqueSlugs.add(slug)
        }
      }
    }
    if (node.content) {
      for (const child of node.content) walk(child)
    }
  }

  walk(doc)
  return { glossaryIds, tutorialIds, techniqueSlugs, patternIds }
}

/**
 * Load the glossary terms, sub-tutorial summaries and technique tutorial
 * pointers that a given TipTap document needs to render. Excludes the host
 * tutorial's own ID from the sub-tutorial set (a tutorial shouldn't link
 * to itself). Technique slugs that don't resolve to a PUBLISHED technique
 * tutorial are silently dropped — the renderer falls back to plain text
 * for those, and the link goes live the moment the technique is published.
 */
export async function loadContentRefs(
  body: TipTapNode | null | undefined,
  excludeTutorialId?: string,
): Promise<{
  glossary: GlossaryRef[]
  subTutorials: SubTutorialRef[]
  techniques: TechniqueRef[]
  patternInsets: PatternInsetRef[]
}> {
  const { glossaryIds, tutorialIds, techniqueSlugs, patternIds } = collectReferencedIds(body)
  if (excludeTutorialId) tutorialIds.delete(excludeTutorialId)

  if (
    glossaryIds.size === 0 &&
    tutorialIds.size === 0 &&
    techniqueSlugs.size === 0 &&
    patternIds.size === 0
  ) {
    return { glossary: [], subTutorials: [], techniques: [], patternInsets: [] }
  }

  const [glossaryRows, tutorialRows, techniqueRows, patternRows] = await Promise.all([
    glossaryIds.size > 0
      ? prisma.glossaryTerm.findMany({
          where: { id: { in: [...glossaryIds] } },
          select: { id: true, term: true, slug: true, definition: true },
        })
      : Promise.resolve([]),
    tutorialIds.size > 0
      ? prisma.tutorial.findMany({
          where: {
            id: { in: [...tutorialIds] },
            status: 'PUBLISHED',
          },
          select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            category: { select: { slug: true, name: true } },
            hero: { select: { cloudflareId: true, r2Key: true } },
          },
        })
      : Promise.resolve([]),
    techniqueSlugs.size > 0
      ? prisma.tutorial.findMany({
          where: {
            slug: { in: [...techniqueSlugs] },
            type: 'TECHNIQUE',
            status: 'PUBLISHED',
          },
          select: {
            slug: true,
            title: true,
            category: { select: { slug: true } },
          },
        })
      : Promise.resolve([]),
    patternIds.size > 0
      ? prisma.pattern.findMany({
          where: { id: { in: [...patternIds] } },
          select: {
            id: true,
            name: true,
            description: true,
            widthCells: true,
            heightCells: true,
            colourCount: true,
            totalStitches: true,
            fabricCountSuggested: true,
            designer: { select: { displayName: true } },
          },
        })
      : Promise.resolve([]),
  ])

  const glossary: GlossaryRef[] = glossaryRows.map((g) => ({
    id: g.id,
    term: g.term,
    slug: g.slug,
    definition: g.definition,
  }))

  const subTutorials: SubTutorialRef[] = tutorialRows.map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    excerpt: t.excerpt,
    categorySlug: t.category.slug,
    categoryName: t.category.name,
    heroThumbnailUrl: mediaUrl(t.hero, 'thumbnail'),
  }))

  const techniques: TechniqueRef[] = techniqueRows.map((t) => ({
    slug: t.slug,
    title: t.title,
    categorySlug: t.category.slug,
  }))

  const patternInsets: PatternInsetRef[] = patternRows.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    widthCells: p.widthCells,
    heightCells: p.heightCells,
    colourCount: p.colourCount,
    totalStitches: p.totalStitches,
    fabricCountSuggested: p.fabricCountSuggested,
    designerName: p.designer?.displayName ?? null,
    thumbnailUrl: `/api/studio/patterns/${p.id}/thumbnail`,
  }))

  return { glossary, subTutorials, techniques, patternInsets }
}
