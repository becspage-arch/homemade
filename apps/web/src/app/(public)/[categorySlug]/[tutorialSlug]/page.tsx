import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma, TutorialStatus, UserProjectStatus } from '@homemade/db'
import { TutorialContent } from '@/components/public/tutorial-content/tutorial-content'
import { TutorialChrome } from '@/components/public/tutorial-chrome'
import type { TipTapNode } from '@/components/public/tutorial-content/types'
import { loadContentRefs } from '@/lib/tutorial-refs'
import { cloudflareDeliveryUrl } from '@/lib/media'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { harvestSupplies } from '@/lib/supplies'
import { BookmarkButton } from '@/components/public/tutorial-reader/bookmark-button'
import { ProjectButton } from '@/components/public/tutorial-reader/project-button'
import { ReadingProgress } from '@/components/public/tutorial-reader/reading-progress'
import { StickyToc } from '@/components/public/tutorial-reader/sticky-toc'
import { ProjectCompanion } from '@/components/public/tutorial-reader/project-companion'
import { BeginnerHelpFooter } from '@/components/public/tutorial-reader/beginner-help-footer'

import '@/components/public/tutorial-reader/tutorial-reader.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ categorySlug: string; tutorialSlug: string }>
}

async function loadTutorial(categorySlug: string, tutorialSlug: string) {
  return prisma.tutorial.findFirst({
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
          alt: true,
          caption: true,
          attribution: true,
        },
      },
    },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug, tutorialSlug } = await params
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

  const [tutorial, currentUser] = await Promise.all([
    loadTutorial(categorySlug, tutorialSlug),
    getCurrentDbUser(),
  ])
  if (!tutorial) notFound()

  const body = tutorial.body as TipTapNode | null
  const refs = await loadContentRefs(body, tutorial.id)
  const heroUrl = cloudflareDeliveryUrl(tutorial.hero?.cloudflareId, 'hero')
  const beginnerMode = currentUser?.beginnerMode === true

  // Per-user state: bookmark + project on this tutorial.
  const [bookmark, project] = currentUser
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
      ])
    : [null, null]

  const inProgressId =
    project?.status === UserProjectStatus.IN_PROGRESS ? project.id : null
  const supplies = inProgressId ? harvestSupplies(body) : []
  const initialChecked =
    project && Array.isArray(project.suppliesChecked)
      ? (project.suppliesChecked as string[]).filter((s) => typeof s === 'string')
      : []

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
    </>
  ) : null

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

  const footerSlot = beginnerMode ? (
    <BeginnerHelpFooter
      glossary={refs.glossary}
      categorySlug={tutorial.category.slug}
      categoryName={tutorial.category.name}
      subCategoryName={tutorial.subCategory?.name ?? null}
    />
  ) : null

  return (
    <>
      {currentUser && (
        <ReadingProgress
          projectId={inProgressId}
          initialPercent={project?.readingProgressPercent ?? 0}
        />
      )}
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
        publishedAt={tutorial.publishedAt}
        readingTime={estimateReadingTime(body)}
        sourceType={tutorial.sourceType}
        sourceNotes={tutorial.sourceNotes}
        body={
          <TutorialContent
            content={body}
            glossary={refs.glossary}
            subTutorials={refs.subTutorials}
            beginnerMode={beginnerMode}
          />
        }
        actionsSlot={actionsSlot}
        leftRail={leftRail}
        rightRail={rightRail}
        footerSlot={footerSlot}
      />
    </>
  )
}

function estimateReadingTime(body: TipTapNode | null): string | null {
  if (!body) return null
  let words = 0
  function walk(n: TipTapNode): void {
    if (n.text) {
      words += n.text.split(/\s+/).filter(Boolean).length
    }
    if (n.content) n.content.forEach(walk)
  }
  walk(body)
  if (words < 60) return null
  const minutes = Math.max(1, Math.round(words / 220))
  return `${minutes} min`
}
