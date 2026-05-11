import Link from 'next/link'
import { prisma, TutorialStatus } from '@homemade/db'
import { TutorialCard } from '@/components/public/tutorial-card'
import { Wordmark } from '@/components/wordmark'
import { cloudflareDeliveryUrl } from '@/lib/media'

import './home-page.css'

export const dynamic = 'force-dynamic'

const FEATURED_LIMIT = 9

export default async function HomePage() {
  const tutorials = await prisma.tutorial.findMany({
    where: { status: TutorialStatus.PUBLISHED },
    orderBy: [{ publishedAt: 'desc' }],
    take: FEATURED_LIMIT,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      difficulty: true,
      season: true,
      category: { select: { slug: true, name: true } },
      hero: { select: { cloudflareId: true } },
    },
  })

  if (tutorials.length === 0) {
    return (
      <div className="home-fallback">
        <Wordmark />
        <div className="home-fallback-rule" />
        <p className="home-fallback-tagline">the home of making things yourself</p>
      </div>
    )
  }

  const [lead, ...rest] = tutorials

  return (
    <div className="home-page">
      <section className="home-hero">
        <Wordmark />
        <p className="home-hero-tagline">the home of making things yourself</p>
      </section>

      <section className="home-feature">
        <span className="home-section-label">Latest</span>
        {lead && (
          <Link
            href={`/${lead.category.slug}/${lead.slug}`}
            className="home-feature-card"
          >
            {(() => {
              const heroUrl = cloudflareDeliveryUrl(lead.hero?.cloudflareId, 'hero')
              return heroUrl ? (
                <span
                  className="home-feature-image"
                  role="img"
                  aria-label=""
                  style={{ backgroundImage: `url(${heroUrl})` }}
                />
              ) : (
                <span className="home-feature-image placeholder" aria-hidden="true">
                  h
                </span>
              )
            })()}
            <div className="home-feature-body">
              <span className="home-feature-eyebrow">{lead.category.name}</span>
              <h2 className="home-feature-title">{lead.title}</h2>
              {lead.excerpt && (
                <p className="home-feature-excerpt">{lead.excerpt}</p>
              )}
              <span className="home-feature-cta">Read the guide →</span>
            </div>
          </Link>
        )}
      </section>

      {rest.length > 0 && (
        <section className="home-recent">
          <header className="home-recent-header">
            <span className="home-section-label">More to make</span>
          </header>
          <div className="home-grid">
            {rest.map((t) => (
              <TutorialCard
                key={t.id}
                href={`/${t.category.slug}/${t.slug}`}
                title={t.title}
                excerpt={t.excerpt}
                heroUrl={cloudflareDeliveryUrl(t.hero?.cloudflareId, 'card')}
                difficulty={t.difficulty}
                season={t.season}
                categoryName={t.category.name}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
