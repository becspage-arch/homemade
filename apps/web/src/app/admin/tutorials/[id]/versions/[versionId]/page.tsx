import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@homemade/db'
import type { JSONContent } from '@tiptap/core'
import { ReadOnlyRenderer } from '@/components/admin/editor/read-only-renderer'
import { mediaUrl } from '@/lib/media'
import { restoreTutorialVersion } from '../../../actions'

export const dynamic = 'force-dynamic'

const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] }

export default async function TutorialVersionDetailPage({
  params,
}: {
  params: Promise<{ id: string; versionId: string }>
}) {
  const { id, versionId } = await params

  const version = await prisma.tutorialVersion.findUnique({
    where: { id: versionId },
    include: { author: { select: { email: true, name: true } } },
  })

  if (!version || version.tutorialId !== id) notFound()

  // Refs the read-only renderer needs to display glossary tooltips and
  // sub-tutorial cards.
  const [glossaryRows, tutorialRows] = await Promise.all([
    prisma.glossaryTerm.findMany({
      orderBy: { term: 'asc' },
      select: { id: true, term: true, slug: true, definition: true },
    }),
    prisma.tutorial.findMany({
      orderBy: { title: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        category: { select: { name: true, slug: true } },
      },
    }),
  ])

  const glossary = glossaryRows
  const tutorials = tutorialRows.map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    excerpt: t.excerpt,
    categoryName: t.category.name,
    categorySlug: t.category.slug,
  }))

  // Touch the helper so unused-import lint doesn't bite later; the function is
  // there for when we render media-aware previews in Phase 3.
  void mediaUrl

  const restoreAction = restoreTutorialVersion.bind(null, versionId)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <Link
          href={`/admin/tutorials/${id}/versions`}
          className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          ← all versions
        </Link>
        <h1
          className="mt-4 text-3xl text-[var(--color-espresso)]"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
        >
          {version.title || 'Untitled'}
        </h1>
        <div
          className="mt-2 text-sm text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          saved {version.createdAt.toLocaleString('en-GB')} ·{' '}
          {version.author.name ?? version.author.email} · status was{' '}
          <code className="text-xs">{version.status.toLowerCase()}</code>
          {version.changeNote && (
            <>
              {' '}
              · <span className="italic">{version.changeNote}</span>
            </>
          )}
        </div>
      </div>

      {version.subtitle && (
        <p
          className="mb-4 text-lg italic text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          {version.subtitle}
        </p>
      )}
      {version.excerpt && (
        <p
          className="mb-6 text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          {version.excerpt}
        </p>
      )}

      <ReadOnlyRenderer
        content={(version.body as JSONContent | null) ?? EMPTY_DOC}
        glossary={glossary}
        tutorials={tutorials}
      />

      <form
        action={restoreAction}
        className="mt-10 border-t border-[var(--color-linen-grey)] pt-6"
      >
        <p
          className="mb-3 text-sm text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          Restoring this version copies its content and metadata back over the
          live tutorial. The current state is snapshotted first, so you can
          undo by restoring the snapshot it creates.
        </p>
        <button
          type="submit"
          className="bg-[var(--color-sage)] px-5 py-2 text-xs uppercase tracking-[0.25em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          restore this version
        </button>
      </form>
    </div>
  )
}
