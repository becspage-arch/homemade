import Link from 'next/link'
import { HomeCard } from '@/components/public/home-card'
import { readerStateFor, type ReaderStateMap } from '@/lib/user-state'

interface MediaLike {
  cloudflareId?: string | null
  r2Key?: string | null
  alt?: string | null
}

interface CardLike {
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

interface CategoryPreviewSectionProps {
  /** The category this section represents. */
  category: { slug: string; name: string; description: string | null }
  /** 4–6 cards from this category, already sorted in preferred order. */
  tutorials: CardLike[]
  readerState: ReaderStateMap
}

/**
 * Per-category band on a group-landing page. Shows the category name as
 * an editorial heading, a short Homemade-voice lede, and a card-grid
 * preview of 4–6 tutorials. The "Open {category}" footer link is the
 * primary way users move from a group landing into a category landing.
 *
 * Renders nothing when the category has no published content.
 */
export function CategoryPreviewSection({
  category,
  tutorials,
  readerState,
}: CategoryPreviewSectionProps) {
  if (tutorials.length === 0) return null
  return (
    <section className="group-landing-category-section">
      <header className="group-landing-category-header">
        <div>
          <h2 className="group-landing-category-title">{category.name}</h2>
          {category.description && (
            <p className="group-landing-category-lede">{category.description}</p>
          )}
        </div>
        <Link
          href={`/${category.slug}`}
          className="group-landing-category-cta"
        >
          Open {category.name.toLowerCase()} →
        </Link>
      </header>
      <ul className="group-landing-category-grid">
        {tutorials.map((t) => (
          <li key={t.id}>
            <HomeCard
              tutorial={t}
              state={readerStateFor(readerState, t.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
