import Link from 'next/link'
import { mediaSrcSet } from '@/lib/media'

interface MediaLike {
  cloudflareId: string | null
  r2Key: string | null
  alt?: string | null
}

interface HeroOverlayProps {
  href: string
  imageMedia: MediaLike | null
  overline?: string | null
  eyebrow?: string | null
  title: string
  excerpt?: string | null
  ctaLabel: string
}

/**
 * Full-bleed hero card. Photograph spans the hero zone, gradient at the
 * bottom for legibility, text block bottom-left. Used by every state of
 * the homepage hero (editorial pick / continue making / scheduled step).
 */
export function HeroOverlay({
  href,
  imageMedia,
  overline,
  eyebrow,
  title,
  excerpt,
  ctaLabel,
}: HeroOverlayProps) {
  const card = imageMedia ? mediaSrcSet(imageMedia, 'hero', ['public']) : null
  return (
    <Link href={href} className="home-hero-feature">
      <span className="home-hero-image-wrap">
        {card ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="home-hero-image"
            src={card.src}
            srcSet={card.srcSet}
            sizes="100vw"
            alt={imageMedia?.alt ?? ''}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        ) : (
          <span className="home-hero-image procedural" aria-hidden="true" />
        )}
      </span>
      <span className="home-hero-gradient" aria-hidden="true" />
      <span className="home-hero-content-bottom">
        {overline && <span className="home-hero-overline">{overline}</span>}
        {eyebrow && <span className="home-hero-eyebrow">{eyebrow}</span>}
        <h1 className="home-hero-title">{title}</h1>
        {excerpt && <p className="home-hero-excerpt">{excerpt}</p>}
        <span className="home-hero-cta">{ctaLabel}</span>
      </span>
    </Link>
  )
}
