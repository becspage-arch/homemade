import Link from 'next/link'
import { prisma, TutorialStatus, UserProjectStatus } from '@homemade/db'
import { TutorialCard } from '@/components/public/tutorial-card'
import { Wordmark } from '@/components/wordmark'
import { mediaSrcSet } from '@/lib/media'
import { getCurrentDbUser } from '@/lib/get-current-user'
import {
  emptyReaderState,
  loadReaderState,
  readerStateFor,
} from '@/lib/user-state'

import './home-page.css'

export const dynamic = 'force-dynamic'

const FEATURED_LIMIT = 9
const CONTINUE_LIMIT = 3

export default async function HomePage() {
  const [tutorials, currentUser] = await Promise.all([
    prisma.tutorial.findMany({
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
        hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
      },
    }),
    getCurrentDbUser(),
  ])

  const inProgress = currentUser
    ? await prisma.userProject.findMany({
        where: {
          userId: currentUser.id,
          status: UserProjectStatus.IN_PROGRESS,
        },
        orderBy: { lastViewedAt: 'desc' },
        take: CONTINUE_LIMIT,
        include: {
          tutorial: {
            select: {
              id: true,
              slug: true,
              title: true,
              excerpt: true,
              difficulty: true,
              season: true,
              category: { select: { slug: true, name: true } },
              hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
            },
          },
        },
      })
    : []

  const readerState = currentUser
    ? await loadReaderState(currentUser.id, [
        ...tutorials.map((t) => t.id),
        ...inProgress.map((p) => p.tutorial.id),
      ])
    : emptyReaderState()

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

      {inProgress.length > 0 && (
        <section className="home-continue">
          <header className="home-recent-header">
            <span className="home-section-label">Continue making</span>
          </header>
          <div className="home-grid">
            {inProgress.map((p) => {
              const card = mediaSrcSet(p.tutorial.hero, 'card', ['public'])
              return (
                <TutorialCard
                  key={p.id}
                  href={`/${p.tutorial.category.slug}/${p.tutorial.slug}`}
                  title={p.tutorial.title}
                  excerpt={p.tutorial.excerpt}
                  heroUrl={card?.src ?? null}
                  heroSrcSet={card?.srcSet}
                  difficulty={p.tutorial.difficulty}
                  season={p.tutorial.season}
                  categoryName={p.tutorial.category.name}
                  state={readerStateFor(readerState, p.tutorial.id)}
                />
              )
            })}
          </div>
          <p style={{ marginTop: 14 }}>
            <Link href="/me/projects" className="home-section-link">
              All your projects →
            </Link>
          </p>
        </section>
      )}

      <section className="home-feature">
        <span className="home-section-label">Latest</span>
        {lead && (
          <Link
            href={`/${lead.category.slug}/${lead.slug}`}
            className="home-feature-card"
          >
            {(() => {
              // Feature image renders ~720px wide at the largest breakpoint
              // (1.2fr of a 1216px grid), full-width on mobile. Cover 1x + 2x
              // density across the public + hero variants.
              const hero = mediaSrcSet(lead.hero, 'public', ['hero'])
              return hero ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="home-feature-image"
                  src={hero.src}
                  srcSet={hero.srcSet}
                  sizes="(min-width: 900px) 55vw, 100vw"
                  alt={lead.hero?.alt ?? ''}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
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
            {rest.map((t) => {
              const card = mediaSrcSet(t.hero, 'card', ['public'])
              return (
                <TutorialCard
                  key={t.id}
                  href={`/${t.category.slug}/${t.slug}`}
                  title={t.title}
                  excerpt={t.excerpt}
                  heroUrl={card?.src ?? null}
                  heroSrcSet={card?.srcSet}
                  difficulty={t.difficulty}
                  season={t.season}
                  categoryName={t.category.name}
                  state={readerStateFor(readerState, t.id)}
                />
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
