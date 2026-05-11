import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@homemade/db'

export const dynamic = 'force-dynamic'

export default async function TutorialVersionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const tutorial = await prisma.tutorial.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true },
  })
  if (!tutorial) notFound()

  const versions = await prisma.tutorialVersion.findMany({
    where: { tutorialId: id },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { email: true, name: true } },
    },
  })

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-12">
        <Link
          href={`/admin/tutorials/${id}`}
          className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          ← back to tutorial
        </Link>
        <h1
          className="mt-4 text-4xl text-[var(--color-espresso)]"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
        >
          Version history
        </h1>
        <p
          className="mt-2 text-sm text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          {tutorial.title}
        </p>
      </div>

      {versions.length === 0 ? (
        <p
          className="text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          No saved versions yet.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-linen-grey)]">
          {versions.map((v) => (
            <li key={v.id} className="py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link
                    href={`/admin/tutorials/${id}/versions/${v.id}`}
                    className="block text-xl text-[var(--color-espresso)] hover:text-[var(--color-sage)]"
                    style={{ fontFamily: 'var(--font-fraunces)' }}
                  >
                    {v.title || <em>untitled</em>}
                  </Link>
                  <div
                    className="mt-1 text-sm text-[var(--color-warm-taupe)]"
                    style={{ fontFamily: 'var(--font-lora)' }}
                  >
                    {v.createdAt.toLocaleString('en-GB')} ·{' '}
                    {v.author.name ?? v.author.email} · status was{' '}
                    <code className="text-xs">{v.status.toLowerCase()}</code>
                    {v.changeNote && (
                      <>
                        {' '}
                        ·{' '}
                        <span className="italic">
                          {v.changeNote}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Link
                  href={`/admin/tutorials/${id}/versions/${v.id}`}
                  className="text-xs uppercase tracking-[0.25em] text-[var(--color-sage)] hover:text-[var(--color-forest)]"
                  style={{ fontFamily: 'var(--font-lora)' }}
                >
                  view →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
