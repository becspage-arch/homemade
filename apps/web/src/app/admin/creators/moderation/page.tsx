import Link from 'next/link'
import { prisma, TutorialStatus } from '@homemade/db'
import { CreatorTutorialModerationControls } from './moderation-controls'

export const dynamic = 'force-dynamic'

export default async function CreatorTutorialModerationPage() {
  const pending = await prisma.tutorial.findMany({
    where: {
      status: TutorialStatus.PENDING_MODERATION,
      creatorId: { not: null },
    },
    orderBy: { updatedAt: 'asc' },
    include: {
      creator: { select: { id: true, name: true, displayHandle: true, email: true } },
      category: { select: { name: true, slug: true } },
    },
  })

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Creator tutorials awaiting review</h1>
          <p>
            {pending.length} tutorial{pending.length === 1 ? '' : 's'} pending. Open
            the editor to read in detail, then approve or send back with a note.
          </p>
        </div>
        <Link href="/admin/creators" className="admin-btn secondary">
          ← Creators
        </Link>
      </div>

      {pending.length === 0 ? (
        <p className="admin-empty">Nothing waiting.</p>
      ) : (
        <ul className="admin-list">
          {pending.map((t) => (
            <li key={t.id} className="admin-list-row">
              <div style={{ minWidth: 280 }}>
                <Link
                  href={`/admin/tutorials/${t.id}`}
                  className="admin-list-title"
                >
                  {t.title}
                </Link>
                <div className="admin-list-meta">
                  {t.category.name} ·{' '}
                  {t.creator?.name ??
                    t.creator?.displayHandle ??
                    t.creator?.email ??
                    'unknown creator'}{' '}
                  · edited {t.updatedAt.toLocaleDateString('en-GB')}
                </div>
                {t.excerpt && (
                  <p
                    style={{
                      fontFamily: 'var(--font-lora)',
                      color: 'var(--color-warm-taupe)',
                      marginTop: 8,
                      maxWidth: 600,
                    }}
                  >
                    {t.excerpt}
                  </p>
                )}
              </div>
              <CreatorTutorialModerationControls tutorialId={t.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
