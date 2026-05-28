import { HomeRail } from './home-rail'
import { HomeCard } from './home-card'
import type { ReaderStateMap } from '@/lib/user-state'
import { readerStateFor } from '@/lib/user-state'

interface MediaLike {
  cloudflareId?: string | null
  r2Key?: string | null
  alt?: string | null
}

interface SubRailTutorial {
  id: string
  slug: string
  title: string
  excerpt: string | null
  difficulty: string
  totalMinutes?: number | null
  timeMinutes?: number | null
  dietaryFlags?: string[] | null
  category: { slug: string; name: string }
  hero?: MediaLike | null
}

interface CategorySubRailProps {
  categorySlug: string
  subCategorySlug: string
  heading: string
  tutorials: SubRailTutorial[]
  readerState: ReaderStateMap
}

/**
 * Sub-category rail for the category page. Top N most-loved tutorials
 * in this sub-category, plus a "See all in [sub-category] →" link to
 * the filtered category view at /[categorySlug]?sub=[subCategorySlug].
 *
 * Renders nothing when the sub-category has no published tutorials.
 */
export function CategorySubRail({
  categorySlug,
  subCategorySlug,
  heading,
  tutorials,
  readerState,
}: CategorySubRailProps) {
  if (tutorials.length === 0) return null
  return (
    <HomeRail
      heading={heading}
      seeAllHref={`/${categorySlug}?sub=${subCategorySlug}`}
      seeAllLabel={`See all in ${heading.toLowerCase()} →`}
    >
      {tutorials.map((t) => (
        <HomeCard
          key={t.id}
          tutorial={t}
          state={readerStateFor(readerState, t.id)}
        />
      ))}
    </HomeRail>
  )
}
