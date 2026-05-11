import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma, TutorialStatus } from '@homemade/db'
import { TutorialContent } from '@/components/public/tutorial-content/tutorial-content'
import { TutorialChrome } from '@/components/public/tutorial-chrome'
import type { TipTapNode } from '@/components/public/tutorial-content/types'
import { loadContentRefs } from '@/lib/tutorial-refs'
import { cloudflareDeliveryUrl } from '@/lib/media'

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

  const tutorial = await loadTutorial(categorySlug, tutorialSlug)
  if (!tutorial) notFound()

  const body = tutorial.body as TipTapNode | null
  const refs = await loadContentRefs(body, tutorial.id)
  const heroUrl = cloudflareDeliveryUrl(tutorial.hero?.cloudflareId, 'hero')

  return (
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
        />
      }
    />
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
