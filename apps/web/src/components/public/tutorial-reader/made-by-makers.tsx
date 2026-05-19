import Link from 'next/link'
import { mediaSrcSet } from '@/lib/media'

interface MadeByMakerTile {
  projectId: string
  publishedAt: Date | null
  heroSource: { cloudflareId: string | null; r2Key: string | null } | null
  makerName: string
  makerHandle: string
}

interface MadeByMakersProps {
  tiles: MadeByMakerTile[]
  /** Shown when there are more public makes than tiles surfaced. */
  totalCount: number
  tutorialCategorySlug: string
  tutorialSlug: string
}

/**
 * "Made by Homemade Makers" section on the tutorial reader. Renders the
 * most-recent N public UserProjects for this tutorial as thumbnails linking
 * to each Maker's Made it detail page. Maker name is plain text inside the
 * card and links separately to /m/{handle} via the small caption row below.
 *
 * Renders nothing when there are no public makes — caller doesn't have to
 * check.
 */
export function MadeByMakers({
  tiles,
  totalCount,
  tutorialCategorySlug: _categorySlug,
  tutorialSlug: _tutorialSlug,
}: MadeByMakersProps) {
  if (tiles.length === 0) return null

  return (
    <section className="ugc-section made-by-makers">
      <header className="ugc-section-header">
        <h2 className="ugc-section-title">Made by Homemade Makers</h2>
        <p className="ugc-section-description">
          Real makes from people on Homemade who&apos;ve cooked, sewn, or
          built this one.
        </p>
      </header>
      <div className="made-by-makers-grid">
        {tiles.map((t) => {
          const card = mediaSrcSet(t.heroSource, 'card', ['public'])
          return (
            <article key={t.projectId} className="made-by-makers-tile">
              <Link
                href={`/m/${t.makerHandle}/made/${t.projectId}`}
                className="made-by-makers-image"
                aria-label={`See ${t.makerName}'s make`}
              >
                {card ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.src} srcSet={card.srcSet} alt="" />
                ) : (
                  <span className="made-by-makers-image-placeholder" />
                )}
              </Link>
              <p className="made-by-makers-caption">
                Made by{' '}
                <Link
                  href={`/m/${t.makerHandle}`}
                  className="made-by-makers-link"
                >
                  {t.makerName}
                </Link>
              </p>
            </article>
          )
        })}
      </div>
      {totalCount > tiles.length && (
        <p className="made-by-makers-more">
          {totalCount - tiles.length} more public make
          {totalCount - tiles.length === 1 ? '' : 's'} on this tutorial.
        </p>
      )}
    </section>
  )
}
