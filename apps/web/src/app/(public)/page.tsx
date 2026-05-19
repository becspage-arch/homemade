import Link from 'next/link'
import { HomeCard } from '@/components/public/home-card'
import { HomeRail } from '@/components/public/home-rail'
import { OnboardingCard } from '@/components/public/onboarding-card'
import { RecentlyMadeRail } from '@/components/public/recently-made-rail'
import { Wordmark } from '@/components/wordmark'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { loadHomepageData } from '@/lib/homepage-data'
import { loadRecentlyMade } from '@/lib/recently-made'
import { readerStateFor } from '@/lib/user-state'
import { tutorialHeroSrc } from '@/lib/tutorial-hero'
import { prisma } from '@homemade/db'

import './home-page.css'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const currentUser = await getCurrentDbUser()
  const [data, recentlyMade] = await Promise.all([
    loadHomepageData(currentUser),
    loadRecentlyMade({ limit: 12 }),
  ])

  // Wordmark fallback: zero published tutorials.
  if (
    data.thisWeeksEditorialPicks.length === 0 &&
    data.continueMaking.length === 0 &&
    data.inSeasonNow.length === 0 &&
    data.mostLovedBySpine.length === 0 &&
    !data.isOnboardingPending
  ) {
    return (
      <div className="home-fallback">
        <Wordmark />
        <div className="home-fallback-rule" />
        <p className="home-fallback-tagline">the home of making things yourself</p>
      </div>
    )
  }

  // Onboarding hero takes the whole stage when needed; we still load the
  // categories list so the picker doesn't roundtrip a second time.
  let onboardingCategories: { id: string; slug: string; name: string }[] = []
  if (data.isOnboardingPending) {
    onboardingCategories = await prisma.category.findMany({
      where: { isPublicVisible: true },
      orderBy: [{ launchOrder: 'asc' }, { order: 'asc' }, { name: 'asc' }],
      select: { id: true, slug: true, name: true },
    })
  }

  return (
    <div className="home-page">
      {/* ──────────────────────────────────────────────────────────────────
          Inline onboarding card — shown above rails for new users only
        ────────────────────────────────────────────────────────────────── */}
      {data.isOnboardingPending && (
        <section className="home-onboarding-zone">
          <OnboardingCard categories={onboardingCategories} />
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          State-aware hero (non-onboarding users)
        ────────────────────────────────────────────────────────────────── */}
      {!data.isOnboardingPending && (
        <section className="home-hero-zone">
          {data.hero.kind === 'SCHEDULED_STEP' && (
            <HeroScheduledStep action={data.hero.action} />
          )}

          {data.hero.kind === 'CONTINUE_MAKING' && (
            <HeroContinueMaking tutorial={data.hero.project} />
          )}

          {data.hero.kind === 'EDITORIAL_PICK' && (
            <HeroEditorialPick tutorial={data.hero.tutorial} />
          )}

          {data.hero.kind === 'WORDMARK_FALLBACK' && (
            <div className="home-hero-wordmark">
              <Wordmark />
              <p className="home-hero-tagline">the home of making things yourself</p>
            </div>
          )}
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          Rail stack
        ────────────────────────────────────────────────────────────────── */}

      {data.thisWeeksEditorialPicks.length > 0 && (
        <HomeRail heading="This week's editorial picks">
          {data.thisWeeksEditorialPicks.map((t) => (
            <HomeCard
              key={t.id}
              tutorial={t}
              state={readerStateFor(data.readerState, t.id)}
            />
          ))}
        </HomeRail>
      )}

      {data.continueMaking.length > 0 && (
        <HomeRail
          heading="Continue making"
          seeAllHref="/me/projects"
          seeAllLabel="All your projects →"
        >
          {data.continueMaking.map((t) => (
            <HomeCard
              key={t.id}
              tutorial={t}
              state={readerStateFor(data.readerState, t.id)}
            />
          ))}
        </HomeRail>
      )}

      {data.todaysScheduledActions.length > 0 && (
        <HomeRail
          heading="Today's scheduled project actions"
          subheading="The next step on what you're already making."
        >
          {data.todaysScheduledActions.map((action) => (
            <article key={action.userProjectId} className="home-scheduled-card">
              <Link
                href={`/${action.tutorial.category.slug}/${action.tutorial.slug}`}
                className="home-scheduled-card-link"
              >
                <span className="home-scheduled-overline">
                  Day {action.step.stepNumber} · {action.tutorial.title}
                </span>
                <span className="home-scheduled-title">{action.step.title}</span>
                <span className="home-scheduled-body">{action.step.body}</span>
              </Link>
            </article>
          ))}
        </HomeRail>
      )}

      {data.whereYouLeftOff.length > 0 && (
        <HomeRail
          heading="Where you left off"
          subheading="Projects you started a while back."
          seeAllHref="/me/projects?status=in-progress"
        >
          {data.whereYouLeftOff.map((t) => (
            <HomeCard
              key={t.id}
              tutorial={t}
              state={readerStateFor(data.readerState, t.id)}
            />
          ))}
        </HomeRail>
      )}

      {data.savedNotStarted.length > 0 && (
        <HomeRail
          heading="On your Make it list"
          subheading="Tutorials you've added but haven't started yet."
          seeAllHref="/me/projects?status=saved"
        >
          {data.savedNotStarted.map((t) => (
            <HomeCard
              key={t.id}
              tutorial={t}
              state={readerStateFor(data.readerState, t.id)}
            />
          ))}
        </HomeRail>
      )}

      {data.inSeasonNow.length > 0 && (
        <HomeRail heading="In season right now">
          {data.inSeasonNow.map((t) => (
            <HomeCard
              key={t.id}
              tutorial={t}
              state={readerStateFor(data.readerState, t.id)}
            />
          ))}
        </HomeRail>
      )}

      {data.newSinceLastVisit.length > 0 && (
        <HomeRail heading="New since you last visited">
          {data.newSinceLastVisit.map((t) => (
            <HomeCard
              key={t.id}
              tutorial={t}
              state={readerStateFor(data.readerState, t.id)}
            />
          ))}
        </HomeRail>
      )}

      {data.mostLovedBySpine.map((group) => (
        <HomeRail
          key={group.categorySlug}
          heading={`Most-loved in ${group.categoryName.toLowerCase()}`}
          seeAllHref={`/${group.categorySlug}`}
        >
          {group.tutorials.map((t) => (
            <HomeCard
              key={t.id}
              tutorial={t}
              state={readerStateFor(data.readerState, t.id)}
            />
          ))}
        </HomeRail>
      ))}

      {recentlyMade.length > 0 && (
        <RecentlyMadeRail
          heading="Recently made by the community"
          subheading="Real makes from real Makers on Homemade."
          tiles={recentlyMade}
        />
      )}

      <section className="home-all-categories">
        <header className="home-rail-header">
          <h2 className="home-rail-heading">Browse all categories</h2>
        </header>
        <div className="home-categories-grid">
          {data.allCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="home-category-tile"
            >
              <span className="home-category-tile-name">{cat.name}</span>
              {cat.description && (
                <span className="home-category-tile-description">
                  {cat.description}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

interface HeroTutorial {
  id: string
  slug: string
  title: string
  excerpt: string | null
  category: { slug: string; name: string }
  hero: { cloudflareId: string | null; r2Key: string | null; alt: string | null } | null
}

function HeroEditorialPick({ tutorial }: { tutorial: HeroTutorial }) {
  const hero = tutorialHeroSrc(tutorial, 'public', ['hero'])
  return (
    <Link
      href={`/${tutorial.category.slug}/${tutorial.slug}`}
      className="home-hero-feature"
    >
      <span className="home-hero-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={`home-hero-image${hero.isProcedural ? ' procedural' : ''}`}
          src={hero.src}
          srcSet={hero.srcSet}
          sizes="(min-width: 900px) 60vw, 100vw"
          alt={tutorial.hero?.alt ?? ''}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </span>
      <div className="home-hero-body">
        <span className="home-hero-overline">This week&apos;s editorial pick</span>
        <span className="home-hero-eyebrow">{tutorial.category.name}</span>
        <h1 className="home-hero-title">{tutorial.title}</h1>
        {tutorial.excerpt && (
          <p className="home-hero-excerpt">{tutorial.excerpt}</p>
        )}
        <span className="home-hero-cta">Read the guide →</span>
      </div>
    </Link>
  )
}

function HeroContinueMaking({ tutorial }: { tutorial: HeroTutorial }) {
  const hero = tutorialHeroSrc(tutorial, 'public', ['hero'])
  return (
    <Link
      href={`/${tutorial.category.slug}/${tutorial.slug}`}
      className="home-hero-feature"
    >
      <span className="home-hero-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={`home-hero-image${hero.isProcedural ? ' procedural' : ''}`}
          src={hero.src}
          srcSet={hero.srcSet}
          sizes="(min-width: 900px) 60vw, 100vw"
          alt={tutorial.hero?.alt ?? ''}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </span>
      <div className="home-hero-body">
        <span className="home-hero-overline">Continue making</span>
        <span className="home-hero-eyebrow">{tutorial.category.name}</span>
        <h1 className="home-hero-title">{tutorial.title}</h1>
        {tutorial.excerpt && (
          <p className="home-hero-excerpt">{tutorial.excerpt}</p>
        )}
        <span className="home-hero-cta">Pick up where you left off →</span>
      </div>
    </Link>
  )
}

interface ScheduledActionLike {
  userProjectId: string
  tutorial: HeroTutorial
  step: { title: string; body: string; stepNumber: number }
}

function HeroScheduledStep({ action }: { action: ScheduledActionLike }) {
  const hero = tutorialHeroSrc(action.tutorial, 'public', ['hero'])
  return (
    <Link
      href={`/${action.tutorial.category.slug}/${action.tutorial.slug}`}
      className="home-hero-feature"
    >
      <span className="home-hero-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={`home-hero-image${hero.isProcedural ? ' procedural' : ''}`}
          src={hero.src}
          srcSet={hero.srcSet}
          sizes="(min-width: 900px) 60vw, 100vw"
          alt={action.tutorial.hero?.alt ?? ''}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </span>
      <div className="home-hero-body">
        <span className="home-hero-overline">
          Today on your {action.tutorial.title.toLowerCase()}
        </span>
        <span className="home-hero-eyebrow">
          Day {action.step.stepNumber}
        </span>
        <h1 className="home-hero-title">{action.step.title}</h1>
        <p className="home-hero-excerpt">{action.step.body}</p>
        <span className="home-hero-cta">Open the project →</span>
      </div>
    </Link>
  )
}
