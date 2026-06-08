import Link from 'next/link'
import { tutorialHeroSrc } from '@/lib/tutorial-hero'

interface MediaLike {
  cloudflareId?: string | null
  r2Key?: string | null
  alt?: string | null
}

interface FoundationStep {
  id: string
  slug: string
  title: string
  excerpt: string | null
  difficulty: string
  category: { slug: string; name: string }
  hero?: MediaLike | null
}

interface FoundationsPathProps {
  heading: string
  /** Optional one-line body under the heading. */
  subheading?: string | null
  /** Ordered list of foundation tutorials (typically 3 to 8). */
  steps: FoundationStep[]
  /** Where the "See all foundations" link points (usually the Foundations sub-cat). */
  seeAllHref?: string | null
}

/**
 * Stepped path of foundation tutorials, rendered as a vertical-on-mobile,
 * horizontal-on-desktop sequence of numbered cards. Used by Pattern, Skill,
 * and Practice archetype landings. Aesthetic: Linear-style onboarding cards,
 * not a Netflix rail. A path, not a stack.
 */
export function FoundationsPath({
  heading,
  subheading,
  steps,
  seeAllHref,
}: FoundationsPathProps) {
  if (steps.length === 0) return null
  return (
    <section className="foundations-path">
      <header className="foundations-path-header">
        <h2 className="foundations-path-heading">{heading}</h2>
        {subheading && <p className="foundations-path-subheading">{subheading}</p>}
        {seeAllHref && (
          <Link href={seeAllHref} className="foundations-path-see-all">
            All foundations →
          </Link>
        )}
      </header>
      <ol className="foundations-path-list">
        {steps.map((step, index) => {
          const href = `/${step.category.slug}/${step.slug}`
          const hero = tutorialHeroSrc(step, 'card', ['public'])
          return (
            <li key={step.id} className="foundations-path-item">
              <Link href={href} className="foundations-path-card">
                <span className="foundations-path-number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="foundations-path-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hero.src}
                    srcSet={hero.srcSet}
                    sizes="(min-width: 900px) 240px, 60vw"
                    alt={step.hero?.alt ?? ''}
                    loading="lazy"
                    decoding="async"
                    className={hero.isProcedural ? 'procedural' : undefined}
                  />
                </span>
                <span className="foundations-path-body">
                  <span className="foundations-path-overline">
                    Step {index + 1}
                  </span>
                  <span className="foundations-path-title">{step.title}</span>
                  {step.excerpt && (
                    <span className="foundations-path-excerpt">{step.excerpt}</span>
                  )}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
