import type { Metadata } from 'next'
import { HomeCard } from '@/components/public/home-card'
import { HomeRail } from '@/components/public/home-rail'
import { OnboardingCard } from '@/components/public/onboarding-card'
import { DiscoveryFeed, type DiscoveryItem } from '@/components/public/discovery-feed'
import { PatternResumeCard } from '@/components/public/pattern-resume-card'
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
  title: 'Homemade — the home of all things homemade',
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
        <p className="home-fallback-tagline">the home of all things homemade</p>
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

  // Discover wall: fold the discovery rails (in-season, this week's editorial
  // picks, new, most-loved) into one deduped, source-interleaved list so the
  // wall mixes categories rather than clustering them, then weave community
  // makes in among the tutorials.
  const discoveryTutorials = interleaveDedupe([
    data.inSeasonNow,
    data.thisWeeksEditorialPicks,
    data.newSinceLastVisit,
    ...data.mostLovedBySpine.map((g) => g.tutorials),
  ]).slice(0, 28)

  const discoveryItems: DiscoveryItem[] = []
  let communityIdx = 0
  discoveryTutorials.forEach((tutorial, i) => {
    discoveryItems.push({ kind: 'tutorial', tutorial })
    if ((i + 1) % 6 === 0 && communityIdx < recentlyMade.length) {
      discoveryItems.push({ kind: 'community', tile: recentlyMade[communityIdx++]! })
    }
  })
  while (communityIdx < recentlyMade.length && discoveryItems.length < 36) {
    discoveryItems.push({ kind: 'community', tile: recentlyMade[communityIdx++]! })
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
              overline={null}
              eyebrow={null}
              title={data.hero.project.title}
              excerpt={data.hero.project.excerpt}
              ctaLabel="Pick up where you left off →"
            />
          )}

          {data.hero.kind === 'EDITORIAL_PICK' && (
            <HeroOverlay
              href={`/${data.hero.tutorial.category.slug}/${data.hero.tutorial.slug}`}
              imageMedia={data.hero.tutorial.hero}
              overline={null}
              eyebrow={null}
              title={data.hero.tutorial.title}
              excerpt={data.hero.tutorial.excerpt}
              ctaLabel={heroCtaLabel(data.hero.tutorial.category.slug)}
            />
          )}

          {data.hero.kind === 'WORDMARK_FALLBACK' && (
            <div className="home-hero-wordmark">
              <Wordmark />
              <p className="home-hero-tagline">the home of all things homemade</p>
            </div>
          )}
        </section>

      {/* ── Resume: personal rails (signed-in users only). Fixed-width
            cards — the "pick it back up" pattern. ── */}

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

      {(data.continueMaking.length > 0 ||
        data.continueMakingPatterns.length > 0) && (
        <HomeRail
          heading="Continue where you left off"
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
          {data.continueMakingPatterns.map((p) => (
            <PatternResumeCard key={`pat-${p.id}`} pattern={p} />
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

      {/* ── Discover: the masonry wall. In-season, editorial picks, new,
            most-loved and community makes all fold into one mixed,
            save-able feed. ── */}
      <DiscoveryFeed
        heading="Make something this week"
        subheading="In season now, picked for you."
        items={discoveryItems}
        readerState={data.readerState}
        moreHref="/search"
      />

      {motm && <MakerOfTheMonthTile motm={motm} />}

      {/* ── Navigate: browse every category. ── */}
      <CategoryImageTiles categories={data.allCategories} />
    </div>
  )
}

/**
 * Round-robin merge of several tutorial lists into one, dropping duplicates by
 * id (first occurrence wins). Taking position 0 from every source, then
 * position 1, and so on mixes the sources together — so the discovery wall
 * alternates seasonal / editorial / new / most-loved rather than showing one
 * source in a block.
 */
function interleaveDedupe<T extends { id: string }>(groups: T[][]): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  const max = groups.reduce((m, g) => Math.max(m, g.length), 0)
  for (let i = 0; i < max; i++) {
    for (const g of groups) {
      const item = g[i]
      if (item && !seen.has(item.id)) {
        seen.add(item.id)
        out.push(item)
      }
    }
  }
  return out
}

/**
 * Per-category CTA verb for the editorial-pick hero. Cooking and baking
 * get domain verbs; everything else falls to the generic "Start now".
 * Sentence case in the source; CSS uppercases at render time.
 */
function heroCtaLabel(categorySlug: string): string {
  switch (categorySlug) {
    case 'cooking':
      return 'Start cooking →'
    case 'baking':
      return 'Start baking →'
    default:
      return 'Start now →'
  }
}
