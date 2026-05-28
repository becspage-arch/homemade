import type { Metadata } from 'next'
import { HomeCard } from '@/components/public/home-card'
import { HomeRail } from '@/components/public/home-rail'
import { OnboardingCard } from '@/components/public/onboarding-card'
import { RecentlyMadeRail } from '@/components/public/recently-made-rail'
import { InSeasonMosaic } from '@/components/public/in-season-mosaic'
import { CategoryImageTiles } from '@/components/public/category-image-tiles'
import { HeroOverlay } from '@/components/public/home-cards/hero-overlay'
import { ScheduledActionCard } from '@/components/public/home-cards/scheduled-action-card'
import { Wordmark } from '@/components/wordmark'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { loadHomepageData } from '@/lib/homepage-data'
import { loadRecentlyMade } from '@/lib/recently-made'
import { loadActiveMakerOfTheMonth } from '@/lib/maker-of-the-month'
import { MakerOfTheMonthTile } from '@/components/public/maker-of-the-month-tile'
import { readerStateFor } from '@/lib/user-state'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import { prisma } from '@homemade/db'

import './home-page.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Homemade — the home of making things yourself',
  description:
    'Cooking, baking, growing, herbal medicine, sewing, knitting, pottery and more — tested recipes and clear techniques from independent makers.',
  path: '/',
  ogType: 'website',
})

export default async function HomePage() {
  const currentUser = await getCurrentDbUser()
  const [data, recentlyMade, motm] = await Promise.all([
    loadHomepageData(currentUser),
    loadRecentlyMade({ limit: 12 }),
    loadActiveMakerOfTheMonth(),
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

  // Onboarding hero takes the whole stage when needed.
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
      {/* Inline onboarding card — new users only, above the hero. */}
      {data.isOnboardingPending && (
        <section className="home-onboarding-zone">
          <OnboardingCard categories={onboardingCategories} />
        </section>
      )}

      {/* State-aware hero — full-bleed image with overlay. */}
      {!data.isOnboardingPending && (
        <section className="home-hero-zone">
          {data.hero.kind === 'SCHEDULED_STEP' && (
            <HeroOverlay
              href={`/${data.hero.action.tutorial.category.slug}/${data.hero.action.tutorial.slug}`}
              imageMedia={data.hero.action.tutorial.hero}
              overline={`Today on your ${data.hero.action.tutorial.title.toLowerCase()}`}
              eyebrow={`Day ${data.hero.action.step.stepNumber}`}
              title={data.hero.action.step.title}
              excerpt={data.hero.action.step.body}
              ctaLabel="Open the project →"
            />
          )}

          {data.hero.kind === 'CONTINUE_MAKING' && (
            <HeroOverlay
              href={`/${data.hero.project.category.slug}/${data.hero.project.slug}`}
              imageMedia={data.hero.project.hero}
              overline="Continue making"
              eyebrow={data.hero.project.category.name}
              title={data.hero.project.title}
              excerpt={data.hero.project.excerpt}
              ctaLabel="Pick up where you left off →"
            />
          )}

          {data.hero.kind === 'EDITORIAL_PICK' && (
            <HeroOverlay
              href={`/${data.hero.tutorial.category.slug}/${data.hero.tutorial.slug}`}
              imageMedia={data.hero.tutorial.hero}
              overline="This week's editorial pick"
              eyebrow={data.hero.tutorial.category.name}
              title={data.hero.tutorial.title}
              excerpt={data.hero.tutorial.excerpt}
              ctaLabel="Read the guide →"
            />
          )}

          {data.hero.kind === 'WORDMARK_FALLBACK' && (
            <div className="home-hero-wordmark">
              <Wordmark />
              <p className="home-hero-tagline">the home of making things yourself</p>
            </div>
          )}
        </section>
      )}

      {/* Rail stack. */}

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
            <ScheduledActionCard
              key={action.userProjectId}
              href={`/${action.tutorial.category.slug}/${action.tutorial.slug}`}
              overline={`Day ${action.step.stepNumber} · ${action.tutorial.title}`}
              title={action.step.title}
              body={action.step.body}
              tutorial={action.tutorial}
            />
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
        <InSeasonMosaic
          heading="In season right now"
          tutorials={data.inSeasonNow}
          readerState={data.readerState}
        />
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

      {motm && <MakerOfTheMonthTile motm={motm} />}

      {recentlyMade.length > 0 && (
        <RecentlyMadeRail
          heading="Recently made by the community"
          subheading="Real makes from real Makers on Homemade."
          tiles={recentlyMade}
        />
      )}

      <CategoryImageTiles categories={data.allCategories} />
    </div>
  )
}
