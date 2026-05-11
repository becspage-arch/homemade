import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma, TutorialStatus, type Prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

type StatusFilter = 'ALL' | TutorialStatus

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'all' },
  { value: TutorialStatus.DRAFT, label: 'draft' },
  { value: TutorialStatus.PENDING_MODERATION, label: 'in review' },
  { value: TutorialStatus.PUBLISHED, label: 'published' },
  { value: TutorialStatus.ARCHIVED, label: 'archived' },
]

function parseStatus(raw: string | undefined): StatusFilter {
  if (!raw) return 'ALL'
  const upper = raw.toUpperCase()
  if (upper === 'ALL') return 'ALL'
  if ((Object.values(TutorialStatus) as string[]).includes(upper)) {
    return upper as TutorialStatus
  }
  return 'ALL'
}

export default async function CreatorTutorialsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  if (!user.isCreator) redirect('/me/creator')

  const params = await searchParams
  const filter = parseStatus(params.status)

  const where: Prisma.TutorialWhereInput = { creatorId: user.id }
  if (filter !== 'ALL') where.status = filter

  const tutorials = await prisma.tutorial.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: { category: { select: { name: true, slug: true } } },
  })

  return (
    <>
      <section>
        <span className="me-section-label">Creator</span>
        <h2 className="me-section-title">Your tutorials</h2>
        <p className="me-section-description">
          New tutorials start as drafts. Submit for review when ready — the team
          checks before publishing. Published edits go live immediately.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/me/creator/tutorials/new" className="me-button">
            New tutorial
          </Link>
        </div>
      </section>

      <section>
        <div className="me-filters">
          {FILTERS.map((f) => {
            const active = filter === f.value
            const href =
              f.value === 'ALL'
                ? '/me/creator/tutorials'
                : `/me/creator/tutorials?status=${f.value}`
            return (
              <Link
                key={f.value}
                href={href}
                className={`me-filter ${active ? 'active' : ''}`}
              >
                {f.label}
              </Link>
            )
          })}
        </div>

        {tutorials.length === 0 ? (
          <p className="me-empty">No tutorials yet. Start a draft.</p>
        ) : (
          <ul style={{ fontFamily: 'var(--font-lora)', listStyle: 'none', padding: 0 }}>
            {tutorials.map((t) => (
              <li
                key={t.id}
                style={{
                  borderBottom: '0.5px solid var(--color-linen-grey)',
                  padding: '14px 0',
                }}
              >
                <Link
                  href={`/me/creator/tutorials/${t.id}`}
                  style={{
                    color: 'var(--color-espresso)',
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: 18,
                  }}
                >
                  {t.title}
                </Link>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--color-warm-taupe)',
                    marginTop: 4,
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span className="me-status-pill">
                    {t.status.toLowerCase().replace('_', ' ')}
                  </span>
                  <span>· {t.category.name}</span>
                  <span>· edited {t.updatedAt.toLocaleDateString('en-GB')}</span>
                  {t.status === TutorialStatus.PUBLISHED && (
                    <Link
                      href={`/${t.category.slug}/${t.slug}`}
                      style={{ color: 'var(--color-sage)' }}
                    >
                      view live →
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
