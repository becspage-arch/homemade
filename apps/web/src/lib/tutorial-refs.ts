import 'server-only'
import { prisma } from '@homemade/db'
import type {
  GlossaryRef,
  SubTutorialRef,
  TipTapNode,
} from '@/components/public/tutorial-content/types'
import { cloudflareDeliveryUrl } from './media'

/**
 * Walks a TipTap document and collects the IDs of every glossary term and
 * sub-tutorial card referenced in it. Used to load only the refs we actually
 * need per page rather than the whole glossary table.
 */
function collectReferencedIds(doc: TipTapNode | null | undefined): {
  glossaryIds: Set<string>
  tutorialIds: Set<string>
} {
  const glossaryIds = new Set<string>()
  const tutorialIds = new Set<string>()
  if (!doc) return { glossaryIds, tutorialIds }

  function walk(node: TipTapNode): void {
    if (!node) return
    if (node.type === 'subTutorialCard') {
      const id = node.attrs?.tutorialId
      if (typeof id === 'string' && id) tutorialIds.add(id)
    }
    if (node.marks) {
      for (const m of node.marks) {
        if (m.type === 'glossaryTooltip') {
          const id = m.attrs?.termId
          if (typeof id === 'string' && id) glossaryIds.add(id)
        }
      }
    }
    if (node.content) {
      for (const child of node.content) walk(child)
    }
  }

  walk(doc)
  return { glossaryIds, tutorialIds }
}

/**
 * Load the glossary terms and sub-tutorial summaries that a given TipTap
 * document needs to render. Excludes the host tutorial's own ID from the
 * sub-tutorial set (a tutorial shouldn't link to itself).
 */
export async function loadContentRefs(
  body: TipTapNode | null | undefined,
  excludeTutorialId?: string,
): Promise<{ glossary: GlossaryRef[]; subTutorials: SubTutorialRef[] }> {
  const { glossaryIds, tutorialIds } = collectReferencedIds(body)
  if (excludeTutorialId) tutorialIds.delete(excludeTutorialId)

  if (glossaryIds.size === 0 && tutorialIds.size === 0) {
    return { glossary: [], subTutorials: [] }
  }

  const [glossaryRows, tutorialRows] = await Promise.all([
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
            hero: { select: { cloudflareId: true } },
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
    heroThumbnailUrl: cloudflareDeliveryUrl(t.hero?.cloudflareId, 'thumbnail'),
  }))

  return { glossary, subTutorials }
}
