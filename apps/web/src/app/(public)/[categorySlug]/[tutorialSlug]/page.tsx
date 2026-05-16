import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import * as Sentry from '@sentry/nextjs'
import { prisma, TutorialStatus, UserProjectStatus } from '@homemade/db'
import { TutorialContent } from '@/components/public/tutorial-content/tutorial-content'
import {
  ScaleProvider,
  extractScaleIngredients,
} from '@/components/public/tutorial-content/scale-context'
import { TutorialChrome } from '@/components/public/tutorial-chrome'
import type { TipTapNode } from '@/components/public/tutorial-content/types'
import { loadContentRefs } from '@/lib/tutorial-refs'
import { mediaUrl } from '@/lib/media'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { harvestSupplies } from '@/lib/supplies'
import { loadTutorialUgc } from '@/lib/ugc-loader'
import { captureServerEvent } from '@/lib/posthog'
import { BookmarkButton } from '@/components/public/tutorial-reader/bookmark-button'
import { ProjectButton } from '@/components/public/tutorial-reader/project-button'
import { ReadingProgress } from '@/components/public/tutorial-reader/reading-progress'
import { StickyToc } from '@/components/public/tutorial-reader/sticky-toc'
import { ProjectCompanion } from '@/components/public/tutorial-reader/project-companion'
import { BeginnerHelpFooter } from '@/components/public/tutorial-reader/beginner-help-footer'
import { ScrollDepthTracker } from '@/components/public/tutorial-reader/scroll-depth-tracker'
import { ShareButton } from '@/components/public/tutorial-reader/share-button'
import { ReviewsBlock } from '@/components/public/ugc/reviews-block'
import { PhotosBlock } from '@/components/public/ugc/photos-block'
import { QaBlock } from '@/components/public/ugc/qa-block'
import { ErrataLink } from '@/components/public/ugc/errata-link'
import { CookingModeShell } from '@/components/public/cooking-mode/cooking-mode-shell'
import { CookingModeToggle } from '@/components/public/cooking-mode/cooking-mode-toggle'

import '@/components/public/tutorial-reader/tutorial-reader.css'
import '@/components/public/ugc/ugc.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ categorySlug: string; tutorialSlug: string }>
}

// Genuine tutorial slugs are lowercase alphanumeric with optional hyphens,
// up to 80 chars. Anything else (dots, slashes, uppercase, encoded chars) is
// a scanner probe — reject before it reaches Prisma.
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/

function isValidSlug(s: unknown): s is string {
  return typeof s === 'string' && SLUG_RE.test(s)
}

const loadTutorial = cache(async (categorySlug: string, tutorialSlug: string) => {
  try {
    return await prisma.tutorial.findFirst({
      where: {
        slug: tutorialSlug,
        status: TutorialStatus.PUBLISHED,
        category: { slug: categorySlug },
      },
      include: {
        category: { select: { name: true, slug: true } },
        subCategory: { select: { name: true } },
        hero: {
          select: {
            cloudflareId: true,
            r2Key: true,
            alt: true,
            caption: true,
            attribution: true,
            source: true,
            creatorName: true,
            licenceCode: true,
            licenceUrl: true,
            requiresAttribution: true,
          },
        },
        creator: {
          select: {
            name: true,
            displayHandle: true,
            creatorVerifiedAt: true,
          },
        },
      },
    })
  } catch (err) {
    // Unknown Prisma errors on a lookup should 404, not 500. Report as a
    // warning so genuine regressions stay visible.
    Sentry.captureException(err, {
      level: 'warning',
      tags: { route: 'tutorial-page' },
    })
    return null
  }
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug, tutorialSlug } = await params
  if (!isValidSlug(categorySlug) || !isValidSlug(tutorialSlug)) {
    return { title: 'Not found · homemade' }
  }
  const tutorial = await loadTutorial(categorySlug, tutorialSlug)
  if (!tutorial) return { title: 'Not found · homemade' }
  return {
    title: `${tutorial.title} · homemade`,
    description: tutorial.excerpt ?? undefined,
    robots: { index: false, follow: false },
  }
}

export default async function TutorialPage({ params }: PageProps) {
  const { categorySlug, tutorialSlug } = await params
  if (!isValidSlug(categorySlug) || !isValidSlug(tutorialSlug)) {
    notFound()
  }

  const [tutorial, currentUser] = await Promise.all([
    loadTutorial(categorySlug, tutorialSlug),
    getCurrentDbUser(),
  ])
  if (!tutorial) notFound()

  const body = tutorial.body as TipTapNode | null
  const refs = await loadContentRefs(body, tutorial.id)
  const heroUrl = mediaUrl(tutorial.hero, 'hero')
  const beginnerMode = currentUser?.beginnerMode === true

  // Fire-and-forget pageview analytics. Anonymous readers get a stable
  // per-tutorial distinct id from the slug pair; signed-in readers get their
  // Clerk id so events stitch onto their PostHog profile.
  void captureServerEvent({
    event: 'tutorial_viewed',
    distinctId: currentUser?.clerkId ?? `anon:${categorySlug}:${tutorialSlug}`,
    properties: {
      tutorialId: tutorial.id,
      tutorialType: tutorial.type,
      categorySlug,
      tutorialSlug,
      authorId: tutorial.authorId,
      creatorId: tutorial.creatorId ?? null,
      difficulty: tutorial.difficulty,
      season: tutorial.season,
      cuisine: tutorial.cuisine,
      mealType: tutorial.mealType,
      wordCount: countWords(body),
      identified: Boolean(currentUser),
      cohortWeek: currentUser?.signupCohortWeek ?? null,
      acquisitionChannel: currentUser?.acquisitionChannel ?? null,
    },
  })

  // Per-user state: bookmark + project on this tutorial.
  const [bookmark, project, ugc] = currentUser
    ? await Promise.all([
        prisma.bookmark.findUnique({
          where: {
            userId_tutorialId: {
              userId: currentUser.id,
              tutorialId: tutorial.id,
            },
          },
          select: { id: true },
        }),
        prisma.userProject.findUnique({
          where: {
            userId_tutorialId: {
              userId: currentUser.id,
              tutorialId: tutorial.id,
            },
          },
        }),
        loadTutorialUgc(tutorial.id, currentUser),
      ])
    : await Promise.all([
        Promise.resolve(null),
        Promise.resolve(null),
        loadTutorialUgc(tutorial.id, null),
      ])

  const inProgressId =
    project?.status === UserProjectStatus.IN_PROGRESS ? project.id : null
  const supplies = inProgressId ? harvestSupplies(body) : []
  const initialChecked =
    project && Array.isArray(project.suppliesChecked)
      ? (project.suppliesChecked as string[]).filter((s) => typeof s === 'string')
      : []

  const shareButton = (
    <ShareButton
      tutorialId={tutorial.id}
      tutorialSlug={tutorialSlug}
      categorySlug={categorySlug}
      title={tutorial.title}
      excerpt={tutorial.excerpt}
      heroUrl={heroUrl}
    />
  )

  const actionsSlot = currentUser ? (
    <>
      <BookmarkButton
        tutorialId={tutorial.id}
        initialBookmarked={Boolean(bookmark)}
      />
      <ProjectButton
        tutorialId={tutorial.id}
        projectId={project?.id ?? null}
        status={project?.status ?? null}
        completedAt={project?.completedAt ?? null}
      />
      {shareButton}
      {tutorial.type === 'RECIPE' && <CookingModeToggle />}
    </>
  ) : (
    <>
      {shareButton}
      {tutorial.type === 'RECIPE' && <CookingModeToggle />}
    </>
  )

  const showRails = Boolean(currentUser)
  const leftRail = showRails ? <StickyToc /> : null
  const rightRail =
    showRails && inProgressId && project ? (
      <ProjectCompanion
        projectId={inProgressId}
        supplies={supplies}
        initialChecked={initialChecked}
        initialNotes={project.notes}
        beginnerMode={beginnerMode}
      />
    ) : showRails ? (
      <div /> // placeholder so the right column reserves space
    ) : null

  const canReview =
    Boolean(currentUser) &&
    project?.status === UserProjectStatus.COMPLETED
  const canUploadPhoto =
    Boolean(currentUser) &&
    (project?.status === UserProjectStatus.IN_PROGRESS ||
      project?.status === UserProjectStatus.COMPLETED)

  const footerSlot = (
    <>
      {beginnerMode && (
        <BeginnerHelpFooter
          glossary={refs.glossary}
          categorySlug={tutorial.category.slug}
          categoryName={tutorial.category.name}
          subCategoryName={tutorial.subCategory?.name ?? null}
        />
      )}

      <PhotosBlock
        tutorialId={tutorial.id}
        signedIn={Boolean(currentUser)}
        canUpload={canUploadPhoto}
        photos={ugc.photos}
      />

      <ReviewsBlock
        tutorialId={tutorial.id}
        signedIn={Boolean(currentUser)}
        canReview={canReview}
        alreadyReviewed={ugc.reviews.alreadyReviewed}
        avg={ugc.reviews.avg}
        total={ugc.reviews.total}
        distribution={ugc.reviews.distribution}
        reviews={ugc.reviews.rows}
      />

      <QaBlock
        tutorialId={tutorial.id}
        signedIn={Boolean(currentUser)}
        questions={ugc.questions}
      />

      <ErrataLink tutorialId={tutorial.id} />
    </>
  )

  const isRecipe = tutorial.type === 'RECIPE'
  const chrome = (
    <TutorialChrome
      title={tutorial.title}
      subtitle={tutorial.subtitle}
      excerpt={tutorial.excerpt}
      category={tutorial.category}
      subCategoryName={tutorial.subCategory?.name ?? null}
      difficulty={tutorial.difficulty}
      timeMinutes={tutorial.timeMinutes}
      season={tutorial.season}
      heroUrl={heroUrl}
      heroAlt={tutorial.hero?.alt ?? null}
      heroAttribution={
        tutorial.hero?.requiresAttribution
          ? {
              creatorName: tutorial.hero.creatorName,
              source: tutorial.hero.source,
              licenceCode: tutorial.hero.licenceCode,
              licenceUrl: tutorial.hero.licenceUrl,
            }
          : null
      }
      publishedAt={tutorial.publishedAt}
      readingTime={estimateReadingTime(body)}
      sourceType={tutorial.sourceType}
      sourceNotes={tutorial.sourceNotes}
      attribution={
        tutorial.creator
          ? {
              name: tutorial.creator.name ?? tutorial.creator.displayHandle ?? 'A maker',
              handle: tutorial.creator.displayHandle,
              verified: Boolean(tutorial.creator.creatorVerifiedAt),
              homemade: false,
            }
          : { name: null, handle: null, verified: false, homemade: true }
      }
      recipeMeta={{
        type: tutorial.type,
        servings: tutorial.servings,
        yieldDescription: tutorial.yieldDescription,
        prepMinutes: tutorial.prepMinutes,
        cookMinutes: tutorial.cookMinutes,
        totalMinutes: tutorial.totalMinutes,
        cuisine: tutorial.cuisine,
        mealType: tutorial.mealType,
        dietaryFlags: tutorial.dietaryFlags,
        freezable: tutorial.freezable,
        batchable: tutorial.batchable,
        makeAheadSummary: tutorial.makeAheadNotes,
        foundational: tutorial.foundational,
      }}
      body={
        <TutorialContent
          content={body}
          glossary={refs.glossary}
          subTutorials={refs.subTutorials}
          beginnerMode={beginnerMode}
          recipeContext={
            isRecipe
              ? {
                  tutorialId: tutorial.id,
                  tutorialSlug,
                  scalable: tutorial.scalable,
                }
              : null
          }
        />
      }
      actionsSlot={actionsSlot}
      leftRail={leftRail}
      rightRail={rightRail}
      footerSlot={footerSlot}
    />
  )

  return (
    <CookingModeShell
      tutorialSlug={tutorialSlug}
      tutorialTitle={tutorial.title}
      body={body}
      glossary={refs.glossary}
      subTutorials={refs.subTutorials}
      beginnerMode={beginnerMode}
      autoEnableByDefault={Boolean(currentUser?.cookingModeAutoEnable)}
    >
      <ScrollDepthTracker tutorialId={tutorial.id} />
      {currentUser && (
        <ReadingProgress
          projectId={inProgressId}
          initialPercent={project?.readingProgressPercent ?? 0}
        />
      )}
      {isRecipe ? (
        <ScaleProvider
          defaultServings={tutorial.servings ?? null}
          ingredients={extractScaleIngredients(body)}
        >
          {chrome}
        </ScaleProvider>
      ) : (
        chrome
      )}
    </CookingModeShell>
  )
}

function countWords(body: TipTapNode | null): number {
  if (!body) return 0
  let words = 0
  function walk(n: TipTapNode): void {
    if (n.text) {
      words += n.text.split(/\s+/).filter(Boolean).length
    }
    if (n.content) n.content.forEach(walk)
  }
  walk(body)
  return words
}

function estimateReadingTime(body: TipTapNode | null): string | null {
  const words = countWords(body)
  if (words < 60) return null
  const minutes = Math.max(1, Math.round(words / 220))
  return `${minutes} min`
}
