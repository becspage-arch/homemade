import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@homemade/db'
import type { JSONContent } from '@tiptap/core'
import { TutorialForm } from '@/components/admin/tutorials/tutorial-form'
import { StatusControls } from '@/components/admin/tutorials/status-controls'
import {
  updateTutorial,
  transitionTutorialStatus,
  deleteTutorial,
} from '../actions'
import { loadTutorialFormData } from '../form-data'

export const dynamic = 'force-dynamic'

const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] }

export default async function EditTutorialPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [tutorial, formData] = await Promise.all([
    prisma.tutorial.findUnique({
      where: { id },
      include: {
        tags: { select: { id: true } },
        _count: { select: { versions: true } },
      },
    }),
    loadTutorialFormData(id),
  ])

  if (!tutorial) notFound()

  const updateAction = updateTutorial.bind(null, id)
  const transitionAction = transitionTutorialStatus.bind(null, id)
  const deleteAction = deleteTutorial.bind(null, id)

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <Link
          href="/admin/tutorials"
          className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          ← all tutorials
        </Link>
        <h1
          className="mt-4 text-4xl text-[var(--color-espresso)]"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
        >
          {tutorial.title || 'Untitled tutorial'}
        </h1>
        <div
          className="mt-2 text-sm text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          last edited {tutorial.updatedAt.toLocaleString('en-GB')} ·{' '}
          <Link
            href={`/admin/tutorials/${id}/versions`}
            className="text-[var(--color-sage)] hover:text-[var(--color-forest)]"
          >
            {tutorial._count.versions} version{tutorial._count.versions === 1 ? '' : 's'}
          </Link>
        </div>
      </div>

      <div className="mb-10">
        <StatusControls
          tutorialId={id}
          currentStatus={tutorial.status}
          publishedAt={tutorial.publishedAt}
          scheduledFor={tutorial.scheduledFor}
          transitionAction={transitionAction}
        />
      </div>

      <TutorialForm
        action={updateAction}
        submitLabel="save tutorial"
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
          timeMinutes:
            tutorial.timeMinutes !== null ? String(tutorial.timeMinutes) : '',
          heroMediaId: tutorial.heroMediaId,
          body: (tutorial.body as JSONContent | null) ?? EMPTY_DOC,
        }}
        {...formData}
      />

      <form
        action={deleteAction}
        className="mt-16 border-t border-[var(--color-linen-grey)] pt-8"
      >
        <p
          className="mb-4 text-sm text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          Deleting a tutorial is permanent. Every version snapshot disappears too.
          Sub-tutorial-card references in other tutorials are not auto-cleaned up
          and will become dead links.
        </p>
        <button
          type="submit"
          className="border border-[var(--color-burnt-sienna)] px-5 py-2 text-xs uppercase tracking-[0.25em] text-[var(--color-burnt-sienna)] hover:bg-[var(--color-burnt-sienna)] hover:text-[var(--color-linen-cream)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          delete tutorial
        </button>
      </form>
    </div>
  )
}
