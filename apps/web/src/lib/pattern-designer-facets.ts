/**
 * Designer facets for a pattern category page.
 *
 * The sidebar "Designer" filter is DERIVED from the live published patterns in
 * the category: each designer who has at least one PUBLIC, library-owned
 * pattern here becomes an option, with a real count. The filter group only
 * renders once the roster is worth filtering (see DESIGNER_FILTER_MIN in the
 * grid) — while a category has a designer or two it stays hidden.
 *
 * Reuses tagSourceForCategory so a category resolves to the right base table:
 * cross-stitch lives on `Pattern`, crochet on `CrochetPattern`. Other crafts
 * (e.g. needlework, once its public library is on this layout) are added to
 * SOURCE_BY_SLUG in pattern-tag-facets and inherit this for free.
 */

import { prisma } from '@homemade/db'
import { tagSourceForCategory } from './pattern-tag-facets'

export interface DesignerFacet {
  slug: string
  name: string
  count: number
}

export async function getPatternDesignerFacets(
  categorySlug: string,
  categoryId: string,
): Promise<DesignerFacet[]> {
  const source = tagSourceForCategory(categorySlug)
  if (!source) return []

  const where = {
    ownerUserId: null,
    visibility: 'PUBLIC' as const,
    publishedAt: { not: null },
    subCategory: { categoryId },
    designerId: { not: null },
  }
  const grouped =
    source.table === 'Pattern'
      ? await prisma.pattern.groupBy({
          by: ['designerId'],
          where,
          _count: { designerId: true },
        })
      : await prisma.crochetPattern.groupBy({
          by: ['designerId'],
          where,
          _count: { designerId: true },
        })
  if (grouped.length === 0) return []

  const countById = new Map(
    grouped.map((g) => [g.designerId, g._count.designerId]),
  )
  const ids = grouped
    .map((g) => g.designerId)
    .filter((id): id is string => Boolean(id))

  const designers = await prisma.designer.findMany({
    where: { id: { in: ids } },
    select: { id: true, slug: true, displayName: true },
  })

  return designers
    .map((d) => ({
      slug: d.slug,
      name: d.displayName,
      count: countById.get(d.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
