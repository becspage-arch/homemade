import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import * as Sentry from '@sentry/nextjs'
import { prisma, TutorialStatus, UserProjectStatus, TutorialType } from '@homemade/db'
import { TutorialContent } from '@/components/public/tutorial-content/tutorial-content'
import { ScaleProvider } from '@/components/public/tutorial-content/scale-context'
// Imported from the server-safe sibling module rather than `scale-context`
// itself — that file is marked `'use client'`, which would make this
// extractor a client-only reference and crash the server render.
import { extractScaleIngredients } from '@/components/public/tutorial-content/scale-extract'
import { TutorialChrome } from '@/components/public/tutorial-chrome'
import type { TipTapNode } from '@/components/public/tutorial-content/types'
import { loadContentRefs } from '@/lib/tutorial-refs'
import { tutorialHeroUrl } from '@/lib/tutorial-hero'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { harvestSupplies } from '@/lib/supplies'
import { loadTutorialUgc } from '@/lib/ugc-loader'
import { captureServerEvent } from '@/lib/posthog'
import { JsonLd } from '@/components/seo/json-ld'
import { RelatedTutorials } from '@/components/public/related-tutorials'
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildHowToSchema,
  buildRecipeSchema,
  type BreadcrumbItem,
} from '@/lib/seo/schema-builders'
import {
  buildPublicMetadata,
  notFoundMetadata,
  type OpenGraphType,
} from '@/lib/seo/metadata-helpers'
import { extractRecipeInstructions, extractPlainText } from '@/lib/seo/extract-recipe-instructions'
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
import { MadeByMakers } from '@/components/public/tutorial-reader/made-by-makers'
import { DidYouMakeThisPrompt } from '@/components/public/tutorial-reader/did-you-make-this-prompt'
import {
  recordTutorialVisit,
  shouldShowDidYouMakeThisPrompt,
} from '@/lib/did-you-make-this'

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
        // `heroImageStrategy` is selected so the public renderer can fall
        // back to the procedural card whenever image-verification rejected
        // the stored photo — the attached Media row's `r2Key` points at a
        // 404 in that case, so it must not be served.
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
    return notFoundMetadata()
  }
  const tutorial = await loadTutorial(categorySlug, tutorialSlug)
  if (!tutorial) return notFoundMetadata()
  const heroUrl = tutorialHeroUrl(tutorial, 'hero')
  const authorName = tutorial.creator?.name ?? tutorial.creator?.displayHandle ?? 'Homemade Editorial'
  const description =
    tutorial.excerpt
      ?? extractPlainText(tutorial.body as TipTapNode | null, 160)
  return buildPublicMetadata({
    title: `${tutorial.title} | ${tutorial.category.name}`,
    description,
    path: `/${categorySlug}/${tutorialSlug}`,
    ogType: ogTypeForTutorial(tutorial.type),
    imageUrl: heroUrl,
    imageAlt: tutorial.hero?.alt ?? tutorial.title,
    publishedTime: tutorial.publishedAt,
    modifiedTime: tutorial.updatedAt,
    author: authorName,
    keywords: tutorialKeywords(tutorial),
  })
}

function ogTypeForTutorial(_type: TutorialType): OpenGraphType {
  // All tutorial types are long-form content — OG article fits across
  // recipe, technique, practice, reading, growing guide, remedy, stitch,
  // pattern and herb profile. Distinction kicked down to schema.org JSON-LD.
  return 'article'
}

function tutorialKeywords(tutorial: {
  category: { name: string }
  subCategory: { name: string } | null
  techniqueSlugs: string[]
  cuisine: string | null
  mealType: string | null
}): string[] {
  const keys = new Set<string>()
  keys.add(tutorial.category.name.toLowerCase())
  if (tutorial.subCategory?.name) keys.add(tutorial.subCategory.name.toLowerCase())
  if (tutorial.cuisine) keys.add(tutorial.cuisine)
  if (tutorial.mealType) keys.add(tutorial.mealType)
  for (const slug of tutorial.techniqueSlugs) {
    keys.add(slug.replace(/-/g, ' '))
  }
  return Array.from(keys).slice(0, 12)
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
  const heroUrl = tutorialHeroUrl(tutorial, 'hero')
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

  // "Did you make this?" — signed-in Makers only. Record the visit, then
  // ask the helper whether the prompt should render. Anonymous visitors
  // never reach this branch, so we never write to TutorialVisit for them.
  let didYouMakeThis: { show: boolean; visitCount: number } | null = null
  if (currentUser) {
    const { count } = await recordTutorialVisit({
      userId: currentUser.id,
      tutorialId: tutorial.id,
    })
    didYouMakeThis = await shouldShowDidYouMakeThisPrompt({
      userId: currentUser.id,
      tutorialId: tutorial.id,
      visitCount: count,
      dismissedDidYouMakeThis: currentUser.dismissedDidYouMakeThis,
    })
  }

  // "Made by Homemade Makers" — public UserProjects from Makers with public
  // profiles, capped at 6 + a count of any beyond. This is the E-E-A-T
  // signal mentioned in the Master Plan SEO section.
  const MADE_BY_LIMIT = 6
  const [madeByTiles, madeByTotal] = await Promise.all([
    prisma.userProject.findMany({
      where: {
        tutorialId: tutorial.id,
        isPublic: true,
        user: {
          isPublicMakerProfile: true,
          displayHandle: { not: null },
        },
      },
      orderBy: [{ publishedAt: 'desc' }, { startedAt: 'desc' }],
      take: MADE_BY_LIMIT,
      select: {
        id: true,
        publishedAt: true,
        heroPhoto: {
          select: { media: { select: { cloudflareId: true, r2Key: true } } },
        },
        user: { select: { name: true, displayHandle: true } },
      },
    }),
    prisma.userProject.count({
      where: {
        tutorialId: tutorial.id,
        isPublic: true,
        user: {
          isPublicMakerProfile: true,
          displayHandle: { not: null },
        },
      },
    }),
  ])

  const madeByMakers = madeByTiles.map((t) => ({
    projectId: t.id,
    publishedAt: t.publishedAt,
    heroSource: t.heroPhoto?.media ?? null,
    makerName: t.user.name ?? t.user.displayHandle ?? 'A maker',
    makerHandle: t.user.displayHandle!,
  }))

  // Schema-only ingredient pull. Recipe schema needs structured ingredient
  // rows; the visible ingredients list is rendered separately from TipTap.
  const recipeIngredients =
    tutorial.type === TutorialType.RECIPE
      ? await prisma.recipeIngredient.findMany({
          where: { tutorialId: tutorial.id },
          orderBy: [{ position: 'asc' }],
          select: {
            amount: true,
            unit: true,
            prepNote: true,
            ingredient: { select: { name: true } },
          },
        })
      : []

  // For HowTo supplies we already harvest from the body; tools come from the
  // RecipeTool join. Both are no-ops on Article-type tutorials.
  const recipeTools =
    tutorial.type === TutorialType.TECHNIQUE
      ? await prisma.recipeTool.findMany({
          where: { tutorialId: tutorial.id },
          orderBy: [{ position: 'asc' }],
          select: { tool: { select: { name: true } } },
        })
      : []

  const recipeInstructions = extractRecipeInstructions(body)
  const schemaAuthor = {
    name: tutorial.creator?.name ?? tutorial.creator?.displayHandle ?? 'Homemade Editorial',
    handle: tutorial.creator?.displayHandle ?? null,
  }
  const tutorialUrl = `/${categorySlug}/${tutorialSlug}`
  const keywords = tutorialKeywords(tutorial)
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Home', href: '/' },
    { name: tutorial.category.name, href: `/${tutorial.category.slug}` },
    { name: tutorial.title, href: tutorialUrl },
  ]

  let tutorialSchema: Record<string, unknown>
  if (tutorial.type === TutorialType.RECIPE) {
    tutorialSchema = buildRecipeSchema({
      tutorialSlug,
      categorySlug,
      title: tutorial.title,
      excerpt: tutorial.excerpt,
      heroUrl,
      author: schemaAuthor,
      publishedAt: tutorial.publishedAt,
      updatedAt: tutorial.updatedAt,
      prepMinutes: tutorial.prepMinutes,
      cookMinutes: tutorial.cookMinutes,
      totalMinutes: tutorial.totalMinutes,
      servings: tutorial.servings,
      yieldDescription: tutorial.yieldDescription,
      cuisine: tutorial.cuisine,
      mealType: tutorial.mealType,
      dietaryFlags: tutorial.dietaryFlags,
      ingredients: recipeIngredients,
      instructions: recipeInstructions,
      keywords,
      rating:
        ugc.reviews.avg != null && ugc.reviews.total > 0
          ? { avg: ugc.reviews.avg, total: ugc.reviews.total }
          : null,
    })
  } else if (tutorial.type === TutorialType.TECHNIQUE) {
    tutorialSchema = buildHowToSchema({
      tutorialSlug,
      categorySlug,
      title: tutorial.title,
      excerpt: tutorial.excerpt,
      heroUrl,
      author: schemaAuthor,
      publishedAt: tutorial.publishedAt,
      updatedAt: tutorial.updatedAt,
      totalMinutes: tutorial.totalMinutes ?? tutorial.timeMinutes,
      supplies: harvestSupplies(body).map((s) =>
        s.qty ? `${s.qty} ${s.name}`.trim() : s.name,
      ),
      tools: recipeTools.map((r) => r.tool.name),
      instructions: recipeInstructions,
      keywords,
    })
  } else {
    tutorialSchema = buildArticleSchema({
      url: tutorialUrl,
      title: tutorial.title,
      excerpt: tutorial.excerpt,
      heroUrl,
      author: schemaAuthor,
      publishedAt: tutorial.publishedAt,
      updatedAt: tutorial.updatedAt,
      articleSection: tutorial.category.name,
      keywords,
    })
  }
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems)
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

      <MadeByMakers
        tiles={madeByMakers}
        totalCount={madeByTotal}
        tutorialCategorySlug={tutorial.category.slug}
        tutorialSlug={tutorialSlug}
      />

      <RelatedTutorials
        currentTutorialId={tutorial.id}
        categoryId={tutorial.categoryId}
        subCategoryId={tutorial.subCategoryId ?? null}
        techniqueSlugs={tutorial.techniqueSlugs}
      />

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
      updatedAt={tutorial.updatedAt}
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
      requiresKiln={tutorial.requiresKiln}
      requiresWheel={tutorial.requiresWheel}
      body={
        <>
          {didYouMakeThis?.show && (
            <DidYouMakeThisPrompt
              tutorialId={tutorial.id}
              visitCount={didYouMakeThis.visitCount}
            />
          )}
          <TutorialContent
            content={body}
            glossary={refs.glossary}
            subTutorials={refs.subTutorials}
            techniques={refs.techniques}
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
            tutorialId={tutorial.id}
            isSignedIn={Boolean(currentUser)}
          />
        </>
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
      techniques={refs.techniques}
      beginnerMode={beginnerMode}
      autoEnableByDefault={Boolean(currentUser?.cookingModeAutoEnable)}
    >
      <JsonLd data={[tutorialSchema, breadcrumbSchema]} />
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
