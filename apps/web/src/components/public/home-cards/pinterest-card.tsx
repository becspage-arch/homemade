import Link from 'next/link'
import { mediaSrcSet } from '@/lib/media'

interface MediaLike {
  cloudflareId: string | null
  r2Key: string | null
}

interface PinterestCardProps {
  href: string
  imageMedia: MediaLike | null
  title: string
  /** Small line that renders BELOW the image (off-image so it doesn't
   *  compete with the overlaid title). Optional. */
  byline?: string | null
  sizes?: string
}

/**
 * Pinterest Caption Card (Pattern C, default caption-below-but-overlaid
 * variant). Image fills the card; title sits over a subtle bottom
 * gradient; optional small byline ("Made by Hannah") renders beneath
 * the card image so the maker credit doesn't compete with the title.
 */
export function PinterestCard({
  href,
  imageMedia,
  title,
  byline,
  sizes = '(min-width: 900px) 22vw, 50vw',
}: PinterestCardProps) {
  const card = imageMedia ? mediaSrcSet(imageMedia, 'card', ['public']) : null
  return (
    <div>
      <Link href={href} className="home-pinterest-card">
        {card ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="home-pinterest-card-image"
            src={card.src}
            srcSet={card.srcSet}
            sizes={sizes}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="home-pinterest-card-image procedural" aria-hidden="true" />
        )}
        <span className="home-pinterest-card-caption">{title}</span>
      </Link>
      {byline && <span className="home-pinterest-card-byline">{byline}</span>}
    </div>
  )
}
