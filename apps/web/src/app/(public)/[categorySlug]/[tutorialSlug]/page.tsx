import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma, TutorialStatus } from '@homemade/db'
import { TutorialContent } from '@/components/public/tutorial-content/tutorial-content'
import type { TipTapNode } from '@/components/public/tutorial-content/types'
import { loadContentRefs } from '@/lib/tutorial-refs'
import { cloudflareDeliveryUrl } from '@/lib/media'

import './tutorial-page.css'

export const dynamic = 'force-dynamic'

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

const SEASON_LABEL: Record<string, string> = {
  SPRING: 'Spring',
  SUMMER: 'Summer',
  AUTUMN: 'Autumn',
  WINTER: 'Winter',
  YEAR_ROUND: 'Year-round',
}

const SOURCE_LABEL: Record<string, string> = {
  TESTED: 'Tested in the Homemade kitchen, garden, or studio.',
  CLASSIC:
    'A classic technique with long precedent, cross-referenced across established sources.',
  SYNTHESISED:
    'Synthesised from public-domain and extension-service sources by the Homemade editorial team.',
  PUBLIC_DOMAIN: 'From the public domain.',
  CREATOR: 'Contributed by an external creator.',
}

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
  const readingTime = estimateReadingTime(body)

  return (
    <article className="tutorial-page">
      <div className="tutorial-page-hero">
        <nav aria-label="Breadcrumb" className="tutorial-breadcrumb">
          <Link href={`/${tutorial.category.slug}`}>{tutorial.category.name}</Link>
          {tutorial.subCategory && (
            <>
              <span aria-hidden="true">/</span>
              <span>{tutorial.subCategory.name}</span>
            </>
          )}
        </nav>

        <div className="tutorial-hero-grid">
          <div className="tutorial-hero-text">
            <h1 className="tutorial-title">{tutorial.title}</h1>
            {tutorial.subtitle && (
              <p className="tutorial-standfirst">{tutorial.subtitle}</p>
            )}
            {tutorial.excerpt && !tutorial.subtitle && (
              <p className="tutorial-standfirst">{tutorial.excerpt}</p>
            )}
          </div>

          {heroUrl ? (
            <div
              className="tutorial-hero-image"
              role="img"
              aria-label={tutorial.hero?.alt ?? tutorial.title}
              style={{ backgroundImage: `url(${heroUrl})` }}
            />
          ) : (
            <div className="tutorial-hero-image placeholder" aria-hidden="true">
              h
            </div>
          )}
        </div>

        <dl className="tutorial-info-bar">
          <div>
            <dt>Difficulty</dt>
            <dd>{DIFFICULTY_LABEL[tutorial.difficulty] ?? tutorial.difficulty}</dd>
          </div>
          {tutorial.timeMinutes !== null && (
            <div>
              <dt>Time</dt>
              <dd>{formatTime(tutorial.timeMinutes)}</dd>
            </div>
          )}
          {tutorial.season && (
            <div>
              <dt>Season</dt>
              <dd>{SEASON_LABEL[tutorial.season] ?? tutorial.season}</dd>
            </div>
          )}
          {readingTime && (
            <div>
              <dt>Reading time</dt>
              <dd>{readingTime}</dd>
            </div>
          )}
          {tutorial.publishedAt && (
            <div>
              <dt>Published</dt>
              <dd>
                <time dateTime={tutorial.publishedAt.toISOString()}>
                  {tutorial.publishedAt.toLocaleDateString('en-GB', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="tutorial-page-body">
        <TutorialContent
          content={body}
          glossary={refs.glossary}
          subTutorials={refs.subTutorials}
        />

        <aside className="tutorial-sources">
          <span className="tutorial-sources-label">
            {tutorial.sourceType === 'TESTED'
              ? 'A note from Homemade'
              : 'Sources and provenance'}
          </span>
          <p className="tutorial-sources-text">
            {SOURCE_LABEL[tutorial.sourceType] ?? ''}
          </p>
          {tutorial.sourceNotes && (
            <p className="tutorial-sources-notes">{tutorial.sourceNotes}</p>
          )}
        </aside>
      </div>
    </article>
  )
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours} hr`
  return `${hours} hr ${mins} min`
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
