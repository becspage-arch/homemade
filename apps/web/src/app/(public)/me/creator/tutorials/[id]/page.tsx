import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma, TutorialStatus } from '@homemade/db'
import type { JSONContent } from '@tiptap/core'
import { TutorialForm } from '@/components/admin/tutorials/tutorial-form'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { loadTutorialFormData } from '@/app/admin/tutorials/form-data'
import {
  updateCreatorTutorial,
  deleteCreatorTutorial,
} from '@/lib/creator-tutorial-actions'
import { CreatorTutorialActions } from './creator-tutorial-actions-bar'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CreatorTutorialEditPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  if (!user.isCreator) redirect('/me/creator')

  const tutorial = await prisma.tutorial.findUnique({
    where: { id },
    include: {
      tags: { select: { id: true } },
      category: { select: { slug: true } },
    },
  })
  if (!tutorial) notFound()
  if (tutorial.creatorId !== user.id) notFound()

  const data = await loadTutorialFormData(tutorial.id)
  const updateAction = updateCreatorTutorial.bind(null, tutorial.id)

  return (
    <>
      <section>
        <span className="me-section-label">Creator</span>
        <h2 className="me-section-title">{tutorial.title}</h2>
        <div
          style={{
            fontFamily: 'var(--font-lora)',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            color: 'var(--color-warm-taupe)',
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          <span className="me-status-pill">
            {tutorial.status.toLowerCase().replace('_', ' ')}
          </span>
          {tutorial.status === TutorialStatus.PUBLISHED && (
            <Link
              href={`/${tutorial.category.slug}/${tutorial.slug}`}
              style={{ color: 'var(--color-sage)' }}
            >
              view live →
            </Link>
          )}
          <Link href="/me/creator/tutorials" className="me-nav-link">
            ← all your tutorials
          </Link>
        </div>
      </section>

      <CreatorTutorialActions
        tutorialId={tutorial.id}
        status={tutorial.status}
      />

      {tutorial.status === TutorialStatus.PENDING_MODERATION && (
        <p className="me-empty">
          This draft is with the Homemade team for review. You’ll get a
          notification once they’ve decided.
        </p>
      )}

      <section>
        <TutorialForm
          action={updateAction}
          submitLabel={tutorial.status === TutorialStatus.PUBLISHED ? 'save changes' : 'save draft'}
          defaults={{
            title: tutorial.title,
            slug: tutorial.slug,
            subtitle: tutorial.subtitle ?? '',
            excerpt: tutorial.excerpt ?? '',
            categoryId: tutorial.categoryId,
            subCategoryId: tutorial.subCategoryId,
            tagIds: tutorial.tags.map((t) => t.id),
            difficulty: tutorial.difficulty,
            season: tutorial.season ?? '',
            sourceType: tutorial.sourceType,
            sourceNotes: tutorial.sourceNotes ?? '',
            timeMinutes: tutorial.timeMinutes != null ? String(tutorial.timeMinutes) : '',
            heroMediaId: tutorial.heroMediaId,
            body: (tutorial.body ?? { type: 'doc', content: [{ type: 'paragraph' }] }) as JSONContent,
          }}
          cloudflareDeliveryHash={process.env.CLOUDFLARE_IMAGES_DELIVERY_HASH ?? null}
          {...data}
        />
      </section>

      {tutorial.status !== TutorialStatus.PUBLISHED && (
        <section>
          <span className="me-section-label">Danger zone</span>
          <h2 className="me-section-title">Delete</h2>
          <form action={deleteCreatorTutorial.bind(null, tutorial.id)}>
            <button type="submit" className="me-button danger">
              Delete this draft
            </button>
          </form>
        </section>
      )}
    </>
  )
}
